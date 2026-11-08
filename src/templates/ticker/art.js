// Ticker — your year as a listed stock, drawn like a market terminal.
//
// The "price" is an activity index: contributions in the trailing 28 days, read every day. Each week
// becomes a candle (open, high, low and close of that index), hollow when the week ended higher and solid
// when it ended lower, so direction never depends on colour alone. A four-week moving average runs
// through the candles, volume is active days per week, and the symbol comes from the login.
//
// Hero: header quote, the candle chart with its 52-week high called out, and a ticker tape of repos and
// languages. Fundamentals: the year's numbers as a stat sheet, languages as sector allocation, and
// monthly change. Closing bell: a sparkline and the sign-off.
//
// Two infinite loops in the hero (the tape and the ping on the last price); none in the other images.

import {
  EXPO,
  MONO,
  REDUCED,
  SANS,
  compact,
  escapeXml,
  fitAttrs,
  fitSize,
  fmt,
  formatDate,
  proNumbers,
  r1,
  roleLine,
  textWidth,
} from '../common';

export const THEMES = {
  dark: {
    bg: '#0b0f17',
    panel: '#111722',
    tape: '#0e131d',
    grid: '#1c2432',
    fg: '#e8edf5',
    muted: '#8892a6',
    up: '#2fbf9f',
    down: '#ef5f57',
    amber: '#f2b632',
    onAmber: '#0b0f17',
    vol: 0.38,
  },
  light: {
    bg: '#ffffff',
    panel: '#f5f7fa',
    tape: '#0f1726',
    grid: '#e4e8ef',
    fg: '#0f1726',
    muted: '#58637a',
    up: '#0b7a63',
    down: '#c2362e',
    amber: '#9a6400',
    onAmber: '#ffffff',
    vol: 0.3,
  },
};

const TAPE = { dark: { fg: '#e8edf5', muted: '#8892a6', amber: '#f2b632', up: '#2fbf9f' }, light: { fg: '#f3f5f8', muted: '#9aa4b6', amber: '#f2b632', up: '#3fd0ae' } };

export function defaultSymbol(profile) {
  const letters = String(profile.login || '').replace(/[^a-z]/gi, '').toUpperCase();
  if (letters.length <= 4) return letters || 'GH';
  let out = letters[0];
  for (const ch of letters.slice(1)) if (!/[AEIOU]/.test(ch) && out.length < 4 && !out.endsWith(ch)) out += ch;
  for (const ch of letters.slice(1)) if (out.length < 3) out += ch;
  return out;
}

export const WINDOW = 28;

/** The activity index and its weekly candles. The index needs WINDOW days of history, so weeks inside the
 * warm-up are left out rather than drawn from a partial window. */
export function tickerNumbers(profile) {
  const n = proNumbers(profile);
  const counts = n.days.map((d) => d.count);
  const index = counts.map((_, i) => counts.slice(Math.max(0, i - WINDOW + 1), i + 1).reduce((a, b) => a + b, 0));
  const warm = Math.min(WINDOW - 1, Math.max(0, index.length - 1));
  const candles = [];
  let k = 0;
  for (const w of n.weeks) {
    const from = Math.max(k, warm);
    const vals = index.slice(from, k + w.days.length);
    k += w.days.length;
    if (!vals.length) continue;
    candles.push({
      start: w.start,
      o: vals[0],
      c: vals[vals.length - 1],
      h: Math.max(...vals),
      l: Math.min(...vals),
      vol: w.days.filter((d) => d.count > 0).length,
    });
  }
  candles.forEach((cd, i) => {
    const win = candles.slice(Math.max(0, i - 3), i + 1);
    cd.ma = win.reduce((s, x) => s + x.c, 0) / win.length;
  });
  const settled = index.slice(warm);
  const last = index[index.length - 1] ?? 0;
  const first = settled[0] ?? 0;
  let hiAt = warm;
  index.forEach((v, i) => {
    if (i >= warm && v > index[hiAt]) hiAt = i;
  });
  return {
    ...n,
    index,
    candles,
    last,
    first,
    change: last - first,
    pct: first >= 10 ? (last - first) / first : null,
    high: settled.length ? Math.max(...settled) : 0,
    low: settled.length ? Math.min(...settled) : 0,
    highDate: n.days[hiAt]?.date || '',
    avgWeek: n.weeks.length ? n.total / n.weeks.length : 0,
  };
}

