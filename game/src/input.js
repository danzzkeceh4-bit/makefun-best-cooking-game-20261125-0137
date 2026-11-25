// Dapur Kilat — keyboard (WASD/arrows + E/Space interact, M mute, P pause,
// R restart) and mouse click-to-interact. The game polls this object each
// frame; edge-triggered actions use consumeInteract() so one press = one action.

export function createInput(canvas) {
  const keys = new Set();
  let interactPressed = false;
  let click = null;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  function onKeyDown(event) {
    if (event.repeat) return;
    if (KEYMAP[event.code]) {
      keys.add(KEYMAP[event.code]);
      event.preventDefault();
    }
    if (event.code === 'KeyE' || event.code === 'Space') {
      interactPressed = true;
      event.preventDefault();
    }
    if (event.code === 'KeyM') keys.add('mute');
    if (event.code === 'KeyP') keys.add('pause');
    if (event.code === 'KeyR') keys.add('restart');
  }

  function onKeyUp(event) {
    if (KEYMAP[event.code]) keys.delete(KEYMAP[event.code]);
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    // Normalized movement vector from held keys.
    move() {
      let x = 0;
      let y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    // True once per E/Space press.
    consumeInteract() {
      const value = interactPressed;
      interactPressed = false;
      return value;
    },
    // True once per single-key press (M / P / R).
    consumeKey(name) {
      if (!keys.has(name)) return false;
      keys.delete(name);
      return true;
    },
    // True once per mouse click; returns the click position in canvas pixels.
    consumeClick() {
      const value = click;
      click = null;
      return value;
    },
    // True when any movement key is currently held (cancels mouse steering).
    isMoving() {
      return keys.has('up') || keys.has('down') || keys.has('left') || keys.has('right');
    },
    // Test helper: pretend a key is held.
    pressForTest(name) { keys.add(name); },
  };
}
