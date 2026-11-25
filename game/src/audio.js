// Sizzle Station — tiny synthesized sound effects (WebAudio, no audio files).
// Every sound is a short oscillator/noise burst built in code, so the game
// ships no media and loads nothing from the network.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch (err) {
      return null;
    }
  }

  tone(freq, dur, type, vol, slideTo) {
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    } catch (err) {
      /* sound is best-effort */
    }
  }

  noise(dur, vol, filterFreq) {
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq || 1200;
      const gain = ctx.createGain();
      gain.gain.value = vol || 0.1;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (err) {
      /* sound is best-effort */
    }
  }

  click() { this.tone(660, 0.06, 'triangle', 0.08); }
  pick() { this.tone(520, 0.07, 'triangle', 0.09, 780); }
  chop() { this.noise(0.09, 0.16, 2400); this.tone(180, 0.08, 'square', 0.05); }
  sizzle() { this.noise(0.35, 0.07, 5000); }
  boil() { this.tone(220, 0.18, 'sine', 0.06, 330); }
  ding() { this.tone(880, 0.25, 'sine', 0.12); this.tone(1320, 0.3, 'sine', 0.07); }
  serve() {
    this.tone(523, 0.12, 'triangle', 0.12);
    setTimeout(() => this.tone(659, 0.12, 'triangle', 0.12), 90);
    setTimeout(() => this.tone(784, 0.22, 'triangle', 0.12), 180);
  }
  error() { this.tone(160, 0.22, 'sawtooth', 0.09, 110); }
  expire() { this.tone(330, 0.3, 'sawtooth', 0.08, 180); }
  gameOver() {
    this.tone(392, 0.25, 'triangle', 0.11);
    setTimeout(() => this.tone(311, 0.25, 'triangle', 0.11), 220);
    setTimeout(() => this.tone(233, 0.5, 'triangle', 0.11), 440);
  }
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.25, 'triangle', 0.11), i * 130));
  }
}
