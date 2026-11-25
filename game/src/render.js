// Dapur Kilat — all drawing: the kitchen, ingredients, plates, the cook,
// order board, timer and screens. Everything is drawn with canvas shapes
// and colours; no images, no network.

import { VIEW, COLORS, INGREDIENT_COLORS, INGREDIENT_LABELS, STATIONS } from './config.js';
import { recipeForPlate } from './recipes.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawIngredient(ctx, kind, x, y, size) {
  const color = INGREDIENT_COLORS[kind] || '#ccc';
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  if (kind === 'nasi') {
    // A small mound of rice.
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.5 + i * size * 0.25, y - size * 0.25, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'mi') {
    // A swirl of noodles.
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y, size * (0.35 + i * 0.28), 0.3, Math.PI * 1.8);
      ctx.stroke();
    }
  } else if (kind === 'telur') {
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.75, size, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ayam') {
    // A drumstick.
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.8, size * 0.55, -0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.6, y - size * 0.3);
    ctx.lineTo(x + size * 1.1, y - size * 0.7);
    ctx.stroke();
  } else if (kind === 'sayur') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.3, y, size * 0.45, size * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y, size * 0.45, size * 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.2);
    ctx.lineTo(x, y + size * 0.8);
    ctx.stroke();
  } else if (kind === 'cabai') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.9, size * 0.35, -0.35, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.7, y - size * 0.3);
    ctx.quadraticCurveTo(x + size * 1.1, y - size * 0.6, x + size * 1.2, y - size * 0.2);
    ctx.stroke();
  }
}

function drawPlate(ctx, x, y, items, carried) {
  ctx.fillStyle = COLORS.plate;
  ctx.strokeStyle = COLORS.plateEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, 52, 34, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  items.forEach((kind, i) => {
    drawIngredient(ctx, kind, x - 26 + i * 18, y - 4, 11);
  });
  if (carried) {
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIAP ANTAR', x, y - 44);
  }
}

