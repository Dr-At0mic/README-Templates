// Breakdown — the README itself. Visual Showcase archetype (github-profile-readme skill) with a
// persona accent for CG and VFX artists: one cinematic hero, centred identity and links (the
// showreel first), then real substance — the comp script with a plain-language key, projects as
// credits, the toolkit as text, and an end card. Every image is self-hosted and fully described.
//
// Dedicated to Vijay Pratap Pandey, VFX compositor (https://vijayvisuals.github.io/).

import { breakdownNumbers, FIRST_FRAME, heroSvg, scriptSvg, wrapSvg } from './art';

const ASSETS = {
  heroDark: 'assets/breakdown-hero-dark.svg',
  heroLight: 'assets/breakdown-hero-light.svg',
  scriptDark: 'assets/breakdown-script-dark.svg',
  scriptLight: 'assets/breakdown-script-light.svg',
  endDark: 'assets/breakdown-end-dark.svg',
  endLight: 'assets/breakdown-end-light.svg',
};

const DEFAULT_SIGNOFF = 'Thanks for watching.';

const html = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isUrl = (s) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(String(s || '').trim());

function picture(dark, light, alt) {
  return [
    '<p align="center">',
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="./${dark}">`,
    `  <img alt="${html(alt)}" src="./${light}" width="100%">`,
    '</picture>',
    '</p>',
  ].join('\n');
}

function links(p, reel) {
  const twitter = p.twitter?.replace(/^@/, '');
  const items = [
    reel && `<a href="${html(reel)}">▶ Showreel</a>`,
    p.website && `<a href="${html(p.website)}">${html(p.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`,
    p.email && `<a href="mailto:${html(p.email)}">${html(p.email)}</a>`,
    twitter && `<a href="https://x.com/${html(twitter)}">X @${html(twitter)}</a>`,
    p.linkedin && `<a href="${html(p.linkedin)}">LinkedIn</a>`,
  ].filter(Boolean);
  return items.length ? `<p align="center">${items.join(' &nbsp;·&nbsp; ')}</p>` : '';
}

const defaultToolkit = (p) => (p.languages || []).slice(0, 4).map((l) => l.name).join(' · ');

function options(p) {
  const o = p.templateData?.breakdown || {};
  const reel = o.reel?.trim();
  return {
    role: o.role?.trim() || '',
    reel: isUrl(reel) ? reel : '',
    toolkit: o.toolkit?.trim() || defaultToolkit(p),
    signoff: o.signoff?.trim() || DEFAULT_SIGNOFF,
  };
}

export function render(p) {
  const opts = options(p);
  const name = p.name || p.login;
  const n = breakdownNumbers(p);
  const featured = p.featured.map((r) => p.repos.find((x) => x.name === r)).filter(Boolean);
  const fmt = (v) => v.toLocaleString('en-US');
  const langs = (p.languages || []).slice(0, 6);
  const last = FIRST_FRAME + n.frames - 1;
  const ver = `v${String(n.version).padStart(3, '0')}`;
  const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

  const out = [
    picture(
      ASSETS.heroDark,
      ASSETS.heroLight,
      `${name}: ${(p.headline || 'GitHub profile').replace(/[.!?\s]+$/, '')}. A visual-effects shot breakdown: a city with one tower for every day of the last year, as tall as that day was busy, shown as wireframe, clay, normals and depth passes and then the final sunset beauty pass, with the name as the title. ${fmt(n.total)} contributions on ${fmt(n.active)} active days.`
    ),
    '',
    `<p align="center"><b>${html(name)}</b>${opts.role ? ` · ${html(opts.role)}` : ''}${p.headline ? ` · ${html(p.headline)}` : ''}</p>`,
    links(p, opts.reel),
    '',
  ];

  if (p.intro) out.push(`**Logline.** ${p.intro}`, '');
  if (p.now) out.push(`**In production:** ${p.now}`, '');

  out.push(
    '#### Comp script',
    '',
    picture(
      ASSETS.scriptDark,
      ASSETS.scriptLight,
      `Comp script: the last year is the background plate, frames ${FIRST_FRAME} to ${last}` +
        (featured.length ? `, with ${featured.map((r) => r.name).join(', ')} merged over it` : '') +
        `, then graded, written out as ${ver} and viewed. Render log: ${fmt(n.total)} contributions on ${fmt(n.active)} active days, longest streak ${n.streak} ${n.streak === 1 ? 'day' : 'days'}, longest break ${n.rest} ${n.rest === 1 ? 'day' : 'days'}` +
        (n.peak ? `, peak day ${day(n.peak.date)} with ${fmt(n.peak.count)}` : '') +
        `, ${fmt(n.followers)} followers, ${fmt(n.stars)} stars, on GitHub since ${n.since}.` +
        (langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : '')
    ),
    '',
    '<details>',
    '<summary><sub>Reading the breakdown</sub></summary>',
    '',
    `- **The shot:** one tower per day of the last 12 months and one row per week, laid out like the contribution calendar (Sunday on the left). A tower is as tall as that day was busy, relative to your busiest day. This week is nearest the camera; the oldest week recedes toward the sun.`,
    `- **The passes:** wireframe, clay, normals and depth are the render passes a CG artist checks before a shot goes out. The hero wipes through them to the final beauty pass, the way a breakdown reel does.`,
    `- **The timeline:** one frame per day, from frame ${FIRST_FRAME} (where shots start) to ${last}. Bar heights are daily contributions, and the diamond marks your busiest day.`,
    `- **Comp script:** the year is the background plate. Featured repositories are Read nodes merged over it, each with a material preview in its language colour. The result is graded, then written out as version ${ver}: one version for every active day.`,
    `- **Colour chart:** language share by bytes across public repositories, above a grey ramp.`,
    `- **The end card:** an on-set lighting reference kit, with a grey ball, a chrome ball reflecting the shot's sunset and a colour chart.`,
    '',
    '<sub>Artwork: original animated SVG, generated by README Templates · template: Breakdown. Motion stops if your system asks for reduced motion.</sub>',
    '',
    '</details>',
    ''
  );

  if (featured.length) {
    out.push('#### Credits', '');
    featured.forEach((repo) => {
      out.push(`- **[${repo.name}](${repo.url})**${repo.description ? ` · ${repo.description}` : ''}  `);
      const meta = [repo.language, repo.stars ? `★ ${repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}` : '']
        .filter(Boolean)
        .join(' · ');
      if (meta) out.push(`  <sub>${meta}</sub>`);
    });
    out.push('');
  }

  if (opts.toolkit) out.push(`**Toolkit:** ${opts.toolkit}`, '');

  out.push(
    picture(
      ASSETS.endDark,
      ASSETS.endLight,
      `End card: an on-set lighting reference kit, with a grey ball, a chrome ball and a colour chart. ${opts.signoff}${opts.reel ? ' The showreel link is above.' : ''}`
    )
  );

  return {
    markdown: out.join('\n') + '\n',
    assets: {
      [ASSETS.heroDark]: heroSvg(p, 'dark', opts),
      [ASSETS.heroLight]: heroSvg(p, 'light', opts),
      [ASSETS.scriptDark]: scriptSvg(p, 'dark', opts),
      [ASSETS.scriptLight]: scriptSvg(p, 'light', opts),
      [ASSETS.endDark]: wrapSvg(p, 'dark', opts),
      [ASSETS.endLight]: wrapSvg(p, 'light', opts),
    },
  };
}

export const breakdown = {
  id: 'breakdown',
  name: 'Breakdown',
  tagline:
    'Your year as a VFX shot: a city with a tower for every day, wiped from wireframe through clay, normals and depth to a sunset beauty pass. Your repos become a comp script.',
  dedication: { text: 'For Vijay Pratap Pandey, VFX compositor', url: 'https://vijayvisuals.github.io/' },
  animated: true,
  tags: ['Animated', 'Cinematic', 'VFX'],
  hero: (p, theme) => heroSvg(p, theme, options(p)),
  fields: [
    {
      key: 'role',
      label: 'Discipline',
      help: 'Shown above your name in the title, like a credit. Empty shows your @handle.',
      maxLength: 32,
      placeholder: () => 'e.g. VFX Compositor',
    },
    {
      key: 'reel',
      label: 'Showreel link',
      help: 'Your reel on Vimeo, YouTube or ArtStation. Leads your links and the end card.',
      maxLength: 160,
      placeholder: () => 'https://',
    },
    {
      key: 'toolkit',
      label: 'Toolkit',
      help: 'The software you work in. Shown in the comp script and as text.',
      maxLength: 64,
      placeholder: (p) => defaultToolkit(p) || 'e.g. Nuke · Houdini · Blender · Python',
    },
    {
      key: 'signoff',
      label: 'Closing line',
      help: 'Signs off the end card.',
      maxLength: 52,
      placeholder: () => DEFAULT_SIGNOFF,
    },
  ],
  render,
};
