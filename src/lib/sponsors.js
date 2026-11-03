// GitHub Sponsors: the sponsor wall and goal bar for READMEs, and the Sponsors page form of a template.
//
// Privacy rules, because all of this ends up on public pages:
// - Only public sponsorships are used. The query already asks for that and normalizeSponsorships checks
//   it again, so a private sponsor can't reach a README even if the API behaves differently.
// - No dollar amounts or tier names are shown. GitHub's default tier names contain the price ("$5 a
//   month") and GitHub itself doesn't reveal a public sponsor's tier. Amounts only decide the grouping.
// - Income and payout figures are never requested.

import { attr, badgeSvg, renderLinks } from './links';

const MAX_PER_GROUP = 40;

const LABELS = {
  top: {
    label: 'Top sponsors',
    size: 64,
    icon: { color: '#E3B341', path: 'M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8L12 2.5Z' },
  },
  regular: {
    label: 'Sponsors',
    size: 44,
    icon: { color: '#BF3989', path: 'M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.9 12 21 12 21Z' },
  },
  oneTime: {
    label: 'One-time supporters',
    size: 32,
    icon: { color: '#30363D', stroked: true, path: 'M4 10h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5Zm13 1h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12.5 3v3' },
  },
};

// API nodes → the sponsors a README may show.
export function normalizeSponsorships(nodes) {
  return (nodes || []).flatMap((node) => {
    const entity = node?.sponsorEntity;
    if (node?.privacyLevel !== 'PUBLIC' || !entity?.login) return [];
    return [
      {
        login: entity.login,
        name: entity.name || entity.login,
        url: /^https:\/\//.test(entity.url || '') ? entity.url : '',
        avatarUrl: entity.avatarUrl || '',
        oneTime: Boolean(node.isOneTimePayment),
        monthly: node.tier?.monthlyPriceInDollars ?? 0,
      },
    ];
  });
}

// Top sponsors are those at the highest monthly amount, but only when amounts actually differ: if
// everyone pays the same, nobody is "top".
export function groupSponsors(sponsors) {
  const oneTime = sponsors.filter((s) => s.oneTime);
  const monthly = sponsors.filter((s) => !s.oneTime).sort((a, b) => b.monthly - a.monthly);
  const highest = monthly[0]?.monthly ?? 0;
  const varied = monthly.some((s) => s.monthly !== highest);
  return {
    top: varied ? monthly.filter((s) => s.monthly === highest) : [],
    regular: varied ? monthly.filter((s) => s.monthly !== highest) : monthly,
    oneTime,
  };
}

// Used when a sponsor has no avatar URL, which in practice means the fictional sample sponsors: sample
// mode makes no network calls.
function monogramSvg(name, size = 128) {
  const initials = name.split(/[\s-]+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  const hue = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${attr(name)}"><rect width="128" height="128" rx="16" fill="hsl(${hue} 45% 32%)"/><text x="64" y="80" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="46" font-weight="600" fill="#fff">${attr(initials)}</text></svg>`;
}

const goalPercent = (goal) => Math.max(0, Math.min(100, Math.round(goal.percentComplete ?? 0)));

export function goalSvg(goal) {
  const percent = goalPercent(goal);
  const title = (goal.title || 'Sponsorship goal').slice(0, 52);
  const width = 480;
  const track = width - 32;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="64" viewBox="0 0 ${width} 64" role="img" aria-label="${attr(title)}: ${percent}%">`,
    `<rect x=".5" y=".5" width="${width - 1}" height="63" rx="8" fill="#161B22" stroke="#808080" stroke-opacity=".4"/>`,
    `<g font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">`,
    `<text x="16" y="26">${attr(title)}</text><text x="${width - 16}" y="26" text-anchor="end">${percent}%</text></g>`,
    `<rect x="16" y="38" width="${track}" height="10" rx="5" fill="#30363D"/>`,
    percent > 0 ? `<rect x="16" y="38" width="${Math.max(10, (track * percent) / 100)}" height="10" rx="5" fill="#2EA043"/>` : '',
    '</svg>',
  ].join('');
}

// The README section thanking sponsors. Nothing at all when it's off or there's nothing to show, so a
// README never carries an empty thank-you.
export function renderSponsorWall(p, { align = 'center', goal = true, theme = null, filePrefix = '' } = {}) {
  const data = p.sponsorData;
  const empty = { html: '', assets: {} };
  if (!p.sponsorWall || !data) return empty;

  const shownGoal = goal && data.goal ? data.goal : null;
  const groups = groupSponsors(data.sponsors || []);
  const assets = {};
  const centre = align === 'center';
  const open = centre ? '<p align="center">' : '<p>';
  const rows = [];

  if (shownGoal) {
    assets['assets/sponsors/goal.svg'] = goalSvg(shownGoal);
    const alt = `${shownGoal.title || 'Sponsorship goal'}: ${goalPercent(shownGoal)}% reached`;
    rows.push(`${open}<img src="./assets/sponsors/goal.svg" alt="${attr(alt)}" width="480"></p>`);
  }

  for (const key of ['top', 'regular', 'oneTime']) {
    const members = groups[key];
    if (!members.length) continue;
    const { size, icon } = LABELS[key];
    const label = theme?.[key] ?? LABELS[key].label;
    const labelFile = `assets/sponsors/${filePrefix}${key}.svg`;
    assets[labelFile] = badgeSvg(icon, label);
    const faces = members.slice(0, MAX_PER_GROUP).map((s) => {
      let src = s.avatarUrl;
      if (!src) {
        const file = `assets/sponsors/avatar-${s.login}.svg`;
        assets[file] = monogramSvg(s.name);
        src = `./${file}`;
      }
      const face = `<img src="${attr(src)}" alt="${attr(s.name)}" title="${attr(s.name)}" width="${size}" height="${size}">`;
      return s.url ? `<a href="${attr(s.url)}">${face}</a>` : face;
    });
    const more = members.length > MAX_PER_GROUP ? ` <sub>and ${members.length - MAX_PER_GROUP} more</sub>` : '';
    rows.push(`${open}<img src="./${labelFile}" alt="${attr(label)}" height="28"><br>${faces.join(' ')}${more}</p>`);
  }

  if (!rows.length) return empty;
  const title = attr(theme?.heading ?? 'Thanks to my sponsors');
  const heading = centre ? `<h4 align="center">${title}</h4>` : `<h4>${title}</h4>`;
  return { html: [heading, ...rows].join('\n\n'), assets };
}

