// Fathom — animated SVG artwork: your profile as a dive.
//
// Hero: the camera descends from the surface onto a reef that is your year. There is one coral per
// week, as tall as that week was busy, and one glowing polyp for every active day. Your featured
// repos swim through it as fish, bioluminescent plankton gathers into your name, and a depth gauge
// settles at your depth: one metre per contribution, in the real ocean zone that depth reaches.
// Dive log: the year as a descent through those zones (a bubble for every active day), a
// logbook page, languages as species spotted, and your repos on sonar.
// End card: back at the surface, a diver-down buoy, a message in a bottle and a thank-you.
//
// Same rules as the other animated templates: CSS keyframes only, the un-animated state is the
// final frame, at most two infinite loops per image, no blur filters, system fonts, and
// prefers-reduced-motion stops everything.

import { seededRandom } from '../../lib/random';
import { langColor } from '../adhd/art';
import { escapeXml } from '../pulsar/art';

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const UI = "-apple-system, BlinkMacSystemFont, 'Segoe UI', ui-sans-serif, Helvetica, Arial, sans-serif";
const HAND = "'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Sans MS', 'Marker Felt', cursive";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DIVE = 'cubic-bezier(0.55, 0, 0.15, 1)';
const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';
const TAU = Math.PI * 2;

// The camera reaches the reef at this moment. Everything else in the hero is timed around it.
const ARRIVE = 2.4;

// The two loops each image is allowed. `sway` is a small rotation (kelp, tails, light shafts),
// `drift` a small translation (fish, jellies, marine snow, waves). Bigger swings come from scaling
// the wrapper around the loop, so one keyframe serves every amplitude.
const LOOPS = `@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(7px,-5px)}}`;

export const THEMES = {
  dark: {
    water: ['#1c5c7a', '#0c3550', '#072033', '#04121f', '#020a12'],
    surf: '#c4f1ff',
    surfOp: 0.5,
    sun: '#bfe9ff',
    sunOp: 0.3,
    ray: '#a8ecff',
    rayOp: 0.09,
    snow: '#cdf3ff',
    snowOp: 0.5,
    fg: '#ecfbff',
    muted: '#8fb3c4',
    faint: '#55788a',
    glow: '#5ef2ff',
    glow2: '#7dffc8',
    tips: ['#5ef2ff', '#7dffc8', '#b38cff', '#ff7ad6', '#ffd36b'],
    accent: '#5ef2ff',
    sand: ['#0e2434', '#050d16'],
    sandLine: '#21445a',
    ridge: '#0b2536',
    coral: ['#16394e', '#1b3352', '#212f55', '#12414a', '#1d3c47'],
    coralEdge: '#3fb9d6',
    coralEdgeOp: 0.28,
    caustic: '#9fe9ff',
    causticOp: 0.07,
    nameFill: '#f0fdff',
    pool: '#3fdcff',
    poolOp: 0.16,
    vignette: '#000000',
    vignetteOp: 0.6,
    jelly: { bell: '#9feeff', edge: '#d2f8ff', tent: '#8fe6ff', organ: '#d6a6ff', halo: '#5ef2ff', haloOp: 0.2 },
    bubble: '#d8f6ff',
    zoneBar: ['#8aeaff', '#4fc0e6', '#3a7fd0', '#5a58c8', '#7b3fb8'],
    // Dive log
    panel: ['#082031', '#030c15'],
    band: ['#0f3a52', '#0b2d44', '#082236', '#061829', '#04101d'],
    bandText: ['#cdeefa', '#cdeefa', '#cdeefa', '#cdeefa', '#cdeefa'],
    line: '#5ef2ff',
    card: '#0a1d2b',
    cardOp: 0.92,
    cardEdge: '#1b3a4d',
    cardText: '#e6f7ff',
    cardMuted: '#7fa2b3',
    paper: '#0d2536',
    rule: '#ffffff',
    ruleOp: 0.07,
    margin: '#ff7ad6',
    marginOp: 0.25,
    ink: '#eaf7ff',
    stamp: '#ffb36b',
    track: '#16303f',
    // End card
    sky: ['#050f1b', '#0f2b42'],
    seaTop: '#0f4560',
    seaBot: '#03111d',
    stars: true,
  },
  light: {
    water: ['#f4fffd', '#cdf2f2', '#97dfe5', '#5cc4d2', '#3aa6bf'],
    surf: '#ffffff',
    surfOp: 0.9,
    sun: '#ffffff',
    sunOp: 0.8,
    ray: '#ffffff',
    rayOp: 0.34,
    snow: '#ffffff',
    snowOp: 0.6,
    fg: '#05324a',
    muted: '#265a70',
    faint: '#4f8296',
    glow: '#ffffff',
    glow2: '#fff6c9',
    tips: ['#ffffff', '#fff3b0', '#ffe3f1', '#e2fcff', '#fffbe6'],
    accent: '#0a6a8f',
    sand: ['#f7e6bd', '#e8c88c'],
    sandLine: '#d6b175',
    ridge: '#74c6d0',
    coral: ['#ff8a73', '#ffad5c', '#b28dff', '#ff6fa3', '#3fc29c', '#ffcf5c', '#5aa2ff'],
    coralEdge: '#ffffff',
    coralEdgeOp: 0.35,
    caustic: '#ffffff',
    causticOp: 0.55,
    nameFill: '#05324a',
    pool: '#ffffff',
    poolOp: 0.42,
    vignette: '#13667f',
    vignetteOp: 0.26,
    jelly: { bell: '#ffffff', edge: '#ffffff', tent: '#ffffff', organ: '#ff8fb8', halo: '#ffffff', haloOp: 0.35 },
    bubble: '#ffffff',
    zoneBar: ['#7fdbe6', '#3fb4ca', '#1f86a8', '#1d5f8a', '#173f6b'],
    panel: ['#ecfafa', '#c9eef0'],
    band: ['#d6f4f3', '#a6e0e5', '#6cbfd0', '#4596b2', '#2f6c8f'],
    bandText: ['#05324a', '#05324a', '#ffffff', '#ffffff', '#ffffff'],
    line: '#05324a',
    card: '#ffffff',
    cardOp: 0.9,
    cardEdge: '#c9e4e8',
    cardText: '#0b2a38',
    cardMuted: '#4f7586',
    paper: '#fcf8ee',
    rule: '#8fbad6',
    ruleOp: 0.45,
    margin: '#e88a8a',
    marginOp: 0.6,
    ink: '#1d4b9a',
    stamp: '#c8352d',
    track: '#e2eef0',
    sky: ['#b9e6f1', '#f4fbfb'],
    seaTop: '#7fd6df',
    seaBot: '#2793ae',
    stars: false,
  },
};

