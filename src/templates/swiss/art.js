// Swiss — an International Typographic Style poster.
//
// A strict twelve-column grid, one red, flush-left bold type and an oversized numeral: the year's
// contributions, set as the poster's headline figure. A red disc sits behind it with three thin arcs
// turning around it, and the year runs along the foot as 52 weekly bars, the busiest in red.
// Index: the year's numbers as a numbered list, languages as bars and the twelve months as columns.
// Closing: the sign-off set large, with the disc cropped by the edge.
//
// One loop (the arcs). Everything else plays once and rests on the final frame.

import { EXPO, REDUCED, SANS, compact, escapeXml, fitAttrs, fitSize, fmt, formatDate, proNumbers, r1, roleFromHeadline, roleLine, textWidth, wrap } from '../common';

export const THEMES = {
  light: { paper: '#f2f0ea', ink: '#111111', red: '#e2231a', redText: '#c81e15', grey: '#5f5f5f', rule: '#d6d2c8', faint: '#e6e2d9' },
  dark: { paper: '#121212', ink: '#f2f0ea', red: '#ff4436', redText: '#ff4436', grey: '#a3a3a3', rule: '#2c2c2c', faint: '#1d1d1d' },
};

const M = 48;
const GUT = 16;
const COL = (1200 - M * 2 - GUT * 11) / 12;
export const colX = (i) => r1(M + i * (COL + GUT));
const span = (n) => n * COL + (n - 1) * GUT;

function gridLines(c, H, cls = 'gl') {
  let out = '';
  for (let i = 0; i <= 12; i++) {
    const x = i === 12 ? 1200 - M : colX(i);
    out += `<rect class="${cls}" style="animation-delay:${(i * 0.03).toFixed(2)}s" x="${r1(x - 0.5)}" y="0" width="1" height="${H}" fill="${c.faint}"/>`;
    if (i > 0 && i < 12) out += `<rect class="${cls}" style="animation-delay:${(i * 0.03).toFixed(2)}s" x="${r1(colX(i) - GUT - 0.5)}" y="0" width="1" height="${H}" fill="${c.faint}"/>`;
  }
  return out;
}

export const bigNumber = (v) => (v >= 100000 ? compact(v) : String(Math.round(v)));

// ---------------------------------------------------------------------------
// 1. Hero — the poster
// ---------------------------------------------------------------------------