function niceStep(max) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(Math.max(1, raw)));
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) || pow * 10;
}

const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v))}`;
const pctText = (p) => (p === null ? '' : `${p >= 0 ? '+' : '−'}${Math.abs(p * 100).toFixed(1)}%`);

// ---------------------------------------------------------------------------
// 1. Hero — quote header, candles, tape
// ---------------------------------------------------------------------------

export function heroSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const tc = TAPE[themeName];
  const W = 1200;
  const H = 600;
  const t = tickerNumbers(profile);
  const name = profile.name || profile.login;
  const symbol = opts.symbol;
  const up = t.change >= 0;
  const dir = t.change === 0 ? c.muted : up ? c.up : c.down;
  const arrow = t.change === 0 ? '■' : up ? '▲' : '▼';
  const role = roleLine(opts.title, opts.organisation, ' · ') || String(profile.headline || '');

  // Header.
  const symW = Math.max(72, textWidth(symbol, 22, 'mono') + 28);
  const nameX = 40 + symW + 18;
  const nameMax = 520 - symW;
  const nameSize = fitSize(name, nameMax, 28, 18, 'sansBold');
  const priceText = fmt(t.last);

  // Chart geometry.
  const X0 = 40;
  const X1 = 1068;
  const Y0 = 150;
  const Y1 = 410;
  const V0 = 428;
  const V1 = 478;
  const top = Math.max(4, t.high, ...t.candles.map((cd) => cd.h)) * 1.06;
  const step = niceStep(top);
  const yMax = Math.ceil(top / step) * step;
  const yOf = (v) => r1(Y1 - ((Y1 - Y0) * v) / yMax);
  const slot = (X1 - X0) / Math.max(1, t.candles.length);
  const bw = Math.max(3, Math.min(11, slot * 0.58));

  let grid = '';
  for (let v = 0; v <= yMax; v += step) {
    grid += `<line x1="${X0}" y1="${yOf(v)}" x2="${X1}" y2="${yOf(v)}" stroke="${c.grid}" stroke-width="1"${v ? ' stroke-dasharray="3 4"' : ''}/><text x="${X1 + 12}" y="${yOf(v) + 4}" font-family="${MONO}" font-size="11" fill="${c.muted}">${fmt(v)}</text>`;
  }

  let candles = '';
  let vols = '';
  let ma = '';
  const months = [];
  t.candles.forEach((cd, i) => {
    const cx = X0 + slot * i + slot / 2;
    const rising = cd.c >= cd.o;
    const color = rising ? c.up : c.down;
    const yO = yOf(cd.o);
    const yC = yOf(cd.c);
    const bodyTop = Math.min(yO, yC);
    const bodyH = Math.max(1.2, Math.abs(yO - yC));
    const d = (0.55 + i * 0.028).toFixed(3);
    candles += `<g class="cd" style="animation-delay:${d}s"><line x1="${r1(cx)}" y1="${yOf(cd.h)}" x2="${r1(cx)}" y2="${yOf(cd.l)}" stroke="${color}" stroke-width="1.3"/><rect x="${r1(cx - bw / 2)}" y="${r1(bodyTop)}" width="${r1(bw)}" height="${r1(bodyH)}" fill="${rising ? c.bg : color}" stroke="${color}" stroke-width="1.3"/></g>`;
    const vh = (cd.vol / 7) * (V1 - V0);
    if (vh > 0) vols += `<rect class="vb" style="animation-delay:${d}s" x="${r1(cx - bw / 2)}" y="${r1(V1 - vh)}" width="${r1(bw)}" height="${r1(vh)}" fill="${color}" fill-opacity="${c.vol}"/>`;
    ma += `${i ? 'L' : 'M'}${r1(cx)} ${yOf(cd.ma)}`;
    const m = cd.start.slice(5, 7);
    if (!months.length || months[months.length - 1].m !== m) months.push({ m, x: cx, date: cd.start });
  });
  const monthLabels = months
    .slice(1)
    .map(({ x, date }) => `<text x="${r1(x)}" y="${V1 + 22}" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="${c.muted}">${formatDate(date, 'short').slice(0, 3).toUpperCase()}</text><line x1="${r1(x)}" y1="${V1 + 4}" x2="${r1(x)}" y2="${V1 + 9}" stroke="${c.muted}"/>`)
    .join('');

  const lastC = t.candles[t.candles.length - 1];
  const lastX = r1(X0 + slot * (t.candles.length - 1) + slot / 2);
  const lastY = yOf(t.last);

  // 52-week high callout.
  let hiCandle = 0;
  t.candles.forEach((cd, i) => {
    if (cd.start <= t.highDate) hiCandle = i;
  });
  const hx = X0 + slot * Math.max(0, hiCandle) + slot / 2;
  const hy = yOf(t.high);
  const hiLeft = hx > X1 - 220;
  const callout =
    t.high > 0
      ? `<g class="late"><line x1="${r1(hx)}" y1="${r1(hy - 6)}" x2="${r1(hx)}" y2="${r1(hy - 26)}" stroke="${c.amber}" stroke-width="1"/><circle cx="${r1(hx)}" cy="${r1(hy - 3)}" r="2.5" fill="${c.amber}"/><text x="${r1(hx + (hiLeft ? -8 : 8))}" y="${r1(hy - 20)}" text-anchor="${hiLeft ? 'end' : 'start'}" font-family="${MONO}" font-size="11" fill="${c.amber}">12M HIGH ${fmt(t.high)} · ${escapeXml(formatDate(t.highDate, 'short').toUpperCase())}</text></g>`
      : '';

  // Tape: repos and languages, two copies wide enough to loop seamlessly.
  const repos = (profile.featured || []).map((r) => (profile.repos || []).find((x) => x.name === r)).filter(Boolean);
  const items = [
    ...repos.map((r) => [r.name.toUpperCase(), r.stars ? `★${compact(r.stars)}` : 'NEW', r.language ? r.language.toUpperCase() : '']),
    ...t.languages.map((l) => [l.name.toUpperCase(), `${Math.round(l.share * 100)}%`, '']),
    ['CONTRIBUTIONS', fmt(t.total), '12M'],
    ['STREAK', `${t.streak}D`, ''],
    ['FOLLOWERS', compact(t.followers), ''],
  ];
  const chunk = items
    .map(([a, b, x]) => `<tspan fill="${tc.fg}">${escapeXml(a)} </tspan><tspan fill="${tc.amber}">${escapeXml(b)}</tspan>${x ? `<tspan fill="${tc.muted}"> ${escapeXml(x)}</tspan>` : ''}<tspan fill="${tc.up}"> ▲</tspan>`)
    .join('<tspan>   </tspan>');
  const chunkChars = items.reduce((s, [a, b, x]) => s + a.length + 1 + b.length + (x ? x.length + 1 : 0) + 5, 0);
  const copyW = Math.round(chunkChars * 7.6) + 26;
  const reps = Math.max(1, Math.ceil(1200 / copyW));
  const loopW = copyW * reps;
  let tapeText = '';
  for (let i = 0; i < reps * 2; i++) tapeText += `<text x="${174 + i * copyW}" y="${H - 22}" textLength="${copyW - 30}" lengthAdjust="spacing">${chunk}</text>`;

  const css = `
