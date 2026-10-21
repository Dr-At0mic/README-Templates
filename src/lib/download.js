// Saves generated text (README.md, SVG art) to disk. The browser gets a normal download; the
// desktop app shows the native Save dialog instead, because the Linux webview ignores
// <a download> and a save location is the expected desktop behaviour anyway.

import { isTauri } from '@tauri-apps/api/core';

export async function download(filename, content, type) {
  if (isTauri()) {
    // Loaded on demand so the web build never pulls in the desktop plugins.
    const [{ save }, { writeTextFile }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs'),
    ]);
    const ext = filename.split('.').pop();
    const path = await save({ defaultPath: filename, filters: [{ name: `${ext.toUpperCase()} file`, extensions: [ext] }] });
    if (path) await writeTextFile(path, content);
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
