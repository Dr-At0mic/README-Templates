// Intaglio — an engraved certificate, in the manner of a share certificate or a banknote.
//
// Hero: a guilloché medallion whose outer ring swells in busier months (twelve months around the dial,
// clockwise from the top), the monogram at its centre, a guilloché frame, the name in hatched engraved
// capitals, a citation built from the year's numbers, and a vermilion seal that stamps down.
// Coupons: the year as a sheet of twelve bond coupons, one per month, the best month stamped.
// Counterfoil: the stub with its serial number, the sign-off in engraved capitals, and the seal.
//
// Each guilloché ring is one path, repeated with <use> at small rotations, so the moiré costs one path's
// bytes. Loops (hero only): the outer ring turns very slowly, and a sheen crosses the seal.

import {
  EXPO,
  REDUCED,
  ROMAN,
  SANS,
  escapeXml,
  fitAttrs,
  fitSize,
  fmt,
  formatDate,
  initials,
  proNumbers,
  r1,
  r2,
  roleLine,
  splitName,
  wrap,
} from '../common';

export const THEMES = {
  light: {
    paper: '#f3eedf',
    ink: '#1c4433',
    line: '#2c6a51',
    lineOp: 0.55,
    muted: '#4c5f55',
    faint: '#cdd5c4',
    seal: '#b1372a',
    onSeal: '#f6eedd',
  },
  dark: {
    paper: '#0a1210',
    ink: '#e2d1a0',
    line: '#bca772',
    lineOp: 0.5,
    muted: '#a4a28a',
    faint: '#24342d',
    seal: '#d9584a',
    onSeal: '#0d1512',
  },
};

const TAU = Math.PI * 2;

export function serialNumber(profile) {
  const n = proNumbers(profile);
  return `${initials(profile.name || profile.login)}-${n.since}-${String(n.total).padStart(6, '0')}`;
}

// Smooth monthly profile, 0..1, read at an angle (twelve months clockwise from the top).
function profileAt(values, theta) {
  if (!values.length) return 0.5;
  const pos = ((theta / TAU) * values.length) % values.length;
  const i = Math.floor(pos);
  const f = pos - i;
  const a = values[i];
  const b = values[(i + 1) % values.length];
  const s = (1 - Math.cos(f * Math.PI)) / 2;
  return a + (b - a) * s;
}

function ringPath(R0, a, lobes, b, values, a2 = 0, lobes2 = 0) {
  const samples = lobes * 10;
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const th = (i / samples) * TAU;
    const r = R0 + a * Math.sin(lobes * th) + a2 * Math.sin(lobes2 * th) + b * (profileAt(values, th) - 0.5);
    pts.push(`${r1(Math.sin(th) * r)} ${r1(-Math.cos(th) * r)}`);
  }
  return `M${pts.join('L')}Z`;
}

function rosette(id, values, scale = 1, drawDelay = 0.6, stagger = 0.045) {
  const outer = ringPath(150 * scale, 13 * scale, 21, 26 * scale, values);
  const inner = ringPath(104 * scale, 9 * scale, 14, 0, values, 3 * scale, 42);
  const fine = ringPath(126 * scale, 4.5 * scale, 48, 0, values);
  const K1 = 20;
  const K2 = 14;
  const K3 = 6;
  let a = '';
  for (let k = 0; k < K1; k++) a += `<use xlink:href="#${id}o" class="eng" style="animation-delay:${(drawDelay + k * stagger).toFixed(2)}s" transform="rotate(${r1((k * 360) / (21 * K1) * 10) / 10})"/>`;
  let b = '';
  for (let k = 0; k < K2; k++) b += `<use xlink:href="#${id}i" class="eng" style="animation-delay:${(drawDelay + 0.5 + k * stagger).toFixed(2)}s" transform="rotate(${r1(((k * 360) / (14 * K2)) * 10) / 10})"/>`;
  for (let k = 0; k < K3; k++) b += `<use xlink:href="#${id}f" class="eng" style="animation-delay:${(drawDelay + 0.9 + k * stagger * 2).toFixed(2)}s" transform="rotate(${r1(((k * 360) / (48 * K3)) * 10) / 10})"/>`;
  return {
    defs: `<path id="${id}o" d="${outer}" pathLength="1"/><path id="${id}i" d="${inner}" pathLength="1"/><path id="${id}f" d="${fine}" pathLength="1"/>`,
    outer: a,
    inner: b,
  };
}

