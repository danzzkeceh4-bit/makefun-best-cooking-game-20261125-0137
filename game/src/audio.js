// Dapur Kilat — all sound is synthesized with WebAudio: no audio files,
// no network. A tiny helper builds short tones and noise bursts on demand.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    g.gain.setValueAtTime(gain || 0.12, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(g).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function noise(dur, gain, filterFreq) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 3000;
    const g = ac.createGain();
    g.gain.value = gain || 0.08;
    src.connect(filter).connect(g).connect(ac.destination);
    src.start();
  }

  return {
    // Short wok sizzle when food hits the pan.
    sizzle() { noise(0.35, 0.1, 4200); },
    // Knife chop thock.
    chop() { noise(0.08, 0.16, 900); tone(180, 0.07, 'triangle', 0.1); },
    // Two-note ding when a new order arrives.
    ding() { tone(880, 0.12, 'sine', 0.12); setTimeout(() => tone(1318, 0.18, 'sine', 0.12), 110); },
    // Coin arpeggio when a dish is served.
    coin() { tone(988, 0.09, 'square', 0.07); setTimeout(() => tone(1319, 0.16, 'square', 0.07), 90); },
    // Low alarm pulse when patience runs low.
    alarm() { tone(520, 0.14, 'sawtooth', 0.06, 380); },
    // Soft pop when picking up or placing an item.
    pop() { tone(420, 0.06, 'sine', 0.09, 640); },
    // Sad descending buzz when an order fails or food burns.
    fail() { tone(220, 0.3, 'sawtooth', 0.08, 110); },
    // Short victory fanfare when the shift ends.
    win() {
      tone(523, 0.12, 'triangle', 0.12);
      setTimeout(() => tone(659, 0.12, 'triangle', 0.12), 120);
      setTimeout(() => tone(784, 0.24, 'triangle', 0.12), 240);
    },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
  };
}
