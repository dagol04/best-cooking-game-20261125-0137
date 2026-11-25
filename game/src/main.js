// Sizzle Station — entry point: wires state, input, sound and rendering
// together and runs the game loop. In ?shot= mode the game is frozen in a
// staged state and rendered once, for screenshots.

import { CANVAS_W, CANVAS_H } from './config.js';
import { createState, update } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { SoundFX } from './audio.js';
import { applyShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = createState();
const sfx = new SoundFX();
attachInput(canvas, state, sfx);

const shot = shotFromUrl();
if (shot) {
  applyShot(state, shot.name, shot.seed);
  render(ctx, state);
  document.title = 'Sizzle Station — shot:' + shot.name;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    update(state, dt, sfx);
    render(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