// Frame band: one wavelength of six phase-shifted waves as a pattern tile.
function bandPattern(id, color, op, ox = 0, oy = 0, vertical = false) {
  const w = 24;
  const h = 22;
  let paths = '';
  for (let k = 0; k < 6; k++) {
    const ph = (k / 6) * w;
    const amp = 7;
    const mid = h / 2;
    // A sine from x=-w..2w approximated with cubic segments, shifted by the phase.
    let d = '';
    for (let x = -w; x < 2 * w; x += w / 2) {
      const x0 = x + ph;
      const s = (Math.round((x + w) / (w / 2)) % 2 === 0 ? 1 : -1) * amp;
      d += `${d ? '' : `M${r1(x0)} ${mid}`}C${r1(x0 + w / 6)} ${r1(mid - s * 1.33)} ${r1(x0 + w / 3)} ${r1(mid - s * 1.33)} ${r1(x0 + w / 2)} ${mid}`;
    }
    paths += `<path d="${d}"/>`;
  }
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="translate(${ox} ${oy})${vertical ? ' rotate(90)' : ''}"><g fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="0.6">${paths}</g></pattern>`;
}

function seal(id, cx, cy, R, c, login, since, mono) {
  let star = '';
  const spikes = 40;
  for (let i = 0; i < spikes * 2; i++) {
    const th = (i / (spikes * 2)) * TAU;
    const r = i % 2 ? R * 0.93 : R;
    star += `${i ? 'L' : 'M'}${r1(Math.sin(th) * r)} ${r1(-Math.cos(th) * r)}`;
  }
  const tr = R * 0.7;
  const text = ringText([`EST. ${since} · @${login.toUpperCase()}`, `ESTABLISHED ${since}`, `EST. ${since}`], TAU * tr, R * 0.17, 1.5);
  return {
    defs: `<path id="${id}t" d="M0 ${-tr}A${tr} ${tr} 0 1 1 0 ${tr}A${tr} ${tr} 0 1 1 0 ${-tr}"/><clipPath id="${id}c"><circle r="${R}"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    svg: `<g transform="translate(${cx} ${cy})"><g class="stamp">
  <path d="${star}Z" fill="${c.seal}"/>
  <circle r="${r1(R * 0.84)}" fill="none" stroke="${c.onSeal}" stroke-width="1.2"/>
  <circle r="${r1(R * 0.56)}" fill="none" stroke="${c.onSeal}" stroke-width="0.8"/>
  <text font-family="${ROMAN}" font-size="${r1(R * 0.17)}" letter-spacing="${text.spacing}" fill="${c.onSeal}"><textPath xlink:href="#${id}t">${escapeXml(text.text)}</textPath></text>
  <text y="${r1(R * 0.17)}" text-anchor="middle" font-family="${ROMAN}" font-size="${r1(R * (mono.length > 1 ? 0.44 : 0.52))}" fill="${c.onSeal}">${escapeXml(mono)}</text>
  <g clip-path="url(#${id}c)"><rect class="sheen" x="${r1(-R * 1.7)}" y="${-R}" width="${r1(R * 0.6)}" height="${R * 2}" fill="url(#${id}g)" transform="skewX(-18)"/></g>
</g></g>`,
  };
}

// Text for a circle: the first candidate that fits, repeated as often as it fits, with letter-spacing that
// spreads it evenly around the whole circle.
function ringText(candidates, circumference, size, spacing) {
  const glyph = size * 0.74;
  const unit = candidates.map((t) => `${t} · `).find((t) => t.length * (glyph + spacing) <= circumference) || `${candidates[candidates.length - 1]} · `;
  const text = unit.repeat(Math.max(1, Math.floor(circumference / (unit.length * (glyph + spacing)))));
  const fill = r2((circumference * 0.985 - text.length * glyph) / text.length);
  return { text, spacing: Math.max(spacing, Math.min(fill, size * 1.2)) };
}

// ---------------------------------------------------------------------------
// 1. Hero — the certificate
// ---------------------------------------------------------------------------