// The ocean's real depth zones, in metres. One contribution is one metre down.
export const ZONES = [
  { name: 'Sunlit', from: 0, to: 200 },
  { name: 'Twilight', from: 200, to: 1000 },
  { name: 'Midnight', from: 1000, to: 4000 },
  { name: 'Abyssal', from: 4000, to: 6000 },
  { name: 'Hadal', from: 6000, to: 11000 },
];
const CHALLENGER = 10935; // the deepest known point in the ocean
export const zoneOf = (m) => [...ZONES].reverse().find((z) => m >= z.from) || ZONES[0];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const trunc = (s, n) => {
  const str = String(s ?? '');
  return str.length > n ? `${str.slice(0, Math.max(1, n - 1)).trimEnd()}…` : str;
};
const plural = (v, one, many = `${one}s`) => `${fmt(v)} ${v === 1 ? one : many}`;
const short = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));
const dayMonth = (iso) => (iso ? `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}` : '');
const monthYear = (iso) => (iso ? `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : '');

// Rounds every number interpolated into a path, so the markup stays small.
const pth = (strings, ...vals) =>
  strings.reduce((s, str, i) => s + str + (i < vals.length ? (typeof vals[i] === 'number' ? r1(vals[i]) : vals[i]) : ''), '');

const pthi = (strings, ...vals) =>
  strings.reduce((s, str, i) => s + str + (i < vals.length ? (typeof vals[i] === 'number' ? Math.round(vals[i]) : vals[i]) : ''), '');

// One line if it fits, otherwise two lines split at the space nearest the middle.
function balance(text, maxChars) {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length <= maxChars) return t ? [t] : [];
  let cut = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === ' ' && (cut < 0 || Math.abs(i - t.length / 2) < Math.abs(cut - t.length / 2))) cut = i;
  }
  return cut < 0 ? [trunc(t, maxChars)] : [trunc(t.slice(0, cut), maxChars), trunc(t.slice(cut + 1), maxChars)];
}

// --- Colour ----------------------------------------------------------------

function rgb(color) {
  const s = String(color);
  if (s[0] === '#') {
    const h = s.length === 4 ? [...s.slice(1)].map((x) => x + x).join('') : s.slice(1, 7);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const m = s.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [128, 128, 128];
  const [h, sat, l] = [Number(m[1]) / 360, Number(m[2]) / 100, Number(m[3]) / 100];
  const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
  const p = 2 * l - q;
  const ch = (t) => {
    const u = (t + 1) % 1;
    if (u < 1 / 6) return p + (q - p) * 6 * u;
    if (u < 1 / 2) return q;
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
    return p;
  };
  return [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)].map((v) => v * 255);
}
const hex = (c) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => {
  const A = rgb(a);
  const B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
};

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Everything the artwork reads from the profile. Depth is the last 12 months of contributions in
 * metres; the descent is that total building up day by day; the reef is the same days in weeks.
 */
export function fathomNumbers(profile) {
  const days = (profile.contributions?.days || []).slice(-365);
  let streak = 0;
  let run = 0;
  let idle = 0;
  let rest = { length: 0, end: -1 };
  let cum = 0;
  const depthAt = [];
  days.forEach((d, i) => {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
    idle = d.count > 0 ? 0 : idle + 1;
    if (idle > rest.length) rest = { length: idle, end: i };
    cum += d.count;
    depthAt.push(cum);
  });

  // 52 weeks ending today; the oldest one takes any extra day.
  const weeks = Array.from({ length: 52 }, (_, w) => {
    const end = Math.max(0, days.length - (51 - w) * 7);
    const slice = days.slice(w === 0 ? 0 : Math.max(0, end - 7), end);
    return { sum: slice.reduce((s, d) => s + d.count, 0), active: slice.filter((d) => d.count > 0).length, start: slice[0]?.date || '' };
  });
  const peakWeek = weeks.reduce((best, w, i) => (w.sum > weeks[best].sum ? i : best), 0);
  let peak = -1;
  days.forEach((d, i) => {
    if (d.count > 0 && (peak < 0 || d.count > days[peak].count)) peak = i;
  });

  const total = profile.contributions?.total ?? cum;
  const crossings = ZONES.slice(1)
    .map((zone) => {
      const index = depthAt.findIndex((v) => v >= zone.from);
      return index >= 0 ? { zone, index, date: days[index].date } : null;
    })
    .filter(Boolean);
  const thisYear = new Date().getFullYear();
  return {
    days,
    depthAt,
    depth: total,
    zone: zoneOf(total),
    active: days.filter((d) => d.count > 0).length,
    streak,
    rest: rest.length ? { length: rest.length, start: rest.end - rest.length + 1, end: rest.end, surface: depthAt[rest.end] === 0 } : null,
    weeks,
    peakWeek: weeks[peakWeek].sum > 0 ? peakWeek : -1,
    peak: peak >= 0 ? { index: peak, ...days[peak] } : null,
    crossings,
    years: Math.max(1, thisYear - (profile.joinedYear || thisYear)),
    stars: profile.totalStars ?? (profile.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
    followers: profile.followers || 0,
  };
}

// Named after you, and after the kind of place your depth would be: reefs are shallow, walls
// drop away, the deep is dark, and trenches are the very bottom.
const SITE_KIND = { Sunlit: 'Reef', Twilight: 'Wall', Midnight: 'Deep', Abyssal: 'Deep', Hadal: 'Trench' };
export function defaultSite(profile) {
  const words = String(profile.name || '').trim().split(/\s+/).filter(Boolean);
  const last = words.length ? words[words.length - 1] : profile.login;
  const raw = last.length > 14 && last.includes('-') ? last.split('-').filter(Boolean).pop() : last;
  const base = raw.charAt(0).toUpperCase() + raw.slice(1);
  return `${trunc(base, 16)} ${SITE_KIND[fathomNumbers(profile).zone.name]}`;
}

// Field-guide names for the languages, for the species list.
const SPECIES = {
  Rust: 'Oxidus ferrugineus', TypeScript: 'Scriptor typicus', JavaScript: 'Scriptor vulgaris',
  Go: 'Gopherus velox', C: 'Pointerus primus', 'C++': 'Pointerus plusplus', 'C#': 'Acutus sharpii',
  Python: 'Serpens indentata', Shell: 'Concha bashii', MDX: 'Notula jsxensis', Java: 'Coffea verbosa',
  Ruby: 'Gemma rubra', PHP: 'Elephas hypertextus', Swift: 'Apus celer', Kotlin: 'Insula kotlinensis',
  HTML: 'Tagus hypertextus', CSS: 'Cascadia stylosa', SCSS: 'Cascadia sassii', Dart: 'Sagitta dartensis',
  Vue: 'Vista reactiva', Svelte: 'Gracilis compilata', Lua: 'Luna parva', Haskell: 'Lambda pura',
  Elixir: 'Potio aeterna', Zig: 'Zigzag minimus', Scala: 'Scala gradiens', 'Jupyter Notebook': 'Iovis notatio',
  Nix: 'Nix reproducibilis', Clojure: 'Parenthesis infinita', R: 'Statistica rerum', Julia: 'Iulia numerica',
  OCaml: 'Camelus typicus', Perl: 'Margarita regexis', Dockerfile: 'Continens balaenae', Elm: 'Ulmus functionalis',
  Solidity: 'Catena solida', Astro: 'Astrum insulare', HCL: 'Terra formata', 'Objective-C': 'Nuntius bracketus',
};
const speciesName = (lang) => SPECIES[lang] || `${String(lang).replace(/[^A-Za-z]/g, '') || 'Codex'}us communis`;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

// Caustics: the bright net that sunlight draws through moving water. A jittered grid joined by
// bowed strands, with a few strands dropped so the cells come out irregular, as real ones do.
function causticNet(rand, x0, y0, w, h, cell) {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const p = Array.from({ length: rows + 1 }, (_, j) =>
    Array.from({ length: cols + 1 }, (_, i) => [x0 + i * cell + (rand() - 0.5) * cell * 0.7, y0 + j * cell + (rand() - 0.5) * cell * 0.7])
  );
  const q = Math.round;
  let out = '';
  const strand = (a, b) => {
    if (rand() < 0.14) return;
    const mx = (a[0] + b[0]) / 2 + (rand() - 0.5) * cell * 0.5;
    const my = (a[1] + b[1]) / 2 + (rand() - 0.5) * cell * 0.5;
    out += `M${q(a[0])} ${q(a[1])}Q${q(mx)} ${q(my)} ${q(b[0])} ${q(b[1])}`;
  };
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      if (i < cols) strand(p[j][i], p[j][i + 1]);
      if (j < rows) strand(p[j][i], p[j + 1][i]);
    }
  }
  return out;
}

// A loop with its amplitude scaled: the wrapper stretches the motion, the inner group undoes the
// stretch on the artwork, so only the movement grows.
function loop(name, { dur, delay = 0, kx = 1, ky = 1, origin = '0px 0px', reverse = false }, inner) {
  const style = `animation-duration:${dur}s;animation-delay:-${r1(delay)}s;transform-origin:${origin}${reverse ? ';animation-direction:reverse' : ''}`;
  const g = `<g class="${name}" style="${style}">${kx !== 1 || ky !== 1 ? `<g transform="scale(${r1(1 / kx * 100) / 100} ${r1(1 / ky * 100) / 100})">${inner}</g>` : inner}</g>`;
  return kx !== 1 || ky !== 1 ? `<g transform="scale(${kx} ${ky})">${g}</g>` : g;
}

// --- Creatures ---------------------------------------------------------------

// Four body plans, so a shoal never looks cloned: a tang, a slender lanternfish, an angelfish
// and a wrasse. Drawn facing right with the centre of the body at the origin.
const FISH = [
  { h: 0.58, tail: 'fork', fin: 'tall', stripes: [0.24, -0.04] },
  { h: 0.34, tail: 'fork', fin: 'low', stripes: [] },
  { h: 0.86, tail: 'fan', fin: 'sail', stripes: [0.26, 0.06, -0.14] },
  { h: 0.62, tail: 'round', fin: 'low', stripes: [0.12] },
];

function fishSvg(c, dark, { L, color, kind, uid }) {
  const k = FISH[kind % FISH.length];
  const hh = (L * k.h) / 2;
  const a = L * 0.5;
  const b = -L * 0.3;
  const body = pth`M${a} 0C${0.46 * L} ${-0.8 * hh} ${0.22 * L} ${-hh} ${0.05 * L} ${-hh}C${-0.14 * L} ${-hh} ${-0.24 * L} ${-0.42 * hh} ${b} ${-0.22 * hh}L${b} ${0.22 * hh}C${-0.24 * L} ${0.42 * hh} ${-0.14 * L} ${hh} ${0.05 * L} ${hh}C${0.22 * L} ${hh} ${0.46 * L} ${0.8 * hh} ${a} 0Z`;
  const tail = {
    fork: pth`M${b + 3} ${-0.16 * hh}L${b - 0.21 * L} ${-0.98 * hh}Q${b - 0.1 * L} 0 ${b - 0.21 * L} ${0.98 * hh}L${b + 3} ${0.16 * hh}Z`,
    fan: pth`M${b + 3} ${-0.2 * hh}Q${b - 0.1 * L} ${-0.9 * hh} ${b - 0.22 * L} ${-0.72 * hh}Q${b - 0.27 * L} 0 ${b - 0.22 * L} ${0.72 * hh}Q${b - 0.1 * L} ${0.9 * hh} ${b + 3} ${0.2 * hh}Z`,
    round: pth`M${b + 3} ${-0.24 * hh}Q${b - 0.2 * L} ${-0.8 * hh} ${b - 0.18 * L} 0Q${b - 0.2 * L} ${0.8 * hh} ${b + 3} ${0.24 * hh}Z`,
  }[k.tail];
  const fin = {
    tall: pth`M${-0.2 * L} ${-0.9 * hh}Q${-0.04 * L} ${-1.75 * hh} ${0.16 * L} ${-0.97 * hh}Z`,
    low: pth`M${-0.18 * L} ${-0.78 * hh}Q${-0.02 * L} ${-1.32 * hh} ${0.12 * L} ${-0.98 * hh}Z`,
    sail:
      pth`M${0.12 * L} ${-0.98 * hh}Q${-0.08 * L} ${-1.95 * hh} ${-0.5 * L} ${-1.75 * hh}Q${-0.3 * L} ${-1.1 * hh} ${-0.25 * L} ${-0.45 * hh}Z` +
      pth`M${0.08 * L} ${0.98 * hh}Q${-0.1 * L} ${1.7 * hh} ${-0.44 * L} ${1.5 * hh}Q${-0.28 * L} ${hh} ${-0.24 * L} ${0.45 * hh}Z`,
  }[k.fin];

  const ink = '#0a1b28';
  const top = dark ? mix(color, ink, 0.74) : mix(color, '#0a2a3a', 0.38);
  const mid = dark ? mix(color, ink, 0.5) : color;
  const belly = dark ? mix(color, ink, 0.3) : mix(color, '#ffffff', 0.62);
  const finFill = dark ? mix(color, ink, 0.45) : mix(color, '#ffffff', 0.28);
  const er = Math.max(2.3, L * 0.052);
  const ex = 0.3 * L;
  const ey = -0.14 * hh;

  const stripes = k.stripes
    .map((s) => `<rect x="${r1(s * L - L * 0.035)}" y="${r1(-hh)}" width="${r1(L * 0.07)}" height="${r1(hh * 2)}" fill="${dark ? color : '#ffffff'}" opacity="${dark ? 0.32 : 0.78}"/>`)
    .join('');
  // Lanternfish-style photophores: in the dark, every fish carries its own lights.
  const lights = dark
    ? Array.from({ length: 7 }, (_, i) => {
        const x = -0.22 * L + (i / 6) * 0.54 * L;
        const y = 0.66 * hh * Math.max(0.2, 1 - ((x - 0.05 * L) / (0.48 * L)) ** 2);
        return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(L * 0.03)}" fill="${color}" opacity=".35"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(Math.max(0.9, L * 0.012))}" fill="${mix(color, '#ffffff', 0.5)}"/>`;
      }).join('')
    : '';

  const svg = `<defs><linearGradient id="fb${uid}" x1="0" y1="${r1(-hh)}" x2="0" y2="${r1(hh)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${belly}"/></linearGradient><clipPath id="fc${uid}"><path d="${body}"/></clipPath></defs>
<path d="${fin}" fill="${finFill}" opacity=".85"${dark ? ` stroke="${color}" stroke-opacity=".35"` : ''}/>
<g transform="translate(${r1(b)} 0) scale(1 5)"><g class="sway" style="animation-duration:.85s;animation-delay:-${r1(uid * 0.3)}s"><g transform="scale(1 .2) translate(${r1(-b)} 0)"><path d="${tail}" fill="${finFill}" opacity=".9"${dark ? ` stroke="${color}" stroke-opacity=".4"` : ''}/></g></g></g>
<path d="${body}" fill="url(#fb${uid})"${dark ? ` stroke="${color}" stroke-opacity=".6" stroke-width="1.1"` : ''}/>
<g clip-path="url(#fc${uid})">${stripes}<path d="${pth`M${0.24 * L} ${-0.62 * hh}Q${0.16 * L} 0 ${0.24 * L} ${0.62 * hh}`}" fill="none" stroke="${dark ? color : top}" stroke-opacity=".45" stroke-width="1.2"/></g>
${lights}
<ellipse cx="${r1(0.1 * L)}" cy="${r1(0.3 * hh)}" rx="${r1(L * 0.11)}" ry="${r1(Math.max(2, hh * 0.16))}" transform="rotate(-24 ${r1(0.1 * L)} ${r1(0.3 * hh)})" fill="${finFill}" opacity=".8"/>
<circle cx="${r1(ex)}" cy="${r1(ey)}" r="${r1(er)}" fill="${dark ? mix(color, '#ffffff', 0.4) : '#ffffff'}"/>
<circle cx="${r1(ex + er * 0.12)}" cy="${r1(ey)}" r="${r1(er * 0.62)}" fill="#071520"/>
<circle cx="${r1(ex + er * 0.3)}" cy="${r1(ey - er * 0.3)}" r="${r1(er * 0.22)}" fill="#ffffff"/>`;
  return { svg, below: k.fin === 'sail' ? hh * 1.6 : hh };
}

// A small fish for the species list.
function fishGlyph(color, x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M12 0C10 -5 4 -6.5 -1 -6C-5 -5.5 -7 -2.4 -8 -1.2L-13 -5.5Q-11 0 -13 5.5L-8 1.2C-7 2.4 -5 5.5 -1 6C4 6.5 10 5 12 0Z" fill="${color}"/><circle cx="7" cy="-1" r="1.3" fill="#071520"/></g>`;
}

function jellySvg(c, dark, { r, uid, rand }) {
  const j = c.jelly;
  let rim = '';
  for (let i = 0; i < 6; i++) {
    const x0 = r - (2 * r * i) / 6;
    const x1 = r - (2 * r * (i + 1)) / 6;
    rim += pth`Q${(x0 + x1) / 2} ${r * 0.2} ${x1} 0`;
  }
  const bell = pth`M${-r} 0C${-r} ${-r * 1.36} ${r} ${-r * 1.36} ${r} 0` + `${rim}Z`;
  const tentacles = Array.from({ length: 7 }, (_, i) => {
    const x = -r * 0.82 + ((1.64 * r) / 6) * i;
    const len = r * (2.4 + rand() * 1.7);
    const w = r * (0.18 + rand() * 0.2);
    return pth`M${x} ${r * 0.12}C${x + w} ${len * 0.33} ${x - w} ${len * 0.66} ${x + w * 0.6} ${len}`;
  }).join('');
  const arms = [-0.25, 0.05, 0.3]
    .map((o, i) => {
      const x = o * r;
      const len = r * (1.5 + i * 0.25);
      return pth`M${x} ${r * 0.1}C${x + r * 0.28} ${len * 0.35} ${x - r * 0.28} ${len * 0.7} ${x + r * 0.1} ${len}`;
    })
    .join('');
  const organs = [
    [-0.36, -0.42],
    [0.36, -0.42],
    [-0.14, -0.66],
    [0.14, -0.66],
  ]
    .map(([ox, oy]) => `<circle cx="${r1(ox * r)}" cy="${r1(oy * r)}" r="${r1(r * 0.15)}" fill="none" stroke="${j.organ}" stroke-width="${r1(Math.max(1.2, r * 0.07))}" opacity=".7"/>`)
    .join('');
  return `<defs><radialGradient id="jb${uid}" cx="0" cy="${r1(-r * 0.7)}" r="${r1(r * 1.3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${j.edge}" stop-opacity="${dark ? 0.62 : 0.85}"/><stop offset="1" stop-color="${j.bell}" stop-opacity="${dark ? 0.14 : 0.34}"/></radialGradient></defs>
<circle cy="${r1(-r * 0.3)}" r="${r1(r * 2.7)}" fill="url(#halo)" opacity="${j.haloOp * 3}"/>
<g transform="scale(2.6 1)">${loop('sway', { dur: 3.4, delay: uid * 1.3, kx: 1 }, `<g transform="scale(.385 1)"><path d="${tentacles}" fill="none" stroke="${j.tent}" stroke-opacity="${dark ? 0.5 : 0.75}" stroke-width="1" stroke-linecap="round"/><path d="${arms}" fill="none" stroke="${j.edge}" stroke-opacity="${dark ? 0.42 : 0.7}" stroke-width="${r1(Math.max(2, r * 0.13))}" stroke-linecap="round"/></g>`)}</g>
<path d="${bell}" fill="url(#jb${uid})" stroke="${j.edge}" stroke-opacity="${dark ? 0.75 : 0.95}" stroke-width="1.2"/>
${organs}
<path d="${pth`M${-r * 0.62} ${-r * 0.62}Q${-r * 0.3} ${-r * 0.98} ${r * 0.1} ${-r * 0.98}`}" fill="none" stroke="#ffffff" stroke-opacity="${dark ? 0.45 : 0.9}" stroke-width="1.6" stroke-linecap="round"/>`;
}

