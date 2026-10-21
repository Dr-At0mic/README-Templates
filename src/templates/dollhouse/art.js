// Dollhouse — animated SVG artwork: a pastel-pink doll's-house room and the things in it.
//
// Hero: the room. Your name lands in glossy bubble letters with a jelly bounce, a doll floats down
// on heart balloons, a cool cat gets a pair of heart-shaped shades dropped onto its face, and a
// kitten bursts out of a gift box wearing the lid. The fairy lights along the top are your year:
// one heart bulb per week, brighter for busier weeks.
// Diary: your year as a heart made of tiny hearts (one per day) in a developing instant photo,
// stats as die-cut stickers, languages as nail-polish bottles, and paw prints from the resident cat.
// End card: a letter-bead bracelet.
//
// Same rules as the other animated templates: CSS keyframes only, the un-animated state is the
// final frame, at most two infinite loops per image (sway and twinkle), no blur filters, system
// fonts, and prefers-reduced-motion stops everything. Characters and art are original.

import { seededRandom } from '../../lib/random';
import { escapeXml } from '../pulsar/art';

const BUBBLE = "'Arial Rounded MT Bold', 'Nunito Black', Nunito, 'Varela Round', 'Segoe UI Black', 'Arial Black', sans-serif";
const ROUND = "'Arial Rounded MT Bold', Nunito, 'Varela Round', 'Segoe UI', -apple-system, Helvetica, Arial, sans-serif";
const HAND = "'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Sans MS', 'Marker Felt', cursive";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const GRAVITY = 'cubic-bezier(0.55, 0, 1, 0.45)';
const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';

// The two loops every image may use: a pendulum sway and a twinkle.
const LOOPS = `
.sw{transform-box:fill-box;animation:sway 3.2s ease-in-out infinite}
.tw{transform-box:fill-box;transform-origin:center;animation:twinkle 2.6s ease-in-out infinite}
@keyframes sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}`;

export const THEMES = {
  light: {
    wallA: '#ffe4ef',
    wallB: '#fff3f8',
    wallHeart: '#ffd0e2',
    trim: '#ff8cc0',
    floor: '#f7bfd6',
    plank: '#eea5c4',
    base: '#ffffff',
    rug: '#ffd6e6',
    ink: '#4a1838',
    text: '#4a1838',
    muted: '#93587c',
    sticker: '#ffffff',
    nameShadow: '#f07cad',
    frame: '#ffffff',
    curtain: '#ff9fc8',
    cushion: '#c9b4ff',
    cushionTop: '#dccfff',
    wire: '#9c5f84',
    bulbOff: '#f0cddc',
    skyTop: '#a9dcff',
    skyBottom: '#e8f7ff',
    paper: '#fffafc',
    paperDot: '#4a1838',
    paperDotOpacity: 0.09,
    cardShadow: '#ffb3d1',
    hole: '#f1d6e3',
    coil: '#d7aac1',
    photo: '#fff2f7',
    glass: 0.55,
    cord: '#c98aa8',
    cells: ['#ffdce9', '#ffb0cf', '#ff80b4', '#ff4f96', '#d81b6e'],
  },
  dark: {
    wallA: '#2b1531',
    wallB: '#321a39',
    wallHeart: '#3f2247',
    trim: '#d4579b',
    floor: '#3c1d43',
    plank: '#4b2752',
    base: '#4f2b57',
    rug: '#55295c',
    ink: '#1b0a1a',
    text: '#ffe6f2',
    muted: '#d4a3c3',
    sticker: '#fff4fa',
    nameShadow: '#12050f',
    frame: '#f3e3ff',
    curtain: '#e0609f',
    cushion: '#8f74e0',
    cushionTop: '#a68cf0',
    wire: '#c993b4',
    bulbOff: '#563259',
    skyTop: '#160f3f',
    skyBottom: '#3d2c7a',
    paper: '#2a1530',
    paperDot: '#ffffff',
    paperDotOpacity: 0.07,
    cardShadow: '#0f050f',
    hole: '#150912',
    coil: '#b98aa6',
    photo: '#1f0f26',
    glass: 0.14,
    cord: '#e3a8c6',
    cells: ['#43244a', '#7a3a70', '#b44f95', '#ff6fb5', '#ffc4e0'],
  },
};

// Pastels shared by both themes; characters and stickers are "physical" objects, so they keep
// their colours on either background.
const P = {
  pink: '#ff7eb6',
  hot: '#ff3d8b',
  berry: '#c81d6b',
  blush: '#ff9cc4',
  lilac: '#c4a8ff',
  mint: '#9fe8cf',
  butter: '#ffe08a',
  sky: '#a9d8ff',
  peach: '#ffb9a3',
  white: '#ffffff',
  lens: '#2d0c27',
};

const r1 = (n) => Math.round(n * 10) / 10;
const pick = (rand, list) => list[Math.floor(rand() * list.length)];

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
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

export function heartPath(x, y, s) {
  return `M${r1(x)} ${r1(y + s * 0.9)} C${r1(x - s * 1.3)} ${r1(y + s * 0.05)} ${r1(x - s * 1.02)} ${r1(y - s * 1.1)} ${r1(x)} ${r1(y - s * 0.42)} C${r1(x + s * 1.02)} ${r1(y - s * 1.1)} ${r1(x + s * 1.3)} ${r1(y + s * 0.05)} ${r1(x)} ${r1(y + s * 0.9)} Z`;
}

function sparklePath(x, y, s) {
  const k = s * 0.26;
  return `M${r1(x)} ${r1(y - s)} Q${r1(x + k)} ${r1(y - k)} ${r1(x + s)} ${r1(y)} Q${r1(x + k)} ${r1(y + k)} ${r1(x)} ${r1(y + s)} Q${r1(x - k)} ${r1(y + k)} ${r1(x - s)} ${r1(y)} Q${r1(x - k)} ${r1(y - k)} ${r1(x)} ${r1(y - s)} Z`;
}

function starPoints(cx, cy, outer, inner, spikes = 5) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    pts.push(`${r1(cx + Math.cos(a) * r)},${r1(cy + Math.sin(a) * r)}`);
  }
  return pts.join(' ');
}

function scallopCircle(R, bumps, bulge) {
  let d = '';
  for (let k = 0; k <= bumps; k++) {
    const a = (k / bumps) * Math.PI * 2 - Math.PI / 2;
    const x = r1(Math.cos(a) * R);
    const y = r1(Math.sin(a) * R);
    d += k === 0 ? `M${x} ${y}` : ` A${bulge} ${bulge} 0 0 1 ${x} ${y}`;
  }
  return d + ' Z';
}

function sparkles(list, c, delay0 = 0) {
  return list
    .map(
      ([x, y, s, color], i) =>
        `<g class="pop" style="animation-delay:${(delay0 + i * 0.12).toFixed(2)}s"><path class="tw" style="animation-delay:${(i * 0.43).toFixed(2)}s" d="${sparklePath(x, y, s)}" fill="${color || P.butter}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/></g>`
    )
    .join('');
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CAT_NAMES = ['Mochi', 'Biscuit', 'Peaches', 'Boba', 'Noodle', 'Pudding', 'Sprinkles', 'Waffles', 'Bonbon', 'Marshmallow'];

export function defaultCatName(profile) {
  return pick(seededRandom(`catname:${profile.login}`), CAT_NAMES);
}

export function dollhouseNumbers(profile) {
  const days = profile.contributions?.days || [];
  const total = profile.contributions?.total ?? days.reduce((sum, d) => sum + d.count, 0);
  let streak = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
  }
  const weeks = new Array(52).fill(0);
  const recent = days.slice(-364);
  const offset = 364 - recent.length;
  recent.forEach((d, i) => (weeks[Math.floor((i + offset) / 7)] += d.count));
  return {
    days,
    total,
    active: days.filter((d) => d.count > 0).length,
    streak,
    weeks,
    stars: profile.totalStars ?? (profile.repos || []).reduce((sum, r) => sum + (r.stars || 0), 0),
    followers: profile.followers || 0,
    joinedYear: profile.joinedYear || null,
  };
}

