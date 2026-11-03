// Social and support links: the supported platforms, turning what the user typed into a URL, and the
// badges shown in the README. GitHub strips inline SVG from READMEs, so each badge is an image file
// published beside the README, with no third-party badge service to depend on. Each badge carries its
// own solid background, so a single file reads on both GitHub themes.
//
// Brand paths come from Simple Icons (CC0). LinkedIn and CodePen aren't in that set, so they have small
// marks drawn here.

import {
  siArtstation,
  siBehance,
  siBluesky,
  siBuymeacoffee,
  siCashapp,
  siCodechef,
  siCodeforces,
  siDevdotto,
  siDiscord,
  siDribbble,
  siFacebook,
  siFiverr,
  siGeeksforgeeks,
  siGithubsponsors,
  siGumroad,
  siHackerrank,
  siHashnode,
  siHuggingface,
  siInstagram,
  siKaggle,
  siKofi,
  siLeetcode,
  siLiberapay,
  siLinktree,
  siMastodon,
  siMedium,
  siNpm,
  siOpencollective,
  siPatreon,
  siPaypal,
  siPinterest,
  siProducthunt,
  siRazorpay,
  siReddit,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siStackoverflow,
  siSteam,
  siStripe,
  siSubstack,
  siTelegram,
  siThreads,
  siTiktok,
  siTwitch,
  siUpwork,
  siVenmo,
  siVimeo,
  siWhatsapp,
  siX,
  siYcombinator,
  siYoutube,
} from 'simple-icons';

const brand = (si) => ({ path: si.path, color: `#${si.hex}` });

const LINKEDIN_MARK = {
  color: '#0A66C2',
  path: 'M5.6 8.2a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM3.9 20V9.9h3.4V20H3.9Zm6 0V9.9h3.2v1.4c.6-1 1.8-1.7 3.3-1.7 3 0 4.2 1.9 4.2 5V20h-3.4v-4.8c0-1.4-.4-2.6-1.8-2.6-1.5 0-2.1 1.1-2.1 2.6V20H9.9Z',
};
const CODEPEN_MARK = {
  color: '#000000',
  stroked: true,
  path: 'M12 2 22 8.5v7L12 22 2 15.5v-7L12 2Zm0 20v-6.5M22 8.5l-10 7-10-7M2 15.5l10-7 10 7M12 2v6.5',
};
const WEBSITE_MARK = {
  color: '#30363D',
  stroked: true,
  path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z',
};
const EMAIL_MARK = {
  color: '#30363D',
  stroked: true,
  path: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 7l-10 6L2 7',
};
const SHOWREEL_MARK = {
  color: '#30363D',
  stroked: true,
  path: 'M6 3.5v17l14-8.5L6 3.5Z',
};

const entry = (group) => (id, label, icon, url, extra = {}) => ({ id, label, group, ...icon, url, ...extra });
const social = entry('social');
const support = entry('support');
const FULL_LINK = 'https://…';