// --- Reef ----------------------------------------------------------------------
// Each coral is drawn with its base at the origin, growing up, and reports where polyps can sit.

function branching(h, rand, col, maxDepth = 3) {
  const levels = [[], [], [], [], []];
  const tips = [];
  const grow = (x, y, ang, len, depth) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const bend = (rand() - 0.5) * len * 0.35;
    const mx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * bend;
    const my = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * bend;
    levels[depth].push(pthi`M${x} ${y}Q${mx} ${my} ${x2} ${y2}`);
    if (depth >= maxDepth || len < 5) {
      tips.push([x2, y2]);
      return;
    }
    const kids = rand() < 0.3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = kids === 2 ? (k ? 1 : -1) * (0.3 + rand() * 0.32) : (k - 1) * (0.48 + rand() * 0.2);
      grow(x2, y2, ang + spread, len * (0.68 + rand() * 0.12), depth + 1);
    }
  };
  grow(0, 0, -Math.PI / 2 + (rand() - 0.5) * 0.3, h * 0.37, 0);
  const w0 = Math.max(4, Math.min(9, h * 0.075));
  const svg = `<g fill="none" stroke="${col}" stroke-linecap="round">${levels
    .map((l, i) => (l.length ? `<path d="${l.join('')}" stroke-width="${r1(w0 * 0.7 ** i)}"/>` : ''))
    .join('')}</g>`;
  return { svg, tips };
}

function fan(h, rand, col) {
  const rays = 9 + Math.floor(rand() * 4);
  const spread = 1.05 + rand() * 0.3;
  const lean = (rand() - 0.5) * 0.3;
  const ends = [];
  let lines = '';
  for (let i = 0; i < rays; i++) {
    const a = -Math.PI / 2 + lean + (i / (rays - 1) - 0.5) * spread;
    const len = h * (0.86 + rand() * 0.14);
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len;
    ends.push([ex, ey, a, len]);
    lines += pthi`M0 0Q${Math.cos(a - lean * 0.5) * len * 0.5} ${Math.sin(a) * len * 0.55} ${ex} ${ey}`;
  }
  const mesh = [0.42, 0.66, 0.86]
    .map((t) => `M${ends.map(([, , a, len]) => `${Math.round(Math.cos(a) * len * t)} ${Math.round(Math.sin(a) * len * t)}`).join('L')}`)
    .join('');
  const outline = `M0 0L${ends.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L')}Z`;
  const svg = `<path d="${outline}" fill="${col}" opacity=".24"/><path d="${lines}${mesh}" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 0L${r1(ends[Math.floor(rays / 2)][0] * 0.3)} ${r1(ends[Math.floor(rays / 2)][1] * 0.3)}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
  return { svg, tips: ends.map(([x, y]) => [x, y]) };
}

function tubes(h, rand, col, dark) {
  const k = 2 + Math.floor(rand() * 3);
  const tips = [];
  let svg = '';
  for (let i = 0; i < k; i++) {
    const tw = 8 + rand() * 6;
    const th = h * (0.5 + rand() * 0.5);
    const x = (i - (k - 1) / 2) * 10 + (rand() - 0.5) * 4;
    const tilt = (rand() - 0.5) * 0.3;
    const tx = x + Math.sin(tilt) * th;
    const ty = -th;
    svg += `<path d="${pth`M${x} 0L${tx} ${ty}`}" stroke="${col}" stroke-width="${r1(tw)}" stroke-linecap="round"/><ellipse cx="${r1(tx)}" cy="${r1(ty)}" rx="${r1(tw * 0.32)}" ry="${r1(tw * 0.2)}" fill="${dark ? '#04101b' : mix(col, '#3a1020', 0.45)}"/>`;
    tips.push([tx, ty - 2]);
  }
  return { svg, tips };
}

function kelp(h, rand, col) {
  const fronds = 1 + Math.floor(rand() * 2);
  const tips = [];
  let svg = '';
  for (let f = 0; f < fronds; f++) {
    const fh = h * (0.75 + rand() * 0.25);
    const x0 = (f - (fronds - 1) / 2) * 8;
    const left = [];
    const right = [];
    const steps = 10;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const y = -fh * t;
      const x = x0 + Math.sin(t * 5 + f * 2) * 5 * t;
      const w = 5 * (1 - t * 0.7);
      left.push([x - w, y]);
      right.unshift([x + w, y]);
      if (s % 3 === 2) tips.push([x + (s % 2 ? w : -w) * 1.4, y]);
    }
    const d = `M${[...left, ...right].map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`;
    svg += `<path d="${d}" fill="${col}" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/>`;
    svg += tips
      .slice(-3)
      .map(([x, y]) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="3.2" ry="4.4" fill="${col}"/>`)
      .join('');
  }
  return { svg: loop('sway', { dur: 4.6 + rand() * 2, delay: rand() * 4 }, svg), tips };
}

function anemone(h, rand, col, tipCol) {
  const ch = Math.max(6, h * 0.36);
  const n = 13;
  const tips = [];
  let tent = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.4;
    const len = (h - ch) * (0.7 + rand() * 0.3) + 6;
    const ex = Math.cos(a) * len;
    const ey = -ch + Math.sin(a) * len;
    tent += pthi`M${(i / (n - 1) - 0.5) * 12} ${-ch}Q${ex * 0.4} ${-ch - len * 0.8} ${ex} ${ey}`;
    tips.push([ex, ey]);
  }
  const svg = `<path d="${pth`M-8 0C-8 ${-ch * 0.6} -7 ${-ch} 0 ${-ch}C7 ${-ch} 8 ${-ch * 0.6} 8 0Z`}" fill="${col}"/>${loop(
    'sway',
    { dur: 3.8 + rand() * 2, delay: rand() * 3, origin: `0px ${r1(-ch)}px` },
    `<path d="${tent}" fill="none" stroke="${tipCol}" stroke-opacity=".9" stroke-width="2.6" stroke-linecap="round"/>`
  )}`;
  return { svg, tips };
}

function brain(h, rand, col, dark) {
  const w = Math.max(9, h * 1.15);
  const dh = Math.max(7, h);
  let grooves = '';
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    grooves += pth`M${-w * (1 - t * 0.3)} ${-dh * t * 0.9}Q${-w * 0.3} ${-dh * t - 4} 0 ${-dh * t * 0.95}T${w * (1 - t * 0.3)} ${-dh * t * 0.9}`;
  }
  const svg = `<path d="${pth`M${-w} 0C${-w} ${-dh * 1.3} ${w} ${-dh * 1.3} ${w} 0Z`}" fill="${col}"/><path d="${grooves}" fill="none" stroke="${dark ? '#04101b' : mix(col, '#3a1020', 0.35)}" stroke-opacity=".5" stroke-width="1.2"/>`;
  return { svg, tips: [[-w * 0.4, -dh * 0.75], [0, -dh * 0.95], [w * 0.4, -dh * 0.75], [-w * 0.75, -dh * 0.35], [w * 0.75, -dh * 0.35]] };
}

function coral(h, rand, col, tipCol, dark) {
  if (h <= 0) {
    const show = rand() < 0.45;
    return { svg: show ? `<ellipse cx="${r1((rand() - 0.5) * 14)}" cy="-2" rx="${r1(3 + rand() * 5)}" ry="${r1(2.4 + rand() * 1.6)}" fill="${col}" opacity=".7"/>` : '', tips: [] };
  }
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const kind = h < 28 ? pick(['brain', 'anemone']) : h < 72 ? pick(['anemone', 'tubes', 'fan', 'branching']) : pick(['branching', 'fan', 'kelp', 'tubes', 'branching']);
  if (kind === 'branching') return branching(h, rand, col);
  if (kind === 'fan') return fan(h, rand, col);
  if (kind === 'tubes') return tubes(h, rand, col, dark);
  if (kind === 'kelp') return kelp(h, rand, col);
  if (kind === 'anemone') return anemone(h, rand, col, tipCol);
  return brain(h, rand, col, dark);
}

// Rolling digits, right-aligned at xRight.
function counter(value, xRight, baseline, size, uid, fill) {
  const str = fmt(value);
  const dw = size * 0.62;
  const cw = size * 0.36;
  const lh = size * 1.3;
  const width = [...str].reduce((s, ch) => s + (ch === ',' ? cw : dw), 0);
  const digits = str.replace(/,/g, '').length;
  let x = xRight - width;
  let clip = '';
  let svg = '';
  let di = 0;
  for (const ch of str) {
    if (ch === ',') {
      svg += `<text x="${r1(x + cw / 2)}" y="${baseline}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${fill}">,</text>`;
      x += cw;
      continue;
    }
    const fromRight = digits - 1 - di;
    const idx = (fromRight === 0 ? 20 : fromRight === 1 ? 10 : 0) + Number(ch);
    clip += `<rect x="${r1(x)}" y="${r1(baseline - size * 0.92)}" width="${r1(dw)}" height="${r1(size * 1.14)}"/>`;
    svg += `<g clip-path="url(#cc${uid})"><g class="roll" style="transform:translateY(${r1(-idx * lh)}px)"><use xlink:href="#ds${uid}" x="${r1(x + dw / 2)}" y="${baseline}"/></g></g>`;
    x += dw;
    di++;
  }
  const strip = `<text id="ds${uid}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${fill}">${Array.from(
    { length: 30 },
    (_, i) => `<tspan x="0" y="${r1(i * lh)}">${i % 10}</tspan>`
  ).join('')}</text>`;
  return { svg, defs: `<clipPath id="cc${uid}">${clip}</clipPath>${strip}`, width };
}

// ---------------------------------------------------------------------------
// 1. Hero — the descent
// ---------------------------------------------------------------------------