const compact = (v) => (v >= 10000 ? `${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : v.toLocaleString('en-US'));

// Characters are drawn from the username, so each profile gets its own doll and cats.
const SKINS = ['#ffe2cf', '#f6c9a6', '#e3ab83', '#b97c58', '#8a5638'];
const HAIRS = ['#5a3324', '#8a5532', '#f0c36a', '#ff9fc9', '#b79cff', '#3b2430'];
const HAIR_STYLES = ['buns', 'pigtails', 'bob'];
const DRESSES = [P.pink, P.lilac, P.mint, P.sky, P.peach];
const FURS = [
  { fur: '#ffffff', belly: '#ffffff', stripe: null, ear: '#ffb6d3' },
  { fur: '#ffb36b', belly: '#fff0dc', stripe: '#e8873a', ear: '#ff9fbf' },
  { fur: '#adb1c8', belly: '#eef0f8', stripe: '#878ca8', ear: '#ffb6d3' },
  { fur: '#f6dfc0', belly: '#fffaf0', stripe: '#dfbb8b', ear: '#ffb6d3' },
  { fur: '#ffcde2', belly: '#fff3f9', stripe: '#ff9cc4', ear: '#ff7fb3' },
];

export function looks(profile) {
  const rand = seededRandom(`dolls:${profile.login}`);
  const cat = pick(rand, FURS);
  let kitten = pick(rand, FURS);
  if (kitten === cat) kitten = FURS[(FURS.indexOf(cat) + 2) % FURS.length];
  return {
    skin: pick(rand, SKINS),
    hair: pick(rand, HAIRS),
    style: pick(rand, HAIR_STYLES),
    dress: pick(rand, DRESSES),
    cat,
    kitten,
  };
}

// ---------------------------------------------------------------------------
// Characters (each drawn around a local origin; see the comment on each)
// ---------------------------------------------------------------------------

// Origin: between the doll's feet, on the floor. About 250 tall with the bow.
function doll(c, look, balloons) {
  const ink = c.ink;
  const sk = look.skin;
  const hair = look.hair;
  const hairStroke = `fill="${hair}" stroke="${ink}" stroke-width="4" stroke-linejoin="round"`;
  let back = '';
  if (look.style === 'buns') {
    back = [-1, 1]
      .map((s) => `<circle cx="${s * 40}" cy="-216" r="21" ${hairStroke}/><path d="M${s * 26} -206 q${s * 8} -8 ${s * 18} -2" stroke="${P.hot}" stroke-width="6" stroke-linecap="round" fill="none"/>`)
      .join('');
  } else if (look.style === 'pigtails') {
    back = [-1, 1]
      .map((s) => `<path d="M${s * 44} -192 C${s * 86} -178 ${s * 84} -116 ${s * 62} -96 C${s * 66} -126 ${s * 54} -150 ${s * 40} -160 Z" ${hairStroke}/><circle cx="${s * 49}" cy="-186" r="7" fill="${P.hot}" stroke="${ink}" stroke-width="3"/>`)
      .join('');
  }
  const hairLength = look.style === 'bob' ? -146 : -132;

  // A-line dress with a scalloped hem.
  let hem = '';
  for (let k = 0; k < 6; k++) {
    const x = 52 - k * (104 / 6);
    hem += ` Q${r1(x - 52 / 6)} -38 ${r1(x - 104 / 6)} -52`;
  }
  const dressPath = `M-20 -128 L20 -128 C24 -108 34 -80 52 -52${hem} C-34 -80 -24 -108 -20 -128 Z`;

  const bangs = 'M-50 -166 C-58 -248 58 -248 50 -166 Q40 -186 27 -175 Q15 -193 3 -179 Q-10 -195 -22 -177 Q-36 -192 -50 -166 Z';
  const eye = (s) => {
    const x = s * 17;
    return `<g class="blink" style="animation-delay:4.2s"><ellipse cx="${x}" cy="-168" rx="7.5" ry="10" fill="${ink}"/><circle cx="${x + 2.6}" cy="-172" r="3.2" fill="#fff"/><circle cx="${x - 2.2}" cy="-163" r="1.5" fill="#fff"/></g><path d="M${x + s * 5} -177 l${s * 6} -4" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
  };

  return `
<ellipse cx="0" cy="2" rx="46" ry="8" fill="${ink}" opacity="0.14"/>
${balloons}
${back}
<path d="M-54 -170 C-60 -244 60 -244 54 -170 L56 ${hairLength} Q0 ${hairLength + 14} -56 ${hairLength} Z" ${hairStroke}/>
<rect x="-18" y="-52" width="12" height="46" rx="6" fill="${sk}" stroke="${ink}" stroke-width="3"/>
<rect x="6" y="-52" width="12" height="46" rx="6" fill="${sk}" stroke="${ink}" stroke-width="3"/>
<rect x="-19.5" y="-26" width="15" height="18" rx="5" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
<rect x="4.5" y="-26" width="15" height="18" rx="5" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
<rect x="-26" y="-12" width="22" height="13" rx="6.5" fill="${P.hot}" stroke="${ink}" stroke-width="3"/>
<rect x="4" y="-12" width="22" height="13" rx="6.5" fill="${P.hot}" stroke="${ink}" stroke-width="3"/>
<path d="M24 -116 Q50 -126 60 -166" fill="none" stroke="${ink}" stroke-width="15" stroke-linecap="round"/>
<path d="M24 -116 Q50 -126 60 -166" fill="none" stroke="${sk}" stroke-width="9" stroke-linecap="round"/>
<circle cx="60" cy="-170" r="8" fill="${sk}" stroke="${ink}" stroke-width="3"/>
<path d="${dressPath}" fill="${look.dress}" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
<path d="${dressPath}" fill="url(#dots)" opacity="0.6"/>
<path d="M-38 -60 Q0 -50 38 -60" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
<path d="M-26 -114 Q-44 -98 -46 -80" fill="none" stroke="${ink}" stroke-width="15" stroke-linecap="round"/>
<path d="M-26 -114 Q-44 -98 -46 -80" fill="none" stroke="${sk}" stroke-width="9" stroke-linecap="round"/>
<circle cx="-46" cy="-77" r="7.5" fill="${sk}" stroke="${ink}" stroke-width="3"/>
<circle cx="-24" cy="-118" r="10" fill="${look.dress}" stroke="${ink}" stroke-width="3.5"/>
<circle cx="24" cy="-118" r="10" fill="${look.dress}" stroke="${ink}" stroke-width="3.5"/>
<path d="M-17 -129 Q-14 -112 0 -121 Q14 -112 17 -129 Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
<path d="M0 -104 l-12 -7 v14 Z M0 -104 l12 -7 v14 Z" fill="${P.hot}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="0" cy="-174" r="48" fill="${sk}" stroke="${ink}" stroke-width="4"/>
<path d="${bangs}" ${hairStroke}/>
<path d="M-50 -170 Q-60 -150 -52 -128 Q-44 -146 -42 -162 Z M50 -170 Q60 -150 52 -128 Q44 -146 42 -162 Z" ${hairStroke}/>
${eye(-1)}${eye(1)}
<ellipse cx="-29" cy="-150" rx="9" ry="5" fill="${P.blush}" opacity="0.8"/>
<ellipse cx="29" cy="-150" rx="9" ry="5" fill="${P.blush}" opacity="0.8"/>
<path d="M-7 -151 Q0 -140 7 -151 Z" fill="${P.hot}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>
<g transform="translate(34 -214) rotate(22)">
  <path d="M0 0 L-24 -14 Q-30 0 -24 14 Z M0 0 L24 -14 Q30 0 24 14 Z" fill="${P.hot}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <circle r="6.5" fill="${P.hot}" stroke="${ink}" stroke-width="3"/>
</g>`;
}

// Heart balloons tied to the doll's raised hand at (60, -170). The strings meet at the bottom
// centre of the group, so the sway pivots on the hand.
function balloons(c) {
  const hand = [60, -170];
  const list = [
    [hand[0] - 44, -300, 25, 'gPink'],
    [hand[0], -330, 27, 'gLilac'],
    [hand[0] + 44, -296, 23, 'gPeach'],
  ];
  const strings = list
    .map(([x, y, s]) => `<path d="M${x} ${r1(y + s * 0.9 + 6)} Q${r1((x + hand[0]) / 2 + 6)} ${r1((y + hand[1]) / 2 + 30)} ${hand[0]} ${hand[1]}" fill="none" stroke="${c.wire}" stroke-width="1.8"/>`)
    .join('');
  const shapes = list
    .map(
      ([x, y, s, g]) => `<path d="${heartPath(x, y, s)}" fill="url(#${g})" stroke="${c.ink}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M${x} ${r1(y + s * 0.9)} l-5 7 h10 Z" fill="${c.ink}"/>
<ellipse cx="${r1(x - s * 0.5)}" cy="${r1(y - s * 0.38)}" rx="${r1(s * 0.2)}" ry="${r1(s * 0.13)}" transform="rotate(-35 ${r1(x - s * 0.5)} ${r1(y - s * 0.38)})" fill="#fff" opacity="0.75"/>`
    )
    .join('');
  return `<g class="sw" style="transform-origin:50% 100%">${strings}${shapes}</g>`;
}

