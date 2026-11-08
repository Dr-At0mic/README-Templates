// Annual Report — artwork in the manner of a printed shareholder report.
//
// Hero: a report cover. Serif name behind a curtain reveal, the role in small brass capitals, four key
// figures that roll into place like an odometer, and the year as a monthly bar chart with the busiest
// month picked out in brass and a dotted average.
// Key figures: an audited-looking table of the year beside a language donut ("portfolio").
// Closing note: a sign-off, the name with a pen swash under it, and a brass monogram.
//
// Rules shared with the other templates: CSS keyframes only, from-only keyframes so the resting state is
// the final frame, no infinite loops here at all, no blur, and prefers-reduced-motion stops everything.

import {
  EXPO,
  compact,
  REDUCED,
  SANS,
  SERIF,
  escapeXml,
  fitAttrs,
  fitSize,
  fmt,
  formatDate,
  initials,
  proNumbers,
  r1,
  roleLine,
  splitName,
  textWidth,
  wrap,
} from '../common';

export const THEMES = {
  light: {
    bg: '#f7f4ee',
    ink: '#13213b',
    muted: '#566078',
    rule: '#cfc6b6',
    faint: '#e6dfd2',
    brass: '#8a5f17',
    bar: '#13213b',
    shades: [0.86, 0.62, 0.44, 0.3, 0.2, 0.12],
  },
  dark: {
    bg: '#0d1626',
    ink: '#f2ede3',
    muted: '#9ba5b9',
    rule: '#2b3851',
    faint: '#1a263c',
    brass: '#d8ab52',
    bar: '#e9e3d6',
    shades: [0.86, 0.62, 0.44, 0.3, 0.2, 0.12],
  },
};

export const annualNumbers = proNumbers;

const year = () => new Date().getFullYear();

// One digit column of an odometer: a strip of 0–9 twice, rolled up to the final digit.
export const figureText = (v) => (v >= 100000 ? compact(v) : fmt(v));

function odometerWidth(text, size) {
  return [...text].reduce((w, ch) => w + (/\d/.test(ch) ? size * 0.56 : /[.,]/.test(ch) ? size * 0.28 : size * 0.72), 0);
}

function odometer(id, text, x, y, size, color, delay) {
  const lh = Math.round(size * 1.2);
  const digitW = size * 0.56;
  let cursor = x;
  let cols = '';
  let index = 0;
  const digits = [...text].filter((ch) => /\d/.test(ch)).length;
  for (const ch of text) {
    if (/\d/.test(ch)) {
      const d = Number(ch);
      const cx = r1(cursor + digitW / 2);
      const final = (10 + d) * lh;
      const dur = (1.3 + (index / Math.max(1, digits - 1)) * 0.6).toFixed(2);
      cols += `<g transform="translate(${cx} 0)"><use xlink:href="#${id}" class="roll" style="transform:translateY(-${final}px);animation-duration:${dur}s;animation-delay:${delay.toFixed(2)}s"/></g>`;
      cursor += digitW;
      index++;
    } else {
      const w = /[.,]/.test(ch) ? size * 0.28 : size * 0.72;
      cols += `<text x="${r1(cursor + w / 2)}" y="${y}" text-anchor="middle">${escapeXml(ch)}</text>`;
      cursor += w;
    }
  }
  let strip = '';
  for (let i = 0; i < 20; i++) strip += `<tspan x="0" y="${y + i * lh}">${i % 10}</tspan>`;
  return {
    width: cursor - x,
    defs: `<clipPath id="${id}c"><rect x="${r1(x - 4)}" y="${r1(y - size * 0.86)}" width="${r1(cursor - x + 8)}" height="${r1(size * 1.12)}"/></clipPath><text id="${id}" text-anchor="middle">${strip}</text>`,
    svg: `<g class="fade" style="animation-delay:${(delay - 0.25).toFixed(2)}s" clip-path="url(#${id}c)" fill="${color}" font-family="${SERIF}" font-size="${size}">${cols}</g>`,
  };
}

// ---------------------------------------------------------------------------
// 1. Hero — the report cover
// ---------------------------------------------------------------------------