.hdr{animation:rise .9s ${EXPO} .1s both}
.qt{animation:rise .9s ${EXPO} .3s both}
.gr{animation:fade 1s ease-out .35s both}
.cd{transform-box:fill-box;transform-origin:50% 50%;animation:pop .5s ${EXPO} both}
.vb{transform-box:fill-box;transform-origin:50% 100%;animation:grow .6s ${EXPO} both}
.ma{animation:draw 2.2s cubic-bezier(.4,0,.2,1) .9s both}
.px{animation:slide .8s ${EXPO} 2.3s both}
.flash{animation:flash 1.4s ease-out 2.4s}
.late{animation:fade .8s ease-out 2.6s both}
.tape{animation:fade 1s ease-out .6s both}
.run{animation:run ${Math.round(loopW / 55)}s linear infinite}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ease-out 3s infinite}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes fade{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:scaleY(.15)}}
@keyframes grow{from{transform:scaleY(0)}}
@keyframes draw{from{stroke-dashoffset:1}}
@keyframes slide{from{opacity:0;transform:translateX(24px)}}
@keyframes flash{from{opacity:.55}}
@keyframes run{to{transform:translateX(-${loopW}px)}}
@keyframes ping{0%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(3.4)}}
${REDUCED}`;

  const stats = [
    ['12M HIGH', fmt(t.high)],
    ['12M LOW', fmt(t.low)],
    ['VOLUME 12M', fmt(t.total)],
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `${name}${role ? `, ${role}` : ''}. A market-terminal chart of the last 52 weeks under the symbol ${symbol}: the activity index (contributions in the trailing ${WINDOW} days) is ${fmt(t.last)}, ${up ? 'up' : 'down'} ${fmt(Math.abs(t.change))} on the year, with a 12-month high of ${fmt(t.high)}. ${fmt(t.total)} contributions on ${t.active} active days.`
  )}">
<style>${css}</style>
<defs><clipPath id="frame"><rect width="${W}" height="${H}" rx="14"/></clipPath><clipPath id="tapeClip"><rect x="0" y="${H - 52}" width="${W}" height="52"/></clipPath></defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<g class="hdr">
  <rect x="40" y="34" width="${r1(symW)}" height="44" rx="4" fill="${c.amber}"/>
  <text x="${r1(40 + symW / 2)}" y="64" text-anchor="middle" font-family="${MONO}" font-size="22" font-weight="700" fill="${c.onAmber}">${escapeXml(symbol)}</text>
  <text x="${nameX}" y="56" font-family="${SANS}" font-size="${nameSize}" font-weight="700" fill="${c.fg}"${fitAttrs(name, nameSize, nameMax, 'sansBold')}>${escapeXml(name)}</text>
  <text x="${nameX}" y="80" font-family="${SANS}" font-size="13" fill="${c.muted}"${fitAttrs(role, 13, nameMax, 'sans')}>${escapeXml(role.length > 70 ? `${role.slice(0, 68)}…` : role)}</text>
</g>
<g class="qt" font-family="${MONO}">
  ${stats
    .map(
      ([label, value], i) =>
        `<text x="${610 + i * 108}" y="50" font-size="10.5" letter-spacing="1" fill="${c.muted}">${label}</text><text x="${610 + i * 108}" y="74" font-size="17" fill="${c.fg}">${value}</text>`
    )
    .join('')}
  <rect class="flash" x="${W - 40 - textWidth(priceText, 40, 'mono') - 14}" y="22" width="${r1(textWidth(priceText, 40, 'mono') + 22)}" height="50" rx="4" fill="${dir}" opacity="0"/>
  <text x="${W - 40}" y="62" text-anchor="end" font-size="40" font-weight="700" fill="${c.fg}">${priceText}</text>
  <text x="${W - 40}" y="88" text-anchor="end" font-size="13" fill="${dir}">${arrow} ${signed(t.change)}${t.pct === null ? '' : ` (${pctText(t.pct)})`} 1Y</text>
</g>
<line x1="40" y1="108" x2="${W - 40}" y2="108" stroke="${c.grid}"/>
<text class="gr" x="40" y="134" font-family="${MONO}" font-size="11" letter-spacing="1" fill="${c.muted}">${escapeXml(symbol)} · ACTIVITY INDEX (CONTRIBUTIONS, TRAILING ${WINDOW} DAYS) · 1W CANDLES · <tspan fill="${c.amber}">— MA 4W</tspan> · VOL = ACTIVE DAYS</text>
<g class="gr">${grid}${monthLabels}<line x1="${X0}" y1="${V1}" x2="${X1}" y2="${V1}" stroke="${c.grid}"/></g>
${vols}
${candles}
${t.candles.length > 1 ? `<path class="ma" d="${ma}" fill="none" stroke="${c.amber}" stroke-width="1.6" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>` : ''}
${callout}
${
  lastC
    ? `<g class="px"><line x1="${lastX}" y1="${lastY}" x2="${X1 + 4}" y2="${lastY}" stroke="${dir}" stroke-dasharray="2 3"/><rect x="${X1 + 4}" y="${r1(lastY - 11)}" width="${W - 40 - X1 - 4}" height="22" rx="3" fill="${dir}"/><text x="${X1 + 12}" y="${r1(lastY + 4.5)}" font-family="${MONO}" font-size="12" font-weight="700" fill="${c.bg}">${priceText}</text></g>
