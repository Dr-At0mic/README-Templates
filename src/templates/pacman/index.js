// Pacman — the README itself. Visual Showcase archetype (github-profile-readme skill) with a retro
// arcade persona accent: one animated attract screen, centred identity and links, then real
// substance — the scoreboard with a plain-language key, projects as text ("the ghosts"), languages
// as text, and an end card. Every image is self-hosted and fully described.

import { endSvg, featuredRepos, heroSvg, pacNumbers, scoreSvg } from './art';

const ASSETS = {
  heroDark: 'assets/pacman-hero-dark.svg',
  heroLight: 'assets/pacman-hero-light.svg',
  scoreDark: 'assets/pacman-score-dark.svg',
  scoreLight: 'assets/pacman-score-light.svg',
  endDark: 'assets/pacman-end-dark.svg',
  endLight: 'assets/pacman-end-light.svg',
};

const DEFAULT_SIGNOFF = 'Thanks for playing!';

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
  const o = p.templateData?.pacman || {};
  return {
    role: o.role?.trim() || '',
    signoff: o.signoff?.trim() || DEFAULT_SIGNOFF,
  };
}

export function render(p) {
  const opts = options(p);
  const name = p.name || p.login;
  const n = pacNumbers(p);
  const ghosts = featuredRepos(p).slice(0, 4);
  const extra = featuredRepos(p).slice(4);
  const fmt = (v) => v.toLocaleString('en-US');
  const langs = (p.languages || []).slice(0, 6);
  const day = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
  const stars = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v);

  const out = [
    picture(
      ASSETS.heroDark,
      ASSETS.heroLight,
      `${name}: ${(p.headline || 'GitHub profile').replace(/[.!?\s]+$/, '')}. An arcade maze built from the last year of contributions, one pellet per day and bigger on busier days, with the name in neon over it. A demo game plays: the chomper eats its way to a power pellet (one of the busiest days) and then eats the ghosts, which are the featured repositories. ${fmt(n.total)} contributions on ${fmt(n.active)} active days; best day ${n.maxDay}; longest streak ${n.streak} ${n.streak === 1 ? 'day' : 'days'}.`
    ),
    '',
    `<p align="center"><b>${html(name)}</b>${opts.role ? ` · ${html(opts.role)}` : ''}${p.headline ? ` · ${html(p.headline)}` : ''}</p>`,
    links(p),
    '',
  ];

  if (p.intro) out.push(`**Player 1.** ${p.intro}`, '');
  if (p.now) out.push(`**Now playing:** ${p.now}`, '');

  out.push(
    '#### Scoreboard',
    '',
    picture(
      ASSETS.scoreDark,
      ASSETS.scoreLight,
      `Scoreboard. ${ghosts.length ? `Meet the ghosts, one per featured project: ${ghosts.map((r) => r.name).join(', ')}.` : 'No featured projects yet.'} High scores: ${fmt(n.total)} contributions, ${fmt(n.active)} active days, a ${n.streak}-day streak, ${n.maxDay} on the best day${n.peak ? ` (${day(n.peak.date)})` : ''}, ${fmt(n.stars)} stars, ${fmt(n.followers)} followers, ${n.years} ${n.years === 1 ? 'year' : 'years'} on GitHub.` +
        (langs.length ? ` Bonus items, the languages: ${langs.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.` : '')
    ),
    '',
    '<details>',
    '<summary><sub>How to read the board</sub></summary>',
    '',
    `- **The maze is your year:** one column per week of the last 12 months and one row per weekday (Sunday on top), like the contribution calendar. Every day is a pellet, bigger and brighter on busier days; a faint dot is a day off.`,
    `- **Power pellets** are your busiest days. In the demo, the chomper eats its way to one of them and powers up.`,
    `- **The ghosts** are your featured repos, one each. Once it's powered up, the chomper eats them, and each one pops its stars before floating home to the pen.`,
    `- **The walls** are generated from your username and mirrored like an arcade board, so every board is different. The tunnel on Wednesdays wraps around.`,
    `- **HUD:** the score is your contributions over the year, alongside your best day, your longest streak, and your level: years on GitHub.`,
    `- **High scores** are your numbers, ranked the way an arcade ranks them. **Bonus items** are your languages by share of code.`,
    '',
    '<sub>Artwork: original animated SVG, generated by README Templates · template: Pacman. Motion stops if your system asks for reduced motion.</sub>',
    '',
    '</details>',
    ''
  );

  if (ghosts.length) {
    out.push('#### The ghosts', '');
    [...ghosts, ...extra].forEach((repo) => {
      out.push(`- **[${repo.name}](${repo.url})**${repo.description ? ` · ${repo.description}` : ''}  `);
      const meta = [repo.language, repo.stars ? `★ ${stars(repo.stars)}` : ''].filter(Boolean).join(' · ');
      if (meta) out.push(`  <sub>${meta}</sub>`);
    });
    out.push('');
  }

  if (langs.length) out.push(`**Power-ups:** ${langs.map((l) => l.name).join(' · ')}`, '');

  out.push(picture(ASSETS.endDark, ASSETS.endLight, `End card: an arcade intermission, a ghost chasing the chomper across the screen and a giant chomper chasing it back. Then the sign-off: ${opts.signoff}`));

  return {
    markdown: out.join('\n') + '\n',
    assets: {
      [ASSETS.heroDark]: heroSvg(p, 'dark', opts),
      [ASSETS.heroLight]: heroSvg(p, 'light', opts),
      [ASSETS.scoreDark]: scoreSvg(p, 'dark'),
      [ASSETS.scoreLight]: scoreSvg(p, 'light'),
      [ASSETS.endDark]: endSvg(p, 'dark', opts),
      [ASSETS.endLight]: endSvg(p, 'light', opts),
    },
  };
}

export const pacman = {
  id: 'pacman',
  name: 'Pacman',
  tagline:
    'Your year as an arcade maze: a pellet for every day, your busiest days as power pellets, your repos as the ghosts. A demo game plays out, then the high scores.',
  animated: true,
  tags: ['Animated', 'Retro', 'Arcade'],
  hero: (p, theme) => heroSvg(p, theme, options(p)),
  fields: [
    {
      key: 'role',
      label: 'Player class',
      help: 'Shown after PLAYER 1 over your name, and beside it in the text. Empty shows your @handle.',
      maxLength: 32,
      placeholder: () => 'e.g. Backend engineer',
    },
    {
      key: 'signoff',
      label: 'Closing line',
      help: 'The chomper writes it out on the end card.',
      maxLength: 40,
      placeholder: () => DEFAULT_SIGNOFF,
    },
  ],
  render,
};
