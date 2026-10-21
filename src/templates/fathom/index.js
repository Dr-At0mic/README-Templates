// Fathom — the README itself. Visual Showcase archetype (github-profile-readme skill) with a
// persona accent: one cinematic hero, centred identity and links, then real substance — the dive
// log with a plain-language key, and projects as sightings. Every image is self-hosted and fully
// described; everything a recruiter or screen reader needs is real text.

import { defaultSite, fathomNumbers, heroSvg, logSvg, surfaceSvg } from './art';

const ASSETS = {
  heroDark: 'assets/fathom-hero-dark.svg',
  heroLight: 'assets/fathom-hero-light.svg',
  logDark: 'assets/fathom-log-dark.svg',
  logLight: 'assets/fathom-log-light.svg',
  endDark: 'assets/fathom-end-dark.svg',
  endLight: 'assets/fathom-end-light.svg',
};

const DEFAULT_SIGNOFF = 'Thanks for diving in.';
const DEFAULT_POSTSCRIPT = 'The water’s fine. Come say hi.';

const html = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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

function links(p) {
  const twitter = p.twitter?.replace(/^@/, '');
  const items = [
    p.website && `<a href="${html(p.website)}">${html(p.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`,
    p.email && `<a href="mailto:${html(p.email)}">${html(p.email)}</a>`,
    twitter && `<a href="https://x.com/${html(twitter)}">X @${html(twitter)}</a>`,
    p.linkedin && `<a href="${html(p.linkedin)}">LinkedIn</a>`,
  ].filter(Boolean);
  return items.length ? `<p align="center">${items.join(' &nbsp;·&nbsp; ')}</p>` : '';
}

function options(p) {
  const o = p.templateData?.fathom || {};
  return {
    site: o.site?.trim() || defaultSite(p),
    signoff: o.signoff?.trim() || DEFAULT_SIGNOFF,
    postscript: o.postscript?.trim() || DEFAULT_POSTSCRIPT,
  };
}

export function render(p) {
  const opts = options(p);
  const name = p.name || p.login;
  const n = fathomNumbers(p);
  const featured = p.featured.map((r) => p.repos.find((x) => x.name === r)).filter(Boolean);
  const fmt = (v) => v.toLocaleString('en-US');
  const langs = (p.languages || []).slice(0, 5);
  const zone = n.zone.name.toLowerCase();
  const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

  const out = [
    picture(
      ASSETS.heroDark,
      ASSETS.heroLight,
      `${name}: ${(p.headline || 'GitHub profile').replace(/[.!?\s]+$/, '')}. Cinematic title card: the camera descends onto a reef grown from the last 52 weeks of contributions,${
        featured.length ? ' fish named after featured repositories swim past,' : ''
      } and a depth gauge settles at ${fmt(n.depth)} metres, the ${zone} zone.`
    ),
    '',
    `<p align="center"><b>${html(name)}</b>${p.headline ? ` · ${html(p.headline)}` : ''}</p>`,
    links(p),
    '',
  ];

  if (p.intro) out.push(`**On the surface.** ${p.intro}`, '');
  if (p.now) out.push(`**Currently diving into:** ${p.now}`, '');

  const crossed = n.crossings.map((x) => `the ${x.zone.name.toLowerCase()} zone on ${day(x.date)}`);
  out.push(
    '#### Dive log',
    '',
    picture(
      ASSETS.logDark,
      ASSETS.logLight,
      `The last 365 days as a dive: ${fmt(n.depth)} metres down at one metre per contribution, reaching the ${zone} zone` +
        (crossed.length ? ` (${crossed.join(', ')})` : '') +
        `. ${fmt(n.active)} active days, longest streak ${n.streak} days, longest break ${n.rest?.length || 0} days, ${fmt(n.followers)} followers, ${fmt(n.stars)} stars, ${n.years} ${n.years === 1 ? 'year' : 'years'} on GitHub.` +
        (langs.length ? ` Languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : '')
    ),
    '',
    '<details>',
    '<summary><sub>Reading the dive log</sub></summary>',
    '',
    `- **Depth:** one metre per contribution in the last 12 months. ${fmt(n.depth)} m puts you in the ${zone} zone. The zones are the ocean’s real ones: sunlit to 200 m, twilight to 1,000 m, midnight to 4,000 m, abyssal to 6,000 m and hadal below that, down to the Challenger Deep at 10,935 m.`,
    `- **The descent:** your year as one dive, left to right. The line drops as contributions add up and runs flat through breaks. Each bubble is an active day; bigger bubbles are busier days.` +
      (crossed.length ? ` You reached ${crossed.join(', ')}.` : ''),
    `- **Logbook:** bottom time is active days, longest dive is the longest streak, safety stop is the longest break, visibility is followers, treasure is stars, and time in the water is years on GitHub.`,
    `- **Species spotted:** language share by bytes across public repositories. The Latin is made up.`,
    `- **On sonar:** featured repositories. The nearer the centre, the more stars.`,
    `- **The opening shot:** the reef is the last 52 weeks, one coral per week. Taller corals are busier weeks, and each glowing polyp is one active day. The fish are featured repositories, sized by stars.`,
    '',
    '<sub>Artwork: original animated SVG, generated by README Templates · template: Fathom. Motion stops if your system asks for reduced motion.</sub>',
    '',
    '</details>',
    ''
  );

  if (featured.length) {
    out.push('#### Sightings', '');
    featured.forEach((repo) => {
      out.push(`- **[${repo.name}](${repo.url})**${repo.description ? ` · ${repo.description}` : ''}  `);
      const meta = [repo.language, repo.stars ? `★ ${repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}` : '']
        .filter(Boolean)
        .join(' · ');
      if (meta) out.push(`  <sub>${meta}</sub>`);
    });
    out.push('');
  }

  out.push(picture(ASSETS.endDark, ASSETS.endLight, `Back at the surface beside a diver-down buoy and a message in a bottle. ${opts.signoff} ${opts.postscript}`));

  return {
    markdown: out.join('\n') + '\n',
    assets: {
      [ASSETS.heroDark]: heroSvg(p, 'dark', opts),
      [ASSETS.heroLight]: heroSvg(p, 'light', opts),
      [ASSETS.logDark]: logSvg(p, 'dark', opts),
      [ASSETS.logLight]: logSvg(p, 'light', opts),
      [ASSETS.endDark]: surfaceSvg(p, 'dark', opts),
      [ASSETS.endLight]: surfaceSvg(p, 'light', opts),
    },
  };
}

export const fathom = {
  id: 'fathom',
  name: 'Fathom',
  tagline: 'The camera dives onto a living reef grown from your year, your repos swim past as fish, and a depth gauge sinks one metre per contribution.',
  animated: true,
  tags: ['Animated', 'Cinematic', 'Nature'],
  hero: (p, theme) => heroSvg(p, theme, options(p)),
  fields: [
    {
      key: 'site',
      label: 'Dive site',
      help: 'Named in the opening shot, the dive log and the logbook.',
      maxLength: 28,
      placeholder: (p) => defaultSite(p),
    },
    {
      key: 'signoff',
      label: 'Closing line',
      help: 'Rises out of the water on the end card.',
      maxLength: 32,
      placeholder: () => DEFAULT_SIGNOFF,
    },
    {
      key: 'postscript',
      label: 'Postscript',
      help: 'Under the waterline, beneath the closing line.',
      maxLength: 56,
      placeholder: () => DEFAULT_POSTSCRIPT,
    },
  ],
  render,
};
