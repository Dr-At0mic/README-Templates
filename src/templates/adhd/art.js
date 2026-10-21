// ADHD — cinematic animated SVG artwork about attention.
//
// Hero: a cinema camera's monitor feed. Autofocus hunts through a storm of interruptions —
// notifications, tabs, a sticky note, a to-do list, a terminal — then locks onto your name: the
// RGB split converges, an anamorphic flare fires, and the periphery recedes and dims, the way
// hyperfocus quiets everything that isn't the one thing. The background bokeh is your year: one
// out-of-focus light per month, bigger and brighter for busier months.
// Signal: a browser window with far too many tabs open (your projects among the rabbit holes).
// Inside, your last 365 days drawn as a seismograph with the most intense bursts marked as
// hyperfocus episodes, a "now / not now" clock, odometer counters, and languages as dopamine
// sources. A reminder slides in over it all.
// End card: a film slate snapping shut, and a thank-you for the attention.
//
// Same rules as the other animated templates: CSS keyframes only, the un-animated state is the
// final frame, at most two infinite loops per image, no blur filters, system fonts, and
// prefers-reduced-motion stops everything. Nothing flashes more than once.

import { seededRandom } from '../../lib/random';
import { escapeXml, monthlySeries } from '../pulsar/art';

const COND = "'DIN Condensed', Bahnschrift, 'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue', Impact, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const UI = "-apple-system, BlinkMacSystemFont, 'Segoe UI', ui-sans-serif, Helvetica, Arial, sans-serif";
const HAND = "'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Sans MS', 'Marker Felt', cursive";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const SNAP = 'cubic-bezier(0.2, 0.85, 0.25, 1)';
const GRAVITY = 'cubic-bezier(0.55, 0, 1, 0.45)';
const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';
const TAU = Math.PI * 2;

// The moment autofocus locks in the hero. Everything else is timed around it.
const LOCK = 2.5;

export const THEMES = {
  dark: {
    bg: '#07080b',
    lift: '#161922',
    fg: '#f4f2ed',
    muted: '#8f95a3',
    line: '#ece9e2',
    vignette: '#000000',
    vignetteOp: 0.8,
    tunnelOp: 0.5,
    bar: '#000000',
    barOp: 0.88,
    barText: '#e6e3dc',
    barMuted: '#7a808e',
    barRule: '#2a2d34',
    accent: '#ff8a1f',
    rec: '#ff3b30',
    fringeA: '#ff2d55',
    fringeB: '#00d0ff',
    blend: 'screen',
    card: '#15171d',
    cardOp: 0.94,
    cardEdge: '#2c3039',
    cardHi: '#ffffff',
    cardHiOp: 0.06,
    cardText: '#ecebe6',
    cardMuted: '#8f95a3',
    shadow: '#000000',
    shadowOp: 0.5,
    chip: '#1c1f26',
    bubble: '#2a2d35',
    grain: '#ffffff',
    grainOp: 0.07,
    bokeh: ['#ff8a1f', '#ff3d7f', '#3dc8ff', '#a98bff', '#ffd166'],
    bokehOp: 0.3,
    dim: 0.46,
    leak: '#ff7a2f',
    leakOp: 0.16,
    flare: '#4fc8ff',
    flareCore: '#e8fbff',
    flareOp: 0.42,
    word: '#ffffff',
    wordOp: 0.05,
    // Signal panel
    strip: '#1d1f24',
    toolbar: '#2f3137',
    omni: '#1d1f24',
    omniText: '#e8eaed',
    tabText: '#9aa0a6',
    tabRule: '#3c3f45',
    view: '#0a0b0f',
    panel: '#12141a',
    panelEdge: '#23272f',
    plot: '#0e0b07',
    gridMinor: '#1f180f',
    gridMajor: '#33271a',
    trace: '#ffb054',
    face: '#0f1115',
    faceText: '#5e6573',
    bezelA: '#4a4f59',
    bezelB: '#14161a',
    track: '#262a32',
    // End card
    slate: '#121212',
  },
  light: {
    bg: '#eeebe5',
    lift: '#fbfaf7',
    fg: '#121317',
    muted: '#5b616e',
    line: '#121317',
    vignette: '#a69d8e',
    vignetteOp: 0.55,
    tunnelOp: 0.42,
    bar: '#0d0e11',
    barOp: 0.92,
    barText: '#e6e3dc',
    barMuted: '#868b97',
    barRule: '#2a2d34',
    accent: '#d95f00',
    rec: '#e5281d',
    fringeA: '#ff2d55',
    fringeB: '#00a6e0',
    blend: 'multiply',
    card: '#ffffff',
    cardOp: 0.97,
    cardEdge: '#d9d4cb',
    cardHi: '#ffffff',
    cardHiOp: 0,
    cardText: '#17181c',
    cardMuted: '#666c78',
    shadow: '#4a3f30',
    shadowOp: 0.16,
    chip: '#ffffff',
    bubble: '#e6e6ea',
    grain: '#000000',
    grainOp: 0.06,
    bokeh: ['#ffb26b', '#ff8fb3', '#7fd3f5', '#c3b0ff', '#ffd76a'],
    bokehOp: 0.34,
    dim: 0.52,
    leak: '#ff8a4a',
    leakOp: 0.2,
    flare: '#ff9a3c',
    flareCore: '#ffd9b0',
    flareOp: 0.3,
    word: '#000000',
    wordOp: 0.045,
    strip: '#dfe1e5',
    toolbar: '#ffffff',
    omni: '#f1f3f4',
    omniText: '#202124',
    tabText: '#5f6368',
    tabRule: '#b9bdc3',
    view: '#f6f4ef',
    panel: '#ffffff',
    panelEdge: '#e2ddd3',
    plot: '#fffaf7',
    gridMinor: '#f7dfdc',
    gridMajor: '#eebcb6',
    trace: '#1b1c20',
    face: '#ffffff',
    faceText: '#9aa0aa',
    bezelA: '#e9ebef',
    bezelB: '#a4a9b2',
    track: '#ebe7df',
    slate: '#141414',
  },
};

// Colours for "physical" things that keep their colour on either background.
const P = {
  sticky: '#ffe066',
  stickyTop: '#fff3a8',
  stickyInk: '#3a2d00',
  term: '#0d1016',
  termText: '#d7dde8',
  prompt: '#4ade80',
  blue: '#2f7cf6',
  red: '#ff453a',
  green: '#30d158',
  yellow: '#ffd60a',
  purple: '#a78bfa',
  pink: '#ff375f',
  teal: '#40c8e0',
  orange: '#ff9f0a',
  white: '#ffffff',
  chalk: '#f4f1ea',
};

// Language colours, so a language looks the same here as on its repository page.
const LANG_COLORS = {
  Rust: '#dea584', TypeScript: '#3178c6', JavaScript: '#f1e05a', Go: '#00add8', C: '#8a8f98',
  Python: '#3572a5', Shell: '#89e051', MDX: '#fcb32c', Java: '#b07219', 'C++': '#f34b7d',
  'C#': '#178600', Ruby: '#cc342d', PHP: '#4f5d95', Swift: '#f05138', Kotlin: '#a97bff',
  HTML: '#e34c26', CSS: '#663399', SCSS: '#c6538c', Dart: '#00b4ab', Vue: '#41b883',
  Svelte: '#ff3e00', Lua: '#4b6bd6', Haskell: '#5e5086', Elixir: '#6e4a7e', Zig: '#ec915c',
  Scala: '#c22d40', 'Jupyter Notebook': '#da5b0b', Nix: '#7e7eff', Clojure: '#db5855',
  'Objective-C': '#438eff', R: '#198ce7', Julia: '#a270ba', OCaml: '#ef7a08', Perl: '#0298c3',
  Dockerfile: '#384d54', HCL: '#844fba', Astro: '#ff5a03', Solidity: '#aa6746', Elm: '#60b5cc',
};

const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const trunc = (s, n) => {
  const str = String(s ?? '');
  return str.length > n ? `${str.slice(0, Math.max(1, n - 1)).trimEnd()}…` : str;
};

export function langColor(name) {
  if (LANG_COLORS[name]) return LANG_COLORS[name];
  const rand = seededRandom(`lang:${name}`);
  return `hsl(${Math.round(rand() * 360)} 62% 58%)`;
}

function wrap(text, maxChars, maxLines) {
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
  const out = lines.map((l) => trunc(l, maxChars));
  if (out.length > maxLines) {
    const kept = out.slice(0, maxLines);
    kept[maxLines - 1] = trunc(kept[maxLines - 1], maxChars - 1).replace(/…?$/, '…');
    return kept;
  }
  return out;
}

// One line if it fits, otherwise two lines split at the space nearest the middle, so no word is
// left stranded on a line of its own.
function balance(text, maxChars) {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length <= maxChars) return t ? [t] : [];
  let cut = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === ' ' && (cut < 0 || Math.abs(i - t.length / 2) < Math.abs(cut - t.length / 2))) cut = i;
  }
  return cut < 0 ? [trunc(t, maxChars)] : [trunc(t.slice(0, cut), maxChars), trunc(t.slice(cut + 1), maxChars)];
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Everything the artwork reads from the profile. Hyperfocus episodes are the most intense runs of
 * back-to-back busy days: days at or above the active-day mean plus half a standard deviation,
 * with a single quiet day allowed inside a run, ranked by total contributions.
 */
export function adhdNumbers(profile) {
  const days = (profile.contributions?.days || []).slice(-365);
  let streak = 0;
  let run = 0;
  const weekdays = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
    weekdays[new Date(`${d.date}T00:00:00Z`).getUTCDay()] += d.count;
  }
  const active = days.filter((d) => d.count > 0);
  const mean = active.reduce((s, d) => s + d.count, 0) / Math.max(1, active.length);
  const sd = Math.sqrt(active.reduce((s, d) => s + (d.count - mean) ** 2, 0) / Math.max(1, active.length));
  const threshold = Math.max(2, mean + sd * 0.5);

  const runs = [];
  let cur = null;
  days.forEach((d, i) => {
    if (d.count >= threshold) {
      if (cur && i - cur.end <= 2) {
        cur.end = i;
      } else {
        cur = { start: i, end: i };
        runs.push(cur);
      }
    }
  });
  const episodes = runs
    .map((r) => ({ ...r, length: r.end - r.start + 1, sum: days.slice(r.start, r.end + 1).reduce((s, d) => s + d.count, 0) }))
    .filter((r) => r.length >= 2)
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 3)
    .map((r, rank) => ({ ...r, rank: rank + 1 }));

  const peakDay = weekdays.some((v) => v > 0) ? weekdays.indexOf(Math.max(...weekdays)) : -1;
  const thisYear = new Date().getFullYear();
  return {
    days,
    total: profile.contributions?.total ?? days.reduce((s, d) => s + d.count, 0),
    active: active.length,
    streak,
    episodes,
    weekdays,
    peakDay,
    peakDayName: peakDay >= 0 ? WEEKDAYS[peakDay] : '',
    years: Math.max(1, thisYear - (profile.joinedYear || thisYear)),
    stars: profile.totalStars ?? (profile.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
    followers: profile.followers || 0,
  };
}

