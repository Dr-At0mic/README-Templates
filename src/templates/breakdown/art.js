// Breakdown — animated SVG artwork: your profile as a VFX shot.
//
// Dedicated to Vijay Pratap Pandey, VFX compositor (https://vijayvisuals.github.io/), who helped
// build this project. The template speaks the language of his craft.
//
// Hero: your year as a CG shot, shown the way artists show their work, as a breakdown. Every
// day is a tower (as tall as that day was busy) in a city that recedes week by week toward a
// setting sun. The city extrudes in chronological order while the timeline plays frames 1001 to
// 1365, then the frame wipes through the render passes (wireframe, clay, normals, depth) to the
// beauty pass, and your name is comp'd in under an anamorphic flare.
// Comp script: your work as a node graph. The year is the background plate, featured repos are
// Read nodes with shader-ball thumbnails, merged over it, graded and written out, plus a render
// log of the year's numbers and your languages as a colour chart.
// End card: the on-set reference kit (grey ball, chrome ball, colour chart) and a sign-off.
//
// Same rules as the other animated templates: CSS keyframes only, the un-animated state is the
// final frame, at most two infinite loops per image, no filters, system fonts, and
// prefers-reduced-motion stops everything.

import { seededRandom } from '../../lib/random';
import { langColor } from '../adhd/art';
import { escapeXml } from '../pulsar/art';

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const WIPE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';

// The two loops each image is allowed: `pulse` (opacity: aviation beacons, the flare breathing,
// the record light) and `drift` (a small translation: clouds, glints on the water).
const LOOPS = `@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,0)}}`;

export const THEMES = {
  dark: {
    bg: '#0a0a0a',
    bar: '#111111',
    line: '#ffffff',
    lineOp: 0.08,
    fg: '#f0ede8',
    muted: '#8a8a82',
    faint: '#4a4a46',
    gold: '#c8a96e',
    blue: '#4a9eff',
    // Wireframe viewport
    wireBg: ['#0d1015', '#0a0c10'],
    wire: '#6fb3ff',
    grid: '#2a3644',
    gridMajor: '#3c4c60',
    // Clay
    claySky: ['#2c2e33', '#55585e'],
    clayGround: ['#5d6066', '#7a7d83'],
    clay: { t: '#e2e1dc', f: '#8b8a86', sR: '#6a6a67', sL: '#b9b8b3' },
    // Beauty: a backlit city at dusk, the sun setting at the end of the avenue
    sky: ['#05060a', '#0d1220', '#2a2433', '#7a5634', '#e2b46e'],
    sun: '#fff1cf',
    glow: '#f0c070',
    haze: '#b88a52',
    water: ['#c99a5e', '#3a2c22', '#0b0c10'],
    beauty: { t: '#4a3d2c', f: '#0d0e11', sR: '#15161a', sL: '#1a1a1e' },
    rim: '#ffd894',
    window: '#ffcf7a',
    lamp: '#ffc46b',
    street: '#0b0b0d',
    cloud: '#e8b878',
    cloudOp: 0.22,
    flare: '#4a9eff',
    flareOp: 0.75,
    beacon: '#ff4a3d',
    nameFill: '#f6f2ea',
    nameShade: '#000000',
    // Comp script
    graph: '#0e0e0e',
    dot: '#ffffff',
    dotOp: 0.06,
    panel: '#141414',
    panelEdge: '#262626',
    node: { read: '#3a3f4b', merge: '#2a5a96', grade: '#8f7440', write: '#8a3a32', view: '#4a4a4a', plate: '#3a3f4b' },
    nodeText: '#f0ede8',
    wireLine: '#9a9a92',
    log: '#c8c4bb',
    // End card
    floor: ['#141414', '#070707'],
    grey: ['#c7c5c0', '#76746f', '#2c2b29'],
  },
  light: {
    bg: '#f3f1ec',
    bar: '#e9e6df',
    line: '#000000',
    lineOp: 0.1,
    fg: '#1c1b18',
    muted: '#6b685f',
    faint: '#b4b0a6',
    gold: '#8a6a2c',
    blue: '#2563c9',
    wireBg: ['#f4f5f7', '#e9ebef'],
    wire: '#2f6fd6',
    grid: '#cfd5de',
    gridMajor: '#b3bdcb',
    claySky: ['#e7e7e5', '#cfd0d2'],
    clayGround: ['#b9bbbf', '#d6d7da'],
    clay: { t: '#fbfaf7', f: '#c9c8c4', sR: '#aeadaa', sL: '#e6e5e1' },
    // Beauty: a hazy morning, the sun low at the end of the avenue
    sky: ['#9fbbd6', '#c3d4e4', '#e6e9ea', '#f5ecdc', '#fff6e2'],
    sun: '#ffffff',
    glow: '#fff3d6',
    haze: '#efe6d6',
    water: ['#f6efe2', '#b9c6d2', '#8ea1b4'],
    beauty: { t: '#f9f5ee', f: '#8d99aa', sR: '#a7b1c0', sL: '#b8c1ce' },
    rim: '#ffffff',
    window: 'none',
    lamp: 'none',
    street: '#7d8796',
    cloud: '#ffffff',
    cloudOp: 0.55,
    flare: '#ffd9a0',
    flareOp: 0.55,
    beacon: '#e0362b',
    nameFill: '#16181c',
    nameShade: '#ffffff',
    graph: '#f7f6f2',
    dot: '#000000',
    dotOp: 0.08,
    panel: '#ffffff',
    panelEdge: '#dcd8cf',
    node: { read: '#d9dce3', merge: '#b9d2f2', grade: '#ecd9b0', write: '#efc4bd', view: '#dedcd6', plate: '#d9dce3' },
    nodeText: '#1c1b18',
    wireLine: '#8a877e',
    log: '#3a3833',
    floor: ['#f1efe9', '#dedad1'],
    grey: ['#f2f0eb', '#a19f99', '#55534e'],
  },
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const FIRST_FRAME = 1001; // VFX shots start at frame 1001, leaving room for handles

const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const trunc = (s, n) => {
  const str = String(s ?? '');
  return str.length > n ? `${str.slice(0, Math.max(1, n - 1)).trimEnd()}…` : str;
};
const plural = (v, one, many = `${one}s`) => `${fmt(v)} ${v === 1 ? one : many}`;
const short = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));
const dayMonth = (iso) => (iso ? `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}` : '');

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
const grey = (v) => hex([v, v, v].map((x) => x * 255));

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Everything the artwork reads from the profile. The last 365 days are frames 1001 to 1365, laid
 * out like the contribution calendar: 53 weeks of 7 days, Sunday first, the current week last.
 */
export function breakdownNumbers(profile) {
  const days = (profile.contributions?.days || []).slice(-365);
  let streak = 0;
  let run = 0;
  let idle = 0;
  let rest = 0;
  let peak = -1;
  days.forEach((d, i) => {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
    idle = d.count > 0 ? 0 : idle + 1;
    rest = Math.max(rest, idle);
    if (d.count > 0 && (peak < 0 || d.count > days[peak].count)) peak = i;
  });

  // The calendar grid: grid[week][weekday], week 52 being the current one.
  const last = days.length ? new Date(`${days[days.length - 1].date}T00:00:00Z`).getUTCDay() : 6;
  const pad = 6 - last; // days still to come this week
  const grid = Array.from({ length: 53 }, () => Array(7).fill(null));
  days.forEach((d, i) => {
    const k = days.length - 1 - i + pad;
    const week = 52 - Math.floor(k / 7);
    if (week >= 0) grid[week][6 - (k % 7)] = { ...d, index: i };
  });

  const total = profile.contributions?.total ?? days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  const thisYear = new Date().getFullYear();
  return {
    days,
    grid,
    total,
    active,
    streak,
    rest,
    peak: peak >= 0 ? { index: peak, ...days[peak] } : null,
    maxDay: peak >= 0 ? days[peak].count : 0,
    frames: Math.max(1, days.length),
    version: Math.max(1, active),
    years: Math.max(1, thisYear - (profile.joinedYear || thisYear)),
    since: profile.joinedYear || thisYear,
    stars: profile.totalStars ?? (profile.repos || []).reduce((s, r) => s + (r.stars || 0), 0),
    followers: profile.followers || 0,
  };
}

// Shot code, from the login: the way a show names its shots.
export const shotCode = (profile) => `${String(profile.login || 'shot').replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase() || 'SHOT'}_0100`;

// ---------------------------------------------------------------------------
// The city: one tower per day, one row per week
// ---------------------------------------------------------------------------

// A one-point perspective camera above the avenue, looking down it toward the horizon.
// World units: a lane (one weekday) is 1 wide, a week is 0.5 deep.
const VIEW = { x0: 12, y0: 40, x1: 1188, y1: 532 };
const CAM = { cx: 600, hy: 272, f: 560, y: 1.32, d0: 2.6, wd: 0.5, hmax: 1.12, bw: 0.34, bd: 0.17 };
const proj = (X, Y, D) => [CAM.cx + (CAM.f * X) / D, CAM.hy + (CAM.f * (CAM.y - Y)) / D];
const rowDepth = (w) => CAM.d0 + (52 - w) * CAM.wd;

/**
 * Tower faces, grouped per week so that painting rows from far to near is a correct painter's
 * order. Inside a row every side face is painted before every top, and every top before every
 * front (fronts all lie in one plane, nearest to the camera).
 *  sR: right-facing sides (lanes left of the camera), sL: left-facing sides, t: tops, f: fronts,
 *  rim: the back edge of each roof, which catches the low sun.
 */