export function heroSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const role = roleLine(opts.title, opts.organisation, ' · ');
  const L = 56;
  const colW = 548;

  // Name: one or two lines, as large as fits.
  const lines = splitName(name, 15);
  const nameSize = Math.min(...lines.map((line) => fitSize(line, colW, lines.length > 1 ? 70 : 80, 34, 'serif')));
  const nameTop = Math.round(140 + nameSize * 0.9);
  const nameLines = lines
    .map((line, i) => {
      const y = nameTop + i * Math.round(nameSize * 1.04);
      return `<clipPath id="nl${i}"><rect x="${L - 6}" y="${r1(y - nameSize)}" width="${colW + 30}" height="${r1(nameSize * 1.28)}"/></clipPath>
  <g clip-path="url(#nl${i})"><text class="curtain" style="animation-delay:${(0.55 + i * 0.14).toFixed(2)}s;--d:${Math.round(nameSize * 1.3)}px" x="${L - 3}" y="${y}" font-family="${SERIF}" font-size="${nameSize}" fill="${c.ink}"${fitAttrs(line, nameSize, colW, 'serif')}>${escapeXml(line)}</text></g>`;
    })
    .join('\n  ');
  const afterName = nameTop + (lines.length - 1) * Math.round(nameSize * 1.04);

  const headline = wrap(profile.headline, 50, lines.length > 1 ? 2 : 3);
  const headSvg = headline
    .map((line, i) => `<text x="${L}" y="${afterName + 50 + i * 28}" font-family="${SERIF}" font-style="italic" font-size="20" fill="${c.muted}">${escapeXml(line)}</text>`)
    .join('');

  // Key figures.
  const figures = [
    ['CONTRIBUTIONS', n.total],
    ['ACTIVE DAYS', n.active],
    ['STARS', n.stars],
    ['FOLLOWERS', n.followers],
  ];
  const figDefs = [];
  const texts = figures.map(([, v]) => figureText(v));
  let figSize = 34;
  const span = (size) => texts.reduce((sum, t) => sum + Math.max(134, odometerWidth(t, size) + 26), 0);
  while (span(figSize) > colW && figSize > 22) figSize -= 1;
  let fx = L;
  const figSvg = figures
    .map(([label], i) => {
      const x = fx;
      fx += Math.max(134, odometerWidth(texts[i], figSize) + 26);
      const od = odometer(`od${i}`, texts[i], x, 512, figSize, c.ink, 1.25 + i * 0.12);
      figDefs.push(od.defs);
      return `${od.svg}<text class="fade" style="animation-delay:${(1.4 + i * 0.12).toFixed(2)}s" x="${x}" y="538" font-family="${SANS}" font-size="10" font-weight="600" letter-spacing="1.8" fill="${c.muted}">${label}</text>`;
    })
    .join('\n  ');

  // Chart: contributions per month.
  const cx0 = 664;
  const cx1 = 1092;
  const base = 416;
  const top = 196;
  const months = n.months;
  const peak = Math.max(1, ...months.map((m) => m.total));
  const busiest = months.reduce((b, m, i) => (m.total > months[b].total ? i : b), 0);
  const slot = (cx1 - cx0) / Math.max(1, months.length);
  const bw = Math.min(26, slot * 0.62);
  const avg = months.length ? months.reduce((s, m) => s + m.total, 0) / months.length : 0;
  const yOf = (v) => base - ((top - base) * -1 * v) / peak;
  const bars = months
    .map((m, i) => {
      const x = cx0 + slot * i + (slot - bw) / 2;
      const h = Math.max(m.total ? 2 : 0, base - yOf(m.total));
      const hot = i === busiest && m.total > 0;
      const delay = (0.8 + i * 0.07).toFixed(2);
      return `<rect class="bar" style="animation-delay:${delay}s" x="${r1(x)}" y="${r1(base - h)}" width="${r1(bw)}" height="${r1(h)}" fill="${hot ? c.brass : c.bar}" fill-opacity="${hot ? 1 : 0.86}"/>
  <text class="fade" style="animation-delay:${(1.5 + i * 0.07).toFixed(2)}s" x="${r1(x + bw / 2)}" y="${r1(base - h - 8)}" text-anchor="middle" font-family="${SANS}" font-size="10" font-weight="${hot ? 700 : 400}" fill="${hot ? c.brass : c.muted}" stroke="${c.bg}" stroke-width="4" paint-order="stroke">${fmt(m.total)}</text>
  <text x="${r1(x + bw / 2)}" y="${base + 20}" text-anchor="middle" font-family="${SANS}" font-size="10" letter-spacing="1" fill="${hot ? c.brass : c.muted}">${m.label}</text>`;
    })
    .join('\n  ');
  const avgY = r1(yOf(avg));
  const change = n.change;
  const changeText =
    change === null ? '' : `${change >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(change * 100))}%  SECOND HALF VS FIRST`;

  const css = `
.rule{transform-box:fill-box;transform-origin:left center;animation:wipe 1.4s ${EXPO} .1s both}
.vrule{transform-box:fill-box;transform-origin:center top;animation:drop 1.4s ${EXPO} .5s both}
.top{animation:rise 1s ${EXPO} .3s both}
.kick{animation:rise 1s ${EXPO} .45s both}
.curtain{animation:curtain 1.5s ${EXPO} both}
.head{animation:rise 1.2s ${EXPO} 1s both}
.roll{animation-name:roll;animation-timing-function:cubic-bezier(.22,.8,.12,1);animation-fill-mode:both}
.bar{transform-box:fill-box;transform-origin:50% 100%;animation:grow 1.2s ${EXPO} both}
.fade{animation:fade .8s ease-out both}
.avg{transform-box:fill-box;transform-origin:left center;animation:wipe 1.4s ${EXPO} 2.2s both}
.late{animation:fade 1s ease-out 2.6s both}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes drop{from{transform:scaleY(0)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes curtain{from{transform:translateY(var(--d))}}
@keyframes roll{from{transform:translateY(0)}}
@keyframes grow{from{transform:scaleY(0)}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  const outlook = wrap(profile.now, 72, 2);
  const outlookTop = 448 - outlook.length * 19 - 10;
  const outlookSvg = outlook.length
    ? `<g class="late" style="animation-delay:1.9s"><text x="${L}" y="${outlookTop - 4}" font-family="${SANS}" font-size="10" font-weight="600" letter-spacing="2.2" fill="${c.brass}">OUTLOOK</text>${outlook
        .map((line, i) => `<text x="${L}" y="${outlookTop + 18 + i * 19}" font-family="${SANS}" font-size="13" fill="${c.ink}">${escapeXml(line)}</text>`)
        .join('')}</g>`
    : '';
  const kicker = (role || `Year in review · ${n.years} ${n.years === 1 ? 'year' : 'years'} on GitHub`).toUpperCase();
  const dateRange = n.from ? `${formatDate(n.from)} – ${formatDate(n.to)}` : '';
  const right = [profile.location, `@${profile.login}`].filter(Boolean).join('  ·  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Annual report cover for ${name}${role ? `, ${role}` : ''}. ${fmt(n.total)} contributions, ${fmt(n.active)} active days, ${fmt(n.stars)} stars, ${fmt(n.followers)} followers. Busiest month ${months[busiest]?.label || ''}.`
  )}">