export function defaultThought(profile) {
  const langs = (profile.languages || []).map((l) => l.name);
  const target = ['Rust', 'Zig', 'Go', 'Elixir', 'Haskell'].find((l) => !langs.slice(0, 1).includes(l)) || 'Rust';
  return `what if I rewrote it in ${target}?`;
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

// Film grain as a static tile of single pixels: no turbulence filter to recompute every frame.
function grainPattern(c, key) {
  const rand = seededRandom(`grain:${key}`);
  let a = '';
  let b = '';
  for (let i = 0; i < 420; i++) {
    const cell = `M${Math.floor(rand() * 160)} ${Math.floor(rand() * 160)}h1v1h-1z`;
    if (i % 3) a += cell;
    else b += cell;
  }
  return `<pattern id="grain" width="160" height="160" patternUnits="userSpaceOnUse"><path d="${a}" fill="${c.grain}" opacity="0.7"/><path d="${b}" fill="${c.grain}"/></pattern>`;
}

function card(c, w, h, r = 12) {
  return `<rect x="1" y="7" width="${w - 2}" height="${h}" rx="${r}" fill="${c.shadow}" opacity="${r1(c.shadowOp * 0.35 * 100) / 100}"/>
<rect x="0" y="3" width="${w}" height="${h}" rx="${r}" fill="${c.shadow}" opacity="${r1(c.shadowOp * 0.5 * 100) / 100}"/>
<rect width="${w}" height="${h}" rx="${r}" fill="${c.card}" fill-opacity="${c.cardOp}" stroke="${c.cardEdge}"/>
<path d="M${r} 0.5H${w - r}" stroke="${c.cardHi}" stroke-opacity="${c.cardHiOp}"/>`;
}

function pill(c, w, h) {
  return `<rect x="0" y="3" width="${w}" height="${h}" rx="${h / 2}" fill="${c.shadow}" opacity="${r1(c.shadowOp * 0.5 * 100) / 100}"/>
<rect width="${w}" height="${h}" rx="${h / 2}" fill="${c.chip}" fill-opacity="${c.cardOp}" stroke="${c.cardEdge}"/>`;
}

// Simple original glyphs on a rounded-square app icon.
function appIcon(x, y, s, color, glyph) {
  const k = s / 24;
  const g = {
    mail: `<path d="M5 8h14v9H5z M5 8l7 5.5L19 8" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>`,
    cal: `<rect x="5" y="6.5" width="14" height="12" rx="2" fill="#fff"/><rect x="5" y="6.5" width="14" height="4" rx="1.5" fill="#ffd2cc"/><path d="M9 4.5v4M15 4.5v4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
    bell: `<path d="M12 5.2c-3 0-4.6 2.2-4.6 5v3.4L6 16h12l-1.4-2.4v-3.4c0-2.8-1.6-5-4.6-5z" fill="#fff"/><circle cx="12" cy="17.8" r="1.6" fill="#fff"/>`,
    chat: `<path d="M5 7.5a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5z" fill="#fff"/>`,
  }[glyph];
  return `<g transform="translate(${x} ${y}) scale(${r1(k * 100) / 100})"><rect width="24" height="24" rx="6" fill="${color}"/><rect width="24" height="12" rx="6" fill="#fff" opacity="0.12"/>${g}</g>`;
}

// ---------------------------------------------------------------------------
// 1. Hero — the focus hunt
// ---------------------------------------------------------------------------

// Each interruption returns its size and markup, drawn at the origin.
const Thought = {
  toast(c, { app, glyph, color, time, title, body, w = 268 }) {
    const h = 66;
    const max = Math.floor((w - 58) / 6.7);
    return {
      w,
      h,
      svg: `${card(c, w, h, 14)}${appIcon(12, 13, 24, color, glyph)}
<text x="46" y="23" font-family="${UI}" font-size="10.5" letter-spacing="0.6" fill="${c.cardMuted}">${escapeXml(app.toUpperCase())}</text>
<text x="${w - 12}" y="23" text-anchor="end" font-family="${UI}" font-size="10.5" fill="${c.cardMuted}">${escapeXml(time)}</text>
<text x="46" y="41" font-family="${UI}" font-size="13" font-weight="600" fill="${c.cardText}">${escapeXml(trunc(title, max))}</text>
<text x="46" y="57" font-family="${UI}" font-size="12" fill="${c.cardMuted}">${escapeXml(trunc(body, max + 2))}</text>`,
    };
  },

  tabs(c, list) {
    const tw = 176;
    const w = list.length * tw + 12;
    const h = 36;
    let out = `${card(c, w, h, 10)}`;
    list.forEach((t, i) => {
      const x = 6 + i * tw;
      const active = i === list.length - 1;
      if (active) out += `<rect x="${x}" y="5" width="${tw - 2}" height="26" rx="7" fill="${c.bubble}"/>`;
      else out += `<path d="M${x + tw - 1} 11v14" stroke="${c.cardEdge}"/>`;
      out += `<circle cx="${x + 15}" cy="18" r="6" fill="${t.color}"/><text x="${x + 15}" y="21" text-anchor="middle" font-family="${UI}" font-size="8" font-weight="700" fill="#fff">${escapeXml(t.title[0]?.toUpperCase() || '')}</text>
<text x="${x + 27}" y="22" font-family="${UI}" font-size="12" fill="${active ? c.cardText : c.cardMuted}">${escapeXml(trunc(t.title, 19))}</text>
<path d="M${x + tw - 19} 14.5l6 6M${x + tw - 13} 14.5l-6 6" stroke="${c.cardMuted}" stroke-width="1.3" stroke-linecap="round"/>`;
    });
    return { w, h, svg: out };
  },

  sticky(c, text) {
    const w = 152;
    const h = 138;
    const lines = wrap(text, 14, 4);
    const y0 = 52 - (lines.length - 1) * 4;
    return {
      w,
      h,
      svg: `<path d="M3 8 L${w + 3} 6 L${w + 1} ${h + 6} Q${w / 2} ${h + 1} 4 ${h + 8} Z" fill="#000" opacity="0.28"/>
<path d="M0 0H${w}V${h - 14}Q${w - 4} ${h - 2} ${w - 16} ${h}H0Z" fill="url(#stickyG)"/>
<path d="M${w} ${h - 14}Q${w - 4} ${h - 2} ${w - 16} ${h}Q${w - 12} ${h - 10} ${w} ${h - 14}Z" fill="#d9b72e"/>
<rect x="${w / 2 - 26}" y="-9" width="52" height="18" fill="#fffef4" opacity="0.55" transform="rotate(-4 ${w / 2} 0)"/>
${lines.map((l, i) => `<text x="14" y="${y0 + i * 24}" font-family="${HAND}" font-size="16" fill="${P.stickyInk}">${escapeXml(l)}</text>`).join('')}`,
    };
  },

  term(c, cmd) {
    const w = 304;
    const h = 58;
    return {
      w,
      h,
      svg: `<rect x="0" y="4" width="${w}" height="${h}" rx="10" fill="#000" opacity="0.3"/>
<rect width="${w}" height="${h}" rx="10" fill="${P.term}" stroke="#262c38"/>
<circle cx="14" cy="13" r="3.5" fill="#ff5f57"/><circle cx="26" cy="13" r="3.5" fill="#febc2e"/><circle cx="38" cy="13" r="3.5" fill="#28c840"/>
<text x="14" y="43" font-family="${MONO}" font-size="12.5" fill="${P.termText}"><tspan fill="${P.prompt}">$</tspan> ${escapeXml(trunc(cmd, 34))}</text>
<rect x="${Math.min(w - 16, 14 + (trunc(cmd, 34).length + 2) * 7.5)}" y="32" width="7.5" height="14" fill="${P.termText}" opacity="0.85"/>`,
    };
  },

  bubble(c, text, sub) {
    const w = 186;
    const h = 62;
    return {
      w,
      h,
      svg: `<path d="M16 0H${w - 16}A16 16 0 0 1 ${w} 16V22A16 16 0 0 1 ${w - 16} 38H22L10 46L12 37A16 16 0 0 1 0 22V16A16 16 0 0 1 16 0Z" fill="${c.bubble}"/>
<text x="16" y="24" font-family="${UI}" font-size="14" fill="${c.cardText}">${escapeXml(text)}</text>
<g transform="translate(${w - 50} 44)"><rect width="46" height="18" rx="9" fill="${c.bubble}"/><circle cx="13" cy="9" r="2.3" fill="${c.cardMuted}"/><circle cx="23" cy="9" r="2.3" fill="${c.cardMuted}"/><circle cx="33" cy="9" r="2.3" fill="${c.cardMuted}"/></g>
<text x="18" y="58" font-family="${UI}" font-size="10" fill="${c.cardMuted}">${escapeXml(sub)}</text>`,
    };
  },

  timer(c) {
    const w = 212;
    const h = 40;
    const r = 9;
    const len = TAU * r;
    return {
      w,
      h,
      svg: `${pill(c, w, h)}<circle cx="22" cy="20" r="${r}" fill="none" stroke="${c.cardEdge}" stroke-width="3"/>
<circle cx="22" cy="20" r="${r}" fill="none" stroke="${c.accent}" stroke-width="3" stroke-dasharray="${r1(len * 0.72)} ${r1(len)}" transform="rotate(-90 22 20)" stroke-linecap="round"/>
<text x="40" y="25" font-family="${MONO}" font-size="13" font-weight="700" fill="${c.cardText}">25:00</text>
<text x="88" y="25" font-family="${UI}" font-size="11.5" fill="${c.cardMuted}">snoozed 6 times</text>`,
    };
  },

  battery(c) {
    const w = 190;
    const h = 40;
    return {
      w,
      h,
      svg: `${pill(c, w, h)}<rect x="14" y="13" width="26" height="14" rx="3.5" fill="none" stroke="${c.cardMuted}" stroke-width="1.5"/><rect x="41" y="17" width="2.5" height="6" rx="1" fill="${c.cardMuted}"/>
<rect x="16.5" y="15.5" width="3" height="9" rx="1.5" fill="${P.red}"/>
<text x="52" y="25" font-family="${UI}" font-size="12" fill="${c.cardText}">social battery</text>
<text x="${w - 14}" y="25" text-anchor="end" font-family="${MONO}" font-size="12" font-weight="700" fill="${P.red}">4%</text>`,
    };
  },

  search(c, query) {
    const w = 312;
    const h = 40;
    return {
      w,
      h,
      svg: `${pill(c, w, h)}<circle cx="21" cy="19" r="6" fill="none" stroke="${c.cardMuted}" stroke-width="1.8"/><path d="M25.5 23.5l4.5 4.5" stroke="${c.cardMuted}" stroke-width="1.8" stroke-linecap="round"/>
<text x="40" y="25" font-family="${UI}" font-size="13" fill="${c.cardText}">${escapeXml(trunc(query, 36))}</text>`,
    };
  },

  todo(c) {
    const w = 196;
    const h = 132;
    const rows = [
      ['reply to that email', false],
      ['laundry (day 3)', false],
      ['the actual task', false],
      ['start a new side project', true],
    ];
    return {
      w,
      h,
      svg: `${card(c, w, h, 12)}
<text x="14" y="22" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.accent}">TODAY</text>
<text x="${w - 14}" y="22" text-anchor="end" font-family="${MONO}" font-size="10" fill="${c.cardMuted}">1/4</text>
${rows
  .map(([label, done], i) => {
    const y = 44 + i * 22;
    return `<rect x="14" y="${y - 10}" width="12" height="12" rx="3" fill="${done ? P.green : 'none'}" stroke="${done ? P.green : c.cardMuted}" stroke-width="1.4"/>${
      done ? `<path d="M16.5 ${y - 4}l2.5 2.6 4.6-5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` : ''
    }<text x="34" y="${y}" font-family="${UI}" font-size="12" fill="${done ? c.cardMuted : c.cardText}">${escapeXml(label)}</text>${
      done ? `<path d="M34 ${y - 4}h${r1(label.length * 5.9)}" stroke="${c.cardMuted}" stroke-width="1.2"/>` : ''
    }`;
  })
  .join('')}`,
    };
  },

  progress(c, repo) {
    const w = 252;
    const h = 54;
    return {
      w,
      h,
      svg: `${card(c, w, h, 12)}
<text x="14" y="22" font-family="${UI}" font-size="12.5" font-weight="600" fill="${c.cardText}">${escapeXml(trunc(repo, 22))}</text>
<text x="${w - 14}" y="22" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1" fill="${c.cardMuted}">SIDE QUEST</text>
<rect x="14" y="33" width="${w - 64}" height="7" rx="3.5" fill="${c.cardEdge}"/><rect x="14" y="33" width="${r1((w - 64) * 0.61)}" height="7" rx="3.5" fill="${c.accent}"/>
<text x="${w - 14}" y="41" text-anchor="end" font-family="${MONO}" font-size="11" fill="${c.cardMuted}">61%</text>`,
    };
  },

  music(c) {
    const w = 228;
    const h = 40;
    return {
      w,
      h,
      svg: `${pill(c, w, h)}<path d="M18 26.5V13.5l11-2.5v13" fill="none" stroke="${P.pink}" stroke-width="2" stroke-linejoin="round"/><circle cx="15.5" cy="27" r="3" fill="${P.pink}"/><circle cx="26.5" cy="24.5" r="3" fill="${P.pink}"/>
<text x="40" y="25" font-family="${UI}" font-size="12" fill="${c.cardText}">same song, <tspan font-family="${MONO}" font-weight="700">214</tspan>th play</text>`,
    };
  },

  clock(c) {
    const w = 150;
    const h = 56;
    return {
      w,
      h,
      svg: `${card(c, w, h, 12)}
<text x="14" y="30" font-family="${UI}" font-size="22" font-weight="700" letter-spacing="-0.5" fill="${c.cardText}">03:47</text>
<text x="84" y="30" font-family="${MONO}" font-size="10" fill="${c.cardMuted}">AM</text>
<text x="14" y="46" font-family="${UI}" font-size="11" fill="${c.cardMuted}">one more commit</text>`,
    };
  },

  keys(c) {
    const w = 200;
    const h = 36;
    return {
      w,
      h,
      svg: `${pill(c, w, h)}<text x="${w / 2}" y="23" text-anchor="middle" font-family="${UI}" font-size="12" fill="${c.cardText}">keys? <tspan fill="${c.cardMuted}">·</tspan> phone? <tspan fill="${c.cardMuted}">·</tspan> wallet?</text>`,
    };
  },
};

function placeThought(item, x, y, { scale = 1, rot = 0, enter, delay, drift }) {
  const tf = `translate(${x} ${y})${rot ? ` rotate(${rot} ${r1(item.w / 2)} ${r1(item.h / 2)})` : ''}${scale !== 1 ? ` scale(${scale})` : ''}`;
  return `<g transform="${tf}"><g class="dr" style="animation-duration:${drift.dur}s;animation-delay:-${drift.phase}s${drift.reverse ? ';animation-direction:reverse' : ''}"><g class="${enter}" style="animation-delay:${delay}s">${item.svg}</g></g></g>`;
}

// Corner brackets that move independently, so the box reshapes as it hunts rather than scaling.
function reticle(box, stops, c, labels) {
  const arm = 26;
  const corners = [
    [box.x0, box.y0, `M${box.x0} ${box.y0 + arm}V${box.y0}H${box.x0 + arm}`],
    [box.x1, box.y0, `M${box.x1 - arm} ${box.y0}H${box.x1}V${box.y0 + arm}`],
    [box.x1, box.y1, `M${box.x1} ${box.y1 - arm}V${box.y1}H${box.x1 - arm}`],
    [box.x0, box.y1, `M${box.x0 + arm} ${box.y1}H${box.x0}V${box.y1 - arm}`],
  ];
  const pick = (b, k) => [k === 0 || k === 3 ? b.x0 : b.x1, k < 2 ? b.y0 : b.y1];
  let css = '';
  const paths = corners
    .map(([cx, cy, d], k) => {
      css += `@keyframes k${k}{${stops
        .map(([pct, b]) => {
          const [tx, ty] = pick(b, k);
          return `${pct}%{transform:translate(${r1(tx - cx)}px,${r1(ty - cy)}px)}`;
        })
        .join('')}}`;
      return `<g class="ck" style="animation-name:k${k}"><path d="${d}"/>${k === 0 ? labels : ''}</g>`;
    })
    .join('');
  return { css, svg: paths };
}

export function heroSvg(profile, themeName, { thought }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600; // 2.00:1, the Univisium frame
  const BAR = 50;
  const CX = 600;
  const CY = 300;
  const n = adhdNumbers(profile);
  const rand = seededRandom(`adhd:${profile.login}`);
  const repos = (profile.repos || []).map((r) => r.name);
  const repo = (i, fallback) => repos[i] || fallback;

  // --- Name, sized to a fixed measure so every font lands the same width.
  const name = (profile.name || profile.login).toUpperCase();
  const len = Math.max(1, [...name].length);
  const S = Math.round(Math.max(50, Math.min(124, 680 / (len * 0.52))));
  const tw = r1(Math.min(680, len * S * 0.52));
  const base = 302;
  const capTop = base - S * 0.72;
  const box = { x0: r1(CX - tw / 2 - 34), y0: r1(capTop - 24), x1: r1(CX + tw / 2 + 34), y1: base + 24 };
  const nx = r1(CX - tw / 2);

  // --- Headline, typed out after the lock.
  const HL = 14;
  const charW = HL * 0.6;
  const hlLines = balance(profile.headline, 76);
  const typeStart = LOCK + 0.4;
  let typeAt = typeStart;
  const headline = hlLines
    .map((line, i) => {
      const w = r1(line.length * charW);
      const x = r1(CX - w / 2);
      const y = base + 64 + i * 23;
      const dur = Math.min(1.4, Math.max(0.3, line.length * 0.022));
      const svg = `<clipPath id="hl${i}"><rect class="type" style="animation-delay:${typeAt.toFixed(2)}s;animation-duration:${dur.toFixed(2)}s;animation-timing-function:steps(${Math.max(1, line.length)})" x="${x}" y="${y - 16}" width="${w + 2}" height="22"/></clipPath>
<text clip-path="url(#hl${i})" x="${x}" y="${y}" textLength="${w}" lengthAdjust="spacing" font-family="${MONO}" font-size="${HL}" fill="${c.fg}" fill-opacity="0.82">${escapeXml(line)}</text>`;
      typeAt += dur + 0.05;
      return { svg, x, y, w };
    });
  const lastLine = headline[headline.length - 1];
  const caret = lastLine
    ? `<g class="caretWait" style="animation-duration:${typeAt.toFixed(2)}s"><rect class="blink" style="animation-delay:${typeAt.toFixed(2)}s" x="${r1(lastLine.x + lastLine.w + 4)}" y="${lastLine.y - 13}" width="8" height="16" fill="${c.accent}"/></g>`
    : '';

  // --- Interruptions. Positions keep clear of the name (x 214–986, y 176–410).
  const languages = (profile.languages || []).map((l) => l.name);
  const items = [
    {
      key: 'tabs',
      item: Thought.tabs(c, [
        { title: repo(0, 'side-project'), color: langColor(profile.repos?.[0]?.language || languages[0] || 'Rust') },
        { title: 'how do lighthouses work', color: P.blue },
      ]),
      x: 34, y: 62, enter: 'drop', delay: 0.15,
    },
    { key: 'search', item: Thought.search(c, 'is it normal to have 40 tabs open'), x: 96, y: 112, scale: 0.92, enter: 'pop', delay: 0.62 },
    {
      key: 'cal',
      item: Thought.toast(c, { app: 'Calendar', glyph: 'cal', color: P.red, time: 'now', title: 'Standup', body: 'Started 6 minutes ago' }),
      x: 466, y: 64, enter: 'drop', delay: 0.38,
    },
    { key: 'timer', item: Thought.timer(c), x: 752, y: 60, scale: 0.94, enter: 'pop', delay: 0.98 },
    {
      key: 'mail',
      item: Thought.toast(c, { app: 'Mail', glyph: 'mail', color: P.blue, time: '2,847 unread', title: 'Re: Re: quick question', body: 'Following up on this (3 weeks)' }),
      x: 904, y: 98, enter: 'slide', delay: 0.26,
    },
    { key: 'sticky', item: Thought.sticky(c, thought), x: 40, y: 192, rot: -5, enter: 'slap', delay: 0.72 },
    { key: 'battery', item: Thought.battery(c), x: 22, y: 368, scale: 0.92, enter: 'pop', delay: 1.22 },
    { key: 'bubble', item: Thought.bubble(c, 'you there?', 'Seen 2h ago'), x: 996, y: 188, enter: 'pop', delay: 0.86 },
    { key: 'todo', item: Thought.todo(c), x: 998, y: 266, enter: 'drop', delay: 0.52 },
    { key: 'term', item: Thought.term(c, `git checkout -b ${repo(1, 'idea')}-v2`), x: 58, y: 436, enter: 'pop', delay: 0.46 },
    { key: 'progress', item: Thought.progress(c, repo(2, 'new-idea-v3')), x: 404, y: 450, enter: 'drop', delay: 1.3 },
    { key: 'music', item: Thought.music(c), x: 690, y: 462, scale: 0.94, enter: 'pop', delay: 1.08 },
    { key: 'clock', item: Thought.clock(c), x: 1006, y: 414, enter: 'pop', delay: 1.42 },
    { key: 'keys', item: Thought.keys(c), x: 210, y: 504, scale: 0.9, enter: 'pop', delay: 1.58 },
  ];
  const at = Object.fromEntries(items.map((t) => [t.key, t]));
  const thoughtsSvg = items
    .map((t) =>
      placeThought(t.item, t.x, t.y, {
        scale: t.scale,
        rot: t.rot,
        enter: t.enter,
        delay: t.delay,
        drift: { dur: r1(7 + rand() * 5), phase: r1(rand() * 8), reverse: rand() > 0.5 },
      })
    )
    .join('');

  // --- Autofocus hunt: frame → mail → sticky → progress → todo → overshoot → lock.
  const boxOf = (t, pad = 8) => {
    const s = t.scale || 1;
    return { x0: t.x - pad, y0: t.y - pad, x1: t.x + t.item.w * s + pad, y1: t.y + t.item.h * s + pad };
  };
  const frameBox = { x0: 70, y0: 84, x1: W - 70, y1: H - 84 };
  const grow = (b, d) => ({ x0: b.x0 - d, y0: b.y0 - d, x1: b.x1 + d, y1: b.y1 + d });
  const stops = [
    [0, frameBox],
    [9, frameBox],
    [19, boxOf(at.mail)],
    [27, boxOf(at.mail)],
    [37, boxOf(at.sticky, 12)],
    [45, boxOf(at.sticky, 12)],
    [55, boxOf(at.progress)],
    [62, boxOf(at.progress)],
    [71, boxOf(at.todo)],
    [77, boxOf(at.todo)],
    [88, grow(box, 26)],
    [95, grow(box, -5)],
  ];
  const labels = `<text class="hunt" opacity="0" x="${box.x0}" y="${box.y0 - 10}" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="2" fill="${c.line}" stroke="none">AF-C · HUNTING</text>
<text class="lock" x="${box.x0}" y="${box.y0 - 10}" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="2" fill="${c.accent}" stroke="none">AF-C · LOCKED</text>`;
  const ret = reticle(box, stops, c, labels);

  // --- Bokeh: one out-of-focus light per month, sized by that month's contributions.
  const months = monthlySeries(n.days);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const bokeh = months
    .map((m, i) => {
      const a = (i / Math.max(1, months.length)) * TAU - Math.PI / 2 + (rand() - 0.5) * 0.35;
      const rr = 1 + (rand() - 0.5) * 0.25;
      const x = r1(CX + Math.cos(a) * 470 * rr);
      const y = r1(CY + Math.sin(a) * 200 * rr);
      const v = m.total / maxMonth;
      const r = r1(20 + 70 * Math.sqrt(v));
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bk${i % c.bokeh.length})" opacity="${(0.3 + 0.7 * v).toFixed(2)}"/>`;
    })
    .join('');

  // --- Chromatic layers: two coloured copies of the name jitter apart while focus hunts, then
  // converge to a 2px residual fringe at the lock.
  const jitter = (sign, key) => {
    const jr = seededRandom(`jit:${key}:${profile.login}`);
    const pts = [0, 10, 21, 33, 44, 56, 67, 79, 90];
    return `@keyframes ${key}{${pts
      .map((p, i) => {
        const amp = (52 * (1 - p / 100) + 6) * (0.45 + 0.55 * jr());
        const dy = r1((jr() - 0.5) * (i === 0 ? 0 : 10));
        return `${p}%{transform:translate(${r1(sign * amp)}px,${dy}px)${i === 0 ? ';opacity:0' : ''}}${i === 0 ? '6%{opacity:.9}' : ''}`;
      })
      .join('')}}`;
  };
  const slices = [
    [base - S * 0.66, S * 0.12, 0.95],
    [base - S * 0.38, S * 0.09, 1.55],
    [base - S * 0.15, S * 0.1, 2.05],
  ];

  // --- Viewfinder overlay: info bars like a cinema monitor.
  const cell = (x, y, label, value, color = c.barText, delay = 0.1) =>
    `<g class="boot" style="animation-delay:${delay.toFixed(2)}s"><text x="${r1(x)}" y="${y}" font-size="9" letter-spacing="1.6" fill="${c.barMuted}">${escapeXml(label)}</text><text x="${r1(x)}" y="${y + 18}" font-size="13" fill="${color}">${escapeXml(value)}</text></g>`;
  const cellW = (label, value) => Math.max(label.length * 7, value.length * 7.8);
  const row = (list, x, y, align) => {
    const gap = 22;
    const widths = list.map(([l, v]) => cellW(l, v));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
    let cursor = align === 'end' ? x - total : x;
    return list
      .map(([l, v, color], i) => {
        const out = cell(cursor, y, l, v, color, 0.12 + i * 0.05) + (i < list.length - 1 ? `<path d="M${r1(cursor + widths[i] + gap / 2)} ${y - 8}v26" stroke="${c.barRule}"/>` : '');
        cursor += widths[i] + gap;
        return out;
      })
      .join('');
  };
  const topLeft = row(
    [
      ['CAM', 'A'],
      ['FPS', '24.000'],
      ['SHUTTER', '180.0°'],
      ['EI', '800'],
      ['WB', '5600K'],
      ['LENS', '35mm T1.4'],
    ],
    104,
    20
  );
  const topRight = row(
    [
      ['CLIP', `@${trunc(profile.login, 16)}`],
      ['TC', '03:47:12:08'],
    ],
    W - 28,
    20,
    'end'
  );
  const bottomRight = row(
    [
      ['CONTRIB', fmt(n.total)],
      ['ACTIVE', `${fmt(n.active)} D`],
      ['BEST RUN', `${fmt(n.streak)} D`],
      ['STARS', fmt(n.stars)],
    ],
    W - 98,
    H - 31,
    'end'
  );

  // Focus scale: from EVERYTHING to ONE THING. The marker hunts with the reticle.
  const fs0 = 96;
  const fs1 = 380;
  let ticks = '';
  for (let x = fs0, i = 0; x <= fs1 + 0.1; x += (fs1 - fs0) / 24, i++) {
    ticks += `M${r1(x)} ${i % 6 === 0 ? H - 27 : H - 25}v${i % 6 === 0 ? 9 : 5}`;
  }
  const mkStops = [
    [0, 0.12], [9, 0.12], [19, 0.46], [27, 0.46], [37, 0.2], [45, 0.2], [55, 0.62], [62, 0.62], [71, 0.36], [77, 0.36], [88, 1.04], [95, 0.98],
  ];
  const mkCss = `@keyframes mk{${mkStops.map(([p, v]) => `${p}%{transform:translateX(${r1((v - 1) * (fs1 - fs0))}px)}`).join('')}}`;

  // Handheld shake while the mind is noisy; it settles to a locked-off frame at the lock.
  const shakeRand = seededRandom(`shake:${profile.login}`);
  const shakeCss = `@keyframes shake{${Array.from({ length: 16 }, (_, i) => {
    const p = Math.round((i / 16) * 96);
    const amp = 4.2 * (1 - p / 100) + 0.4;
    return `${p}%{transform:translate(${r1((shakeRand() - 0.5) * 2 * amp)}px,${r1((shakeRand() - 0.5) * 2 * amp)}px) rotate(${r1((shakeRand() - 0.5) * amp * 0.12 * 100) / 100}deg)}`;
  }).join('')}}`;

  const css = `
.fob{animation:fob 1s ease-out .15s both}
.shake{transform-origin:${CX}px ${CY}px;animation:shake ${LOCK}s ease-in-out both}
.boot{animation:fade .4s ease-out both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .5s ${BACK} both}
.slide{animation:slide .7s ${EXPO} both}
.drop{animation:drop .6s ${EXPO} both}
.slap{transform-box:fill-box;transform-origin:center;animation:slap .55s ease-out both}
.dr{animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.recede{transform-origin:${CX}px ${CY}px;animation:recede 1.2s ${EXPO} ${LOCK - 0.05}s both}
.tunnel{animation:fade 1.3s ease-out ${LOCK - 0.05}s both}
.cr{animation:jitA 2.15s cubic-bezier(.6,0,.2,1) .35s both}
.cb{animation:jitB 2.15s cubic-bezier(.6,0,.2,1) .35s both}
.gs{animation-duration:.34s;animation-timing-function:linear}
.punch{transform-box:fill-box;transform-origin:center;animation:punch .6s ${EXPO} ${LOCK - 0.12}s both}
.flare{transform-box:fill-box;transform-origin:center;animation:flare 1.9s ${EXPO} ${LOCK - 0.06}s both}
.ret{animation:lockc ${LOCK}s step-end both}
.retIn{animation:fade .4s ease-out .2s both}
.ck{animation-duration:2.2s;animation-timing-function:${SNAP};animation-delay:.3s;animation-fill-mode:both}
.hunt{animation:show ${LOCK}s step-end both}
.lock{animation:hide ${LOCK}s step-end both}
.beep{transform-box:fill-box;transform-origin:center;animation:beep .7s ease-out ${LOCK}s}
.mk{animation:mk 2.2s ${SNAP} .3s both}
.tag{animation:tag .5s ${EXPO} ${LOCK + 0.25}s both}
.type{transform-box:fill-box;transform-origin:left center;animation-name:type;animation-fill-mode:both}
.caretWait{animation-name:hide;animation-timing-function:step-end;animation-fill-mode:both}
.blink{animation:blink 1s steps(1) 4}
.rec{animation:rec 1.2s steps(1) infinite}
@keyframes fade{from{opacity:0}}
@keyframes fob{from{opacity:1}}
@keyframes show{from{opacity:1}}
@keyframes hide{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:scale(.6)}}
@keyframes slide{from{opacity:0;transform:translateX(70px)}}
@keyframes drop{from{opacity:0;transform:translateY(-26px)}}
@keyframes slap{0%{opacity:0;transform:scale(1.7) rotate(-12deg)}55%{opacity:1;transform:scale(.94) rotate(1deg)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,-4px)}}
@keyframes recede{from{opacity:1;transform:scale(.955)}}
${jitter(-1, 'jitA')}
${jitter(1, 'jitB')}
@keyframes g0{0%{opacity:1;transform:translateX(38px)}30%{transform:translateX(-26px)}62%{transform:translateX(14px)}88%{opacity:1;transform:translateX(-6px)}}
@keyframes g1{0%{opacity:1;transform:translateX(-30px)}35%{transform:translateX(22px)}70%{opacity:1;transform:translateX(-9px)}}
@keyframes g2{0%{opacity:1;transform:translateX(24px)}40%{transform:translateX(-16px)}75%{opacity:1;transform:translateX(6px)}}
@keyframes punch{from{opacity:0;transform:scale(1.07)}}
@keyframes flare{0%{opacity:0;transform:scaleX(.12)}22%{opacity:1;transform:scaleX(1.04)}}
@keyframes lockc{from{stroke:${c.line}}}
@keyframes beep{0%{transform:scale(1.07)}35%{transform:scale(1)}55%{transform:scale(1.035)}}
@keyframes tag{from{opacity:0;transform:translateY(6px)}}
@keyframes type{from{transform:scaleX(0)}}
@keyframes blink{50%{opacity:0}}
@keyframes rec{50%{opacity:.18}}
${ret.css}
${mkCss}
${shakeCss}
${REDUCED}`;

  const nameText = `<text id="nm" x="${nx}" y="${base}" textLength="${tw}" lengthAdjust="spacingAndGlyphs" font-family="${COND}" font-weight="800" font-stretch="condensed" font-size="${S}">${escapeXml(name)}</text>`;
  const flareY = r1(base - S * 0.36);

  const words = [
    ['wait—', 196, 176, 54],
    ['ooh.', 836, 428, 60],
    ['later', 486, 526, 46],
  ]
    .map(([w, x, y, s]) => `<text x="${x}" y="${y}" font-family="${COND}" font-weight="800" font-stretch="condensed" font-size="${s}" fill="${c.word}" opacity="${c.wordOp}">${w}</text>`)
    .join('');

  const aria = `${profile.name || profile.login}${profile.headline ? ` — ${profile.headline}` : ''}. A camera monitor: autofocus hunts through notifications, tabs and to-dos, then locks onto the name.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <radialGradient id="lift" cx="${CX}" cy="${CY}" r="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.lift}"/><stop offset="1" stop-color="${c.bg}"/></radialGradient>
  <radialGradient id="vig" cx="${CX}" cy="${CY}" r="760" gradientUnits="userSpaceOnUse" gradientTransform="translate(${CX} ${CY}) scale(1 .62) translate(-${CX} -${CY})"><stop offset=".42" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.vignetteOp}"/></radialGradient>
  <radialGradient id="tun" cx="${CX}" cy="${CY}" r="560" gradientUnits="userSpaceOnUse" gradientTransform="translate(${CX} ${CY}) scale(1 .55) translate(-${CX} -${CY})"><stop offset=".5" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.tunnelOp}"/></radialGradient>
  ${c.bokeh
    .map(
      (col, i) =>
        `<radialGradient id="bk${i}"><stop offset="0" stop-color="${col}" stop-opacity="${r1(c.bokehOp * 0.55 * 100) / 100}"/><stop offset=".78" stop-color="${col}" stop-opacity="${r1(c.bokehOp * 0.72 * 100) / 100}"/><stop offset=".92" stop-color="${col}" stop-opacity="${c.bokehOp}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`
    )
    .join('')}
  <radialGradient id="leak" cx="${W + 40}" cy="-30" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.leak}" stop-opacity="${c.leakOp}"/><stop offset=".55" stop-color="${c.leak}" stop-opacity="${r1(c.leakOp * 0.3 * 100) / 100}"/><stop offset="1" stop-color="${c.leak}" stop-opacity="0"/></radialGradient>
  <linearGradient id="stickyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.stickyTop}"/><stop offset=".25" stop-color="${P.sticky}"/><stop offset="1" stop-color="#f5cf3a"/></linearGradient>
  <radialGradient id="flH"><stop offset="0" stop-color="${c.flareCore}" stop-opacity=".9"/><stop offset=".25" stop-color="${c.flare}" stop-opacity=".45"/><stop offset="1" stop-color="${c.flare}" stop-opacity="0"/></radialGradient>
  <linearGradient id="flL" x1="0" x2="1"><stop offset="0" stop-color="${c.flare}" stop-opacity="0"/><stop offset=".5" stop-color="${c.flareCore}"/><stop offset="1" stop-color="${c.flare}" stop-opacity="0"/></linearGradient>
  ${grainPattern(c, profile.login)}
  ${nameText}
  ${slices.map(([y, h], i) => `<clipPath id="sl${i}"><rect x="0" y="${r1(y)}" width="${W}" height="${r1(h)}"/></clipPath>`).join('')}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#lift)"/>
  <g class="shake">
  <g style="mix-blend-mode:${c.blend}">${bokeh}</g>
  ${words}
  <g class="recede" opacity="${c.dim}">${thoughtsSvg}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect class="tunnel" width="${W}" height="${H}" fill="url(#tun)"/>
  <rect width="${W}" height="${H}" fill="url(#leak)" style="mix-blend-mode:${c.blend === 'screen' ? 'screen' : 'normal'}"/>
  <g style="mix-blend-mode:${c.blend}">
    <g transform="translate(-2 0)"><use class="cr" xlink:href="#nm" fill="${c.fringeA}" opacity=".9"/></g>
    <g transform="translate(2 0)"><use class="cb" xlink:href="#nm" fill="${c.fringeB}" opacity=".9"/></g>
  </g>
  ${slices.map(([, , t], i) => `<g clip-path="url(#sl${i})"><use class="gs" style="animation-name:g${i};animation-delay:${t}s" opacity="0" xlink:href="#nm" fill="${c.fg}"/></g>`).join('')}
  <use class="punch" xlink:href="#nm" fill="${c.fg}"/>
  <g class="flare" opacity="${c.flareOp}" style="mix-blend-mode:${c.blend === 'screen' ? 'screen' : 'normal'}">
    <ellipse cx="${CX}" cy="${flareY}" rx="560" ry="30" fill="url(#flH)"/>
    <rect x="40" y="${flareY - 1}" width="${W - 80}" height="2" fill="url(#flL)"/>
  </g>
  ${headline.map((h) => h.svg).join('')}
  ${caret}
  </g>
  <g class="retIn"><g class="beep"><g class="ret" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-linecap="square">${ret.svg}</g></g></g>
  <text class="tag" x="${box.x1}" y="${box.y0 - 10}" text-anchor="end" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="2" fill="${c.accent}">HYPERFOCUS ▸ ON</text>
  <rect width="${W}" height="${H}" fill="url(#grain)" opacity="${c.grainOp}"/>
  <rect class="fob" width="${W}" height="${H}" fill="${c.bg}" opacity="0"/>
  <g font-family="${MONO}">
    <rect width="${W}" height="${BAR}" fill="${c.bar}" opacity="${c.barOp}"/>
    <rect y="${H - BAR}" width="${W}" height="${BAR}" fill="${c.bar}" opacity="${c.barOp}"/>
    <g class="boot"><circle class="rec" cx="34" cy="25" r="6" fill="${c.rec}"/><text x="47" y="30" font-size="13" font-weight="700" letter-spacing="1" fill="${c.rec}">REC</text></g>
    ${topLeft}
    ${topRight}
    <g class="boot" style="animation-delay:.2s">
      <text x="28" y="${H - 29}" font-size="9" letter-spacing="1.6" fill="${c.barMuted}">FOCUS</text>
      <text x="28" y="${H - 12}" font-size="13" fill="${c.barText}">AF-C</text>
      <path d="${ticks}" stroke="${c.barMuted}" stroke-width="1"/>
      <text x="${fs0}" y="${H - 6}" font-size="8.5" letter-spacing="1.2" fill="${c.barMuted}">EVERYTHING</text>
      <text x="${fs1}" y="${H - 6}" text-anchor="end" font-size="8.5" letter-spacing="1.2" fill="${c.barMuted}">ONE THING</text>
      <g class="mk"><path d="M${fs1 - 5} ${H - 38}h10l-5 7z" fill="${c.accent}"/><path d="M${fs1} ${H - 31}v14" stroke="${c.accent}" stroke-width="1.5"/></g>
    </g>
    <g class="boot" style="animation-delay:.25s">
      <path d="M${fs1 + 24} ${H - 38}v26" stroke="${c.barRule}"/>
      <text x="${fs1 + 46}" y="${H - 29}" font-size="9" letter-spacing="1.6" fill="${c.barMuted}">STATUS</text>
      <text class="hunt" opacity="0" x="${fs1 + 46}" y="${H - 11}" font-size="13" fill="${c.barText}">HUNTING…</text>
      <text class="lock" x="${fs1 + 46}" y="${H - 11}" font-size="13" font-weight="700" fill="${c.accent}">● LOCKED</text>
    </g>
    ${bottomRight}
    <g class="boot" style="animation-delay:.3s" transform="translate(${W - 74} ${H - 32})">
      <text y="3" font-size="9" letter-spacing="1.6" fill="${c.barMuted}">BATT</text>
      <rect y="9" width="30" height="13" rx="2.5" fill="none" stroke="${c.barText}" stroke-width="1.3"/><rect x="31" y="13" width="2.5" height="5" rx="1" fill="${c.barText}"/>
      <rect x="2.5" y="11.5" width="6" height="8" rx="1" fill="${c.rec}"/>
    </g>
  </g>
  <g fill="none" stroke="${c.line}" stroke-opacity=".5" stroke-width="1.5">
    <path d="M24 ${BAR + 34}v-20h20M${W - 44} ${BAR + 14}h20v20M${W - 24} ${H - BAR - 34}v20h-20M44 ${H - BAR - 14}h-20v-20"/>
  </g>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity=".08"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Signal — the browser with too many tabs
