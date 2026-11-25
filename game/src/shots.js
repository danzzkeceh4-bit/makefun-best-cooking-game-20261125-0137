// Dapur Kilat — deterministic screenshot staging. With ?shot=<name>&seed=1
// the game jumps straight into a fixed, hand-built scene so screenshots
// are reproducible: same seed, same pixels, every run.

import { RECIPES } from './recipes.js';
import { SHIFT_SECONDS } from './config.js';

function findRecipe(id) {
  return RECIPES.find((r) => r.id === id);
}

function makeOrder(world, recipeId, patience) {
  const recipe = findRecipe(recipeId);
  return {
    id: world.orders.length + 1,
    recipe,
    patience,
    maxPatience: 45,
  };
}

export function applyShot(world, name) {
  // Every shot starts from a fresh playing state, then FREEZES: the game
  // loop skips updates while paused, so the staged timer, patience bars
  // and order count stay exactly as designed (no drift between staging
  // and the screenshot). The pause overlay is suppressed in shot mode.
  world.screen = 'play';
  world.paused = true;
  world.shotMode = true;
  world.orders = [];
  world.plate = [];
  world.plateCarried = false;
  world.player.carrying = null;
  world.chopping = null;
  world.woks = [
    { item: null, progress: 0, burned: false },
    { item: null, progress: 0, burned: false },
  ];

  if (name === 'start') {
    // The cover: title card over the live kitchen, timer at 3:00, one order.
    world.screen = 'title';
    world.timeLeft = SHIFT_SECONDS;
    world.elapsed = 0;
    world.coins = 0;
    world.served = 0;
    world.failed = 0;
    world.combo = 0;
    world.bestCombo = 0;
    world.rush = false;
    world.orders.push(makeOrder(world, 'nasi-goreng-kilat', 38));
    world.player.x = 640;
    world.player.y = 400;
    world.message = 'Selamat datang di Dapur Kilat!';
    world.messageTimer = 3;
  } else if (name === 'chop') {
    world.timeLeft = 142;
    world.elapsed = 38;
    world.coins = 24;
    world.served = 1;
    world.combo = 1;
    world.bestCombo = 1;
    world.rush = false;
    world.orders.push(makeOrder(world, 'mie-goreng-pedas', 30));
    world.orders.push(makeOrder(world, 'nasi-ayam-geprek', 22));
    // The cook stands just below the board mid-chop; the plate already
    // holds nasi + telur, and the second wok is already frying mi.
    world.player.x = 205;
    world.player.y = 650;
    world.chopping = { ingredient: 'ayam', progress: 1.3 };
    world.plate = ['nasi', 'telur'];
    world.woks[1] = { item: { kind: 'mi', state: 'cooking' }, progress: 3.5, burned: false };
    world.message = 'Mencincang ayam…';
    world.messageTimer = 3;
  } else if (name === 'rush') {
    world.timeLeft = 42;
    world.elapsed = 138;
    world.coins = 96;
    world.served = 5;
    world.combo = 4;
    world.bestCombo = 4;
    world.rush = true;
    world.rushFlash = 0;
    world.orders.push(makeOrder(world, 'mie-goreng-spesial', 6));
    world.orders.push(makeOrder(world, 'nasi-goreng-kilat', 18));
    world.orders.push(makeOrder(world, 'mie-telur-sayur', 27));
    // A complete plate is carried to the window; one wok is cooking.
    world.player.x = 1060;
    world.player.y = 420;
    world.plate = ['mi', 'telur', 'ayam', 'cabai'];
    world.plateCarried = true;
    world.woks[0] = { item: { kind: 'nasi', state: 'cooked' }, progress: 7, burned: false };
    world.lastServe = { name: 'Mie Goreng Pedas', coins: 22, tip: 8, mult: 2 };
    world.message = 'RUSH! Tip x1,5 — cepat saji!';
    world.messageTimer = 3;
  } else if (name === 'win') {
    world.screen = 'win';
    world.timeLeft = 0;
    world.elapsed = SHIFT_SECONDS;
    world.coins = 148;
    world.served = 8;
    world.failed = 1;
    world.combo = 0;
    world.bestCombo = 5;
    world.rush = false;
    world.player.x = 1060;
    world.player.y = 420;
    world.plate = [];
    world.lastServe = { name: 'Mie Goreng Spesial', coins: 31, tip: 8, mult: 2 };
  }
}

// Read ?shot= from the URL; null when absent.
export function shotFromUrl(search) {
  const params = new URLSearchParams(search || '');
  const shot = params.get('shot');
  return ['start', 'chop', 'rush', 'win'].includes(shot) ? shot : null;
}