function drawProgressBar(ctx, x, y, w, fraction, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x, y, w, 12, 6);
  ctx.fill();
  ctx.fillStyle = color;
  const inner = Math.max(0, Math.min(1, fraction)) * (w - 4);
  if (inner > 0) {
    roundRect(ctx, x + 2, y + 2, inner, 8, 4);
    ctx.fill();
  }
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const fraction = Math.max(0, order.patience / order.maxPatience);
  ctx.fillStyle = COLORS.boardPaper;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(order.recipe.name, x + 10, y + 22);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#6b5a44';
  ctx.fillText(order.recipe.ingredients.map((i) => INGREDIENT_LABELS[i]).join(' + '), x + 10, y + 40);
  const barColor = fraction > 0.5 ? COLORS.green : fraction > 0.25 ? COLORS.gold : COLORS.red;
  drawProgressBar(ctx, x + 10, y + h - 18, w - 20, fraction, barColor);
  ctx.fillStyle = barColor;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(order.patience)} dtk`, x + w - 10, y + 22);
}

export function render(ctx, world) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);

  // --- Floor and walls ---
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.floorDark;
  for (let y = 200; y < VIEW.height; y += 64) {
    for (let x = (y % 128 === 0 ? 0 : 32); x < VIEW.width; x += 64) {
      ctx.fillRect(x, y, 60, 2);
    }
  }
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW.width, 84);
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(0, 84, VIEW.width, 10);
  ctx.fillStyle = COLORS.textLight;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  // Stars, not emoji: headless Chrome has no colour-emoji font, so the
  // frying-pan emoji renders as a confusing outline.
  ctx.fillText('★  DAPUR KILAT  ★', VIEW.width / 2, 52);
  ctx.font = '13px sans-serif';
  ctx.fillText('Warung nasi goreng — masak cepat, saji tepat waktu!', VIEW.width / 2, 76);

  if (world.screen === 'title') {
    // Title over the live kitchen: the board, counter and timer stay
    // visible around the card (this is also the 1-start.jpg staging).
    renderKitchen(ctx, world);
    renderHud(ctx, world);
    renderTitle(ctx, world);
    return;
  }
  if (world.screen === 'win') {
    renderKitchen(ctx, world);
    renderWin(ctx, world);
    return;
  }
  renderKitchen(ctx, world);
  renderHud(ctx, world);
}

function renderTitle(ctx, world) {
  // Dim the kitchen behind the title card.
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.boardPaper;
  roundRect(ctx, 340, 150, 600, 380, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAPUR KILAT', 640, 250);
  ctx.fillStyle = COLORS.text;
  ctx.font = '20px sans-serif';
  ctx.fillText('Warung nasi goreng — 180 detik, 6 resep, tanpa ampun.', 640, 295);
  ctx.font = '17px sans-serif';
  ctx.fillText('WASD / panah: gerak      E / Spasi: ambil · olah · saji', 640, 340);
  ctx.fillText('Klik mouse juga bisa      M: suara      P: jeda', 640, 368);
  ctx.fillText('Cincang ayam di talenan, masak di wajan,', 640, 408);
  ctx.fillText('tata di piring, antar ke jendela saji sebelum pelanggan pergi!', 640, 434);
  ctx.fillStyle = COLORS.green;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Tekan E atau klik untuk mulai masak ▶', 640, 490);
}

function renderKitchen(ctx, world) {
  // --- Order board (left) ---
  ctx.fillStyle = COLORS.board;
  roundRect(ctx, STATIONS.board.x, STATIONS.board.y, STATIONS.board.w, STATIONS.board.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.textLight;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📋 PESANAN', STATIONS.board.x + 14, STATIONS.board.y + 28);
  if (world.orders.length === 0) {
    ctx.fillStyle = '#b9a98c';
    ctx.font = '14px sans-serif';
    ctx.fillText('Belum ada pesanan…', STATIONS.board.x + 14, STATIONS.board.y + 60);
  }
  world.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, STATIONS.board.x + 10, STATIONS.board.y + 40 + i * 84, STATIONS.board.w - 20, 74);
  });

  // --- Ingredient counter (top row, x 280..920) ---
  ctx.fillStyle = COLORS.counter;
  roundRect(ctx, 280, 96, 640, 64, 10);
  ctx.fill();
  ctx.strokeStyle = COLORS.counterEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  STATIONS.counter.forEach((bin) => {
    drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 26, 15);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bin.label, bin.x + bin.w / 2, bin.y + 56);
  });

  // --- Chopping board ---
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, STATIONS.chopping.x, STATIONS.chopping.y, STATIONS.chopping.w, STATIONS.chopping.h, 10);
  ctx.fill();
  ctx.fillStyle = '#d9b380';
  roundRect(ctx, STATIONS.chopping.x + 12, STATIONS.chopping.y + 14, STATIONS.chopping.w - 24, STATIONS.chopping.h - 28, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  if (!world.chopping) {
    ctx.fillText('TALENAN', STATIONS.chopping.x + STATIONS.chopping.w / 2, STATIONS.chopping.y + STATIONS.chopping.h - 6);
  }
  if (world.chopping) {
    drawIngredient(ctx, world.chopping.ingredient, STATIONS.chopping.x + 70, STATIONS.chopping.y + 44, 16);
    drawProgressBar(ctx, STATIONS.chopping.x + 20, STATIONS.chopping.y + 70, STATIONS.chopping.w - 40, world.chopping.progress / 2.2, COLORS.green);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('MENCINCANG…', STATIONS.chopping.x + STATIONS.chopping.w / 2, STATIONS.chopping.y + 100);
  }

  // --- Woks (two stoves) ---
  [STATIONS.wokA, STATIONS.wokB].forEach((stove, i) => {
    const wok = world.woks[i];
    ctx.fillStyle = '#5a4632';
    roundRect(ctx, stove.x, stove.y, stove.w, stove.h, 10);
    ctx.fill();
    ctx.fillStyle = wok.item ? COLORS.wokHot : COLORS.wok;
    ctx.beginPath();
    ctx.ellipse(stove.x + stove.w / 2, stove.y + 46, 52, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (wok.item) {
      drawIngredient(ctx, wok.item.kind, stove.x + stove.w / 2, stove.y + 42, 14);
      // Steam puffs rise from a hot wok; their phase comes from elapsed
      // time so the scene stays lively without any randomness.
      if (!wok.burned) {
        ctx.fillStyle = COLORS.steam;
        for (let s = 0; s < 3; s++) {
          const phase = (world.elapsed * 0.7 + s * 0.33) % 1;
          ctx.beginPath();
          ctx.arc(stove.x + stove.w / 2 + (s - 1) * 16, stove.y + 34 - phase * 26, 5 + phase * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const frac = wok.progress / 11;
      drawProgressBar(ctx, stove.x + 14, stove.y + 82, stove.w - 28, frac, wok.burned ? COLORS.red : wok.item.state === 'cooked' ? COLORS.green : COLORS.gold);
      if (wok.burned) {
        ctx.fillStyle = COLORS.red;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('GOSONG!', stove.x + stove.w / 2, stove.y + 14);
      } else if (wok.item.state === 'cooked') {
        ctx.fillStyle = COLORS.green;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('MATANG ✓', stove.x + stove.w / 2, stove.y + 14);
      }
    }
    ctx.fillStyle = COLORS.textLight;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(stove.label, stove.x + stove.w / 2, stove.y + stove.h - 6);
  });

  // --- Plating table ---
  ctx.fillStyle = COLORS.counter;
  roundRect(ctx, STATIONS.plating.x, STATIONS.plating.y, STATIONS.plating.w, STATIONS.plating.h, 10);
  ctx.fill();
  ctx.strokeStyle = COLORS.counterEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!world.plateCarried) {
    drawPlate(ctx, STATIONS.plating.x + STATIONS.plating.w / 2, STATIONS.plating.y + 52, world.plate, false);
  }
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEJA PLATING', STATIONS.plating.x + STATIONS.plating.w / 2, STATIONS.plating.y + STATIONS.plating.h - 6);

  // --- Serving window (right) ---
  ctx.fillStyle = COLORS.window;
  roundRect(ctx, STATIONS.window.x, STATIONS.window.y, STATIONS.window.w, STATIONS.window.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#b98a1e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('JENDELA', STATIONS.window.x + STATIONS.window.w / 2, STATIONS.window.y + 24);
  ctx.fillText('SAJI', STATIONS.window.x + STATIONS.window.w / 2, STATIONS.window.y + 44);
  // A served plate rests in the window when the last serve was recent.
  if (world.lastServe && world.served > 0) {
    drawPlate(ctx, STATIONS.window.x + STATIONS.window.w / 2, STATIONS.window.y + 130, [], false);
    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('✓ ' + world.lastServe.name, STATIONS.window.x + STATIONS.window.w / 2, STATIONS.window.y + 185);
  }

  // --- Trash bin ---
  const trash = world.trash;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.textLight;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('🗑 SAMPAH', trash.x + trash.w / 2, trash.y + trash.h / 2 + 4);

  // --- The cook ---
  const p = world.player;
  if (world.plateCarried) {
    drawPlate(ctx, p.x, p.y - 34, world.plate, true);
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8d2c0';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Chef hat.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(p.x - 8, p.y - 16, 8, 0, Math.PI * 2);
  ctx.arc(p.x + 8, p.y - 16, 8, 0, Math.PI * 2);
  ctx.arc(p.x, p.y - 20, 9, 0, Math.PI * 2);
  ctx.fill();
  // Face: eyes look in facing direction.
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(p.x - 6 + p.facing * 3, p.y - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(p.x + 6 + p.facing * 3, p.y - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Carried ingredient above the head.
  if (p.carrying) {
    const label = p.carrying.state === 'burned' ? 'GOSONG' : p.carrying.state === 'cooked' ? 'MATANG' : p.carrying.state === 'chopped' ? 'CINCANG' : 'MENTAH';
    drawIngredient(ctx, p.carrying.kind, p.x, p.y - 46, 13);
    ctx.fillStyle = p.carrying.state === 'burned' ? COLORS.red : COLORS.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(label, p.x, p.y - 62);
  }
}

function renderHud(ctx, world) {
  // --- Shift timer (top right, beside the counter, never over the bins) ---
  const minutes = Math.floor(world.timeLeft / 60);
  const seconds = Math.floor(world.timeLeft % 60);
  const timeText = `${minutes}:${String(seconds).padStart(2, '0')}`;
  ctx.fillStyle = world.timeLeft <= 30 ? COLORS.red : COLORS.board;
  roundRect(ctx, 940, 96, 300, 56, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.textLight;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⏱ ${timeText}`, 1090, 134);

  // --- Coins and combo (below the timer) ---
  ctx.fillStyle = COLORS.board;
  roundRect(ctx, 1000, 164, 240, 56, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🪙 ${world.coins}`, 1016, 200);
  if (world.combo >= 2) {
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`COMBO x${world.combo >= 5 ? 3 : world.combo >= 3 ? 2 : 1}`, 1128, 200);
  }

  // --- Rush banner ---
  if (world.rush) {
    ctx.fillStyle = COLORS.red;
    roundRect(ctx, 480, 160, 320, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 RUSH! TIP x1,5 🔥', 640, 188);
  } else if (world.rushFlash > 0) {
    ctx.fillStyle = COLORS.accent;
    roundRect(ctx, 480, 160, 320, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🔥 RUSH DIMULAI! 🔥', 640, 188);
  }

  // --- Message line (bottom) ---
  if (world.messageTimer > 0 && world.message) {
    ctx.fillStyle = 'rgba(20,12,6,0.75)';
    roundRect(ctx, 340, 668, 600, 36, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.textLight;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, 640, 692);
  }

  // --- Context prompt: what E does at the nearest station ---
  const station = world.nearestStation ? world.nearestStation() : null;
  if (station && station.kind !== 'board') {
    ctx.fillStyle = 'rgba(255,246,221,0.92)';
    ctx.font = 'bold 14px sans-serif';
    const label = `E: ${station.label}`;
    const w = ctx.measureText(label).width + 24;
    roundRect(ctx, 640 - w / 2, 620, w, 30, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.fillText(label, 640, 640);
  }

  if (world.paused && !world.shotMode) {
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = COLORS.textLight;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ JEDA — tekan P untuk lanjut', 640, 360);
  }
}

function renderWin(ctx, world) {
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.boardPaper;
  roundRect(ctx, 380, 130, 520, 420, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = COLORS.accent;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIFT SELESAI!', 640, 205);
  ctx.fillStyle = COLORS.text;
  ctx.font = '22px sans-serif';
  ctx.fillText(`🪙 Koin: ${world.coins}`, 640, 260);
  ctx.fillText(`🍽 Hidangan tersaji: ${world.served}`, 640, 295);
  ctx.fillText(`😞 Pesanan gagal: ${world.failed}`, 640, 330);
  ctx.fillText(`🔥 Combo terbaik: x${world.bestCombo}`, 640, 365);
  const verdict = world.served >= 8 ? 'Koki legendaris! Warung penuh sampai malam.' :
    world.served >= 4 ? 'Shift yang solid — pelanggan pulang kenyang.' :
    'Shift yang berat… latihan lagi, koki!';
  ctx.font = '17px sans-serif';
  ctx.fillText(verdict, 640, 415);
  ctx.fillStyle = COLORS.green;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Tekan R untuk main lagi', 640, 480);
}