// ---------------------------------------------------------------------------

const RABBIT_HOLES = [
  ['how do lighthouses work', '#2f7cf6'],
  ['mechanical keyboard switches', '#8e8e93'],
  ['is it normal to have 40 tabs', '#30d158'],
  ['5-minute pasta', '#ff9f0a'],
  ['history of the semicolon', '#a78bfa'],
  ['why cats knock things over', '#ff375f'],
  ['octopus intelligence', '#40c8e0'],
  ['vintage synth prices', '#ffd60a'],
  ['learn japanese in 30 days', '#ff453a'],
  ['low-light desk plants', '#34c759'],
  ['how to start a podcast', '#bf5af2'],
  ['flights anywhere, cheap', '#64d2ff'],
  ['speedrun world records', '#ff6482'],
  ['sourdough starter help', '#d4a373'],
];

function odometer(value, x, y, uid, delay, c, maxWidth) {
  const str = fmt(value);
  const WW = 22;
  const WH = 34;
  const gap = 3;
  let cursor = x;
  let wheels = '';
  let clips = '';
  const digitsTotal = str.replace(/,/g, '').length;
  let digitIndex = 0;
  for (const ch of str) {
    if (ch === ',') {
      wheels += `<text x="${r1(cursor + 6)}" y="${y + 31}" text-anchor="middle" font-family="${MONO}" font-size="20" font-weight="700" fill="${c.muted}">,</text>`;
      cursor += 12;
      continue;
    }
    const d = Number(ch);
    const fromRight = digitsTotal - 1 - digitIndex;
    const idx = (fromRight === 0 ? 20 : fromRight === 1 ? 10 : 0) + d;
    clips += `<rect x="${r1(cursor)}" y="${y}" width="${WW}" height="${WH}" rx="4"/>`;
    wheels += `<rect x="${r1(cursor)}" y="${y}" width="${WW}" height="${WH}" rx="4" fill="#17191e"/>
<g clip-path="url(#od${uid})"><use class="roll" style="animation-delay:${delay.toFixed(2)}s;transform:translateY(${-idx * WH}px)" xlink:href="#dstrip" x="${r1(cursor + WW / 2)}" y="${y + 26}" fill="#f4f2ed"/></g>
<rect x="${r1(cursor)}" y="${y}" width="${WW}" height="${WH}" rx="4" fill="url(#wheelShade)"/>`;
    cursor += WW + gap;
    digitIndex++;
  }
  // Big numbers shrink to fit their cell rather than spilling into the next one.
  const k = Math.min(1, maxWidth / (cursor - x));
  const svg = k < 1 ? `<g transform="translate(${x} ${y}) scale(${r1(k * 100) / 100}) translate(${-x} ${-y})">${wheels}</g>` : wheels;
  return { svg, clip: `<clipPath id="od${uid}">${clips}</clipPath>` };
}