function cityRows(n, seed) {
  // Heights grow with the square root of the day's count, relative to the busiest day but never
  // to fewer than 10, so a quiet year builds a low town instead of a skyline.
  const cap = Math.max(10, n.maxDay);
  const FLOOR = 0.075; // storey height, in lanes
  const towers = [];
  const rows = n.grid.map((week, w) => {
    const D = rowDepth(w);
    const df = D - CAM.bd;
    const db = D + CAM.bd;
    const out = { w, D, base: r1(proj(0, 0, df)[1]), sR: '', sL: '', t: '', f: '', rim: '', floors: '', lit: '', lamps: '' };
    // Outside lanes first, the lane under the camera last.
    [0, 6, 1, 5, 2, 4, 3].forEach((lane) => {
      const day = week[lane];
      if (!day || day.count <= 0) return;
      const rand = seededRandom(`${seed}:${day.date}`);
      const h = CAM.hmax * Math.max(0.07, Math.sqrt(Math.min(1, day.count / cap)));
      const X = (lane - 3) * 1;
      const bw = CAM.bw - rand() * 0.08; // footprints vary a little; fronts stay in one plane
      const xl = X - bw;
      const xr = X + bw;
      const [fxl, fyb] = proj(xl, 0, df);
      const [fxr, fyt] = proj(xr, h, df);
      const [bxl, byt] = proj(xl, h, db);
      const [bxr, byb] = proj(xr, 0, db);
      if (Math.max(fxr, bxr) < VIEW.x0 - 2 || Math.min(fxl, bxl) > VIEW.x1 + 2) return;
      out.f += pth`M${fxl} ${fyb}V${fyt}H${fxr}V${fyb}Z`;
      out.t += pth`M${fxl} ${fyt}H${fxr}L${bxr} ${byt}H${bxl}Z`;
      if (lane < 3) out.sR += pth`M${fxr} ${fyt}L${bxr} ${byt}V${byb}L${fxr} ${fyb}Z`;
      if (lane > 3) out.sL += pth`M${fxl} ${fyt}L${bxl} ${byt}V${byb}L${fxl} ${fyb}Z`;
      out.rim += pth`M${bxl} ${byt}H${bxr}`;
      // Close to the camera, towers get storeys and, at dusk, a few lit windows.
      const storey = (CAM.f * FLOOR) / df;
      if (storey > 4.5) {
        const floors = Math.floor(h / FLOOR);
        const cols = Math.max(2, Math.round((fxr - fxl) / (storey * 1.15)));
        const cw = (fxr - fxl) / cols;
        for (let k = 1; k < floors; k++) {
          const y = fyb - k * storey;
          out.floors += pth`M${fxl} ${y}H${fxr}`;
          for (let j = 0; j < cols; j++) {
            if (rand() < 0.16) out.lit += pth`M${fxl + j * cw + cw * 0.25} ${y - storey * 0.45}h${cw * 0.5}`;
          }
        }
      }
      towers.push({ w, lane, day, h, top: [r1((bxl + bxr) / 2), r1(byt)], D });
    });
    // Street lamps along the alleys, in front of this row.
    if (out.f) {
      for (let k = -3; k <= 4; k++) {
        const [lx, ly] = proj(k - 0.5, 0, D - CAM.wd / 2);
        if (lx > VIEW.x0 && lx < VIEW.x1 && ly < VIEW.y1) out.lamps += pth`M${lx} ${ly}h0`;
      }
    }
    return out;
  });
  return { rows, towers };
}

// One row as reusable geometry. Faces take their colours from custom properties set on each
// <use>, so the same towers render as every pass; the details (storeys, windows, lamps, the rim of
// light on each roof) only show where a pass sets their colours.
function rowDef(row) {
  const el = (cls, d, extra = '') => (d ? `<path class="${cls}" d="${d}"${extra}/>` : '');
  return `<g id="r${row.w}">${el('a', row.sR)}${el('b', row.sL)}${el('t', row.t)}${el('f', row.f)}${el('l', row.floors)}${el('n', row.lit, ` stroke-width="${r1(Math.max(1, 5 / row.D))}"`)}${el('r', row.rim)}${el('s', row.lamps, ` stroke-width="${r1(Math.max(1.2, 9 / row.D))}"`)}</g>`;
}

// ---------------------------------------------------------------------------
// 1. Hero — the shot breakdown
// ---------------------------------------------------------------------------

const PASSES = ['WIRE', 'CLAY', 'NORMALS', 'DEPTH', 'BEAUTY'];

// The name is lettering placed in the scene, so every pass renders it too.
function nameIn(pass, c, dark) {
  if (pass === 'wire') return `<use xlink:href="#nm" class="draw" fill="none" stroke="${c.wire}" stroke-width="1.1"/>`;
  if (pass === 'clay') return `<use xlink:href="#nm" fill="#000000" opacity=".22" transform="translate(0 3)"/><use xlink:href="#nm" fill="${c.clay.t}"/>`;
  if (pass === 'normals') return '<use xlink:href="#nm" fill="#8080ff"/>';
  if (pass === 'depth') return '<use xlink:href="#nm" fill="#5c5c5c"/>';
  return `<use xlink:href="#nm" fill="${c.nameShade}" opacity="${dark ? 0.35 : 0.5}" transform="translate(0 2)"/><use xlink:href="#nm" fill="${c.nameFill}"/>`;
}

