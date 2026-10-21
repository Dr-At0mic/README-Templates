// Desktop window frame. The Tauri window has no native title bar (`decorations: false` in
// src-tauri/tauri.conf.json), so the top bar drags the window and draws its own window buttons.
// The web build never loads the window API.

import { isTauri } from '@tauri-apps/api/core';

export const hasCustomFrame = () => isTauri();

// Windows gets Fluent-style caption buttons, Linux gets GNOME-style round ones.
export const framePlatform = () => (/Windows/.test(navigator.userAgent) ? 'windows' : 'linux');

const appWindow = async () => (await import('@tauri-apps/api/window')).getCurrentWindow();

export const minimizeWindow = async () => (await appWindow()).minimize();
export const toggleMaximizeWindow = async () => (await appWindow()).toggleMaximize();
export const closeWindow = async () => (await appWindow()).close();
export const startWindowDrag = async () => (await appWindow()).startDragging();

// Calls onChange(isMaximized) now and after every resize. Resolves to an unsubscribe function.
export async function watchMaximized(onChange) {
  const win = await appWindow();
  onChange(await win.isMaximized());
  return win.onResized(async () => onChange(await win.isMaximized()));
}