export function heroSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const role = roleLine(opts.title, opts.organisation) || roleFromHeadline(profile.headline, 40);
  // When the role came from the headline's first sentence, show the rest of the headline under it.
  const fromHeadline = !roleLine(opts.title, opts.organisation) && role;
  const headline = fromHeadline ? String(profile.headline || '').slice(String(profile.headline).indexOf(role) + role.length).replace(/^[.!?\s]+/, '') : profile.headline;

  // Name: one word per line, up to three lines, as big as the left half allows.
  let words = String(name).split(/\s+/).filter(Boolean);
  if (words.length > 3) words = [words[0], words.slice(1, -1).join(' '), words[words.length - 1]];
  const nameW = span(6);
  const size = Math.min(92, ...words.map((w) => fitSize(w, nameW, 92, 30, 'sansBold')), words.length > 2 ? 74 : 92);
  const accented = words.slice(1).some((w) => /[À-ÝĀ-ž]|İ/.test(w));
  const lead = Math.round(size * (accented ? 1.1 : 0.96));
  const nameTop = 52;
  const nameSvg = words
    .map((w, i) => {
      const y = r1(nameTop + size * 0.78 + i * lead);
      return `<clipPath id="nc${i}"><rect x="${M - 4}" y="${r1(y - size * 0.86)}" width="${nameW + 40}" height="${r1(size * 1.1)}"/></clipPath><g clip-path="url(#nc${i})"><text class="slide" style="animation-delay:${(0.4 + i * 0.12).toFixed(2)}s;--d:${-Math.round(Math.min(nameW, textWidth(w, size, 'sansBold')) + 20)}px" x="${M - 3}" y="${y}" font-family="${SANS}" font-weight="700" font-size="${size}" letter-spacing="${r1(-size * 0.025)}" fill="${c.ink}"${fitAttrs(w, size, nameW, 'sansBold')}>${escapeXml(w)}</text></g>`;
    })
    .join('');
  const nameBottom = nameTop + size * 0.78 + (words.length - 1) * lead;
  const roleY = r1(nameBottom + 44);
  const headLines = wrap(headline, 46, 3);

  // The figure.
  const figure = bigNumber(n.total);
  const fs = Math.min(230, fitSize(figure, span(6), 230, 90, 'sansBold'));
  const adv = fs * 0.54;
  const fx1 = 1200 - M;
  const fy = 372;
  const fx0 = fx1 - adv * figure.length;
  const digits = [...figure]
    .map(
      (d, i) =>
        `<text class="up" style="animation-delay:${(0.75 + i * 0.09).toFixed(2)}s;--d:${Math.round(fs)}px" x="${r1(fx0 + adv * i + adv / 2)}" y="${fy}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${fs}" fill="${c.ink}">${escapeXml(d)}</text>`
    )
    .join('');
  const discR = 132;
  const dcx = r1(Math.min(1200 - M - discR * 0.55, Math.max(colX(7) + discR, fx0 + adv * 0.4)));
  const dcy = 196;
  const arcs = [150, 166, 182]
    .map((r, i) => {
      const a0 = (-60 + i * 70) * (Math.PI / 180);
      const a1 = a0 + (1.6 - i * 0.3);
      const p = (a) => `${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r)}`;
      return `<g class="turn t${i}"><path class="arc" style="animation-delay:${(1 + i * 0.15).toFixed(2)}s" d="M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}" fill="none" stroke="${c.ink}" stroke-width="${i === 1 ? 3 : 1.2}" pathLength="1" stroke-dasharray="1 1"/></g>`;
    })
    .join('');

  // Weekly bars along the foot.
  const weeks = n.weeks;
  const bx0 = M;
  const bx1 = 1200 - M;
  const base = 540;
  const maxH = 86;
  const peak = Math.max(1, ...weeks.map((w) => w.total));
  const busiest = weeks.reduce((b, w, i) => (w.total > weeks[b].total ? i : b), 0);
  const slot = (bx1 - bx0) / Math.max(1, weeks.length);
  const bw = Math.max(2, slot - 6);
  let bars = '';
  let marks = '';
  let lastMonth = '';
  weeks.forEach((w, i) => {
    const h = w.total ? Math.max(2, (w.total / peak) * maxH) : 0;
    const x = bx0 + slot * i + (slot - bw) / 2;
    if (h) bars += `<rect class="bar" style="animation-delay:${(1.2 + i * 0.018).toFixed(3)}s" x="${r1(x)}" y="${r1(base - h)}" width="${r1(bw)}" height="${r1(h)}" fill="${i === busiest ? c.red : c.ink}"/>`;
    const m = w.start.slice(5, 7);
    if (m !== lastMonth) {
      if (lastMonth && x > M + 92) marks += `<text x="${r1(x)}" y="${base + 22}" font-family="${SANS}" font-size="11" font-weight="700" fill="${c.grey}">${m}</text>`;
      lastMonth = m;
    }
  });

  const css = `
.gl{transform-box:fill-box;transform-origin:center top;animation:drop 1.2s ${EXPO} both}
.slide{animation:slide 1.3s ${EXPO} both}
.up{animation:up 1.2s ${EXPO} both}
.disc{transform-box:fill-box;transform-origin:center;animation:disc 1.4s ${EXPO} .3s both}
.arc{animation:pen 1.4s ${EXPO} both}
.turn{animation:turn linear infinite}
.t0{animation-duration:48s}.t1{animation-duration:72s;animation-direction:reverse}.t2{animation-duration:110s}
.rule{transform-box:fill-box;transform-origin:left center;animation:wipe 1.2s ${EXPO} .9s both}
.bar{transform-box:fill-box;transform-origin:50% 100%;animation:grow .9s ${EXPO} both}
.txt{animation:fade 1s ease-out 1.1s both}
.late{animation:fade 1s ease-out 2s both}
@keyframes drop{from{transform:scaleY(0)}}
@keyframes slide{from{transform:translateX(var(--d))}}
@keyframes up{from{transform:translateY(var(--d))}}
@keyframes disc{from{transform:scale(0)}}
@keyframes pen{from{stroke-dashoffset:1}}
@keyframes turn{to{transform:rotate(360deg)}}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes grow{from{transform:scaleY(0)}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `A Swiss-style typographic poster: ${name}${role ? `, ${role}` : ''}, set in bold on a twelve-column grid beside a red disc and the figure ${fmt(n.total)}, the contributions of the last twelve months, with the year below as 52 weekly bars.`
  )}">
<style>${css}</style>
<defs><clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath><clipPath id="fig"><rect x="${r1(fx0 - 20)}" y="${r1(fy - fs * 0.8)}" width="${r1(fx1 - fx0 + 40)}" height="${r1(fs * 0.84)}"/></clipPath></defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" rx="14" fill="${c.paper}"/>
${gridLines(c, H)}
<circle class="disc" cx="${dcx}" cy="${dcy}" r="${discR}" fill="${c.red}"/>
<g transform="translate(${dcx} ${dcy})">${arcs}</g>
<g clip-path="url(#fig)">${digits}</g>
<text class="txt" x="${colX(7)}" y="${fy + 34}" font-family="${SANS}" font-size="14" font-weight="700" fill="${c.ink}">${fmt(n.total)} contributions</text>
<text class="txt" x="${colX(7)}" y="${fy + 54}" font-family="${SANS}" font-size="14" fill="${c.grey}">${n.from ? `${escapeXml(formatDate(n.from))} – ${escapeXml(formatDate(n.to))}` : 'The last twelve months'}</text>
<text class="txt" x="${colX(10)}" y="${fy + 34}" font-family="${SANS}" font-size="14" font-weight="700" fill="${c.ink}">${fmt(n.active)} active days</text>
<text class="txt" x="${colX(10)}" y="${fy + 54}" font-family="${SANS}" font-size="14" fill="${c.grey}">Since ${n.since}</text>
${nameSvg}
${role ? `<text class="txt" x="${M}" y="${roleY}" font-family="${SANS}" font-size="18" font-weight="700" fill="${c.redText}"${fitAttrs(role, 18, span(6), 'sansBold')}>${escapeXml(role)}</text>` : ''}
${headLines.map((l, i) => `<text class="txt" x="${M}" y="${r1(roleY + (role ? 28 : 0) + i * 22)}" font-family="${SANS}" font-size="16" fill="${c.ink}">${escapeXml(l)}</text>`).join('')}
<rect class="rule" x="${M}" y="436" width="${1200 - M * 2}" height="2" fill="${c.ink}"/>
<text class="late" x="${M}" y="${base + 22}" font-family="${SANS}" font-size="11" font-weight="700" letter-spacing="0.4" fill="${c.ink}">52 WEEKS</text>
${bars}
<g class="late">${marks}</g>
</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Index — numbers, languages, months
// ---------------------------------------------------------------------------

export function indexSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 470;
  const n = proNumbers(profile);

  const facts = [
    ['Contributions', fmt(n.total)],
    ['Active days', fmt(n.active)],
    ['Longest streak', `${n.streak} ${n.streak === 1 ? 'day' : 'days'}`],
    ['Best day', n.best ? fmt(n.best.count) : '0'],
    ['Stars', fmt(n.stars)],
    ['Followers', fmt(n.followers)],
    ['On GitHub since', String(n.since)],
  ];
  const fx1 = colX(3) + COL;
  const factSvg = facts
    .map(([label, value], i) => {
      const y = 152 + i * 42;
      return `<g class="row" style="animation-delay:${(0.3 + i * 0.07).toFixed(2)}s"><text x="${M}" y="${y}" font-family="${SANS}" font-size="12" font-weight="700" fill="${c.redText}">${String(i + 1).padStart(2, '0')}</text>