<style>${css}</style>
<defs>${figDefs.join('')}</defs>
<rect width="${W}" height="${H}" rx="14" fill="${c.bg}"/>
<g class="top" font-family="${SANS}" font-size="12" letter-spacing="3.5">
  <text x="${L}" y="52" font-weight="700" fill="${c.ink}">ANNUAL REPORT <tspan fill="${c.brass}">${year()}</tspan></text>
  <text x="${W - L}" y="52" text-anchor="end" fill="${c.muted}" letter-spacing="1.5">${escapeXml(right)}</text>
</g>
<rect class="rule" x="${L}" y="68" width="${W - L * 2}" height="1.5" fill="${c.ink}"/>
<rect class="vrule" x="${cx0 - 36}" y="104" width="1" height="${base - 104 + 24}" fill="${c.rule}"/>
<text class="kick" x="${L}" y="116" font-family="${SANS}" font-size="12.5" font-weight="600" letter-spacing="2.6" fill="${c.brass}"${fitAttrs(kicker, 12.5 * 1.25, colW, 'sans')}>${escapeXml(kicker)}</text>
${nameLines}
<g class="head">${headSvg}</g>
${outlookSvg}
<rect class="rule" style="animation-delay:1.1s" x="${L}" y="458" width="${colW}" height="1" fill="${c.rule}"/>
${figSvg}
<g class="top" style="animation-delay:.7s" font-family="${SANS}">
  <text x="${cx0}" y="128" font-size="11" font-weight="600" letter-spacing="2.4" fill="${c.ink}">CONTRIBUTIONS BY MONTH</text>
  <text x="${cx0}" y="148" font-size="11" letter-spacing="0.6" fill="${c.muted}">Last twelve months${n.from ? `, ${formatDate(n.from, 'short')} – ${formatDate(n.to, 'short')}` : ''}</text>
  ${changeText ? `<text x="1144" y="128" text-anchor="end" font-size="11" font-weight="600" letter-spacing="1.6" fill="${c.brass}">${changeText}</text>` : ''}