export function signalSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 660;
  const n = adhdNumbers(profile);
  const rand = seededRandom(`signal:${profile.login}`);

  // --- Tab strip: the README's own tab, then projects mixed in with rabbit holes.
  const repos = (profile.repos || []).slice(0, 6);
  const holes = [...RABBIT_HOLES].sort(() => rand() - 0.5);
  const tabs = [];
  let ri = 0;
  let hi = 0;
  for (let i = 0; tabs.length < 17; i++) {
    if (i % 3 === 0 && ri < repos.length) {
      const r = repos[ri++];
      tabs.push({ title: r.name, color: langColor(r.language || 'Markdown') });
    } else {
      const [title, color] = holes[hi++ % holes.length];
      tabs.push({ title, color });
    }
  }
  const stripX = 84;
  const activeW = 232;
  const otherW = r1((1104 - stripX - activeW) / tabs.length);
  let tabSvg = '';
  const ax = stripX;
  tabSvg += `<path class="tabA" d="M${ax - 8} 44Q${ax} 44 ${ax} 36V14Q${ax} 6 ${ax + 8} 6H${ax + activeW - 8}Q${ax + activeW} 6 ${ax + activeW} 14V36Q${ax + activeW} 44 ${ax + activeW + 8} 44Z" fill="${c.toolbar}"/>
<g class="tabA"><circle cx="${ax + 18}" cy="25" r="7" fill="${c.accent}"/><path d="M${ax + 14.5} 25h7M${ax + 18} 21.5v7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
<text x="${ax + 32}" y="29.5" font-family="${UI}" font-size="12.5" fill="${c.omniText}">${escapeXml(trunc(`${profile.login} · signal`, 24))}</text>
<path d="M${ax + activeW - 22} 21l8 8M${ax + activeW - 14} 21l-8 8" stroke="${c.tabText}" stroke-width="1.4" stroke-linecap="round"/></g>`;
  tabs.forEach((t, i) => {
    const x = r1(stripX + activeW + i * otherW);
    const showTitle = otherW >= 64;
    const fx = showTitle ? x + 16 : r1(x + otherW / 2);
    tabSvg += `<g class="tab" style="animation-delay:${(0.15 + i * 0.07).toFixed(2)}s">
${i > 0 ? `<path d="M${x} 16v18" stroke="${c.tabRule}"/>` : ''}
<circle cx="${fx}" cy="25" r="7" fill="${t.color}"/><text x="${fx}" y="28.5" text-anchor="middle" font-family="${UI}" font-size="9" font-weight="700" fill="#fff">${escapeXml((t.title[0] || '').toUpperCase())}</text>
${showTitle ? `<text x="${x + 28}" y="29.5" font-family="${UI}" font-size="12" fill="${c.tabText}">${escapeXml(trunc(t.title, Math.floor((otherW - 36) / 6.6)))}</text>` : ''}
</g>`;
  });
  tabSvg += `<g class="tab" style="animation-delay:${(0.2 + tabs.length * 0.07).toFixed(2)}s"><path d="M${1104 + 18} 19v12M${1104 + 12} 25h12" stroke="${c.tabText}" stroke-width="1.6" stroke-linecap="round"/></g>`;

  // --- Toolbar.
  const url = `brain://${profile.login}/attention`;
  const toolbar = `<rect y="44" width="${W}" height="46" fill="${c.toolbar}"/>
<g fill="none" stroke="${c.tabText}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30 67h12M30 67l5-5M30 67l5 5"/>
  <path d="M72 67h-12M72 67l-5-5M72 67l-5 5" opacity=".45"/>
  <path d="M108 61.5a6.5 6.5 0 1 0 2 4.7M108 58v4h-4"/>
</g>
<rect x="132" y="51" width="${W - 132 - 96}" height="32" rx="16" fill="${c.omni}"/>
<g transform="translate(150 67)" fill="none" stroke="${c.tabText}" stroke-width="1.5" stroke-linecap="round"><path d="M-4 -3h8M-4 3h8"/><circle cx="-1.5" cy="-3" r="2" fill="${c.omni}"/><circle cx="2" cy="3" r="2" fill="${c.omni}"/></g>
<text x="170" y="71.5" font-family="${UI}" font-size="13.5" fill="${c.tabText}">brain://<tspan fill="${c.omniText}">${escapeXml(profile.login)}</tspan>/attention</text>
<path d="M${W - 120} 61l1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6z" fill="none" stroke="${c.tabText}" stroke-width="1.3" stroke-linejoin="round"/>
<circle cx="${W - 64}" cy="67" r="12" fill="${c.accent}"/><text x="${W - 64}" y="71.5" text-anchor="middle" font-family="${UI}" font-size="12" font-weight="700" fill="#fff">${escapeXml((profile.name || profile.login)[0]?.toUpperCase() || '')}</text>
<g fill="${c.tabText}"><circle cx="${W - 28}" cy="61" r="1.7"/><circle cx="${W - 28}" cy="67" r="1.7"/><circle cx="${W - 28}" cy="73" r="1.7"/></g>`;

  // --- Panels.
  const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c.panel}" stroke="${c.panelEdge}"/>`;
  const title = (x, y, strong, rest) =>
    `<text x="${x}" y="${y}" font-family="${MONO}" font-size="11.5" letter-spacing="1.8" fill="${c.fg}"><tspan font-weight="700">${strong}</tspan><tspan fill="${c.muted}" letter-spacing="1">${rest ? `  ·  ${escapeXml(rest)}` : ''}</tspan></text>`;

  // Seismograph of the last 365 days. Each day swings the pen above or below the line in turn,
  // so a run of busy days reads as a quake and quiet weeks as a hum.
  const px0 = 52;
  const px1 = 784;
  const pw = px1 - px0;
  const py0 = 158;
  const py1 = 334;
  const mid = (py0 + py1) / 2;
  const days = n.days;
  const peak = Math.max(1, ...days.map((d) => d.count));
  const step = pw / Math.max(1, days.length - 1);
  const noise = seededRandom(`seis:${profile.login}`);
  const pts = days.map((d, i) => {
    const v = d.count / peak;
    const amp = d.count > 0 ? 2.5 + 78 * Math.pow(v, 0.85) : 0.6 + noise() * 1.8;
    return `${r1(px0 + i * step)} ${r1(mid + (i % 2 ? amp : -amp))}`;
  });
  const trace = pts.length ? `M${pts.join('L')}` : `M${px0} ${mid}H${px1}`;
  let grid = '';
  for (let x = px0; x <= px1 + 0.1; x += 12.2) grid += `M${r1(x)} ${py0}V${py1}`;
  for (let y = py0; y <= py1 + 0.1; y += 11) grid += `M${px0} ${r1(y)}H${px1}`;
  let gridMajor = '';
  for (let x = px0; x <= px1 + 0.1; x += 61) gridMajor += `M${r1(x)} ${py0}V${py1}`;
  for (let y = py0; y <= py1 + 0.1; y += 44) gridMajor += `M${px0} ${r1(y)}H${px1}`;
  const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthLabels = days
    .map((d, i) => (d.date.slice(8) === '01' && i * step > 24 && i * step < pw - 20 ? `<text x="${r1(px0 + i * step)}" y="${py1 + 18}" text-anchor="middle" font-family="${MONO}" font-size="9.5" letter-spacing="1" fill="${c.muted}">${MONTH[Number(d.date.slice(5, 7)) - 1]}</text>` : ''))
    .join('');
  const SWEEP = 3.2;
  const SWEEP0 = 0.5;
  const sorted = [...n.episodes].sort((a, b) => a.start - b.start);
  let lastLabelEnd = -Infinity;
  let rowFlip = 0;
  let episodeBands = '';
  const episodes = sorted
    .map((e) => {
      const xs = r1(px0 + e.start * step - 3);
      const xe = r1(px0 + e.end * step + 3);
      const xm = r1((xs + xe) / 2);
      const label = `HF-${e.rank}  ${e.length}D · ${fmt(e.sum)}`;
      const lw = label.length * 6.6 + 14;
      const lx = r1(Math.max(px0 + 4, Math.min(px1 - lw - 4, xm - lw / 2)));
      rowFlip = lx < lastLabelEnd + 6 ? rowFlip + 1 : 0;
      lastLabelEnd = lx + lw;
      const ly = py0 + 8 + (rowFlip % 2) * 22;
      const t = SWEEP0 + (SWEEP * (xe - px0)) / pw;
      episodeBands += `<rect class="epi" style="animation-delay:${t.toFixed(2)}s" x="${xs}" y="${py0}" width="${r1(Math.max(4, xe - xs))}" height="${py1 - py0}" fill="${c.accent}" opacity=".12"/>`;
      return `<g class="epi" style="animation-delay:${t.toFixed(2)}s"><path d="M${xm} ${ly + 18}V${r1(mid - 84)}" stroke="${c.accent}" stroke-width="1" stroke-dasharray="2 3"/>
<rect x="${lx}" y="${ly}" width="${r1(lw)}" height="18" rx="9" fill="${c.plot}" stroke="${c.accent}"/>
<text x="${r1(lx + 7)}" y="${ly + 12.5}" font-family="${MONO}" font-size="10" font-weight="700" fill="${c.accent}">${label}</text></g>`;
    })
    .join('');
  const quiet = n.total === 0 ? `<text x="${(px0 + px1) / 2}" y="${mid - 16}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${c.muted}">THE SIGNAL IS QUIET — FOR NOW</text>` : '';

  // Clock: two times, now and not now.
  const ccx = 1000;
  const ccy = 236;
  const R = 74;
  const wedge = 26;
  const arc = (r, a0, a1) => {
    const p = (a) => [r1(ccx + Math.sin((a * Math.PI) / 180) * r), r1(ccy - Math.cos((a * Math.PI) / 180) * r)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${ccx} ${ccy}L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`;
  };
  let clockTicks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const r0 = i % 5 === 0 ? R - 9 : R - 5;
    clockTicks += `M${r1(ccx + Math.sin(a) * r0)} ${r1(ccy - Math.cos(a) * r0)}L${r1(ccx + Math.sin(a) * (R - 2))} ${r1(ccy - Math.cos(a) * (R - 2))}`;
  }
  const tr = R - 17;
  const notNow = Array(4).fill('NOT NOW').join(' · ');
  const hand = (cls, angle, len, width, color, tail = 10) =>
    `<g class="${cls}" style="transform:rotate(${angle}deg)"><path d="M${ccx} ${ccy + tail}V${ccy - len}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/></g>`;
  const maxWd = Math.max(1, ...n.weekdays);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const bars = order
    .map((wd, i) => {
      const v = n.weekdays[wd] / maxWd;
      const h = r1(3 + 24 * v);
      const x = 912 + i * 26;
      const peakBar = wd === n.peakDay;
      return `<rect class="wd" style="animation-delay:${(1.2 + i * 0.06).toFixed(2)}s" x="${x}" y="${r1(350 - h)}" width="16" height="${h}" rx="2" fill="${peakBar ? c.accent : c.muted}" opacity="${peakBar ? 1 : 0.45}"/>
<text x="${x + 8}" y="364" text-anchor="middle" font-family="${MONO}" font-size="9" fill="${peakBar ? c.accent : c.muted}">${'SMTWTFS'[wd]}</text>`;
    })
    .join('');

  // Odometers.
  const stats = [
    ['HYPERFOCUS RECORD', n.streak, 'days in a row'],
    ['OUTPUT', n.total, 'contributions · 12 mo'],
    ['SHOWED UP', n.active, 'active days'],
    ['DOPAMINE HITS', n.stars, 'stars earned'],
    ['NOTICED BY', n.followers, 'followers'],
    ['STILL HERE', n.years, 'years on GitHub'],
  ];
  const odoClips = [];
  const odoSvg = stats
    .map(([label, value, unit], i) => {
      const x = 52 + (i % 3) * 192;
      const y = 444 + Math.floor(i / 3) * 96;
      const o = odometer(value, x, y + 12, i, 0.9 + i * 0.12, c, 172);
      odoClips.push(o.clip);
      return `<g class="cellIn" style="animation-delay:${(0.7 + i * 0.08).toFixed(2)}s"><text x="${x}" y="${y}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="1.4" fill="${c.accent}">${label}</text>
${o.svg}
<text x="${x}" y="${y + 64}" font-family="${UI}" font-size="11.5" fill="${c.muted}">${escapeXml(unit)}</text></g>`;
    })
    .join('');

  // Dopamine by source: languages, like a battery-usage screen.
  let langs = (profile.languages || []).slice(0, 5);
  const langRest = 1 - langs.reduce((s, l) => s + l.share, 0);
  if (langs.length && langRest > 0.01 && langs.length < 5) langs = [...langs, { name: 'Other', share: langRest }];
  const maxShare = Math.max(0.01, ...langs.map((l) => l.share));
  const langSvg = langs.length
    ? langs
        .map((l, i) => {
          const y = 452 + i * 33;
          const color = l.name === 'Other' ? c.muted : langColor(l.name);
          const bw = r1(Math.max(4, (l.share / maxShare) * 250));
          return `<g class="cellIn" style="animation-delay:${(1 + i * 0.1).toFixed(2)}s">
<circle cx="680" cy="${y}" r="9" fill="${color}"/><circle cx="680" cy="${y}" r="9" fill="none" stroke="#fff" stroke-opacity=".18"/>
<text x="698" y="${y + 4.5}" font-family="${UI}" font-size="13" fill="${c.fg}">${escapeXml(trunc(l.name, 16))}</text>
<rect x="842" y="${y - 4}" width="250" height="8" rx="4" fill="${c.track}"/>
<rect class="bar" style="animation-delay:${(1.1 + i * 0.1).toFixed(2)}s" x="842" y="${y - 4}" width="${bw}" height="8" rx="4" fill="${color}"/>
<text x="1148" y="${y + 4.5}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${c.fg}">${Math.round(l.share * 100)}%</text></g>`;
        })
        .join('')
    : `<text x="672" y="458" font-family="${MONO}" font-size="11" letter-spacing="1" fill="${c.muted}">NO LANGUAGES YET</text>`;

  // Reminder toast, sliding in over everything.
  const toast = `<g class="toast"><g transform="translate(${W - 284} 54)"><rect width="262" height="66" rx="14" fill="${c.toolbar}"/>${card(c, 262, 66, 14)}${appIcon(13, 14, 26, P.orange, 'bell')}
<text x="50" y="24" font-family="${UI}" font-size="10.5" letter-spacing="0.6" fill="${c.cardMuted}">REMINDER</text>
<text x="250" y="24" text-anchor="end" font-family="${UI}" font-size="10.5" fill="${c.cardMuted}">now</text>
<text x="50" y="42" font-family="${UI}" font-size="13" font-weight="600" fill="${c.cardText}">Drink some water</text>
<text x="50" y="58" font-family="${UI}" font-size="12" fill="${c.cardMuted}">Snoozed 6 times</text></g></g>`;

  const css = `
.tabA{animation:fade .5s ease-out both}
.tab{animation:tab .35s ${EXPO} both}
.panelIn{animation:rise .7s ${EXPO} both}
.sweep{transform-box:fill-box;transform-origin:left center;animation:grow ${SWEEP}s linear ${SWEEP0}s both}
.ph{animation:ph ${SWEEP}s linear ${SWEEP0}s both}
.epi{animation:pop .5s ${BACK} both;transform-box:fill-box;transform-origin:center bottom}
.hh{transform-origin:${ccx}px ${ccy}px;animation:hh 2.8s ${EXPO} .6s both}
.mh{transform-origin:${ccx}px ${ccy}px;animation:mh 2.8s ${EXPO} .6s both}
.wd{transform-box:fill-box;transform-origin:center bottom;animation:growY .6s ${EXPO} both}
.cellIn{animation:rise .6s ${EXPO} both}
.roll{animation:roll 2.4s ${EXPO} both}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow 1.1s ${EXPO} both}
.toast{animation:slide .8s ${EXPO} 3.9s both}
.live{animation:live 1.6s ease-in-out infinite}
@keyframes fade{from{opacity:0}}
@keyframes tab{from{opacity:0;transform:translateX(-18px)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes growY{from{transform:scaleY(0)}}
@keyframes ph{from{transform:translateX(-${pw}px)}}
@keyframes pop{from{opacity:0;transform:scale(.5)}}
@keyframes hh{from{transform:rotate(-1088deg)}}
@keyframes mh{from{transform:rotate(-2146deg)}}
@keyframes roll{from{transform:translateY(0)}}
@keyframes slide{from{opacity:0;transform:translateX(300px)}}
@keyframes live{50%{opacity:.25}}
${REDUCED}`;

  const aria =
    `Signal: a browser window with too many tabs open. The last 365 days as a seismograph: ${fmt(n.total)} contributions on ${fmt(n.active)} active days` +
    (n.episodes.length ? `, with ${n.episodes.length} hyperfocus episodes marked (the biggest: ${n.episodes[0].length} days, ${fmt(n.episodes[0].sum)} contributions)` : '') +
    `. Longest streak ${n.streak} days, ${fmt(n.stars)} stars, ${fmt(n.followers)} followers, ${n.years} years on GitHub.` +
    (n.peakDayName ? ` Busiest weekday: ${n.peakDayName}.` : '');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="win"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <clipPath id="plotClip"><rect x="${px0}" y="${py0}" width="${pw}" height="${py1 - py0}"/></clipPath>
  <clipPath id="sweepClip"><rect class="sweep" x="${px0 - 2}" y="${py0 - 4}" width="${pw + 4}" height="${py1 - py0 + 8}"/></clipPath>
  <path id="ring" d="M${ccx} ${ccy - tr}a${tr} ${tr} 0 1 1 0 ${tr * 2}a${tr} ${tr} 0 1 1 0 -${tr * 2}"/>
  <radialGradient id="bezel" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.bezelA}"/><stop offset="1" stop-color="${c.bezelB}"/></radialGradient>
  <linearGradient id="wheelShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>
  <g id="dstrip" font-family="${MONO}" font-size="22" font-weight="700" text-anchor="middle">${Array.from({ length: 30 }, (_, k) => `<text y="${k * 34}">${k % 10}</text>`).join('')}</g>
  ${odoClips.join('')}
  ${grainPattern(c, `s${profile.login}`)}
</defs>
<g clip-path="url(#win)">
  <rect width="${W}" height="${H}" fill="${c.strip}"/>
  <g fill="none"><circle cx="24" cy="25" r="6" fill="#ff5f57"/><circle cx="44" cy="25" r="6" fill="#febc2e"/><circle cx="64" cy="25" r="6" fill="#28c840"/></g>
  ${tabSvg}
  ${toolbar}
  <rect y="90" width="${W}" height="${H - 90}" fill="${c.view}"/>
  <path d="M0 90.5H${W}" stroke="${c.panelEdge}"/>

  <g class="panelIn" style="animation-delay:.25s">
    ${panel(28, 112, 780, 268)}
    ${title(52, 140, 'SIGNAL', 'last 365 days')}
    <g class="live"><circle cx="${px1 - 150}" cy="136" r="4" fill="${c.rec}"/></g>
    <text x="${px1 - 140}" y="140" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${c.muted}">LIVE</text>
    <text x="${px1}" y="140" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${c.accent}">▮ HYPERFOCUS</text>
    <rect x="${px0}" y="${py0}" width="${pw}" height="${py1 - py0}" fill="${c.plot}"/>
    <path d="${grid}" stroke="${c.gridMinor}" stroke-width="1"/>
    <path d="${gridMajor}" stroke="${c.gridMajor}" stroke-width="1"/>
    <path d="M${px0} ${mid}H${px1}" stroke="${c.gridMajor}" stroke-width="1"/>
    ${monthLabels}
  </g>
  <g clip-path="url(#plotClip)">
    ${episodeBands}
    <g clip-path="url(#sweepClip)">
      <path d="${trace}" fill="none" stroke="${c.trace}" stroke-width="4" stroke-opacity=".16" stroke-linejoin="round"/>
      <path d="${trace}" fill="none" stroke="${c.trace}" stroke-width="1.25" stroke-linejoin="round"/>
    </g>
    <g class="ph"><path d="M${px1} ${py0}V${py1}" stroke="${c.accent}" stroke-width="1.5"/><circle cx="${px1}" cy="${mid}" r="3.5" fill="${c.accent}"/></g>
  </g>
  ${episodes}
  ${quiet}

  <g class="panelIn" style="animation-delay:.35s">
    ${panel(828, 112, 344, 268)}
    ${title(852, 140, 'TIME', 'as experienced')}
    <circle cx="${ccx}" cy="${ccy}" r="${R + 9}" fill="url(#bezel)"/>
    <circle cx="${ccx}" cy="${ccy}" r="${R}" fill="${c.face}"/>
    <path d="${arc(R - 1, -wedge, wedge)}" fill="${c.accent}"/>
    <path d="${clockTicks}" stroke="${c.faceText}" stroke-width="1.2"/>
    <text x="${ccx}" y="${ccy - tr + 4}" text-anchor="middle" font-family="${MONO}" font-size="10.5" font-weight="700" letter-spacing="1.5" fill="#fff">NOW</text>
    <text font-family="${MONO}" font-size="8.5" letter-spacing="1.3" fill="${c.faceText}"><textPath xlink:href="#ring" startOffset="${r1(((wedge + 6) / 360) * TAU * tr)}">${notNow}</textPath></text>
    ${hand('hh', -10, R * 0.46, 5, c.fg)}
    ${hand('mh', 12, R * 0.66, 3, c.fg)}
    <circle cx="${ccx}" cy="${ccy}" r="5" fill="${c.accent}"/><circle cx="${ccx}" cy="${ccy}" r="2" fill="${c.face}"/>
    ${bars}
    ${n.peakDayName ? `<text x="1148" y="342" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1" fill="${c.muted}">PEAK</text><text x="1148" y="356" text-anchor="end" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="1" fill="${c.accent}">${n.peakDayName}</text>` : ''}
  </g>

  <g class="panelIn" style="animation-delay:.45s">
    ${panel(28, 400, 600, 236)}
    ${title(52, 428, 'COUNTERS', '')}
  </g>
  ${odoSvg}

  <g class="panelIn" style="animation-delay:.55s">
    ${panel(648, 400, 524, 236)}
    ${title(672, 428, 'DOPAMINE BY SOURCE', 'language share')}
  </g>
  ${langSvg}

  <rect width="${W}" height="${H}" fill="url(#grain)" opacity="${c.grainOp * 0.6}"/>
  ${toast}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.panelEdge}"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. End card — the slate
