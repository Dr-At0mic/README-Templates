// Pacman — animated SVG artwork: your year as an arcade maze.
//
// Hero: the attract screen of an arcade game built from your profile. The maze is your
// contribution calendar, one column per week and one row per weekday, with a pellet for every day
// (bigger and brighter on busier days) and your busiest days as the power pellets. The walls are
// generated from your username and mirrored like a real arcade board, and your name is lit in the
// same neon tubing. After READY! a demo game plays: the chomper heads for a power pellet, powers
// up and eats the ghosts, which are your featured repos; each one pops its stars. The demo is
// simulated here, tick by tick, and baked into keyframes.
// Scoreboard: the ghosts introduced one by one with their projects, your numbers as a high-score
// table, and your languages as bonus items.
// End card: an intermission chase, then the chomper writes your sign-off.
//
// The chomper, ghosts, maze and lettering are drawn from scratch: no sprites, logos or level
// layouts from any existing game. Same rules as the other animated templates: CSS keyframes only,
// the un-animated state is the final frame, at most two infinite loops per image, no filters,
// no web fonts (the arcade lettering is drawn as paths), and prefers-reduced-motion stops everything.

import { seededRandom } from '../../lib/random';
import { langColor } from '../adhd/art';
import { escapeXml } from '../pulsar/art';

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';

// The two loops each image is allowed: `flip` (an on/off blink: power pellets, the 1UP label, the
// two frames of a ghost's skirt) and `chomp` (the jaws; each jaw rests open, so the keyframe only
// names the closed middle).
const LOOPS = `@keyframes flip{0%,49.9%{opacity:1}50%,100%{opacity:0}}
@keyframes chomp{50%{transform:rotate(0deg)}}`;

// Shared one-shot keyframes. `fade` doubles as a step (hidden until its delay) with step-end, and
// `held` keeps something visible until it is eaten or its moment has passed.
const SEQ = `@keyframes fade{from{opacity:0}}
@keyframes held{from{opacity:1}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes crt{from{transform:scaleY(.004)}}
@keyframes pop{from{transform:scale(0)}}
@keyframes draw{from{stroke-dashoffset:1}}`;

export const THEMES = {
  dark: {
    bg: '#05060f',
    vignette: '#000000',
    vignetteOp: 0.6,
    scan: '#ffffff',
    scanOp: 0.03,
    line: '#ffffff',
    lineOp: 0.08,
    fg: '#eef0ff',
    muted: '#8a90bd',
    faint: '#30355c',
    wall: ['#4566ff', '#2b3dff'],
    wallGlow: '#2f4dff',
    wallGlowOp: 0.2,
    name: ['#8fe9ff', '#4f86ff', '#8a5cff'],
    nameGlow: '#4d74ff',
    nameGlowOp: 0.22,
    door: '#ffb8de',
    pellet: '#ffcfb5',
    levels: [0.3, 0.55, 0.72, 0.88, 1],
    chomper: '#ffe53b',
    chomperEdge: 'none',
    ghosts: ['#ff4d4d', '#ff7ad9', '#35e3ff', '#ffa53b'],
    ghostEdge: 'none',
    fright: '#2f3dff',
    frightFace: '#ffd9c7',
    eye: '#ffffff',
    pupil: '#1c2bd9',
    ready: '#ffe53b',
    popup: '#35e3ff',
    rows: ['#ff4d4d', '#ffa53b', '#ffe53b', '#7dff6a', '#35e3ff', '#7a8cff', '#ff7ad9'],
  },
  light: {
    bg: '#f5f3ec',
    vignette: '#d9d3c2',
    vignetteOp: 0.55,
    scan: '#000000',
    scanOp: 0.025,
    line: '#000000',
    lineOp: 0.1,
    fg: '#141833',
    muted: '#5d6386',
    faint: '#cbc7ba',
    wall: ['#2747e0', '#1b30c2'],
    wallGlow: '#2747e0',
    wallGlowOp: 0.08,
    name: ['#0a89c9', '#1f3fd6', '#6a35d0'],
    nameGlow: '#1f3fd6',
    nameGlowOp: 0.08,
    door: '#d9539a',
    pellet: '#c4572c',
    levels: [0.3, 0.5, 0.68, 0.84, 1],
    chomper: '#ffc61a',
    chomperEdge: '#6e4a00',
    ghosts: ['#e8364a', '#dc4fa0', '#0aa3c6', '#ef8a1a'],
    ghostEdge: '#141833',
    fright: '#2438d6',
    frightFace: '#ffe9de',
    eye: '#ffffff',
    pupil: '#1c2bd9',
    ready: '#b07a00',
    popup: '#0a86a8',
    rows: ['#d92d40', '#d9741a', '#a88400', '#2f9a2a', '#0a8fb0', '#3a4fd6', '#c2408a'],
  },
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const trunc = (s, n) => {
  const str = String(s ?? '');
  return str.length > n ? `${str.slice(0, Math.max(1, n - 1)).trimEnd()}…` : str;
};
const short = (v) => (v >= 10000 ? `${Math.round(v / 1000)}K` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v));
const dayMonth = (iso) => (iso ? `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}` : '');
const secs = (t) => `${r2(t)}s`;

// Rounds every number interpolated into a path, so the markup stays small.
const pth = (strings, ...vals) =>
  strings.reduce((s, str, i) => s + str + (i < vals.length ? (typeof vals[i] === 'number' ? r1(vals[i]) : vals[i]) : ''), '');

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

function mix(a, b, t) {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a);
  const B = p(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

// ---------------------------------------------------------------------------
// Lettering
// ---------------------------------------------------------------------------

// A 5×7 pixel font for the arcade text (HUD, labels, scores). Rows top to bottom.
const PIXEL = {
  ' ': '..... ..... ..... ..... ..... ..... .....',
  A: '.###. #...# #...# ##### #...# #...# #...#',
  B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  D: '###.. #..#. #...# #...# #...# #..#. ###..',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####',
  H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
  L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ..#.. .#... #.... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.',
  1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ...#. ..#.. .#... #####',
  3: '##### ...#. ..#.. ...#. ....# #...# .###.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.',
  7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.',
  9: '.###. #...# #...# .#### ....# ...#. .##..',
  '.': '..... ..... ..... ..... ..... .##.. .##..',
  ',': '..... ..... ..... ..... .##.. ..#.. .#...',
  ':': '..... .##.. .##.. ..... .##.. .##.. .....',
  ';': '..... .##.. .##.. ..... .##.. ..#.. .#...',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..',
  '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  '-': '..... ..... ..... .###. ..... ..... .....',
  _: '..... ..... ..... ..... ..... ..... #####',
  "'": '..#.. ..#.. .#... ..... ..... ..... .....',
  '"': '.#.#. .#.#. ..... ..... ..... ..... .....',
  '/': '....# ....# ...#. ..#.. .#... #.... #....',
  '|': '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  '·': '..... ..... ..... ..#.. ..... ..... .....',
  '★': '..#.. ..#.. ##### .###. .#.#. #...# .....',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  '*': '..... #.#.# .###. ##### .###. #.#.# .....',
  '=': '..... ..... ##### ..... ##### ..... .....',
  '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##',
  '#': '.#.#. ##### .#.#. .#.#. .#.#. ##### .#.#.',
  '@': '.###. #...# #.### #.#.# #.##. #.... .####',
  '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.',
  ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  '<': '...#. ..#.. .#... #.... .#... ..#.. ...#.',
  '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...',
  '×': '..... #...# .#.#. ..#.. .#.#. #...# .....',
};

const pixelSafe = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ');
const canPixel = (s) => [...pixelSafe(s)].every((ch) => PIXEL[ch]);
const pixelWidth = (s, px) => {
  const len = [...pixelSafe(s)].length;
  return len ? (len * 6 - 1) * px : 0;
};

function glyphPath(ch) {
  return PIXEL[ch]
    .split(' ')
    .map((row, y) => {
      let d = '';
      for (let x = 0; x < 5; x++) {
        if (row[x] !== '#') continue;
        let e = x;
        while (e < 5 && row[e] === '#') e++;
        d += `M${x} ${y}h${e - x}v1h${x - e}z`;
        x = e;
      }
      return d;
    })
    .join('');
}

// Pixel text is <use> of one path per glyph, so a glyph costs its outline once per image.
// Strings the font can't draw (accents are folded away first) fall back to a monospace <text>.
function pixelKit() {
  const used = new Set();
  const id = (ch) => `px${ch.codePointAt(0).toString(16)}`;
  const glyphs = (str) =>
    [...str]
      .map((ch, i) => {
        if (ch === ' ') return '';
        used.add(ch);
        return `<use xlink:href="#${id(ch)}" x="${i * 6}"/>`;
      })
      .join('');
  function text(s, x, y, px, { anchor = 'start', fill, attrs = '' } = {}) {
    const str = pixelSafe(s);
    if (!str.trim()) return '';
    if (![...str].every((ch) => PIXEL[ch])) {
      return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" font-family="${MONO}" font-size="${r1(px * 8)}" font-weight="700" fill="${fill}"${attrs}>${escapeXml(String(s).toUpperCase())}</text>`;
    }
    const w = pixelWidth(str, px);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return `<g transform="translate(${r2(x0)} ${r2(y - 7 * px)}) scale(${px})" fill="${fill}"${attrs}>${glyphs(str)}</g>`;
  }
  // A strip of digits 0-9 four times over, for rolling counters.
  function strip() {
    [...'0123456789'].forEach((ch) => used.add(ch));
    return `<g id="dstrip">${Array.from({ length: 40 }, (_, i) => `<use xlink:href="#${id(String(i % 10))}" y="${i * 9}"/>`).join('')}</g><clipPath id="dclip"><rect x="-.5" y="-.5" width="6" height="8"/></clipPath>`;
  }
  const defs = () => [...used].map((ch) => `<path id="${id(ch)}" d="${glyphPath(ch)}"/>`).join('');
  return { text, strip, defs };
}

// Rolling counter in pixel digits: every digit turns as many times as it really would, folded into
// a strip of four laps, from 0 up to `value`.
function pixelCounter(value, digits, x, baseline, px, fill, { anchor = 'start', cls = 'roll' } = {}) {
  const str = String(Math.max(0, Math.round(value))).padStart(digits, '0');
  const w = (str.length * 6 - 1) * px;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return `<g transform="translate(${r2(x0)} ${r2(baseline - 7 * px)}) scale(${px})" fill="${fill}">${[...str]
    .map((_, i) => {
      const p = 10 ** (str.length - 1 - i);
      let idx = Math.floor(value / p);
      while (idx > 39) idx -= 10;
      return `<g transform="translate(${i * 6} 0)" clip-path="url(#dclip)"><g class="${cls}" style="transform:translateY(${-idx * 9}px)"><use xlink:href="#dstrip"/></g></g>`;
    })
    .join('')}</g>`;
}

// Neon lettering for the name: a stroke font traced on a 4×6 grid, drawn with the same doubled
// tube as the maze walls. Glyphs are [width, path] with M/L/H/V/Z in grid units.
const TUBE = {
  A: [4, 'M0 6V0H4V6M0 3.2H4'],
  B: [4, 'M3.2 3V0H0V6H4V3H0'],
  C: [4, 'M4 0H0V6H4'],
  D: [4, 'M0 0H2.6L4 1.6V4.4L2.6 6H0Z'],
  E: [4, 'M4 0H0V6H4M0 3H3'],
  F: [4, 'M4 0H0V6M0 3H3'],
  G: [4, 'M4 0H0V6H4V3.2H2'],
  H: [4, 'M0 0V6M4 0V6M0 3H4'],
  I: [2, 'M0 0H2M1 0V6M0 6H2'],
  J: [4, 'M1 0H4V6H0V4.4'],
  K: [4, 'M0 0V6M4 0L1.2 3H0M1.2 3L4 6'],
  L: [4, 'M0 0V6H4'],
  M: [5, 'M0 6V0L2.5 3.4L5 0V6'],
  N: [4, 'M0 6V0L4 6V0'],
  O: [4, 'M0 0H4V6H0Z'],
  P: [4, 'M0 6V0H4V3.2H0'],
  Q: [4, 'M0 0H4V6H0ZM2.6 4.6L4.4 6.4'],
  R: [4, 'M0 6V0H4V3.2H0M1.8 3.2L4 6'],
  S: [4, 'M4 0H0V3H4V6H0'],
  T: [4, 'M0 0H4M2 0V6'],
  U: [4, 'M0 0V6H4V0'],
  V: [4, 'M0 0V3.4L2 6L4 3.4V0'],
  W: [5, 'M0 0V6L2.5 2.6L5 6V0'],
  X: [4, 'M0 0L4 6M4 0L0 6'],
  Y: [4, 'M0 0L2 3L4 0M2 3V6'],
  Z: [4, 'M0 0H4L0 6H4'],
  0: [4, 'M0 0H4V6H0ZM1.2 4.4L2.8 1.6'],
  1: [4, 'M0.6 1.2L2 0V6M0.4 6H3.6'],
  2: [4, 'M0 0H4V3H0V6H4'],
  3: [4, 'M0 0H4V6H0M1 3H4'],
  4: [4, 'M0 0V3.6H4M3 0V6'],
  5: [4, 'M4 0H0V2.8H4V6H0'],
  6: [4, 'M4 0H0V6H4V3H0'],
  7: [4, 'M0 0H4L1.6 6'],
  8: [4, 'M0 0H4V6H0ZM0 3H4'],
  9: [4, 'M4 3H0V0H4V6H0'],
  '-': [3, 'M0.2 3H2.8'],
  _: [3.4, 'M0 6H3.4'],
  '.': [0.8, 'M0.4 5.9V6.1'],
  ',': [0.8, 'M0.6 5.6L0.2 7'],
  '!': [0.8, 'M0.4 0V3.8M0.4 5.9V6.1'],
  "'": [0.8, 'M0.4 0V1.6'],
  ' ': [2.4, ''],
};
const TUBE_GAP = 1.5;

// "M0 6V0H4" → [{ pts: [[0,6],[0,0],[4,0]], closed }]
function tubePolys(d) {
  const polys = [];
  const tokens = d.match(/[MLHVZ]|-?[\d.]+/g) || [];
  let cur = null;
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'M') {
      x = Number(tokens[++i]);
      y = Number(tokens[++i]);
      cur = { pts: [[x, y]], closed: false };
      polys.push(cur);
    } else if (t === 'L') {
      x = Number(tokens[++i]);
      y = Number(tokens[++i]);
      cur.pts.push([x, y]);
    } else if (t === 'H') {
      x = Number(tokens[++i]);
      cur.pts.push([x, y]);
    } else if (t === 'V') {
      y = Number(tokens[++i]);
      cur.pts.push([x, y]);
    } else if (t === 'Z') cur.closed = true;
  }
  return polys;
}