<circle class="ping" cx="${lastX}" cy="${lastY}" r="4" fill="none" stroke="${dir}" stroke-width="1.5"/><circle class="px" cx="${lastX}" cy="${lastY}" r="3" fill="${dir}"/>`
    : ''
}
<g class="tape">
  <rect y="${H - 52}" width="${W}" height="52" fill="${themeName === 'dark' ? c.tape : '#0f1726'}"/>
  <line x1="0" y1="${H - 52}" x2="${W}" y2="${H - 52}" stroke="${c.grid}"/>
  <g clip-path="url(#tapeClip)" font-family="${MONO}" font-size="12"><g class="run">${tapeText}</g></g>
  <rect y="${H - 52}" width="160" height="52" fill="${c.amber}"/>
  <text x="80" y="${H - 21}" text-anchor="middle" font-family="${MONO}" font-size="12" font-weight="700" letter-spacing="2" fill="${c.onAmber}">WATCHLIST</text>
</g>
</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Fundamentals — stat sheet, sector allocation, monthly change
// ---------------------------------------------------------------------------

export function fundamentalsSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 460;
  const t = tickerNumbers(profile);

  const cells = [
    ['VOLUME · 12M', fmt(t.total), 'contributions'],
    ['SESSIONS', fmt(t.active), 'active days'],
    ['BEST SESSION', fmt(t.best?.count || 0), t.best ? formatDate(t.best.date) : 'no activity yet'],
    ['LONGEST RALLY', `${t.streak}`, t.streak === 1 ? 'day in a row' : 'days in a row'],
    ['MARKET CAP', compact(t.stars), 'stars on public repos'],
    ['HOLDERS', compact(t.followers), 'followers'],
    ['LISTED', String(t.since), 'joined GitHub'],
    ['AVG / SESSION', t.perActive ? t.perActive.toFixed(1) : '0', 'per active day'],
  ];
  const stat = cells
    .map(([label, value, sub], i) => {
      const x = 40 + (i % 2) * 262;
      const y = 120 + Math.floor(i / 2) * 82;
      return `<g class="cell" style="animation-delay:${(0.2 + i * 0.07).toFixed(2)}s">
  <rect x="${x}" y="${y}" width="250" height="72" rx="6" fill="${c.panel}"/>
  <text x="${x + 16}" y="${y + 22}" font-family="${MONO}" font-size="10.5" letter-spacing="1.2" fill="${c.muted}">${label}</text>
  <text x="${x + 16}" y="${y + 52}" font-family="${SANS}" font-size="24" font-weight="700" fill="${c.fg}">${escapeXml(value)}</text>
  <text x="${x + 234}" y="${y + 52}" text-anchor="end" font-family="${SANS}" font-size="11.5" fill="${c.muted}">${escapeXml(sub)}</text>
