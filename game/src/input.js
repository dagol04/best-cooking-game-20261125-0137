// Sizzle Station — mouse and keyboard input: clicks hit the zones render.js
// describes; keys mirror the same actions for keyboard play.

import { zoneAt } from './render.js';
import {
  startGame,
  pickPantry,
  useStation,
  placeOnCounter,
  addToPlate,
  removeFromPlate,
  clearPlate,
  servePlate,
} from './state.js';

export function attachInput(canvas, state, sfx) {
  function toCanvas(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * canvas.width,
      y: ((ev.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function handleClick(x, y) {
    if (state.phase === 'title') {
      startGame(state);
      if (sfx) sfx.ding();
      return;
    }
    if (state.phase === 'paused') {
      state.phase = 'playing';
      return;
    }
    if (state.phase === 'over' || state.phase === 'complete') {
      startGame(state);
      if (sfx) sfx.ding();
      return;
    }
    const zone = zoneAt(state, x, y);
    if (!zone) return;
    if (zone.kind === 'pantry') {
      pickPantry(state, zone.ing, sfx);
    } else if (zone.kind === 'station') {
      useStation(state, zone.station, sfx);
    } else if (zone.kind === 'counter') {
      const item = state.counter[zone.index];
      if (item) addToPlate(state, zone.index, sfx);
      else placeOnCounter(state, sfx);
    } else if (zone.kind === 'counterArea') {
      placeOnCounter(state, sfx);
    } else if (zone.kind === 'plate') {
      removeFromPlate(state, sfx);
    } else if (zone.kind === 'serve') {
      servePlate(state, sfx);
    }
  }

  canvas.addEventListener('click', (ev) => {
    const p = toCanvas(ev);
    handleClick(p.x, p.y);
  });

  canvas.addEventListener('mousemove', (ev) => {
    const p = toCanvas(ev);
    const zone = zoneAt(state, p.x, p.y);
    state.hover = zone ? zone.kind + ':' + (zone.ing || zone.station || (zone.index ?? '')) : null;
    canvas.style.cursor = zone ? 'pointer' : 'default';
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const key = ev.key.toLowerCase();
    if (state.phase === 'title' && (key === 'enter' || key === ' ')) {
      ev.preventDefault();
      startGame(state);
      if (sfx) sfx.ding();
      return;
    }
    if ((state.phase === 'over' || state.phase === 'complete') && (key === 'r' || key === 'enter' || key === ' ')) {
      ev.preventDefault();
      startGame(state);
      if (sfx) sfx.ding();
      return;
    }
    if (key === 'p' && state.phase === 'playing') {
      state.phase = 'paused';
      return;
    }
    if (key === 'p' && state.phase === 'paused') {
      state.phase = 'playing';
      return;
    }
    if (key === 'm') {
      state.muted = !state.muted;
      if (sfx) sfx.muted = state.muted;
      return;
    }
    if (state.phase !== 'playing') return;
    if (key >= '1' && key <= '6') {
      const ids = ['bun', 'patty', 'tomato', 'lettuce', 'cheese', 'noodle'];
      pickPantry(state, ids[Number(key) - 1], sfx);
      return;
    }
    if (key === ' ') {
      ev.preventDefault();
      servePlate(state, sfx);
      return;
    }
    if (key === 'backspace') {
      ev.preventDefault();
      clearPlate(state, sfx);
      return;
    }
    if (key === 'r') {
      startGame(state);
      if (sfx) sfx.ding();
    }
  });
}
