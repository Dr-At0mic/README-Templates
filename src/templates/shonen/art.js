// Shōnen — animated SVG artwork in the style of an anime opening / manga title card.
//
// GitHub shows README images as <img>, which runs CSS animation inside the SVG but no scripts and
// no web fonts. So: CSS keyframes only, system font stacks, everything self-contained.
//
// Motion rules (from the ui-ux-pro-max guidance):
// - Entrances 400–700ms on expo-out; pops on back-out. One-shot.
// - At most two gentle loops per image (speed-line shimmer, sparkle twinkle), never flashing.
// - Every element's *un-animated* state is its final state, and prefers-reduced-motion switches all
//   animation off — so reduced-motion viewers get the finished frame, not a blank one.

import { seededRandom } from '../../lib/random';
import { escapeXml } from '../pulsar/art';
import { computeStats, defaultClass } from './stats';

const TITLE = "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', 'Franklin Gothic Heavy', sans-serif";
const SANS = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const JP = "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', YuGothic, Meiryo, 'Noto Sans CJK JP', 'Noto Sans JP', sans-serif";

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// Vibrant & block-based palette: ink, paper and three hits of colour.
export const THEMES = {
  light: {
    paper: '#fff6e6',
    card: '#fffdf8',
    ink: '#16131f',
    lines: '#16131f',
    muted: '#5d5871',
    track: '#f1e6d2',
    pink: '#ff2e88',
    yellow: '#ffd60a',
    cyan: '#00b8f0',
  },
  dark: {
    paper: '#100e1a',
    card: '#191627',
    ink: '#0a0910',
    lines: '#efeaff',
    muted: '#a8a2c3',
    track: '#262238',
    pink: '#ff3d94',
    yellow: '#ffd60a',
    cyan: '#22d3ff',
  },
};

const REDUCED = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';
const r1 = (n) => Math.round(n * 10) / 10;

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

function starburst(cx, cy, rx, ry, spikes, rand, inner = 0.74) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const k = i % 2 === 0 ? 1 + (rand() - 0.5) * 0.16 : inner + (rand() - 0.5) * 0.06;
    pts.push(`${r1(cx + Math.cos(a) * rx * k)},${r1(cy + Math.sin(a) * ry * k)}`);
  }
  return pts.join(' ');
}

function sparkle(x, y, s) {
  // Four-point star.
  const k = s * 0.28;
  return `M${r1(x)} ${r1(y - s)} L${r1(x + k)} ${r1(y - k)} L${r1(x + s)} ${r1(y)} L${r1(x + k)} ${r1(y + k)} L${r1(x)} ${r1(y + s)} L${r1(x - k)} ${r1(y + k)} L${r1(x - s)} ${r1(y)} L${r1(x - k)} ${r1(y - k)} Z`;
}

function stackedText(chars, x, y0, size, attrs) {
  return chars
    .map((ch, i) => `<text x="${x}" y="${y0 + i * size * 1.02}" text-anchor="middle" font-size="${size}" ${attrs}>${escapeXml(ch)}</text>`)
    .join('');
}

// ---------------------------------------------------------------------------
// 1. Title card
// ---------------------------------------------------------------------------