// Origin: bottom centre of the sitting cat. About 196 tall to the ear tips.
function coolCat(c, f) {
  const ink = c.ink;
  const furStroke = `fill="${f.fur}" stroke="${ink}" stroke-width="4" stroke-linejoin="round"`;
  const stripes = f.stripe
    ? `<path d="M-12 -170 l3 13 M0 -173 v15 M12 -170 l-3 13" stroke="${f.stripe}" stroke-width="5" stroke-linecap="round"/>`
    : '';
  const lens = (s) => `<path d="${heartPath(s * 23, -133, 19)}" fill="url(#lens)" stroke="${P.hot}" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M${s * 23 - 12} -138 l7 -7" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`;
  return `
<g transform="translate(38 -12)"><g class="sw" style="transform-origin:0% 100%;animation-delay:-1s">
  <path d="M0 0 C38 2 56 -32 40 -72" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round"/>
  <path d="M0 0 C38 2 56 -32 40 -72" fill="none" stroke="${f.fur}" stroke-width="13" stroke-linecap="round"/>
  ${f.stripe ? `<path d="M30 -20 l12 4 M40 -44 l12 0" stroke="${f.stripe}" stroke-width="5" stroke-linecap="round"/>` : ''}
</g></g>
<path d="M-44 0 C-58 -46 -42 -92 0 -96 C42 -92 58 -46 44 0 Z" ${furStroke}/>
<ellipse cx="0" cy="-40" rx="23" ry="31" fill="${f.belly}"/>
<path d="M-50 -144 L-44 -196 L-12 -170 Z M50 -144 L44 -196 L12 -170 Z" ${furStroke}/>
<path d="M-42 -156 L-39 -184 L-21 -168 Z M42 -156 L39 -184 L21 -168 Z" fill="${f.ear}"/>
<ellipse cx="0" cy="-128" rx="57" ry="46" ${furStroke}/>
${stripes}
<ellipse cx="-22" cy="-131" rx="8" ry="10" fill="${ink}"/><ellipse cx="22" cy="-131" rx="8" ry="10" fill="${ink}"/>
<ellipse cx="-36" cy="-106" rx="9" ry="5" fill="${P.blush}" opacity="0.7"/><ellipse cx="36" cy="-106" rx="9" ry="5" fill="${P.blush}" opacity="0.7"/>
<path d="M-5 -116 h10 l-5 6 Z" fill="${P.pink}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>
<path d="M-10 -105 Q-5 -99 0 -105 Q5 -99 10 -105" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M-32 -112 L-74 -120 M-32 -104 L-74 -102 M32 -112 L74 -120 M32 -104 L74 -102" stroke="${ink}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
<path d="M-34 -88 Q0 -74 34 -88" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round"/>
<path d="M-34 -88 Q0 -74 34 -88" fill="none" stroke="${P.hot}" stroke-width="8" stroke-linecap="round"/>
<path d="${heartPath(0, -72, 9)}" fill="${P.butter}" stroke="${ink}" stroke-width="2.5"/>
<ellipse cx="-18" cy="-5" rx="15" ry="9" fill="${f.fur}" stroke="${ink}" stroke-width="3"/><ellipse cx="18" cy="-5" rx="15" ry="9" fill="${f.fur}" stroke="${ink}" stroke-width="3"/>
<path d="M-22 -8 v6 M-14 -8 v6 M14 -8 v6 M22 -8 v6" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
<g class="shades">
  <path d="M-52 -136 L-42 -138 M52 -136 L42 -138 M-6 -138 Q0 -143 6 -138" fill="none" stroke="${P.hot}" stroke-width="4.5" stroke-linecap="round"/>
  ${lens(-1)}${lens(1)}
</g>`;
}

// Origin: centre of the kitten's head.
function kittenHead(c, f) {
  const ink = c.ink;
  const furStroke = `fill="${f.fur}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"`;
  return `
<path d="M-30 -10 L-27 -42 L-6 -25 Z M30 -10 L27 -42 L6 -25 Z" ${furStroke}/>
<path d="M-25 -18 L-24 -34 L-13 -25 Z M25 -18 L24 -34 L13 -25 Z" fill="${f.ear}"/>
<ellipse cx="0" cy="0" rx="35" ry="28" ${furStroke}/>
${f.stripe ? `<path d="M-7 -26 l2 8 M0 -27 v9 M7 -26 l-2 8" stroke="${f.stripe}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
<g class="blink" style="animation-delay:3.6s"><ellipse cx="-13" cy="-2" rx="6.5" ry="8.5" fill="${ink}"/><circle cx="-10.8" cy="-5.5" r="2.6" fill="#fff"/></g>
<g class="blink" style="animation-delay:3.6s"><ellipse cx="13" cy="-2" rx="6.5" ry="8.5" fill="${ink}"/><circle cx="15.2" cy="-5.5" r="2.6" fill="#fff"/></g>
<ellipse cx="-23" cy="9" rx="7" ry="4" fill="${P.blush}" opacity="0.75"/><ellipse cx="23" cy="9" rx="7" ry="4" fill="${P.blush}" opacity="0.75"/>
<path d="M-3.5 6 h7 l-3.5 4 Z" fill="${P.pink}"/>
<path d="M-7 13 Q-3.5 17 0 13 Q3.5 17 7 13" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
}

// A cat face (used for the diary's peeking cat and the bracelet charm). Origin: centre of the head.
function catFace(c, f, s = 1) {
  const ink = c.ink;
  const sw = r1(3.5 / s);
  const furStroke = `fill="${f.fur}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"`;
  return `<g transform="scale(${s})">
<path d="M-40 -14 L-36 -56 L-8 -36 Z" ${furStroke}/><path d="M40 -14 L36 -56 L8 -36 Z" ${furStroke}/>
<path d="M-33 -24 L-31 -45 L-15 -34 Z M33 -24 L31 -45 L15 -34 Z" fill="${f.ear}"/>
<ellipse cx="0" cy="0" rx="46" ry="38" ${furStroke}/>
${f.stripe ? `<path d="M-9 -36 l2 10 M0 -38 v12 M9 -36 l-2 10" stroke="${f.stripe}" stroke-width="4" stroke-linecap="round"/>` : ''}
<ellipse cx="-17" cy="-3" rx="7.5" ry="9.5" fill="${ink}"/><circle cx="-14.5" cy="-7" r="3" fill="#fff"/>
<ellipse cx="17" cy="-3" rx="7.5" ry="9.5" fill="${ink}"/><circle cx="19.5" cy="-7" r="3" fill="#fff"/>
<ellipse cx="-29" cy="10" rx="8" ry="4.5" fill="${P.blush}" opacity="0.75"/><ellipse cx="29" cy="10" rx="8" ry="4.5" fill="${P.blush}" opacity="0.75"/>
<path d="M-4.5 8 h9 l-4.5 5 Z" fill="${P.pink}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M-8 17 Q-4 21 0 17 Q4 21 8 17" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
</g>`;
}

function sharedDefs(c) {
  const grad = (id, a, b, d) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${d}"/></linearGradient>`;
  return `
${grad('gPink', '#ffc6e0', '#ff86ba', '#ff559c')}
${grad('gLilac', '#efe6ff', '#c8adff', '#9f7dff')}
${grad('gPeach', '#ffe2d4', '#ffab92', '#ff8069')}
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.52" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.lens}"/><stop offset="1" stop-color="#8a1f63"/></linearGradient>
<pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.4" fill="#fff"/><circle cx="10.5" cy="10.5" r="2.4" fill="#fff"/></pattern>`;
}

// ---------------------------------------------------------------------------
// 1. Hero — the room
// ---------------------------------------------------------------------------