export function heroSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const mono = initials(name);
  const role = roleLine(opts.title, opts.organisation, ', ');
  const peak = Math.max(1, ...n.months.map((m) => m.total));
  const values = n.months.map((m) => m.total / peak);
  const ros = rosette('r', values);
  const mx = 282;
  const my = 300;

  // Certificate text block.
  const bx = 812;
  const nameText = name.toUpperCase();
  const nameLines = splitName(nameText, 20);
  const nameSize = Math.min(...nameLines.map((l) => fitSize(l, 540, nameLines.length > 1 ? 40 : 54, 24, 'romanCaps')));
  const nameSpacing = r1(nameSize * 0.06);
  const nameYs = nameLines.length > 1 ? [250, Math.round(250 + nameSize * 1.12)] : [272];
  const nameBottom = nameYs[nameYs.length - 1];
  const engraved = (cls, paint) =>
    nameLines
      .map((l, i) => `<text class="${cls}" x="${bx}" y="${nameYs[i]}" text-anchor="middle" font-family="${ROMAN}" font-size="${nameSize}" letter-spacing="${nameSpacing}" ${paint}${fitAttrs(l, nameSize * 1.08, 580, 'romanCaps')}>${escapeXml(l)}</text>`)
      .join('');
  const login = `@${profile.login}`;
  const loginSize = fitSize(login, 118, 17, 10, 'roman');
  const citation = wrap(
    n.total > 0
      ? `has made ${fmt(n.total)} contributions on ${fmt(n.active)} days of the past twelve months, with a longest run of ${n.streak} ${n.streak === 1 ? 'day' : 'days'}, and has held a public account in good standing since ${n.since}.`
      : `has held a public account in good standing since ${n.since}.`,
    60,
    3
  );
  const roleY = nameBottom + 38;
  const citeY = role ? roleY + 42 : nameBottom + 58;
  const citeSvg = citation
    .map((line, i) => `<text x="${bx}" y="${citeY + i * 26}" text-anchor="middle" font-family="${ROMAN}" font-size="18" fill="${c.ink}">${escapeXml(line)}</text>`)
    .join('');
  const serial = serialNumber(profile);
  const sl = seal('s', 1036, 488, 54, c, profile.login, n.since, mono);
  const ring = ringText([`${nameText} · EST. ${n.since} · ${fmt(n.total)} CONTRIBUTIONS`, `${mono} · EST. ${n.since} · ${fmt(n.total)} CONTRIBUTIONS`, `EST. ${n.since}`], TAU * 80, 10.5, 1.6);
  const heading = opts.heading.toUpperCase();

  const css = `
.frame{animation:pen 2.2s cubic-bezier(.45,0,.2,1) .1s both}
.hband{transform-box:fill-box;transform-origin:center;animation:wipeX 1.8s ${EXPO} .3s both}
.vband{transform-box:fill-box;transform-origin:center;animation:wipeY 1.8s ${EXPO} .3s both}
.eng{stroke-dasharray:1 1;animation:pen 2.6s cubic-bezier(.45,0,.2,1) both}
.turn{animation:turn 240s linear infinite}
.core{animation:fade 1.2s ease-out 1.6s both}
.t1{animation:rise 1s ${EXPO} .9s both}
.t2{animation:rise 1s ${EXPO} 1.1s both}
.outline{stroke-dasharray:1100;animation:penText 2.6s cubic-bezier(.45,0,.2,1) 1.2s both}
.hatch{animation:fade 1.4s ease-out 2.2s both}
.t3{animation:rise 1s ${EXPO} 2.4s both}
.t4{animation:rise 1s ${EXPO} 2.7s both}
.stamp{animation:stamp .45s cubic-bezier(.5,0,.75,0) 3.2s both}
.sheen{animation:sheen 7s ease-in-out 4s infinite}
@keyframes pen{from{stroke-dashoffset:1}}
@keyframes penText{from{stroke-dashoffset:1100}}
@keyframes wipeX{from{transform:scaleX(0)}}
@keyframes wipeY{from{transform:scaleY(0)}}
@keyframes fade{from{opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes stamp{from{opacity:0;transform:scale(1.9) rotate(-14deg)}}
@keyframes turn{to{transform:rotate(360deg)}}
@keyframes sheen{0%{transform:skewX(-18deg) translateX(0)}35%,100%{transform:skewX(-18deg) translateX(${Math.round(54 * 3.4)}px)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Engraved certificate for ${name}${role ? `, ${role}` : ''}: ${citation.join(' ').replace(/^has/, 'who has')} A guilloché medallion with the monogram ${mono}, its outer ring swelling in the busiest months, and a vermilion seal dated ${n.since}. Serial ${serial}.`
  )}">
