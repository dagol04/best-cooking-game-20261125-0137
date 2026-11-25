// Sizzle Station — deterministic screenshot setups.
// ?shot=start | play | serve | end (with optional &seed=N) freezes the game
// in a staged, fully-built state so the screenshots are real renders of the
// game's own code, stable from run to run.

import { RECIPES, SHIFT_SECONDS } from './config.js';
import { createState, spawnOrder, newOrder, setToast } from './state.js';

function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

function item(ing, done) {
  return { ing, done: done !== false };
}

export function applyShot(state, name, seed) {
  const s = seed === undefined ? 7 : seed;
  const fresh = createState(s);
  Object.assign(state, fresh);
  state.phase = 'playing';
  state.time = 42;
  state.shiftLeft = 87;
  state.score = 240;
  state.coins = 36;
  state.combo = 2;
  state.bestCombo = 3;
  state.lives = 3;
  state.servedCount = 2;
  state.expiredCount = 0;

  if (name === 'start') {
    state.phase = 'title';
    state.shiftLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.servedCount = 0;
    return;
  }

  if (name === 'end') {
    state.phase = 'over';
    state.score = 640;
    state.servedCount = 5;
    state.expiredCount = 3;
    state.bestCombo = 4;
    state.lives = 0;
    state.shiftLeft = 31;
    state.orders = [newOrder(9, recipeById('burger'), 12)];
    state.orders[0].patience = 12;
    state.counter = [item('patty'), item('tomato')];
    state.plate = [item('bun'), item('patty')];
    return;
  }

  // play + serve share a busy kitchen; serve completes the plate.
  state.orders = [
    newOrder(4, recipeById('burger'), 45),
    newOrder(5, recipeById('noodle'), 45),
    newOrder(6, recipeById('salad'), 45),
  ];
  state.orders[0].patience = 28;
  state.orders[1].patience = 19;
  state.orders[2].patience = 38;
  state.stations.board.item = 'tomato';
  state.stations.board.duration = 2.5;
  state.stations.board.progress = 1.4;
  state.stations.grill.item = 'patty';
  state.stations.grill.duration = 4;
  state.stations.grill.progress = 3.1;
  state.stations.pot.item = null;
  state.counter = [item('cheese'), item('lettuce'), item('noodle')];
  state.hand = 'tomato';

  if (name === 'serve') {
    state.plate = [item('bun'), item('patty'), item('tomato'), item('lettuce')];
    state.counter = [item('cheese'), item('noodle')];
    state.hand = null;
    state.stations.board.item = null;
    state.stations.board.progress = 0;
    state.stations.board.duration = 0;
    state.stations.grill.item = null;
    state.stations.grill.progress = 0;
    state.stations.grill.duration = 0;
    setToast(state, 'Classic Burger ready — ring the bell!', 'good', 9999);
    state.time = 42;
  } else {
    // play: one dish mid-assembly on the plate
    state.plate = [item('bun'), item('patty')];
    setToast(state, 'Chop the tomato, then finish the burger!', 'info', 9999);
  }
}

export function shotFromUrl() {
  try {
    const q = new URLSearchParams(window.location.search);
    const shot = q.get('shot');
    if (!shot) return null;
    const seed = q.get('seed');
    return { name: shot, seed: seed === null ? undefined : Number(seed) || 7 };
  } catch (err) {
    return null;
  }
}