// Rough advance widths (in em) for a heavy rounded face. Each letter is forced to its width with
// textLength, so the layout holds whichever system font actually renders it.
function glyphWidth(ch) {
  if (ch === ' ') return 0.3;
  if (ch.codePointAt(0) > 0x2e80) return 1;
  if (/[MWmw@%]/.test(ch)) return 0.9;
  if (/[iIjl.,:;!|'`]/.test(ch)) return 0.3;
  if (/[frt1()\-]/.test(ch)) return 0.44;
  if (/[A-Z0-9&#]/.test(ch)) return 0.72;
  return 0.6;
}

function bubbleName(name, c, { cx, baseline, maxWidth, maxSize, delay0 }) {
  const chars = [...name];
  const track = -0.03;
  const em = chars.reduce((sum, ch) => sum + glyphWidth(ch) + track, -track);
  const size = Math.round(Math.max(38, Math.min(maxSize, maxWidth / em)));
  let x = cx - (em * size) / 2;
  const letters = [];
  for (const ch of chars) {
    const w = glyphWidth(ch) * size;
    if (ch.trim()) letters.push({ ch, x: r1(x + w / 2), w: r1(w * 0.94), i: letters.length });
    x += w + track * size;
  }
  const fills = ['url(#gPink)', 'url(#gLilac)', 'url(#gPink)', 'url(#gPeach)'];
  const layer = (attrs, fill) =>
    letters
      .map(
        (l) =>
          `<g class="jl" style="animation-delay:${(delay0 + l.i * 0.07).toFixed(2)}s"><text x="${l.x}" y="${baseline}" text-anchor="middle" textLength="${l.w}" lengthAdjust="spacingAndGlyphs" ${attrs}${fill ? ` fill="${fill(l)}"` : ''}>${escapeXml(l.ch)}</text></g>`
      )
      .join('');
  const font = `font-family="${BUBBLE}" font-size="${size}" font-weight="900"`;
  return {
    size,
    count: letters.length,
    svg: `<g ${font}>
  <g transform="translate(0 8)" fill="${c.nameShadow}" stroke="${c.nameShadow}" stroke-width="20" stroke-linejoin="round">${layer('')}</g>
  <g fill="${c.sticker}" stroke="${c.sticker}" stroke-width="20" stroke-linejoin="round">${layer('')}</g>
  <g stroke="${c.ink}" stroke-width="8" stroke-linejoin="round" paint-order="stroke fill">${layer('', (l) => fills[l.i % fills.length])}</g>
  <g fill="url(#gloss)">${layer('')}</g>
</g>`,
  };
}

function windowSvg(x0, y0, c, themeName, side) {
  const w = 160;
  const h = 160;
  const id = `sky${side}`;
  const ink = c.ink;
  let view;
  if (themeName === 'dark') {
    view =
      side === 'L'
        ? `<circle cx="${x0 + 58}" cy="${y0 + 56}" r="20" fill="${P.butter}"/><circle cx="${x0 + 68}" cy="${y0 + 49}" r="17" fill="url(#${id}g)"/>${[[110, 46, 5], [124, 104, 4], [44, 118, 3.5]].map(([x, y, s], i) => `<path class="tw" style="animation-delay:${i * 0.6}s" d="${sparklePath(x0 + x, y0 + y, s)}" fill="#fff"/>`).join('')}`
        : [[48, 46, 5], [108, 60, 6], [76, 112, 4], [124, 124, 3.5], [40, 120, 3]]
            .map(([x, y, s], i) => `<path class="tw" style="animation-delay:${(0.3 + i * 0.5).toFixed(1)}s" d="${sparklePath(x0 + x, y0 + y, s)}" fill="#fff"/>`)
            .join('');
  } else {
    const cloud = (x, y, k) =>
      `<g fill="#fff"><circle cx="${x}" cy="${y}" r="${12 * k}"/><circle cx="${r1(x + 15 * k)}" cy="${r1(y - 7 * k)}" r="${15 * k}"/><circle cx="${r1(x + 31 * k)}" cy="${y}" r="${12 * k}"/><rect x="${x}" y="${y}" width="${r1(31 * k)}" height="${r1(12 * k)}"/></g>`;
    view =
      side === 'L'
        ? `<circle cx="${x0 + 54}" cy="${y0 + 54}" r="18" fill="${P.butter}" stroke="#ffc94d" stroke-width="3"/>${cloud(x0 + 76, y0 + 112, 1)}`
        : `${cloud(x0 + 30, y0 + 58, 0.9)}${cloud(x0 + 84, y0 + 118, 1.1)}`;
  }
  const drape = (s) => {
    const xe = s < 0 ? x0 - 6 : x0 + w + 6;
    const xi = xe - s * 46;
    const tie = xe - s * 16;
    return `<path d="M${xe} ${y0 + 10} L${xi} ${y0 + 10} Q${xi + s * 8} ${y0 + 66} ${tie} ${y0 + 92} Q${xi + s * 2} ${y0 + 126} ${xi - s * 4} ${y0 + 160} L${xe} ${y0 + 160} Z" fill="${c.curtain}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M${xe - s * 14} ${y0 + 16} Q${xe - s * 20} ${y0 + 60} ${tie - s * 2} ${y0 + 90} M${xe - s * 16} ${y0 + 156} Q${xe - s * 18} ${y0 + 124} ${tie - s * 2} ${y0 + 98}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.35"/>
<rect x="${tie - 9}" y="${y0 + 88}" width="18" height="9" rx="4.5" fill="${P.butter}" stroke="${ink}" stroke-width="2.5"/>`;
  };
  let scallops = '';
  for (let x = x0 - 6; x <= x0 + w + 6; x += 19) scallops += `<circle cx="${x}" cy="${y0 + 6}" r="9.5"/>`;
  return `<g>
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.skyTop}"/><stop offset="1" stop-color="${c.skyBottom}"/></linearGradient>
    <clipPath id="${id}c"><rect x="${x0 + 10}" y="${y0 + 10}" width="${w - 20}" height="${h - 20}" rx="6"/></clipPath>
  </defs>
  <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="12" fill="${c.frame}" stroke="${ink}" stroke-width="4"/>
  <rect x="${x0 + 10}" y="${y0 + 10}" width="${w - 20}" height="${h - 20}" rx="6" fill="url(#${id}g)"/>
  <g clip-path="url(#${id}c)">${view}</g>
  <rect x="${x0 + w / 2 - 3}" y="${y0 + 10}" width="6" height="${h - 20}" fill="${c.frame}" stroke="${ink}" stroke-width="2"/>
  <rect x="${x0 + 10}" y="${y0 + h / 2 - 3}" width="${w - 20}" height="6" fill="${c.frame}" stroke="${ink}" stroke-width="2"/>
  <rect x="${x0 - 12}" y="${y0 + h - 4}" width="${w + 24}" height="14" rx="6" fill="${c.frame}" stroke="${ink}" stroke-width="3.5"/>
  ${drape(-1)}${drape(1)}
  <g fill="${P.hot}" stroke="${ink}" stroke-width="3.5">${scallops}</g>
  <rect x="${x0 - 16}" y="${y0 - 14}" width="${w + 32}" height="22" rx="8" fill="${P.hot}" stroke="${ink}" stroke-width="3.5"/>
  <g fill="#fff" opacity="0.85">${Array.from({ length: 9 }, (_, i) => `<circle cx="${x0 - 2 + i * 20.5}" cy="${y0 - 3}" r="2.6"/>`).join('')}</g>
</g>`;
}

function garland(c, weeks) {
  const strands = [
    [56, 46, 600, 40],
    [600, 40, 1144, 46],
  ];
  const sag = 68;
  const colors = [P.pink, P.butter, P.lilac, P.mint, P.sky];
  const glowIds = ['glPink', 'glButter', 'glLilac', 'glMint', 'glSky'];
  const max = Math.max(1, ...weeks);
  let wires = '';
  let bulbs = '';
  let i = 0;
  for (const [x0, y0, x1, y1] of strands) {
    const qx = (x0 + x1) / 2;
    const qy = (y0 + y1) / 2 + sag * 2;
    wires += `<path d="M${x0} ${y0} Q${qx} ${qy} ${x1} ${y1}" fill="none" stroke="${c.wire}" stroke-width="2.5"/>`;
    for (let k = 0; k < 26; k++, i++) {
      const t = (k + 0.5) / 26;
      const x = r1((1 - t) ** 2 * x0 + 2 * (1 - t) * t * qx + t * t * x1);
      const y = r1((1 - t) ** 2 * y0 + 2 * (1 - t) * t * qy + t * t * y1);
      const ratio = weeks[i] / max;
      const level = weeks[i] === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
      const color = colors[i % colors.length];
      const by = r1(y + 13);
      const socket = `<rect x="${x - 3.5}" y="${y - 1}" width="7" height="6" rx="1.5" fill="${c.wire}"/>`;
      if (level === 0) {
        bulbs += `${socket}<path d="${heartPath(x, by, 7.5)}" fill="${c.bulbOff}" stroke="${c.ink}" stroke-width="1.5"/>`;
      } else {
        const glow = `<circle${i % 3 === 0 ? ` class="tw" style="animation-delay:${((i % 7) * 0.37).toFixed(2)}s"` : ''} cx="${x}" cy="${by}" r="${10 + level * 4}" fill="url(#${glowIds[i % 5]})" opacity="${(0.4 + level * 0.15).toFixed(2)}"/>`;
        bulbs += `${socket}<g class="lit" style="animation-delay:${(1.05 + i * 0.03).toFixed(2)}s">${glow}<path d="${heartPath(x, by, 7.5)}" fill="${color}" stroke="${c.ink}" stroke-width="1.5"/><circle cx="${r1(x - 3)}" cy="${r1(by - 3)}" r="1.6" fill="#fff" opacity="0.9"/></g>`;
      }
    }
  }
  const bow = (x, y) =>
    `<g transform="translate(${x} ${y})"><path d="M0 0 L-13 -8 Q-16 0 -13 8 Z M0 0 L13 -8 Q16 0 13 8 Z" fill="${P.hot}" stroke="${c.ink}" stroke-width="2.5" stroke-linejoin="round"/><circle r="4" fill="${P.hot}" stroke="${c.ink}" stroke-width="2.5"/></g>`;
  const glowDefs = glowIds
    .map((id, k) => `<radialGradient id="${id}"><stop offset="0" stop-color="${colors[k]}" stop-opacity="0.95"/><stop offset="1" stop-color="${colors[k]}" stop-opacity="0"/></radialGradient>`)
    .join('');
  return { defs: glowDefs, svg: `<g class="garland">${wires}${bulbs}${bow(56, 46)}${bow(600, 40)}${bow(1144, 46)}</g>` };
}

function ribbon(text, cx, cy, c) {
  const width = Math.max(220, Math.round(text.length * 10.6 + 70));
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const top = cy - 20;
  const tail = (s) => {
    const xe = s < 0 ? x0 : x1;
    const out = xe + s * 46;
    return `<path d="M${xe - s * 14} ${top + 12} L${out} ${top + 12} L${out - s * 14} ${top + 32} L${out} ${top + 52} L${xe - s * 14} ${top + 52} Z" fill="${P.berry}" stroke="${c.ink}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M${xe} ${top + 40} L${xe - s * 14} ${top + 52} L${xe - s * 14} ${top + 40} Z" fill="${c.ink}" opacity="0.55"/>`;
  };
  return `<g class="tails">${tail(-1)}${tail(1)}</g>
<g class="ribbon">
  <rect x="${x0}" y="${top}" width="${width}" height="40" rx="6" fill="${P.hot}" stroke="${c.ink}" stroke-width="3.5"/>
  <path d="M${x0 + 8} ${top + 7} H${x1 - 8} M${x0 + 8} ${top + 33} H${x1 - 8}" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.7"/>
  <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="${ROUND}" font-size="16" font-weight="800" letter-spacing="2.4" fill="#fff">${escapeXml(text)}</text>
</g>`;
}

export function heroSvg(profile, themeName, { speech }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = dollhouseNumbers(profile);
  const look = looks(profile);
  const name = profile.name || profile.login;

  const nameStart = 0.35;
  const title = bubbleName(name, c, { cx: 600, baseline: 236, maxWidth: 660, maxSize: 112, delay0: nameStart });
  const landed = nameStart + title.count * 0.07 + 0.45;

  // Hearts that burst out from behind the name once it lands. Invisible at rest.
  const burstRand = seededRandom(`burst:${profile.login}`);
  let burstCss = '';
  const burst = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + (burstRand() - 0.5) * 0.4;
    const dx = Math.cos(a) * (330 + burstRand() * 60);
    const dy = Math.sin(a) * (150 + burstRand() * 40);
    burstCss += `@keyframes b${i}{from{transform:translate(${r1(-dx)}px,${r1(-dy)}px) scale(.3) rotate(${Math.round(burstRand() * 90 - 45)}deg);opacity:1}55%{opacity:1}}`;
    return `<g transform="translate(${r1(600 + dx)} ${r1(196 + dy)})"><path style="animation:b${i} 1.1s ${EXPO} ${landed.toFixed(2)}s forwards" opacity="0" d="${heartPath(0, 0, 9 + burstRand() * 6)}" fill="${[P.pink, P.lilac, P.butter, P.hot][i % 4]}" stroke="${c.ink}" stroke-width="2"/></g>`;
  }).join('');

  const since = profile.joinedYear ? `since ${profile.joinedYear}` : '';
  let ribbonText = [`@${profile.login}`, profile.location, since].filter(Boolean).join('  ·  ');
  if (ribbonText.length > 46) ribbonText = [`@${profile.login}`, since].filter(Boolean).join('  ·  ');
  if (ribbonText.length > 46) ribbonText = ribbonText.slice(0, 45) + '…';
  ribbonText = ribbonText.toUpperCase();

  // The kitten's speech bubble.
  const lines = wrap(speech, 46, 2);
  const longest = Math.max(...lines.map((l) => l.length), 8);
  const bw = Math.min(640, Math.max(240, Math.round(longest * 10.4 + 64)));
  const bh = lines.length > 1 ? 80 : 54;
  const bx = 600 - bw / 2;
  const by = 322;
  const bubble = `<path d="M${bx + bh / 2} ${by} H${bx + bw - bh / 2} A${bh / 2} ${bh / 2} 0 0 1 ${bx + bw - bh / 2} ${by + bh} H${612} L${600} ${by + bh + 14} L${590} ${by + bh} H${bx + bh / 2} A${bh / 2} ${bh / 2} 0 0 1 ${bx + bh / 2} ${by} Z"`;
  const bubbleSvg = `<g class="bubble">
  <g transform="translate(5 6)">${bubble} fill="${c.nameShadow}" opacity="0.55"/></g>
  ${bubble} fill="#fff" stroke="${c.ink}" stroke-width="4" stroke-linejoin="round"/>
  ${lines.map((l, i) => `<text x="600" y="${by + (lines.length > 1 ? 34 + i * 27 : 34)}" text-anchor="middle" font-family="${ROUND}" font-size="19" font-weight="700" fill="${'#4a1838'}">${escapeXml(l)}</text>`).join('')}
</g>`;

  const lights = garland(c, n.weeks);

  // Wallpaper, trim and floor.
  let trim = '';
  for (let x = -4; x < W + 20; x += 32) trim += `<circle cx="${x + 16}" cy="16" r="16"/>`;
  let trimDots = '';
  for (let x = -4; x < W + 20; x += 32) trimDots += `<circle cx="${x + 16}" cy="23" r="3"/>`;
  let planks = '';
  [506, 542, 578].forEach((y, k) => {
    planks += `<path d="M0 ${y} H${W}" stroke="${c.plank}" stroke-width="2"/>`;
    for (let x = (k % 2) * 90 + 60; x < W; x += 180) planks += `<path d="M${x} ${y - 34} V${y}" stroke="${c.plank}" stroke-width="2"/>`;
  });

  const css = `
.room{animation:fade .5s ease-out both}
.trim{animation:drop .6s ${BACK} .1s both}
.garland{transform-box:fill-box;transform-origin:50% 0%;animation:unroll .8s ${BACK} .2s both}
.lit{animation:on .45s ease-out both}
.jl{transform-box:fill-box;transform-origin:50% 100%;animation:jelly .95s both}
.win{transform-box:fill-box;transform-origin:50% 100%;animation:pop .6s ${BACK} both}
.doll{animation:float 1.6s cubic-bezier(.22,.9,.3,1) .45s both}
.cat{transform-box:fill-box;transform-origin:50% 100%;animation:popup .6s ${BACK} 1.05s both}
.shades{transform-box:fill-box;transform-origin:center;animation:shades .9s 1.8s both}
.ribbon{transform-box:fill-box;transform-origin:center;animation:unfurl .55s ${BACK} ${(landed + 0.15).toFixed(2)}s both}
.tails{transform-box:fill-box;transform-origin:center;animation:tails .5s ${EXPO} ${(landed + 0.4).toFixed(2)}s both}
.kit{animation:spring .7s ${BACK} 2.15s both}
.lid{transform-box:fill-box;transform-origin:50% 100%;animation:wobble 1s ease-out 2.2s both}
.paws{transform-box:fill-box;transform-origin:50% 100%;animation:pop .35s ${BACK} 2.55s both}
.bubble{transform-box:fill-box;transform-origin:50% 100%;animation:pop .5s ${BACK} 2.65s both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .45s ${BACK} both}
.blink{transform-box:fill-box;transform-origin:center;animation:blink .3s ease-in-out both}
@keyframes fade{from{opacity:0}}
@keyframes drop{from{transform:translateY(-40px)}}
@keyframes unroll{from{transform:scaleY(.2);opacity:0}}
@keyframes on{from{opacity:.15}}
@keyframes jelly{0%{opacity:0;transform:translateY(-260px) scale(.75,1.3);animation-timing-function:${GRAVITY}}12%{opacity:1}42%{transform:translateY(0) scale(1.35,.68);animation-timing-function:ease-out}60%{transform:translateY(-22px) scale(.9,1.12);animation-timing-function:ease-in}76%{transform:translateY(0) scale(1.12,.9);animation-timing-function:ease-out}90%{transform:scale(.97,1.03)}100%{transform:none}}
@keyframes pop{from{opacity:0;transform:scale(0)}}
@keyframes float{0%{transform:translate(-30px,-620px)}78%{transform:translate(0,6px)}100%{transform:none}}
@keyframes popup{from{opacity:0;transform:translateY(40px) scale(.4)}}
@keyframes shades{0%{opacity:0;transform:translateY(-210px) rotate(-16deg);animation-timing-function:${GRAVITY}}10%{opacity:1}62%{transform:translateY(0) rotate(0);animation-timing-function:ease-out}80%{transform:translateY(-12px) rotate(4deg);animation-timing-function:ease-in}100%{transform:none}}
@keyframes unfurl{from{transform:scaleX(0)}}
@keyframes tails{from{opacity:0;transform:scaleX(.6)}}
@keyframes spring{from{transform:translateY(60px)}}
@keyframes wobble{0%{transform:rotate(14deg)}35%{transform:translateY(-14px) rotate(-10deg)}65%{transform:rotate(5deg)}100%{transform:none}}
@keyframes blink{50%{transform:scaleY(.1)}}
${burstCss}
${LOOPS}
${REDUCED}`;

  const label = `${name}${profile.headline ? ` — ${profile.headline.replace(/[.!?\s]+$/, '')}` : ''}. A pastel doll's-house room: a doll on heart balloons, a cat in heart-shaped sunglasses, and a kitten in a gift box${speech !== profile.headline ? ` saying “${speech}”` : ''}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(label)}">
<style>${css}</style>
<defs>
  ${sharedDefs(c)}
  ${lights.defs}
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="26"/></clipPath>
  <pattern id="wall" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="22" height="44" fill="${c.wallA}"/><rect x="22" width="22" height="44" fill="${c.wallB}"/><path d="${heartPath(33, 22, 4)}" fill="${c.wallHeart}"/></pattern>
  <clipPath id="boxClip"><rect x="520" y="300" width="160" height="214"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <g class="room">
    <rect width="${W}" height="${H}" fill="url(#wall)"/>
    <rect y="466" width="${W}" height="${H - 466}" fill="${c.floor}"/>
    ${planks}
    <rect x="-10" y="456" width="${W + 20}" height="14" fill="${c.base}" stroke="${c.ink}" stroke-width="3"/>
    <ellipse cx="600" cy="572" rx="268" ry="24" fill="${c.rug}" stroke="${c.ink}" stroke-width="3"/>
    <ellipse cx="600" cy="572" rx="250" ry="17" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="7 6" opacity="0.8"/>
  </g>
  <g class="trim"><g fill="${c.trim}" stroke="${c.ink}" stroke-width="3">${trim}</g><g fill="#fff" opacity="0.85">${trimDots}</g></g>
  <g class="win" style="animation-delay:.3s">${windowSvg(48, 100, c, themeName, 'L')}</g>
  <g class="win" style="animation-delay:.42s">${windowSvg(992, 100, c, themeName, 'R')}</g>
  ${lights.svg}
  ${burst}
  ${title.svg}
  ${ribbon(ribbonText, 600, 286, c)}
  <g transform="translate(1066 560)">
    <ellipse cx="0" cy="16" rx="100" ry="10" fill="${c.ink}" opacity="0.14"/>
    <path d="M-94 -6 L-90 12 Q0 34 90 12 L94 -6 Z" fill="${c.cushion}" stroke="${c.ink}" stroke-width="3.5" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-6" rx="94" ry="20" fill="${c.cushionTop}" stroke="${c.ink}" stroke-width="3.5"/>
    <g fill="${c.cushion}" stroke="${c.ink}" stroke-width="2"><circle cx="-46" cy="-6" r="3.5"/><circle cx="0" cy="-2" r="3.5"/><circle cx="46" cy="-6" r="3.5"/></g>
  </g>
  <g transform="translate(1066 552)"><g class="cat">${coolCat(c, look.cat)}</g></g>
  <g transform="translate(166 574)"><g class="doll">${doll(c, look, balloons(c))}</g></g>
  <ellipse cx="600" cy="574" rx="54" ry="7" fill="${c.ink}" opacity="0.16"/>
  <g clip-path="url(#boxClip)"><g class="kit">
    <g transform="translate(600 494)">${kittenHead(c, look.kitten)}</g>
    <g transform="translate(600 447) rotate(-12)"><g class="lid">
      <rect x="-48" y="-9" width="96" height="18" rx="4" fill="${P.lilac}" stroke="${c.ink}" stroke-width="3.5"/>
      <rect x="-7" y="-9" width="14" height="18" fill="${P.hot}" stroke="${c.ink}" stroke-width="2.5"/>
    </g></g>
  </g></g>
  <rect x="557" y="514" width="86" height="58" rx="4" fill="${P.lilac}" stroke="${c.ink}" stroke-width="3.5"/>
  <rect x="593" y="514" width="14" height="58" fill="${P.hot}" stroke="${c.ink}" stroke-width="2.5"/>
  <path d="M566 524 v38 M634 524 v38" stroke="#fff" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.8"/>
  <g class="paws"><ellipse cx="582" cy="515" rx="10" ry="6.5" fill="${look.kitten.fur}" stroke="${c.ink}" stroke-width="3"/><ellipse cx="618" cy="515" rx="10" ry="6.5" fill="${look.kitten.fur}" stroke="${c.ink}" stroke-width="3"/></g>
  ${bubbleSvg}
  ${sparkles(
    [
      [282, 146, 14, P.butter],
      [918, 136, 16, '#fff'],
      [392, 316, 9, P.butter],
      [814, 314, 11, '#fff'],
      [312, 430, 8, '#fff'],
      [880, 420, 10, P.butter],
    ],
    c,
    landed
  )}
</g>
<rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="25" fill="none" stroke="${c.ink}" stroke-width="5"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Diary — the year as a heart, stats as stickers, languages as polish
// ---------------------------------------------------------------------------

// Cells on a grid inside the classic implicit heart (x² + y² − 1)³ − x²y³ ≤ 0, grown until there
// are enough for every day. Surplus cells nearest the edge are dropped, so the outline stays a heart.
function heartCells(count, pitch, cx, cy) {
  const inside = (u, v) => (u * u + v * v - 1) ** 3 - u * u * v ** 3;
  for (let scale = 30; scale < 400; scale += 1) {
    const cells = [];
    const reach = Math.ceil((1.3 * scale) / pitch);
    for (let i = -reach; i <= reach; i++) {
      for (let j = -reach; j <= reach; j++) {
        const x = cx + i * pitch;
        const y = cy + j * pitch;
        const f = inside((x - cx) / scale, -(y - cy) / scale + 0.14);
        if (f <= 0) cells.push({ x: r1(x), y: r1(y), f });
      }
    }
    if (cells.length >= count) {
      cells.sort((a, b) => a.f - b.f);
      return cells.slice(0, count).sort((a, b) => a.x - b.x || a.y - b.y);
    }
  }
  return [];
}

function levels(days) {
  const nonzero = days.map((d) => d.count).filter((v) => v > 0).sort((a, b) => a - b);
  const q = (p) => nonzero[Math.min(nonzero.length - 1, Math.floor(p * nonzero.length))] || 1;
  const t1 = q(0.25);
  const t2 = q(0.5);
  const t3 = q(0.75);
  return (v) => (v <= 0 ? 0 : v <= t1 ? 1 : v <= t2 ? 2 : v <= t3 ? 3 : 4);
}

function sticker(shape, color, c, big, small, x, y, rot, delay) {
  const body = `fill="${color}" stroke="${c.ink}" stroke-width="3.5" stroke-linejoin="round"`;
  const cut = `fill="${c.sticker}" stroke="${c.sticker}" stroke-width="16" stroke-linejoin="round"`;
  const shadow = `fill="${c.ink}" opacity="0.16"`;
  let d;
  let textY = 2;
  if (shape === 'heart') {
    d = `<path d="${heartPath(0, 6, 80)}" ATTR/>`;
    textY = -2;
  } else if (shape === 'star') {
    d = `<polygon points="${starPoints(0, 6, 84, 50)}" ATTR/>`;
    textY = 12;
  } else if (shape === 'cat') {
    d = `<path d="M-64 -4 C-68 -30 -62 -46 -56 -54 L-52 -92 L-22 -64 Q0 -70 22 -64 L52 -92 L56 -54 C62 -46 68 -30 64 -4 C60 36 32 58 0 58 C-32 58 -60 36 -64 -4 Z" ATTR/>`;
    textY = 4;
  } else {
    d = `<path d="${scallopCircle(62, 12, 18)}" ATTR/>`;
  }
  const smallSize = small.length > 11 ? 10.5 : 12;
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="slap" style="animation-delay:${delay.toFixed(2)}s">
  <g transform="translate(5 7)">${d.replace('ATTR', shadow)}</g>
  ${d.replace('ATTR', cut)}
  ${d.replace('ATTR', body)}
  ${shape === 'cat' ? `<path d="M-50 4 l-18 -4 M-50 12 l-18 2 M50 4 l18 -4 M50 12 l18 2" stroke="${c.ink}" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>` : ''}
  <text x="0" y="${textY}" text-anchor="middle" font-family="${BUBBLE}" font-size="${big.length > 6 ? 27 : 33}" font-weight="900" fill="#4a1838">${escapeXml(big)}</text>
  <text x="0" y="${textY + 22}" text-anchor="middle" font-family="${ROUND}" font-size="${smallSize}" font-weight="800" letter-spacing="1.2" fill="#4a1838" opacity="0.8">${escapeXml(small)}</text>
</g></g>`;
}

function pawPrint(x, y, angle, color) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${Math.round(angle)})"><g class="paw" fill="${color}">
  <ellipse cx="0" cy="3" rx="7" ry="6"/><circle cx="-7" cy="-5" r="2.8"/><circle cx="-2.5" cy="-9" r="2.8"/><circle cx="2.5" cy="-9" r="2.8"/><circle cx="7" cy="-5" r="2.8"/>
</g></g>`;
}

const POLISH = ['#ff4f96', '#a780ff', '#ff8a70', '#4fd0a8', '#6fbcff'];

function bottle(x, base, color, level, name, pct, c, delay) {
  const ink = c.ink;
  const liquidTop = -64 + (1 - level) * 58;
  return `<g transform="translate(${x} ${base})"><g class="bottle" style="animation-delay:${delay.toFixed(2)}s">
  <ellipse cx="0" cy="3" rx="40" ry="6" fill="${ink}" opacity="0.14"/>
  <rect x="-34" y="-68" width="68" height="68" rx="17" fill="#fff" fill-opacity="${c.glass}" stroke="${ink}" stroke-width="3.5"/>
  <clipPath id="liq${x}"><rect x="-30" y="-64" width="60" height="60" rx="14"/></clipPath>
  <g clip-path="url(#liq${x})"><rect class="fill" style="animation-delay:${(delay + 0.25).toFixed(2)}s" x="-30" y="${r1(liquidTop)}" width="60" height="${r1(-4 - liquidTop)}" fill="${color}"/></g>
  <rect x="-24" y="-60" width="7" height="44" rx="3.5" fill="#fff" opacity="0.7"/>
  <rect x="-12" y="-78" width="24" height="12" rx="3" fill="#fff" fill-opacity="${c.glass}" stroke="${ink}" stroke-width="3"/>
  <rect x="-15" y="-108" width="30" height="34" rx="8" fill="${color}" stroke="${ink}" stroke-width="3.5"/>
  <rect x="-9" y="-102" width="5" height="22" rx="2.5" fill="#fff" opacity="0.6"/>
  <text x="0" y="26" text-anchor="middle" font-family="${ROUND}" font-size="15" font-weight="800" fill="${c.text}">${escapeXml(name)}</text>
  ${pct ? `<text x="0" y="44" text-anchor="middle" font-family="${ROUND}" font-size="13" font-weight="700" fill="${c.muted}">${pct}</text>` : ''}
</g></g>`;
}

export function diarySvg(profile, themeName, { catName }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = dollhouseNumbers(profile);
  const look = looks(profile);
  const ink = c.ink;
  const rand = seededRandom(`diary:${profile.login}`);

  // The heart: one tiny heart per day, oldest on the left, grouped by month for the fill-in.
  const days = n.days.length ? n.days : Array.from({ length: 365 }, () => ({ date: '', count: 0 }));
  const cells = heartCells(days.length, 9.4, 265, 346);
  const level = levels(days);
  const months = new Map();
  days.forEach((d, i) => {
    const cell = cells[i];
    if (!cell) return;
    const key = d.date.slice(0, 7) || String(Math.floor(i / 31));
    if (!months.has(key)) months.set(key, '');
    months.set(key, months.get(key) + `<use href="#cell" x="${cell.x}" y="${cell.y}" fill="${c.cells[level(d.count)]}"/>`);
  });
  const heart = [...months.values()].map((g, i) => `<g class="month" style="animation-delay:${(0.9 + i * 0.1).toFixed(2)}s">${g}</g>`).join('');

  const stickers = [
    ['heart', '#ffb3d1', compact(n.total), 'CONTRIBUTIONS'],
    ['star', P.butter, compact(n.streak), 'DAY STREAK'],
    ['cat', '#ddd0ff', compact(n.followers), 'FAN CLUB'],
    ['flower', '#b6f0da', compact(n.stars), 'STARS'],
  ]
    .map(([shape, color, big, small], i) => sticker(shape, color, c, big, small, 552 + i * 172, 268 + (i % 2 ? 10 : -6), Math.round(rand() * 14 - 7), 1.3 + i * 0.18))
    .join('');

  const langs = (profile.languages || []).slice(0, 5);
  const topShare = Math.max(0.01, ...langs.map((l) => l.share));
  const bottles = langs.length
    ? langs
        .map((l, i) => bottle(588 + i * 128 + (5 - langs.length) * 64, 500, POLISH[i], 0.18 + 0.78 * (l.share / topShare), l.name, `${Math.max(1, Math.round(l.share * 100))}%`, c, 2.1 + i * 0.12))
        .join('')
    : bottle(844, 500, POLISH[0], 0.08, 'no shades yet', '', c, 2.1);

  // Paw prints walking up to the cat that peeks over the top edge.
  const trail = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = 624 + t * 340;
    const y = 138 - t * 26 + (i % 2 ? -8 : 8);
    return pawPrint(x, y, 78, themeName === 'dark' ? '#ff8cc4' : '#ff6fae').replace('class="paw"', `class="paw" style="animation-delay:${(2.7 + i * 0.12).toFixed(2)}s"`);
  }).join('');

  const est = n.joinedYear
    ? `<g transform="translate(390 222) rotate(12)"><g class="slap" style="animation-delay:2s">
  <rect x="-58" y="-19" width="116" height="38" rx="19" fill="${c.sticker}" stroke="${c.sticker}" stroke-width="12"/>
  <rect x="-58" y="-19" width="116" height="38" rx="19" fill="${P.lilac}" stroke="${ink}" stroke-width="3"/>
  <text x="0" y="6" text-anchor="middle" font-family="${ROUND}" font-size="15" font-weight="800" letter-spacing="1.5" fill="#4a1838">EST. ${n.joinedYear}</text>
</g></g>`
    : '';

  let holes = '';
  for (let y = 134; y <= 534; y += 40) {
    holes += `<circle cx="62" cy="${y}" r="6.5" fill="${c.hole}" stroke="${ink}" stroke-width="2"/><path d="M62 ${y} C46 ${y - 15} 22 ${y - 14} 20 ${y - 3}" fill="none" stroke="${c.coil}" stroke-width="5" stroke-linecap="round"/>`;
  }

  const css = `
.peek{animation:peek .6s ${BACK} .5s both}
.ear{transform-box:fill-box;transform-origin:50% 100%;animation:twitch 4.5s ease-in-out 3s infinite}
.hook{transform-box:fill-box;transform-origin:50% 100%;animation:pop .35s ${BACK} .95s both}
.card{animation:rise .55s ${EXPO} both}
.title{animation:rise .5s ${EXPO} .25s both}
.pol{animation:polaroid .75s ${BACK} .35s both}
.dev{animation:develop 2s ease-out .6s both}
.month{animation:fadein .5s ease-out both}
.slap{transform-box:fill-box;transform-origin:center;animation:slap .55s cubic-bezier(.2,.9,.3,1.3) both}
.bottle{transform-box:fill-box;transform-origin:50% 100%;animation:pop .5s ${BACK} both}
.fill{transform-box:fill-box;transform-origin:50% 100%;animation:pour .9s ${EXPO} both}
.paw{transform-box:fill-box;transform-origin:center;animation:pop .3s ${BACK} both}
.note{animation:rise .5s ${EXPO} 3.85s both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .45s ${BACK} both}
@keyframes peek{from{transform:translateY(64px)}}
@keyframes twitch{0%,84%,100%{transform:none}88%{transform:rotate(-16deg)}93%{transform:rotate(5deg)}}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}
@keyframes polaroid{from{opacity:0;transform:translate(-30px,-40px) rotate(-10deg)}}
@keyframes develop{from{opacity:1}}
@keyframes fadein{from{opacity:0}}
@keyframes slap{0%{opacity:0;transform:scale(1.9) rotate(-16deg)}55%{opacity:1;transform:scale(.9) rotate(2deg)}100%{transform:none}}
@keyframes pour{from{transform:scaleY(0)}}
@keyframes pop{from{opacity:0;transform:scale(0)}}
${LOOPS}
${REDUCED}`;

  const label = `${profile.login}'s diary: the last year as a heart of ${days.length} tiny hearts, one per day; ${n.total.toLocaleString('en-US')} contributions, longest streak ${n.streak} days, ${n.followers.toLocaleString('en-US')} followers, ${n.stars.toLocaleString('en-US')} stars. ` +
    (langs.length ? `Top languages as nail polish: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : '') +
    ` Paw prints signed by ${catName}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(label)}">