<style>${css}</style>
<defs>
  ${ros.defs}
  ${bandPattern('bt', c.line, 0.75, 0, 32)}
  ${bandPattern('bb', c.line, 0.75, 0, H - 54)}
  ${bandPattern('bl', c.line, 0.75, 54, 0, true)}
  ${bandPattern('br', c.line, 0.75, W - 32, 0, true)}
  <pattern id="hatch" width="6" height="2.6" patternUnits="userSpaceOnUse"><rect width="6" height="1.3" fill="${c.ink}"/></pattern>
  <path id="ringT" d="M0 -80A80 80 0 1 1 0 80A80 80 0 1 1 0 -80"/>
  ${sl.defs}
</defs>
<rect width="${W}" height="${H}" rx="10" fill="${c.paper}"/>
<path class="frame" d="M18 18H${W - 18}V${H - 18}H18Z" fill="none" stroke="${c.ink}" stroke-width="1.6" pathLength="1" stroke-dasharray="1 1"/>
<path class="frame" d="M26 26H${W - 26}V${H - 26}H26Z" fill="none" stroke="${c.ink}" stroke-width="0.7" pathLength="1" stroke-dasharray="1 1"/>
<rect class="hband" x="34" y="32" width="${W - 68}" height="22" fill="url(#bt)"/>
<rect class="hband" x="34" y="${H - 54}" width="${W - 68}" height="22" fill="url(#bb)"/>
<rect class="vband" x="32" y="56" width="22" height="${H - 112}" fill="url(#bl)"/>
<rect class="vband" x="${W - 54}" y="56" width="22" height="${H - 112}" fill="url(#br)"/>
<path class="frame" d="M60 60H${W - 60}V${H - 60}H60Z" fill="none" stroke="${c.ink}" stroke-width="0.7" pathLength="1" stroke-dasharray="1 1"/>
<g transform="translate(${mx} ${my})" fill="none" stroke="${c.line}" stroke-opacity="${c.lineOp}" stroke-width="0.7">
  <g class="turn">${ros.outer}</g>
  ${ros.inner}
</g>
<g class="core" transform="translate(${mx} ${my})">
  <circle r="72" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.2"/>
  <circle r="88" fill="none" stroke="${c.ink}" stroke-width="0.6"/>
  <text font-family="${ROMAN}" font-size="10.5" letter-spacing="${ring.spacing}" fill="${c.ink}"><textPath xlink:href="#ringT">${escapeXml(ring.text)}</textPath></text>
  <circle r="64" fill="none" stroke="${c.ink}" stroke-width="0.5"/>
  <text y="${mono.length > 1 ? 17 : 20}" text-anchor="middle" font-family="${ROMAN}" font-size="${mono.length > 1 ? 50 : 60}" fill="url(#hatch)" stroke="${c.ink}" stroke-width="0.8">${escapeXml(mono)}</text>
</g>
<g class="t1" font-family="${ROMAN}" fill="${c.ink}">
  <text x="${W - 96}" y="104" text-anchor="end" font-size="13" letter-spacing="2" fill="${c.seal}">No. ${escapeXml(serial)}</text>
  <text x="${bx}" y="150" text-anchor="middle" font-size="15" letter-spacing="5"${fitAttrs(heading, 15 * 1.25, 480, 'romanCaps')}>${escapeXml(heading)}</text>
  <path d="M${bx - 240} 166H${bx - 30}M${bx + 30} 166H${bx + 240}" stroke="${c.ink}" stroke-width="0.6"/>
  <path d="M${bx} 160l6 6-6 6-6-6Z" fill="${c.ink}"/>