</g>
<rect x="${cx0}" y="${base}" width="${1144 - cx0}" height="1" fill="${c.ink}"/>
${n.total > 0 ? bars : `<text x="${(cx0 + cx1) / 2}" y="${base - 80}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="18" fill="${c.muted}">No contributions in the last twelve months.</text>`}
${avg > 0 ? `<line class="avg" x1="${cx0}" y1="${avgY}" x2="1112" y2="${avgY}" stroke="${c.brass}" stroke-width="1.2" stroke-dasharray="2 4"/>
<g class="late" font-family="${SANS}" fill="${c.brass}"><text x="1144" y="${r1(avgY - 4)}" text-anchor="end" font-size="9" letter-spacing="1.2">AVG</text><text x="1144" y="${r1(avgY + 11)}" text-anchor="end" font-size="11" font-weight="700">${fmt(avg)}</text></g>` : ''}
${n.best ? `<text class="late" x="${cx0}" y="${base + 64}" font-family="${SERIF}" font-style="italic" font-size="15" fill="${c.muted}">Busiest day: ${escapeXml(formatDate(n.best.date))}, ${fmt(n.best.count)} contributions. Longest streak: ${n.streak} ${n.streak === 1 ? 'day' : 'days'}.</text>` : ''}
<rect x="${L}" y="${H - 44}" width="${W - L * 2}" height="1" fill="${c.faint}"/>
<g class="late" font-family="${SANS}" font-size="10.5" letter-spacing="0.8" fill="${c.muted}">
  <text x="${L}" y="${H - 22}">Prepared from public GitHub activity${dateRange ? `, ${escapeXml(dateRange)}` : ''}</text>
  <text x="${W - L}" y="${H - 22}" text-anchor="end">github.com/${escapeXml(profile.login)}</text>
</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Key figures — the table and the language portfolio
// ---------------------------------------------------------------------------