export function heroSvg(profile, themeName, { site }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 600; // 2.00:1, like the other cinematic heroes
  const CX = 560;
  const DROP = 520; // how far the camera descends
  const n = fathomNumbers(profile);
  const rand = seededRandom(`fathom:${profile.login}`);

  // --- Name, sized to a fixed measure so every font lands the same width.
  const name = profile.name || profile.login;
  const len = Math.max(1, [...name].length);
  const S = Math.round(Math.max(46, Math.min(106, 820 / (len * 0.5))));
  const tw = r1(Math.min(820, len * S * 0.5));
  const base = 256;
  const nx = r1(CX - tw / 2);
  const capTop = base - S * 0.7;
  const glowY = r1(base - S * 0.34);

  // --- Plankton that spirals in from the dark and becomes the name.
  const motes = [1.1, 2]
    .flatMap((r, k) =>
      (dark ? [c.glow, c.glow2] : ['#ffffff']).map(
        (col, j) => `<g id="m${k}${j}">${dark ? `<circle r="${r1(r * 3)}" fill="${col}" opacity=".2"/>` : ''}<circle r="${r}" fill="${col}"/></g>`
      )
    )
    .join('');
  const swarm = Array.from({ length: 80 }, (_, i) => {
    const tx = Math.round(nx + rand() * tw);
    const ty = Math.round(capTop + rand() * (base - capTop));
    const mote = `m${rand() < 0.6 ? 0 : 1}${dark && rand() > 0.7 ? 1 : 0}`;
    return `<g transform="translate(${tx} ${ty}) rotate(${Math.round(rand() * 360)})"><g class="sw s${i % 3}" opacity="0" style="animation-delay:${(1.25 + rand() * 1.05).toFixed(2)}s"><use xlink:href="#${mote}"/></g></g>`;
  }).join('');

  // --- Headline, rising in under the name.
  const headline = balance(profile.headline, 66)
    .map(
      (line, i) =>
        `<text class="rise" style="animation-delay:${(ARRIVE + 1 + i * 0.16).toFixed(2)}s" x="${CX}" y="${base + 48 + i * 27}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="20" fill="${c.fg}" fill-opacity=".88">${escapeXml(line)}</text>`
    )
    .join('');
  const kicker = [`@${profile.login}`, profile.location].filter(Boolean).join('  ·  ').toUpperCase();

  // --- Depth gauge: a square-root scale from the surface to the bottom of the deepest trench.
  const G = { x: 1150, y0: 76, y1: 404 };
  const gy = (m) => r1(G.y0 + Math.sqrt(Math.min(Math.max(m, 0), 11000) / 11000) * (G.y1 - G.y0));
  const yd = gy(n.depth);
  // Near the surface there is no room above the marker, so the readout hangs below it.
  const below = yd - G.y0 < 34;
  const ry = below ? yd + 26 : yd - 9;
  const minor = [50, 100, 150, 400, 600, 800, 1500, 2000, 2500, 3000, 3500, 5000, 7000, 8000, 9000, 10000];
  const gauge = `<g font-family="${MONO}">
${ZONES.map((z, i) => `<path d="M${G.x} ${gy(z.from)}V${gy(z.to)}" stroke="${c.zoneBar[i]}" stroke-width="3"/>`).join('')}
<path d="${minor.map((m) => `M${G.x - 6} ${gy(m)}h4`).join('')}" stroke="${c.muted}" stroke-opacity=".6"/>
<path d="${[...ZONES.map((z) => z.from), 11000].map((m) => `M${G.x - 11} ${gy(m)}h9`).join('')}" stroke="${c.muted}"/>
${[...ZONES.map((z) => z.from), 11000]
  .filter((m) => (below ? gy(m) < yd - 10 || gy(m) > yd + 52 : Math.abs(gy(m) - (yd - 4)) > 24))
  .map((m) => `<text x="${G.x - 15}" y="${r1(gy(m) + 3)}" text-anchor="end" font-size="8.5" fill="${c.muted}">${fmt(m)}</text>`)
  .join('')}
${ZONES.map(
  (z) =>
    `<text transform="translate(${G.x + 14} ${r1((gy(z.from) + gy(z.to)) / 2)}) rotate(90)" text-anchor="middle" font-size="7.5" letter-spacing="1.6" fill="${c.muted}">${z.name.toUpperCase()}</text>`
).join('')}
<text x="${G.x + 4}" y="${G.y0 - 14}" text-anchor="end" font-size="8.5" letter-spacing="1.6" fill="${c.muted}">DEPTH · M</text>
</g>`;
  const depthCount = counter(n.depth, G.x - 34, ry, 21, 'd', c.fg);
  const readout = `<g class="sink">
<path d="M${r1(G.x - 30 - depthCount.width - 8)} ${yd}H${G.x - 3}" stroke="${c.accent}" stroke-width="1.2"/>
<path d="M${G.x - 3} ${yd - 5}l7 5l-7 5z" fill="${c.accent}"/>
${depthCount.svg}
<text x="${G.x - 16}" y="${ry}" text-anchor="end" font-family="${MONO}" font-size="13" fill="${c.muted}">m</text>
<text x="${G.x - 16}" y="${below ? ry + 16 : yd + 15}" text-anchor="end" font-family="${MONO}" font-size="8.5" font-weight="700" letter-spacing="1.6" fill="${c.accent}">${
    n.depth > CHALLENGER ? 'BELOW THE CHALLENGER DEEP' : `${n.zone.name.toUpperCase()} ZONE`
  }</text>
</g>`;

  // --- The reef: one coral per week, polyps for active days.
  // Heights are relative to the busiest week, but never to fewer than 28 contributions (four a
  // day), so a quiet year grows a modest reef instead of a full one.
  const maxWeek = Math.max(28, ...n.weeks.map((w) => w.sum));
  const reefX = (i) => r1(40 + i * (1120 / 51));
  let corals = '';
  let polyps = '';
  const tops = [];
  n.weeks.forEach((w, i) => {
    const h = w.sum > 0 ? 20 + 128 * Math.sqrt(w.sum / maxWeek) : 0;
    const x = reefX(i);
    const by = r1(572 + rand() * 8);
    const col = c.coral[Math.floor(rand() * c.coral.length)];
    const tipCol = c.tips[Math.floor(rand() * c.tips.length)];
    const cr = coral(h, rand, col, dark ? tipCol : mix(col, '#ffffff', 0.45), dark);
    tops.push(by - h);
    corals += `<g transform="translate(${x} ${by})"><g class="grow" style="animation-delay:${(1.45 + i * 0.018).toFixed(2)}s">${cr.svg}</g></g>`;
    if (w.active && cr.tips.length) {
      const spots = [...cr.tips].sort(() => rand() - 0.5);
      let dots = '';
      for (let k = 0; k < w.active; k++) {
        const [px, py] = spots[k % spots.length];
        const ox = k >= spots.length ? (rand() - 0.5) * 6 : 0;
        dots += dark
          ? `<use xlink:href="#pl${c.tips.indexOf(tipCol)}" x="${Math.round(px + ox)}" y="${Math.round(py)}"/>`
          : `<circle cx="${Math.round(px + ox)}" cy="${Math.round(py)}" r="1.8"/>`;
      }
      polyps += `<g class="lightUp" style="animation-delay:${(ARRIVE + 0.55 + i * 0.022).toFixed(2)}s" transform="translate(${x} ${by})"${dark ? '' : ' fill="#ffffff" fill-opacity=".95"'}>${dots}</g>`;
    }
  });

  // Far reef: a hazy ridge with small silhouettes, for depth.
  let ridge = 'M-20 600V538';
  for (let x = -20; x <= 1240; x += 40) ridge += pth`Q${x + 20} ${520 + rand() * 22} ${x + 40} ${532 + rand() * 12}`;
  ridge += 'V600Z';
  let farCorals = '';
  for (let i = 0; i < 18; i++) {
    const fx = Math.round(i * 68 + rand() * 50);
    const fh = 18 + rand() * 46;
    farCorals += `<g transform="translate(${fx} ${Math.round(536 + rand() * 6)}) scale(.8)">${branching(fh, rand, c.ridge, 2).svg}</g>`;
  }

  // Sand, with ripples and caustics thrown on it by the surface far above.
  const sand = pth`M-20 562Q200 552 420 560T820 556T1220 560V620H-20Z`;
  const ripples = Array.from({ length: 7 }, (_, i) => {
    const y = 572 + i * 4.4;
    const x = rand() * 900;
    return pth`M${x} ${y}q60 -3 120 0t120 0`;
  }).join('');
  const floorCaustics = causticNet(seededRandom(`floor:${profile.login}`), 0, 0, 1220, 120, 44);

  // Peak week: labelled like a specimen.
  let peakTag = '';
  if (n.peakWeek >= 0) {
    const px = reefX(n.peakWeek);
    const top = r1(tops[n.peakWeek] - 8);
    const anchor = px > 1040 ? 'end' : px < 150 ? 'start' : 'middle';
    peakTag = `<g class="tag" font-family="${MONO}"><path d="M${px} ${top}V${top - 22}" stroke="${c.fg}" stroke-opacity=".55" stroke-dasharray="2 2"/><circle cx="${px}" cy="${top}" r="2" fill="${c.fg}"/>
<text x="${px}" y="${top - 40}" text-anchor="${anchor}" font-size="9" font-weight="700" letter-spacing="1.4" fill="${c.fg}">PEAK WEEK · ${dayMonth(n.weeks[n.peakWeek].start)}</text>
<text x="${px}" y="${top - 28}" text-anchor="${anchor}" font-size="9" letter-spacing="1" fill="${c.muted}">${plural(n.weeks[n.peakWeek].sum, 'CONTRIBUTION', 'CONTRIBUTIONS')}</text></g>`;
  }

  // --- Fish: your featured repositories, sized by stars.
  const featured = (profile.featured || [])
    .map((r) => (profile.repos || []).find((x) => x.name === r))
    .filter(Boolean)
    .slice(0, 4);
  const peakX = n.peakWeek >= 0 ? reefX(n.peakWeek) : -999;
  const slots = [
    { x: 168, y: 146, dir: 1 },
    { x: 912, y: 132, dir: -1 },
    { x: 236, y: 372, dir: 1 },
    { x: 884, y: 360, dir: -1 },
  ].map((s) => (s.y > 300 && Math.abs(s.x - peakX) < 130 ? { ...s, x: Math.max(130, Math.min(990, s.x + (s.x < peakX ? -140 : 140))) } : s));
  const maxStars = Math.max(10, ...featured.map((r) => r.stars || 0));
  const shoal = featured.length
    ? featured.map((repo, i) => ({
        repo,
        i,
        // The angelfish is tall for its length, so it is drawn shorter to read at the same size.
        L: r1((62 + 50 * (Math.log10(1 + (repo.stars || 0)) / Math.log10(1 + maxStars))) * (i === 2 ? 0.78 : 1)),
        color: langColor(repo.language || 'Markdown'),
      }))
    : [
        { i: 0, L: 58, color: dark ? '#5ef2ff' : '#ffad5c' },
        { i: 3, L: 48, color: dark ? '#b38cff' : '#5aa2ff' },
      ];
  const fishes = shoal
    .map(({ repo, i, L, color }) => {
      const slot = slots[i];
      const f = fishSvg(c, dark, { L, color, kind: i, uid: i });
      const meta = repo ? [repo.language, repo.stars ? `★ ${short(repo.stars)}` : ''].filter(Boolean).join(' · ') : '';
      const label = repo
        ? `<text y="${r1(f.below + 20)}" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="${c.fg}">${escapeXml(trunc(repo.name, 22))}</text>${
            meta ? `<text y="${r1(f.below + 34)}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="${c.muted}">${escapeXml(meta)}</text>` : ''
          }`
        : '';
      const body = slot.dir < 0 ? `<g transform="scale(-1 1)">${f.svg}</g>` : f.svg;
      return `<g transform="translate(${slot.x} ${slot.y})"><g class="${slot.dir > 0 ? 'swimL' : 'swimR'}" style="animation-delay:${(1.15 + i * 0.24).toFixed(2)}s">${loop(
        'drift',
        { dur: 6 + i * 1.3, delay: i * 1.7, kx: 3, ky: 1.6, reverse: i % 2 === 1 },
        `${body}${label}`
      )}</g></g>`;
    })
    .join('');

  // --- Jellies and marine snow, in the middle distance.
  const jellies = [
    { x: 404, y: 96, r: 17 },
    { x: 78, y: 262, r: 23 },
  ]
    .map((j, i) => `<g transform="translate(${j.x} ${j.y})"><g class="fade" style="animation-delay:${(0.9 + i * 0.3).toFixed(2)}s">${loop('drift', { dur: 7 + i * 2, delay: i * 2.5, kx: 0.6, ky: 2.4 }, jellySvg(c, dark, { r: j.r, uid: i, rand }))}</g></g>`)
    .join('');
  const snow = [0, 1, 2]
    .map((g) => {
      let dots = '';
      for (let i = 0; i < 26; i++) dots += `<circle cx="${r1(rand() * W)}" cy="${r1(rand() * 560)}" r="${r1(0.5 + rand() * 1.4)}" opacity="${r1((0.3 + rand() * 0.7) * 100) / 100}"/>`;
      return loop('drift', { dur: 11 + g * 4, delay: g * 3, kx: 1.5 - g * 0.4, ky: 2.5, reverse: g === 1 }, `<g fill="${c.snow}" opacity="${c.snowOp}">${dots}</g>`);
    })
    .join('');

  // --- The surface, which the camera leaves behind. Light shafts fan out from the sun above,
  // each a soft outer beam around a brighter core.
  const SUN = 620;
  const rays = [
    [96, 60, 0.7],
    [300, 96, 1],
    [500, 70, 0.75],
    [700, 118, 1],
    [900, 84, 0.8],
    [1110, 64, 0.6],
  ]
    .map(([x, w, k], i) => {
      const top = -DROP + 30;
      const xt = SUN + (x - SUN) * 0.22;
      const xb = x + (x - SUN) * 0.32;
      const beam = (s) => pth`M${xt - w * 0.12 * s} ${top}L${xt + w * 0.12 * s} ${top}L${xb + w * s} ${H}L${xb - w * s} ${H}Z`;
      const x0 = r1(xt + ((xb - xt) * (0 - top)) / (H - top));
      return `<g class="sway" style="transform-origin:${x0}px 0px;animation-duration:${r1(10 + i * 1.7)}s;animation-delay:-${r1(i * 2.3)}s" opacity="${k}"><path d="${beam(1)}" fill="url(#ray)" opacity=".55"/><path d="${beam(0.42)}" fill="url(#ray)" opacity=".8"/></g>`;
    })
    .join('');
  const surfaceNet = causticNet(seededRandom(`surface:${profile.login}`), -20, 0, 1240, 260, 56);

  // Bubbles from the entry splash rush up past the camera and are gone.
  const entry = Array.from({ length: 44 }, () => {
    const x = r1(120 + rand() * 920);
    const y = r1(-40 - rand() * 280);
    const r = r1(2 + rand() ** 2 * 9);
    return `<g class="bub b${rand() < 0.5 ? 'A' : 'B'}" style="animation-duration:${(1.5 + rand() * 0.9).toFixed(2)}s;animation-delay:${(rand() * 0.7).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="${r}"/>${
      r > 4 ? `<circle cx="${r1(x - r * 0.35)}" cy="${r1(y - r * 0.35)}" r="${r1(r * 0.28)}" fill="${c.bubble}" fill-opacity=".7" stroke="none"/>` : ''
    }</g>`;
  }).join('');

  const nameCaustics = causticNet(seededRandom(`name:${profile.login}`), nx - 40, capTop - 30, tw + 80, S + 60, 34);

  const css = `
.descend{animation:descend ${ARRIVE}s ${DIVE} both}
.mid{animation:mid ${ARRIVE}s ${DIVE} both}
.floor{animation:floor ${ARRIVE}s ${DIVE} both}
.bub{animation-timing-function:cubic-bezier(.3,.1,.6,1);animation-fill-mode:both}
.bA{animation-name:bubA}.bB{animation-name:bubB}
.grow{transform-box:fill-box;transform-origin:50% 100%;animation:grow 1s ${EXPO} both}
.lightUp{animation:fade .7s ease-out both}
.fade{animation:fade 1.2s ease-out both}
.swimL{animation:swimL 2.6s ${EXPO} both}
.swimR{animation:swimR 2.6s ${EXPO} both}
.sw{animation-duration:1.5s;animation-timing-function:cubic-bezier(.6,0,.3,1);animation-fill-mode:both}
.s0{animation-name:sw0}.s1{animation-name:sw1}.s2{animation-name:sw2}
.ignite{animation:fade 1.6s ease-out ${ARRIVE + 0.35}s both}
.lit{animation:fade 1.1s ease-out ${ARRIVE + 0.3}s both}
/* no fill: the ring is invisible before and after its one pulse */
.ripple{transform-box:fill-box;transform-origin:center;animation:ripple 1.8s ${EXPO} ${ARRIVE + 0.3}s}
.rise{animation:rise .9s ${EXPO} both}
.kick{animation:rise .9s ${EXPO} ${ARRIVE + 0.85}s both}
.boot{animation:fade .8s ease-out .5s both}
.sink{animation:sink ${ARRIVE + 0.2}s ${DIVE} both}
.roll{animation:roll ${ARRIVE + 0.2}s ${DIVE} both}
.tag{animation:rise .8s ${EXPO} ${ARRIVE + 1.9}s both}
.going{animation:show ${ARRIVE}s step-end both}
.there{animation:hide ${ARRIVE}s step-end both}
.sway{animation-name:sway;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.drift{animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes descend{from{transform:translateY(${DROP}px)}}
@keyframes mid{from{transform:translateY(${DROP * 0.8}px)}}
@keyframes floor{from{transform:translateY(300px)}}
@keyframes bubA{from{transform:translateY(780px)}}
@keyframes bubB{from{transform:translateY(960px)}}
@keyframes grow{from{transform:scaleY(.02)}}
@keyframes fade{from{opacity:0}}
@keyframes show{from{opacity:1}}
@keyframes hide{from{opacity:0}}
@keyframes swimL{from{transform:translateX(-520px)}}
@keyframes swimR{from{transform:translateX(520px)}}
@keyframes sw0{0%{opacity:0;transform:rotate(80deg) translateX(300px)}18%{opacity:1}82%{opacity:1}}
@keyframes sw1{0%{opacity:0;transform:rotate(-70deg) translateX(420px)}18%{opacity:1}82%{opacity:1}}
@keyframes sw2{0%{opacity:0;transform:rotate(140deg) translateX(230px)}18%{opacity:1}82%{opacity:1}}
@keyframes ripple{from{opacity:.75;transform:scale(.35)}}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}
@keyframes sink{from{transform:translateY(${r1(G.y0 - yd)}px)}}
@keyframes roll{from{transform:translateY(0)}}
${LOOPS}
${REDUCED}`;

  const aria = `${name}${profile.headline ? ` — ${profile.headline.replace(/[.!?\s]+$/, '')}` : ''}. The camera descends onto a reef grown from the last 52 weeks of contributions; fish named after featured repositories swim past, plankton gathers into the name, and a depth gauge reads ${fmt(n.depth)} metres, the ${n.zone.name.toLowerCase()} zone.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <linearGradient id="water" x1="0" y1="${-DROP}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">${c.water
    .map((col, i) => `<stop offset="${[0, 0.28, 0.55, 0.8, 1][i]}" stop-color="${col}"/>`)
    .join('')}</linearGradient>
  <linearGradient id="ray" x1="0" y1="${-DROP}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.ray}" stop-opacity="${r1(c.rayOp * 1.6 * 100) / 100}"/><stop offset=".5" stop-color="${c.ray}" stop-opacity="${c.rayOp}"/><stop offset="1" stop-color="${c.ray}" stop-opacity="0"/></linearGradient>
  <linearGradient id="surfBand" x1="0" y1="${-DROP}" x2="0" y2="${-DROP + 240}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.surf}" stop-opacity="${c.surfOp}"/><stop offset="1" stop-color="${c.surf}" stop-opacity="0"/></linearGradient>
  <radialGradient id="sun" cx="620" cy="${-DROP}" r="420" gradientUnits="userSpaceOnUse" gradientTransform="translate(620 ${-DROP}) scale(1 .45) translate(-620 ${DROP})"><stop offset="0" stop-color="${c.sun}" stop-opacity="${c.sunOp}"/><stop offset="1" stop-color="${c.sun}" stop-opacity="0"/></radialGradient>
  <linearGradient id="sand" x1="0" y1="552" x2="0" y2="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.sand[0]}"/><stop offset="1" stop-color="${c.sand[1]}"/></linearGradient>
  <radialGradient id="pool"><stop offset="0" stop-color="${c.pool}" stop-opacity="${c.poolOp}"/><stop offset=".6" stop-color="${c.pool}" stop-opacity="${r1(c.poolOp * 0.4 * 100) / 100}"/><stop offset="1" stop-color="${c.pool}" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="${c.jelly.halo}" stop-opacity=".35"/><stop offset="1" stop-color="${c.jelly.halo}" stop-opacity="0"/></radialGradient>
  <radialGradient id="pg"><stop offset="0" stop-color="${c.glow}" stop-opacity=".55"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
  ${dark ? c.tips.map((t, k) => `<g id="pl${k}"><circle r="5.5" fill="url(#pg)" opacity=".85"/><circle r="1.7" fill="${t}"/></g>`).join('') : ''}
  <radialGradient id="vig" cx="600" cy="280" r="780" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 280) scale(1 .66) translate(-600 -280)"><stop offset=".5" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.vignetteOp}"/></radialGradient>
  <text id="nm" x="${nx}" y="${base}" textLength="${tw}" lengthAdjust="spacingAndGlyphs" font-family="${SERIF}" font-size="${S}">${escapeXml(name)}</text>
  <clipPath id="nmClip"><use xlink:href="#nm"/></clipPath>
  ${motes}
  ${depthCount.defs}
</defs>
<g clip-path="url(#frame)">
  <g class="descend">
    <rect y="${-DROP}" width="${W}" height="${H + DROP}" fill="url(#water)"/>
    <ellipse cx="620" cy="${-DROP}" rx="420" ry="190" fill="url(#sun)"/>
    <rect y="${-DROP}" width="${W}" height="240" fill="url(#surfBand)"/>
    <g transform="translate(0 ${-DROP}) scale(1 .42)"><path d="${surfaceNet}" fill="none" stroke="${c.surf}" stroke-opacity="${dark ? 0.22 : 0.6}" stroke-width="2.2"/></g>
    ${rays}
  </g>
  <g class="mid">${snow}${jellies}</g>
  <g class="floor">
    <path d="${ridge}" fill="${c.ridge}" opacity="${dark ? 0.95 : 0.6}"/>
    <g opacity="${dark ? 0.9 : 0.55}">${farCorals}</g>
    <path d="${sand}" fill="url(#sand)"/>
    <path d="${ripples}" fill="none" stroke="${c.sandLine}" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>
    <g transform="translate(0 556) scale(1 .36)">${loop(
      'drift',
      { dur: 9, kx: 2, ky: 1 },
      `<path d="${floorCaustics}" fill="none" stroke="${c.caustic}" stroke-opacity="${c.causticOp}" stroke-width="2.4"/>`
    )}</g>
    <g stroke="${c.coralEdge}" stroke-opacity="${c.coralEdgeOp}" stroke-width=".8">${corals}</g>
    ${polyps}
    ${peakTag}
    <text class="boot" x="40" y="592" font-family="${MONO}" font-size="9" letter-spacing="1.8" fill="${dark ? c.muted : c.fg}" fill-opacity="${dark ? 1 : 0.7}">THE REEF · 52 WEEKS · ${fmt(n.active)} ACTIVE DAYS</text>
  </g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <g class="ignite"><ellipse cx="${CX}" cy="${glowY}" rx="${r1(tw * 0.72 + 40)}" ry="${r1(S * 1.5)}" fill="url(#pool)"/></g>
  ${fishes}
  ${swarm}
  <ellipse class="ripple" cx="${CX}" cy="${glowY}" rx="${r1(tw * 0.62)}" ry="${r1(S * 0.82)}" fill="none" stroke="${c.glow}" stroke-width="1.4" opacity="0"/>
  ${
    dark
      ? `<g class="ignite" fill="none" stroke="${c.glow}" stroke-linejoin="round"><use xlink:href="#nm" stroke-width="20" opacity=".05"/><use xlink:href="#nm" stroke-width="11" opacity=".08"/><use xlink:href="#nm" stroke-width="5" opacity=".16"/></g>
  <use class="lit" xlink:href="#nm" fill="${c.nameFill}"/>`
      : `<g class="lit"><use xlink:href="#nm" fill="#ffffff" opacity=".6" transform="translate(0 2)"/><use xlink:href="#nm" fill="${c.nameFill}"/>
  <g clip-path="url(#nmClip)">${loop('drift', { dur: 7, kx: 2.4, ky: 1.4 }, `<path d="${nameCaustics}" fill="none" stroke="${c.caustic}" stroke-opacity=".32" stroke-width="1.4"/>`)}</g></g>`
  }
  <text class="kick" x="${CX}" y="${r1(capTop - 26)}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="3.2" fill="${c.muted}">${escapeXml(kicker)}</text>
  ${headline}
  <g fill="${c.bubble}" fill-opacity=".12" stroke="${c.bubble}" stroke-opacity=".7">${entry}</g>
  <g class="boot" font-family="${MONO}">
    <circle cx="44" cy="44" r="3.5" fill="${c.accent}"/>
    <text x="56" y="48" font-size="11" font-weight="700" letter-spacing="2.4" fill="${c.fg}">${escapeXml(site.toUpperCase())}</text>
    <text class="going" opacity="0" x="40" y="68" font-size="9.5" letter-spacing="1.8" fill="${c.muted}">DESCENDING…</text>
    <text class="there" x="40" y="68" font-size="9.5" letter-spacing="1.8" fill="${c.muted}">HOLDING · NEUTRAL BUOYANCY</text>
  </g>
  <g class="boot">${gauge}</g>
  ${readout}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.fg}" stroke-opacity=".08"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Dive log — the year as a descent
