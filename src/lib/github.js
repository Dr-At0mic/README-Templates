// Minimal GitHub client. Only called when the user has supplied a token —
// without one the app never touches the network for profile data.

const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(token, path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const hint = res.status === 401 ? 'Token rejected — check it is valid and not expired.' : null;
    throw new GitHubError(hint || data?.message || `GitHub responded ${res.status}`, res.status);
  }
  return data;
}

const PROFILE_QUERY = `
query {
  viewer {
    login name bio location websiteUrl twitterUsername email company createdAt avatarUrl url
    followers { totalCount }
    socialAccounts(first: 10) { nodes { provider url } }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { name description url stargazerCount isPrivate primaryLanguage { name } } }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC,
                 orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes {
        name description url stargazerCount
        primaryLanguage { name }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const toRepo = (r) => ({
  name: r.name,
  description: r.description || '',
  url: r.url,
  stars: r.stargazerCount,
  language: r.primaryLanguage?.name || '',
});

/** Fetch the token owner's profile, normalised to the shape templates consume. */
export async function fetchProfile(token) {
  const res = await request(token, '/graphql', { method: 'POST', body: { query: PROFILE_QUERY } });
  if (res?.errors?.length) throw new GitHubError(res.errors[0].message);
  const v = res.data.viewer;

  // Public, non-fork repos only: the README is public, so private names must never leak into it.
  const repos = v.repositories.nodes.filter((r) => r.name.toLowerCase() !== v.login.toLowerCase()).map(toRepo);
  const pinned = v.pinnedItems.nodes.filter((r) => r && !r.isPrivate).map(toRepo);
  const byStars = [...repos].sort((a, b) => b.stars - a.stars);
  const candidates = dedupeByName([...pinned, ...byStars]).slice(0, 12);

  const bytes = new Map();
  for (const repo of v.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      bytes.set(edge.node.name, (bytes.get(edge.node.name) || 0) + edge.size);
    }
  }

  const days = v.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }));

  const social = (provider) => v.socialAccounts.nodes.find((s) => s.provider === provider)?.url || '';

  return {
    source: 'github',
    login: v.login,
    name: v.name || v.login,
    headline: v.bio || '',
    intro: '',
    now: '',
    location: v.location || '',
    website: v.websiteUrl || '',
    email: v.email || '',
    twitter: v.twitterUsername || '',
    linkedin: social('LINKEDIN'),
    avatarUrl: v.avatarUrl,
    joinedYear: new Date(v.createdAt).getFullYear(),
    followers: v.followers.totalCount,
    totalStars: v.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
    repos: candidates,
    featured: candidates.slice(0, 4).map((r) => r.name),
    languages: toShares(bytes),
    contributions: { total: v.contributionsCollection.contributionCalendar.totalContributions, days },
  };
}

function dedupeByName(list) {
  const seen = new Set();
  return list.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
}

function toShares(bytes) {
  const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  return [...bytes.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, size]) => ({ name, share: size / total }));
}

// ---------------------------------------------------------------------------
// Publishing
// ---------------------------------------------------------------------------

/** Inspect <login>/<login> without changing anything, so the user can confirm. */
export async function inspectProfileRepo(token, login) {
  let repo;
  try {
    repo = await request(token, `/repos/${login}/${login}`);
  } catch (err) {
    if (err.status === 404) return { exists: false };
    throw err;
  }
  let hasReadme = false;
  try {
    await request(token, `/repos/${login}/${login}/readme`);
    hasReadme = true;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  return {
    exists: true,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch,
    url: repo.html_url,
    hasReadme,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Write every file to <login>/<login> in a single commit, creating the repo first if needed.
 * files: [{ path, content }] — UTF-8 text.
 */
export async function publishProfile(token, { login, files, message }, onStep = () => {}) {
  const base = `/repos/${login}/${login}`;
  let repo;
  try {
    repo = await request(token, base);
  } catch (err) {
    if (err.status !== 404) throw err;
    onStep(`Creating ${login}/${login}`);
    repo = await request(token, '/user/repos', {
      method: 'POST',
      body: { name: login, description: 'GitHub profile README', auto_init: true, private: false },
    });
  }
  if (repo.private) {
    throw new GitHubError(`${login}/${login} is private. Profile READMEs only show from a public repo — make it public first.`);
  }
  const branch = repo.default_branch;

  onStep('Reading current branch');
  let ref = null;
  for (let attempt = 0; attempt < 4 && !ref; attempt++) {
    try {
      ref = await request(token, `${base}/git/ref/heads/${branch}`);
    } catch (err) {
      // 409 = empty repo; 404 = auto_init still settling. Retry briefly, then fall back.
      if (err.status !== 404 && err.status !== 409) throw err;
      await sleep(700);
    }
  }
  if (!ref) return publishFileByFile(token, base, repo, files, message, onStep);

  onStep('Writing files');
  const parent = await request(token, `${base}/git/commits/${ref.object.sha}`);
  const tree = await request(token, `${base}/git/trees`, {
    method: 'POST',
    body: {
      base_tree: parent.tree.sha,
      tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.content })),
    },
  });
  onStep('Committing');
  const commit = await request(token, `${base}/git/commits`, {
    method: 'POST',
    body: { message, tree: tree.sha, parents: [ref.object.sha] },
  });
  await request(token, `${base}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha } });

  return { profileUrl: `https://github.com/${login}`, repoUrl: repo.html_url, commitUrl: commit.html_url };
}

// Empty repos have no ref to build a tree on; the contents API can seed them one file at a time.
async function publishFileByFile(token, base, repo, files, message, onStep) {
  let last;
  for (const file of files) {
    onStep(`Writing ${file.path}`);
    let sha;
    try {
      sha = (await request(token, `${base}/contents/${file.path}`)).sha;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    last = await request(token, `${base}/contents/${file.path}`, {
      method: 'PUT',
      body: { message, content: toBase64(file.content), ...(sha ? { sha } : {}) },
    });
  }
  return { profileUrl: `https://github.com/${repo.owner.login}`, repoUrl: repo.html_url, commitUrl: last?.commit?.html_url };
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