export function figuresSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 470;
  const n = proNumbers(profile);
  const L = 56;
  const tableR = 640;

  const rows = [
    ['Contributions', fmt(n.total), 'last 12 months'],
    ['Active days', `${fmt(n.active)}`, `of ${n.days.length || 365}`],
    ['Average per active day', n.perActive ? n.perActive.toFixed(1) : '0', ''],
    ['Longest streak', `${fmt(n.streak)} ${n.streak === 1 ? 'day' : 'days'}`, 'in a row'],
    ['Busiest day', n.best ? fmt(n.best.count) : '—', n.best ? formatDate(n.best.date) : ''],
    ['Stars earned', fmt(n.stars), 'public repositories'],
    ['Followers', fmt(n.followers), ''],
    ['On GitHub since', String(n.since), `${n.years} ${n.years === 1 ? 'year' : 'years'}`],
  ];
  const rowH = 36;
  const y0 = 152;
  const table = rows
    .map(([label, value, note], i) => {
      const y = y0 + i * rowH;
      const d = (0.35 + i * 0.07).toFixed(2);
      return `<g class="row" style="animation-delay:${d}s">
  <text x="${L}" y="${y}" font-family="${SANS}" font-size="14.5" fill="${c.ink}">${label}</text>
  ${note ? `<text x="${tableR - 150}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="11.5" fill="${c.muted}">${escapeXml(note)}</text>` : ''}
  <text x="${tableR}" y="${y}" text-anchor="end" font-family="${SERIF}" font-size="20" fill="${c.ink}">${escapeXml(value)}</text>
</g>
<rect class="rule" style="animation-delay:${d}s" x="${L}" y="${y + 13}" width="${tableR - L}" height="1" fill="${c.faint}"/>`;
    })
    .join('\n');

  // Donut.
  let langs = n.languages;
  const rest = 1 - langs.reduce((s, l) => s + l.share, 0);
  if (rest > 0.01) langs = [...langs, { name: 'Other', share: rest }];
  const dx = 862;
  const dy = 290;
  const R = 104;
  let start = 0;
  const gap = langs.length > 1 ? 0.6 : 0;
  const segs = langs
    .map((l, i) => {
      const len = Math.max(0.4, l.share * 100 - gap);
      const color = i === 0 ? c.brass : c.bar;
      const op = i === 0 ? 1 : c.shades[i];
      const seg = `<circle class="seg" style="stroke-dasharray:${r1(len)} 100;stroke-dashoffset:${r1(-start)};animation-delay:${(0.7 + i * 0.16).toFixed(2)}s" cx="${dx}" cy="${dy}" r="${R}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="30" pathLength="100" transform="rotate(-90 ${dx} ${dy})"/>`;
      start += l.share * 100;
      return seg;
    })
    .join('');
  const legend = langs
    .map((l, i) => {
      const y = 214 + i * 30;
      return `<g class="row" style="animation-delay:${(0.9 + i * 0.1).toFixed(2)}s">
  <rect x="1012" y="${y - 10}" width="12" height="12" fill="${i === 0 ? c.brass : c.bar}" fill-opacity="${i === 0 ? 1 : c.shades[i]}"/>
  <text x="1032" y="${y}" font-family="${SANS}" font-size="13" fill="${c.ink}"${fitAttrs(l.name, 13, 72, 'sans')}>${escapeXml(l.name)}</text>
  <text x="1144" y="${y}" text-anchor="end" font-family="${SERIF}" font-size="15" fill="${c.ink}">${Math.round(l.share * 100)}%</text>
</g>`;
    })
    .join('\n');
  const top = langs[0];

  const css = `
.rule{transform-box:fill-box;transform-origin:left center;animation:wipe 1.2s ${EXPO} both}
.head{animation:rise 1s ${EXPO} .1s both}
.row{animation:rise .9s ${EXPO} both}
.seg{animation:draw 1.2s cubic-bezier(.45,0,.2,1) both}
.mid{animation:fade 1s ease-out 1.6s both}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes draw{from{stroke-dasharray:0 100}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Key figures: ${fmt(n.total)} contributions, ${n.active} active days, longest streak ${n.streak} days, ${fmt(n.stars)} stars, ${fmt(n.followers)} followers, on GitHub since ${n.since}.${
      langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''
    }`
  )}">
<style>${css}</style>
<rect width="${W}" height="${H}" rx="14" fill="${c.bg}"/>
<g class="head">
  <text x="${L}" y="70" font-family="${SERIF}" font-size="30" fill="${c.ink}">Key figures</text>
  <text x="${L}" y="96" font-family="${SANS}" font-size="11" letter-spacing="2.2" fill="${c.muted}">${n.to ? `FOR THE TWELVE MONTHS TO ${escapeXml(formatDate(n.to).toUpperCase())}` : 'FOR THE LAST TWELVE MONTHS'}</text>
  <text x="${W - L}" y="70" text-anchor="end" font-family="${SERIF}" font-size="30" fill="${c.ink}">Portfolio</text>
  <text x="${W - L}" y="96" text-anchor="end" font-family="${SANS}" font-size="11" letter-spacing="2.2" fill="${c.muted}">LANGUAGE SHARE BY BYTES</text>