</g>
<text class="t2" x="${bx}" y="208" text-anchor="middle" font-family="${ROMAN}" font-style="italic" font-size="19" fill="${c.muted}">This is to certify that</text>
${engraved('hatch', 'fill="url(#hatch)"')}
${engraved('outline', `fill="none" stroke="${c.ink}" stroke-width="0.9"`)}
${role ? `<text class="t3" x="${bx}" y="${roleY}" text-anchor="middle" font-family="${ROMAN}" font-style="italic" font-size="19" fill="${c.ink}"${fitAttrs(role, 19, 560, 'roman')}>${escapeXml(role)}</text>` : ''}
<g class="t3">${citeSvg}</g>
<g class="t4" font-family="${SANS}" fill="${c.muted}">
  <path d="M600 486H800" stroke="${c.ink}" stroke-width="0.7"/>
  <text x="700" y="476" text-anchor="middle" font-family="${ROMAN}" font-size="17" fill="${c.ink}">${escapeXml(formatDate(n.to || new Date().toISOString().slice(0, 10)))}</text>
  <text x="700" y="504" text-anchor="middle" font-size="9.5" letter-spacing="2.4">DATE OF ISSUE</text>
  <path d="M832 486H952" stroke="${c.ink}" stroke-width="0.7"/>
  <text x="892" y="476" text-anchor="middle" font-family="${ROMAN}" font-style="italic" font-size="${loginSize}" fill="${c.ink}"${fitAttrs(login, loginSize, 118, 'roman')}>${escapeXml(login)}</text>
  <text x="892" y="504" text-anchor="middle" font-size="9.5" letter-spacing="2.4">REGISTRAR</text>
</g>
${sl.svg}
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Coupons — the year as twelve bond coupons
// ---------------------------------------------------------------------------

export function couponsSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 500;
  const n = proNumbers(profile);
  const months = n.months;
  const best = months.reduce((b, m, i) => (m.total > (months[b]?.total ?? -1) ? i : b), 0);
  const cw = 177;
  const ch = 150;
  const gx = (W - 80 - cw * 6) / 5;

  const coupons = months
    .map((m, i) => {
      const x = r1(40 + (i % 6) * (cw + gx));
      const y = 112 + Math.floor(i / 6) * 176;
      const [yy, mm] = (m.key || '0000-01').split('-');
      const monthName = `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(mm) - 1]} ${yy}`;
      const isBest = i === best && m.total > 0;
      return `<g class="cp" style="animation-delay:${(0.3 + i * 0.08).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="${c.ink}" stroke-width="1" stroke-dasharray="2 3"/>
  <rect x="${x + 6}" y="${y + 6}" width="${cw - 12}" height="${ch - 12}" fill="none" stroke="${c.ink}" stroke-width="0.5"/>
  <rect x="${x + 7}" y="${y + 7}" width="${cw - 14}" height="22" fill="url(#bh)"/>
  <text x="${x + 14}" y="${y + 48}" font-family="${SANS}" font-size="9" letter-spacing="1.8" fill="${c.muted}">COUPON No. ${String(i + 1).padStart(2, '0')}</text>
  <text x="${x + 14}" y="${y + 66}" font-family="${ROMAN}" font-style="italic" font-size="15" fill="${c.ink}">${monthName}</text>
  <text x="${x + 14}" y="${y + 106}" font-family="${ROMAN}" font-size="34" fill="${c.ink}">${fmt(m.total)}</text>
  <text x="${x + 14}" y="${y + 128}" font-family="${SANS}" font-size="9" letter-spacing="1.4" fill="${c.muted}">CONTRIBUTIONS · ${m.active} ${m.active === 1 ? 'DAY' : 'DAYS'}</text>
  ${isBest ? `<g class="stamp" style="transform-origin:${x + cw - 34}px ${y + 92}px"><circle cx="${x + cw - 34}" cy="${y + 92}" r="22" fill="none" stroke="${c.seal}" stroke-width="1.6"/><circle cx="${x + cw - 34}" cy="${y + 92}" r="18" fill="none" stroke="${c.seal}" stroke-width="0.7"/><text x="${x + cw - 34}" y="${y + 96}" text-anchor="middle" font-family="${ROMAN}" font-size="11" letter-spacing="1" fill="${c.seal}" transform="rotate(-14 ${x + cw - 34} ${y + 92})">BEST</text></g>` : ''}
</g>`;
    })
    .join('\n');

  const langs = n.languages;
  const denom = langs.length ? `Denominations: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(' · ')}` : 'Denominations: none recorded';

  const css = `
.hdr{animation:rise 1s ${EXPO} .1s both}
.cp{animation:rise .9s ${EXPO} both}
.stamp{animation:stamp .4s cubic-bezier(.5,0,.75,0) 1.6s both}
.foot{animation:fade 1s ease-out 1.4s both}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes stamp{from{opacity:0;transform:scale(1.8) rotate(-12deg)}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `The last twelve months as bond coupons, contributions per month: ${months.map((m) => `${m.label} ${m.total}`).join(', ')}.${months[best]?.total ? ` Best month ${months[best].label}.` : ''} ${denom}.`
  )}">
<style>${css}</style>
<defs>${bandPattern('bh', c.line, 0.7, 0, 119)}</defs>
<rect width="${W}" height="${H}" rx="10" fill="${c.paper}"/>
<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${c.ink}" stroke-width="1.2"/>
<g class="hdr" text-anchor="middle">
  <text x="${W / 2}" y="62" font-family="${ROMAN}" font-size="17" letter-spacing="6" fill="${c.ink}">SCHEDULE OF COUPONS</text>
  <text x="${W / 2}" y="88" font-family="${ROMAN}" font-style="italic" font-size="15" fill="${c.muted}">Twelve months, each payable in contributions · ${fmt(n.total)} in all</text>
</g>
${months.length ? coupons : ''}
<text class="foot" x="${W / 2}" y="${H - 30}" text-anchor="middle" font-family="${ROMAN}" font-style="italic" font-size="15" fill="${c.ink}"${fitAttrs(denom, 15, 1080, 'roman')}>${escapeXml(denom)}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Counterfoil — stub, sign-off and seal
// ---------------------------------------------------------------------------

export function counterfoilSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 220;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const mono = initials(name);
  const serial = serialNumber(profile);
  const sign = opts.signoff.toUpperCase();
  const signSize = fitSize(sign, 700, 24, 14, 'romanCaps');
  const sl = seal('f', 1090, 110, 50, c, profile.login, n.since, mono);

  const css = `