export function titleCardSvg(profile, themeName, { catchphrase }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 520;
  const cx = 600;
  const cy = 212;
  const rand = seededRandom(`shonen:${profile.login}`);

  const name = (profile.name || profile.login).toUpperCase();
  const nameSize = Math.round(Math.max(54, Math.min(118, 860 / (Math.max(4, name.length) * 0.5))));
  const nameWidth = name.length * nameSize * 0.5;
  const rx = Math.max(250, Math.min(540, nameWidth / 2 + 80));
  const ry = nameSize * 0.82 + 34;

  // Speed lines (集中線): wedges from beyond the frame, tips stopping just outside the burst.
  let linesA = '';
  let linesB = '';
  const count = 120;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.05;
    const half = 0.003 + rand() * 0.011;
    const tipX = cx + Math.cos(a) * (rx + 30 + rand() * 170);
    const tipY = cy + Math.sin(a) * (ry + 24 + rand() * 120);
    const b1 = [cx + Math.cos(a - half) * 1100, cy + Math.sin(a - half) * 1100];
    const b2 = [cx + Math.cos(a + half) * 1100, cy + Math.sin(a + half) * 1100];
    const d = `<path d="M${r1(b1[0])} ${r1(b1[1])} L${r1(b2[0])} ${r1(b2[1])} L${r1(tipX)} ${r1(tipY)} Z"/>`;
    if (i % 2) linesA += d;
    else linesB += d;
  }

  // Upper arc and flanks only — the lower arc belongs to the speech bubble.
  const sparks = [-168, -128, -52, -12, 168].map((deg, i) => {
    const a = ((deg + (rand() - 0.5) * 14) * Math.PI) / 180;
    const x = cx + Math.cos(a) * rx * 1.08;
    const y = cy + Math.sin(a) * ry * 1.25;
    const s = 9 + rand() * 13;
    return `<path class="spark" style="animation-delay:${(i * 0.45).toFixed(2)}s" d="${sparkle(x, y, s)}" fill="${i % 2 ? c.yellow : '#ffffff'}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`;
  }).join('');

  // Speech bubble with the catchphrase.
  const bubbleLines = wrap(catchphrase, 46, 2);
  const longest = Math.max(...bubbleLines.map((l) => l.length), 8);
  const bw = Math.min(720, Math.max(300, longest * 12.4 + 64));
  const bh = bubbleLines.length > 1 ? 92 : 60;
  const bx = cx - bw / 2;
  const by = cy + ry + 30;
  const tx = cx - Math.min(160, bw / 2 - 60);
  const bubblePath = `M${r1(bx + 26)} ${r1(by)} L${r1(tx - 18)} ${r1(by)} L${r1(tx - 46)} ${r1(by - 40)} L${r1(tx + 20)} ${r1(by)} L${r1(bx + bw - 26)} ${r1(by)} Q${r1(bx + bw)} ${r1(by)} ${r1(bx + bw)} ${r1(by + 26)} L${r1(bx + bw)} ${r1(by + bh - 26)} Q${r1(bx + bw)} ${r1(by + bh)} ${r1(bx + bw - 26)} ${r1(by + bh)} L${r1(bx + 26)} ${r1(by + bh)} Q${r1(bx)} ${r1(by + bh)} ${r1(bx)} ${r1(by + bh - 26)} L${r1(bx)} ${r1(by + 26)} Q${r1(bx)} ${r1(by)} ${r1(bx + 26)} ${r1(by)} Z`;
  const bubbleText = bubbleLines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${r1(by + (bubbleLines.length > 1 ? 38 + i * 32 : 38))}" text-anchor="middle" font-family="${SANS}" font-size="23" font-weight="700" fill="${'#16131f'}">${escapeXml(line)}</text>`
    )
    .join('');

  const caption = [profile.location, profile.joinedYear ? `SINCE ${profile.joinedYear}` : '']
    .filter(Boolean)
    .join('  ·  ')
    .toUpperCase();
  const nameY = r1(cy + nameSize * 0.36);
  const nameAttrs = `x="0" y="0" text-anchor="middle" font-family="${TITLE}" font-size="${nameSize}" letter-spacing="1" stroke-linejoin="round" paint-order="stroke fill"`;

  const css = `
.lines{transform-origin:${cx}px ${cy}px;animation:zoom .7s ${EXPO} both}
.la{animation:shimmer 1.8s ease-in-out .7s infinite}
.lb{animation:shimmer 1.8s ease-in-out 1.6s infinite}
.burst{transform-box:fill-box;transform-origin:center;animation:pop .5s ${BACK} .15s both}
.name{animation:slam .75s cubic-bezier(.2,.8,.2,1) .35s both}
.tag{animation:drop .5s ${EXPO} .1s both}
.kanji{animation:rise .6s ${EXPO} .8s both}
.bubble{transform-box:fill-box;transform-origin:22% 0%;animation:bubble .45s ${BACK} 1.05s both}
.spark{transform-box:fill-box;transform-origin:center;animation:twinkle 2.4s ease-in-out infinite}
.caption{animation:rise .5s ${EXPO} 1.3s both}
@keyframes zoom{from{opacity:0;transform:scale(1.3)}}
@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes pop{from{transform:scale(0) rotate(-24deg)}}
@keyframes slam{0%{transform:translateX(-170px);opacity:0}50%{transform:translateX(16px);opacity:1}66%{transform:translateX(-8px)}82%{transform:translateX(4px)}100%{transform:none}}
@keyframes drop{from{transform:translateY(-80px)}}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}
@keyframes bubble{from{opacity:0;transform:scale(.35)}}
@keyframes twinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(.5) rotate(45deg)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`${profile.name || profile.login} — ${catchphrase}`)}">
<style>${css}</style>
<defs>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <pattern id="tone" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.7" fill="${c.lines}"/></pattern>
  <radialGradient id="vignette" cx="50%" cy="42%" r="65%"><stop offset="45%" stop-color="#000"/><stop offset="100%" stop-color="#fff"/></radialGradient>
  <mask id="toneMask"><rect width="${W}" height="${H}" fill="url(#vignette)"/></mask>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${c.paper}"/>
  <rect width="${W}" height="${H}" fill="url(#tone)" opacity="0.22" mask="url(#toneMask)"/>
  <g class="lines" fill="${c.lines}">
    <g class="la">${linesA}</g>
    <g class="lb">${linesB}</g>
  </g>
  <polygon class="burst" points="${starburst(cx, cy, rx, ry, 22, rand)}" fill="${c.yellow}" stroke="${c.ink}" stroke-width="5" stroke-linejoin="round"/>
  ${sparks}
  <g transform="translate(${cx} ${nameY})">
    <g class="name">
      <g transform="skewX(-9)">
        <text ${nameAttrs} transform="translate(9 9)" fill="${c.pink}" stroke="${c.ink}" stroke-width="12">${escapeXml(name)}</text>
        <text ${nameAttrs} fill="#ffffff" stroke="${c.ink}" stroke-width="12">${escapeXml(name)}</text>
      </g>
    </g>
  </g>
  <g class="kanji">
    ${stackedText(['参', '上'], 1118, 196, 78, `font-family="${JP}" font-weight="900" fill="${c.pink}" stroke="${c.ink}" stroke-width="5" paint-order="stroke fill" stroke-linejoin="round"`)}
    <text x="1118" y="372" text-anchor="middle" font-family="${TITLE}" font-size="54" fill="${c.pink}" stroke="${c.ink}" stroke-width="5" paint-order="stroke fill">!!</text>
    ${stackedText(['第', '一', '話'], 80, 186, 40, `font-family="${JP}" font-weight="800" fill="${c.lines}"`)}
  </g>
  <g class="tag">
    <polygon points="28,24 352,24 334,70 28,70" fill="${c.ink}" stroke="${themeName === 'dark' ? c.pink : c.ink}" stroke-width="3"/>
    <text x="46" y="57" font-family="${TITLE}" font-size="28" letter-spacing="1.5" fill="${c.yellow}">EP.01</text>
    <text x="132" y="56" font-family="${SANS}" font-size="18" font-weight="700" fill="#ffffff">@${escapeXml(profile.login)}</text>
  </g>
  <g class="bubble">
    <path d="${bubblePath}" fill="#ffffff" stroke="${c.ink}" stroke-width="4" stroke-linejoin="round"/>
    ${bubbleText}
  </g>
  ${
    // Solid credits strip along the bottom, so the caption stays legible over the speed lines.
    caption
      ? `<g class="caption"><rect x="0" y="${H - 38}" width="${W}" height="38" fill="${c.ink}"/><rect x="0" y="${H - 38}" width="${W}" height="3" fill="${c.pink}"/><text x="${cx}" y="${H - 13}" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="800" letter-spacing="3" fill="#ffffff"><tspan fill="${c.yellow}">★</tspan>  ${escapeXml(caption)}  <tspan fill="${c.yellow}">★</tspan></text></g>`
      : ''
  }
</g>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="17" fill="none" stroke="${c.ink}" stroke-width="4"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Character sheet
// ---------------------------------------------------------------------------

function odometer(value, x, baseline, color) {
  const text = value.toLocaleString('en-US');
  const step = 78;
  let cursor = x;
  let defs = '';
  let body = '';
  let css = '';
  let digitIndex = 0;
  for (const ch of text) {
    if (!/\d/.test(ch)) {
      body += `<text x="${cursor + 6}" y="${baseline}" font-family="${TITLE}" font-size="72" fill="${color}">${ch}</text>`;
      cursor += 20;
      continue;
    }
    const final = Number(ch);
    const spins = 1 + Math.floor(digitIndex / 2);
    const strip = [];
    for (let s = 0; s < spins; s++) for (let d = 0; d < 10; d++) strip.push(d);
    for (let d = 0; d <= final; d++) strip.push(d);
    const n = strip.length;
    const id = `d${digitIndex}`;
    defs += `<clipPath id="${id}"><rect x="${cursor - 2}" y="${baseline - 68}" width="46" height="82"/></clipPath>`;
    const glyphs = strip
      .map((d, i) => `<text x="${cursor + 21}" y="${baseline - (n - 1 - i) * step}" text-anchor="middle">${d}</text>`)
      .join('');
    css += `@keyframes r${digitIndex}{from{transform:translateY(${(n - 1) * step}px)}}`;
    css += `.${id}{animation:r${digitIndex} ${(1.3 + digitIndex * 0.18).toFixed(2)}s ${EXPO} .4s both}`;
    body += `<g clip-path="url(#${id})"><g class="${id}" font-family="${TITLE}" font-size="72" fill="${color}">${glyphs}</g></g>`;
    cursor += 44;
    digitIndex++;
  }
  return { defs, body, css, width: cursor - x };
}

export function characterSheetSvg(profile, themeName, { heroClass }) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 500;
  const rand = seededRandom(`sheet:${profile.login}`);
  const { stats, rank, power, over9000 } = computeStats(profile);
  const cls = (heroClass || defaultClass(profile)).toUpperCase();
  const clsSize = Math.round(Math.max(26, Math.min(46, 470 / (cls.length * 0.5))));
  const odo = odometer(power, 64, 330, c.lines);
  const barColors = [c.pink, c.yellow, c.cyan, c.pink, c.yellow];

  const rows = stats
    .map((s, i) => {
      const y = 168 + i * 56;
      const w = Math.max(10, Math.round(500 * s.score));
      return `<g class="row" style="animation-delay:${(0.5 + i * 0.1).toFixed(2)}s">
  <text x="620" y="${y}" font-family="${TITLE}" font-size="26" letter-spacing="1" fill="${c.lines}">${s.key}</text>
  <text x="680" y="${y - 2}" font-family="${SANS}" font-size="14" font-weight="600" fill="${c.muted}">${escapeXml(s.label)}</text>
  <text x="1120" y="${y}" text-anchor="end" font-family="${TITLE}" font-size="24" fill="${c.lines}">${s.value.toLocaleString('en-US')}</text>
  <rect x="620" y="${y + 12}" width="500" height="18" rx="9" fill="${c.track}" stroke="${c.ink}" stroke-width="3"/>
  <rect class="bar" style="animation-delay:${(0.7 + i * 0.12).toFixed(2)}s" x="620" y="${y + 12}" width="${w}" height="18" rx="9" fill="${barColors[i]}" stroke="${c.ink}" stroke-width="3"/>
