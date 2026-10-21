// Turns template output into preview HTML. Relative asset paths are swapped for data URIs,
// and <picture> elements are resolved against the preview's theme toggle rather than the OS
// setting, so both GitHub themes can be checked without changing system preferences.

import { marked } from 'marked';
import DOMPurify from 'dompurify';

const toDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// A changed comment makes a new image URL, which restarts the SVG's CSS animations (used by Replay).
const withNonce = (assets, nonce) =>
  nonce ? Object.fromEntries(Object.entries(assets).map(([k, v]) => [k, `${v}<!-- replay ${nonce} -->`])) : assets;

function resolvePictures(markdown, assets, theme) {
  return markdown.replace(/<picture>([\s\S]*?)<\/picture>/g, (_, inner) => {
    const dark = inner.match(/media="\(prefers-color-scheme: dark\)"\s+srcset="\.\/([^"]+)"/)?.[1];
    const light = inner.match(/<img[^>]*src="\.\/([^"]+)"/)?.[1];
    const alt = inner.match(/alt="([^"]*)"/)?.[1] ?? '';
    const path = theme === 'dark' && dark ? dark : light;
    const src = assets[path] ? toDataUri(assets[path]) : '';
    return `<img alt="${alt}" src="${src}" width="100%">`;
  });
}

function resolveRelative(markdown, assets) {
  return markdown.replace(/\.\/(assets\/[^\s")]+)/g, (match, path) => (assets[path] ? toDataUri(assets[path]) : match));
}

export function renderPreview({ markdown, assets: rawAssets }, theme, nonce = 0) {
  const assets = withNonce(rawAssets, nonce);
  const resolved = resolveRelative(resolvePictures(markdown, assets, theme), assets);
  const html = marked.parse(resolved, { gfm: true });
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
