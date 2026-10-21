// Pulsar — generative SVG artwork.
// The header is a ridgeline plot in the spirit of PSR B1919+21 (the "Unknown Pleasures" cover):
// twelve stacked ridges, one per month, each shaped by that month's daily contributions.
// The strata panel draws the language mix as geological layers.
//
// GitHub serves README images through a proxy as plain <img>: no web fonts, no scripts,
// no external references. Everything here is self-contained and uses system font stacks.

import { seededRandom } from '../../lib/random';

const SANS = "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

// Matched to GitHub's own light and dark canvases so the cards sit naturally on the profile page.
export const THEMES = {
  dark: { bg: '#0d1117', fg: '#e6edf3', muted: '#8b949e', faint: '#30363d', accent: '#f2b84b' },
  light: { bg: '#ffffff', fg: '#1f2328', muted: '#59636e', faint: '#d1d9e0', accent: '#b3790a' },
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const r1 = (n) => Math.round(n * 10) / 10;

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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

/** Group daily counts into the last 12 calendar months. */
export function monthlySeries(days) {
  const byMonth = new Map();
  for (const d of days) {
    const key = d.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(d.count);
  }
  return [...byMonth.entries()].slice(-12).map(([key, counts]) => ({
    label: MONTHS[Number(key.slice(5, 7)) - 1],
    counts,
    total: counts.reduce((a, b) => a + b, 0),
  }));
}

// Gaussian-blurred read of a daily series at a fractional position.
function blurAt(counts, pos, sigma = 1.3) {
  let sum = 0;
  let weight = 0;
  const lo = Math.max(0, Math.floor(pos - sigma * 3));
  const hi = Math.min(counts.length - 1, Math.ceil(pos + sigma * 3));
  for (let k = lo; k <= hi; k++) {
    const w = Math.exp(-((k - pos) ** 2) / (2 * sigma * sigma));
    sum += counts[k] * w;
    weight += w;
  }
  return weight ? sum / weight : 0;
}

function ridge(counts, peak, rand, { x0, x1, base, amp, samples = 84 }) {
  const phase = rand() * Math.PI * 2;
  const points = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const envelope = Math.exp(-(((t - 0.5) / 0.23) ** 2));
    // The month's days span the middle 72% of the ridge; the tails stay quiet, as in the original plot.
    const inner = (t - 0.14) / 0.72;
    const value = inner >= 0 && inner <= 1 && counts.length ? blurAt(counts, inner * (counts.length - 1)) : 0;
    const signal = Math.sqrt(value / peak);
    const grain = Math.abs(Math.sin(t * 41 + phase) * 0.5 + (rand() - 0.5)) * 0.09;
    const h = amp * envelope * (0.06 + 0.94 * signal + grain);
    points.push([x0 + t * (x1 - x0), base - h]);
  }
  return points;
}