</g>`;
    })
    .join('\n');

  const chips = (profile.languages || []).slice(0, 3).map((l, i, arr) => ({ name: l.name, color: barColors[i], last: i === arr.length - 1 }));
  let chipX = 64;
  const chipSvg = chips
    .map((chip, i) => {
      const w = Math.round(chip.name.length * 9.6 + 34);
      const svg = `<g class="chip" style="animation-delay:${(1.6 + i * 0.12).toFixed(2)}s"><rect x="${chipX}" y="402" width="${w}" height="36" rx="18" fill="${chip.color}" stroke="${c.ink}" stroke-width="3"/><text x="${chipX + w / 2}" y="426" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="800" fill="#16131f">${escapeXml(chip.name)}</text></g>`;
      chipX += w + 10;
      return svg;
    })
    .join('');

  const stickerX = Math.min(500, 64 + odo.width + 92);
  const sticker = over9000
    ? `<g transform="translate(${stickerX} 300) rotate(-11)"><g class="sticker">
  <polygon points="${starburst(0, 0, 92, 56, 14, rand, 0.78)}" fill="${c.yellow}" stroke="${c.ink}" stroke-width="4" stroke-linejoin="round"/>
  <text x="0" y="-4" text-anchor="middle" font-family="${TITLE}" font-size="21" fill="#16131f">IT'S OVER</text>
  <text x="0" y="22" text-anchor="middle" font-family="${TITLE}" font-size="27" fill="${'#e0005f'}">9000!!</text>