<style>${css}</style>
<defs>
  ${sharedDefs(c)}
  <path id="cell" d="${heartPath(0, 0, 4.1)}"/>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.4" fill="${c.paperDot}" fill-opacity="${c.paperDotOpacity}"/></pattern>
  <pattern id="washi" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="${P.blush}"/><rect width="5" height="12" fill="#fff" opacity="0.55"/></pattern>
</defs>
<g transform="translate(1032 70)"><g class="peek">
  <g class="ear"><path d="M-40 -14 L-36 -56 L-8 -36 Z" fill="${look.cat.fur}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-33 -24 L-31 -45 L-15 -34 Z" fill="${look.cat.ear}"/></g>
  ${catFace(c, look.cat)}
</g></g>
<g class="card">
  <rect x="40" y="96" width="1140" height="480" rx="26" fill="${c.cardShadow}" stroke="${ink}" stroke-width="4"/>
  <rect x="28" y="84" width="1140" height="480" rx="26" fill="${c.paper}" stroke="${ink}" stroke-width="4"/>
  <rect x="32" y="88" width="1132" height="472" rx="23" fill="url(#grid)"/>
  ${holes}
</g>
<g class="hook"><ellipse cx="1004" cy="86" rx="13" ry="9" fill="${look.cat.fur}" stroke="${ink}" stroke-width="3"/><ellipse cx="1060" cy="86" rx="13" ry="9" fill="${look.cat.fur}" stroke="${ink}" stroke-width="3"/><path d="M999 81 v7 M1009 81 v7 M1055 81 v7 M1065 81 v7" stroke="${ink}" stroke-width="2" stroke-linecap="round"/></g>
<g class="title">
  <text x="104" y="148" font-family="${BUBBLE}" font-size="42" font-weight="900" fill="${P.hot}">Dear diary,</text>
  <text x="106" y="180" font-family="${HAND}" font-size="18" fill="${c.muted}">a year of @${escapeXml(profile.login)}, in hearts &amp; stickers</text>