<text x="${M + 30}" y="${y}" font-family="${SANS}" font-size="15" fill="${c.ink}">${label}</text>
<text x="${r1(fx1)}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="20" font-weight="700" fill="${c.ink}">${escapeXml(value)}</text></g>
<rect class="rule" style="animation-delay:${(0.3 + i * 0.07).toFixed(2)}s" x="${M}" y="${y + 15}" width="${r1(fx1 - M)}" height="1" fill="${c.rule}"/>`;
    })
    .join('\n');

  // Languages.
  const lx0 = colX(4);
  const lx1 = colX(7) + COL;
  const langs = n.languages;
  const langSvg = langs.length
    ? langs
        .map((l, i) => {
          const y = 152 + i * 58;
          const w = Math.max(3, l.share * (lx1 - lx0));
          return `<g class="row" style="animation-delay:${(0.5 + i * 0.09).toFixed(2)}s"><text x="${lx0}" y="${y}" font-family="${SANS}" font-size="15" fill="${c.ink}"${fitAttrs(l.name, 15, 200, 'sans')}>${escapeXml(l.name)}</text><text x="${r1(lx1)}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="20" font-weight="700" fill="${c.ink}">${Math.round(l.share * 100)}%</text></g>
<rect class="hbar" style="animation-delay:${(0.6 + i * 0.09).toFixed(2)}s" x="${lx0}" y="${y + 12}" width="${r1(w)}" height="14" fill="${i ? c.ink : c.red}"/>`;
        })
        .join('\n')
    : `<text x="${lx0}" y="152" font-family="${SANS}" font-size="15" fill="${c.grey}">No language data yet.</text>`;

  // Months.
  const mx0 = colX(8);
  const mx1 = 1200 - M;
  const months = n.months;
  const peak = Math.max(1, ...months.map((m) => m.total));
  const busiest = months.reduce((b, m, i) => (m.total > months[b].total ? i : b), 0);
  const slot = (mx1 - mx0) / Math.max(1, months.length);
  const mBase = 412;
  const mH = 250;
  const monthSvg = months
    .map((m, i) => {
      const h = m.total ? Math.max(2, (m.total / peak) * mH) : 0;
      const x = mx0 + slot * i;
      const hot = i === busiest && m.total > 0;
      return `${h ? `<rect class="bar" style="animation-delay:${(0.7 + i * 0.05).toFixed(2)}s" x="${r1(x + 2)}" y="${r1(mBase - h)}" width="${r1(slot - 6)}" height="${r1(h)}" fill="${hot ? c.red : c.ink}"/>` : ''}<text x="${r1(x + 2)}" y="${mBase + 20}" font-family="${SANS}" font-size="11" font-weight="700" fill="${hot ? c.redText : c.grey}">${m.key.slice(5, 7)}</text>`;
    })
    .join('');

  const css = `