// ---------------------------------------------------------------------------

export function slateSvg(profile, themeName, { signoff, postscript }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 260;
  const n = adhdNumbers(profile);
  const sx = 96;
  const sw = 330;
  const by = 92;
  const bh = 146;
  const hinge = [sx + 6, by - 2];

  // Clapstick stripes.
  const stripes = (y, h, offset) => {
    let s = '';
    for (let x = -40 + offset; x < sw + 40; x += 44) s += `<path d="M${sx + x} ${y + h}L${sx + x + 22} ${y}H${sx + x + 44}L${sx + x + 22} ${y + h}Z" fill="#f4f1ea"/>`;
    return s;
  };
  const chalk = (x, y, text, size = 18, anchor = 'start') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${HAND}" font-size="${size}" fill="${P.chalk}">${escapeXml(text)}</text>`;
  const label = (x, y, text) => `<text x="${x}" y="${y}" font-family="${MONO}" font-size="8.5" letter-spacing="1.4" fill="${P.chalk}" opacity=".6">${text}</text>`;
  const date = new Date();
  const dateText = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  const big = String(signoff).toUpperCase();
  const blen = Math.max(1, [...big].length);
  const bs = Math.round(Math.max(30, Math.min(64, 640 / (blen * 0.5))));
  const bw = r1(Math.min(640, blen * bs * 0.5));
  const tx = 500;
  const ps = wrap(postscript, 60, 1)[0] || '';
  const psW = r1(ps.length * 16 * 0.6);

  const css = `
.fob{animation:fob .8s ease-out both}
.raise{animation:raise .7s ${EXPO} .15s both}
.clap{transform-origin:${hinge[0]}px ${hinge[1]}px;animation:clap 1.3s linear .25s both}
.impact{transform-box:fill-box;transform-origin:left bottom;animation:impact .5s ease-out 1.02s}
.cut{animation:fade .3s ease-out 1.05s both}
.ca{animation:ca 1s ${EXPO} 1.1s both}
.cb{animation:cb 1s ${EXPO} 1.1s both}
.main{animation:fade .5s ease-out 1.5s both}
.type{transform-box:fill-box;transform-origin:left center;animation:type ${Math.min(1.4, Math.max(0.3, ps.length * 0.03)).toFixed(2)}s steps(${Math.max(1, ps.length)}) 1.9s both}
@keyframes fade{from{opacity:0}}
@keyframes fob{from{opacity:1}}
@keyframes raise{from{opacity:0;transform:translateY(60px) rotate(4deg)}}
@keyframes clap{0%{transform:rotate(-30deg)}50%{transform:rotate(-30deg);animation-timing-function:${GRAVITY}}64%{transform:rotate(0)}74%{transform:rotate(-4deg)}84%{transform:rotate(0)}}
@keyframes impact{0%{opacity:1;transform:scale(.4)}}
@keyframes ca{from{transform:translateX(-34px);opacity:0}}
@keyframes cb{from{transform:translateX(34px);opacity:0}}
@keyframes type{from{transform:scaleX(0)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`A film slate snaps shut: that's a wrap. ${signoff} ${postscript}`)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <radialGradient id="lift" cx="600" cy="130" r="640" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 130) scale(1 .5) translate(-600 -130)"><stop offset="0" stop-color="${c.lift}"/><stop offset="1" stop-color="${c.bg}"/></radialGradient>
  <clipPath id="stickTop"><rect x="${sx}" y="${by - 34}" width="${sw}" height="26" rx="3"/></clipPath>
  <clipPath id="stickBot"><rect x="${sx}" y="${by - 6}" width="${sw}" height="22" rx="2"/></clipPath>
  <clipPath id="ps"><rect class="type" x="${tx}" y="${172 - 18}" width="${psW + 4}" height="26"/></clipPath>
  <text id="bye" x="${tx}" y="146" textLength="${bw}" lengthAdjust="spacingAndGlyphs" font-family="${COND}" font-weight="800" font-stretch="condensed" font-size="${bs}">${escapeXml(big)}</text>
  ${grainPattern(c, `e${profile.login}`)}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#lift)"/>
  <g class="raise">
    <rect x="${sx + 3}" y="${by + 8}" width="${sw}" height="${bh}" rx="8" fill="${c.shadow}" opacity="${r1(c.shadowOp * 0.6 * 100) / 100}"/>
    <rect x="${sx + 1}" y="${by + 4}" width="${sw}" height="${bh}" rx="7" fill="${c.shadow}" opacity="${r1(c.shadowOp * 0.6 * 100) / 100}"/>
    <rect x="${sx}" y="${by - 6}" width="${sw}" height="${bh + 6}" rx="6" fill="${c.slate}"/>
    <g clip-path="url(#stickBot)"><rect x="${sx}" y="${by - 6}" width="${sw}" height="22" fill="#111"/>${stripes(by - 6, 22, 0)}</g>
    <g fill="none" stroke="${P.chalk}" stroke-opacity=".75" stroke-width="1.5">
      <path d="M${sx + 10} ${by + 54}H${sx + sw - 10}M${sx + 10} ${by + 96}H${sx + sw - 10}M${sx + 10} ${by + 126}H${sx + sw - 10}"/>
      <path d="M${sx + 118} ${by + 54}V${by + 96}M${sx + 222} ${by + 54}V${by + 96}M${sx + 222} ${by + 96}V${by + 126}"/>
    </g>
    ${label(sx + 14, by + 30, 'PROD.')}${chalk(sx + 66, by + 40, `@${trunc(profile.login, 18)}`, 20)}
    ${label(sx + 14, by + 68, 'ROLL')}${chalk(sx + 64, by + 90, String(profile.joinedYear || date.getFullYear()), 18, 'middle')}
    ${label(sx + 126, by + 68, 'SCENE')}${chalk(sx + 170, by + 90, 'README', 16, 'middle')}
    ${label(sx + 230, by + 68, 'TAKE')}${chalk(sx + 276, by + 90, fmt(n.active), 18, 'middle')}
    ${label(sx + 14, by + 110, 'DIRECTOR')}${chalk(sx + 86, by + 120, trunc(profile.name || profile.login, 14), 14)}
    ${label(sx + 230, by + 110, 'CAM')}${chalk(sx + 276, by + 121, 'A', 15, 'middle')}
    ${label(sx + 14, by + 140, 'DATE')}${chalk(sx + 60, by + 142, dateText, 13)}
    ${label(sx + 230, by + 140, 'FPS')}${chalk(sx + 276, by + 142, '24', 13, 'middle')}
    <g class="clap"><g clip-path="url(#stickTop)"><rect x="${sx}" y="${by - 34}" width="${sw}" height="26" fill="#111"/>${stripes(by - 34, 26, 22)}</g>
      <circle cx="${hinge[0]}" cy="${hinge[1] - 8}" r="5" fill="#7d7d7d" stroke="#2a2a2a"/></g>
    <g class="impact" opacity="0" stroke="${c.accent}" stroke-width="2.5" stroke-linecap="round"><path d="M${sx + sw + 10} ${by - 18}l16 -8M${sx + sw + 12} ${by - 6}h18M${sx + sw + 10} ${by + 6}l16 8"/></g>
  </g>
  <g class="cut" font-family="${MONO}" font-size="12" letter-spacing="2.4">
    <rect x="${tx}" y="76" width="10" height="10" fill="${c.rec}"/>
    <text x="${tx + 18}" y="86" fill="${c.muted}"><tspan fill="${c.fg}" font-weight="700">CUT</tspan>  ·  THAT'S A WRAP</text>
  </g>
  <g style="mix-blend-mode:${c.blend}">
    <g transform="translate(-1.5 0)"><use class="ca" xlink:href="#bye" fill="${c.fringeA}" opacity=".9"/></g>
    <g transform="translate(1.5 0)"><use class="cb" xlink:href="#bye" fill="${c.fringeB}" opacity=".9"/></g>
  </g>
  <use class="main" xlink:href="#bye" fill="${c.fg}"/>
  ${ps ? `<text clip-path="url(#ps)" x="${tx}" y="172" textLength="${psW}" lengthAdjust="spacing" font-family="${MONO}" font-size="16" fill="${c.muted}">${escapeXml(ps)}</text>` : ''}
  <text class="main" x="${tx}" y="212" font-family="${MONO}" font-size="11" letter-spacing="2" fill="${c.muted}" opacity=".8">@${escapeXml(profile.login.toUpperCase())}  ·  ${fmt(n.active)} TAKES THIS YEAR</text>
  <rect width="${W}" height="${H}" fill="url(#grain)" opacity="${c.grainOp}"/>
  <rect class="fob" width="${W}" height="${H}" fill="${c.bg}" opacity="0"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.line}" stroke-opacity=".1"/>
</svg>`;
}
