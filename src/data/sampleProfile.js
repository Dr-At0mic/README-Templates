// Static sample profile. This is the ONLY data source when no GitHub token is connected —
// the app makes no API calls in that state. The person is fictional.

import { seededRandom } from '../lib/random';

function sampleContributions() {
  const rand = seededRandom('sample-contributions');
  const days = [];
  const today = new Date();
  let streak = 0;
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    // Bursty, like real work: occasional multi-day pushes on top of a quiet baseline.
    if (streak === 0 && rand() < 0.06) streak = 3 + Math.floor(rand() * 9);
    const burst = streak > 0 ? (streak--, 4 + rand() * 14) : 0;
    const base = rand() < (weekend ? 0.25 : 0.7) ? rand() * 5 : 0;
    days.push({ date: d.toISOString().slice(0, 10), count: Math.round(base + burst) });
  }
  return { total: days.reduce((sum, d) => sum + d.count, 0), days };
}

const repos = [
  { name: 'tidewater', description: 'Streaming time-series store for sensor fleets. Append-only, compressed, queryable at the edge.', url: 'https://github.com/sample-user/tidewater', stars: 2140, language: 'Rust' },
  { name: 'loom-ui', description: 'Headless component primitives with typed state machines and zero runtime CSS.', url: 'https://github.com/sample-user/loom-ui', stars: 868, language: 'TypeScript' },
  { name: 'kiln', description: 'Reproducible build cache that fits in a single static binary.', url: 'https://github.com/sample-user/kiln', stars: 412, language: 'Go' },
  { name: 'fieldnotes', description: 'Essays and working notes on distributed systems, written in public.', url: 'https://github.com/sample-user/fieldnotes', stars: 157, language: 'MDX' },
  { name: 'pg-sketch', description: 'Probabilistic sketches (HLL, t-digest) as a Postgres extension.', url: 'https://github.com/sample-user/pg-sketch', stars: 96, language: 'C' },
];

export const SAMPLE_PROFILE = {
  source: 'sample',
  login: 'sample-user',
  name: 'Alex Rivera',
  headline: 'Systems engineer. I build storage engines and the tools around them.',
  intro:
    'I work on the boring, load-bearing parts of software — storage, build systems, and the protocols in between. Lately that means **tidewater**, a time-series store that runs on hardware most databases would refuse to boot on.',
  now: 'Writing a columnar compaction scheduler and a long post about why it was harder than expected.',
  location: 'Lisbon, PT',
  website: 'https://example.com',
  email: 'alex@example.com',
  twitter: '',
  linkedin: '',
  avatarUrl: '',
  joinedYear: 2014,
  followers: 1830,
  repos,
  featured: repos.slice(0, 4).map((r) => r.name),
  languages: [
    { name: 'Rust', share: 0.41 },
    { name: 'TypeScript', share: 0.24 },
    { name: 'Go', share: 0.16 },
    { name: 'C', share: 0.09 },
    { name: 'Python', share: 0.06 },
    { name: 'Shell', share: 0.04 },
  ],
  contributions: sampleContributions(),
};
