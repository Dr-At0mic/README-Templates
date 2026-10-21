// Shōnen — the character sheet. Every number comes from the profile; the power level is
// deliberately, gloriously meaningless, and the README says so.

const clamp = (x) => Math.max(0, Math.min(1, x));
const logScore = (value, max) => clamp(Math.log10(value + 1) / Math.log10(max + 1));

export function longestStreak(days) {
  let best = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

const CLASSES = {
  Rust: 'Borrow-Checker Paladin',
  TypeScript: 'Type Sorcerer',
  JavaScript: 'Callback Samurai',
  Go: 'Gopher Ronin',
  Python: 'Serpent Sage',
  C: 'Pointer Berserker',
  'C++': 'Template Necromancer',
  'C#': 'Sharp Blade Knight',
  Java: 'Bean Knight',
  Kotlin: 'Coroutine Monk',
  Swift: 'Swift Striker',
  Ruby: 'Gem Alchemist',
  PHP: 'Elephant Tamer',
  Elixir: 'Potion Brewer',
  Haskell: 'Monad Mystic',
  Scala: 'Implicit Oracle',
  Shell: 'Terminal Shinobi',
  Lua: 'Moon Summoner',
  Dart: 'Widget Weaver',
  Zig: 'Comptime Duelist',
  HTML: 'Markup Illusionist',
  CSS: 'Cascade Illusionist',
  Vue: 'Reactive Spellblade',
  Svelte: 'Compiler Phantom',
  'Jupyter Notebook': 'Notebook Seer',
  MDX: 'Lore Keeper',
};

export function defaultClass(profile) {
  const top = profile.languages?.[0]?.name;
  return (top && CLASSES[top]) || 'Wandering Coder';
}

export function computeStats(profile) {
  const days = profile.contributions?.days || [];
  const total = profile.contributions?.total || 0;
  const active = days.filter((d) => d.count > 0).length;
  const streak = longestStreak(days);
  const stars = profile.totalStars ?? (profile.repos || []).reduce((sum, r) => sum + (r.stars || 0), 0);
  const languages = (profile.languages || []).filter((l) => l.share >= 0.01).length;

  const stats = [
    { key: 'STR', label: 'Contributions, last 12 months', value: total, score: logScore(total, 4000) },
    { key: 'AGI', label: 'Active days', value: active, score: clamp(active / Math.max(1, days.length || 365)) },
    { key: 'END', label: 'Longest streak (days)', value: streak, score: clamp(streak / 60) },
    { key: 'INT', label: 'Languages wielded', value: languages, score: clamp(languages / 8) },
    { key: 'CHA', label: 'Stars earned', value: stars, score: logScore(stars, 5000) },
  ];

  const average = stats.reduce((sum, s) => sum + s.score, 0) / stats.length;
  const rank = average >= 0.85 ? 'S' : average >= 0.7 ? 'A' : average >= 0.5 ? 'B' : average >= 0.3 ? 'C' : 'D';
  const power = Math.round(total * 9 + stars * 21 + (profile.followers || 0) * 13 + active * 7 + streak * 42);

  return { stats, rank, power, over9000: power > 9000 };
}

export const POWER_FORMULA = 'contributions×9 + stars×21 + followers×13 + active days×7 + longest streak×42';