</g>
<g transform="translate(265 372) rotate(-4)"><g class="pol">
  <rect x="-140" y="-168" width="280" height="336" rx="6" fill="${c.ink}" opacity="0.18" transform="translate(6 8)"/>
  <rect x="-140" y="-168" width="280" height="336" rx="6" fill="#fffdfe" stroke="${ink}" stroke-width="3.5"/>
  <rect x="-124" y="-152" width="248" height="248" rx="3" fill="${c.photo}"/>
  <g transform="translate(-265 -372)">${heart}</g>
  <rect class="dev" x="-124" y="-152" width="248" height="248" rx="3" fill="#5a3f55" opacity="0"/>
  <text x="0" y="128" text-anchor="middle" font-family="${HAND}" font-size="21" fill="#4a1838">my year in ♡</text>
  <text x="0" y="152" text-anchor="middle" font-family="${HAND}" font-size="15" fill="#93587c">${n.total.toLocaleString('en-US')} contributions</text>
  <rect x="-62" y="-186" width="124" height="34" fill="url(#washi)" opacity="0.9" transform="rotate(5)"/>
</g></g>
${est}
${stickers}
<text class="note" x="490" y="378" font-family="${HAND}" font-size="18" fill="${c.muted}">favourite shades ♡</text>
${bottles}
${trail}
<text class="note" x="600" y="146" text-anchor="end" font-family="${HAND}" font-size="18" fill="${P.hot}">${escapeXml(catName)} was here</text>
${sparkles(
  [
    [452, 330, 11, P.butter],
    [1132, 372, 10, P.butter],
    [96, 548, 8, '#fff'],
  ],
  c,
  2.4
)}
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Bracelet — the sign-off, in letter beads
// ---------------------------------------------------------------------------

