// Dapur Kilat — boot and game loop: wires input, audio, world and render
// together, runs the fixed-step update, and applies deterministic
// screenshot staging when ?shot= is present.

import { VIEW } from './config.js';
import { createWorld } from './world.js';
import { render } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { seedFromUrl } from './random.js';
import { applyShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const seed = seedFromUrl(window.location.search);
const world = createWorld(seed);
const input = createInput(canvas);
const audio = createAudio();

const shot = shotFromUrl(window.location.search);
if (shot) {
  applyShot(world, shot);
}

// Debug handle for automated play-testing (read-only state inspection;
// the game itself never reads it).
window.__dapurKilat = { world, input, audio };

// Click-to-interact: walk toward the clicked station, then interact when
// close enough. A plain click on empty floor just moves the cook there.
let clickTarget = null;

function handleClick(click) {
  if (!click) return;
  if (world.screen === 'title') {
    world.screen = 'play';
    world.paused = false;
    world.shotMode = false;
    return;
  }
  if (world.screen === 'win') return;
  clickTarget = click;
}

let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (input.consumeKey('mute')) {
    const muted = audio.toggleMute();
    world.message = muted ? 'Suara dimatikan (M)' : 'Suara dinyalakan (M)';
    world.messageTimer = 1.2;
  }
  if (input.consumeKey('pause') && world.screen === 'play') {
    world.paused = !world.paused;
  }
  if (input.consumeKey('restart') && world.screen === 'win') {
    world.reset();
  }

  const click = input.consumeClick();
  if (click) handleClick(click);

  if (world.screen === 'title' && input.consumeInteract()) {
    world.screen = 'play';
    world.paused = false;
    world.shotMode = false;
    audio.ding();
  }

  if (world.screen === 'play' && !world.paused) {
    // Keyboard movement cancels mouse steering immediately.
    if (input.isMoving()) clickTarget = null;
    // Mouse steering: move toward the click target until close, then act.
    if (clickTarget) {
      const dx = clickTarget.x - world.player.x;
      const dy = clickTarget.y - world.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 70) {
        world.interact(audio);
        clickTarget = null;
      } else {
        const step = 260 * dt;
        world.player.x += (dx / dist) * step;
        world.player.y += (dy / dist) * step;
      }
    }
    if (input.consumeInteract()) {
      clickTarget = null;
      world.interact(audio);
    }
    world.update(dt, input, audio);
  }

  render(ctx, world);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