// `url` builds a link from a handle. Platforms where people can't be reached by a handle alone have no
// `url` and take a full link, with `host` used to recognise them in GitHub's social accounts.
export const LINK_TYPES = [
  social('x', 'X', brand(siX), (h) => `https://x.com/${h}`),
  social('linkedin', 'LinkedIn', LINKEDIN_MARK, (h) => `https://www.linkedin.com/in/${h}`),
  social('instagram', 'Instagram', brand(siInstagram), (h) => `https://www.instagram.com/${h}`),
  social('youtube', 'YouTube', brand(siYoutube), (h) => `https://www.youtube.com/@${h}`),
  social('tiktok', 'TikTok', brand(siTiktok), (h) => `https://www.tiktok.com/@${h}`),
  social('facebook', 'Facebook', brand(siFacebook), (h) => `https://www.facebook.com/${h}`),
  social('threads', 'Threads', brand(siThreads), (h) => `https://www.threads.com/@${h}`),
  social('bluesky', 'Bluesky', brand(siBluesky), (h) => `https://bsky.app/profile/${h}`, { placeholder: 'you.bsky.social' }),
  social('mastodon', 'Mastodon', brand(siMastodon), null, { placeholder: '@you@mastodon.social' }),
  social('discord', 'Discord', brand(siDiscord), (h) => `https://discord.gg/${h}`, { placeholder: 'invite code or link' }),
  social('telegram', 'Telegram', brand(siTelegram), (h) => `https://t.me/${h}`),
  social('whatsapp', 'WhatsApp', brand(siWhatsapp), (h) => `https://wa.me/${h}`, { placeholder: 'number with country code', digits: true }),
  social('reddit', 'Reddit', brand(siReddit), (h) => `https://www.reddit.com/user/${h}`),
  social('twitch', 'Twitch', brand(siTwitch), (h) => `https://www.twitch.tv/${h}`),
  social('pinterest', 'Pinterest', brand(siPinterest), (h) => `https://www.pinterest.com/${h}`),
  social('snapchat', 'Snapchat', brand(siSnapchat), (h) => `https://www.snapchat.com/add/${h}`),
  social('medium', 'Medium', brand(siMedium), (h) => `https://medium.com/@${h}`),
  social('devto', 'DEV', brand(siDevdotto), (h) => `https://dev.to/${h}`),
  social('hashnode', 'Hashnode', brand(siHashnode), (h) => `https://hashnode.com/@${h}`),
  social('substack', 'Substack', brand(siSubstack), (h) => `https://${h}.substack.com`),
  social('stackoverflow', 'Stack Overflow', brand(siStackoverflow), null, { host: 'stackoverflow.com', placeholder: FULL_LINK }),
  social('hackernews', 'Hacker News', brand(siYcombinator), (h) => `https://news.ycombinator.com/user?id=${h}`),
  social('producthunt', 'Product Hunt', brand(siProducthunt), (h) => `https://www.producthunt.com/@${h}`),
  social('leetcode', 'LeetCode', brand(siLeetcode), (h) => `https://leetcode.com/u/${h}`),
  social('hackerrank', 'HackerRank', brand(siHackerrank), (h) => `https://www.hackerrank.com/profile/${h}`),
  social('codeforces', 'Codeforces', brand(siCodeforces), (h) => `https://codeforces.com/profile/${h}`),
  social('codechef', 'CodeChef', brand(siCodechef), (h) => `https://www.codechef.com/users/${h}`),
  social('geeksforgeeks', 'GeeksforGeeks', brand(siGeeksforgeeks), (h) => `https://www.geeksforgeeks.org/user/${h}`),
  social('kaggle', 'Kaggle', brand(siKaggle), (h) => `https://www.kaggle.com/${h}`),
  social('huggingface', 'Hugging Face', brand(siHuggingface), (h) => `https://huggingface.co/${h}`),
  social('npm', 'npm', brand(siNpm), (h) => `https://www.npmjs.com/~${h}`),
  social('codepen', 'CodePen', CODEPEN_MARK, (h) => `https://codepen.io/${h}`),
  social('dribbble', 'Dribbble', brand(siDribbble), (h) => `https://dribbble.com/${h}`),
  social('behance', 'Behance', brand(siBehance), (h) => `https://www.behance.net/${h}`),
  social('artstation', 'ArtStation', brand(siArtstation), (h) => `https://www.artstation.com/${h}`),
  social('vimeo', 'Vimeo', brand(siVimeo), (h) => `https://vimeo.com/${h}`),
  social('spotify', 'Spotify', brand(siSpotify), null, { host: 'open.spotify.com', placeholder: FULL_LINK }),
  social('soundcloud', 'SoundCloud', brand(siSoundcloud), (h) => `https://soundcloud.com/${h}`),
  social('steam', 'Steam', brand(siSteam), (h) => `https://steamcommunity.com/id/${h}`),
  social('upwork', 'Upwork', brand(siUpwork), null, { host: 'upwork.com', placeholder: FULL_LINK }),
  social('fiverr', 'Fiverr', brand(siFiverr), (h) => `https://www.fiverr.com/${h}`),
  social('linktree', 'Linktree', brand(siLinktree), (h) => `https://linktr.ee/${h}`),

  support('githubsponsors', 'GitHub Sponsors', brand(siGithubsponsors), (h) => `https://github.com/sponsors/${h}`, {
    prefill: (p) => (p.source === 'github' ? p.login : ''),
  }),
  support('buymeacoffee', 'Buy Me a Coffee', brand(siBuymeacoffee), (h) => `https://buymeacoffee.com/${h}`),
  support('kofi', 'Ko-fi', brand(siKofi), (h) => `https://ko-fi.com/${h}`),
  support('patreon', 'Patreon', brand(siPatreon), (h) => `https://www.patreon.com/${h}`),
  support('paypal', 'PayPal', brand(siPaypal), (h) => `https://www.paypal.me/${h}`),
  support('opencollective', 'Open Collective', brand(siOpencollective), (h) => `https://opencollective.com/${h}`),
  support('liberapay', 'Liberapay', brand(siLiberapay), (h) => `https://liberapay.com/${h}`),
  support('gumroad', 'Gumroad', brand(siGumroad), (h) => `https://${h}.gumroad.com`),
  support('razorpay', 'Razorpay', brand(siRazorpay), (h) => `https://razorpay.me/@${h}`),
  support('stripe', 'Stripe', brand(siStripe), null, { host: 'buy.stripe.com', placeholder: FULL_LINK }),
  support('cashapp', 'Cash App', brand(siCashapp), (h) => `https://cash.app/$${h}`),
  support('venmo', 'Venmo', brand(siVenmo), (h) => `https://venmo.com/u/${h}`),
];