// ---------------------------------------------------------------------------

function diverGlyph(color, mask) {
  return `<g fill="${color}"><path d="M-16 -2L-27 -8L-25 -1ZM-16 1L-27 6L-24 -1Z"/><path d="M-15 0H5" stroke="${color}" stroke-width="7.5" stroke-linecap="round"/><rect x="-12" y="-9.5" width="15" height="5" rx="2.5"/><circle cx="10" cy="-1" r="4.6"/><path d="M5 2L15 7" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/><rect x="11" y="-3.4" width="4.4" height="3.6" rx="1" fill="${mask}"/></g>`;
}

export function logSvg(profile, themeName, { site }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 700;
  const n = fathomNumbers(profile);
  const rand = seededRandom(`fathom-log:${profile.login}`);

  // --- Chart geometry: x is the year, y is depth on the same square-root scale as the gauge.
  const X0 = 156;
  const X1 = 1090;
  const Y0 = 128;
  const Y1 = 362;
  const SWEEP0 = 0.5;
  const SWEEP = 2.4;
  // The scale runs a little past your depth, so the dive fills the chart whatever the total.
  const bottom = Math.max(240, n.depth * 1.45);
  const dy = (m) => r1(Y0 + Math.sqrt(Math.max(0, Math.min(m, bottom)) / bottom) * (Y1 - Y0));
  const N = Math.max(1, n.days.length);
  const dx = (i) => r1(X0 + ((i + 1) / N) * (X1 - X0));
  const at = (x) => (SWEEP0 + (SWEEP * (x - X0)) / (X1 - X0)).toFixed(2);

  const zonesIn = ZONES.filter((z) => z.from < bottom);
  const bands = zonesIn
    .map((z) => {
      const zi = ZONES.indexOf(z);
      const ya = dy(z.from);
      const yb = dy(zi === ZONES.length - 1 ? bottom : Math.min(z.to, bottom));
      return `<rect x="${X0}" y="${ya}" width="${X1 - X0}" height="${r1(yb - ya)}" fill="${c.band[zi]}"/>`;
    })
    .join('');
  const bandLabels = zonesIn
    .map((z) => {
      const zi = ZONES.indexOf(z);
      const ya = dy(z.from);
      const yb = dy(zi === ZONES.length - 1 ? bottom : Math.min(z.to, bottom));
      const mid = (ya + yb) / 2;
      const range = zi === ZONES.length - 1 ? `${fmt(z.from)} m +` : `${fmt(z.from)}–${fmt(z.to)} m`;
      return `<text x="${X0 - 14}" y="${r1(yb - ya > 30 ? mid - 2 : mid + 3)}" text-anchor="end" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.6" fill="${c.cardText}">${z.name.toUpperCase()}</text>${
        yb - ya > 30 ? `<text x="${X0 - 14}" y="${r1(mid + 11)}" text-anchor="end" font-family="${MONO}" font-size="8.5" fill="${c.cardMuted}">${range}</text>` : ''
      }`;
    })
    .join('');
  const bounds = zonesIn
    .slice(1)
    .map((z) => `<path d="M${X0} ${dy(z.from)}H${X1}" stroke="${c.fg}" stroke-opacity=".18" stroke-dasharray="3 4"/><text x="${X1 + 10}" y="${dy(z.from) + 3}" font-family="${MONO}" font-size="9" fill="${c.cardMuted}">${fmt(z.from)} m</text>`)
    .join('');

  // --- The descent itself.
  const pts = [[X0, Y0], ...n.depthAt.map((v, i) => [dx(i), dy(v)])];
  const line = `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`;
  const area = `${line}L${X1} ${Y0}Z`;
  const end = pts[pts.length - 1];

  // A bubble for every active day, bigger for busier days, grouped by week to reveal with the sweep.
  const maxDay = Math.max(1, ...n.days.map((d) => d.count));
  const weekly = new Map();
  n.days.forEach((d, i) => {
    if (!d.count) return;
    const k = Math.min(1, Math.sqrt(d.count / maxDay));
    const r = r1(1.2 + k * 3.4);
    const x = r1(dx(i) + (rand() - 0.5) * 2);
    const yl = dy(n.depthAt[i]);
    const y = r1(Math.max(Y0 + r + 2, yl - 8 - rand() * 10 - k * 16));
    let s = `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    if (k > 0.5) s += `<circle cx="${r1(x + (rand() - 0.5) * 4)}" cy="${r1(Math.max(Y0 + 3, y - r - 6 - rand() * 8))}" r="${r1(r * 0.55)}"/>`;
    const w = Math.floor(i / 7);
    weekly.set(w, (weekly.get(w) || '') + s);
  });
  const bubbles = [...weekly].map(([w, s]) => `<g class="pop" style="animation-delay:${at(dx(Math.min(N - 1, w * 7 + 3)))}s">${s}</g>`).join('');

  // --- Markers, placed so labels never collide.
  const placed = [];
  // A label must sit wholly above or wholly below the line across its own width.
  const clearOfLine = (b) => {
    const ys = pts.filter(([x]) => x >= b.x0 - 4 && x <= b.x1 + 4).map(([, y]) => y);
    return !ys.length || Math.max(...ys) < b.y0 - 3 || Math.min(...ys) > b.y1 + 3;
  };
  const fits = (b) =>
    b.x0 >= X0 + 4 &&
    b.x1 <= X1 - 4 &&
    b.y0 >= Y0 + 4 &&
    b.y1 <= Y1 - 4 &&
    clearOfLine(b) &&
    !placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  const marker = (px, py, title, sub, dot) => {
    const w = Math.max(title.length * 6.3, sub.length * 5.7) + 4;
    // The line falls to the right, so the water below-left of a point is always clear of it and
    // of the bubbles, which rise above it.
    const cands = [
      [px - 10 - w, py + 12, 'end'],
      [px - 10 - w, py + 40, 'end'],
      [px - w / 2, py + 14, 'start'],
      [px - w / 2, py + 42, 'start'],
      [px + 10, py + 22, 'start'],
      [px + 10, py + 50, 'start'],
      [px + 10, py + 78, 'start'],
      [px - 10 - w, py + 68, 'end'],
    ];
    const pick = cands.find(([x, y]) => fits({ x0: x, y0: y, x1: x + w, y1: y + 28 }));
    if (!pick) return '';
    const [bx, by, anchor] = pick;
    placed.push({ x0: bx, y0: by, x1: bx + w, y1: by + 28 });
    const tx = anchor === 'start' ? bx : bx + w;
    // A halo in the colour of the band behind the label keeps it legible over the grid lines.
    const behind = ZONES.indexOf(zoneOf(((by + 14 - Y0) / (Y1 - Y0)) ** 2 * bottom));
    const halo = ` paint-order="stroke" stroke="${c.band[behind]}" stroke-width="3" stroke-linejoin="round"`;
    return `<g class="pop" style="animation-delay:${at(px)}s">${dot}<text x="${r1(tx)}" y="${r1(by + 11)}" text-anchor="${anchor}" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.2" fill="${c.cardText}"${halo}>${escapeXml(title)}</text><text x="${r1(tx)}" y="${r1(by + 24)}" text-anchor="${anchor}" font-family="${UI}" font-size="10.5" fill="${c.cardMuted}"${halo}>${escapeXml(sub)}</text></g>`;
  };
  const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${c.panel[0]}" stroke="${c.line}" stroke-width="1.8"/>`;
  // Reserve the diver's corner first.
  placed.push({ x0: end[0] - 44, y0: end[1] - 16, x1: X1, y1: end[1] + 16 });
  let marks = '';
  if (n.peak) {
    const px = dx(n.peak.index);
    const py = dy(n.depthAt[n.peak.index]);
    marks += marker(px, py, 'BIGGEST PLUNGE', `${dayMonth(n.peak.date)} · ${plural(n.peak.count, 'contribution')}`, `<path d="M${px} ${py - 9}v7m-3.5 -3.5l3.5 3.5l3.5 -3.5" fill="none" stroke="${c.line}" stroke-width="1.6" stroke-linecap="round"/>`);
  }
  n.crossings
    .filter((x) => x.zone.from < bottom)
    .forEach((x) => {
      const px = dx(x.index);
      const py = dy(x.zone.from);
      marks += marker(px, py, `${x.zone.name.toUpperCase()} ZONE`, `reached ${dayMonth(x.date)}`, ring(px, py));
    });
  if (n.rest && n.rest.length >= 3) {
    const xa = n.rest.start > 0 ? dx(n.rest.start - 1) : X0;
    const xb = dx(n.rest.end);
    const yr = n.rest.start > 0 ? dy(n.depthAt[n.rest.start - 1]) : Y0;
    const mx = r1((xa + xb) / 2);
    marks += marker(
      mx,
      yr,
      n.rest.surface ? 'SURFACE INTERVAL' : 'LONGEST SAFETY STOP',
      `${plural(n.rest.length, 'day')} ${n.rest.surface ? 'at the surface' : 'holding depth'}`,
      `<path d="M${xa} ${r1(yr + 6)}V${r1(yr + 9)}H${xb}V${r1(yr + 6)}" fill="none" stroke="${c.line}" stroke-opacity=".8" stroke-width="1.3"/>`
    );
  }

  // Month labels under the chart.
  const months = n.days
    .map((d, i) => (d.date.slice(8, 10) === '01' ? `<text x="${dx(i)}" y="${Y1 + 18}" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="1" fill="${c.cardMuted}">${MONTHS[Number(d.date.slice(5, 7)) - 1]}</text>` : ''))
    .filter((s, i, all) => s && dx(i) > X0 + 16 && dx(i) < X1 - 16)
    .join('');

  // --- Logbook page.
  const LX = 48;
  const LY = 404;
  const LW = 500;
  const LH = 268;
  const today = new Date();
  const dateText = `${String(today.getDate()).padStart(2, '0')} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  const cells = [
    ['DIVE SITE', '', trunc(site, 20)],
    ['DATE', '', dateText],
    ['MAX DEPTH', 'contributions', `${fmt(n.depth)} m`],
    ['BOTTOM TIME', 'active days', plural(n.active, 'day')],
    ['LONGEST DIVE', 'longest streak', plural(n.streak, 'day')],
    ['SAFETY STOP', 'longest break', plural(n.rest?.length || 0, 'day')],
    ['VISIBILITY', 'followers', fmt(n.followers)],
    ['TREASURE', 'stars', `★ ${fmt(n.stars)}`],
  ];
  const writeAt = (i) => (1.0 + i * 0.12).toFixed(2);
  const logCells = cells
    .map(([label, hint, value], i) => {
      const x = LX + 22 + (i % 2) * 172;
      const y = LY + 66 + Math.floor(i / 2) * 44;
      return `<text x="${x}" y="${y}" font-family="${MONO}" font-size="8.5" font-weight="700" letter-spacing="1.4" fill="${c.cardMuted}">${label}${
        hint ? `<tspan font-family="${UI}" font-weight="400" letter-spacing="0" font-size="9">  ${hint}</tspan>` : ''
      }</text>
<clipPath id="lw${i}"><rect class="write" style="animation-delay:${writeAt(i)}s" x="${x - 2}" y="${y + 4}" width="166" height="28"/></clipPath>
<text clip-path="url(#lw${i})" x="${x}" y="${y + 24}" font-family="${HAND}" font-size="17" fill="${c.ink}">${escapeXml(value)}</text>`;
    })
    .join('');
  const rules = Array.from({ length: 6 }, (_, i) => `M${LX + 14} ${LY + 92 + i * 44}H${LX + 356}`)
    .slice(0, 4)
    .join('');
  const stampX = LX + 428;
  const stampY = LY + 108;
  const stampR = 46;
  const stampText = `CERTIFIED ${n.zone.name.toUpperCase()} DIVER · @${trunc(profile.login, 14).toUpperCase()} ·`;
  const arcR = stampR - 10;
  const stamp = `<g transform="rotate(-14 ${stampX} ${stampY})"><g class="stamp" opacity=".86" fill="none" stroke="${c.stamp}">
<circle cx="${stampX}" cy="${stampY}" r="${stampR}" stroke-width="2.6" stroke-dasharray="70 3 40 2 90 4"/>
<circle cx="${stampX}" cy="${stampY}" r="${stampR - 18}" stroke-width="1.2"/>
<path id="arc" d="${pth`M${stampX - arcR} ${stampY}a${arcR} ${arcR} 0 1 1 ${arcR * 2} 0a${arcR} ${arcR} 0 1 1 ${-arcR * 2} 0`}" stroke="none"/>
<text font-family="${MONO}" font-size="7.6" font-weight="700" fill="${c.stamp}" stroke="none"><textPath xlink:href="#arc" textLength="${r1(TAU * arcR - 6)}" lengthAdjust="spacingAndGlyphs">${escapeXml(stampText)}</textPath></text>
<path d="${pth`M${stampX - 16} ${stampY - 6}q4 -5 8 0t8 0t8 0t8 0`}" stroke-width="1.8" stroke-linecap="round"/>
<text x="${stampX}" y="${stampY + 10}" text-anchor="middle" font-family="${SERIF}" font-size="17" font-weight="700" fill="${c.stamp}" stroke="none">${today.getFullYear()}</text>
</g></g>`;
  // Long names sign as first name and initial, the way people actually sign.
  const full = String(profile.name || profile.login).trim();
  const parts = full.split(/\s+/);
  const signature = full.length > 14 && parts.length > 1 ? `${trunc(parts[0], 12)} ${parts[parts.length - 1][0]}.` : trunc(full, 16);
  const logbook = `<g class="fade" style="animation-delay:.6s">
<rect x="${LX}" y="${LY + 4}" width="${LW}" height="${LH}" rx="10" fill="#000" opacity="${dark ? 0.35 : 0.08}"/>
<rect x="${LX}" y="${LY}" width="${LW}" height="${LH}" rx="10" fill="${c.paper}" stroke="${c.cardEdge}"/>
<path d="${rules}" stroke="${c.rule}" stroke-opacity="${c.ruleOp}"/>
<path d="M${LX + 372} ${LY + 46}V${LY + LH - 14}" stroke="${c.margin}" stroke-opacity="${c.marginOp}"/>
<text x="${LX + 22}" y="${LY + 30}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="2.4" fill="${c.cardText}">LOGBOOK</text>
<text x="${LX + 356}" y="${LY + 30}" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1.4" fill="${c.cardMuted}">${fmt(n.years)} ${n.years === 1 ? 'YEAR' : 'YEARS'} IN THE WATER</text>
<path d="M${LX + 14} ${LY + 42}H${LX + LW - 14}" stroke="${c.cardText}" stroke-opacity=".2"/>
${logCells}
${stamp}
<text x="${LX + 392}" y="${LY + 196}" font-family="${MONO}" font-size="8.5" font-weight="700" letter-spacing="1.4" fill="${c.cardMuted}">BUDDY</text>
<clipPath id="sig"><rect class="write" style="animation-delay:2.2s" x="${LX + 388}" y="${LY + 200}" width="104" height="44"/></clipPath>
<text clip-path="url(#sig)" x="${LX + 392}" y="${LY + 230}" font-family="${HAND}" font-size="${r1(Math.min(18, 150 / Math.max(1, signature.length)))}" fill="${c.ink}" transform="rotate(-6 ${LX + 392} ${LY + 230})">${escapeXml(signature)}</text>
<path d="M${LX + 390} ${LY + 240}H${LX + LW - 16}" stroke="${c.cardText}" stroke-opacity=".25"/>
</g>`;

  // --- Species spotted: languages.
  const SX = 568;
  const SY = 404;
  const SW = 280;
  const langs = (profile.languages || []).slice(0, 5);
  const maxShare = Math.max(0.01, ...langs.map((l) => l.share));
  const species = langs.length
    ? langs
        .map((l, i) => {
          const y = SY + 70 + i * 40;
          const col = langColor(l.name);
          const bw = r1(((SW - 64) * l.share) / maxShare);
          return `<g class="rise" style="animation-delay:${(0.9 + i * 0.1).toFixed(2)}s">${fishGlyph(col, SX + 28, y - 3, 1.05)}
<text x="${SX + 50}" y="${y - 3}" font-family="${UI}" font-size="13" font-weight="600" fill="${c.cardText}">${escapeXml(trunc(l.name, 16))}</text>
<text x="${SX + 50}" y="${y + 11}" font-family="${SERIF}" font-style="italic" font-size="10.5" fill="${c.cardMuted}">${escapeXml(trunc(speciesName(l.name), 26))}</text>
<text x="${SX + SW - 16}" y="${y - 3}" text-anchor="end" font-family="${MONO}" font-size="12" font-weight="700" fill="${c.cardText}">${Math.round(l.share * 100)}%</text>
<rect x="${SX + 50}" y="${y + 17}" width="${SW - 66}" height="3" rx="1.5" fill="${c.track}"/>
<rect class="bar" style="animation-delay:${(1.1 + i * 0.1).toFixed(2)}s" x="${SX + 50}" y="${y + 17}" width="${Math.max(2, bw - 16)}" height="3" rx="1.5" fill="${col}"/></g>`;
        })
        .join('')
    : `<text x="${SX + 20}" y="${SY + 80}" font-family="${UI}" font-size="13" fill="${c.cardMuted}">No species logged yet.</text>`;
  const speciesCard = `<g class="fade" style="animation-delay:.75s">
<rect x="${SX}" y="${SY}" width="${SW}" height="${LH}" rx="10" fill="${c.card}" fill-opacity="${c.cardOp}" stroke="${c.cardEdge}"/>
<text x="${SX + 20}" y="${SY + 30}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="2.4" fill="${c.cardText}">SPECIES SPOTTED</text>
<text x="${SX + SW - 16}" y="${SY + 30}" text-anchor="end" font-family="${UI}" font-size="10" fill="${c.cardMuted}">share of code</text>
<path d="M${SX + 14} ${SY + 42}H${SX + SW - 14}" stroke="${c.cardText}" stroke-opacity=".14"/>
${species}
</g>`;

  // --- Sonar: featured repositories. Nearer the centre means more stars.
  const RX = 868;
  const RW = 284;
  const ox = RX + RW / 2;
  const oy = SY + 160;
  const R = 90;
  const SWEEP_T = 4;
  const featured = (profile.featured || [])
    .map((r) => (profile.repos || []).find((x) => x.name === r))
    .filter(Boolean)
    .slice(0, 5);
  const ranked = [...featured].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  const topStars = Math.max(1, ranked[0]?.stars || 1);
  const turn = rand() * 360;
  const blips = ranked
    .map((repo, i) => {
      const bearing = (turn + i * (360 / Math.max(1, ranked.length)) + (rand() - 0.5) * 24 + 360) % 360;
      const range = R * (0.36 + 0.54 * (ranked.length > 1 ? i / (ranked.length - 1) : 0.4));
      const a = ((bearing - 90) * Math.PI) / 180;
      const bx = r1(ox + Math.cos(a) * range);
      const by = r1(oy + Math.sin(a) * range);
      const br = r1(2.6 + 2.2 * (Math.log10(1 + (repo.stars || 0)) / Math.log10(1 + topStars)));
      // Labels sit centred above blips in the top half and below those in the bottom half, so they
      // never run across the centre.
      const label = trunc(repo.name, 14);
      const lw = label.length * 5.8;
      const lx = r1(Math.max(RX + 14 + lw / 2, Math.min(RX + RW - 14 - lw / 2, bx)));
      const ly = r1(by > oy ? by + br + 12 : by - br - 6);
      const delay = -r1(SWEEP_T - (bearing / 360) * SWEEP_T);
      return `<g class="ping" style="animation-delay:${delay}s"><circle cx="${bx}" cy="${by}" r="${r1(br * 2.6)}" fill="#2be3c8" opacity=".18"/><circle cx="${bx}" cy="${by}" r="${br}" fill="#9cfbea"/>
<text x="${lx}" y="${ly}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="#c9fff4">${escapeXml(label)}</text></g>`;
    })
    .join('');
  const wedge = Array.from({ length: 16 }, (_, i) => {
    const a0 = ((-90 - (i + 1) * 3) * Math.PI) / 180;
    const a1 = ((-90 - i * 3) * Math.PI) / 180;
    return `<path d="${pth`M${ox} ${oy}L${ox + Math.cos(a0) * R} ${oy + Math.sin(a0) * R}A${R} ${R} 0 0 1 ${ox + Math.cos(a1) * R} ${oy + Math.sin(a1) * R}Z`}" fill="#2be3c8" opacity="${r1((0.3 * (1 - i / 16)) * 100) / 100}"/>`;
  }).join('');
  const bearingTicks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180;
    const r0 = i % 3 === 0 ? R - 7 : R - 4;
    return pth`M${ox + Math.cos(a) * r0} ${oy + Math.sin(a) * r0}L${ox + Math.cos(a) * R} ${oy + Math.sin(a) * R}`;
  }).join('');
  const sonarCard = `<g class="fade" style="animation-delay:.9s">
<rect x="${RX}" y="${SY}" width="${RW}" height="${LH}" rx="10" fill="${c.card}" fill-opacity="${c.cardOp}" stroke="${c.cardEdge}"/>
<text x="${RX + 20}" y="${SY + 30}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="2.4" fill="${c.cardText}">ON SONAR</text>
<text x="${RX + RW - 16}" y="${SY + 30}" text-anchor="end" font-family="${UI}" font-size="10" fill="${c.cardMuted}">featured repos</text>
<path d="M${RX + 14} ${SY + 42}H${RX + RW - 14}" stroke="${c.cardText}" stroke-opacity=".14"/>
<circle cx="${ox}" cy="${oy}" r="${R + 8}" fill="#04161f" stroke="${dark ? '#1f3d4d' : '#9ec8cf'}" stroke-width="2"/>
<g fill="none" stroke="#2be3c8" stroke-opacity=".22"><circle cx="${ox}" cy="${oy}" r="${R}"/><circle cx="${ox}" cy="${oy}" r="${R * 0.66}"/><circle cx="${ox}" cy="${oy}" r="${R * 0.33}"/><path d="M${ox - R} ${oy}H${ox + R}M${ox} ${oy - R}V${oy + R}"/></g>
<path d="${bearingTicks}" stroke="#2be3c8" stroke-opacity=".4"/>
<g class="sweep" style="transform-origin:${ox}px ${oy}px">${wedge}<path d="M${ox} ${oy}V${oy - R}" stroke="#9cfbea" stroke-width="1.5"/></g>
${blips || `<text x="${ox}" y="${oy + R * 0.55}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="#7fd9c8">NO CONTACTS YET</text>`}
<circle cx="${ox}" cy="${oy}" r="3" fill="#9cfbea"/>
<text x="${ox}" y="${oy + 14}" text-anchor="middle" font-family="${MONO}" font-size="7.5" letter-spacing="1.4" fill="#7fd9c8">YOU</text>
</g>`;

  const first = n.days[0]?.date;
  const last = n.days[n.days.length - 1]?.date;
  const css = `
