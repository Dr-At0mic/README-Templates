// Departures — a split-flap departures board in a quiet terminal.
//
// Every character is a flap cell that runs through the alphabet from blank until it reaches its letter,
// the way a real board does, so cells land at different moments and the board settles left to right.
// One alphabet strip per cell size lives in <defs>; each cell is a clipped <use> of it, stepped with
// steps(n, start) and moved to its letter, plus a flap that falls once per step. Jumping at the start of
// each step puts the final letter up one step before the animation ends, and the fill is backwards only,
// so nothing changes at the end boundary: with steps(n, end) Chrome sometimes left a cell one letter short
// in live playback (seen as TYPESBRIPT), though seeking rendered it right. Characters the board doesn't
// carry (accents, other scripts) are printed in place, so names are never changed.
//
// Hero: the name, the role, the scheduled departures (featured repos), and NOW BOARDING (what you're on
// now). Timetable: the weekly rhythm (average contributions per weekday) and the year's numbers.
// Final call: the sign-off. One loop: the boarding light.

import { EXPO, REDUCED, SANS, compact, escapeXml, fmt, formatDate, initials, proNumbers, r1, roleFromHeadline, roleLine } from '../common';

export const THEMES = {
  dark: {
    housing: '#111214',
    board: '#060607',
    flap: '#1b1c1f',
    flapTop: '#222326',
    char: '#f3f0e7',
    label: '#9b9ea4',
    amber: '#ffb81c',
    onAmber: '#111214',
    rule: '#25272b',
  },
  light: {
    housing: '#dddad3',
    board: '#c6c3bb',
    flap: '#f7f6f2',
    flapTop: '#ffffff',
    char: '#141518',
    label: '#53565c',
    amber: '#9c5a00',
    onAmber: '#ffffff',
    rule: '#cfccc4',
  },
};

const ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-&/:'@#,!?★+%";
const STEP = 0.042;
const SIZES = {
  L: { w: 44, h: 66, gap: 4, font: 44 },
  M: { w: 25, h: 37, gap: 3, font: 25 },
  S: { w: 23, h: 33, gap: 3, font: 20 },
};

function boardDefs(c, used) {
  let out = '';
  for (const key of used) {
    const s = SIZES[key];
    const base = r1(s.h / 2 + s.font * 0.36);
    const strip = [...ALPHABET].map((ch, i) => (ch === ' ' ? '' : `<tspan x="${s.w / 2}" y="${r1(i * s.h + base)}">${escapeXml(ch)}</tspan>`)).join('');
    out += `<text id="a${key}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${s.font}" fill="${c.char}">${strip}</text>`;
    out += `<clipPath id="c${key}"><rect width="${s.w}" height="${s.h}" rx="3"/></clipPath>`;
  }
  return out;
}

// Flap backgrounds as a pattern on a grid, so a run of cells is one element and rows on the same grid
// share one pattern.
function grid(c, key, x, y, id, rowPitch = SIZES[key].h) {
  const s = SIZES[key];
  const pitch = s.w + s.gap;
  const half = s.h / 2;
  return {
    run: (rx, ry, cells) => `<rect x="${rx}" y="${ry}" width="${cells * pitch - s.gap}" height="${s.h}" fill="url(#${id})"/>`,
    defs: `<pattern id="${id}" x="${x}" y="${y}" width="${pitch}" height="${rowPitch}" patternUnits="userSpaceOnUse"><rect width="${s.w}" height="${s.h}" rx="3" fill="${c.flap}"/><path d="M0 3a3 3 0 0 1 3-3h${s.w - 6}a3 3 0 0 1 3 3v${half - 3}h-${s.w}z" fill="${c.flapTop}"/><rect y="${half - 0.6}" width="${s.w}" height="1.2" fill="${c.board}"/><rect x="0" y="${half - 2.5}" width="1.6" height="5" fill="${c.board}"/><rect x="${s.w - 1.6}" y="${half - 2.5}" width="1.6" height="5" fill="${c.board}"/></pattern>`,
  };
}

/** A run of flap cells spelling `text` (already upper-cased and cut to length). */
function flaps(c, key, text, x, y, delay, stagger = 0.022) {
  const s = SIZES[key];
  const pitch = s.w + s.gap;
  let out = '';
  [...text].forEach((ch, i) => {
    if (ch === ' ') return;
    const cx = r1(x + i * pitch);
    const t = ALPHABET.indexOf(ch);
    const d = (delay + i * stagger).toFixed(3);
    if (t < 0) {
      out += `<text class="land" style="animation-delay:${(delay + i * stagger + 0.9).toFixed(2)}s" x="${r1(cx + s.w / 2)}" y="${r1(y + s.h / 2 + s.font * 0.36)}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${s.font}" fill="${c.char}">${escapeXml(ch)}</text>`;
      return;
    }
    out += `<g transform="translate(${cx} ${y})"><g clip-path="url(#c${key})"><use xlink:href="#a${key}" class="f" style="transform:translateY(-${t * s.h}px);animation-duration:${(t * STEP).toFixed(3)}s;animation-delay:${d}s;animation-timing-function:steps(${t},start)"/></g><rect class="fl" style="animation-duration:${STEP}s;animation-delay:${d}s;animation-iteration-count:${t}" width="${s.w}" height="${s.h / 2}" fill="${c.flapTop}"/></g>`;
  });
  return out;
}