.gl{transform-box:fill-box;transform-origin:center top;animation:drop 1.2s ${EXPO} both}
.hdr{animation:slide 1.1s ${EXPO} .1s both}
.row{animation:rise .9s ${EXPO} both}
.rule{transform-box:fill-box;transform-origin:left center;animation:wipe 1s ${EXPO} both}
.hbar{transform-box:fill-box;transform-origin:left center;animation:wipe 1.1s ${EXPO} both}
.bar{transform-box:fill-box;transform-origin:50% 100%;animation:grow 1s ${EXPO} both}
@keyframes drop{from{transform:scaleY(0)}}
@keyframes slide{from{opacity:0;transform:translateX(-24px)}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes wipe{from{transform:scaleX(0)}}
@keyframes grow{from{transform:scaleY(0)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Index of the year: ${facts.map(([l, v]) => `${l} ${v}`).join(', ')}.${langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''} Contributions per month: ${months.map((m) => `${m.label} ${m.total}`).join(', ')}.`
  )}">
<style>${css}</style>
<rect width="${W}" height="${H}" rx="14" fill="${c.paper}"/>
${gridLines(c, H)}
<g class="hdr" font-family="${SANS}" font-weight="700">
  <text x="${M}" y="76" font-size="40" letter-spacing="-1" fill="${c.ink}">Index</text>
  <text x="${lx0}" y="76" font-size="14" fill="${c.ink}">Languages</text>
  <text x="${mx0}" y="76" font-size="14" fill="${c.ink}">Months</text>
  <text x="${lx0}" y="96" font-size="14" font-weight="400" fill="${c.grey}">Share by bytes</text>
  <text x="${mx0}" y="96" font-size="14" font-weight="400" fill="${c.grey}">Contributions</text>
</g>
<rect class="rule" x="${M}" y="112" width="${1200 - M * 2}" height="2" fill="${c.ink}"/>
${factSvg}
${langSvg}
${monthSvg}
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Closing — the sign-off, large
// ---------------------------------------------------------------------------

export function closingSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 240;
  const name = profile.name || profile.login;
  const role = roleLine(opts.title, opts.organisation);
  const size = fitSize(opts.signoff, span(9), 72, 30, 'sansBold');

  const css = `
.gl{transform-box:fill-box;transform-origin:center top;animation:drop 1.2s ${EXPO} both}
.disc{transform-box:fill-box;transform-origin:center;animation:disc 1.4s ${EXPO} .2s both}
.slide{animation:slide 1.3s ${EXPO} .45s both}
.txt{animation:fade 1s ease-out 1s both}
@keyframes drop{from{transform:scaleY(0)}}
@keyframes disc{from{transform:scale(0)}}
@keyframes slide{from{transform:translateX(-${span(9)}px)}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`${opts.signoff} ${name}${role ? `, ${role}` : ''}.`)}">
<style>${css}</style>
<defs><clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath><clipPath id="line"><rect x="${M - 4}" y="0" width="${span(10)}" height="${H}"/></clipPath></defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${c.paper}"/>
${gridLines(c, H)}
<circle class="disc" cx="${W - 70}" cy="${H / 2}" r="150" fill="${c.red}"/>
<g clip-path="url(#line)"><text class="slide" x="${M - 3}" y="${r1(90 + size * 0.36)}" font-family="${SANS}" font-weight="700" font-size="${size}" letter-spacing="${r1(-size * 0.025)}" fill="${c.ink}"${fitAttrs(opts.signoff, size, span(9), 'sansBold')}>${escapeXml(opts.signoff)}</text></g>
<g class="txt" font-family="${SANS}" font-size="15">
  <text x="${M}" y="${H - 44}" font-weight="700" fill="${c.ink}"${fitAttrs(name, 15, span(3), 'sansBold')}>${escapeXml(name)}</text>
  ${role ? `<text x="${colX(3)}" y="${H - 44}" fill="${c.ink}"${fitAttrs(role, 15, span(4), 'sans')}>${escapeXml(role)}</text>` : ''}
  <text x="${colX(7)}" y="${H - 44}" fill="${c.grey}">github.com/${escapeXml(profile.login)}</text>
</g>
</g>
</svg>`;
}
