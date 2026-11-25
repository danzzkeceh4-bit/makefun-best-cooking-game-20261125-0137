// Dapur Kilat — constants: canvas, colours, stations, prices, timings.
// All layout numbers live here so render.js and world.js never hard-code them.

export const VIEW = { width: 1280, height: 720 };

export const SHIFT_SECONDS = 180;
export const RUSH_EVERY_SECONDS = 60;
export const RUSH_TIP_MULTIPLIER = 1.5;
export const MAX_ACTIVE_ORDERS = 3;
export const ORDER_PATIENCE_SECONDS = 45;
export const FIRST_ORDER_DELAY = 2;
export const ORDER_INTERVAL_SECONDS = 25;
export const RUSH_ORDER_INTERVAL_SECONDS = 15;

export const CHOP_SECONDS = 2.2;
export const COOK_SECONDS = 6;
export const BURN_SECONDS = 11;

export const COIN_BASE = 10;
export const TIP_MAX = 8;

export const PLAYER_SPEED = 260; // px per second
export const PLAYER_RADIUS = 20;
export const INTERACT_RADIUS = 86;

export const COLORS = {
  floor: '#c98f4e',
  floorDark: '#b57a3e',
  wall: '#7a3b2e',
  wallTop: '#8f4636',
  counter: '#e8d9b0',
  counterEdge: '#a8895a',
  board: '#2e2a26',
  boardPaper: '#fff6dd',
  wok: '#3a3a3f',
  wokHot: '#c0392b',
  plate: '#f5f2e8',
  plateEdge: '#c9c2a8',
  window: '#f2c14e',
  text: '#2b2118',
  textLight: '#fff6dd',
  accent: '#e2572b',
  gold: '#f2c14e',
  green: '#3e9b4f',
  red: '#d43d2a',
  steam: 'rgba(255,255,255,0.55)',
};

// Ingredient colours used by the renderer (one swatch per ingredient).
export const INGREDIENT_COLORS = {
  nasi: '#f3ead2',
  mi: '#e8b64c',
  telur: '#f7f3e3',
  ayam: '#e8a06a',
  sayur: '#4da34d',
  cabai: '#d43d2a',
};

// Ingredient display names (Indonesian, shown on the counter).
export const INGREDIENT_LABELS = {
  nasi: 'Nasi',
  mi: 'Mi',
  telur: 'Telur',
  ayam: 'Ayam',
  sayur: 'Sayur',
  cabai: 'Cabai',
};

// Stations: name, rect, and the verb shown in the prompt line.
// The counter row spans x 280..920 so the shift timer can sit to its
// right (x 940..1240) without covering any ingredient bin.
export const STATIONS = {
  counter: [
    { id: 'nasi', label: 'Nasi', x: 280, y: 96, w: 100, h: 64 },
    { id: 'mi', label: 'Mi', x: 386, y: 96, w: 100, h: 64 },
    { id: 'telur', label: 'Telur', x: 492, y: 96, w: 100, h: 64 },
    { id: 'ayam', label: 'Ayam', x: 598, y: 96, w: 100, h: 64 },
    { id: 'sayur', label: 'Sayur', x: 704, y: 96, w: 100, h: 64 },
    { id: 'cabai', label: 'Cabai', x: 810, y: 96, w: 100, h: 64 },
  ],
  board: { x: 48, y: 96, w: 216, h: 300 },
  chopping: { x: 120, y: 520, w: 170, h: 110, label: 'Talenan' },
  wokA: { x: 480, y: 540, w: 150, h: 100, label: 'Wajan 1' },
  wokB: { x: 660, y: 540, w: 150, h: 100, label: 'Wajan 2' },
  plating: { x: 900, y: 520, w: 170, h: 110, label: 'Meja Plating' },
  window: { x: 1120, y: 300, w: 120, h: 220, label: 'Jendela Saji' },
};

// Where the cook starts each shift.
export const PLAYER_START = { x: 640, y: 400 };

// Burned food goes here; dumping it costs the combo.
export const TRASH = { x: 60, y: 620, w: 110, h: 70, label: 'Tempat Sampah' };