</g></g>`
    : '';

  const css = `
.card{animation:rise .6s ${EXPO} both}
.row{animation:rise .5s ${EXPO} both}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow .9s ${EXPO} both}
.chip{animation:rise .45s ${BACK} both}
.stamp{transform-box:fill-box;transform-origin:center;animation:stamp .5s cubic-bezier(.2,.9,.3,1.25) 2.1s both}
.sticker{transform-box:fill-box;transform-origin:center;animation:pop .5s ${BACK} 2.5s both}
.cls{animation:slide .6s ${EXPO} .25s both}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes stamp{0%{opacity:0;transform:scale(2.6)}70%{opacity:1;transform:scale(.9)}100%{transform:scale(1)}}
@keyframes pop{from{opacity:0;transform:scale(0) rotate(-30deg)}}
@keyframes slide{from{opacity:0;transform:translateX(-40px)}}
${odo.css}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Character sheet: class ${cls}, rank ${rank}, power level ${power.toLocaleString('en-US')}. ` + stats.map((s) => `${s.key} ${s.value}`).join(', ')
  )}">
<style>${css}</style>
<defs>${odo.defs}</defs>
<g class="card">
  <rect x="34" y="34" width="${W - 58}" height="${H - 58}" rx="22" fill="${c.pink}" stroke="${c.ink}" stroke-width="4"/>
  <rect x="22" y="22" width="${W - 58}" height="${H - 58}" rx="22" fill="${c.card}" stroke="${c.ink}" stroke-width="4"/>
</g>
<text x="64" y="84" font-family="${TITLE}" font-size="22" letter-spacing="3" fill="${c.pink}">CHARACTER SHEET</text>
<text x="292" y="83" font-family="${SANS}" font-size="16" font-weight="700" fill="${c.muted}">@${escapeXml(profile.login)}</text>
<line x1="64" y1="104" x2="1120" y2="104" stroke="${c.lines}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity="0.5"/>

<text x="64" y="146" font-family="${SANS}" font-size="13" font-weight="800" letter-spacing="2.5" fill="${c.muted}">CLASS</text>
<text class="cls" x="64" y="${146 + clsSize + 6}" font-family="${TITLE}" font-size="${clsSize}" letter-spacing="1" fill="${c.lines}">${escapeXml(cls)}</text>

<text x="64" y="244" font-family="${SANS}" font-size="13" font-weight="800" letter-spacing="2.5" fill="${c.muted}">POWER LEVEL</text>
${odo.body}
${sticker}

<text x="64" y="388" font-family="${SANS}" font-size="13" font-weight="800" letter-spacing="2.5" fill="${c.muted}">AFFINITY</text>
${chipSvg}

${rows}

<g transform="translate(1068 66) rotate(-14)"><g class="stamp">
  <circle r="44" fill="${c.card}" stroke="${c.pink}" stroke-width="6"/>
  <circle r="35" fill="none" stroke="${c.pink}" stroke-width="2"/>
  <text y="-14" text-anchor="middle" font-family="${SANS}" font-size="10" font-weight="900" letter-spacing="2" fill="${c.pink}">RANK</text>
  <text y="26" text-anchor="middle" font-family="${TITLE}" font-size="44" fill="${c.pink}">${rank}</text>
</g></g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. "To be continued"
// ---------------------------------------------------------------------------

export function toBeContinuedSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 120;
  const css = `
