// Dapur Kilat — the six house recipes. Each recipe lists its ingredients
// and which ones need chopping (ayam) or the wok. A plate is "done" when
// it holds exactly the recipe's ingredients in their finished state.

export const RECIPES = [
  {
    id: 'nasi-goreng-kilat',
    name: 'Nasi Goreng Kilat',
    ingredients: ['nasi', 'telur', 'sayur'],
    needsChop: [],
    needsWok: true,
    price: 12,
  },
  {
    id: 'mie-goreng-pedas',
    name: 'Mie Goreng Pedas',
    ingredients: ['mi', 'cabai', 'ayam'],
    needsChop: ['ayam'],
    needsWok: true,
    price: 14,
  },
  {
    id: 'nasi-ayam-geprek',
    name: 'Nasi Ayam Geprek',
    ingredients: ['nasi', 'ayam', 'cabai'],
    needsChop: ['ayam'],
    needsWok: false,
    price: 13,
  },
  {
    id: 'mie-telur-sayur',
    name: 'Mie Telur Sayur',
    ingredients: ['mi', 'telur', 'sayur'],
    needsChop: [],
    needsWok: true,
    price: 11,
  },
  {
    id: 'nasi-sate-kilat',
    name: 'Nasi Sate Kilat',
    ingredients: ['nasi', 'ayam', 'sayur'],
    needsChop: ['ayam'],
    needsWok: false,
    price: 13,
  },
  {
    id: 'mie-goreng-spesial',
    name: 'Mie Goreng Spesial',
    ingredients: ['mi', 'telur', 'ayam', 'cabai'],
    needsChop: ['ayam'],
    needsWok: true,
    price: 18,
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

// Coin value of a recipe before tip and combo multiplier.
export function priceFor(recipe) {
  return recipe.price;
}

// The two base ingredients a dish is built on (nasi or mi).
export function baseOf(recipe) {
  return recipe.ingredients.find((i) => i === 'nasi' || i === 'mi') || null;
}

// True when the finished items on a plate match a recipe exactly:
// same multiset of ingredients, each in its finished state.
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.ingredients.length) return false;
  const have = [...plateItems].sort();
  const want = [...recipe.ingredients].sort();
  return have.every((item, i) => item === want[i]);
}

// Find the recipe a finished plate matches, or null.
export function recipeForPlate(plateItems) {
  return RECIPES.find((r) => plateMatchesRecipe(plateItems, r)) || null;
}

// Ingredients of a recipe that still need chopping before they are usable.
export function chopNeeded(recipe) {
  return recipe.needsChop;
}