.fob{animation:fob .7s ease-out both}
.fade{animation:fade .8s ease-out both}
.rise{animation:rise .7s ${EXPO} both}
.pop{animation:pop .5s ${EXPO} both}
.sweepIn{transform-box:fill-box;transform-origin:left center;animation:grow ${SWEEP}s linear ${SWEEP0}s both}
.diver{animation:pop .6s ${EXPO} ${(SWEEP0 + SWEEP).toFixed(2)}s both}
.write{transform-box:fill-box;transform-origin:left center;animation:grow .7s linear both}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow .8s ${EXPO} both}
.stamp{transform-box:fill-box;transform-origin:center;animation:slap .55s ease-out 2.6s both}
.sweep{animation:sweep ${SWEEP_T}s linear infinite}
.ping{animation:ping ${SWEEP_T}s linear infinite}
@keyframes fob{from{opacity:1}}
@keyframes fade{from{opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes pop{from{opacity:0;transform:translateY(6px)}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes slap{0%{opacity:0;transform:scale(1.7)}55%{opacity:1;transform:scale(.95)}}
@keyframes sweep{from{transform:rotate(-360deg)}}
@keyframes ping{0%{opacity:1}70%{opacity:.3}100%{opacity:.3}}
${REDUCED}`;

  const aria = `Dive log for the last 365 days: ${fmt(n.depth)} metres down at one metre per contribution, the ${n.zone.name.toLowerCase()} zone. ${fmt(n.active)} active days, longest streak ${n.streak} days, longest break ${n.rest?.length || 0} days, ${fmt(n.followers)} followers, ${fmt(n.stars)} stars, ${n.years} years on GitHub.${
    langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''
  }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.panel[0]}"/><stop offset="1" stop-color="${c.panel[1]}"/></linearGradient>
  <clipPath id="chart"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="6"/></clipPath>
  <clipPath id="sweepClip"><rect class="sweepIn" x="${X0 - 4}" y="${Y0 - 40}" width="${X1 - X0 + 40}" height="${Y1 - Y0 + 60}"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g class="fade">
    <text x="48" y="64" font-family="${SERIF}" font-size="32" fill="${c.fg}">Dive log</text>
    <text x="48" y="88" font-family="${MONO}" font-size="10" letter-spacing="1.6" fill="${c.cardMuted}">${escapeXml(site.toUpperCase())}  ·  ${monthYear(first)} – ${monthYear(last)}  ·  1 M PER CONTRIBUTION</text>
    <g font-family="${UI}" font-size="11" fill="${c.cardMuted}">
      <path d="M${X1 - 300} 60h22" stroke="${c.line}" stroke-width="2.2"/><text x="${X1 - 272}" y="64">your descent</text>
      <circle cx="${X1 - 174}" cy="60" r="3.4" fill="none" stroke="${c.line}" stroke-opacity=".8"/><text x="${X1 - 165}" y="64">one active day</text>
      <circle cx="${X1 - 66}" cy="60" r="4" fill="${c.panel[0]}" stroke="${c.line}" stroke-width="1.8"/><text x="${X1 - 57}" y="64">new zone</text>
    </g>
  </g>
  <g class="fade" style="animation-delay:.2s">
    <g clip-path="url(#chart)">${bands}</g>
    ${bandLabels}
    ${bounds}
    <text x="${X1 + 10}" y="${Y0 + 3}" font-family="${MONO}" font-size="9" fill="${c.cardMuted}">0 m</text>
    <path d="${pth`M${X0} ${Y0}`}${Array.from({ length: 48 }, (_, i) => pth`q${(X1 - X0) / 96} -3 ${(X1 - X0) / 48} 0`).join('')}" fill="none" stroke="${c.fg}" stroke-opacity=".45" stroke-width="1.2"/>
    <text x="${X0 + 8}" y="${Y0 - 9}" font-family="${MONO}" font-size="8.5" letter-spacing="1.6" fill="${c.cardMuted}">SURFACE · ${dayMonth(first)}</text>
    ${months}
  </g>
  <g clip-path="url(#sweepClip)">
    <g clip-path="url(#chart)">
      <path d="${area}" fill="${c.line}" opacity="${dark ? 0.07 : 0.06}"/>
      ${dark ? `<path d="${line}" fill="none" stroke="${c.line}" stroke-width="7" stroke-opacity=".14" stroke-linejoin="round"/>` : `<path d="${line}" fill="none" stroke="#ffffff" stroke-width="5" stroke-opacity=".7" stroke-linejoin="round"/>`}
      <path d="${line}" fill="none" stroke="${c.line}" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
  </g>
  <g fill="${dark ? c.line : '#ffffff'}" fill-opacity="${dark ? 0.1 : 0.55}" stroke="${dark ? c.line : c.line}" stroke-opacity="${dark ? 0.7 : 0.5}" stroke-width="1">${bubbles}</g>
  ${marks}
  <g class="diver"><g transform="translate(${r1(end[0] - 16)} ${r1(end[1] - 2)}) rotate(${n.depth ? 24 : 0})">${diverGlyph(c.fg, c.line)}</g>
  <text x="${r1(end[0] - 40)}" y="${r1(end[1] + (end[1] + 26 < Y1 - 4 ? 26 : -16))}" text-anchor="end" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="1.2" fill="${c.cardText}">${fmt(n.depth)} M · TODAY</text></g>
  ${logbook}
  ${speciesCard}
  ${sonarCard}
  <rect class="fob" width="${W}" height="${H}" fill="${c.panel[0]}" opacity="0"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.fg}" stroke-opacity=".08"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. End card — back at the surface
// ---------------------------------------------------------------------------

export function surfaceSvg(profile, themeName, { signoff, postscript }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 260;
  const WL = 122; // the waterline
  const n = fathomNumbers(profile);
  const rand = seededRandom(`fathom-end:${profile.login}`);

  const big = String(signoff);
  const blen = Math.max(1, [...big].length);
  const bs = Math.round(Math.max(30, Math.min(50, 640 / (blen * 0.46))));
  const bw = r1(Math.min(640, blen * bs * 0.46));
  const tx = 520;

  // Waves: an overscanned strip that sloshes in the drift loop.
  let wave = `M-80 ${WL}`;
  for (let x = -80; x < W + 80; x += 60) wave += pth`q15 ${-4 - rand() * 3} 30 0t30 0`;
  const waterPath = `${wave}V${H + 10}H-80Z`;

  const stars = c.stars
    ? Array.from({ length: 40 }, () => `<circle cx="${r1(rand() * W)}" cy="${r1(rand() * (WL - 20))}" r="${r1(0.4 + rand() * 0.9)}" opacity="${r1((0.3 + rand() * 0.6) * 100) / 100}"/>`).join('')
    : '';

  // The buddy is still down there: their bubbles rise along the buoy line.
  const bubbles = Array.from({ length: 14 }, (_, i) => {
    const x = r1(196 + (rand() - 0.5) * 40 + i * 1.5);
    const r = r1(1.6 + rand() * 4);
    return `<g class="up" opacity="0" style="animation-duration:${(2.6 + rand() * 2.4).toFixed(2)}s;animation-delay:-${(rand() * 4).toFixed(2)}s"><circle cx="${x}" cy="${WL + 10}" r="${r}" fill="${c.bubble}" fill-opacity=".15" stroke="${c.bubble}" stroke-opacity=".75"/></g>`;
  }).join('');

  // Light shafts fan down from where the sky is brightest.
  const rays = [70, 250, 470, 700, 910, 1110]
    .map((x, i) => {
      const xt = 430 + (x - 430) * 0.82;
      const xb = x + (x - 430) * 0.1;
      const w = 18 + (i % 3) * 10;
      const beam = (k) => pth`M${xt - w * 0.3 * k} ${WL}L${xt + w * 0.3 * k} ${WL}L${xb + w * k} ${H}L${xb - w * k} ${H}Z`;
      return `<path d="${beam(1)}" fill="url(#shaft)" opacity=".5"/><path d="${beam(0.4)}" fill="url(#shaft)" opacity=".8"/>`;
    })
    .join('');
  const shimmer = causticNet(seededRandom(`end-net:${profile.login}`), -80, 0, W + 160, 76, 26);
  // A small school passing under the surface.
  const school = Array.from({ length: 8 }, (_, i) => {
    const fx = r1(404 + (i % 4) * 22 + (rand() - 0.5) * 12);
    const fy = r1(176 + Math.floor(i / 4) * 18 + (i % 2) * 7 + (rand() - 0.5) * 6);
    return fishGlyph(dark ? '#05202f' : '#1b7690', fx, fy, 0.62 + rand() * 0.18);
  }).join('');
  const birds = dark
    ? ''
    : [
        [300, 30, 1],
        [326, 40, 0.8],
        [352, 26, 0.7],
      ]
        .map(([x, y, k]) => `<path d="${pth`M${x - 7 * k} ${y - 2 * k}q${3.5 * k} -3 ${7 * k} 2q${3.5 * k} -5 ${7 * k} -2`}" fill="none" stroke="#3b6f80" stroke-width="1.4" stroke-linecap="round"/>`)
        .join('');

  const buoyX = 180;
  const buoy = `<path d="${pth`M${buoyX} ${WL + 10}C${buoyX + 6} ${WL + 60} ${buoyX + 30} ${WL + 100} ${buoyX + 18} ${H + 10}`}" fill="none" stroke="${dark ? '#c9b48a' : '#7a5a2e'}" stroke-opacity=".7" stroke-width="1.6"/>
<path d="M${buoyX} ${WL - 6}V${WL - 86}" stroke="${dark ? '#d9e2e8' : '#5b6670'}" stroke-width="2.4" stroke-linecap="round"/>
<g transform="translate(${buoyX + 1} ${WL - 84})"><path d="M0 0H56V38H0Z" fill="#e5322d"/><path d="M0 0H9L56 31V38H47L0 7Z" fill="#ffffff"/><path d="M56 0V38" stroke="#000" stroke-opacity=".15"/></g>
<ellipse cx="${buoyX}" cy="${WL - 2}" rx="20" ry="13" fill="#ff6a2b"/><path d="M${buoyX - 20} ${WL - 4}h40v4h-40z" fill="#ffffff" opacity=".9"/><ellipse cx="${buoyX - 7}" cy="${WL - 8}" rx="6" ry="3" fill="#ffffff" opacity=".35"/>`;
  const bottleX = 332;
  const bottle = `<g transform="translate(${bottleX} ${WL - 3}) rotate(-16)">
<path d="M-34 -9H14Q22 -9 26 -5H38V5H26Q22 9 14 9H-34Q-40 9 -40 0Q-40 -9 -34 -9Z" fill="${dark ? '#5fc9b0' : '#3fa98c'}" fill-opacity=".45" stroke="${dark ? '#a9f0de' : '#2c7d68'}" stroke-opacity=".8" stroke-width="1.2"/>
<rect x="38" y="-4" width="7" height="8" rx="1.5" fill="#b0824f"/>
<rect x="-30" y="-5.5" width="40" height="11" rx="5.5" fill="#f6ecd2"/><path d="M-12 -5.5V5.5" stroke="#d24a3c" stroke-width="2"/>
<path d="M-33 -6H8" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/></g>`;

  const ps = String(postscript || '');
  const kicker = `SURFACED  ·  ${fmt(n.years)} ${n.years === 1 ? 'YEAR' : 'YEARS'} IN THE WATER`;

  const css = `
.fob{animation:fob .8s ease-out both}
.surface{animation:surface 1.2s ${EXPO} .5s both}
.fade{animation:fade .9s ease-out both}
.drift{animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.up{animation-name:up;animation-timing-function:cubic-bezier(.4,0,.8,.6);animation-iteration-count:infinite}
@keyframes fob{from{opacity:1}}
@keyframes fade{from{opacity:0}}
@keyframes surface{from{transform:translateY(${bs + 10}px)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(7px,-5px)}}
@keyframes up{0%{opacity:0;transform:translateY(${H - WL}px)}12%{opacity:1}88%{opacity:1}100%{opacity:0;transform:translateY(0)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`Back at the surface beside a diver-down buoy and a message in a bottle. ${signoff} ${postscript}`)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath>
  <clipPath id="air"><rect width="${W}" height="${WL + 1}"/></clipPath>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="${WL}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient>
  <linearGradient id="sea" x1="0" y1="${WL}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.seaTop}"/><stop offset="1" stop-color="${c.seaBot}"/></linearGradient>
  <linearGradient id="shaft" x1="0" y1="${WL}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.ray}" stop-opacity="${dark ? 0.14 : 0.32}"/><stop offset="1" stop-color="${c.ray}" stop-opacity="0"/></linearGradient>
  <linearGradient id="netFade" x1="0" y1="${WL}" x2="0" y2="${WL + 30}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="net" maskUnits="userSpaceOnUse" x="0" y="${WL}" width="${W}" height="32"><rect y="${WL}" width="${W}" height="32" fill="url(#netFade)"/></mask>
  <linearGradient id="under" x1="0" y1="${WL}" x2="0" y2="${WL + 26}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.surf}" stop-opacity="${dark ? 0.32 : 0.6}"/><stop offset="1" stop-color="${c.surf}" stop-opacity="0"/></linearGradient>
  <radialGradient id="glow" cx="430" cy="${WL}" r="360" gradientUnits="userSpaceOnUse" gradientTransform="translate(430 ${WL}) scale(1 .4) translate(-430 ${-WL})"><stop offset="0" stop-color="${c.sun}" stop-opacity="${dark ? 0.18 : 0.7}"/><stop offset="1" stop-color="${c.sun}" stop-opacity="0"/></radialGradient>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${WL + 10}" fill="url(#sky)"/>
  <g fill="#ffffff">${stars}</g>
  ${dark ? `<path d="M436 30A14 14 0 1 0 446 54A12 12 0 1 1 436 30Z" fill="#eef6ff" opacity=".9"/>` : birds}
  <ellipse cx="430" cy="${WL}" rx="360" ry="150" fill="url(#glow)"/>
  ${loop('drift', { dur: 4.2, kx: 2.2, ky: 0.6 }, `<path d="${waterPath}" fill="url(#sea)"/><path d="${wave}" fill="none" stroke="${c.surf}" stroke-opacity="${dark ? 0.5 : 0.9}" stroke-width="1.6"/>`)}
  <rect y="${WL}" width="${W}" height="26" fill="url(#under)"/>
  <g mask="url(#net)"><g transform="translate(0 ${WL + 1}) scale(1 .4)">${loop('drift', { dur: 5.2, delay: 1, kx: 2.6, ky: 1 }, `<path d="${shimmer}" fill="none" stroke="${c.surf}" stroke-opacity="${dark ? 0.22 : 0.5}" stroke-width="1.6"/>`)}</g></g>
  ${rays}
  ${loop('drift', { dur: 6.5, delay: 2, kx: 4, ky: 1.2 }, school)}
  ${bubbles}
  ${loop('drift', { dur: 3.4, delay: 0.6, kx: 0.6, ky: 0.9 }, buoy)}
  ${loop('drift', { dur: 4.4, delay: 1.8, kx: 1.4, ky: 1.1, reverse: true }, bottle)}
  <text class="fade" style="animation-delay:.25s" x="${tx}" y="44" font-family="${MONO}" font-size="11" letter-spacing="2.4" fill="${dark ? c.muted : c.muted}">${escapeXml(kicker)}</text>
  <g clip-path="url(#air)"><text class="surface" x="${tx}" y="${WL - 18}" textLength="${bw}" lengthAdjust="spacingAndGlyphs" font-family="${SERIF}" font-size="${bs}" fill="${dark ? c.fg : '#05324a'}">${escapeXml(big)}</text></g>
  ${ps ? `<text class="fade" style="animation-delay:1.3s" x="${tx}" y="${WL + 50}" font-family="${SERIF}" font-style="italic" font-size="18" fill="${dark ? c.fg : '#05324a'}" fill-opacity=".9">${escapeXml(trunc(ps, 64))}</text>` : ''}
  <text class="fade" style="animation-delay:1.6s" x="${tx}" y="${WL + 92}" font-family="${MONO}" font-size="10.5" letter-spacing="2" fill="${dark ? c.muted : '#05324a'}" fill-opacity="${dark ? 1 : 0.75}">@${escapeXml(profile.login.toUpperCase())}  ·  ${fmt(n.depth)} M  ·  ${n.zone.name.toUpperCase()} ZONE</text>
  <rect class="fob" width="${W}" height="${H}" fill="${dark ? c.sky[0] : c.sky[1]}" opacity="0"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${c.fg}" stroke-opacity=".1"/>
</svg>`;
}
