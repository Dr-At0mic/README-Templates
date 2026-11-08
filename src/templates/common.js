// Shared helpers for the professional templates (Annual Report, Ticker, Intaglio, Departures, Swiss).
// Numbers here come only from the profile: contributions, repos, languages, followers and the year the
// account was made. Nothing is invented, so every figure the artwork shows can be checked on GitHub.

import { escapeXml, monthlySeries } from './pulsar/art';

export { escapeXml };

export const SANS = "'Helvetica Neue', Helvetica, Arial, 'Segoe UI', ui-sans-serif, -apple-system, sans-serif";
export const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif";
export const ROMAN = "Baskerville, 'Baskerville Old Face', 'Hoefler Text', Garamond, 'Times New Roman', Times, serif";
export const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
export const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const QUART = 'cubic-bezier(0.25, 1, 0.5, 1)';
export const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';

export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;
export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function compact(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-03-14" → "14 March 2026" (long), "Mar 14" (short) or "14 MAR" (caps). UTC, so the day never shifts. */
export function formatDate(iso, style = 'long') {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (style === 'short') return `${MONTH_SHORT[m - 1]} ${d}`;
  if (style === 'caps') return `${d} ${MONTH_SHORT[m - 1].toUpperCase()}`;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

// Width estimate for system fonts, in em per character. Good enough to size and place text; anything that
// must never overflow also gets textLength (see fitAttrs).
const EM = { sans: 0.54, sansBold: 0.6, serif: 0.56, serifCaps: 0.74, roman: 0.54, romanCaps: 0.78, mono: 0.6 };
export function textWidth(text, size, kind = 'sans') {
  let w = 0;
  for (const ch of String(text)) {
    if (ch === ' ') w += 0.28;
    else if (/[.,:;'’!|il1]/.test(ch)) w += EM[kind] * 0.55;
    else if (/[MWmw@]/.test(ch)) w += EM[kind] * 1.45;
    else if (/[A-Z0-9&]/.test(ch) && !kind.endsWith('Caps')) w += EM[kind] * 1.22;
    else if (ch.charCodeAt(0) > 0x2e80) w += 1; // CJK and other wide scripts
    else w += EM[kind];
  }
  return w * size;
}

/** Largest size in [min, max] at which text fits maxWidth. */
export function fitSize(text, maxWidth, max, min, kind) {
  const at1 = textWidth(text, 1, kind) || 1;
  return clamp(Math.floor(maxWidth / at1), min, max);
}

/** textLength attributes that squeeze text into maxWidth only when the estimate says it would overflow. */
export function fitAttrs(text, size, maxWidth, kind) {
  return textWidth(text, size, kind) > maxWidth ? ` textLength="${Math.round(maxWidth)}" lengthAdjust="spacingAndGlyphs"` : '';
}

export function wrap(text, maxChars, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,;:]*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

/** Splits a name into at most `max` lines, breaking between words and balancing the line lengths. */
export function splitName(name, maxChars, max = 2) {
  const words = String(name).split(/\s+/).filter(Boolean);
  if (words.length < 2 || name.length <= maxChars || max < 2) return [name];
  let best = [name];
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const score = Math.max(a.length, b.length);
    if (score < bestScore) (bestScore = score), (best = [a, b]);
  }
  return best;
}

export function initials(name) {
  const parts = String(name || '').split(/[\s_-]+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0] || '?'];
  return letters.map((w) => [...w][0].toUpperCase()).join('');
}

/** The first sentence of a headline when it's short enough to work as a role ("Systems engineer"). */
export function roleFromHeadline(headline, maxChars = 28) {
  const first = String(headline || '').split(/(?<=[.!?])\s|[.!?]$/)[0].trim().replace(/[.!?]+$/, '');
  return first && first.length <= maxChars ? first : '';
}

/** Up to three items from a semicolon-separated field. */
export function splitList(value, max = 3) {
  return String(value || '')
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function roleLine(title, organisation, sep = ', ') {
  return [title, organisation].map((s) => String(s || '').trim()).filter(Boolean).join(sep);
}

/** Everything the professional templates measure, from the last 365 days of contributions. */
export function proNumbers(p) {
  const days = (p.contributions?.days || []).slice(-365);
  const total = p.contributions?.total ?? days.reduce((s, d) => s + d.count, 0);
  let streak = 0;
  let run = 0;
  let best = null;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
    if (d.count > 0 && (!best || d.count > best.count)) best = d;
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0 && days[i].count > 0; i--) current++;
  const active = days.filter((d) => d.count > 0).length;

  // Weeks start on Sunday, like GitHub's calendar; the first may be partial.
  const weeks = [];
  for (const d of days) {
    const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (!weeks.length || dow === 0) weeks.push({ start: d.date, days: [] });
    weeks[weeks.length - 1].days.push(d);
  }
  for (const w of weeks) w.total = w.days.reduce((s, d) => s + d.count, 0);

  const weekday = [0, 0, 0, 0, 0, 0, 0];
  const weekdayN = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) {
    const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    weekday[dow] += d.count;
    weekdayN[dow] += 1;
  }

  const keys = [...new Set(days.map((d) => d.date.slice(0, 7)))].slice(-12);
  const months = monthlySeries(days).map((m, i, all) => ({
    ...m,
    key: keys[i] || '',
    active: m.counts.filter((v) => v > 0).length,
    index: i,
    of: all.length,
  }));
  const half = Math.floor(days.length / 2);
  const h1 = days.slice(0, half).reduce((s, d) => s + d.count, 0);
  const h2 = days.slice(half).reduce((s, d) => s + d.count, 0);
  const year = new Date().getFullYear();

  return {
    days,
    total,
    active,
    streak,
    current,
    best,
    weeks,
    months,
    weekdayAvg: weekday.map((s, i) => (weekdayN[i] ? s / weekdayN[i] : 0)),
    h1,
    h2,
    change: h1 > 0 ? (h2 - h1) / h1 : null,
    perActive: active ? total / active : 0,
    since: p.joinedYear || year,
    years: Math.max(1, year - (p.joinedYear || year)),
    stars: p.totalStars ?? (p.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
    followers: p.followers || 0,
    languages: (p.languages || []).slice(0, 5),
    from: days[0]?.date || '',
    to: days[days.length - 1]?.date || '',
  };
}

export const featuredRepos = (p) => (p.featured || []).map((n) => (p.repos || []).find((r) => r.name === n)).filter(Boolean);

// ---------------------------------------------------------------------------
// README pieces
// ---------------------------------------------------------------------------

export const html = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function picture(dark, light, alt, align = 'center') {
  return [
    align === 'center' ? '<p align="center">' : '<p>',
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="./${dark}">`,
    `  <img alt="${html(alt)}" src="./${light}" width="100%">`,
    '</picture>',
    '</p>',
  ].join('\n');
}

export const starText = (n) => (n ? `★ ${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n}` : '');

/** Featured repositories as a Markdown list: real links, description and a small meta line. */
export function repoList(repos, prefix = () => '', sep = ' · ') {
  const out = [];
  repos.forEach((repo, i) => {
    out.push(`- ${prefix(i, repo)}**[${repo.name}](${repo.url})**${repo.description ? `${sep}${repo.description}` : ''}  `);
    const meta = [repo.language, starText(repo.stars)].filter(Boolean).join(' · ');
    if (meta) out.push(`  <sub>${meta}</sub>`);
  });
  return out;
}

export const languageText = (langs) => langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ');
