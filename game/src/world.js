// Dapur Kilat — kitchen state and rules: the cook, orders, wok, chopping
// board, plating table and serving window. Pure logic; rendering lives in
// render.js. All randomness comes from the seeded rng passed at creation.

import {
  STATIONS, PLAYER_START, PLAYER_SPEED, PLAYER_RADIUS, INTERACT_RADIUS,
  SHIFT_SECONDS, RUSH_EVERY_SECONDS, MAX_ACTIVE_ORDERS, ORDER_PATIENCE_SECONDS,
  FIRST_ORDER_DELAY, ORDER_INTERVAL_SECONDS, RUSH_ORDER_INTERVAL_SECONDS,
  CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS, TIP_MAX, RUSH_TIP_MULTIPLIER,
  TRASH,
} from './config.js';
import { RECIPES, recipeForPlate } from './recipes.js';
import { makeRng, pick } from './random.js';

function rectsOverlapCircle(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

function distanceToRect(cx, cy, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  return Math.hypot(cx - nx, cy - ny);
}

export function createWorld(seed) {
  const rng = makeRng(seed);

  const solids = [
    { x: 280, y: 96, w: 640, h: 64 }, // ingredient counter row
    STATIONS.board,
    STATIONS.chopping,
    STATIONS.wokA,
    STATIONS.wokB,
    STATIONS.plating,
    STATIONS.window,
    TRASH,
  ];

  const world = {
    screen: 'title', // title | play | win
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    rush: false,
    rushFlash: 0,
    paused: false,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, carrying: null, facing: 1 },
    orders: [],
    orderTimer: FIRST_ORDER_DELAY,
    chopping: null, // { ingredient, progress }
    woks: [
      { item: null, progress: 0, burned: false },
      { item: null, progress: 0, burned: false },
    ],
    plate: [], // finished items waiting on the plating table
    plateCarried: false,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    message: '',
    messageTimer: 0,
    lastServe: null, // { name, coins, tip } for the floating banner
    alarmPlayedFor: new Set(),
    nextOrderId: 0,
    lastChopTick: -1,
  };

  function spawnOrder() {
    if (world.orders.length >= MAX_ACTIVE_ORDERS) return;
    const recipe = pick(rng, RECIPES);
    world.nextOrderId += 1;
    world.orders.push({
      id: world.nextOrderId,
      recipe,
      patience: ORDER_PATIENCE_SECONDS,
      maxPatience: ORDER_PATIENCE_SECONDS,
    });
    return true;
  }

  function nearestStation() {
    const p = world.player;
    let best = null;
    let bestDist = INTERACT_RADIUS;
    const candidates = [
      ...STATIONS.counter.map((bin) => ({ kind: 'counter', id: bin.id, label: bin.label, rect: bin })),
      { kind: 'board', label: 'Order Board', rect: STATIONS.board },
      { kind: 'chopping', label: STATIONS.chopping.label, rect: STATIONS.chopping },
      { kind: 'wok', id: 0, label: STATIONS.wokA.label, rect: STATIONS.wokA },
      { kind: 'wok', id: 1, label: STATIONS.wokB.label, rect: STATIONS.wokB },
      { kind: 'plating', label: STATIONS.plating.label, rect: STATIONS.plating },
      { kind: 'window', label: STATIONS.window.label, rect: STATIONS.window },
      { kind: 'trash', label: TRASH.label, rect: TRASH },
    ];
    for (const c of candidates) {
      const d = distanceToRect(p.x, p.y, c.rect);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return best;
  }

  function flash(text) {
    world.message = text;
    world.messageTimer = 1.6;
  }

  function finishChop(audio) {
    const done = world.chopping;
    world.chopping = null;
    world.player.carrying = { kind: done.ingredient, state: 'chopped' };
    audio.pop();
    flash(`${done.ingredient} selesai dicincang!`);
  }

  function servePlate(audio) {
    const recipe = recipeForPlate(world.plate);
    if (!recipe) {
      flash('Piring ini belum cocok dengan pesanan!');
      audio.fail();
      return;
    }
    const orderIndex = world.orders.findIndex((o) => o.recipe.id === recipe.id);
    if (orderIndex === -1) {
      flash('Tidak ada pesanan untuk hidangan ini.');
      audio.fail();
      return;
    }
    const order = world.orders[orderIndex];
    const fraction = Math.max(0, order.patience / order.maxPatience);
    let tip = Math.round(TIP_MAX * fraction);
    if (world.rush) tip = Math.round(tip * RUSH_TIP_MULTIPLIER);
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    const mult = world.combo >= 5 ? 3 : world.combo >= 3 ? 2 : 1;
    const earned = (recipe.price + tip) * mult;
    world.coins += earned;
    world.served += 1;
    world.orders.splice(orderIndex, 1);
    world.plate = [];
    world.plateCarried = false;
    world.lastServe = { name: recipe.name, coins: earned, tip, mult };
    audio.coin();
    flash(`Tersaji: ${recipe.name} +${earned} koin${mult > 1 ? ` (COMBO x${mult})` : ''}`);
  }

  function interact(audio) {
    const station = nearestStation();
    if (!station) return;
    const p = world.player;

    if (station.kind === 'counter') {
      if (p.carrying) { flash('Tangan sudah penuh!'); return; }
      p.carrying = { kind: station.id, state: 'raw' };
      audio.pop();
      flash(`Ambil ${station.label}`);
      return;
    }

    if (station.kind === 'chopping') {
      if (world.chopping) return; // already chopping; wait for it
      if (p.carrying && p.carrying.kind === 'ayam' && p.carrying.state === 'raw') {
        world.chopping = { ingredient: 'ayam', progress: 0 };
        p.carrying = null;
        audio.chop();
        flash('Mencincang ayam… tahan di dekat talenan');
      } else if (p.carrying) {
        flash('Yang bisa dicincang di sini hanya ayam.');
      }
      return;
    }

    if (station.kind === 'wok') {
      const wok = world.woks[station.id];
      if (wok.item) {
        if (p.carrying) { flash('Wajan sedang dipakai — tangan penuh.'); return; }
        const wasBurned = wok.item.state === 'burned';
        p.carrying = wok.item;
        wok.item = null;
        wok.progress = 0;
        wok.burned = false;
        audio.pop();
        flash(wasBurned ? 'Gosong! Buang ke tempat sampah.' : 'Angkat dari wajan');
      } else if (p.carrying && p.carrying.state === 'raw') {
        wok.item = { kind: p.carrying.kind, state: 'cooking' };
        wok.progress = 0;
        wok.burned = false;
        p.carrying = null;
        audio.sizzle();
        flash('Masuk wajan… awas gosong!');
      } else if (p.carrying) {
        flash('Yang dimasak di wajan harus bahan mentah.');
      }
      return;
    }

    if (station.kind === 'plating') {
      if (world.plateCarried) {
        // Put the carried plate back down.
        world.plateCarried = false;
        audio.pop();
        return;
      }
      if (p.carrying && p.carrying.state !== 'raw' && p.carrying.state !== 'cooking') {
        // Only finished items go on the plate.
        if (p.carrying.state === 'burned') { flash('Gosong — buang dulu!'); return; }
        world.plate.push(p.carrying.kind);
        p.carrying = null;
        audio.pop();
        flash('Ditata di piring');
      } else if (!p.carrying && world.plate.length > 0) {
        world.plateCarried = true;
        audio.pop();
        flash('Piring diangkat — antar ke jendela saji!');
      } else if (p.carrying) {
        flash('Bahan mentah harus diolah dulu.');
      }
      return;
    }

    if (station.kind === 'window') {
      if (world.plateCarried) servePlate(audio);
      else flash('Bawa piring yang sudah lengkap ke sini.');
      return;
    }

    if (station.kind === 'trash') {
      if (p.carrying && p.carrying.state === 'burned') {
        p.carrying = null;
        world.combo = 0;
        audio.fail();
        flash('Gosong dibuang — combo hilang!');
      } else if (p.carrying) {
        flash('Hanya makanan gosong yang dibuang di sini.');
      }
      return;
    }
  }

  function update(dt, input, audio) {
    if (world.screen !== 'play' || world.paused) return;

    world.elapsed += dt;
    world.timeLeft = Math.max(0, SHIFT_SECONDS - world.elapsed);
    if (world.messageTimer > 0) world.messageTimer -= dt;

    // Rush windows: 20 seconds starting every 60 seconds.
    const inRush = (world.elapsed % RUSH_EVERY_SECONDS) < 20 && world.elapsed >= RUSH_EVERY_SECONDS;
    if (inRush && !world.rush) {
      world.rushFlash = 2;
      audio.ding();
    }
    world.rush = inRush;
    if (world.rushFlash > 0) world.rushFlash -= dt;

    // Move the cook, blocked by solid station rects.
    const move = input.move();
    const p = world.player;
    if (move.x !== 0) p.facing = move.x > 0 ? 1 : -1;
    const nx = p.x + move.x * PLAYER_SPEED * dt;
    if (!solids.some((r) => rectsOverlapCircle(nx, p.y, PLAYER_RADIUS, r))) {
      p.x = Math.max(60, Math.min(1220, nx));
    }
    const ny = p.y + move.y * PLAYER_SPEED * dt;
    if (!solids.some((r) => rectsOverlapCircle(p.x, ny, PLAYER_RADIUS, r))) {
      p.y = Math.max(200, Math.min(680, ny));
    }

    // Chopping progresses while the cook stands near the board; one chop
    // sound per half-second of progress, not one per frame.
    if (world.chopping) {
      const d = distanceToRect(p.x, p.y, STATIONS.chopping);
      if (d < INTERACT_RADIUS) {
        world.chopping.progress += dt;
        const tick = Math.floor(world.chopping.progress * 2);
        if (tick !== world.lastChopTick) {
          world.lastChopTick = tick;
          audio.chop();
        }
        if (world.chopping.progress >= CHOP_SECONDS) finishChop(audio);
      }
    }

    // Woks cook (and burn) on their own timers.
    for (const wok of world.woks) {
      if (!wok.item) continue;
      wok.progress += dt;
      if (wok.progress >= COOK_SECONDS && wok.item.state === 'cooking') {
        wok.item.state = 'cooked';
      }
      if (wok.progress >= BURN_SECONDS && !wok.burned) {
        wok.burned = true;
        wok.item.state = 'burned';
        audio.fail();
        flash('Ada yang gosong di wajan!');
      }
    }

    // New orders arrive on a timer; faster during rush.
    world.orderTimer -= dt;
    if (world.orderTimer <= 0) {
      if (spawnOrder()) audio.ding();
      world.orderTimer = world.rush ? RUSH_ORDER_INTERVAL_SECONDS : ORDER_INTERVAL_SECONDS;
    }

    // Patience drains; faster during rush. A failed order breaks the combo.
    const drain = world.rush ? 1.6 : 1;
    for (let i = world.orders.length - 1; i >= 0; i--) {
      const order = world.orders[i];
      order.patience -= dt * drain;
      if (order.patience < 8 && !world.alarmPlayedFor.has(order.id)) {
        world.alarmPlayedFor.add(order.id);
        audio.alarm();
      }
      if (order.patience <= 0) {
        world.orders.splice(i, 1);
        world.failed += 1;
        world.combo = 0;
        audio.fail();
        flash(`Pesanan ${order.recipe.name} gagal — pelanggan pergi!`);
      }
    }

    if (world.timeLeft <= 0) {
      world.screen = 'win';
      audio.win();
    }
  }

  // Restart in place: reset every field on this same object so the
  // references held by main.js and render.js keep working. (Rebuilding a
  // fresh world object here would orphan those references.)
  function reset() {
    world.screen = 'play';
    world.timeLeft = SHIFT_SECONDS;
    world.elapsed = 0;
    world.rush = false;
    world.rushFlash = 0;
    world.paused = false;
    world.player.x = PLAYER_START.x;
    world.player.y = PLAYER_START.y;
    world.player.carrying = null;
    world.player.facing = 1;
    world.orders = [];
    world.orderTimer = FIRST_ORDER_DELAY;
    world.chopping = null;
    world.woks = [
      { item: null, progress: 0, burned: false },
      { item: null, progress: 0, burned: false },
    ];
    world.plate = [];
    world.plateCarried = false;
    world.coins = 0;
    world.served = 0;
    world.failed = 0;
    world.combo = 0;
    world.bestCombo = 0;
    world.message = '';
    world.messageTimer = 0;
    world.lastServe = null;
    world.alarmPlayedFor = new Set();
    world.lastChopTick = -1;
    world.shotMode = false;
  }

  // Return the SAME object the closures above read and write. (Returning a
  // spread copy would desync: main.js would mutate the copy while update()
  // kept reading the original, so the game would never leave the title.)
  world.solids = solids;
  world.trash = TRASH;
  world.spawnOrder = spawnOrder;
  world.nearestStation = nearestStation;
  world.interact = interact;
  world.update = update;
  world.reset = reset;
  world._setState = (patch) => { Object.assign(world, patch); };
  return world;
}