export function braceletSvg(profile, themeName, { signoff }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 210;
  const ink = c.ink;
  const look = looks(profile);
  const rand = seededRandom(`beads:${profile.login}`);
  const x0 = 64;
  const x1 = 1136;
  const yEnd = 84;
  const sagDepth = 34;
  const curveY = (x) => {
    const t = (x - x0) / (x1 - x0);
    return yEnd + 4 * sagDepth * t * (1 - t);
  };
  const angle = (x) => {
    const t = (x - x0) / (x1 - x0);
    return (Math.atan((4 * sagDepth * (1 - 2 * t)) / (x1 - x0)) * 180) / Math.PI;
  };

  const letters = [...String(signoff || 'XOXO').toUpperCase()].slice(0, 16);
  const pitch = 46;
  const startX = 600 - ((letters.length - 1) * pitch) / 2;
  const letterBeads = letters
    .map((ch, i) => {
      const x = startX + i * pitch;
      const y = curveY(x);
      const delay = (1.0 + i * 0.08).toFixed(2);
      if (!ch.trim()) return `<g transform="translate(${r1(x)} ${r1(y)})"><g class="lb" style="animation-delay:${delay}s"><circle r="8" fill="url(#pearl)" stroke="${ink}" stroke-width="2"/></g></g>`;
      return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(angle(x))})"><g class="lb" style="animation-delay:${delay}s">
  <rect x="-20" y="-20" width="40" height="40" rx="10" fill="#fff" stroke="${ink}" stroke-width="3"/>
  <rect x="-15" y="-16" width="30" height="7" rx="3.5" fill="${P.blush}" opacity="0.35"/>
  <text y="9" text-anchor="middle" font-family="${ROUND}" font-size="24" font-weight="900" fill="${i % 2 ? '#c81d6b' : '#4a1838'}">${escapeXml(ch)}</text>
</g></g>`;
    })
    .join('');

  // Spacer beads, threaded from each clasp in toward the letters.
  const lettersLeft = startX - 24;
  const lettersRight = 600 + (600 - startX) + 24;
  const charmGap = 34;
  const kinds = ['round', 'pearl', 'heart', 'pearl', 'round', 'star', 'pearl'];
  const colors = [P.pink, P.lilac, P.mint, P.butter, P.sky, P.peach];
  const spacers = [];
  for (const side of [-1, 1]) {
    let x = side < 0 ? x0 + 24 : x1 - 24;
    const stop = side < 0 ? lettersLeft - charmGap - 14 : lettersRight + charmGap + 14;
    const dir = -side;
    let k = 0;
    for (;;) {
      const kind = kinds[k % kinds.length];
      const r = kind === 'pearl' ? 7 : 11;
      x += dir * r;
      if (dir > 0 ? x + r > stop : x - r < stop) break;
      spacers.push({ x, kind, r, side, k, color: pick(rand, colors) });
      x += dir * (r + 2);
      k++;
    }
  }
  const beads = spacers
    .map(({ x, kind, r, side, k, color }) => {
      const y = r1(curveY(x));
      const cls = side < 0 ? 'bl' : 'br';
      const style = `animation-delay:${(0.35 + k * 0.035).toFixed(2)}s`;
      let shape;
      if (kind === 'pearl') shape = `<circle r="${r}" fill="url(#pearl)" stroke="${ink}" stroke-width="2"/>`;
      else if (kind === 'heart') shape = `<path d="${heartPath(0, 0, 11)}" fill="${P.hot}" stroke="${ink}" stroke-width="2.5"/>`;
      else if (kind === 'star') shape = `<polygon points="${starPoints(0, 1, 13, 6.5)}" fill="${P.butter}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      else shape = `<circle r="${r}" fill="${color}" stroke="${ink}" stroke-width="2.5"/><circle cx="-3.5" cy="-3.5" r="3" fill="#fff" opacity="0.75"/>`;
      return `<g transform="translate(${r1(x)} ${y})"><g class="${cls}" style="${style}">${shape}</g></g>`;
    })
    .join('');

  const charm = (x, inner, delay, swayDelay) => {
    const y = r1(curveY(x));
    return `<g transform="translate(${r1(x)} ${y})"><g class="ch" style="animation-delay:${delay}s"><g class="sw" style="transform-origin:50% 0%;animation-delay:${swayDelay}s">
  <circle cx="0" cy="8" r="7" fill="none" stroke="${P.butter}" stroke-width="3.5"/>
  ${inner}
</g></g></g>`;
  };
  const catCharm = `<g transform="translate(0 46)">${catFace(c, look.cat, 0.52)}</g>`;
  const heartCharm = `<g transform="translate(0 40)"><path d="${heartPath(0, 0, 20)}" fill="url(#gPink)" stroke="${ink}" stroke-width="3"/><ellipse cx="-9" cy="-8" rx="4" ry="2.6" transform="rotate(-35 -9 -8)" fill="#fff" opacity="0.8"/></g>`;

  const css = `
.cord{animation:draw 1.1s ${EXPO} .1s both}
.bl{animation:threadL .5s ${EXPO} both}
.br{animation:threadR .5s ${EXPO} both}
.lb{transform-box:fill-box;transform-origin:center;animation:drop .6s ${BACK} both}
.ch{transform-box:fill-box;transform-origin:50% 0%;animation:pop .5s ${BACK} both}
.caption{animation:rise .5s ${EXPO} .2s both}
.clasp{animation:fade .4s ease-out both}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .45s ${BACK} both}
@keyframes draw{from{stroke-dashoffset:100}}
@keyframes threadL{from{opacity:0;transform:translateX(-46px)}}
@keyframes threadR{from{opacity:0;transform:translateX(46px)}}
@keyframes drop{from{opacity:0;transform:translateY(-80px) rotate(-40deg)}}
@keyframes pop{from{opacity:0;transform:scale(0)}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}
@keyframes fade{from{opacity:0}}
${LOOPS}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`A bead bracelet spelling ${letters.join('')}. Thanks for visiting @${profile.login}.`)}">
<style>${css}</style>
<defs>
  ${sharedDefs(c)}
  <radialGradient id="pearl" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f3dbe8"/></radialGradient>
</defs>
<text class="caption" x="600" y="34" text-anchor="middle" font-family="${HAND}" font-size="19" fill="${c.muted}">thanks for visiting @${escapeXml(profile.login)} ♡</text>
<path class="cord" d="M${x0} ${yEnd} Q600 ${yEnd + sagDepth * 2} ${x1} ${yEnd}" pathLength="100" stroke-dasharray="100" fill="none" stroke="${c.cord}" stroke-width="3" stroke-linecap="round"/>
<g class="clasp">
  <circle cx="${x0 - 2}" cy="${yEnd}" r="10" fill="none" stroke="${P.butter}" stroke-width="5"/>
  <circle cx="${x0 - 2}" cy="${yEnd}" r="10" fill="none" stroke="${ink}" stroke-width="1.5" opacity="0.6"/>
  <path d="M${x1 + 2} ${yEnd - 10} q22 0 22 10 q0 10 -22 10 q8 -10 0 -20 Z" fill="${P.butter}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
</g>
${beads}
${charm(lettersLeft - charmGap + 6, catCharm, 1.75, 0)}
${charm(lettersRight + charmGap - 6, heartCharm, 1.9, -1.4)}
${letterBeads}
${sparkles(
  [
    [x0 + 6, yEnd - 34, 9, P.butter],
    [x1 - 6, yEnd - 34, 9, P.butter],
  ],
  c,
  1.6
)}
</svg>`;
}
