// Small per-device UI preferences (sidebar state, active account). Tokens live in ./vault.js.
// Every access is guarded because storage can throw (private mode, blocked site data).

export function loadPref(name, fallback) {
  try {
    return localStorage.getItem(`readme-templates.${name}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function savePref(name, value) {
  try {
    if (value === null) localStorage.removeItem(`readme-templates.${name}`);
    else localStorage.setItem(`readme-templates.${name}`, value);
  } catch {
    /* preference just won't persist */
  }
}
