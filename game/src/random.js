// Dapur Kilat — seeded RNG (mulberry32). Every random choice in the game
// goes through this so a fixed seed replays the same shift, which is what
// the deterministic screenshot staging relies on. Never call Math.random
// in game logic; keep it out of anything that affects rendered output.

export function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick an element from an array using the seeded rng.
export function pick(rng, array) {
  return array[Math.floor(rng() * array.length)];
}

// Integer in [min, max] inclusive, from the seeded rng.
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Fisher-Yates shuffle driven by the seeded rng (returns a new array).
export function shuffle(rng, array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Read ?seed= from the page URL; fall back to 1 when absent or invalid.
export function seedFromUrl(search) {
  const params = new URLSearchParams(search || '');
  const raw = Number(params.get('seed'));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}