.arrow{animation:enter .8s ${EXPO} .2s both}
.trail{animation:trail .9s ${EXPO} .2s both}
@keyframes enter{from{transform:translateX(560px)}}
@keyframes trail{0%{opacity:0;transform:translateX(420px)}40%{opacity:.9}100%{opacity:0;transform:none}}
${REDUCED}`;
  // Trails are invisible at rest: they only exist while the arrow flies in.
  const trails = [42, 60, 78]
    .map((y, i) => `<rect x="${560 + i * 24}" y="${y - 2}" width="${110 - i * 20}" height="4" rx="2" fill="${c.lines}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="To be continued">
<style>${css}</style>
<text x="40" y="68" font-family="${SANS}" font-size="15" font-weight="800" letter-spacing="2" fill="${c.muted}">@${escapeXml(profile.login.toUpperCase())}  ·  第一話  END</text>
<g class="trail" opacity="0">${trails}</g>
<g class="arrow">
  <polygon points="690,60 752,14 752,36 1162,36 1162,84 752,84 752,106" fill="${c.yellow}" stroke="${c.ink}" stroke-width="4" stroke-linejoin="round"/>
  <text x="958" y="71" text-anchor="middle" font-family="${TITLE}" font-size="30" letter-spacing="2" fill="#16131f">TO BE CONTINUED</text>
</g>
</svg>`;
}
