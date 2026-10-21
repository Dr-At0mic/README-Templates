// Desktop app updates: signed builds published as GitHub releases (see .github/workflows/release.yml).
// The manifest URL and the public key that verifies every download live in src-tauri/tauri.conf.json.

import { isTauri } from '@tauri-apps/api/core';

export const RELEASES_URL = 'https://github.com/Dr-At0mic/README-Templates/releases';

export const canUpdate = () => isTauri();

// Resolves to the pending update ({ version, currentVersion, date, body, downloadAndInstall }) or null.
// Loaded on demand so the web build never pulls in the desktop plugins.
export async function checkForUpdate() {
  const { check } = await import('@tauri-apps/plugin-updater');
  return check();
}

// Downloads, verifies the signature and installs. onProgress(fraction) gets 0–1, or null while the
// size is unknown. On Windows the installer closes the app itself; elsewhere we restart into it.
export async function installUpdate(update, onProgress) {
  let total = 0;
  let received = 0;
  await update.downloadAndInstall((event) => {
    if (event.event === 'Started') {
      total = event.data.contentLength ?? 0;
      onProgress(total ? 0 : null);
    } else if (event.event === 'Progress') {
      received += event.data.chunkLength;
      onProgress(total ? Math.min(received / total, 1) : null);
    } else if (event.event === 'Finished') {
      onProgress(1);
    }
  });
  const { relaunch } = await import('@tauri-apps/plugin-process');
  await relaunch();
}