export function heroSvg(profile, themeName, { role }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 600;
  const n = breakdownNumbers(profile);
  const rand = seededRandom(`breakdown:${profile.login}`);
  const { x0, y0, x1, y1 } = VIEW;
  const VW = x1 - x0;
  const VH = y1 - y0;
  const HY = CAM.hy;
  const { rows, towers } = cityRows(n, `breakdown:${profile.login}`);
  const live = rows.filter((r) => r.f);

  // --- Timing. The city extrudes in date order, then each pass wipes in over the last.
  const BUILD = 0.45; // first row starts
  const ROW = 0.022; // per week
  const EXT = 0.5; // each row's extrusion
  const BUILT = BUILD + 52 * ROW + EXT;
  const WIPE_T = 0.45;
  const HOLD = 0.26;
  const wipeAt = [1, 2, 3, 4].map((k) => r1((BUILT + 0.15 + (k - 1) * (WIPE_T + HOLD)) * 100) / 100);
  const BEAUTY_T = 0.7; // the last wipe is slower
  const DONE = wipeAt[3] + BEAUTY_T;
  const passStart = [0, ...wipeAt];

  // --- Geometry, shared by every pass.
  const defsRows = live.map(rowDef).join('');
  const city = (vars, extra = '') => `<g style="${vars}"${extra}>${live.map((r) => `<use xlink:href="#r${r.w}"/>`).join('')}</g>`;
  const v = (o) => Object.entries(o).map(([k, val]) => `--${k}:${val}`).join(';');

  // Depth of each row from 0 (nearest) to 1 (farthest), and the haze that comes with it.
  const dMin = rowDepth(52);
  const dMax = rowDepth(0);
  const far = (D) => (D - dMin) / (dMax - dMin);
  const hazeAt = (D) => 0.86 * (1 - Math.exp(-(D - dMin) / 8));

  // Ground lines for the wireframe viewport: lane lines converging on the vanishing point and one
  // line per week.
  let grid = '';
  let major = '';
  for (let k = -16; k <= 16; k++) {
    const X = k + 0.5;
    const [ax, ay] = proj(X, 0, 1.2);
    const [bx, by] = proj(X, 0, 60);
    grid += pth`M${ax} ${ay}L${bx} ${by}`;
  }
  for (let w = 0; w <= 53; w++) {
    const y = proj(0, 0, rowDepth(w) + CAM.wd / 2)[1];
    if (y > y1 + 4) continue;
    (w % 4 === 0 ? (s) => (major += s) : (s) => (grid += s))(pth`M${x0} ${y}H${x1}`);
  }

  // --- Pass 1: wireframe. Hidden-line towers over the viewport grid; each row extrudes in turn.
  const wireRows = live
    .map(
      (r) =>
        `<use xlink:href="#r${r.w}" class="ext" style="transform-origin:600px ${r.base}px;animation-delay:${r1((BUILD + r.w * ROW) * 100) / 100}s"/>`
    )
    .join('');
  const gizmo = (gx, gy) => `<g font-family="${MONO}" font-size="9" font-weight="700">
<path d="M${gx} ${gy}h22" stroke="#e5484d" stroke-width="1.6"/><text x="${gx + 26}" y="${gy + 3}" fill="#e5484d">X</text>
<path d="M${gx} ${gy}v-22" stroke="#46a758" stroke-width="1.6"/><text x="${gx - 3}" y="${gy - 26}" fill="#46a758">Y</text>
<path d="M${gx} ${gy}l-12 10" stroke="#4a9eff" stroke-width="1.6"/><text x="${gx - 22}" y="${gy + 16}" fill="#4a9eff">Z</text>
<circle cx="${gx}" cy="${gy}" r="2.2" fill="${c.muted}"/></g>`;
  const passLabel = (name, sub, color) =>
    `<text x="${x0 + 18}" y="${y0 + 24}" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="2" fill="${color}">${name}<tspan font-weight="400" fill-opacity=".7">  ${sub}</tspan></text>`;
  const safe = `<g fill="none" stroke="${c.wire}" stroke-opacity=".35" stroke-dasharray="4 5"><rect x="${x0 + VW * 0.05}" y="${y0 + VH * 0.05}" width="${VW * 0.9}" height="${VH * 0.9}"/><rect x="${x0 + VW * 0.1}" y="${y0 + VH * 0.1}" width="${VW * 0.8}" height="${VH * 0.8}"/></g>`;
  const wirePass = `<g class="hold" style="animation-duration:${wipeAt[0] + WIPE_T}s" opacity="0">
<rect x="${x0}" y="${y0}" width="${VW}" height="${VH}" fill="url(#wireBg)"/>
<g mask="url(#wireFade)"><path d="${grid}" stroke="${c.grid}" stroke-width=".8" fill="none"/>
<path d="${major}" stroke="${c.gridMajor}" stroke-width=".9" fill="none"/></g>
<g style="${v({ a: c.wireBg[1], b: c.wireBg[1], t: c.wireBg[1], f: c.wireBg[1] })}" stroke="${c.wire}" stroke-width=".7" stroke-linejoin="round" mask="url(#wireFade)">${wireRows}</g>
${nameIn('wire', c, dark)}
${safe}
${passLabel('WIRE', 'persp · 35 mm', c.wire)}
${gizmo(x0 + 44, y1 - 30)}
</g>`;

  // --- Pass 2: clay.
  const clayPass = `<g class="hold" style="animation-duration:${wipeAt[1] + WIPE_T}s" opacity="0"><g clip-path="url(#wp0)">
<rect x="${x0}" y="${y0}" width="${VW}" height="${HY - y0}" fill="url(#claySky)"/>
<rect x="${x0}" y="${HY}" width="${VW}" height="${y1 - HY}" fill="url(#clayGround)"/>
${city(v({ a: c.clay.sR, b: c.clay.sL, t: c.clay.t, f: c.clay.f }))}
${nameIn('clay', c, dark)}
${passLabel('CLAY', 'grey shader · 1 key', c.fg)}
</g></g>`;

  // --- Pass 3: normals, world space, mapped from -1..1 to 0..255.
  const normalPass = `<g class="hold" style="animation-duration:${wipeAt[2] + WIPE_T}s" opacity="0"><g clip-path="url(#wp1)">
<rect x="${x0}" y="${y0}" width="${VW}" height="${VH}" fill="#000000"/>
<rect x="${x0}" y="${HY}" width="${VW}" height="${y1 - HY}" fill="#80ff80"/>
${city(v({ a: '#ff8080', b: '#008080', t: '#80ff80', f: '#8080ff' }))}
${nameIn('normals', c, dark)}
${passLabel('NORMALS', 'world · N.xyz', '#ffffff')}
</g></g>`;

  // --- Pass 4: depth, one grey per row (near is white).
  const depthGrey = (D) => grey(Math.pow(Math.max(0, Math.min(1, 1 - far(D))), 1.6) * 0.92 + 0.04);
  const depthRows = live.map((r) => `<use xlink:href="#r${r.w}" style="${v({ a: depthGrey(r.D), b: depthGrey(r.D), t: depthGrey(r.D), f: depthGrey(r.D) })}"/>`).join('');
  const depthPass = `<g class="hold" style="animation-duration:${wipeAt[3] + BEAUTY_T}s" opacity="0"><g clip-path="url(#wp2)">
<rect x="${x0}" y="${y0}" width="${VW}" height="${VH}" fill="#000000"/>
<rect x="${x0}" y="${HY}" width="${VW}" height="${y1 - HY}" fill="url(#depthGround)"/>
${depthRows}
${nameIn('depth', c, dark)}
${passLabel('DEPTH', 'Z · normalised', '#ffffff')}
</g></g>`;

  // --- Pass 5: beauty.
  const beautyRows = live
    .map((r) => {
      const k = hazeAt(r.D);
      // Roofs reflect more of the bright horizon the flatter they are seen, so they brighten
      // with distance before the haze takes them.
      const roof = mix(c.beauty.t, c.glow, dark ? 0.12 + far(r.D) * 0.3 : 0.1);
      const front = mix(c.beauty.f, c.haze, k);
      return `<use xlink:href="#r${r.w}" style="${v({
        a: mix(c.beauty.sR, c.haze, k),
        b: mix(c.beauty.sL, c.haze, k),
        t: mix(roof, c.haze, k * 0.9),
        f: front,
        l: mix(front, dark ? '#000000' : '#ffffff', dark ? 0.35 : 0.3),
        n: c.window,
        r: mix(c.rim, c.haze, k * 0.8),
        s: c.lamp,
      })}"/>`;
    })
    .join('');

  // Aviation beacons on the tallest towers, blinking.
  const beacons = [...towers]
    .sort((a, b) => b.h - a.h)
    .slice(0, Math.min(9, Math.ceil(towers.length * 0.03)))
    .filter((t) => t.h > CAM.hmax * 0.6)
    .map((t, i) => {
      const s = Math.max(0.5, Math.min(1.6, 4 / t.D));
      return `<g transform="translate(${t.top[0]} ${r1(t.top[1] - 1)})"><g class="pulse" style="animation-duration:${r1(1.6 + (i % 3) * 0.35)}s;animation-delay:-${r1(i * 0.37)}s"><circle r="${r1(6 * s)}" fill="url(#beacon)"/><circle r="${r1(1.3 * s)}" fill="${c.beacon}"/></g></g>`;
    })
    .join('');

  // Clouds: long thin streaks lit from below by the sun.
  const clouds = Array.from({ length: 7 }, (_, i) => {
    const cy = Math.round(HY - 26 - rand() * 150);
    const cx = Math.round(80 + rand() * 1040);
    const rx = Math.round(120 + rand() * 220);
    const ry = r1(2 + rand() * 4);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" opacity="${r1((0.4 + rand() * 0.6) * 100) / 100}"/>`;
  }).join('');

  // The causeway the city stands on, reaching to the horizon.
  const CW = 3.62;
  const [cnl, cny] = proj(-CW, 0, 1.2);
  const [cnr] = proj(CW, 0, 1.2);
  const [cfl, cfy] = proj(-CW, 0, dMax + 0.4);
  const [cfr] = proj(CW, 0, dMax + 0.4);
  const causeway = pth`M${cnl} ${cny}L${cfl} ${cfy}H${cfr}L${cnr} ${cny}Z`;
  const causewayEdge = pth`M${cnl} ${cny}L${cfl} ${cfy}H${cfr}L${cnr} ${cny}`;

  // Glints on the water, either side of the city.
  let glints = '';
  for (let i = 0; i < 70; i++) {
    const D = 1.6 + rand() ** 1.6 * 40;
    const y = proj(0, 0, D)[1];
    const span = 260 / D + 30;
    const xx = CAM.cx + (rand() < 0.5 ? -1 : 1) * (proj(3.7, 0, D)[0] - CAM.cx + rand() * 500);
    glints += pth`M${xx - span / 2} ${y}h${span * (0.3 + rand() * 0.5)}`;
  }

  const beautyPass = `<g clip-path="url(#wp3)">
<rect x="${x0}" y="${y0}" width="${VW}" height="${HY - y0}" fill="url(#sky)"/>
<ellipse cx="${CAM.cx}" cy="${HY}" rx="520" ry="150" fill="url(#sunGlow)"/>
<g fill="${c.cloud}" opacity="${c.cloudOp}">${`<g class="drift" style="animation-duration:23s">${clouds}</g>`}</g>
<circle cx="${CAM.cx}" cy="${HY}" r="15" fill="${c.sun}"/>
<rect x="${x0}" y="${HY}" width="${VW}" height="${y1 - HY}" fill="url(#water)"/>
<ellipse cx="${CAM.cx}" cy="${HY + 2}" rx="420" ry="34" fill="url(#sunPool)"/>
<g class="drift" style="animation-duration:9s;animation-direction:reverse"><path d="${glints}" stroke="${c.glow}" stroke-opacity="${dark ? 0.28 : 0.7}" stroke-width="1.1" stroke-linecap="round"/></g>
<path d="${causeway}" fill="url(#street)"/>
<path d="${causewayEdge}" fill="none" stroke="${c.rim}" stroke-opacity="${dark ? 0.35 : 0.8}" stroke-width="1"/>
${beautyRows}
${beacons}
${nameIn('beauty', c, dark)}
</g>`;

  // --- The wipe bars, one per pass change.
  const wipeBars = wipeAt
    .map(
      (t, i) => `<g class="bar" style="animation-delay:${t}s;animation-duration:${i === 3 ? BEAUTY_T : WIPE_T}s" opacity="0">
<rect x="${x1 - 40}" y="${y0}" width="40" height="${VH}" fill="url(#barGlow)"/>
<path d="M${x1} ${y0}V${y1}" stroke="${c.gold}" stroke-width="1.6"/>
<rect x="${x1 - 74}" y="${y0 + 10}" width="68" height="18" rx="3" fill="${c.gold}"/>
<text x="${x1 - 40}" y="${y0 + 22.5}" text-anchor="middle" font-family="${MONO}" font-size="9.5" font-weight="700" letter-spacing="1.5" fill="${c.bg}">${PASSES[i + 1]}</text>
</g>`
    )
    .join('');

  // --- Title: the name comp'd into the sky.
  const name = profile.name || profile.login;
  const caps = name.toUpperCase();
  const len = Math.max(1, [...caps].length);
  const S = Math.round(Math.max(30, Math.min(62, 860 / (len * 0.86))));
  const tw = r1(Math.min(880, len * S * 0.86));
  const base = 170;
  const nx = r1(CAM.cx - tw / 2);
  const kicker = [role ? role : `@${profile.login}`, profile.location].filter(Boolean).join('   ·   ').toUpperCase();
  const headline = balance(profile.headline, 74)
    .map(
      (line, i) =>
        `<text class="rise" style="animation-delay:${r1((DONE + 0.55 + i * 0.12) * 100) / 100}s" x="${CAM.cx}" y="${base + 34 + i * 24}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="18" fill="${c.nameFill}" fill-opacity="${dark ? 0.82 : 0.78}">${escapeXml(line)}</text>`
    )
    .join('');

  // Anamorphic flare across the frame at the sun, and the streak's soft core.
  const flare = `<g class="flare"><g class="pulse" style="animation-duration:5.5s">
<ellipse cx="${CAM.cx}" cy="${HY}" rx="${VW * 0.62}" ry="7" fill="url(#streak)" opacity="${c.flareOp}"/>
<ellipse cx="${CAM.cx}" cy="${HY}" rx="${VW * 0.34}" ry="1.6" fill="url(#streakCore)"/>
</g></g>`;

  // --- Chrome: top bar with the pass tabs, bottom bar with the timeline.
  const TABX = [512, 562, 615, 680, 742];
  const tabs = PASSES.map((p, i) => {
    const a = passStart[i];
    const b = i < 4 ? passStart[i + 1] + (i === 3 ? BEAUTY_T : WIPE_T) * 0.5 : null;
    // Each tab lights up while its pass is on screen; BEAUTY rests lit.
    const anim = i < 4 ? `class="tabOn" style="animation-delay:${r1(a * 100) / 100}s;animation-duration:${r1((b - a) * 100) / 100}s"` : `class="tabWait" style="animation-duration:${r1((wipeAt[3] + BEAUTY_T * 0.5) * 100) / 100}s"`;
    return `<text ${anim} x="${TABX[i]}" y="25" text-anchor="middle" fill="${i === 4 ? c.gold : c.muted}">${p}</text>`;
  }).join('');
  const tabSteps = PASSES.slice(0, 4)
    .map((_, i) => {
      const pct = (t) => r1((t / (wipeAt[3] + BEAUTY_T * 0.5)) * 1000) / 10;
      const from = i === 0 ? 0 : pct(wipeAt[i - 1] + WIPE_T * 0.5);
      const to = pct(wipeAt[i] + (i === 3 ? BEAUTY_T : WIPE_T) * 0.5) - 3;
      const x = TABX[i] - TABX[4];
      return `${from}%,${to}%{transform:translateX(${x}px)}`;
    })
    .join('');

  // Timeline: one frame per day, bar height by count; the playhead runs the year as it builds.
  const T0 = 72;
  const T1 = 1128;
  const tx = (i) => T0 + ((T1 - T0) * i) / Math.max(1, n.frames - 1);
  const capT = Math.max(10, n.maxDay);
  let bars = '';
  n.days.forEach((d, i) => {
    if (d.count > 0) bars += pth`M${tx(i)} 566v${-Math.max(1.5, 20 * Math.sqrt(Math.min(1, d.count / capT)))}`;
  });
  let ticks = '';
  let monthLabels = '';
  n.days.forEach((d, i) => {
    if (d.date.slice(8) === '01') {
      ticks += pth`M${tx(i)} 568v5`;
      if (tx(i) < T1 - 30) monthLabels += `<text x="${r1(tx(i) + 3)}" y="582">${MONTHS[Number(d.date.slice(5, 7)) - 1]}</text>`;
    }
  });
  const lastFrame = FIRST_FRAME + n.frames - 1;
  const peakKey = n.peak
    ? `<path d="M${r1(tx(n.peak.index))} 538l4 4l-4 4l-4 -4z" fill="${c.gold}"/><text x="${r1(tx(n.peak.index) + (tx(n.peak.index) > 1000 ? -8 : 8))}" y="545" text-anchor="${tx(n.peak.index) > 1000 ? 'end' : 'start'}" font-size="8" letter-spacing="1" fill="${c.gold}">PEAK · ${dayMonth(n.peak.date)} · ${plural(n.peak.count, 'CONTRIBUTION', 'CONTRIBUTIONS')}</text>`
    : '';

  // Frame counter that rolls with the playhead.
  const counter = frameCounter(lastFrame, 1176, 25, 11, c.fg);

  const css = `
.ext{animation:ext ${EXT}s ${EXPO} both}
.hold{animation-name:show;animation-timing-function:step-end;animation-fill-mode:both}
.wipe{transform-box:fill-box;transform-origin:left center;animation-name:wipe;animation-timing-function:${WIPE};animation-fill-mode:both;animation-duration:${WIPE_T}s}
/* no fill: the bar is invisible before and after its sweep */
.bar{animation-name:bar;animation-timing-function:${WIPE}}
.tabOn{animation-name:tabOn;animation-timing-function:step-end;animation-fill-mode:forwards}
.tabWait{animation:tabWait step-end both}
.uline{animation:uline ${r1((wipeAt[3] + BEAUTY_T * 0.5) * 100) / 100}s both}
.play{animation:play ${BUILT - BUILD}s cubic-bezier(.4,0,.2,1) ${BUILD}s both}
.roll{animation:roll ${BUILT - BUILD}s cubic-bezier(.4,0,.2,1) ${BUILD}s both}
.boot{animation:fade .6s ease-out .1s both}
.flare{transform-origin:${CAM.cx}px ${HY}px;animation:flare 1.8s ${EXPO} ${r1((DONE - 0.2) * 100) / 100}s both}
.draw{stroke-dasharray:700;animation:draw 1.7s cubic-bezier(.5,0,.3,1) .5s both}
.glint{animation:glint 1.5s cubic-bezier(.5,0,.3,1) ${r1((DONE + 0.75) * 100) / 100}s both}
.rise{animation:rise .9s ${EXPO} both}
.kick{animation:rise .9s ${EXPO} ${r1((DONE + 0.35) * 100) / 100}s both}
.late{animation:fade 1s ease-out ${r1(DONE * 100) / 100}s both}
.pulse{animation-name:pulse;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.drift{animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.a{fill:var(--a)}.b{fill:var(--b)}.t{fill:var(--t)}.f{fill:var(--f)}
.l{fill:none;stroke:var(--l,none);stroke-width:.6}
.n{fill:none;stroke:var(--n,none)}
.r{fill:none;stroke:var(--r,none);stroke-width:1.1;stroke-linecap:round}
.s{fill:none;stroke:var(--s,none);stroke-linecap:round}
@keyframes ext{from{transform:scaleY(0)}}
@keyframes show{from{opacity:1}}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes bar{from{transform:translateX(-${VW}px);opacity:1}88%{opacity:1}}
@keyframes tabOn{from{fill:${c.gold}}}
@keyframes tabWait{from{fill:${c.muted}}}
@keyframes uline{${tabSteps}}
@keyframes play{from{transform:translateX(${T0 - T1}px)}}
@keyframes roll{from{transform:translateY(0)}}
@keyframes fade{from{opacity:0}}
@keyframes flare{from{opacity:0;transform:scaleX(.2)}}
@keyframes draw{from{stroke-dashoffset:700}}
@keyframes glint{from{transform:translateX(-${tw + 260}px)}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}
${LOOPS}
${REDUCED}`;

  const aria = `${name}${profile.headline ? ` — ${profile.headline.replace(/[.!?\s]+$/, '')}` : ''}. A visual-effects shot breakdown: a city with one tower per day of the last year, as tall as that day was busy, rendered as wireframe, clay, normals and depth passes, then the final beauty pass at sunset, with the name as the title.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <clipPath id="viewer"><rect x="${x0}" y="${y0}" width="${VW}" height="${VH}"/></clipPath>
  ${wipeAt.map((t, i) => `<clipPath id="wp${i}"><rect class="wipe" style="animation-delay:${t}s${i === 3 ? `;animation-duration:${BEAUTY_T}s` : ''}" x="${x0}" y="${y0}" width="${VW}" height="${VH}"/></clipPath>`).join('')}
  <linearGradient id="wireBg" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.wireBg[0]}"/><stop offset="1" stop-color="${c.wireBg[1]}"/></linearGradient>
  <linearGradient id="fadeGrad" x1="0" y1="${HY}" x2="0" y2="${HY + 70}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="wireFade" maskUnits="userSpaceOnUse" x="${x0}" y="${y0}" width="${VW}" height="${VH}"><rect x="${x0}" y="${y0}" width="${VW}" height="${VH}" fill="url(#fadeGrad)"/></mask>
  <linearGradient id="claySky" x1="0" y1="${y0}" x2="0" y2="${HY}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.claySky[0]}"/><stop offset="1" stop-color="${c.claySky[1]}"/></linearGradient>
  <linearGradient id="clayGround" x1="0" y1="${HY}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.clayGround[1]}"/><stop offset="1" stop-color="${c.clayGround[0]}"/></linearGradient>
  <linearGradient id="depthGround" x1="0" y1="${HY}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse">${[0, 0.02, 0.05, 0.1, 0.2, 0.35, 0.55, 0.8, 1]
    .map((o) => `<stop offset="${o}" stop-color="${o === 0 ? '#000000' : depthGrey(Math.min(dMax * 1.6, (CAM.f * CAM.y) / (o * (y1 - HY))))}"/>`)
    .join('')}</linearGradient>
  <linearGradient id="sky" x1="0" y1="${y0}" x2="0" y2="${HY}" gradientUnits="userSpaceOnUse">${c.sky.map((col, i) => `<stop offset="${[0, 0.35, 0.62, 0.86, 1][i]}" stop-color="${col}"/>`).join('')}</linearGradient>
  <linearGradient id="street" x1="0" y1="${HY}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.haze}"/><stop offset=".25" stop-color="${mix(c.street, c.haze, 0.45)}"/><stop offset="1" stop-color="${c.street}"/></linearGradient>
  <linearGradient id="water" x1="0" y1="${HY}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.water[0]}"/><stop offset=".18" stop-color="${c.water[1]}"/><stop offset="1" stop-color="${c.water[2]}"/></linearGradient>
  <radialGradient id="sunGlow"><stop offset="0" stop-color="${c.glow}" stop-opacity="${dark ? 0.75 : 0.9}"/><stop offset=".3" stop-color="${c.glow}" stop-opacity="${dark ? 0.25 : 0.45}"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
  <radialGradient id="sunPool"><stop offset="0" stop-color="${c.sun}" stop-opacity="${dark ? 0.55 : 0.8}"/><stop offset="1" stop-color="${c.sun}" stop-opacity="0"/></radialGradient>
  <radialGradient id="beacon"><stop offset="0" stop-color="${c.beacon}" stop-opacity=".7"/><stop offset="1" stop-color="${c.beacon}" stop-opacity="0"/></radialGradient>
  <linearGradient id="streak"><stop offset="0" stop-color="${c.flare}" stop-opacity="0"/><stop offset=".5" stop-color="${c.flare}"/><stop offset="1" stop-color="${c.flare}" stop-opacity="0"/></linearGradient>
  <linearGradient id="streakCore"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <linearGradient id="barGlow"><stop offset="0" stop-color="${c.gold}" stop-opacity="0"/><stop offset="1" stop-color="${c.gold}" stop-opacity=".22"/></linearGradient>
  <linearGradient id="glintGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${dark ? 0.9 : 0.7}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <text id="nm" x="${nx}" y="${base}" textLength="${tw}" lengthAdjust="spacingAndGlyphs" font-family="${SERIF}" font-size="${S}" letter-spacing="${r1(S * 0.16)}">${escapeXml(caps)}</text>
  <clipPath id="nmClip"><use xlink:href="#nm"/></clipPath>
  ${defsRows}
  ${counter.defs}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <g clip-path="url(#viewer)">
    ${wirePass}
    ${clayPass}
    ${normalPass}
    ${depthPass}
    ${beautyPass}
    ${flare}
    <g clip-path="url(#nmClip)"><path class="glint" d="${pth`M${nx + tw + 60} ${base - S}h120l-60 ${S * 1.3}h-120z`}" fill="url(#glintGrad)"/></g>
    <text class="kick" x="${CAM.cx}" y="${r1(base - S * 0.72 - 24)}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="3.6" fill="${c.gold}">${escapeXml(kicker)}</text>
    ${headline}
    ${wipeBars}
    <g class="late" fill="none" stroke="${c.gold}" stroke-width="1.4" stroke-opacity=".8">
      <path d="M${x0 + 14} ${y0 + 40}v-26h26M${x1 - 14} ${y0 + 40}v-26h-26M${x0 + 14} ${y1 - 40}v26h26M${x1 - 14} ${y1 - 40}v26h-26"/>
    </g>
    <text class="late" x="${x1 - 18}" y="${y1 - 20}" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${dark ? c.fg : c.fg}" fill-opacity=".7">BEAUTY · FINAL · v${String(n.version).padStart(3, '0')}</text>
  </g>
  <g class="boot" font-family="${MONO}">
    <rect width="${W}" height="${y0}" fill="${c.bar}"/>
    <path d="M0 ${y0 - 0.5}H${W}M0 ${y1 + 0.5}H${W}" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
    <rect x="24" y="14" width="12" height="12" rx="2" fill="none" stroke="${c.gold}" stroke-width="1.4"/><circle class="pulse" style="animation-duration:2s" cx="30" cy="20" r="2.4" fill="${c.gold}"/>
    <text x="46" y="25" font-size="11" font-weight="700" letter-spacing="1.6" fill="${c.fg}">${escapeXml(shotCode(profile))}</text>
    <text x="${46 + shotCode(profile).length * 8.2 + 10}" y="25" font-size="10" letter-spacing="1" fill="${c.muted}">comp_v${String(n.version).padStart(3, '0')}</text>
    <g font-size="9.5" letter-spacing="1.6">${tabs}</g>
    <rect class="uline" x="${TABX[4] - 24}" y="33" width="48" height="2" fill="${c.gold}"/>
    <text x="1110" y="25" text-anchor="end" font-size="10" letter-spacing="1" fill="${c.muted}">2048×858 · 2.39 · 24 fps</text>
    <text x="1128" y="25" text-anchor="end" font-size="9" letter-spacing="1" fill="${c.muted}">F</text>
    ${counter.svg}
  </g>
  <g class="boot" font-family="${MONO}">
    <path d="${bars}" stroke="${c.gold}" stroke-opacity="${dark ? 0.55 : 0.7}" stroke-width="1.6"/>
    <path d="M${T0} 566.5H${T1}" stroke="${c.line}" stroke-opacity=".2"/>
    <path d="${ticks}" stroke="${c.muted}" stroke-opacity=".6"/>
    <g font-size="8" letter-spacing="1" fill="${c.muted}">${monthLabels}</g>
    ${peakKey}
    <text x="${T0 - 10}" y="569" text-anchor="end" font-size="9" fill="${c.muted}">${FIRST_FRAME}</text>
    <text x="${T1 + 10}" y="569" font-size="9" fill="${c.muted}">${lastFrame}</text>
    <text x="${T0}" y="594" font-size="8.5" letter-spacing="1.4" fill="${c.muted}">ONE FRAME PER DAY · ${plural(n.total, 'CONTRIBUTION', 'CONTRIBUTIONS')} · ${plural(n.active, 'ACTIVE DAY', 'ACTIVE DAYS')}</text>
    <text x="${T1}" y="594" text-anchor="end" font-size="8.5" letter-spacing="1.4" fill="${c.muted}">ONE TOWER PER DAY · ONE ROW PER WEEK</text>
    <g class="play"><path d="M${T1} 552V572" stroke="${c.fg}" stroke-width="1.4"/><path d="M${T1 - 5} 548h10v4l-5 5l-5 -5z" fill="${c.fg}"/></g>
  </g>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Comp script — your work as a node graph
// ---------------------------------------------------------------------------

// A material-preview thumbnail: a primitive in the repo's language colour, on a studio backdrop.
function shaderBall(kind, color, x, y, w, h, uid, c, dark) {
  const cx = x + w / 2;
  const fy = y + h * 0.8; // floor line
  const lit = mix(color, '#ffffff', 0.55);
  const shade = mix(color, '#000000', dark ? 0.7 : 0.55);
  const grad = `<radialGradient id="mt${uid}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="${lit}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${shade}"/></radialGradient>`;
  const back = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#cyc)"/><ellipse cx="${cx + 3}" cy="${r1(fy + 1)}" rx="20" ry="3.4" fill="#000000" opacity="${dark ? 0.55 : 0.22}"/>`;
  const spec = (sx, sy, r = 2.4) => `<ellipse cx="${r1(sx)}" cy="${r1(sy)}" rx="${r}" ry="${r1(r * 0.7)}" fill="#ffffff" opacity=".85"/>`;
  let shape;
  if (kind === 0) {
    shape = `<circle cx="${cx}" cy="${r1(fy - 16)}" r="16" fill="url(#mt${uid})"/>${spec(cx - 6, fy - 23)}`;
  } else if (kind === 1) {
    const s = 13;
    shape = `<path d="${pth`M${cx} ${fy - 2 * s - 6}l${s} ${6}l${-s} ${6}l${-s} ${-6}z`}" fill="${lit}"/><path d="${pth`M${cx - s} ${fy - 2 * s}l${s} ${6}v${s + 6}l${-s} ${-6}z`}" fill="${color}"/><path d="${pth`M${cx + s} ${fy - 2 * s}l${-s} ${6}v${s + 6}l${s} ${-6}z`}" fill="${shade}"/>`;
  } else if (kind === 2) {
    shape = `<path d="${pth`M${cx - 13} ${fy - 30}V${fy - 3}a13 4 0 0 0 26 0V${fy - 30}z`}" fill="url(#mtc${uid})"/><ellipse cx="${cx}" cy="${r1(fy - 30)}" rx="13" ry="4" fill="${lit}"/>`;
    shape = `<linearGradient id="mtc${uid}"><stop offset="0" stop-color="${mix(color, '#000000', 0.2)}"/><stop offset=".3" stop-color="${lit}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${shade}"/></linearGradient>${shape}`;
  } else {
    // A small teapot, the oldest test object in computer graphics.
    const ty = fy - 13;
    shape = `<g transform="translate(${cx - 2} ${r1(ty)})" fill="url(#mt${uid})"><path d="M-12 -2c-9 -3 -11 9 -2 9" fill="none" stroke="${color}" stroke-width="2.6"/><path d="M11 3c7 0 8 -9 13 -12l1.6 1.4c-4 4 -5 13 -14 13z"/><ellipse cy="1" rx="14" ry="11"/><ellipse cy="-9.5" rx="8" ry="2.4" fill="${lit}"/><circle cy="-12.4" r="2" fill="${lit}"/></g>${spec(cx - 8, ty - 5, 2.2)}`;
  }
  return { defs: grad, svg: `${back}${shape}` };
}

