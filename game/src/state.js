// Sizzle Station — game state and rules: orders, stations, counter, plate,
// serving, scoring, lives and the shift timer. No drawing here; render.js
// reads this state and draws it.

import {
  INGREDIENTS,
  RECIPES,
  STATIONS,
  SHIFT_SECONDS,
  MAX_LIVES,
  MAX_ORDERS,
  ORDER_PATIENCE,
  SPAWN_START,
  SPAWN_END,
  COUNTER_MAX,
  PLATE_MAX,
} from './config.js';
import { makeRng, pickFrom } from './rng.js';

export function newItem(ingId) {
  return { ing: ingId, done: INGREDIENTS[ingId].station === null };
}

export function itemName(item) {
  if (item.done) {
    if (INGREDIENTS[item.ing].station) {
      const names = { patty: 'Grilled Patty', tomato: 'Chopped Tomato', lettuce: 'Chopped Lettuce', noodle: 'Boiled Noodle' };
      return names[item.ing] || INGREDIENTS[item.ing].name;
    }
    return INGREDIENTS[item.ing].name;
  }
  return INGREDIENTS[item.ing].name + ' (raw)';
}

export function newOrder(id, recipe, patience) {
  return { id, recipe, patience, maxPatience: patience, served: false };
}

export function createState(seed) {
  const rng = seed === undefined ? Math.random : makeRng(seed);
  return {
    phase: 'title', // title | playing | paused | over | complete
    rng,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    lives: MAX_LIVES,
    servedCount: 0,
    expiredCount: 0,
    orders: [],
    nextOrderId: 1,
    spawnIn: 6,
    hand: null, // one item id, or null
    stations: {
      board: { item: null, progress: 0, duration: 0 },
      grill: { item: null, progress: 0, duration: 0 },
      pot: { item: null, progress: 0, duration: 0 },
    },
    counter: [], // items ready to plate, max COUNTER_MAX
    plate: [], // items on the plate, max PLATE_MAX
    toast: null, // { text, kind, until }
    flash: null, // { kind: 'serve' | 'error', until }
    hover: null, // hovered zone id for highlight
    muted: false,
    finalReason: '',
  };
}

export function spawnOrder(state) {
  const recipe = pickFrom(state.rng, RECIPES);
  const order = newOrder(state.nextOrderId++, recipe, ORDER_PATIENCE);
  state.orders.push(order);
  return order;
}

export function startGame(state) {
  const fresh = createState();
  fresh.rng = state.rng;
  Object.assign(state, fresh);
  state.phase = 'playing';
  spawnOrder(state);
  spawnOrder(state);
  state.spawnIn = SPAWN_START;
  setToast(state, 'Shift started! Serve the orders before patience runs out.', 'info', 3);
}

export function setToast(state, text, kind, seconds) {
  state.toast = { text, kind: kind || 'info', until: state.time + (seconds || 2.5) };
}

export function plateMatchesOrder(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = {};
  for (const item of plate) have[item.ing] = (have[item.ing] || 0) + 1;
  const want = {};
  for (const id of recipe.needs) want[id] = (want[id] || 0) + 1;
  const keys = new Set([...Object.keys(have), ...Object.keys(want)]);
  for (const k of keys) if ((have[k] || 0) !== (want[k] || 0)) return false;
  return true;
}

export function findMatchingOrder(state) {
  for (const order of state.orders) {
    if (plateMatchesOrder(state.plate, order.recipe)) return order;
  }
  return null;
}

export function servePlate(state, sfx) {
  if (state.phase !== 'playing') return false;
  if (state.plate.length === 0) {
    setToast(state, 'The plate is empty — add ingredients first!', 'error', 2);
    if (sfx) sfx.error();
    return false;
  }
  const order = findMatchingOrder(state);
  if (!order) {
    setToast(state, 'No order wants this dish — check the order board!', 'error', 2.5);
    state.flash = { kind: 'error', until: state.time + 0.4 };
    if (sfx) sfx.error();
    return false;
  }
  const patienceBonus = Math.round((order.patience / order.maxPatience) * 50);
  const comboMult = 1 + Math.min(state.combo, 4) * 0.25;
  const points = Math.round((order.recipe.base + patienceBonus) * comboMult);
  state.score += points;
  state.coins += 10 + Math.round(order.recipe.base / 20);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.servedCount += 1;
  state.orders = state.orders.filter((o) => o !== order);
  state.plate = [];
  state.flash = { kind: 'serve', until: state.time + 0.5 };
  setToast(state, 'Served ' + order.recipe.name + '! +' + points + ' points', 'good', 2.5);
  if (sfx) sfx.serve();
  return true;
}

// Move a finished station item onto the counter when there is room.
export function collectFinished(state, stationId, sfx) {
  const st = state.stations[stationId];
  if (!st.item || st.progress < st.duration) return false;
  if (state.counter.length >= COUNTER_MAX) return false;
  const item = { ing: st.item, done: true };
  st.item = null;
  st.progress = 0;
  st.duration = 0;
  state.counter.push(item);
  if (sfx) sfx.ding();
  return true;
}