const board = (text) =>
  String(text || '')
    .toUpperCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[“”"]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

function cut(text, max) {
  const t = board(text);
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** Splits upper-cased text into lines of at most `max` cells, breaking between words. */
function flapLines(text, max, lines) {
  const words = board(text).split(' ').filter(Boolean);
  const out = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = cut(out.slice(lines - 1).join(' '), max);
    return kept;
  }
  return out.map((l) => cut(l, max));
}

const CSS_COMMON = `
.f{animation-name:roll;animation-fill-mode:backwards}
.fl{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0);animation-name:fall;animation-timing-function:linear}
.land{animation:land .3s steps(1,start) backwards}
@keyframes roll{from{transform:translateY(0)}}
@keyframes fall{from{transform:scaleY(1)}}
@keyframes land{from{opacity:0}}`;

function plane(color) {
  return `<path d="M2 15.5l2-.6 4 1.6 4.6-2.6L6 8.6l2.4-.8 9 3.6 4.2-2.4c1.1-.6 2.4-.4 2.8.4.4.8-.2 1.8-1.3 2.4L8.4 19.6c-.9.5-2 .5-2.9 0Z M3 22h19" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------------
// 1. Hero — the departures board
// ---------------------------------------------------------------------------

export function flightNumber(profile, i) {
  return `${initials(profile.name || profile.login).replace(/[^A-Z]/g, '').padEnd(2, 'X').slice(0, 2)}${String(101 + i)}`;
}

export function heroSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 600;
  const n = proNumbers(profile);
  const name = profile.name || profile.login;
  const X = 40;
  const defs = [];
  const parts = [];

  const L = SIZES.L;
  const M = SIZES.M;
  const S = SIZES.S;
  const pitch = S.w + S.gap;
  const maxL = Math.floor((W - X * 2 + L.gap) / (L.w + L.gap));
  const maxM = Math.floor((W - X * 2 + M.gap) / (M.w + M.gap));
  const nameLines = flapLines(name, maxL, 2);
  const role = roleLine(opts.title, opts.organisation, ' · ') || roleFromHeadline(profile.headline, maxM) || (profile.location ? profile.location : `@${profile.login}`);

  // Timetable of featured repos (or languages when there are none).
  const cols = [
    ['FLIGHT', 6],
    ['DESTINATION', 17],
    ['VIA', 10],
    ['STARS', 6],
  ];
  const repos = (profile.featured || []).map((r) => (profile.repos || []).find((x) => x.name === r)).filter(Boolean);
  const rows = repos.length
    ? repos.map((r, i) => [flightNumber(profile, i), r.name, r.language || '', r.stars ? compact(r.stars) : 'NEW'])
    : n.languages.slice(0, 4).map((l, i) => [flightNumber(profile, i), l.name, 'LANGUAGE', `${Math.round(l.share * 100)}%`]);
  const rowPitch = S.h + 8;

  // Spread the three blocks over the board's height.
  const top = 92;
  const bottom = H - 98;
  const nameH = nameLines.length * (L.h + 8) - 8;
  const maxRows = Math.max(1, Math.min(rows.length || 1, Math.floor((bottom - top - nameH - M.h - 70) / rowPitch)));
  const tableH = 22 + maxRows * rowPitch - 8;
  const free = Math.max(0, bottom - top - nameH - M.h - tableH);
  const gapA = Math.round(Math.min(34, 14 + free * 0.3));
  const gapB = Math.round(Math.min(70, Math.max(30, free - (gapA - 14) - 14)));

  let y = top;
  const gL = grid(c, 'L', X, y, 'gL', L.h + 8);
  defs.push(gL.defs);
  nameLines.forEach((line, li) => {
    parts.push(gL.run(X, y, maxL), flaps(c, 'L', line, X, y, 0.35 + li * 0.25));
    y += L.h + 8;
  });
  y += gapA - 8;
  const gM = grid(c, 'M', X, y, 'gM');
  defs.push(gM.defs);
  parts.push(gM.run(X, y, maxM), flaps(c, 'M', cut(role, maxM), X, y, 0.9, 0.014));
  y += M.h + gapB;
  let cx = X;
  const colX = cols.map(([, w]) => {
    const at = cx;
    cx += (w + 1) * pitch;
    return at;
  });
  parts.push(
    `<g class="lbl" font-family="${SANS}" font-size="11" font-weight="700" letter-spacing="2" fill="${c.label}">${cols.map(([label], i) => `<text x="${colX[i]}" y="${y - 10}">${label}</text>`).join('')}</g>`
  );
  const gS = grid(c, 'S', X, y, 'gS', rowPitch);
  defs.push(gS.defs);
  for (let r = 0; r < maxRows; r++) {
    const ry = y + r * rowPitch;
    cols.forEach(([, w], ci) => parts.push(gS.run(colX[ci], ry, w)));
    const row = rows[r];
    if (!row) {
      parts.push(flaps(c, 'S', 'STAND BY', colX[1], ry, 1.2));
      continue;
    }
    row.forEach((val, ci) => parts.push(flaps(c, 'S', cut(val, cols[ci][1]), colX[ci], ry, 1.25 + r * 0.18 + ci * 0.08, 0.016)));
  }

  // Status bar.
  const now = profile.now ? cut(profile.now, 74) : '';
  const status = now
    ? `<rect x="${X}" y="${H - 58}" width="164" height="30" rx="4" fill="${c.amber}"/><circle class="blink" cx="${X + 16}" cy="${H - 43}" r="4" fill="${c.onAmber}"/><text x="${X + 30}" y="${H - 38}" font-family="${SANS}" font-size="12" font-weight="700" letter-spacing="1.6" fill="${c.onAmber}">NOW BOARDING</text><text x="${X + 180}" y="${H - 37}" font-family="${SANS}" font-size="15" font-weight="600" letter-spacing="0.5" fill="${c.char}">${escapeXml(now)}</text>`
    : `<text x="${X}" y="${H - 37}" font-family="${SANS}" font-size="13" font-weight="700" letter-spacing="2" fill="${c.label}">ALL FLIGHTS ON TIME</text>`;

  const css = `${CSS_COMMON}
.hdr{animation:rise .9s ${EXPO} .05s both}
.lbl{animation:fade .8s ease-out 1.1s both}
.bar{animation:rise .9s ${EXPO} 2.4s both}
.blink{animation:blink 1.6s steps(1,end) 3s infinite}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes fade{from{opacity:0}}
@keyframes blink{50%{opacity:0}}
${REDUCED}`;

  const right = [profile.location, formatDate(n.to || new Date().toISOString().slice(0, 10), 'caps')].filter(Boolean).map(board).join('   ·   ');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `A split-flap departures board spelling ${name}${role ? `, ${role}` : ''}. Scheduled departures: ${rows.map((r) => `${r[0]} to ${r[1]}`).join(', ') || 'none'}.${profile.now ? ` Now boarding: ${profile.now}` : ''}`
  )}">
<style>${css}</style>
<defs>${boardDefs(c, ['L', 'M', 'S'])}${defs.join('')}</defs>
<rect width="${W}" height="${H}" rx="14" fill="${c.housing}"/>
<g class="hdr">
  <g transform="translate(${X} 30)">${plane(c.char)}</g>
  <text x="${X + 36}" y="50" font-family="${SANS}" font-size="22" font-weight="700" letter-spacing="6" fill="${c.char}">DEPARTURES</text>
  <text x="${W - X}" y="50" text-anchor="end" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="2" fill="${c.label}">${escapeXml(right)}</text>
  <rect x="${X}" y="66" width="${W - X * 2}" height="1" fill="${c.rule}"/>
</g>
${parts.join('\n')}
<rect x="${X}" y="${H - 74}" width="${W - X * 2}" height="1" fill="${c.rule}"/>
<g class="bar">${status}</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Timetable — weekly rhythm and the year in numbers
// ---------------------------------------------------------------------------

export function timetableSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 430;
  const n = proNumbers(profile);
  const X = 40;
  const defs = [];
  const parts = [];
  const S = SIZES.S;
  const pitch = S.w + S.gap;

  // Monday first, the way timetables run.
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const peak = Math.max(0.0001, ...n.weekdayAvg);
  const busiest = n.weekdayAvg.indexOf(Math.max(...n.weekdayAvg));
  const rowPitch = 43;
  const gW = grid(c, 'S', X, 100, 'gW', rowPitch);
  defs.push(gW.defs);
  order.forEach((dow, r) => {
    const y = 100 + r * rowPitch;
    const avg = n.weekdayAvg[dow];
    parts.push(gW.run(X, y, 3), gW.run(X + 4 * pitch, y, 4), flaps(c, 'S', names[dow], X, y, 0.3 + r * 0.08), flaps(c, 'S', avg.toFixed(1).padStart(4, ' '), X + 4 * pitch, y, 0.4 + r * 0.08));
    const dots = Math.round((avg / peak) * 20);
    let lamps = '';
    for (let i = 0; i < 20; i++) {
      const on = i < dots;
      lamps += `<circle${on ? ` class="lamp" style="animation-delay:${(1 + r * 0.06 + i * 0.03).toFixed(2)}s"` : ''} cx="${X + 9 * pitch + 6 + i * 16}" cy="${y + S.h / 2}" r="5" fill="${on ? (dow === busiest ? c.amber : c.char) : c.rule}"/>`;
    }
    parts.push(lamps);
  });

  // The year in numbers.
  const stats = [
    ['CONTRIBUTIONS', fmt(n.total)],
    ['ACTIVE DAYS', fmt(n.active)],
    ['LONGEST STREAK', `${n.streak}`],
    ['BEST DAY', n.best ? `${n.best.count}` : '0'],
    ['STARS', compact(n.stars)],
    ['FOLLOWERS', compact(n.followers)],
    ['SINCE', String(n.since)],
  ];
  const sx = 760;
  const cells = 7;
  const vx = W - X - cells * pitch + S.gap;
  const gT = grid(c, 'S', vx, 100, 'gT', rowPitch);
  defs.push(gT.defs);
  stats.forEach(([label, value], r) => {
    const y = 100 + r * rowPitch;
    parts.push(
      `<text class="lbl" x="${sx}" y="${y + 22}" font-family="${SANS}" font-size="12" font-weight="700" letter-spacing="1.6" fill="${c.label}">${label}</text>`,
      gT.run(vx, y, cells),
      flaps(c, 'S', value.padStart(cells, ' '), vx, y, 0.5 + r * 0.1)
    );
  });

  const css = `${CSS_COMMON}
.hdr{animation:rise .9s ${EXPO} .05s both}
.lbl{animation:fade .8s ease-out .4s both}
.lamp{animation:lamp .3s steps(1,start) backwards}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes fade{from{opacity:0}}
@keyframes lamp{from{fill:${c.rule}}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Timetable. Average contributions per weekday: ${order.map((d) => `${names[d]} ${n.weekdayAvg[d].toFixed(1)}`).join(', ')}; busiest ${names[busiest]}. The year: ${fmt(n.total)} contributions, ${n.active} active days, longest streak ${n.streak} days, best day ${n.best?.count || 0}, ${fmt(n.stars)} stars, ${fmt(n.followers)} followers, on GitHub since ${n.since}.`
  )}">
<style>${css}</style>
<defs>${boardDefs(c, ['S'])}${defs.join('')}</defs>
<rect width="${W}" height="${H}" rx="14" fill="${c.housing}"/>
<g class="hdr" font-family="${SANS}" font-weight="700">
  <text x="${X}" y="54" font-size="20" letter-spacing="5" fill="${c.char}">TIMETABLE</text>
  <text x="${X + 190}" y="54" font-size="11" letter-spacing="2" fill="${c.label}">AVERAGE CONTRIBUTIONS PER DAY OF THE WEEK</text>
  <text x="${W - X}" y="54" text-anchor="end" font-size="11" letter-spacing="2" fill="${c.label}">THE YEAR · LAST 12 MONTHS</text>
  <rect x="${X}" y="72" width="${W - X * 2}" height="1" fill="${c.rule}"/>
</g>
${parts.join('\n')}
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Final call — the sign-off
// ---------------------------------------------------------------------------

export function finalCallSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 190;
  const X = 40;
  const M = SIZES.M;
  const max = Math.floor((W - X * 2 + M.gap) / (M.w + M.gap));
  const text = cut(opts.signoff, max);
  const start = X + Math.floor((max - text.length) / 2) * (M.w + M.gap);
  const gF = grid(c, 'M', X, 76, 'gF');
  const by = [profile.name || profile.login, profile.location].filter(Boolean).join('  ·  ');

  const css = `${CSS_COMMON}
.hdr{animation:rise .9s ${EXPO} .05s both}
.foot{animation:fade 1s ease-out 1.6s both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`Final call: ${opts.signoff}`)}">
<style>${css}</style>
<defs>${boardDefs(c, ['M'])}${gF.defs}</defs>
<rect width="${W}" height="${H}" rx="14" fill="${c.housing}"/>
<g class="hdr">
  <rect x="${X}" y="30" width="112" height="28" rx="4" fill="${c.amber}"/>
  <text x="${X + 56}" y="49" text-anchor="middle" font-family="${SANS}" font-size="12" font-weight="700" letter-spacing="2" fill="${c.onAmber}">FINAL CALL</text>
</g>
${gF.run(X, 76, max)}
${flaps(c, 'M', text, start, 76, 0.3, 0.03)}
<text class="foot" x="${W / 2}" y="${H - 34}" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="1.6" fill="${c.label}">${escapeXml(board(by))}  ·  @${escapeXml(board(profile.login))}</text>
</svg>`;
}