</g>
<rect class="rule" x="${L}" y="114" width="${W - L * 2}" height="1.5" fill="${c.ink}"/>
${table}
${
  langs.length
    ? `<circle cx="${dx}" cy="${dy}" r="${R}" fill="none" stroke="${c.faint}" stroke-width="30"/>
${segs}
<g class="mid" text-anchor="middle">
  <text x="${dx}" y="${dy + 6}" font-family="${SERIF}" font-size="34" fill="${c.ink}">${Math.round(top.share * 100)}%</text>
  <text x="${dx}" y="${dy + 30}" font-family="${SANS}" font-size="11" letter-spacing="1.6" fill="${c.muted}"${fitAttrs(top.name.toUpperCase(), 11, 130, 'sans')}>${escapeXml(top.name.toUpperCase())}</text>
</g>
${legend}`
    : `<text x="${dx + 140}" y="${dy}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="18" fill="${c.muted}">No language data yet.</text>`
}
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Closing note — sign-off, swash and monogram
// ---------------------------------------------------------------------------

export function closingSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 230;
  const L = 56;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const role = roleLine(opts.title, opts.organisation);
  const signSize = fitSize(opts.signoff, 840, 32, 20, 'serif');
  const nameW = Math.min(620, textWidth(name, 22, 'serif'));
  const sx = L;
  const sy = 166;
  const ex = sx + nameW + 60;
  const swash = `M${sx} ${sy} C ${r1(sx + nameW * 0.3)} ${sy + 9}, ${r1(sx + nameW * 0.7)} ${sy - 3}, ${r1(ex - 30)} ${sy - 1} S ${r1(ex)} ${sy - 12}, ${r1(ex - 14)} ${sy - 16}`;
  const mono = initials(name);

  const css = `
.rule{transform-box:fill-box;transform-origin:left center;animation:wipe 1.3s ${EXPO} .1s both}
.a{animation:rise 1.1s ${EXPO} .35s both}
.b{animation:rise 1.1s ${EXPO} .6s both}
.swash{animation:pen 1.6s cubic-bezier(.5,0,.2,1) 1s both}
.box{animation:pen 1.8s cubic-bezier(.45,0,.2,1) .5s both}
.mono{animation:fade 1.2s ease-out 1.3s both}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes pen{from{stroke-dashoffset:1}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`Closing note: ${opts.signoff} ${name}${role ? `, ${role}` : ''}.`)}">
<style>${css}</style>
<rect width="${W}" height="${H}" rx="14" fill="${c.bg}"/>
<rect class="rule" x="${L}" y="34" width="${W - L * 2}" height="1.5" fill="${c.ink}"/>
<text class="a" x="${L}" y="70" font-family="${SANS}" font-size="11" font-weight="600" letter-spacing="2.6" fill="${c.brass}">CLOSING NOTE</text>
<text class="a" x="${L}" y="116" font-family="${SERIF}" font-style="italic" font-size="${signSize}" fill="${c.ink}"${fitAttrs(opts.signoff, signSize, 840, 'serif')}>${escapeXml(opts.signoff)}</text>
<text class="b" x="${L}" y="158" font-family="${SERIF}" font-size="22" fill="${c.ink}"${fitAttrs(name, 22, 620, 'serif')}>${escapeXml(name)}</text>
<path class="swash" d="${swash}" fill="none" stroke="${c.brass}" stroke-width="1.6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
${role ? `<text class="b" x="${L}" y="196" font-family="${SANS}" font-size="12" letter-spacing="1.2" fill="${c.muted}"${fitAttrs(role, 12, 700, 'sans')}>${escapeXml(role)}</text>` : ''}
<path class="box" d="M1024 58H1144V178H1024Z" fill="none" stroke="${c.brass}" stroke-width="1.5" pathLength="1" stroke-dasharray="1 1"/>
<g class="mono" text-anchor="middle">
  <text x="1084" y="${mono.length > 1 ? 133 : 136}" font-family="${SERIF}" font-size="${mono.length > 1 ? 46 : 54}" fill="${c.brass}">${escapeXml(mono)}</text>
  <text x="1084" y="204" font-family="${SANS}" font-size="10" letter-spacing="2.4" fill="${c.muted}">SINCE ${n.since}</text>
</g>
</svg>`;
}