// A polyline with every corner rounded by a quadratic curve, so the doubled tube bends smoothly.
function roundPoly(pts, r, closed) {
  if (pts.length < 2) return '';
  if (pts.length === 2 && !closed) return pth`M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}`;
  const corner = (a, p, b) => {
    const d1 = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1;
    const d2 = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const k1 = Math.min(r, d1 / 2) / d1;
    const k2 = Math.min(r, d2 / 2) / d2;
    return { a: [p[0] + (a[0] - p[0]) * k1, p[1] + (a[1] - p[1]) * k1], p, b: [p[0] + (b[0] - p[0]) * k2, p[1] + (b[1] - p[1]) * k2] };
  };
  const seg = (k) => pth`L${k.a[0]} ${k.a[1]}Q${k.p[0]} ${k.p[1]} ${k.b[0]} ${k.b[1]}`;
  if (closed) {
    const n = pts.length;
    const ks = pts.map((p, i) => corner(pts[(i - 1 + n) % n], p, pts[(i + 1) % n]));
    return pth`M${ks[0].b[0]} ${ks[0].b[1]}` + ks.slice(1).map(seg).join('') + seg(ks[0]) + 'Z';
  }
  let d = pth`M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) d += seg(corner(pts[i - 1], pts[i], pts[i + 1]));
  const e = pts[pts.length - 1];
  return d + pth`L${e[0]} ${e[1]}`;
}

// Accents, so names keep their diacritics in neon: paths on the same grid, centred on x = 0, above
// the letter (or under it, for the cedilla).
const ACCENT = {
  '\u0301': 'M-0.5 -0.9L0.7 -2.1', // acute
  '\u0300': 'M0.5 -0.9L-0.7 -2.1', // grave
  '\u0302': 'M-1.1 -0.9L0 -2L1.1 -0.9', // circumflex
  '\u030c': 'M-1.1 -2L0 -0.9L1.1 -2', // caron
  '\u0303': 'M-1.4 -1.1L-0.5 -1.9L0.5 -1.1L1.4 -1.9', // tilde
  '\u0308': 'M-0.9 -1.5V-1.3M0.9 -1.5V-1.3', // diaeresis
  '\u0307': 'M0 -1.5V-1.3', // dot above
  '\u030a': 'M-0.6 -0.9H0.6V-2.1H-0.6Z', // ring
  '\u0327': 'M0 6V7.1L-0.8 7.7', // cedilla
};

// A letter and the accents on it, from the decomposed upper-case string.
const tubeClusters = (s) => String(s).toUpperCase().normalize('NFD').match(/\P{M}\p{M}*/gu) || [];
const canTube = (s) => tubeClusters(s).every((cl) => TUBE[cl[0]] && [...cl.slice(1)].every((mk) => ACCENT[mk]));
const tubeAccented = (s) => tubeClusters(s).some((cl) => [...cl.slice(1)].some((mk) => mk !== '\u0327'));
const tubeUnits = (s) => {
  const cls = tubeClusters(s);
  return cls.reduce((sum, cl) => sum + TUBE[cl[0]][0], 0) + TUBE_GAP * Math.max(0, cls.length - 1);
};

// One path per glyph, at grid unit `u` with the top-left corner of the line at (x, y).
function tubeGlyphs(s, x, y, u) {
  let cx = x;
  return tubeClusters(s)
    .map((cl) => {
      const ch = cl[0];
      const [w, d] = TUBE[ch];
      const at = (ox) => (poly) => roundPoly(poly.pts.map(([px, py]) => [cx + (ox + px) * u, y + py * u]), u * (ch === 'O' || ch === '0' ? 1.4 : 0.9), poly.closed);
      const pathD = tubePolys(d).map(at(0)).join('') + [...cl.slice(1)].map((mk) => tubePolys(ACCENT[mk]).map(at(w / 2)).join('')).join('');
      cx += (w + TUBE_GAP) * u;
      return pathD;
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Everything the artwork reads from the profile. The last 365 days are laid out like the
 * contribution calendar: 53 weeks of 7 days, Sunday first, the current week last.
 */
export function pacNumbers(profile) {
  const days = (profile.contributions?.days || []).slice(-365);
  let streak = 0;
  let run = 0;
  let peak = -1;
  days.forEach((d, i) => {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
    if (d.count > 0 && (peak < 0 || d.count > days[peak].count)) peak = i;
  });

  // The calendar grid: grid[week][weekday], week 52 being the current one.
  const last = days.length ? new Date(`${days[days.length - 1].date}T00:00:00Z`).getUTCDay() : 6;
  const pad = 6 - last;
  const grid = Array.from({ length: 53 }, () => Array(7).fill(null));
  days.forEach((d, i) => {
    const k = days.length - 1 - i + pad;
    const week = 52 - Math.floor(k / 7);
    if (week >= 0) grid[week][6 - (k % 7)] = { ...d, index: i };
  });

  // Pellet sizes by quartile of the active days, like the contribution calendar's four greens.
  const counts = days.map((d) => d.count).filter((v) => v > 0).sort((a, b) => a - b);
  const q = (f) => counts[Math.min(counts.length - 1, Math.floor(f * counts.length))] || 0;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  const level = (v) => (v <= 0 ? 0 : v <= cuts[0] ? 1 : v <= cuts[1] ? 2 : v <= cuts[2] ? 3 : 4);

  // Power pellets: the busiest days, at least four weeks apart so they spread over the board.
  const power = [];
  grid
    .flatMap((week, w) => week.map((day, d) => (day && day.count > 0 ? { w, d, ...day } : null)).filter(Boolean))
    .sort((a, b) => b.count - a.count || b.index - a.index)
    .forEach((p) => {
      if (power.length < 4 && power.every((o) => Math.abs(o.w - p.w) >= 4)) power.push(p);
    });

  const total = profile.contributions?.total ?? days.reduce((s, d) => s + d.count, 0);
  const thisYear = new Date().getFullYear();
  return {
    days,
    grid,
    level,
    power,
    total,
    active: counts.length,
    streak,
    peak: peak >= 0 ? { index: peak, ...days[peak] } : null,
    maxDay: peak >= 0 ? days[peak].count : 0,
    years: Math.max(1, thisYear - (profile.joinedYear || thisYear)),
    since: profile.joinedYear || thisYear,
    stars: profile.totalStars ?? (profile.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
    followers: profile.followers || 0,
  };
}

export const featuredRepos = (profile) => (profile.featured || []).map((r) => (profile.repos || []).find((x) => x.name === r)).filter(Boolean);

// ---------------------------------------------------------------------------
// The maze: the calendar as an arcade board
// ---------------------------------------------------------------------------

// Nodes are the centres of the corridors: 53 columns (weeks) by 9 rows. Row 0 is the top corridor,
// rows 1-7 are Sunday to Saturday, row 8 is the bottom corridor. The ghost pen hangs below the
// board in the middle, its door opening onto row 8. Row 4 (Wednesday) runs through a tunnel at both
// ends, so it wraps around.
const COLS = 53;
const ROWS = 9;
const MID = 26;
const TUN = 4;
const DOOR = [MID, 8];
const PEN_Y = 9.12;
const PEN_FLOOR = 9.8;
const SLOTS = [23.6, 25.2, 26.8, 28.4];
const START = [MID, 0];

/** Open neighbours of a node: [c, r, dx, dy, tunnel], in the arcade's tie-break order. */
function neighbours(m, c, r) {
  const out = [];
  if (r > 0 && !m.V[c][r - 1]) out.push([c, r - 1, 0, -1, 0]);
  if (c > 0 ? !m.H[c - 1][r] : r === TUN) out.push(c > 0 ? [c - 1, r, -1, 0, 0] : [COLS - 1, r, -1, 0, 1]);
  if (r < ROWS - 1 && !m.V[c][r]) out.push([c, r + 1, 0, 1, 0]);
  if (c < COLS - 1 ? !m.H[c][r] : r === TUN) out.push(c < COLS - 1 ? [c + 1, r, 1, 0, 0] : [0, r, 1, 0, 1]);
  return out;
}

function bfs(m, c0, r0) {
  const dist = new Int16Array(COLS * ROWS).fill(-1);
  const prev = new Int16Array(COLS * ROWS).fill(-1);
  const k0 = r0 * COLS + c0;
  const queue = [k0];
  dist[k0] = 0;
  for (let h = 0; h < queue.length; h++) {
    const k = queue[h];
    const c = k % COLS;
    const r = (k - c) / COLS;
    for (const [nc, nr] of neighbours(m, c, r)) {
      const nk = nr * COLS + nc;
      if (dist[nk] < 0) {
        dist[nk] = dist[k] + 1;
        prev[nk] = k;
        queue.push(nk);
      }
    }
  }
  return {
    dist: (c, r) => dist[r * COLS + c],
    path(c, r) {
      const out = [];
      let k = r * COLS + c;
      if (dist[k] < 0) return out;
      while (k !== k0) {
        out.unshift([k % COLS, Math.floor(k / COLS)]);
        k = prev[k];
      }
      return out;
    },
  };
}

/**
 * Walls between nodes, mirrored about the centre column like an arcade board. H[c][r] closes the
 * passage between (c, r) and (c+1, r); V[c][r] closes the one between (c, r) and (c, r+1). Walls go
 * in as short bars and L-shapes, and a piece is only kept if every node still has two ways out
 * (no dead ends) and the whole board stays connected.
 */
function buildMaze(seed) {
  const rand = seededRandom(`pacman:maze:${seed}`);
  const H = Array.from({ length: COLS - 1 }, () => Array(ROWS).fill(false));
  const V = Array.from({ length: COLS }, () => Array(ROWS - 1).fill(false));
  const m = { H, V };
  // Kept open: the corridor over the pen (READY! is written there), the tunnel mouths, and the
  // chomper's starting spot.
  const keep = ([k, c, r]) =>
    k === 'H' && ((r === 8 && c >= 21 && c <= 30) || (r === TUN && (c === 0 || c === COLS - 2)) || (r === 0 && c >= MID - 1 && c <= MID));
  const total = (COLS - 1) * ROWS + COLS * (ROWS - 1);
  let closed = 0;

  // Wall units run between posts, the corners between nodes: post (i, j) sits at (i - .5, j - .5).
  const run = (i, j, dx, dy, len) => {
    const out = [];
    let x = i;
    let y = j;
    for (let k = 0; k < len; k++) {
      if (dx) {
        const ix = dx > 0 ? x : x - 1;
        if (ix < 0 || ix > COLS - 1 || y < 1 || y > ROWS - 1) return null;
        out.push(['V', ix, y - 1]);
        x += dx;
      } else {
        const jy = dy > 0 ? y : y - 1;
        if (x < 1 || x > COLS - 1 || jy < 0 || jy > ROWS - 1) return null;
        out.push(['H', x - 1, jy]);
        y += dy;
      }
    }
    return { out, end: [x, y] };
  };
  const mirror = ([k, c, r]) => (k === 'V' ? ['V', COLS - 1 - c, r] : ['H', COLS - 2 - c, r]);
  const valid = () => {
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (neighbours(m, c, r).length < 2) return false;
    const b = bfs(m, START[0], START[1]);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (b.dist(c, r) < 0) return false;
    return true;
  };

  for (let tries = 0; tries < 2600 && closed < total * 0.27; tries++) {
    const i = Math.floor(rand() * (MID + 2));
    const j = Math.floor(rand() * (ROWS + 1));
    const horiz = rand() < 0.62;
    const sign = rand() < 0.5 ? -1 : 1;
    const a = horiz ? run(i, j, sign, 0, 1 + Math.floor(rand() * 4)) : run(i, j, 0, sign, 1 + Math.floor(rand() * 2));
    if (!a) continue;
    let units = a.out;
    if (rand() < 0.32) {
      const turn = rand() < 0.5 ? -1 : 1;
      const b = horiz ? run(a.end[0], a.end[1], 0, turn, 1 + Math.floor(rand() * 2)) : run(a.end[0], a.end[1], turn, 0, 1 + Math.floor(rand() * 3));
      if (b) units = units.concat(b.out);
    }
    units = units.concat(units.map(mirror));
    if (units.some(keep)) continue;
    const fresh = units.filter(([k, c, r]) => !m[k][c][r]);
    if (!fresh.length) continue;
    fresh.forEach(([k, c, r]) => (m[k][c][r] = true));
    if (valid()) closed += fresh.length;
    else fresh.forEach(([k, c, r]) => (m[k][c][r] = false));
  }
  return m;
}

// ---------------------------------------------------------------------------
// The demo game, simulated
// ---------------------------------------------------------------------------

const SPEED = { pac: 10, hunt: 11.5, ghost: 8.2, fright: 4, eyes: 24, pen: 5 };
const CATCH = 0.62; // sprites touch at this distance, in nodes
const FREEZE = 0.45; // the game holds for a beat on every ghost eaten
const DT = 1 / 120;
const CORNERS = [
  [0, 0],
  [COLS - 1, 0],
  [0, ROWS - 1],
  [COLS - 1, ROWS - 1],
];

const dirOf = (dx, dy) => (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : dy < 0 ? 'u' : 'd');

/**
 * Plays the demo: the chomper eats its way to a power pellet, then hunts the ghosts down one by one;
 * eaten ghosts float home to the pen as eyes. Returns each sprite's waypoints (seconds from the
 * start of play, node coordinates), its look and facing over time, the pellets eaten and when.
 * Several ghost plans are tried, and the first in which nobody catches the chomper before it
 * powers up is kept; the last plan only lets the ghosts out once it has, so it always works.
 */
function playDemo(m, n, ghostCount, seed) {
  const pellets = new Set();
  n.grid.forEach((week, w) => week.forEach((day, d) => day && pellets.add(`${w},${d + 1}`)));
  const powerNodes = n.power.length ? n.power.map((p) => [p.w, p.d + 1]) : CORNERS;
  const fromStart = bfs(m, START[0], START[1]);
  // The busiest day if the run there is a good length (long enough for the ghosts to get out,
  // short enough to keep the demo moving), otherwise the power pellet whose run comes closest.
  const runOf = ([c, r]) => fromStart.dist(c, r);
  const fit = (p) => Math.abs(Math.min(Math.max(runOf(p), 20), 34) - runOf(p));
  const target = fit(powerNodes[0]) === 0 ? powerNodes[0] : [...powerNodes].sort((a, b) => fit(a) - fit(b) || runOf(a) - runOf(b))[0];
  const toPower = fromStart.path(target[0], target[1]);
  const tPower = toPower.length / SPEED.pac;
  let today = [COLS - 1, 7];
  n.grid[52].forEach((day, d) => day && (today = [52, d + 1]));

  // Ghosts patrol the corners of a box around the chomper's power pellet, so they're close by
  // when it powers up.
  const clampC = (c) => Math.max(0, Math.min(COLS - 1, c));
  const order = [
    [clampC(target[0] - 6), 0],
    [clampC(target[0] + 6), ROWS - 1],
    [clampC(target[0] + 6), 0],
    [clampC(target[0] - 6), ROWS - 1],
  ];
  const gap = Math.max(0.15, Math.min(0.45, (tPower - 0.8) / 4));
  const plans = [
    { chase: [0], release: (i) => 0.1 + i * gap },
    { chase: [], release: (i) => 0.1 + i * gap },
    { chase: [], release: (i) => Math.max(0.2, tPower - 1.4) + i * 0.2 },
    { chase: [], release: (i) => tPower + 0.1 + i * 0.35, late: true },
  ];
  for (const plan of plans) {
    const out = simulate(m, { plan, toPower, today, pellets, ghostCount, order, seed });
    if (out) return { ...out, target };
  }
  return null;
}

function simulate(m, { plan, toPower, today, pellets, ghostCount, order, seed }) {
  const rand = seededRandom(`pacman:demo:${seed}`);
  const eaten = new Map();
  const popups = [];
  const sprite = (x, y, node) => ({ x, y, node, from: null, q: [], leg: null, path: [], wp: [{ t: 0, x, y }], dirs: [], looks: [], mode: 'wait' });
  const pac = sprite(START[0], START[1], START);
  pac.mode = 'go';
  pac.path = toPower.slice();
  pac.vis = [{ t: 0, v: 1 }];
  const ghosts = Array.from({ length: ghostCount }, (_, i) => {
    const g = sprite(SLOTS[i], PEN_Y, null);
    g.i = i;
    g.release = plan.release(i);
    g.target = plan.chase.includes(i) ? 'pac' : order[i % 4];
    g.fright = false;
    g.held = 0;
    g.looks.push({ t: 0, v: 'normal' });
    g.dirs.push({ t: 0, v: 'u' });
    return g;
  });
  let t = 0;
  let powerAt = null;
  let freezeUntil = -1;
  let doneAt = null;

  const face = (s, dx, dy, at) => {
    if (Math.abs(dx) + Math.abs(dy) < 1e-6) return;
    const dir = dirOf(dx, dy);
    if (!s.dirs.length || s.dirs[s.dirs.length - 1].v !== dir) s.dirs.push({ t: at, v: dir });
  };
  const look = (g, v, at) => {
    if (!g.looks.length || g.looks[g.looks.length - 1].v !== v) g.looks.push({ t: at, v });
  };
  // Queues the step to a neighbouring node. Through the tunnel the sprite leaves the board, jumps
  // round outside it (where the board's clip hides it) and comes back in from the other side.
  const step = (s, nb) => {
    if (!nb) return;
    const [c, r, dx, , tunnel] = nb;
    if (tunnel) {
      const out = dx < 0 ? -2 : COLS + 1;
      const back = dx < 0 ? COLS + 1 : -2;
      s.q.push({ x: out, y: r }, { x: out, y: -20, jump: 1 }, { x: back, y: -20, jump: 1 }, { x: back, y: r, jump: 1 });
    }
    s.q.push({ x: c, y: r, node: [c, r] });
  };
  const toward = (s, [c, r]) => neighbours(m, s.node[0], s.node[1]).find(([a, b]) => a === c && b === r);
  const nextNode = (s) => s.q.find((p) => p.node)?.node || s.node;
  const prey = () => ghosts.filter((g) => g.fright && (g.mode === 'roam' || g.mode === 'exit' || (g.mode === 'wait' && Number.isFinite(g.release))));

  // Decisions, taken whenever a sprite reaches a node.
  function decidePac(at) {
    const key = `${pac.node[0]},${pac.node[1]}`;
    if (pellets.has(key) && !eaten.has(key)) eaten.set(key, Math.max(0, at - 0.03));
    if (pac.mode === 'go') {
      if (pac.path.length) return step(pac, toward(pac, pac.path.shift()));
      powerUp(at);
    }
    if (pac.mode === 'home') {
      if (pac.path.length) return step(pac, toward(pac, pac.path.shift()));
      pac.mode = 'done';
      doneAt = at;
      return;
    }
    if (pac.mode !== 'hunt') return;
    const left = prey();
    if (!left.length) {
      pac.mode = 'done';
      doneAt = at;
      ghosts.forEach((g) => {
        if (g.fright) {
          g.fright = false;
          look(g, 'normal', at);
        }
      });
      return;
    }
    const b = bfs(m, pac.node[0], pac.node[1]);
    let best = null;
    left.forEach((g) => {
      const [c, r] = g.mode === 'roam' ? nextNode(g) : DOOR;
      const d = b.dist(c, r);
      if (d >= 0 && (!best || d < best.d)) best = { d, c, r, g };
    });
    if (!best) return;
    if (best.d === 0) {
      // Already on the node the ghost is making for: step toward where it actually is.
      const opts = neighbours(m, pac.node[0], pac.node[1]);
      const dist = (o) => Math.hypot(o[0] - best.g.x, o[1] - best.g.y);
      return step(pac, opts.reduce((a, o) => (dist(o) < dist(a) ? o : a), opts[0]));
    }
    step(pac, toward(pac, b.path(best.c, best.r)[0]));
  }

  function decideGhost(g) {
    if (g.mode === 'exit') g.mode = 'roam';
    const opts = neighbours(m, g.node[0], g.node[1]);
    const ahead = opts.filter(([c, r]) => !g.from || c !== g.from[0] || r !== g.from[1]);
    const choices = ahead.length ? ahead : opts;
    let pick;
    if (g.fright) {
      // Frightened ghosts wander at random, as they do in the arcade.
      pick = choices[Math.floor(rand() * choices.length)];
    } else {
      const [tx, ty] = g.target === 'pac' ? pac.node : g.target;
      const near = (o) => Math.hypot(o[0] - tx, o[1] - ty);
      pick = choices.reduce((a, o) => (near(o) < near(a) ? o : a), choices[0]);
    }
    step(g, pick);
  }

  function decideEyes(g) {
    if (g.node[0] === DOOR[0] && g.node[1] === DOOR[1]) {
      g.q.push({ x: DOOR[0], y: PEN_Y }, { x: SLOTS[g.i], y: PEN_Y, home: 1 });
      return;
    }
    if (!g.path.length) g.path = bfs(m, g.node[0], g.node[1]).path(DOOR[0], DOOR[1]);
    step(g, toward(g, g.path.shift()));
  }

  function powerUp(at) {
    powerAt = at;
    pac.mode = ghosts.length ? 'hunt' : 'home';
    if (!ghosts.length) pac.path = bfs(m, pac.node[0], pac.node[1]).path(today[0], today[1]);
    ghosts.forEach((g) => {
      if (g.mode === 'home' || g.mode === 'eyes') return;
      g.fright = true;
      look(g, 'fright', at);
      // Ghosts still in the pen stay in it (unless this plan lets them out now).
      if (g.mode === 'wait' && !plan.late) g.release = Infinity;
      // Ghosts out in the maze turn around on the spot.
      if (g.mode === 'roam' && g.q.length === 1 && g.q[0].node) {
        const back = g.node;
        g.node = g.q[0].node;
        g.q = [{ x: back[0], y: back[1], node: back }];
      }
    });
  }

  function catchGhost(g, at) {
    g.mode = 'eyes';
    g.fright = false;
    g.held = at + FREEZE;
    look(g, 'eyes', at);
    popups.push({ t: at, x: (g.x + pac.x) / 2, y: (g.y + pac.y) / 2, i: g.i });
    freezeUntil = at + FREEZE;
    pac.vis.push({ t: at, v: 0 }, { t: at + FREEZE, v: 1 });
    [pac, ...ghosts].forEach((s) => (s.mode !== 'eyes' || s === g) && s.wp.push({ t: at, x: s.x, y: s.y }, { t: at + FREEZE, x: s.x, y: s.y }));
    // Finish the step under way, then head home (decideEyes takes over at the next node).
    const k = g.q.findIndex((p) => p.node);
    g.q = k >= 0 ? g.q.slice(0, k + 1) : [];
    g.path = [];
    if (!g.q.length && g.node) decideEyes(g);
  }

  // Moves a sprite along its queue for `dt` seconds, recording a waypoint at every point reached
  // and turning it to face each new leg.
  function advance(s, speed, dt, onNode) {
    let budget = dt;
    while (budget > 1e-9 && s.q.length) {
      const p = s.q[0];
      const now = t + (dt - budget);
      if (p.jump) {
        s.x = p.x;
        s.y = p.y;
        s.wp.push({ t: Math.max(now, s.wp[s.wp.length - 1].t + 0.002), x: s.x, y: s.y });
        s.q.shift();
        continue;
      }
      if (s.leg !== p) {
        s.leg = p;
        face(s, p.x - s.x, p.y - s.y, now);
      }
      const d = Math.hypot(p.x - s.x, p.y - s.y);
      if (d <= speed * budget) {
        s.x = p.x;
        s.y = p.y;
        budget -= d / speed;
        s.q.shift();
        const done = t + (dt - budget);
        s.wp.push({ t: done, x: s.x, y: s.y });
        if (p.home) {
          s.mode = 'home';
          look(s, 'normal', done);
        }
        if (p.node) {
          s.from = s.node;
          s.node = p.node;
          if (onNode) onNode(done);
        }
      } else {
        s.x += ((p.x - s.x) / d) * speed * budget;
        s.y += ((p.y - s.y) / d) * speed * budget;
        budget = 0;
      }
    }
  }

  decidePac(0);
  const CAP = 26;
  while (t < CAP) {
    const frozen = t < freezeUntil;
    if (!frozen) {
      advance(pac, pac.mode === 'hunt' ? SPEED.hunt : SPEED.pac, DT, decidePac);
      ghosts.forEach((g) => {
        if (g.mode === 'wait' && t >= g.release) {
          g.mode = 'exit';
          g.q.push({ x: DOOR[0], y: PEN_Y }, { x: DOOR[0], y: DOOR[1], node: DOOR });
        }
        if (g.mode === 'exit' || g.mode === 'roam') advance(g, g.fright ? SPEED.fright : g.mode === 'exit' ? SPEED.pen : SPEED.ghost, DT, () => decideGhost(g));
      });
    }
    ghosts.forEach((g) => g.mode === 'eyes' && t >= g.held && advance(g, SPEED.eyes, DT, () => decideEyes(g)));
    t += DT;

    // Who touched whom.
    if (!frozen && pac.mode !== 'done') {
      for (const g of ghosts) {
        if ((g.mode !== 'roam' && g.mode !== 'exit') || Math.hypot(g.x - pac.x, g.y - pac.y) > CATCH) continue;
        if (!g.fright) return null; // caught before powering up: try another plan
        catchGhost(g, t);
        break;
      }
    }
    if (powerAt !== null && t - powerAt > 7.5 && pac.mode === 'hunt') {
      pac.mode = 'done';
      doneAt = t;
    }
    const settled = ghosts.every((g) => g.mode === 'home' || (g.mode === 'wait' && !Number.isFinite(g.release)) || (g.mode === 'roam' && g.fright));
    if (pac.mode === 'done' && !pac.q.length && t > freezeUntil && settled) break;
  }
  if (powerAt === null) return null;

  const end = Math.max(t, doneAt || 0) + 0.2;
  [pac, ...ghosts].forEach((s) => s.wp.push({ t: end, x: s.x, y: s.y }));
  return { pac, ghosts, eaten, popups, powerAt, end };
}

// Drops waypoints in the middle of straight runs at constant speed, so keyframes stay few.
function simplify(wp) {
  const out = [wp[0]];
  for (let i = 1; i < wp.length - 1; i++) {
    const a = out[out.length - 1];
    const b = wp[i];
    const c = wp[i + 1];
    const v1 = [(b.x - a.x) / Math.max(1e-6, b.t - a.t), (b.y - a.y) / Math.max(1e-6, b.t - a.t)];
    const v2 = [(c.x - b.x) / Math.max(1e-6, c.t - b.t), (c.y - b.y) / Math.max(1e-6, c.t - b.t)];
    if (Math.abs(v1[0] - v2[0]) > 0.01 || Math.abs(v1[1] - v2[1]) > 0.01) out.push(b);
  }
  out.push(wp[wp.length - 1]);
  return out;
}

// ---------------------------------------------------------------------------
// Sprites
// ---------------------------------------------------------------------------

// The chomper: two half discs that open and close, drawn around (0, 0) facing right.
function chomperSvg(R, fill, edge, loop = true, extra = '') {
  const jaw = (top) => `<path class="${loop ? 'jaw' : ''}" style="transform:rotate(${top ? -34 : 34}deg)" d="${pth`M${-R} 0A${R} ${R} 0 0 ${top ? 1 : 0} ${R} 0Z`}" fill="${fill}"${edge !== 'none' ? ` stroke="${edge}" stroke-width="${r1(Math.max(0.8, R * 0.09))}" stroke-linejoin="round"` : ''}/>`;
  return `<g${extra}>${jaw(true)}${jaw(false)}</g>`;
}

// A ghost of width s around (0, 0): a dome over a skirt with three points; the skirt has two
// frames that alternate, eyes look where it's going, and frightened ghosts get a wobbly mouth.
function ghostParts(s) {
  const hw = s / 2;
  const top = -s * 0.05;
  const base = s * 0.48;
  const skirt = s * 0.14;
  const body = pth`M${-hw} ${base - skirt + 0.5}V${top}A${hw} ${hw} 0 0 1 ${hw} ${top}V${base - skirt + 0.5}Z`;
  const teeth = (shift) => {
    const pts = [];
    for (let k = 0; k <= 6; k++) pts.push([hw - (k * s) / 6, base - (k % 2 === shift ? 0 : skirt)]);
    return pth`M${hw} ${base - skirt}` + pts.map(([x, y]) => pth`L${x} ${y}`).join('') + pth`L${-hw} ${base - skirt}Z`;
  };
  return {
    body,
    skirtA: teeth(0),
    skirtB: teeth(1),
    eyes: [-0.21, 0.21].map((ex) => ({ x: ex * s, y: -s * 0.12, rx: s * 0.15, ry: s * 0.18 })),
    pupil: s * 0.085,
    look: { r: [s * 0.07, 0], l: [-s * 0.07, 0], u: [0, -s * 0.08], d: [0, s * 0.08] },
    face: pth`M${-s * 0.32} ${s * 0.2}l${s * 0.107} ${-s * 0.08}l${s * 0.107} ${s * 0.08}l${s * 0.107} ${-s * 0.08}l${s * 0.107} ${s * 0.08}l${s * 0.107} ${-s * 0.08}l${s * 0.107} ${s * 0.08}`,
    frightEyes: [-0.17, 0.17].map((ex) => ({ x: ex * s, y: -s * 0.1, r: s * 0.065 })),
  };
}

// A static ghost (no state changes), for the scoreboard and the end card.
function ghostStatic(s, color, c, { fright = false, dir = 'r', skirt = true } = {}) {
  const g = ghostParts(s);
  const edge = c.ghostEdge !== 'none' ? ` stroke="${c.ghostEdge}" stroke-opacity=".35" stroke-width="${r1(s * 0.04)}"` : '';
  const body = fright ? c.fright : color;
  const skirts = skirt
    ? `<path class="flip" style="animation-duration:.32s" d="${g.skirtA}" fill="${body}"/><path class="flip" style="animation-duration:.32s;animation-delay:-.16s" opacity="0" d="${g.skirtB}" fill="${body}"/>`
    : `<path d="${g.skirtA}" fill="${body}"/>`;
  const face = fright
    ? `${g.frightEyes.map((e) => `<rect x="${r1(e.x - e.r)}" y="${r1(e.y - e.r)}" width="${r1(e.r * 2)}" height="${r1(e.r * 2)}" fill="${c.frightFace}"/>`).join('')}<path d="${g.face}" fill="none" stroke="${c.frightFace}" stroke-width="${r1(s * 0.05)}" stroke-linejoin="round"/>`
    : `${g.eyes.map((e) => `<ellipse cx="${r1(e.x)}" cy="${r1(e.y)}" rx="${r1(e.rx)}" ry="${r1(e.ry)}" fill="${c.eye}"/>`).join('')}${g.eyes.map((e) => `<circle cx="${r1(e.x + g.look[dir][0])}" cy="${r1(e.y + g.look[dir][1])}" r="${r1(g.pupil)}" fill="${c.pupil}"/>`).join('')}`;
  return `<path d="${g.body}" fill="${body}"${edge}/>${skirts}${face}`;
}

// ---------------------------------------------------------------------------
// 1. Hero — the attract screen
// ---------------------------------------------------------------------------

const P = 21; // corridor pitch, px
const X0 = 54; // first column
const Y0 = 314; // top corridor
const bx = (c) => X0 + c * P;
const by = (r) => Y0 + r * P;
const RADII = [1.15, 1.9, 2.6, 3.3, 4.1];
const POWER_R = 6.2;

// Timeline (seconds).
const T_CRT = 0.45;
const T_NAME = 0.35;
const T_WALLS = 0.55;
const T_SWEEP = 0.95;
const SWEEP = 1.1;
const T_READY = 2.1;
const T_PLAY = 2.8;

// Keyframes from a list of { t, x, y } (seconds since play began, node coordinates).
const pct = (t, D) => `${+Math.max(0, Math.min(100, (t / D) * 100)).toFixed(3)}%`;
const at = (p) => `${r1(bx(p.x))}px,${r1(by(p.y))}px`;
function moveKeys(name, wp, D) {
  return `@keyframes ${name}{0%{transform:translate(${at(wp[0])})}${wp.map((p) => `${pct(T_PLAY + p.t, D)}{transform:translate(${at(p)})}`).join('')}}`;
}
// Step keyframes from a list of { t, v } (the value from t on); `first` holds before play.
function stepKeys(name, list, D, css, first) {
  return `@keyframes ${name}{0%{${css(first)}}${list.map((s) => `${pct(T_PLAY + s.t, D)}{${css(s.v)}}`).join('')}}`;
}
const ROT = { r: 0, d: 90, l: 180, u: 270 };

export function heroSvg(profile, themeName, { role }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 600;
  const n = pacNumbers(profile);
  const name = profile.name || profile.login;
  const login = profile.login || 'player';
  const repos = featuredRepos(profile);
  const maze = buildMaze(login);
  const demo = playDemo(maze, n, Math.min(4, repos.length), login);
  const px = pixelKit();
  const css = [];

  // --- The demo, as keyframes.
  const D = r2(T_PLAY + (demo ? demo.end : 0) + 0.1);
  const playT = (t) => T_PLAY + t;
  let sprites = '';
  let popups = '';
  const ghostS = r1(P * 0.84);
  const parts = ghostParts(ghostS);
  if (demo) {
    const pw = simplify(demo.pac.wp);
    const lastP = pw[pw.length - 1];
    const lastDir = demo.pac.dirs[demo.pac.dirs.length - 1]?.v || 'r';
    css.push(
      moveKeys('pm', pw, D),
      stepKeys('pd', demo.pac.dirs, D, (v) => `transform:rotate(${ROT[v]}deg)`, demo.pac.dirs[0]?.v || 'l'),
      // Hidden until READY!, and while the score for each ghost shows.
      `@keyframes pv{0%{opacity:0}${pct(T_READY, D)}{opacity:1}${demo.pac.vis.map((s) => `${pct(playT(s.t), D)}{opacity:${s.v}}`).join('')}}`
    );
    sprites += `<g class="mv" style="animation-name:pm;transform:translate(${at(lastP)})"><g class="st" style="animation-name:pv"><g class="st" style="animation-name:pd;transform:rotate(${ROT[lastDir]}deg)">${chomperSvg(P * 0.43, c.chomper, c.chomperEdge)}</g></g></g>`;

    demo.ghosts.forEach((g) => {
      const i = g.i;
      const color = c.ghosts[i];
      const gw = simplify(g.wp);
      const last = gw[gw.length - 1];
      const finalLook = g.looks[g.looks.length - 1]?.v || 'normal';
      const finalDir = g.dirs[g.dirs.length - 1]?.v || 'u';
      const lookIs = (want) => (v) => `opacity:${want.includes(v) ? 1 : 0}`;
      css.push(
        moveKeys(`g${i}m`, gw, D),
        stepKeys(`g${i}n`, g.looks, D, lookIs(['normal']), 'normal'),
        stepKeys(`g${i}f`, g.looks, D, lookIs(['fright']), 'normal'),
        stepKeys(`g${i}e`, g.looks, D, lookIs(['normal', 'eyes']), 'normal'),
        stepKeys(`g${i}p`, g.dirs, D, (v) => `transform:translate(${r1(parts.look[v][0])}px,${r1(parts.look[v][1])}px)`, 'u')
      );
      const edge = c.ghostEdge !== 'none' ? ` stroke="${c.ghostEdge}" stroke-opacity=".35" stroke-width=".7"` : '';
      const skirts = (fill) =>
        `<path class="flip" style="animation-duration:.32s" d="${parts.skirtA}" fill="${fill}"/><path class="flip" style="animation-duration:.32s;animation-delay:-.16s" opacity="0" d="${parts.skirtB}" fill="${fill}"/>`;
      const on = (want) => (want.includes(finalLook) ? '' : ' opacity="0"');
      sprites += `<g class="mv" style="animation-name:g${i}m;transform:translate(${at(last)})"><g class="appear">
<g class="st" style="animation-name:g${i}n"${on(['normal'])}><path d="${parts.body}" fill="${color}"${edge}/>${skirts(color)}</g>
<g class="st" style="animation-name:g${i}f"${on(['fright'])}><path d="${parts.body}" fill="${c.fright}"/>${skirts(c.fright)}${parts.frightEyes.map((e) => `<rect x="${r1(e.x - e.r)}" y="${r1(e.y - e.r)}" width="${r1(e.r * 2)}" height="${r1(e.r * 2)}" fill="${c.frightFace}"/>`).join('')}<path d="${parts.face}" fill="none" stroke="${c.frightFace}" stroke-width="1" stroke-linejoin="round"/></g>
<g class="st" style="animation-name:g${i}e"${on(['normal', 'eyes'])}>${parts.eyes.map((e) => `<ellipse cx="${r1(e.x)}" cy="${r1(e.y)}" rx="${r1(e.rx)}" ry="${r1(e.ry)}" fill="${c.eye}"/>`).join('')}<g class="st" style="animation-name:g${i}p;transform:translate(${r1(parts.look[finalDir][0])}px,${r1(parts.look[finalDir][1])}px)">${parts.eyes.map((e) => `<circle cx="${r1(e.x)}" cy="${r1(e.y)}" r="${r1(parts.pupil)}" fill="${c.pupil}"/>`).join('')}</g></g>
</g></g>`;
    });

    // The score for each ghost: its repo's stars.
    demo.popups.forEach((p) => {
      const repo = repos[p.i];
      const label = repo?.stars ? `★${short(repo.stars)}` : 'SHIPPED';
      popups += `<g class="win" style="animation-delay:${secs(playT(p.t))};animation-duration:${secs(FREEZE + 0.45)}" opacity="0">${px.text(label, bx(p.x), by(p.y) + 6, 1.8, { anchor: 'middle', fill: c.popup })}</g>`;
    });
  }

  // --- The board: walls as doubled neon tube.
  const wallD = [];
  for (let r = 0; r < ROWS - 1; r++) {
    let s = -1;
    for (let cc = 0; cc <= COLS; cc++) {
      const on = cc < COLS && maze.V[cc][r];
      if (on && s < 0) s = cc;
      if (!on && s >= 0) {
        wallD.push(pth`M${bx(s - 0.5)} ${by(r + 0.5)}H${bx(cc - 0.5)}`);
        s = -1;
      }
    }
  }
  for (let cc = 0; cc < COLS - 1; cc++) {
    let s = -1;
    for (let r = 0; r <= ROWS; r++) {
      const on = r < ROWS && maze.H[cc][r];
      if (on && s < 0) s = r;
      if (!on && s >= 0) {
        wallD.push(pth`M${bx(cc + 0.5)} ${by(s - 0.5)}V${by(r - 0.5)}`);
        s = -1;
      }
    }
  }
  const rp = (pts, r) => roundPoly(pts.map(([x, y]) => [bx(x), by(y)]), r, false);
  const border = [
    rp(
      [
        [-1.5, TUN - 0.5],
        [-0.5, TUN - 0.5],
        [-0.5, -0.5],
        [COLS - 0.5, -0.5],
        [COLS - 0.5, TUN - 0.5],
        [COLS + 0.5, TUN - 0.5],
      ],
      P * 0.55
    ),
    rp(
      [
        [-1.5, TUN + 0.5],
        [-0.5, TUN + 0.5],
        [-0.5, ROWS - 0.5],
        [MID - 3.5, ROWS - 0.5],
        [MID - 3.5, PEN_FLOOR],
        [MID + 3.5, PEN_FLOOR],
        [MID + 3.5, ROWS - 0.5],
        [COLS - 0.5, ROWS - 0.5],
        [COLS - 0.5, TUN + 0.5],
        [COLS + 0.5, TUN + 0.5],
      ],
      P * 0.55
    ),
    pth`M${bx(MID - 3.5)} ${by(ROWS - 0.5)}H${bx(MID - 0.62)}M${bx(MID + 0.62)} ${by(ROWS - 0.5)}H${bx(MID + 3.5)}`,
  ];
  const walls = border.concat(wallD).join('');
  const WO = r1(P * 0.32);
  const WI = r1(P * 0.12);

  // --- Pellets: one per day, by level; the power pellets are the busiest days.
  const eatenAt = demo ? demo.eaten : new Map();
  const powerKey = new Set(n.power.map((p) => `${p.w},${p.d + 1}`));
  const powerNodes = n.power.length ? n.power.map((p) => [p.w, p.d + 1]) : CORNERS;
  const plain = [[], [], [], [], []];
  const gone = [[], [], [], [], []];
  n.grid.forEach((week, w) =>
    week.forEach((day, d) => {
      if (!day) return;
      const key = `${w},${d + 1}`;
      if (powerKey.has(key)) return;
      const L = n.level(day.count);
      const dot = pth`M${bx(w)} ${by(d + 1)}h0`;
      if (eatenAt.has(key)) gone[L].push(`<path class="held" style="animation-duration:${secs(playT(eatenAt.get(key)))}" opacity="0" d="${dot}"/>`);
      else plain[L].push(dot);
    })
  );
  const pelletsSvg = plain
    .map(
      (dots, L) =>
        `<g fill="none" stroke="${c.pellet}" stroke-opacity="${c.levels[L]}" stroke-width="${r1(RADII[L] * 2)}" stroke-linecap="round">${dots.length ? `<path d="${dots.join('')}"/>` : ''}${gone[L].join('')}</g>`
    )
    .join('');
  const powerSvg = powerNodes
    .map(([w, r]) => {
      const key = `${w},${r}`;
      const pellet = `<g class="flip" style="animation-duration:.9s"><circle cx="${bx(w)}" cy="${by(r)}" r="${POWER_R * 2.3}" fill="url(#halo)"/><circle cx="${bx(w)}" cy="${by(r)}" r="${POWER_R}" fill="${c.pellet}"/></g>`;
      return eatenAt.has(key) ? `<g class="held" style="animation-duration:${secs(playT(eatenAt.get(key)))}" opacity="0">${pellet}</g>` : pellet;
    })
    .join('');

  // Month labels over the first week of each month.
  let months = '';
  let lastLabel = -9;
  n.grid.forEach((week, w) => {
    const first = week.find((d) => d && d.date.slice(8) === '01');
    if (first && w - lastLabel >= 3 && w <= 50) {
      months += px.text(MONTHS[Number(first.date.slice(5, 7)) - 1], bx(w) - P * 0.4, by(-0.5) - 9, 1.3, { fill: c.muted });
      lastLabel = w;
    }
  });

  // --- The name, in neon tube.
  const NAME_W = 1080;
  const nameStr = String(name || '').trim();
  const upper = nameStr.toUpperCase();
  let nameLines = [upper];
  let u = 13;
  let tube = canTube(upper);
  if (tube) {
    u = Math.min(13, NAME_W / tubeUnits(upper));
    if (u < 7.2 && upper.includes(' ')) {
      const two = balance(upper, Math.ceil(upper.length / 2) + 6);
      if (two.length === 2) {
        nameLines = two.map((l) => l.replace(/…$/, ''));
        u = Math.min(9, ...nameLines.map((l) => NAME_W / tubeUnits(l)));
      }
    }
  }
  const NAME_MID = 168;
  const capH = 6 * u;
  // Accents need headroom: over the first line the kicker moves up, over the second the lines part.
  const lift = tube && tubeAccented(nameLines[0]) ? u * 2.4 : 0;
  const lineGap = u * (nameLines[1] && tubeAccented(nameLines[1]) ? 3.6 : 2.4);
  const blockH = nameLines.length * capH + (nameLines.length - 1) * lineGap;
  const nameTop = r1(NAME_MID - blockH / 2);
  let nameMask = '';
  let nameGlow = '';
  let nameBox = { x: 60, y: nameTop, w: 1080, h: blockH };
  if (tube) {
    const glyphs = nameLines.flatMap((line, li) => {
      const w = tubeUnits(line) * u;
      return tubeGlyphs(line, (W - w) / 2, nameTop + li * (capH + lineGap), u);
    });
    const wo = r1(u * 0.8);
    const wi = r1(u * 0.34);
    glyphs.forEach((d, i) => {
      const delay = `animation-delay:${secs(T_NAME + i * 0.05)}`;
      nameMask += `<path class="draw" style="${delay}" pathLength="1" d="${d}" stroke="#fff" stroke-width="${wo}"/><path class="draw" style="${delay}" pathLength="1" d="${d}" stroke="#000" stroke-width="${wi}"/>`;
      nameGlow += `<path class="glowIn" style="animation-delay:${secs(T_NAME + 0.5 + i * 0.05)}" d="${d}"/>`;
    });
    nameGlow = `<g fill="none" stroke="${c.nameGlow}" stroke-opacity="${c.nameGlowOp}" stroke-width="${r1(wo + u * 0.9)}" stroke-linecap="round" stroke-linejoin="round">${nameGlow}</g>`;
  } else {
    // Characters the tube font doesn't have: the system font, outlined the same way.
    const size = Math.min(78, (NAME_W / Math.max(1, [...nameStr].length)) * 1.6);
    const ty = r1(NAME_MID + size * 0.36);
    const t = (stroke, sw) => `<text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="${SANS}" font-size="${r1(size)}" font-weight="800" letter-spacing="${r1(size * 0.04)}" fill="#000" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round">${escapeXml(upper)}</text>`;
    nameMask = `<g class="lightUp" style="animation-delay:${secs(T_NAME)}">${t('#fff', r1(size * 0.1))}${t('#000', r1(size * 0.035))}</g>`;
    nameBox = { x: 40, y: r1(NAME_MID - size * 0.7), w: 1120, h: r1(size * 1.2) };
    nameGlow = `<g class="lightUp" style="animation-delay:${secs(T_NAME + 0.3)}" opacity="${c.nameGlowOp}"><text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="${SANS}" font-size="${r1(size)}" font-weight="800" letter-spacing="${r1(size * 0.04)}" fill="none" stroke="${c.nameGlow}" stroke-width="${r1(size * 0.2)}" stroke-linejoin="round">${escapeXml(upper)}</text></g>`;
  }

  // Kicker and headline.
  const kickBits = ['PLAYER 1', role ? role : `@${login}`, profile.location].filter(Boolean);
  const kicker = px.text(trunc(kickBits.join(' · '), 70), W / 2, nameBox.y - 16 - lift, 1.7, { anchor: 'middle', fill: c.muted });
  // Two lines of headline under a one-line name; one under a two-line name.
  const headLines = nameLines.length > 1 ? [trunc(String(profile.headline || '').trim(), 100)].filter(Boolean) : balance(profile.headline || '', 84);
  const hy = r1(nameBox.y + nameBox.h + 34);
  const headline = headLines
    .map((l, i) => `<text x="${W / 2}" y="${hy + i * 22}" text-anchor="middle" font-family="${SANS}" font-size="16.5" fill="${c.fg}" fill-opacity=".78">${escapeXml(l)}</text>`)
    .join('');

  // --- HUD.
  const digits = Math.max(2, String(n.total).length);
  const hud = `<g class="hud">
  <g class="flip" style="animation-duration:1s">${px.text('1UP', 64, 34, 2, { fill: c.fg })}</g>
  ${pixelCounter(n.total, digits, 64, 58, 2.4, c.fg)}
  ${px.text('BEST DAY', W / 2, 34, 2, { anchor: 'middle', fill: c.fg })}
  ${px.text(n.peak ? `${n.maxDay} · ${dayMonth(n.peak.date)}` : '0', W / 2, 58, 2.4, { anchor: 'middle', fill: c.fg })}
  ${px.text('STREAK', W - 64, 34, 2, { anchor: 'end', fill: c.fg })}
  ${px.text(`${n.streak} ${n.streak === 1 ? 'DAY' : 'DAYS'}`, W - 64, 58, 2.4, { anchor: 'end', fill: c.fg })}
</g>`;

  // Legend and footer.
  const footY = 572;
  let lx = 64;
  let legend = px.text('LESS', lx, footY, 1.5, { fill: c.muted });
  lx += pixelWidth('LESS', 1.5) + 12;
  RADII.forEach((rr, L) => {
    if (L === 0) return;
    legend += `<circle cx="${lx + rr}" cy="${footY - 5.2}" r="${rr}" fill="${c.pellet}" fill-opacity="${c.levels[L]}"/>`;
    lx += rr * 2 + 8;
  });
  legend += px.text('MORE', lx + 4, footY, 1.5, { fill: c.muted });
  lx += pixelWidth('MORE', 1.5) + 28;
  legend += `<circle cx="${lx + POWER_R}" cy="${footY - 5.2}" r="${POWER_R}" fill="${c.pellet}"/>`;
  legend += px.text(n.power.length ? 'BUSIEST DAYS' : 'POWER PELLET', lx + POWER_R * 2 + 10, footY, 1.5, { fill: c.muted });
  const footer = `<g class="hud">${legend}
  ${px.text(`${fmt(n.total)} ${n.total === 1 ? 'CONTRIBUTION' : 'CONTRIBUTIONS'} · ${fmt(n.active)} ACTIVE ${n.active === 1 ? 'DAY' : 'DAYS'}`, W / 2 + 70, footY, 1.5, { anchor: 'middle', fill: c.muted })}
  ${px.text(`LEVEL ${n.years}`, W - 64, footY, 2, { anchor: 'end', fill: c.fg })}
  ${px.text(`SINCE ${n.since}`, W - 64 - pixelWidth(`LEVEL ${n.years}`, 2) - 14, footY, 1.5, { anchor: 'end', fill: c.muted })}
</g>`;

  // READY!, in the corridor over the pen.
  const ready = `<g class="win" style="animation-delay:${secs(T_READY)};animation-duration:${secs(T_PLAY - T_READY)}" opacity="0">${px.text('READY!', bx(MID), by(ROWS - 1) + 7, 2, { anchor: 'middle', fill: c.ready })}</g>`;

  // The pen door, and the moment the busiest day powers the chomper up: the name catches the light.
  const door = `<path d="${pth`M${bx(MID - 0.6)} ${by(ROWS - 0.5)}H${bx(MID + 0.6)}`}" stroke="${c.door}" stroke-width="2.4"/>`;
  const glintAt = demo ? playT(demo.powerAt) : T_PLAY;

  const boardTop = by(-0.5) - 8;
  const boardBottom = by(PEN_FLOOR) + 8;
  css.unshift(`
.mv{animation-duration:${secs(D)};animation-timing-function:linear;animation-fill-mode:both}
.st{animation-duration:${secs(D)};animation-timing-function:step-end;animation-fill-mode:both}
.held{animation-name:held;animation-timing-function:step-end;animation-fill-mode:both}
.win{animation-name:held;animation-timing-function:step-end}
.appear{animation:fade .01s step-end ${secs(T_READY - 0.2)} both}
.crt{transform-box:fill-box;transform-origin:center;animation:crt ${secs(T_CRT)} cubic-bezier(.2,.8,.2,1) both}
.flash{animation:held .5s ease-out}
.hud{animation:fade .01s step-end .3s both}
.walls{transform-box:fill-box;transform-origin:center;animation:grow .6s ${EXPO} ${secs(T_WALLS)} both}
.sweep{transform-box:fill-box;transform-origin:left center;animation:grow ${secs(SWEEP)} linear ${secs(T_SWEEP)} both}
.scanbar{animation:scanbar ${secs(SWEEP)} linear ${secs(T_SWEEP)}}
.roll{animation:roll ${secs(SWEEP)} cubic-bezier(.3,0,.3,1) ${secs(T_SWEEP)} both}
.late{animation:fade .5s ease-out ${secs(T_SWEEP)} both}
.draw{stroke-dasharray:1 1;animation:draw .9s cubic-bezier(.5,0,.3,1) both}
.glowIn{animation:fade .8s ease-out both}
.lightUp{animation:fade 1s ease-out both}
.rise{animation:rise .8s ${EXPO} both}
.glint{animation:glint 1.1s cubic-bezier(.4,0,.2,1) ${secs(glintAt)} both}
.flip{animation-name:flip;animation-iteration-count:infinite}
.jaw{animation:chomp .24s ease-in-out infinite}
@keyframes roll{from{transform:translateY(0)}}
@keyframes scanbar{from{transform:translateX(${-(COLS * P)}px);opacity:1}99.9%{opacity:1}}
@keyframes glint{from{transform:translateX(-1300px)}}
${SEQ}
${LOOPS}
${REDUCED}`);

  const aria = `${name}${profile.headline ? ` — ${profile.headline.replace(/[.!?\s]+$/, '')}` : ''}. An arcade maze made from the last year of contributions: one pellet per day, bigger on busier days, with the busiest days as power pellets. A yellow chomper eats its way to a power pellet and then the ghosts, which are the featured repositories. Score: ${fmt(n.total)} contributions.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css.join('\n')}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <clipPath id="screen"><rect class="crt" width="${W}" height="${H}"/></clipPath>
  <clipPath id="wallsIn"><rect class="walls" x="0" y="${boardTop}" width="${W}" height="${boardBottom - boardTop}"/></clipPath>
  <clipPath id="sweepIn"><rect class="sweep" x="${bx(-0.6)}" y="${boardTop}" width="${COLS * P + P * 0.2}" height="${boardBottom - boardTop}"/></clipPath>
  <clipPath id="board"><rect x="${bx(-1.5)}" y="${by(-0.5)}" width="${(COLS + 2) * P}" height="${by(PEN_FLOOR) - by(-0.5)}"/></clipPath>
  <radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset=".55" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.vignetteOp}"/></radialGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="${c.pellet}" stop-opacity="${dark ? 0.5 : 0.35}"/><stop offset="1" stop-color="${c.pellet}" stop-opacity="0"/></radialGradient>
  <linearGradient id="wallGrad" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.wall[1]}"/><stop offset=".5" stop-color="${c.wall[0]}"/><stop offset="1" stop-color="${c.wall[1]}"/></linearGradient>
  <linearGradient id="nameGrad" x1="0" y1="${nameBox.y}" x2="0" y2="${nameBox.y + nameBox.h}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.name[0]}"/><stop offset=".55" stop-color="${c.name[1]}"/><stop offset="1" stop-color="${c.name[2]}"/></linearGradient>
  <linearGradient id="glintGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${dark ? 0.95 : 0.8}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.pellet}" stop-opacity="0"/><stop offset="1" stop-color="${c.pellet}" stop-opacity="${dark ? 0.35 : 0.3}"/></linearGradient>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${c.scan}" fill-opacity="${c.scanOp}"/></pattern>
  <mask id="wallMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${walls}" stroke="#fff" stroke-width="${WO}"/><path d="${walls}" stroke="#000" stroke-width="${WI}"/></g></mask>
  <mask id="nameMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${nameMask}</g></mask>
  ${px.strip()}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <g clip-path="url(#screen)">
    ${hud}
    <g class="late">${months}</g>
    <g class="hud">${kicker}</g>
    ${nameGlow}
    <g mask="url(#nameMask)"><rect x="0" y="${r1(nameBox.y - 20)}" width="${W}" height="${r1(nameBox.h + 40)}" fill="url(#nameGrad)"/><rect class="glint" x="${W + 100}" y="${r1(nameBox.y - 20)}" width="160" height="${r1(nameBox.h + 40)}" fill="url(#glintGrad)"/></g>
    <g class="rise" style="animation-delay:${secs(T_NAME + 0.7)}">${headline}</g>
    <g clip-path="url(#wallsIn)">
      <path d="${walls}" fill="none" stroke="${c.wallGlow}" stroke-opacity="${c.wallGlowOp}" stroke-width="${r1(WO + 6)}" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="0" y="${boardTop}" width="${W}" height="${boardBottom - boardTop}" fill="url(#wallGrad)" mask="url(#wallMask)"/>
      ${door}
    </g>
    <g clip-path="url(#sweepIn)">${pelletsSvg}${powerSvg}</g>
    <rect class="scanbar" x="${bx(COLS - 0.5) - 60}" y="${by(-0.5) + 2}" width="60" height="${by(ROWS - 0.5) - by(-0.5) - 4}" fill="url(#scanGrad)" opacity="0"/>
    ${ready}
    <g clip-path="url(#board)">${sprites}</g>
    ${popups}
    ${footer}
  </g>
  <rect class="flash" x="0" y="${H / 2 - 1.5}" width="${W}" height="3" fill="${dark ? '#ffffff' : c.fg}" opacity="0"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
<defs>${px.defs()}</defs>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Scoreboard — the ghosts, the high scores, the bonus items
// ---------------------------------------------------------------------------

const ORD = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'];

export function scoreSvg(profile, themeName) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 528;
  const n = pacNumbers(profile);
  const repos = featuredRepos(profile).slice(0, 4);
  const langs = (profile.languages || []).slice(0, 6);
  const px = pixelKit();

  // --- Left: meet the ghosts.
  const LX = 56;
  const RX = 640;
  let cast = px.text('MEET THE GHOSTS', LX, 62, 3, { fill: c.fg });
  cast += px.text('EVERY PROJECT HAUNTS YOU UNTIL YOU SHIP IT', LX, 86, 1.5, { fill: c.muted });
  const rowY = (k) => 132 + k * 74;
  repos.forEach((repo, k) => {
    const y = rowY(k);
    const t0 = 0.35 + k * 0.55;
    const label = trunc(repo.name, 22);
    const nameW = pixelWidth(label, 2.6);
    const desc = trunc(repo.description || '', 62);
    const meta = [repo.stars ? `★ ${short(repo.stars)}` : '', repo.language || ''].filter(Boolean).join(' · ');
    cast += `<g transform="translate(${LX + 22} ${y})"><g class="pop" style="animation-delay:${secs(t0)}">${ghostStatic(32, c.ghosts[k], c, { dir: 'r' })}</g></g>`;
    cast += `<clipPath id="tw${k}"><rect class="type" style="animation-delay:${secs(t0 + 0.2)};animation-timing-function:steps(${Math.max(1, label.length)})" x="${LX + 56}" y="${y - 24}" width="${r1(nameW + 4)}" height="30"/></clipPath>`;
    cast += `<g clip-path="url(#tw${k})">${px.text(label, LX + 56, y - 2, 2.6, { fill: c.ghosts[k] })}</g>`;
    if (desc) cast += `<text class="rise" style="animation-delay:${secs(t0 + 0.45)}" x="${LX + 56}" y="${y + 20}" font-family="${SANS}" font-size="13.5" fill="${c.fg}" fill-opacity=".72">${escapeXml(desc)}</text>`;
    if (meta) cast += `<g class="rise" style="animation-delay:${secs(t0 + 0.55)}">${px.text(meta, 560, y - 2, 1.6, { anchor: 'end', fill: c.muted })}</g>`;
  });
  if (!repos.length) {
    cast += `<g class="rise" style="animation-delay:.4s"><g transform="translate(${LX + 22} ${rowY(0)})" opacity=".45">${ghostStatic(32, c.muted, c, { skirt: false })}</g>${px.text('NO GHOSTS YET', LX + 56, rowY(0) - 2, 2.6, { fill: c.muted })}<text x="${LX + 56}" y="${rowY(0) + 20}" font-family="${SANS}" font-size="13.5" fill="${c.fg}" fill-opacity=".6">Featured repositories show up here, one ghost each.</text></g>`;
  }

  // --- Right: the high-score table, ranked like an arcade's.
  const stats = [
    { v: n.total, label: n.total === 1 ? 'CONTRIBUTION' : 'CONTRIBUTIONS' },
    { v: n.active, label: n.active === 1 ? 'ACTIVE DAY' : 'ACTIVE DAYS' },
    { v: n.streak, label: 'DAY STREAK' },
    { v: n.maxDay, label: n.peak ? `BEST DAY · ${dayMonth(n.peak.date)}` : 'BEST DAY' },
    { v: n.stars, label: n.stars === 1 ? 'STAR' : 'STARS' },
    { v: n.followers, label: n.followers === 1 ? 'FOLLOWER' : 'FOLLOWERS' },
    { v: n.years, label: n.years === 1 ? 'YEAR ON GITHUB' : 'YEARS ON GITHUB' },
  ].sort((a, b) => b.v - a.v);
  let table = px.text('HIGH SCORES', RX, 62, 3, { fill: c.fg });
  table += px.text('RANK', RX, 104, 1.5, { fill: c.muted }) + px.text('SCORE', RX + 230, 104, 1.5, { anchor: 'end', fill: c.muted }) + px.text('NAME', RX + 262, 104, 1.5, { fill: c.muted });
  stats.forEach((s, k) => {
    const y = 140 + k * 36;
    const color = c.rows[k % c.rows.length];
    const line = `${px.text(ORD[k], RX, y, 2.4, { fill: color })}${px.text(fmt(s.v).replace(/,/g, ''), RX + 230, y, 2.4, { anchor: 'end', fill: color })}${px.text(trunc(s.label, 17), RX + 262, y, 2.4, { fill: color })}`;
    table += `<clipPath id="hs${k}"><rect class="type" style="animation-delay:${secs(0.5 + k * 0.16)};animation-timing-function:steps(18)" x="${RX - 2}" y="${y - 22}" width="530" height="28"/></clipPath><g clip-path="url(#hs${k})">${line}</g>`;
  });

  // --- Bottom: bonus items, popped as the chomper eats the row of pellets above them.
  const ROW_Y = 432;
  const EAT0 = 2.2;
  const EAT_V = 520; // px per second
  const pelletXs = [];
  for (let x = 72; x <= W - 72; x += 24) pelletXs.push(x);
  const eatAt = (x) => EAT0 + (x - 30) / EAT_V;
  const pellets = pelletXs
    .map((x) => `<circle class="held" style="animation-duration:${secs(eatAt(x))}" cx="${x}" cy="${ROW_Y}" r="2.6" fill="${c.pellet}" opacity="0"/>`)
    .join('');
  const chompEnd = W - 44;
  const chomper = `<g class="run" style="transform:translate(${chompEnd}px,${ROW_Y}px)">${chomperSvg(13, c.chomper, c.chomperEdge)}</g>`;
  let bonus = px.text('BONUS ITEMS', LX, 476, 1.6, { fill: c.muted });
  const slotW = (W - LX * 2 - 150) / Math.max(1, langs.length);
  langs.forEach((l, k) => {
    const x = LX + 150 + k * slotW;
    const col = langColor(l.name);
    const tPop = eatAt(x + 10);
    bonus += `<g class="pop" style="animation-delay:${secs(tPop)}"><g transform="translate(${r1(x + 12)} 482)"><path d="M0 -12L10 -2L0 12L-10 -2Z" fill="${col}"/><path d="M0 -12L10 -2L0 -2Z" fill="#fff" fill-opacity=".35"/><path d="M-10 -2L0 12L0 -2Z" fill="#000" fill-opacity=".18"/></g></g>`;
    bonus += `<g class="rise" style="animation-delay:${secs(tPop + 0.1)}">${px.text(trunc(l.name, 12), x + 30, 480, 1.7, { fill: c.fg })}${px.text(`${Math.round(l.share * 100)}%`, x + 30, 498, 1.5, { fill: c.muted })}</g>`;
  });
  if (!langs.length) bonus += px.text('NONE YET · PUSH SOME CODE TO UNLOCK', LX + 150, 480, 1.7, { fill: c.muted });

  const css = `