export function pickPantry(state, ingId, sfx) {
  if (state.phase !== 'playing') return;
  if (state.hand === ingId) {
    state.hand = null;
    if (sfx) sfx.click();
    return;
  }
  state.hand = ingId;
  if (sfx) sfx.pick();
}

export function useStation(state, stationId, sfx) {
  if (state.phase !== 'playing') return;
  const st = state.stations[stationId];
  const station = STATIONS[stationId];
  if (st.item) {
    // A finished dish waits here: tap to move it to the counter.
    if (collectFinished(state, stationId, sfx)) return;
    setToast(state, 'Still ' + station.verb.toLowerCase() + '…', 'info', 1.5);
    return;
  }
  if (!state.hand) {
    setToast(state, 'Pick an ingredient from the pantry first (keys 1-6).', 'info', 2);
    if (sfx) sfx.click();
    return;
  }
  if (!station.accepts.includes(state.hand)) {
    setToast(state, INGREDIENTS[state.hand].name + ' does not go on the ' + station.name + '.', 'error', 2);
    if (sfx) sfx.error();
    return;
  }
  const ing = INGREDIENTS[state.hand];
  st.item = state.hand;
  st.duration = ing.cook;
  st.progress = 0;
  state.hand = null;
  if (stationId === 'grill' && sfx) sfx.sizzle();
  else if (stationId === 'pot' && sfx) sfx.boil();
  else if (sfx) sfx.chop();
}

export function placeOnCounter(state, sfx) {
  if (state.phase !== 'playing') return;
  if (!state.hand) return;
  if (state.counter.length >= COUNTER_MAX) {
    setToast(state, 'The counter is full — plate something first!', 'error', 2);
    if (sfx) sfx.error();
    return;
  }
  state.counter.push(newItem(state.hand));
  state.hand = null;
  if (sfx) sfx.click();
}

export function addToPlate(state, index, sfx) {
  if (state.phase !== 'playing') return;
  if (index < 0 || index >= state.counter.length) return;
  if (state.plate.length >= PLATE_MAX) {
    setToast(state, 'The plate is full — serve it or take something off!', 'error', 2);
    if (sfx) sfx.error();
    return;
  }
  const item = state.counter.splice(index, 1)[0];
  state.plate.push(item);
  if (sfx) sfx.click();
}

export function removeFromPlate(state, sfx) {
  if (state.phase !== 'playing') return;
  if (state.plate.length === 0) return;
  if (state.counter.length >= COUNTER_MAX) {
    setToast(state, 'The counter is full — serve the plate instead!', 'error', 2);
    if (sfx) sfx.error();
    return;
  }
  const item = state.plate.pop();
  state.counter.push(item);
  if (sfx) sfx.click();
}

export function clearPlate(state, sfx) {
  if (state.phase !== 'playing') return;
  while (state.plate.length > 0 && state.counter.length < COUNTER_MAX) {
    state.counter.push(state.plate.pop());
  }
  if (sfx) sfx.click();
}

export function endGame(state, reason, sfx) {
  state.phase = reason === 'shift' ? 'complete' : 'over';
  state.finalReason = reason;
  if (sfx) {
    if (reason === 'shift') sfx.win();
    else sfx.gameOver();
  }
}

export function update(state, dt, sfx) {
  if (state.phase !== 'playing') return;
  state.time += dt;
  state.shiftLeft = Math.max(0, state.shiftLeft - dt);
  if (state.shiftLeft <= 0) {
    endGame(state, 'shift', sfx);
    return;
  }

  // Stations cook; finished items slide onto the counter when there is room.
  for (const id of Object.keys(state.stations)) {
    const st = state.stations[id];
    if (st.item && st.progress < st.duration) {
      st.progress = Math.min(st.duration, st.progress + dt);
      if (st.progress >= st.duration) collectFinished(state, id, sfx);
    }
  }

  // Orders lose patience; an expired order costs a life.
  for (const order of state.orders.slice()) {
    order.patience = Math.max(0, order.patience - dt);
    if (order.patience <= 0) {
      state.orders = state.orders.filter((o) => o !== order);
      state.lives -= 1;
      state.combo = 0;
      state.expiredCount += 1;
      setToast(state, 'Order expired! ' + order.recipe.name + ' walked out. -1 life', 'error', 3);
      if (sfx) sfx.expire();
      if (state.lives <= 0) {
        endGame(state, 'lives', sfx);
        return;
      }
    }
  }

  // New orders arrive; the pace quickens as the shift goes on.
  const elapsed = SHIFT_SECONDS - state.shiftLeft;
  const interval = SPAWN_START + ((SPAWN_END - SPAWN_START) * elapsed) / SHIFT_SECONDS;
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    if (state.orders.length < MAX_ORDERS) spawnOrder(state);
    state.spawnIn = interval;
  }
}