function smoothPath(points) {
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${r1(x)} ${r1(y)} ${r1((x + nx) / 2)} ${r1((y + ny) / 2)}`;
  }
  const last = points[points.length - 1];
  return d + ` L${r1(last[0])} ${r1(last[1])}`;
}

export function headerSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 440;
  const months = monthlySeries(profile.contributions?.days || []);
  const peak = Math.max(1, ...months.flatMap((m) => m.counts.map((_, i) => blurAt(m.counts, i))));
  const busiest = months.reduce((best, m, i) => (m.total > (months[best]?.total ?? -1) ? i : best), 0);
  const rand = seededRandom(`pulsar:${profile.login}`);

  const x0 = 600;
  const x1 = 1108;
  const step = 26;
  const top = H - 46 - step * (months.length - 1);

  let ridges = '';
  months.forEach((m, i) => {
    const base = top + i * step;
    const pts = ridge(m.counts, peak, rand, { x0, x1, base, amp: 86 });
    const line = smoothPath(pts);
    const stroke = i === busiest && m.total > 0 ? c.accent : c.fg;
    // Fill first so each ridge hides the ones behind it, then stroke only the crest.
    ridges += `<path d="${line} L${x1} ${base + 2} L${x0} ${base + 2} Z" fill="${c.bg}"/>`;
    ridges += `<path d="${line}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`;
    ridges += `<text x="${x1 + 16}" y="${base + 3.5}" font-family="${MONO}" font-size="10" letter-spacing="1" fill="${i === busiest ? c.accent : c.muted}">${m.label}</text>`;
  });

  const name = profile.name || profile.login;
  const nameSize = Math.round(Math.max(30, Math.min(56, 470 / (name.length * 0.56))));
  const headline = wrap(profile.headline, 40, 3);
  const total = (profile.contributions?.total || 0).toLocaleString('en-US');
  const meta = [
    profile.location,
    profile.joinedYear ? `on github since ${profile.joinedYear}` : '',
    `${total} contributions · last 12 months`,
  ].filter(Boolean);

  const headlineText = headline
    .map((line, i) => `<tspan x="64" dy="${i === 0 ? 0 : 29}">${escapeXml(line)}</tspan>`)
    .join('');
  const metaText = meta
    .map((line, i) => {
      const y = H - 56 - (meta.length - 1 - i) * 24;
      return `<rect x="64" y="${y - 7}" width="6" height="6" fill="${c.fg}"/><text x="82" y="${y}" font-family="${MONO}" font-size="13" fill="${c.muted}">${escapeXml(line)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(`${name} — ${profile.headline || ''}`)}">
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${c.bg}" stroke="${c.faint}"/>
<text x="64" y="84" font-family="${MONO}" font-size="13" letter-spacing="1.5" fill="${c.muted}">@${escapeXml(profile.login)}</text>
<text x="64" y="${84 + 22 + nameSize}" font-family="${SANS}" font-size="${nameSize}" font-weight="600" letter-spacing="-1" fill="${c.fg}">${escapeXml(name)}</text>
<text x="64" y="${84 + 22 + nameSize + 46}" font-family="${SANS}" font-size="20" fill="${c.muted}">${headlineText}</text>
${metaText}
${ridges}
</svg>`;
}

export function strataSvg(profile, themeName) {
  const c = THEMES[themeName];
  const W = 1200;
  const H = 248;
  const rand = seededRandom(`strata:${profile.login}`);

  let langs = (profile.languages || []).slice(0, 5);
  const rest = 1 - langs.reduce((sum, l) => sum + l.share, 0);
  if (rest > 0.01) langs = [...langs, { name: 'Other', share: rest }];
  if (!langs.length) langs = [{ name: 'No public code yet', share: 1 }];

  const x0 = 64;
  const x1 = 856;
  const yTop = 80;
  const depth = 132;
  // √share keeps minor layers legible next to a dominant one; labels carry the exact numbers.
  const raw = langs.map((l) => Math.max(8, Math.sqrt(l.share) * depth));
  const scale = depth / raw.reduce((a, b) => a + b, 0);
  const thick = raw.map((t) => t * scale);

  // Boundary j sits between band j-1 and band j; inner boundaries undulate, never enough to cross.
  const bounds = [];
  let acc = yTop;
  for (let j = 0; j <= langs.length; j++) {
    const room = Math.min(thick[j - 1] ?? 99, thick[j] ?? 99);
    const amp = j === langs.length ? 0 : Math.min(7, room * 0.34);
    const f1 = 0.006 + rand() * 0.006;
    const f2 = 0.017 + rand() * 0.01;
    const p1 = rand() * 6.28;
    const p2 = rand() * 6.28;
    const y = acc;
    bounds.push((x) => y + amp * (Math.sin(x * f1 + p1) + 0.45 * Math.sin(x * f2 + p2)) / 1.45);
    acc += thick[j] ?? 0;
  }

  const xs = [];
  for (let x = x0; x <= x1; x += 8) xs.push(x);
  if (xs[xs.length - 1] !== x1) xs.push(x1);

  const opacity = [0.95, 0.72, 0.52, 0.36, 0.24, 0.13];
  let bands = '';
  let labels = '';
  const labelTop = yTop - 6;
  const labelStep = (depth + 12) / langs.length;

  langs.forEach((lang, i) => {
    const upper = xs.map((x) => `${r1(x)} ${r1(bounds[i](x))}`);
    const lower = [...xs].reverse().map((x) => `${r1(x)} ${r1(bounds[i + 1](x))}`);
    bands += `<path d="M${upper.join(' L')} L${lower.join(' L')} Z" fill="${c.fg}" fill-opacity="${opacity[i] ?? 0.1}"/>`;
    // A hairline in the page colour keeps adjacent layers legible.
    bands += `<path d="M${upper.join(' L')}" fill="none" stroke="${c.bg}" stroke-width="1.2"/>`;

    const midY = (bounds[i](x1) + bounds[i + 1](x1)) / 2;
    const labelY = labelTop + labelStep * (i + 0.5) + 4;
    const pct = lang.share < 0.01 ? '<1%' : `${Math.round(lang.share * 100)}%`;
    labels += `<path d="M${x1 + 8} ${r1(midY)} L${x1 + 34} ${r1(labelY - 4)} L${x1 + 44} ${r1(labelY - 4)}" fill="none" stroke="${c.faint}" stroke-width="1"/>`;
    labels += `<text x="${x1 + 52}" y="${r1(labelY)}" font-family="${SANS}" font-size="15" fill="${c.fg}">${escapeXml(lang.name)}</text>`;
    labels += `<text x="${W - 64}" y="${r1(labelY)}" text-anchor="end" font-family="${MONO}" font-size="13" fill="${c.muted}">${pct}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml('Languages: ' + langs.map((l) => l.name).join(', '))}">
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${c.bg}" stroke="${c.faint}"/>
<text x="64" y="52" font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${c.muted}">STRATA · LANGUAGES BY BYTES ACROSS PUBLIC REPOS</text>
${bands}
${labels}
</svg>`;
}