export function scriptSvg(profile, themeName, { toolkit }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 610;
  const n = breakdownNumbers(profile);
  const shot = shotCode(profile);
  const ver = `v${String(n.version).padStart(3, '0')}`;
  const featured = (profile.featured || [])
    .map((r) => (profile.repos || []).find((x) => x.name === r))
    .filter(Boolean)
    .slice(0, 4);
  const langs = (profile.languages || []).slice(0, 6);
  let defs = '';

  // --- Layout: the B pipe runs left to right; repos come in from above and below as A inputs.
  const PY = 236;
  const PANEL = 412; // the render log and colour chart start here
  const PLATE = { x: 40, w: 124 };
  const OUT = { grade: 806, write: 936, viewer: 1086 };
  const mx = featured.map((_, i) => Math.round(300 + (390 * (i + 0.5)) / featured.length));
  const at = (k) => r1(0.35 + k * 0.16); // when node k of the flow appears

  // Read node: postage stamp on top, then the name and a line of metadata.
  const readNode = (x, y, label, sub, stampSvg, k) => `<g class="pop" style="animation-delay:${at(k)}s">
<rect x="${x + 2}" y="${y + 3}" width="124" height="102" rx="5" fill="#000000" opacity="${dark ? 0.5 : 0.12}"/>
<rect x="${x}" y="${y}" width="124" height="102" rx="5" fill="${c.node.read}"/>
<g clip-path="url(#st${k})">${stampSvg}</g>
<clipPath id="st${k}"><rect x="${x + 4}" y="${y + 4}" width="116" height="58" rx="2"/></clipPath>
<text x="${x + 62}" y="${y + 78}" text-anchor="middle" font-family="${MONO}" font-size="10.5" font-weight="700" fill="${c.nodeText}">${escapeXml(trunc(label, 16))}</text>
${sub ? `<text x="${x + 62}" y="${y + 93}" text-anchor="middle" font-family="${MONO}" font-size="9" fill="${c.nodeText}" fill-opacity=".62">${escapeXml(trunc(sub, 20))}</text>` : ''}
</g>`;
  const smallNode = (x, w, fill, label, sub, k) => `<g class="pop" style="animation-delay:${at(k)}s">
<rect x="${x + 2}" y="${PY - 13}" width="${w}" height="28" rx="5" fill="#000000" opacity="${dark ? 0.5 : 0.12}"/>
<rect x="${x}" y="${PY - 15}" width="${w}" height="30" rx="5" fill="${fill}"/>
<text x="${r1(x + w / 2)}" y="${PY + 4}" text-anchor="middle" font-family="${MONO}" font-size="10.5" font-weight="700" fill="${c.nodeText}">${label}${sub ? `<tspan font-weight="400" fill-opacity=".7"> ${sub}</tspan>` : ''}</text>
</g>`;
  const arrow = (x, y, dir) => (dir === 'right' ? pth`M${x} ${y}l-7 -4v8z` : dir === 'down' ? pth`M${x} ${y}l-4 -7h8z` : pth`M${x} ${y}l-4 7h8z`);

  // The plate: the hero's sunset in miniature, the last 26 weeks as a skyline.
  const weeks = n.grid.slice(-26).map((wk) => wk.reduce((s, d) => s + (d?.count || 0), 0));
  const wmax = Math.max(40, ...weeks);
  const px0 = PLATE.x + 4;
  const py0 = PY - 51 + 4;
  let skyline = `M${px0} ${py0 + 58}`;
  weeks.forEach((s, i) => {
    const bx = px0 + (116 * i) / 26;
    const bh = s ? 4 + 26 * Math.sqrt(s / wmax) : 1;
    skyline += pth`V${py0 + 58 - bh}H${bx + 116 / 26}`;
  });
  skyline += `V${py0 + 58}Z`;
  const plateStamp = `<rect x="${px0}" y="${py0}" width="116" height="58" fill="url(#plateSky)"/><circle cx="${px0 + 58}" cy="${py0 + 34}" r="4" fill="${c.sun}"/><ellipse cx="${px0 + 58}" cy="${py0 + 34}" rx="58" ry="1.2" fill="${c.flare}" opacity=".8"/><path d="${skyline}" fill="${dark ? '#0d0e11' : '#8d99aa'}"/>`;

  let nodes = readNode(PLATE.x, PY - 51, 'plate', `frames ${FIRST_FRAME}–${FIRST_FRAME + n.frames - 1}`, plateStamp, 0);
  let wires = '';
  let heads = '';
  let meta = '';
  let prev = PLATE.x + 124;
  const pipe = [];

  featured.forEach((repo, i) => {
    const x = mx[i];
    const up = i % 2 === 0;
    const k = i + 1;
    const ry = up ? PY - 144 : PY + 42;
    const kind = i % 4;
    const ball = shaderBall(kind, langColor(repo.language || 'Markdown'), x - 58, ry + 4, 116, 58, i, c, dark);
    defs += ball.defs;
    const metaText = [repo.language, repo.stars ? `★ ${short(repo.stars)}` : ''].filter(Boolean).join(' · ');
    nodes += readNode(x - 62, ry, repo.name, metaText, ball.svg, k);
    nodes += smallNode(x - 30, 60, c.node.merge, 'over', '', k);
    // A input, from the Read node into the merge.
    const ay0 = up ? ry + 102 : ry;
    const ay1 = up ? PY - 15 : PY + 15;
    wires += `<path class="wireIn" pathLength="1" style="animation-delay:${at(k)}s" d="M${x} ${ay0}V${ay1 + (up ? -7 : 7)}"/>`;
    heads += `<path class="pop" style="animation-delay:${at(k) + 0.2}s" d="${arrow(x, ay1, up ? 'down' : 'up')}"/><text class="pop" style="animation-delay:${at(k) + 0.2}s" x="${x + 6}" y="${r1((ay0 + ay1) / 2 + 3)}" font-family="${MONO}" font-size="9" font-weight="700" fill="${c.muted}">A</text>`;
    pipe.push([prev, x - 30, k]);
    prev = x + 30;
  });
  const kG = featured.length + 1;
  // No featured work yet: an empty input, waiting for one.
  if (!featured.length) {
    nodes += `<g class="pop" style="animation-delay:${at(1)}s" fill="none" stroke="${c.muted}" stroke-opacity=".7" stroke-dasharray="4 4">
<rect x="418" y="${PY - 144}" width="124" height="102" rx="5"/><path d="M480 ${PY - 42}V${PY - 8}"/><circle cx="480" cy="${PY}" r="6"/>
<text x="480" y="${PY - 96}" text-anchor="middle" font-family="${MONO}" font-size="10.5" font-weight="700" fill="${c.muted}" stroke="none">next project</text>
<text x="480" y="${PY - 80}" text-anchor="middle" font-family="${MONO}" font-size="9" fill="${c.muted}" stroke="none">input waiting</text></g>`;
  }
  pipe.push([prev, OUT.grade, kG]);
  pipe.push([OUT.grade + 92, OUT.write, kG + 1]);
  pipe.push([OUT.write + 112, OUT.viewer, kG + 2]);
  pipe.forEach(([a, b, k]) => {
    wires += `<path class="wireIn" pathLength="1" style="animation-delay:${at(k) - 0.08}s" d="M${a} ${PY}H${b - 7}"/>`;
    heads += `<path class="pop" style="animation-delay:${at(k)}s" d="${arrow(b, PY, 'right')}"/>`;
  });
  heads += `<text class="pop" style="animation-delay:${at(1)}s" x="${PLATE.x + 132}" y="${PY - 6}" font-family="${MONO}" font-size="9" font-weight="700" fill="${c.muted}">B</text>`;
  nodes += smallNode(OUT.grade, 92, c.node.grade, 'Grade', '', kG);
  nodes += smallNode(OUT.write, 112, c.node.write, 'Write', '', kG + 1);
  nodes += smallNode(OUT.viewer, 84, c.node.view, 'Viewer', '', kG + 2);
  meta += `<text class="pop" style="animation-delay:${at(kG)}s" x="${OUT.grade + 46}" y="${PY + 32}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="${c.muted}">gain ×${(1 + Math.log10(1 + n.followers) / 4).toFixed(2)}</text>`;
  meta += `<text class="pop" style="animation-delay:${at(kG + 1)}s" x="${OUT.write + 56}" y="${PY + 32}" text-anchor="middle" font-family="${MONO}" font-size="9.5" fill="${c.muted}">${escapeXml(`${shot.toLowerCase()}_${ver}.exr`)}</text>`;
  // Rendering indicator on the Write node, and the viewer showing the final frame.
  nodes += `<g class="pop" style="animation-delay:${at(kG + 1)}s"><circle class="pulse" style="animation-duration:1.4s" cx="${OUT.write + 100}" cy="${PY}" r="3" fill="${c.gold}"/></g>`;

  // Backdrops, the way artists group a script.
  const backdrops = `<g class="boot" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="2">
${featured.length ? `<rect x="196" y="50" width="${OUT.grade - 220}" height="${PANEL - 62}" rx="8" fill="${c.gold}" opacity="${dark ? 0.06 : 0.08}"/><text x="212" y="72" fill="${c.gold}" fill-opacity=".85">SELECTED WORK</text>` : ''}
<rect x="${OUT.grade - 14}" y="50" width="${W - OUT.grade - 10}" height="${PANEL - 62}" rx="8" fill="${c.blue}" opacity="${dark ? 0.06 : 0.07}"/><text x="${OUT.grade}" y="72" fill="${c.blue}" fill-opacity=".85">OUTPUT</text>
<text x="${PLATE.x}" y="72" fill="${c.muted}">THE YEAR</text>
</g>`;

  // --- Render log, typed out line by line.
  const LOG = { x: 40, y: PANEL + 50, lh: 22 };
  const lines = [
    ['render', `frames ${FIRST_FRAME}–${FIRST_FRAME + n.frames - 1}, one per day`],
    ['', `${plural(n.total, 'contribution')} on ${plural(n.active, 'active day')}`],
    ['', `longest streak ${plural(n.streak, 'day')} · longest break ${plural(n.rest, 'day')}`],
    ['', n.peak ? `peak frame ${FIRST_FRAME + n.peak.index} · ${dayMonth(n.peak.date)} · ${plural(n.peak.count, 'contribution')}` : 'no peak frame yet'],
    ['review', `${plural(n.followers, 'follower')} · ${plural(n.stars, 'star')} · since ${n.since}`],
    ['status', n.active ? `final ${ver} · approved` : 'first version in progress'],
  ];
  let logSvg = '';
  let logDefs = '';
  lines.forEach(([tag, text], i) => {
    const y = LOG.y + i * LOG.lh;
    const tAt = r1((1.6 + i * 0.32) * 100) / 100;
    const full = `${tag ? `[${tag}]` : ''}`.padEnd(9, ' ') + text;
    const w = full.length * 6.6 + 4;
    logDefs += `<clipPath id="lg${i}"><rect class="type" style="animation-delay:${tAt}s;animation-timing-function:steps(${Math.max(1, full.length)})" x="${LOG.x}" y="${y - 13}" width="${r1(w)}" height="18"/></clipPath>`;
    const status = tag === 'status' && n.active;
    logSvg += `<g clip-path="url(#lg${i})"><text x="${LOG.x}" y="${y}" font-family="${MONO}" font-size="11" xml:space="preserve" fill="${c.log}"><tspan fill="${tag ? c.gold : c.log}">${escapeXml(full.slice(0, 9))}</tspan>${escapeXml(text)}</text></g>${
      status ? `<circle class="pop" style="animation-delay:${r1(tAt + 0.5)}s" cx="${r1(LOG.x + w + 8)}" cy="${y - 4}" r="3.5" fill="#46a758"/>` : ''
    }`;
  });

  // --- Colour chart: your languages, over a grey ramp, the way a reference chart is laid out.
  const CH = { x: 676, y: PANEL + 44 };
  const pw = 78;
  const patches = langs.length
    ? langs
        .map((l, i) => {
          const x = CH.x + i * (pw + 6);
          return `<g class="pop" style="animation-delay:${r1(1.8 + i * 0.08)}s"><rect x="${x}" y="${CH.y}" width="${pw}" height="50" rx="2" fill="${langColor(l.name)}"/>
<text x="${x}" y="${CH.y + 66}" font-family="${MONO}" font-size="10" font-weight="700" fill="${c.fg}">${escapeXml(trunc(l.name, 11))}</text>
<text x="${x}" y="${CH.y + 80}" font-family="${MONO}" font-size="9.5" fill="${c.muted}">${Math.max(1, Math.round(l.share * 100))}%</text></g>`;
        })
        .join('')
    : `<text x="${CH.x}" y="${CH.y + 30}" font-family="${MONO}" font-size="10.5" fill="${c.muted}">No public code yet: the chart fills in with your languages.</text>`;
  const ramp = [0.95, 0.78, 0.6, 0.42, 0.26, 0.12]
    .map((g, i) => `<rect class="pop" style="animation-delay:${r1(2.3 + i * 0.05)}s" x="${CH.x + i * (pw + 6)}" y="${CH.y + 92}" width="${pw}" height="16" rx="2" fill="${grey(g)}"/>`)
    .join('');
  const tools = String(toolkit || '').trim() || langs.slice(0, 4).map((l) => l.name).join(' · ');

  const css = `
.pop{animation:pop .5s ${EXPO} both}
.wireIn{stroke-dasharray:1;animation:wireIn .5s ease-out both}
.boot{animation:fade .6s ease-out .1s both}
.type{transform-box:fill-box;transform-origin:left center;animation-name:type;animation-duration:.6s;animation-fill-mode:both}
.flow{stroke-dasharray:3 13;animation:flow 1.2s linear infinite}
.pulse{animation-name:pulse;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes pop{from{opacity:0;transform:translateY(6px)}}
@keyframes wireIn{from{stroke-dashoffset:1}}
@keyframes fade{from{opacity:0}}
@keyframes type{from{transform:scaleX(0)}}
@keyframes flow{from{stroke-dashoffset:16}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
${REDUCED}`;

  const aria = `Comp script for ${profile.name || profile.login}: the last year as the background plate (${plural(n.total, 'contribution')} over ${plural(n.active, 'active day')})${
    featured.length ? `, with ${featured.map((r) => r.name).join(', ')} merged over it` : ''
  }, then graded, written out and viewed. Render log: longest streak ${plural(n.streak, 'day')}, longest break ${plural(n.rest, 'day')}, ${plural(n.followers, 'follower')}, ${plural(n.stars, 'star')}.${
    langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''
  }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="${c.dot}" fill-opacity="${c.dotOp}"/></pattern>
  <linearGradient id="cyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark ? '#2b2b2b' : '#f4f2ee'}"/><stop offset=".78" stop-color="${dark ? '#1a1a1a' : '#dcd9d2'}"/><stop offset="1" stop-color="${dark ? '#101010' : '#cfcbc2'}"/></linearGradient>
  <linearGradient id="plateSky" x1="0" y1="0" x2="0" y2="1">${c.sky.map((col, i) => `<stop offset="${[0, 0.3, 0.45, 0.55, 0.6][i]}" stop-color="${col}"/>`).join('')}<stop offset=".6" stop-color="${c.water[1]}"/><stop offset="1" stop-color="${c.water[2]}"/></linearGradient>
  ${defs}
  ${logDefs}
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.graph}"/>
  <rect y="36" width="${W}" height="${PANEL - 36}" fill="url(#dots)"/>
  <g class="boot" font-family="${MONO}">
    <rect width="${W}" height="36" fill="${c.bar}"/>
    <path d="M0 35.5H${W}M0 ${PANEL + 0.5}H${W}" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
    <text x="24" y="23" font-size="11" font-weight="700" letter-spacing="1.6" fill="${c.fg}">NODE GRAPH</text>
    <text x="128" y="23" font-size="10" letter-spacing="1" fill="${c.muted}">${escapeXml(`${shot.toLowerCase()}_comp_${ver}`)}</text>
    <text x="${W - 24}" y="23" text-anchor="end" font-size="10" letter-spacing="1" fill="${c.muted}">${plural(featured.length * 2 + 4, 'node')}</text>
  </g>
  ${backdrops}
  <g fill="none" stroke="${c.wireLine}" stroke-width="1.4">${wires}</g>
  <g class="pop" style="animation-delay:${at(kG + 2) + 0.3}s"><path class="flow" d="M${PLATE.x + 124} ${PY}H${OUT.viewer}" fill="none" stroke="${c.gold}" stroke-width="2" stroke-linecap="round" opacity=".9"/></g>
  <g fill="${c.wireLine}">${heads}</g>
  ${nodes}
  ${meta}
  <rect x="0" y="${PANEL + 1}" width="${W}" height="${H - PANEL - 1}" fill="${c.panel}"/>
  <g class="boot" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="2" fill="${c.muted}">
    <text x="${LOG.x}" y="${PANEL + 26}">RENDER LOG</text>
    <text x="${CH.x}" y="${PANEL + 26}">COLOUR CHART · LANGUAGES</text>
    <path d="M${CH.x - 24} ${PANEL + 14}V${H - 16}" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
  </g>
  ${logSvg}
  ${patches}
  ${ramp}
  ${tools ? `<g class="pop" style="animation-delay:2.5s" font-family="${MONO}"><text x="${CH.x}" y="${CH.y + 136}" font-size="10" font-weight="700" letter-spacing="2" fill="${c.muted}">TOOLKIT</text><text x="${CH.x + 82}" y="${CH.y + 136}" font-size="11" fill="${c.fg}">${escapeXml(trunc(tools, 64))}</text></g>` : ''}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. End card — the reference kit and a sign-off
// ---------------------------------------------------------------------------

// A generic 24-patch reference chart: naturals, brights, primaries and a grey ramp.
const CHART = [
  ['#735244', '#c29682', '#627a9d', '#576c43', '#8580b1', '#67bdaa'],
  ['#d67e2c', '#505ba6', '#c15a63', '#5e3c6c', '#9dbc40', '#e0a32e'],
  ['#383d96', '#469449', '#af363c', '#e7c71f', '#bb5695', '#0885a1'],
  ['#f3f3f2', '#c8c8c8', '#a0a0a0', '#7a7a79', '#555555', '#343434'],
];

const linkLabel = (url) => String(url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function wrapSvg(profile, themeName, { signoff, reel }) {
  const c = THEMES[themeName];
  const dark = themeName === 'dark';
  const W = 1200;
  const H = 300;
  const n = breakdownNumbers(profile);
  const FLOOR = 214; // where the cyc wall turns into the floor
  const R = 44;
  const G = { x: 156, y: 118 }; // grey ball
  const C = { x: 268, y: 118 }; // chrome ball
  const name = profile.name || profile.login;
  const link = reel ? `▶ REEL  ${linkLabel(reel)}` : profile.website ? linkLabel(profile.website) : `github.com/${profile.login}`;

  // The chrome ball reflects the shot's sunset: sky, horizon, sun, a sliver of the city, and the
  // studio behind the camera at the bottom.
  const env = `<g class="drift" style="animation-duration:16s">
<rect x="${C.x - 70}" y="${C.y - R}" width="140" height="${R + 6}" fill="url(#ballSky)"/>
<path d="${pth`M${C.x - 70} ${C.y + 6}Q${C.x} ${C.y + 22} ${C.x + 70} ${C.y + 6}V${C.y + R}H${C.x - 70}Z`}" fill="url(#ballGround)"/>
<path d="${(() => {
    const rand = seededRandom(`chrome:${profile.login}`);
    let d = '';
    for (let i = 0; i < 22; i++) {
      const x = C.x - 30 + i * 2.8;
      const hh = 2 + rand() * 7 * (1 - Math.abs(i - 11) / 14);
      const y = C.y + 6 + 16 * (1 - ((x - C.x) / 70) ** 2) * 0.5;
      d += pth`M${x} ${y}h2.2v${-hh}h-2.2z`;
    }
    return d;
  })()}" fill="${dark ? '#0d0e11' : '#8d99aa'}"/>