</g>`;
    })
    .join('\n');

  // Sector allocation.
  const langs = t.languages;
  const bx = 600;
  const bw = 440;
  const sector = langs.length
    ? langs
        .map((l, i) => {
          const y = 138 + i * 30;
          const w = Math.max(3, l.share * bw);
          return `<text x="${bx}" y="${y + 4}" font-family="${MONO}" font-size="11" fill="${c.fg}"${fitAttrs(l.name.toUpperCase(), 11, 108, 'mono')}>${escapeXml(l.name.toUpperCase())}</text>
<rect x="${bx + 116}" y="${y - 7}" width="${bw - 116}" height="12" rx="2" fill="${c.panel}"/>
<rect class="bar" style="animation-delay:${(0.5 + i * 0.1).toFixed(2)}s" x="${bx + 116}" y="${y - 7}" width="${r1(Math.max(3, (w * (bw - 116)) / bw))}" height="12" rx="2" fill="${i ? c.fg : c.amber}" fill-opacity="${i ? 0.55 - i * 0.07 : 1}"/>
<text x="${W - 40}" y="${y + 4}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${c.fg}">${(l.share * 100).toFixed(1)}%</text>`;
        })
        .join('\n')
    : `<text x="${bx}" y="160" font-family="${SANS}" font-size="14" fill="${c.muted}">No language data yet.</text>`;

  // Monthly change.
  const months = t.months;
  const mw = (W - 40 - bx) / Math.max(1, months.length);
  const monthly = months
    .map((m, i) => {
      const prev = months[i - 1]?.total;
      const pct = i && prev > 0 ? (m.total - prev) / prev : null;
      const x = bx + i * mw;
      const pos = pct !== null && pct >= 0;
      const color = pct === null ? c.muted : pos ? c.up : c.down;
      const txt = pct === null ? '—' : `${pos ? '▲' : '▼'}${Math.min(999, Math.abs(Math.round(pct * 100)))}`;
      return `<g class="cell" style="animation-delay:${(0.8 + i * 0.05).toFixed(2)}s"><rect x="${r1(x + 1)}" y="352" width="${r1(mw - 2)}" height="54" rx="3" fill="${color}" fill-opacity="${pct === null ? 0.08 : 0.08 + Math.min(1, Math.abs(pct)) * 0.22}"/>
