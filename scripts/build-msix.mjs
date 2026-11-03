// Builds the Microsoft Store package: src-tauri/target/msix/README.Templates_<version>_x64_store-upload.msix
//
// Tauri only produces EXE and MSI installers, so this compiles the app without one and packs it with the
// Windows SDK's makeappx. The result is unsigned on purpose: the Store signs it after certification.
//
// Usage: npm run desktop:build:store

import { execFileSync, execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TAURI = join(ROOT, 'src-tauri');
const OUT = join(TAURI, 'target', 'msix');
const STAGE = join(OUT, 'stage');
const EXE = 'readme-templates.exe';
const ASSETS = ['StoreLogo', 'Square44x44Logo', 'Square71x71Logo', 'Square150x150Logo'];

function fail(message) {
  console.error(`\nMSIX build stopped: ${message}`);
  process.exit(1);
}

// MSIX versions are Major.Minor.Build.Revision. The Store reserves Revision, which must be 0, and the first
// part can't be 0. Everything else must fit 0-65535, so a semver with a prerelease tag can't be used.
export function msixVersion(semver) {
  const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(semver)?.slice(1).map(Number);
  if (!parts) throw new Error(`"${semver}" isn't plain Major.Minor.Build, which MSIX requires.`);
  if (parts[0] === 0) throw new Error(`"${semver}" starts with 0, which the Store doesn't allow.`);
  if (parts.some((n) => n > 65535)) throw new Error(`"${semver}" has a part above 65535.`);
  return `${parts.join('.')}.0`;
}

// Saved GitHub keys can't be encrypted without this, and Vite would silently build without it.
function hasVaultSecret() {
  if (process.env.VITE_VAULT_SECRET) return true;
  const env = join(ROOT, '.env');
  return existsSync(env) && /^VITE_VAULT_SECRET=\S/m.test(readFileSync(env, 'utf8'));
}

function findMakeAppx() {
  const bin = join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Windows Kits', '10', 'bin');
  const versions = existsSync(bin) ? readdirSync(bin).filter((name) => /^10\./.test(name)) : [];
  versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  for (const version of versions) {
    const tool = join(bin, version, 'x64', 'makeappx.exe');
    if (existsSync(tool)) return tool;
  }
  return null;
}

function main() {
  if (process.platform !== 'win32') fail('MSIX packages can only be built on Windows.');
  const makeappx = findMakeAppx();
  if (!makeappx) fail('makeappx.exe not found. Install the Windows SDK.');
  if (!hasVaultSecret()) fail('VITE_VAULT_SECRET is not set (in .env or the environment).');

  let version;
  try {
    version = msixVersion(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version);
  } catch (err) {
    fail(err.message);
  }

  console.log(`Building the app for MSIX version ${version}`);
  execSync('npx tauri build --config src-tauri/tauri.store.conf.json', { cwd: ROOT, stdio: 'inherit' });

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(STAGE, 'Assets'), { recursive: true });
  copyFileSync(join(TAURI, 'target', 'release', EXE), join(STAGE, EXE));
  for (const asset of ASSETS) copyFileSync(join(TAURI, 'icons', `${asset}.png`), join(STAGE, 'Assets', `${asset}.png`));
  const manifest = readFileSync(join(TAURI, 'msix', 'AppxManifest.xml'), 'utf8').replaceAll('{{VERSION}}', version);
  writeFileSync(join(STAGE, 'AppxManifest.xml'), manifest);

  const msix = join(OUT, `README.Templates_${version}_x64_store-upload.msix`);
  execFileSync(makeappx, ['pack', '/d', STAGE, '/p', msix, '/o'], { cwd: ROOT, stdio: 'inherit' });

  // Read the manifest back out of the finished package, so what was uploaded is what was checked.
  const check = join(OUT, 'unpacked');
  execFileSync(makeappx, ['unpack', '/p', msix, '/d', check, '/o'], { cwd: ROOT, stdio: 'ignore' });
  const packed = readFileSync(join(check, 'AppxManifest.xml'), 'utf8');
  rmSync(check, { recursive: true, force: true });
  if (!packed.includes(`Version="${version}"`) || packed.includes('{{')) fail('the packed manifest has the wrong version.');

  console.log(`\nStore package ready: ${msix}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