const BY_ID = new Map(LINK_TYPES.map((t) => [t.id, t]));
export const linkType = (id) => BY_ID.get(id);

function httpUrl(text) {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

// What the user typed, as a full link. Accepts a handle, @handle or a link, and returns null for anything
// unusable. Other schemes such as javascript: never pass, because handles are percent-encoded into a
// fixed https URL and full links must be http(s).
export function resolveLink(type, raw) {
  const value = (raw || '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return httpUrl(value);

  // A pasted link without its scheme, such as instagram.com/you.
  if (/^[\w-]+(\.[\w-]+)+\//.test(value)) return httpUrl(`https://${value}`);

  if (type.id === 'mastodon') {
    const parts = value.match(/^@?([\w.-]+)@([\w-]+(?:\.[\w-]+)+)$/);
    return parts ? httpUrl(`https://${parts[2]}/@${parts[1]}`) : null;
  }
  if (!type.url) return /^[\w-]+(\.[\w-]+)+$/.test(value) ? httpUrl(`https://${value}`) : null;
  if (type.digits) {
    const digits = value.replace(/[\s()+-]/g, '');
    return /^\d{6,15}$/.test(digits) ? type.url(digits) : null;
  }
  const handle = value.replace(/^[@$]/, '');
  return /^[\w.~+%-]+$/.test(handle) ? httpUrl(type.url(handle)) : null;
}

// A website can be typed without its scheme; only http(s) gets through.
export function resolveWebsite(raw) {
  const value = (raw || '').trim();
  if (!value) return null;
  return httpUrl(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
}

export function resolveEmail(raw) {
  const value = (raw || '').trim();
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value) ? value : null;
}

const GITHUB_PROVIDERS = {
  TWITTER: 'x',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  MASTODON: 'mastodon',
  NPM: 'npm',
  REDDIT: 'reddit',
  TWITCH: 'twitch',
  BLUESKY: 'bluesky',
};

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const typeHost = (type) => type.host || (type.url ? hostOf(type.url('x')) : '');

// The links a person already lists on their GitHub profile. Accounts GitHub files as "generic" are
// matched by hostname, and the rest are skipped rather than guessed at.
export function linksFromGitHub(twitterUsername, socialAccounts) {
  const found = new Map();
  if (twitterUsername) found.set('x', twitterUsername);
  for (const { provider, url } of socialAccounts || []) {
    const host = hostOf(url);
    const id = GITHUB_PROVIDERS[provider] ?? LINK_TYPES.find((t) => typeHost(t) === host)?.id;
    if (id && !found.has(id)) found.set(id, url);
  }
  return [...found].map(([id, value]) => ({ id, value }));
}

export const attr = (text) => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function luminance(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const WHITE = '#FFFFFF';
const BLACK = '#000000';

const onWhite = (color) => contrast(luminance(color), 1);

function darken(color) {
  const channel = (i) => Math.floor(parseInt(color.slice(i, i + 2), 16) * 0.97).toString(16).padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

// Background and ink for a brand, always readable (WCAG AA, 4.5:1). Light brands such as Buy Me a Coffee
// yellow take black. Saturated ones such as YouTube red read wrong in black, so they keep white and the
// brand colour is deepened just enough to reach AA.
export function badgeColors(color) {
  if (onWhite(color) < 3) return { background: color, ink: BLACK };
  let background = color;
  while (onWhite(background) < 4.5) background = darken(background);
  return { background, ink: WHITE };
}

const BADGE = { height: 28, padding: 10, icon: 14, gap: 7, font: 12.5 };

// Fonts differ per OS, so this only estimates width; `textLength` then fits the text to it exactly.
function labelWidth(label) {
  let units = 0;
  for (const ch of label) {
    if ('iljtfI.,:;\'|!'.includes(ch)) units += 0.34;
    else if ('mwMW@'.includes(ch)) units += 0.9;
    else if (ch === ' ') units += 0.3;
    else if (ch >= 'A' && ch <= 'Z') units += 0.68;
    else units += 0.56;
  }
  return Math.ceil(units * BADGE.font);
}

export function badgeSvg(icon, label) {
  const { height, padding, icon: size, gap, font } = BADGE;
  const textWidth = labelWidth(label);
  const width = padding + size + gap + textWidth + padding;
  const { background, ink } = badgeColors(icon.color);
  const shape = icon.stroked
    ? `fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${ink}"`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${attr(label)}">`,
    `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="6" fill="${background}" stroke="#808080" stroke-opacity=".4"/>`,
    `<g transform="translate(${padding} ${(height - size) / 2}) scale(${size / 24})"><path d="${icon.path}" ${shape}/></g>`,
    `<text x="${padding + size + gap}" y="18.4" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="${font}" font-weight="600" fill="${ink}" textLength="${textWidth}" lengthAdjust="spacingAndGlyphs">${attr(label)}</text>`,
    '</svg>',
  ].join('');
}

const shortHost = (url) => hostOf(url) || url;

export const showreelLink = (url) => ({ id: 'showreel', label: 'Showreel', href: resolveWebsite(url), icon: SHOWREEL_MARK });

function collect(p, group, skip = []) {
  return (p.links || []).flatMap(({ id, value }) => {
    const type = linkType(id);
    const href = type?.group === group && !skip.includes(id) ? resolveLink(type, value) : null;
    return href ? [{ id, label: type.label, href, icon: type }] : [];
  });
}

// The GitHub Sponsors badge appears by itself for anyone with a Sponsors profile, unless they turned it
// off or added their own link.
function automaticSponsorsBadge(p) {
  const hasOwn = (p.links || []).some((l) => l.id === 'githubsponsors');
  if (!p.sponsorData?.hasListing || p.sponsorBadge === false || hasOwn) return [];
  const type = linkType('githubsponsors');
  return [{ id: type.id, label: type.label, href: type.url(p.login), icon: type }];
}

// The README's link rows and their badge files. `align` matches how the template lays out its identity,
// `lead` puts extra links first (Breakdown's showreel), and `sponsorsPage` leaves out the GitHub Sponsors
// badge on the page that is already GitHub Sponsors.
export function renderLinks(p, { align = 'center', lead = [], sponsorsPage = false } = {}) {
  const website = resolveWebsite(p.website);
  const email = resolveEmail(p.email);
  const contact = [
    ...lead.filter((link) => link.href),
    website && { id: 'website', label: shortHost(website), href: website, icon: WEBSITE_MARK },
    email && { id: 'email', label: email, href: `mailto:${email}`, icon: EMAIL_MARK },
    ...collect(p, 'social'),
  ].filter(Boolean);
  const backing = sponsorsPage
    ? collect(p, 'support', ['githubsponsors'])
    : [...automaticSponsorsBadge(p), ...collect(p, 'support')];
  const backingLabel = sponsorsPage ? 'Other ways to support' : 'Support my work';

  const assets = {};
  const badges = (items) =>
    items
      .map(({ id, label, href, icon }) => {
        const file = `assets/links/${id}.svg`;
        assets[file] = badgeSvg(icon, label);
        return `<a href="${attr(href)}"><img src="./${file}" alt="${attr(label)}" height="${BADGE.height}"></a>`;
      })
      .join(' ');

  const open = align === 'center' ? '<p align="center">' : '<p>';
  const rows = [];
  if (contact.length) rows.push(`${open}${badges(contact)}</p>`);
  if (backing.length) rows.push(`${open}<b>${backingLabel}</b><br>${badges(backing)}</p>`);
  return { html: rows.join('\n\n'), contactHtml: contact.length ? rows[0] : '', supportHtml: backing.length ? rows.at(-1) : '', assets };
}
