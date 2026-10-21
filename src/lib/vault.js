// Encrypted multi-account token vault.
//
// Encryption: AES-256-GCM. The key is derived with HKDF-SHA-256 from
//   1. a random 256-bit device key, created once per browser and stored in IndexedDB as a
//      NON-EXTRACTABLE CryptoKey — page code can use it but can never read its bytes, and
//   2. VITE_VAULT_SECRET from .env, used as HKDF info. Vite inlines it into the bundle, so it is
//      a rotation lever (change it → every saved token becomes unreadable), not a confidential secret.
// Each ciphertext is bound to its login via AES-GCM additional data, so records can't be swapped.
//
// Limits, stated honestly: this protects tokens at rest (copied localStorage, synced profiles,
// casual inspection). Nothing client-side can protect against script running on this origin (XSS).
//
// Accounts with "remember" live in localStorage; the rest in sessionStorage (gone when the tab closes).
// Decrypted tokens are only ever held in memory by the caller.

const SECRET = import.meta.env.VITE_VAULT_SECRET || '';
const DB_NAME = 'readme-templates';
const STORE = 'keys';
const DEVICE_KEY_ID = 'device-key-v1';
const RECORDS_KEY = 'readme-templates.accounts';
const LEGACY_PLAINTEXT_KEY = 'readme-templates.token';
const enc = new TextEncoder();

export const vaultAvailable =
  Boolean(SECRET) && typeof indexedDB !== 'undefined' && Boolean(globalThis.crypto?.subtle);

export class VaultError extends Error {}

// ---------- IndexedDB (device key) ----------

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb(mode, fn) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

let keyPromise = null;

async function getDeviceBaseKey() {
  let base = await idb('readonly', (s) => s.get(DEVICE_KEY_ID));
  if (!base) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    base = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey']);
    raw.fill(0);
    await idb('readwrite', (s) => s.put(base, DEVICE_KEY_ID));
  }
  return base;
}

function getKey() {
  if (!vaultAvailable) return Promise.reject(new VaultError('Encrypted storage is unavailable (missing VITE_VAULT_SECRET or WebCrypto).'));
  keyPromise ??= getDeviceBaseKey()
    .then((base) =>
      crypto.subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: enc.encode('readme-templates/vault/v1'), info: enc.encode(SECRET) },
        base,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
    )
    .catch((err) => {
      keyPromise = null;
      throw err;
    });
  return keyPromise;
}

const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
const aad = (login) => enc.encode(`github-token:${login.toLowerCase()}`);

async function encrypt(login, token) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(login) }, key, enc.encode(token));
  return { iv: b64(iv), data: b64(data) };
}

async function decrypt(login, record) {
  const key = await getKey();
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(record.iv), additionalData: aad(login) },
      key,
      unb64(record.data)
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new VaultError(`Saved key for @${login} can't be decrypted (secret rotated or device key cleared).`);
  }
}

// ---------- Records ----------

function read(storage) {
  try {
    const list = JSON.parse(storage.getItem(RECORDS_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(storage, list) {
  try {
    if (list.length) storage.setItem(RECORDS_KEY, JSON.stringify(list));
    else storage.removeItem(RECORDS_KEY);
  } catch {
    throw new VaultError('Browser storage is blocked, so the key could not be saved.');
  }
}

const same = (a, b) => a.toLowerCase() === b.toLowerCase();

/** Account metadata only — never tokens. */
export function listAccounts() {
  const saved = read(localStorage).map((r) => ({ ...r, remember: true }));
  const session = read(sessionStorage).filter((r) => !saved.some((s) => same(s.login, r.login)));
  return [...saved, ...session.map((r) => ({ ...r, remember: false }))].map(({ login, name, avatarUrl, remember, savedAt }) => ({
    login,
    name,
    avatarUrl,
    remember,
    savedAt,
  }));
}

/** Add or replace an account. One record per login, in exactly one storage area. */
export async function saveAccount({ login, name, avatarUrl }, token, remember) {
  const sealed = await encrypt(login, token);
  const record = { login, name, avatarUrl, savedAt: new Date().toISOString(), ...sealed };
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  write(other, read(other).filter((r) => !same(r.login, login)));
  write(target, [...read(target).filter((r) => !same(r.login, login)), record]);
}

export async function getToken(login) {
  const record = [...read(localStorage), ...read(sessionStorage)].find((r) => same(r.login, login));
  if (!record) throw new VaultError(`No saved key for @${login}.`);
  return decrypt(login, record);
}

/** Move an account between "this session" and "saved on this device" without re-entering the token. */
export function setRemember(login, remember) {
  const from = remember ? sessionStorage : localStorage;
  const to = remember ? localStorage : sessionStorage;
  const record = read(from).find((r) => same(r.login, login));
  if (!record) return;
  write(from, read(from).filter((r) => !same(r.login, login)));
  write(to, [...read(to).filter((r) => !same(r.login, login)), record]);
}

export function removeAccount(login) {
  write(localStorage, read(localStorage).filter((r) => !same(r.login, login)));
  write(sessionStorage, read(sessionStorage).filter((r) => !same(r.login, login)));
}

/** Forget everything: all records, plus the device key itself, so old ciphertext is unrecoverable. */
export async function clearVault() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(RECORDS_KEY);
      storage.removeItem(LEGACY_PLAINTEXT_KEY);
    } catch {
      /* already inaccessible */
    }
  }
  keyPromise = null;
  if (typeof indexedDB !== 'undefined') {
    await idb('readwrite', (s) => s.delete(DEVICE_KEY_ID)).catch(() => {});
  }
}

/** Earlier builds kept one plaintext token; never leave that lying around. */
export function purgeLegacyPlaintext() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(LEGACY_PLAINTEXT_KEY);
    } catch {
      /* ignore */
    }
  }
}