.pop{transform-box:fill-box;transform-origin:center;animation:pop .45s cubic-bezier(.34,1.56,.64,1) both}
.type{transform-box:fill-box;transform-origin:left center;animation-name:grow;animation-duration:.5s;animation-fill-mode:both}
.rise{animation:rise .7s ${EXPO} both}
.held{animation-name:held;animation-timing-function:step-end;animation-fill-mode:both}
.run{animation:run ${secs((chompEnd - 30) / EAT_V)} linear ${secs(EAT0)} both}
.boot{animation:fade .5s ease-out both}
.flip{animation-name:flip;animation-iteration-count:infinite}
.jaw{animation:chomp .24s ease-in-out infinite}
@keyframes run{from{transform:translate(-30px,${ROW_Y}px)}}
${SEQ}
${LOOPS}
${REDUCED}`;

  const aria = `Scoreboard. ${repos.length ? `The ghosts are the featured projects: ${repos.map((r) => r.name).join(', ')}.` : 'No featured projects yet.'} High scores: ${stats.map((s) => `${fmt(s.v)} ${s.label.toLowerCase()}`).join(', ')}.${langs.length ? ` Bonus items, the languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <radialGradient id="vig" cx="50%" cy="45%" r="78%"><stop offset=".6" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.vignetteOp}"/></radialGradient>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${c.scan}" fill-opacity="${c.scanOp}"/></pattern>
  <mask id="tubeMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g fill="none" stroke-linecap="round"><path d="M600 40V396M40 ${ROW_Y - 24}H${W - 40}M40 ${ROW_Y + 22}H${W - 40}" stroke="#fff" stroke-width="7"/><path d="M600 40V396M40 ${ROW_Y - 24}H${W - 40}M40 ${ROW_Y + 22}H${W - 40}" stroke="#000" stroke-width="2.6"/></g></mask>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <g class="boot"><rect width="${W}" height="${H}" fill="${c.wall[0]}" mask="url(#tubeMask)" opacity="${dark ? 0.9 : 0.85}"/></g>
  ${cast}
  ${table}
  ${pellets}
  ${chomper}
  ${bonus}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
<defs>${px.defs()}</defs>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. End card — intermission, then the sign-off
// ---------------------------------------------------------------------------

const linkLabel = (url) => String(url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function endSvg(profile, themeName, { signoff }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 300;
  const px = pixelKit();
  const name = profile.name || profile.login;
  const link = profile.website ? linkLabel(profile.website) : profile.email ? profile.email : `github.com/${profile.login}`;
  const LANE = 150;

  // Act one: a ghost chases the chomper across, right to left. Act two: the chomper comes back
  // three times the size, and the ghost runs.
  const A1 = 0.25;
  const A1T = 1.7;
  const A2 = 2.05;
  const A2T = 1.6;
  // The chase runs off-screen and stays there: each sprite rests out of view.
  const act = `<g class="a1" style="transform:translate(-80px,${LANE}px)"><g transform="scale(-1 1)">${chomperSvg(15, c.chomper, c.chomperEdge)}</g></g>
<g class="a1g" style="transform:translate(-80px,${LANE}px)">${ghostStatic(30, c.ghosts[0], c, { dir: 'l' })}</g>
<g class="a2g" style="transform:translate(${W + 80}px,${LANE}px)">${ghostStatic(30, c.ghosts[0], c, { fright: true, dir: 'r' })}</g>
<g class="a2" style="transform:translate(${W + 180}px,${LANE - 10}px)">${chomperSvg(46, c.chomper, c.chomperEdge)}</g>`;

  // The sign-off, written out by the chomper as it crosses: the text is revealed just behind it.
  const SIGN_PX = 4.2;
  const sign = pixelSafe(signoff);
  const signW = Math.min(980, pixelWidth(sign, SIGN_PX));
  const scale = signW < pixelWidth(sign, SIGN_PX) ? signW / pixelWidth(sign, SIGN_PX) : 1;
  const spx = r2(SIGN_PX * scale);
  const sx0 = (W - signW) / 2;
  const SY = 104;
  const W0 = A2 + A2T + 0.1;
  const WT = Math.max(0.9, signW / 700);
  const WX0 = sx0 - 30;
  const WX1 = sx0 + signW + 24;
  const WY = r1(SY - 3.5 * spx);
  const writer = `<g class="write" style="transform:translate(${r1(WX1)}px,${WY}px)">${chomperSvg(16, c.chomper, c.chomperEdge)}</g>`;

  const tail = W0 + WT;
  const css = `
.a1{animation:a1 ${A1T}s linear ${A1}s both}
.a1g{animation:a1 ${A1T}s linear ${A1 + 0.1}s both}
.a2{animation:a2 ${A2T}s linear ${A2 + 0.14}s both}
.a2g{animation:a2g ${A2T}s linear ${A2}s both}
.write{animation:write ${r2(WT)}s linear ${r2(W0)}s both}
.reveal{transform-box:fill-box;transform-origin:left center;animation:grow ${r2(WT)}s linear ${r2(W0)}s both}
.rise{animation:rise .8s ${EXPO} both}
.boot{animation:fade .6s ease-out both}
.flip{animation-name:flip;animation-iteration-count:infinite}
.jaw{animation:chomp .24s ease-in-out infinite}
@keyframes a1{from{transform:translate(${W + 60}px,${LANE}px)}}
@keyframes a2{from{transform:translate(-200px,${LANE - 10}px)}}
@keyframes a2g{from{transform:translate(-40px,${LANE}px)}}
@keyframes write{from{transform:translate(${r1(WX0)}px,${WY}px)}}
${SEQ}
${LOOPS}
${REDUCED}`;

  // A frame of maze wall, open at both ends of the lane like the tunnels, so the chase runs
  // straight through it.
  const fr = (pts) => roundPoly(pts, 18, false);
  const frame = [
    fr([
      [18, LANE - 30],
      [18, 18],
      [W - 18, 18],
      [W - 18, LANE - 30],
    ]),
    fr([
      [18, LANE + 30],
      [18, H - 18],
      [W - 18, H - 18],
      [W - 18, LANE + 30],
    ]),
  ].join('');

  const aria = `End card: an arcade intermission, a ghost chasing the chomper and then a giant chomper chasing the ghost back. Then the sign-off: ${signoff}${name ? `, ${name}` : ''}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <clipPath id="signIn"><rect class="reveal" x="${r1(WX0)}" y="${r1(SY - 7 * spx - 6)}" width="${r1(WX1 - WX0)}" height="${r1(7 * spx + 12)}"/></clipPath>
  <radialGradient id="vig" cx="50%" cy="45%" r="78%"><stop offset=".6" stop-color="${c.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${c.vignette}" stop-opacity="${c.vignetteOp}"/></radialGradient>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${c.scan}" fill-opacity="${c.scanOp}"/></pattern>
  <mask id="tubeMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${frame}" stroke="#fff" stroke-width="7"/><path d="${frame}" stroke="#000" stroke-width="2.6"/></g></mask>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <g class="boot">
    <path d="${frame}" fill="none" stroke="${c.wallGlow}" stroke-opacity="${c.wallGlowOp}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <rect width="${W}" height="${H}" fill="${c.wall[0]}" mask="url(#tubeMask)"/>
  </g>
  ${act}
  <g clip-path="url(#signIn)">${px.text(sign, sx0, SY, spx, { fill: c.ready })}</g>
  ${writer}
  <g class="rise" style="animation-delay:${r2(tail)}s">${px.text(trunc(name, 40), W / 2, 162, 2.6, { anchor: 'middle', fill: c.fg })}</g>
  <g class="rise" style="animation-delay:${r2(tail + 0.2)}s">${px.text('CONTINUE?', W / 2 - 8, 206, 2, { anchor: 'end', fill: c.popup })}${px.text(trunc(link, 44), W / 2 + 8, 206, 2, { fill: c.fg })}</g>
  <g class="rise" style="animation-delay:${r2(tail + 0.4)}s"><g class="flip" style="animation-duration:1.2s">${px.text('INSERT COIN', W / 2, 256, 1.8, { anchor: 'middle', fill: c.muted })}</g>${px.text(`@${profile.login} · ${new Date().getFullYear()}`, W - 46, H - 40, 1.4, { anchor: 'end', fill: c.muted })}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
<defs>${px.defs()}</defs>
</svg>`;
}