<text x="${r1(x + mw / 2)}" y="372" text-anchor="middle" font-family="${MONO}" font-size="10" fill="${c.muted}">${m.label}</text>
<text x="${r1(x + mw / 2)}" y="394" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="${color}">${txt}</text></g>`;
    })
    .join('\n');

  const css = `
.hdr{animation:rise .8s ${EXPO} both}
.cell{animation:rise .7s ${EXPO} both}
.bar{transform-box:fill-box;transform-origin:left center;animation:grow 1s ${EXPO} both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes grow{from{transform:scaleX(0)}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    `Fundamentals for ${opts.symbol}: ${fmt(t.total)} contributions on ${t.active} active days, best day ${t.best ? `${t.best.count} on ${formatDate(t.best.date)}` : 'none'}, longest streak ${t.streak} days, ${fmt(t.stars)} stars, ${fmt(t.followers)} followers, on GitHub since ${t.since}.${langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : ''} Monthly change in contributions shown for the last twelve months.`
  )}">
<style>${css}</style>
<rect width="${W}" height="${H}" rx="14" fill="${c.bg}"/>
<g class="hdr" font-family="${MONO}">
  <text x="40" y="58" font-size="13" font-weight="700" letter-spacing="2" fill="${c.amber}">FUNDAMENTALS · ${escapeXml(opts.symbol)}</text>
  <text x="${W - 40}" y="58" text-anchor="end" font-size="11" letter-spacing="1" fill="${c.muted}">@${escapeXml(profile.login.toUpperCase())} · LAST 12 MONTHS</text>
  <line x1="40" y1="76" x2="${W - 40}" y2="76" stroke="${c.grid}"/>
  <text x="40" y="104" font-size="10.5" letter-spacing="1.4" fill="${c.muted}">KEY STATISTICS</text>
  <text x="${bx}" y="104" font-size="10.5" letter-spacing="1.4" fill="${c.muted}">SECTOR ALLOCATION · LANGUAGE SHARE</text>
  <text x="${bx}" y="338" font-size="10.5" letter-spacing="1.4" fill="${c.muted}">MONTHLY CHANGE · CONTRIBUTIONS VS PRIOR MONTH, %</text>