<ellipse cx="${C.x - 6}" cy="${C.y + 7}" rx="9" ry="3" fill="${c.sun}"/>
<ellipse cx="${C.x - 6}" cy="${C.y + 7}" rx="40" ry=".9" fill="${c.flare}" opacity=".8"/>
</g>`;

  const patch = 22;
  const gap = 4;
  const CX0 = 382;
  const CY0 = 92;
  const chart = CHART.map((row, j) =>
    row
      .map(
        (col, i) =>
          `<rect class="pop" style="animation-delay:${r1((0.7 + (j * 6 + i) * 0.035) * 100) / 100}s" x="${CX0 + 8 + i * (patch + gap)}" y="${CY0 + 8 + j * (patch + gap)}" width="${patch}" height="${patch}" rx="1.5" fill="${col}"/>`
      )
      .join('')
  ).join('');
  const chartW = 6 * patch + 5 * gap + 16;
  const chartH = 4 * patch + 3 * gap + 16;

  const css = `
.boot{animation:fade .7s ease-out both}
.lightOn{animation:fade 1.1s ease-out .45s both}
.envIn{animation:envIn 1.6s ${EXPO} .5s both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .45s ${EXPO} both}
.rise{animation:rise .9s ${EXPO} both}
.pulse{animation-name:pulse;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.drift{animation-name:drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes fade{from{opacity:0}}
@keyframes envIn{from{opacity:0;transform:translateX(-40px)}}
@keyframes pop{from{opacity:0;transform:scale(.6)}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}
${LOOPS}
${REDUCED}`;

  const signLines = balance(signoff, 26);
  const SX = 600;
  const sy0 = signLines.length > 1 ? 104 : 124;
  const aria = `End card: an on-set lighting reference kit (grey ball, chrome ball reflecting the sunset, colour chart). ${signoff} ${name}${
    reel ? `, showreel at ${linkLabel(reel)}` : ''
  }.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(aria)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="${FLOOR}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${dark ? '#070707' : '#e4e1da'}"/><stop offset="1" stop-color="${dark ? '#1a1916' : '#f6f4ef'}"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="${FLOOR}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${dark ? '#1c1b18' : '#f3f1ec'}"/><stop offset="1" stop-color="${dark ? '#080808' : '#d9d5cc'}"/></linearGradient>
  <radialGradient id="key" cx="300" cy="${FLOOR}" r="420" gradientUnits="userSpaceOnUse" gradientTransform="translate(300 ${FLOOR}) scale(1 .45) translate(-300 ${-FLOOR})"><stop offset="0" stop-color="${c.gold}" stop-opacity="${dark ? 0.16 : 0.12}"/><stop offset="1" stop-color="${c.gold}" stop-opacity="0"/></radialGradient>
  <radialGradient id="greyLit" cx="34%" cy="30%" r="78%"><stop offset="0" stop-color="${c.grey[0]}"/><stop offset=".5" stop-color="${c.grey[1]}"/><stop offset="1" stop-color="${c.grey[2]}"/></radialGradient>
  <radialGradient id="rimFill" cx="80%" cy="62%" r="40%"><stop offset="0" stop-color="${c.blue}" stop-opacity=".22"/><stop offset="1" stop-color="${c.blue}" stop-opacity="0"/></radialGradient>
  <linearGradient id="ballSky" x1="0" y1="${C.y - R}" x2="0" y2="${C.y + 8}" gradientUnits="userSpaceOnUse">${c.sky.map((col, i) => `<stop offset="${[0, 0.3, 0.55, 0.8, 1][i]}" stop-color="${col}"/>`).join('')}</linearGradient>
  <linearGradient id="ballGround" x1="0" y1="${C.y + 6}" x2="0" y2="${C.y + R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.water[0]}"/><stop offset=".3" stop-color="${c.water[1]}"/><stop offset="1" stop-color="${dark ? '#000000' : '#5d6878'}"/></linearGradient>
  <radialGradient id="chromeEdge"><stop offset=".62" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="${dark ? 0.75 : 0.45}"/></radialGradient>
  <radialGradient id="shadow"><stop offset="0" stop-color="#000000" stop-opacity="${dark ? 0.7 : 0.25}"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
  <clipPath id="chrome"><circle cx="${C.x}" cy="${C.y}" r="${R}"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${FLOOR}" fill="url(#wall)"/>
  <rect y="${FLOOR}" width="${W}" height="${H - FLOOR}" fill="url(#floor)"/>
  <ellipse class="lightOn" cx="300" cy="${FLOOR}" rx="420" ry="190" fill="url(#key)"/>
  <!-- the ball rig: one stand, a crossbar, a ball on each end -->
  <g class="boot">
    <ellipse cx="212" cy="${FLOOR + 50}" rx="64" ry="7" fill="url(#shadow)"/>
    <path d="M212 ${FLOOR + 48}V${G.y + R + 22}M${G.x} ${G.y + R + 22}H${C.x}M${G.x} ${G.y + R + 22}V${G.y + R}M${C.x} ${G.y + R + 22}V${C.y + R}M196 ${FLOOR + 50}l16 -10l16 10" fill="none" stroke="${dark ? '#3a3936' : '#8e8a82'}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${G.x}" cy="${G.y}" r="${R}" fill="${dark ? '#1d1d1c' : '#8f8c86'}"/>
    <circle cx="${C.x}" cy="${C.y}" r="${R}" fill="${dark ? '#111111' : '#6f6c66'}"/>
  </g>
  <g class="lightOn">
    <circle cx="${G.x}" cy="${G.y}" r="${R}" fill="url(#greyLit)"/>
    <circle cx="${G.x}" cy="${G.y}" r="${R}" fill="url(#rimFill)"/>
  </g>
  <g clip-path="url(#chrome)"><g class="envIn">${env}</g>
    <circle cx="${C.x}" cy="${C.y}" r="${R}" fill="url(#chromeEdge)"/>
    <ellipse class="lightOn" cx="${C.x - 15}" cy="${C.y - 21}" rx="7" ry="4.5" fill="#ffffff" opacity=".9" transform="rotate(-30 ${C.x - 15} ${C.y - 21})"/>
  </g>
  <circle cx="${C.x}" cy="${C.y}" r="${R - 0.5}" fill="none" stroke="#ffffff" stroke-opacity="${dark ? 0.18 : 0.4}"/>
  <!-- the colour chart, standing on the floor -->
  <g class="boot">
    <ellipse cx="${CX0 + chartW / 2}" cy="${FLOOR + 50}" rx="${chartW / 2 + 12}" ry="6" fill="url(#shadow)"/>
    <path d="${pth`M${CX0 + 30} ${CY0 + chartH}L${CX0 + 22} ${FLOOR + 48}M${CX0 + chartW - 30} ${CY0 + chartH}L${CX0 + chartW - 22} ${FLOOR + 48}`}" stroke="${dark ? '#3a3936' : '#8e8a82'}" stroke-width="3" stroke-linecap="round"/>
    <rect x="${CX0}" y="${CY0}" width="${chartW}" height="${chartH}" rx="4" fill="#151515"/>
  </g>
  ${chart}
  <g class="boot" font-family="${MONO}" font-size="8.5" letter-spacing="1.6" fill="${c.muted}" text-anchor="middle">
    <text x="${G.x}" y="${FLOOR + 74}">18% GREY</text>
    <text x="${C.x}" y="${FLOOR + 74}">CHROME</text>
    <text x="${CX0 + chartW / 2}" y="${FLOOR + 74}">COLOUR REFERENCE</text>
  </g>
  <!-- sign-off -->
  <g font-family="${SERIF}" font-size="40" font-style="italic" fill="${c.fg}">
    ${signLines.map((l, i) => `<text class="rise" style="animation-delay:${r1((1.2 + i * 0.12) * 100) / 100}s" x="${SX}" y="${sy0 + i * 46}">${escapeXml(l)}</text>`).join('')}
  </g>
  <g class="rise" style="animation-delay:1.55s" font-family="${MONO}" letter-spacing="2">
    <path d="M${SX} ${sy0 + (signLines.length - 1) * 46 + 26}h40" stroke="${c.gold}" stroke-width="1.6"/>
    <text x="${SX}" y="${sy0 + (signLines.length - 1) * 46 + 52}" font-size="11" font-weight="700" fill="${c.fg}">END OF REEL · ${escapeXml(trunc(name.toUpperCase(), 34))}</text>
    <text x="${SX}" y="${sy0 + (signLines.length - 1) * 46 + 72}" font-size="10" fill="${c.gold}">${escapeXml(trunc(link, 56))}</text>
  </g>
  <g class="rise" style="animation-delay:1.9s" font-family="${MONO}">
    <rect x="${W - 196}" y="26" width="160" height="26" rx="13" fill="none" stroke="${c.gold}" stroke-opacity=".7"/>
    <circle class="pulse" style="animation-duration:2.2s" cx="${W - 178}" cy="39" r="3.5" fill="${c.gold}"/>
    <text x="${W - 166}" y="43" font-size="10" font-weight="700" letter-spacing="1.8" fill="${c.gold}">FINAL · v${String(n.version).padStart(3, '0')}</text>
    <text x="${W - 36}" y="${H - 26}" text-anchor="end" font-size="9" letter-spacing="1.6" fill="${c.muted}">${FIRST_FRAME}–${FIRST_FRAME + n.frames - 1} · ${new Date().getFullYear()}</text>
  </g>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}"/>
</svg>`;
}

// Rolling frame counter: right-aligned digits that spin from frame 1001 to the last frame. Each
// digit turns as many times as it really would, folded into a strip of four laps.
function frameCounter(value, xRight, baseline, size, fill) {
  const str = String(value);
  const from = String(FIRST_FRAME).padStart(str.length, '0');
  const dw = size * 0.62;
  const lh = size * 1.3;
  const width = str.length * dw;
  let clip = '';
  let svg = '';
  [...str].forEach((ch, di) => {
    const x = xRight - width + di * dw;
    const p = 10 ** (str.length - 1 - di);
    const start = Number(from[di]);
    let idx = start + Math.floor(value / p) - Math.floor(FIRST_FRAME / p);
    while (idx > 39) idx -= 10;
    clip += `<rect x="${r1(x)}" y="${r1(baseline - size * 0.92)}" width="${r1(dw)}" height="${r1(size * 1.14)}"/>`;
    svg += `<g clip-path="url(#fc)"><g class="roll" style="transform:translateY(${r1(-(idx - start) * lh)}px)"><use xlink:href="#fd" x="${r1(x + dw / 2)}" y="${r1(baseline - start * lh)}"/></g></g>`;
  });
  const strip = `<text id="fd" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${fill}">${Array.from(
    { length: 40 },
    (_, i) => `<tspan x="0" y="${r1(i * lh)}">${i % 10}</tspan>`
  ).join('')}</text>`;
  return { svg, defs: `<clipPath id="fc">${clip}</clipPath>${strip}`, width };
}