.stub{animation:fade 1s ease-out .1s both}
.perf{animation:pen 1.4s ease-out .2s both}
.a{animation:rise 1s ${EXPO} .5s both}
.band{transform-box:fill-box;transform-origin:center;animation:wipeX 1.6s ${EXPO} .8s both}
.b{animation:rise 1s ${EXPO} 1s both}
.stamp{animation:stamp .45s cubic-bezier(.5,0,.75,0) 1.8s both}
.sheen{animation:none}
@keyframes fade{from{opacity:0}}
@keyframes pen{from{stroke-dashoffset:1}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes wipeX{from{transform:scaleX(0)}}
@keyframes stamp{from{opacity:0;transform:scale(1.9) rotate(-14deg)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`Counterfoil No. ${serial}: ${opts.signoff} Sealed by ${name}.`)}">
<style>${css}</style>
<defs>${bandPattern('bh', c.line, 0.75, 0, 104)}${sl.defs}</defs>
<rect width="${W}" height="${H}" rx="10" fill="${c.paper}"/>
<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${c.ink}" stroke-width="1.2"/>
<g class="stub" font-family="${SANS}" fill="${c.muted}" text-anchor="middle">
  <text x="130" y="70" font-size="9.5" letter-spacing="2.4">COUNTERFOIL</text>
  <text x="130" y="112" font-family="${ROMAN}" font-size="17" letter-spacing="1.5" fill="${c.seal}">No. ${escapeXml(serial)}</text>
  <text x="130" y="150" font-size="9.5" letter-spacing="2">RETAIN THIS PORTION</text>
</g>
<path class="perf" d="M262 26V${H - 26}" stroke="${c.ink}" stroke-width="1.4" stroke-dasharray="1 1" pathLength="1" style="stroke-dasharray:.006 .012"/>
<text class="a" x="640" y="86" text-anchor="middle" font-family="${ROMAN}" font-size="${signSize}" letter-spacing="${r1(signSize * 0.22)}" fill="${c.ink}"${fitAttrs(sign, signSize * 1.22, 720, 'romanCaps')}>${escapeXml(sign)}</text>
<rect class="band" x="330" y="104" width="620" height="22" fill="url(#bh)"/>
<g class="b" text-anchor="middle">
  <text x="640" y="160" font-family="${ROMAN}" font-style="italic" font-size="18" fill="${c.ink}"${fitAttrs(name, 18, 620, 'roman')}>${escapeXml(name)}</text>
  <text x="640" y="184" font-family="${SANS}" font-size="9.5" letter-spacing="2.4" fill="${c.muted}">HOLDER OF RECORD SINCE ${n.since}</text>
</g>
${sl.svg}
</svg>`;
}