</g>
${stat}
${sector}
${monthly}
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Closing bell — sparkline and sign-off
// ---------------------------------------------------------------------------

export function closingSvg(profile, themeName, opts) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 200;
  const t = tickerNumbers(profile);
  const up = t.change >= 0;
  const dir = t.change === 0 ? c.muted : up ? c.up : c.down;
  const sx0 = 820;
  const sx1 = 1160;
  const sy0 = 56;
  const sy1 = 140;
  const peak = Math.max(1, ...t.index);
  const pts = t.index.map((v, i) => `${r1(sx0 + ((sx1 - sx0) * i) / Math.max(1, t.index.length - 1))} ${r1(sy1 - ((sy1 - sy0) * v) / peak)}`);
  const line = pts.length > 1 ? `M${pts.join(' L')}` : '';
  const signSize = fitSize(opts.signoff, 700, 30, 18, 'sans');

  const css = `
.a{animation:rise .9s ${EXPO} .2s both}
.b{animation:rise .9s ${EXPO} .45s both}
.spark{animation:draw 2.2s cubic-bezier(.4,0,.2,1) .3s both}
.area{animation:fade 1s ease-out 2s both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}}
@keyframes draw{from{stroke-dashoffset:1}}
@keyframes fade{from{opacity:0}}
${REDUCED}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`Closing bell for ${opts.symbol}: ${opts.signoff}`)}">
<style>${css}</style>
<rect width="${W}" height="${H}" rx="14" fill="${c.bg}"/>
<text class="a" x="40" y="62" font-family="${MONO}" font-size="12" font-weight="700" letter-spacing="2.2" fill="${c.amber}">● CLOSING BELL · ${escapeXml(opts.symbol)} · ${escapeXml(formatDate(t.to || new Date().toISOString().slice(0, 10), 'caps'))}</text>
<text class="a" x="40" y="108" font-family="${SANS}" font-size="${signSize}" font-weight="700" fill="${c.fg}"${fitAttrs(opts.signoff, signSize, 740, 'sans')}>${escapeXml(opts.signoff)}</text>
<text class="b" x="40" y="148" font-family="${MONO}" font-size="11" letter-spacing="0.6" fill="${c.muted}">Index = contributions in the trailing ${WINDOW} days. Source: public GitHub activity. Not investment advice.</text>
${line ? `<path class="area" d="${line} L${sx1} ${sy1} L${sx0} ${sy1} Z" fill="${dir}" fill-opacity="0.1"/><path class="spark" d="${line}" fill="none" stroke="${dir}" stroke-width="1.6" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>` : ''}
<g class="b" font-family="${MONO}" text-anchor="end">
  <text x="${sx1}" y="168" font-size="13" font-weight="700" fill="${c.fg}">CLOSE ${fmt(t.last)} <tspan fill="${dir}">${t.change === 0 ? '■' : up ? '▲' : '▼'} ${signed(t.change)}${t.pct === null ? '' : ` ${pctText(t.pct)}`}</tspan></text>
</g>
</svg>`;
}