// The Sponsors page has no repo to resolve relative paths against, so images need full URLs. HEAD follows
// whichever default branch the profile repo uses.
export const sponsorsAssetBase = (login) => `https://raw.githubusercontent.com/${login}/${login}/HEAD/`;

// Fills a template's options with its Sponsors page defaults, so its art says the right thing until the
// user writes their own line.
function withPageDefaults(template, p) {
  const defaults = template.sponsorPage.defaults;
  if (!defaults) return p;
  const own = Object.fromEntries(Object.entries(p.templateData?.[template.id] || {}).filter(([, value]) => value?.trim?.()));
  return { ...p, templateData: { ...p.templateData, [template.id]: { ...defaults, ...own } } };
}

// A template's second form: Markdown for the Introduction field of a GitHub Sponsors profile. Each template
// describes its own page in `sponsorPage` (words, panels, sponsor names), and this assembles it. The art has
// to read on both GitHub themes without <picture> (unverified on Sponsors pages), so it uses the dark
// variants, which carry their own backgrounds.
export function renderSponsorsPage(template, profile) {
  const page = template.sponsorPage;
  const p = withPageDefaults(template, profile);
  const id = template.id;
  const align = page.align ?? 'center';
  const open = align === 'center' ? '<p align="center">' : '<p>';
  const name = p.name || p.login;
  const links = renderLinks(p, { align, sponsorsPage: true, lead: page.leadLinks?.(p) ?? [] });
  const wall = renderSponsorWall(p, { align, goal: false, theme: page.wall, filePrefix: `${id}-` });
  const featured = (p.featured || []).map((n) => p.repos.find((r) => r.name === n)).filter(Boolean);
  const assets = { ...links.assets, ...wall.assets };

  const image = (slot, svg, alt) => {
    const file = `assets/sponsors/${id}-${slot}.svg`;
    assets[file] = svg;
    return `${open}<img src="./${file}" alt="${attr(alt)}" width="100%"></p>`;
  };

  const role = page.role?.(p);
  const out = [
    image('hero', template.hero(p, 'dark'), page.heroAlt(p, name)),
    '',
    `${open}<b>${attr(name)}</b>${[role, p.headline].filter(Boolean).map((text) => ` · ${attr(text)}`).join('')}</p>`,
    '',
  ];
  if (links.contactHtml) out.push(links.contactHtml, '');

  const pitch = p.sponsorPitch?.trim() || p.intro;
  const body = [pitch && `**${page.pitchLabel}** ${pitch}`, p.now && `**${page.nowLabel}** ${p.now}`].filter(Boolean);
  if (page.quoted && body.length) out.push(...body.flatMap((line, i) => (i ? ['>', `> ${line}`] : [`> ${line}`])), '');
  else for (const line of body) out.push(line, '');

  if (page.panel && (page.panel.show?.(p) ?? true)) {
    out.push(`#### ${page.panel.title}`, '', image('panel', page.panel.art(p), page.panel.alt(p)), '');
  }

  if (featured.length) {
    out.push(`#### ${page.fundsTitle}`, '');
    featured.forEach((repo, i) => {
      const prefix = page.repoPrefix?.(i) ?? '';
      out.push(`- ${prefix}**[${repo.name}](${repo.url})**${repo.description ? ` · ${repo.description}` : ''}  `);
      const stars = repo.stars ? `★ ${repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}` : '';
      const meta = [repo.language, stars].filter(Boolean).join(' · ');
      if (meta) out.push(`  <sub>${meta}</sub>`);
    });
    out.push('');
  }

  for (const note of page.notes?.(p) ?? []) out.push(note, '');
  if (wall.html) out.push(wall.html, '');
  // After the pitch and the thanks, so other platforms don't compete with the reason to sponsor here.
  if (links.supportHtml) out.push(links.supportHtml, '');
  out.push(`${open}<b>${attr(page.outro)}</b></p>`, '');
  if (page.end) out.push(image('end', page.end.art(p), page.end.alt(p)), '');

  const assetBase = sponsorsAssetBase(p.login);
  return {
    markdown: `${out.join('\n')}\n`.replace(/\.\/assets\//g, `${assetBase}assets/`),
    assets,
    assetBase,
  };
}
