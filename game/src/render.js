// Sizzle Station — all canvas drawing: the kitchen, order board, stations,
// counter, plate, serve bell, HUD and screens. Food is drawn with vector
// shapes only (no emoji, no web fonts) so it renders identically everywhere.

import { CANVAS_W, CANVAS_H, INGREDIENTS, RECIPES, STATIONS, LAYOUT, COLORS, MAX_LIVES } from './config.js';
import { itemName, newItem } from './state.js';

export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || COLORS.ink;
  ctx.font = (weight || 'bold') + ' ' + size + 'px Verdana, Geneva, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function panel(ctx, rect, fill, stroke) {
  ctx.fillStyle = fill;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ---- vector food icons (drawn, never emoji) ----

export function drawIngredient(ctx, ingId, cx, cy, r, done) {
  const ing = INGREDIENTS[ingId];
  ctx.save();
  ctx.translate(cx, cy);
  if (!done) ctx.globalAlpha = 0.85;
  if (ingId === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.fillRect(-r, r * 0.1, r * 2, r * 0.22);
    ctx.fillStyle = '#fff3cf';
    const dots = [[-0.45, -0.45], [0.1, -0.62], [0.5, -0.35], [-0.05, -0.25]];
    for (const d of dots) {
      ctx.beginPath();
      ctx.ellipse(d[0] * r, d[1] * r, r * 0.09, r * 0.06, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingId === 'patty') {
    ctx.fillStyle = ing.dark;
    roundRect(ctx, -r, -r * 0.42, r * 2, r * 0.84, r * 0.4);
    ctx.fill();
    ctx.fillStyle = ing.color;
    roundRect(ctx, -r * 0.92, -r * 0.5, r * 1.84, r * 0.68, r * 0.34);
    ctx.fill();
    ctx.fillStyle = '#7c4a26';
    for (const d of [[-0.5, -0.1], [0.15, 0.12], [0.55, -0.15]]) {
      ctx.beginPath();
      ctx.arc(d[0] * r, d[1] * r, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    if (done) {
      ctx.strokeStyle = '#5d3a1a';
      ctx.lineWidth = r * 0.07;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.2);
      ctx.lineTo(r * 0.6, -r * 0.2);
      ctx.stroke();
    }
  } else if (ingId === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2776d';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.fillStyle = '#3d9b4f';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(Math.cos(a) * r * 0.55, -r * 0.55 + Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a + 0.35) * r * 0.5, -r * 0.55 + Math.sin(a + 0.35) * r * 0.45);
      ctx.closePath();
      ctx.fill();
    }
    if (done) {
      // chopped: wedge lines
      ctx.strokeStyle = '#ffb3ad';
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.1);
      ctx.lineTo(r * 0.5, r * 0.1);
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(0, r * 0.6);
      ctx.stroke();
    }
  } else if (ingId === 'lettuce') {
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8fd19b';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    if (done) {
      ctx.strokeStyle = '#2f7d3e';
      ctx.lineWidth = r * 0.07;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.5, -r * 0.6);
        ctx.lineTo(i * r * 0.5, r * 0.6);
        ctx.stroke();
      }
    }
  } else if (ingId === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.6);
    ctx.lineTo(r * 0.9, r * 0.6);
    ctx.lineTo(0, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const d of [[-0.25, 0.2], [0.3, 0.05], [0.05, 0.38]]) {
      ctx.beginPath();
      ctx.arc(d[0] * r, d[1] * r, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingId === 'noodle') {
    ctx.fillStyle = '#e8e2d2';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.95, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8b0a0';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.95, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = ing.color;
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y = -r * 0.35 + i * r * 0.32;
      ctx.beginPath();
      for (let x = -r * 0.7; x <= r * 0.7; x += r * 0.1) {
        const yy = y + Math.sin(x * 6 / r) * r * 0.12;
        if (x === -r * 0.7) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    if (done) {
      ctx.fillStyle = '#e8443a';
      ctx.beginPath();
      ctx.arc(r * 0.45, -r * 0.4, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  if (!done) {
    ctx.save();
    ctx.fillStyle = 'rgba(60,40,20,0.85)';
    roundRect(ctx, cx - r * 0.55, cy + r * 0.55, r * 1.1, r * 0.42, r * 0.2);
    ctx.fill();
    text(ctx, 'RAW', cx, cy + r * 0.77, Math.max(9, Math.round(r * 0.3)), '#fff', 'center', 'bold');
    ctx.restore();
  }
}

function drawHeart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 16, s / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-11, -4, -6, -13, 0, -6);
  ctx.bezierCurveTo(6, -13, 11, -4, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e8443a' : '#d8cbb2';
  ctx.fill();
  ctx.strokeStyle = '#a92418';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawBell(ctx, cx, cy, r, ready) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = ready ? '#f2c14e' : '#c9a227';
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ready ? '#ffe08a' : '#e3c268';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.35, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  ctx.fillRect(-r * 1.15, -r * 0.08, r * 2.3, r * 0.22);
  ctx.beginPath();
  ctx.arc(0, r * 0.28, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- hit zones: input.js asks which zone a click landed in ----

export function hitZones(state) {
  const zones = [];
  const p = LAYOUT.pantry;
  const cellW = p.w / 3;
  const cellH = (p.h - 34) / 2;
  const pantryIds = ['bun', 'patty', 'tomato', 'lettuce', 'cheese', 'noodle'];
  pantryIds.forEach((id, i) => {
    const cx = p.x + (i % 3) * cellW;
    const cy = p.y + 30 + Math.floor(i / 3) * cellH;
    zones.push({ kind: 'pantry', ing: id, rect: { x: cx + 4, y: cy + 4, w: cellW - 8, h: cellH - 8 } });
  });
  for (const id of ['board', 'grill', 'pot']) {
    zones.push({ kind: 'station', station: id, rect: LAYOUT[id] });
  }
  const c = LAYOUT.counter;
  const slotW = c.w / 5;
  for (let i = 0; i < 5; i++) {
    zones.push({ kind: 'counter', index: i, rect: { x: c.x + 10 + i * slotW, y: c.y + 52, w: slotW - 12, h: 96 } });
  }
  zones.push({ kind: 'counterArea', rect: LAYOUT.counter });
  zones.push({ kind: 'plate', rect: LAYOUT.plate });
  zones.push({ kind: 'serve', rect: LAYOUT.serve });
  return zones;
}

export function zoneAt(state, x, y) {
  const zones = hitZones(state);
  for (const z of zones) {
    const r = z.rect;
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return z;
  }
  return null;
}

// ---- scene drawing ----

function drawBackground(ctx) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.wallStripe;
  for (let y = 90; y < CANVAS_H; y += 120) ctx.fillRect(0, y, CANVAS_W, 14);
  // floor band
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 586, CANVAS_W, 134);
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 2;
  for (let x = 0; x < CANVAS_W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 586);
    ctx.lineTo(x - 40, 720);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 652);
  ctx.lineTo(CANVAS_W, 652);
  ctx.stroke();
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function drawHUD(ctx, state) {
  const h = LAYOUT.hud;
  ctx.fillStyle = '#33241a';
  ctx.fillRect(h.x, h.y, h.w, h.h);
  text(ctx, 'SIZZLE STATION', 20, 32, 26, '#f2c14e', 'left', 'bold');
  text(ctx, 'Kitchen Rush', 268, 34, 14, '#e8dcc8', 'left', 'normal');
  text(ctx, 'SCORE  ' + state.score, 470, 32, 22, '#ffffff', 'left', 'bold');
  text(ctx, 'COINS  ' + state.coins, 660, 32, 18, '#ffd76a', 'left', 'bold');
  if (state.combo >= 2) {
    text(ctx, 'COMBO x' + state.combo, 800, 32, 18, '#8fd19b', 'left', 'bold');
  }
  // shift timer
  const tw = 170;
  const tx = 980;
  text(ctx, 'SHIFT ' + fmtTime(state.shiftLeft), tx, 20, 16, '#ffffff', 'left', 'bold');
  ctx.fillStyle = '#5a4632';
  roundRect(ctx, tx, 32, tw, 12, 6);
  ctx.fill();
  const frac = state.shiftLeft / 150;
  ctx.fillStyle = frac > 0.33 ? '#58b368' : frac > 0.15 ? '#e9a13b' : '#d63a2f';
  if (frac > 0) {
    roundRect(ctx, tx, 32, tw * frac, 12, 6);
    ctx.fill();
  }
  for (let i = 0; i < MAX_LIVES; i++) {
    drawHeart(ctx, 1180 + i * 30, 32, 22, i < state.lives);
  }
}

function drawOrders(ctx, state) {
  const o = LAYOUT.orders;
  const tw = (o.w - 20) / 3;
  for (let i = 0; i < 3; i++) {
    const x = o.x + i * (tw + 10);
    const y = o.y;
    const order = state.orders[i];
    ctx.fillStyle = COLORS.ticket;
    roundRect(ctx, x, y, tw, o.h, 10);
    ctx.fill();
    ctx.strokeStyle = COLORS.ticketEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!order) {
      text(ctx, '— waiting for the next order —', x + tw / 2, y + o.h / 2, 14, COLORS.muted, 'center', 'normal');
      continue;
    }
    const r = order.recipe;
    ctx.fillStyle = r.color;
    roundRect(ctx, x, y, tw, 30, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y + 15, tw, 15);
    text(ctx, '#' + order.id + '  ' + r.name.toUpperCase(), x + 12, y + 16, 15, COLORS.ink, 'left', 'bold');
    // needed ingredients, ringed green once already on the plate
    const plateCount = {};
    for (const it of state.plate) plateCount[it.ing] = (plateCount[it.ing] || 0) + 1;
    const seen = {};
    const need = r.needs;
    const iconR = 24;
    const startX = x + 30;
    need.forEach((ingId, idx) => {
      const cx = startX + idx * 52;
      const cy = y + 62;
      seen[ingId] = (seen[ingId] || 0) + 1;
      const covered = (plateCount[ingId] || 0) >= seen[ingId];
      if (covered) {
        ctx.strokeStyle = '#3d9b4f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, iconR + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawIngredient(ctx, ingId, cx, cy, iconR, true);
      if (covered) {
        ctx.fillStyle = '#3d9b4f';
        ctx.beginPath();
        ctx.arc(cx + 18, cy + 16, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy + 16);
        ctx.lineTo(cx + 17, cy + 21);
        ctx.lineTo(cx + 25, cy + 10);
        ctx.stroke();
      }
    });
    text(ctx, '+' + r.base + ' pts', x + tw - 14, y + 62, 14, COLORS.muted, 'right', 'bold');
    // patience bar with the seconds left at its right end
    const pf = order.patience / order.maxPatience;
    ctx.fillStyle = '#e5d9bd';
    roundRect(ctx, x + 12, y + o.h - 18, tw - 68, 9, 4);
    ctx.fill();
    ctx.fillStyle = pf > 0.5 ? '#58b368' : pf > 0.25 ? '#e9a13b' : '#d63a2f';
    if (pf > 0) {
      roundRect(ctx, x + 12, y + o.h - 18, (tw - 68) * pf, 9, 4);
      ctx.fill();
    }
    text(ctx, Math.ceil(order.patience) + 's', x + tw - 14, y + o.h - 13, 12, pf > 0.25 ? COLORS.muted : '#d63a2f', 'right', 'bold');
  }
}

function drawPantry(ctx, state) {
  const p = LAYOUT.pantry;
  panel(ctx, p, '#fff8e6', '#d9c98a');
  text(ctx, 'PANTRY — click to take (keys 1-6)', p.x + 12, p.y + 16, 13, COLORS.muted, 'left', 'bold');
  const cellW = p.w / 3;
  const cellH = (p.h - 34) / 2;
  const ids = ['bun', 'patty', 'tomato', 'lettuce', 'cheese', 'noodle'];
  ids.forEach((id, i) => {
    const cx = p.x + (i % 3) * cellW;
    const cy = p.y + 30 + Math.floor(i / 3) * cellH;
    const ing = INGREDIENTS[id];
    const inHand = state.hand === id;
    ctx.fillStyle = inHand ? '#ffe9a8' : '#fdf3d8';
    roundRect(ctx, cx + 6, cy + 4, cellW - 12, cellH - 8, 10);
    ctx.fill();
    ctx.strokeStyle = inHand ? '#e9a13b' : '#e0cfa5';
    ctx.lineWidth = inHand ? 3 : 1.5;
    ctx.stroke();
    drawIngredient(ctx, id, cx + cellW / 2, cy + cellH / 2 - 8, 20, ing.station === null);
    text(ctx, ing.name, cx + cellW / 2, cy + cellH - 14, 12, COLORS.ink, 'center', 'bold');
    ctx.fillStyle = '#b09a6a';
    ctx.beginPath();
    ctx.arc(cx + cellW - 18, cy + 16, 9, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ing.key, cx + cellW - 18, cy + 17, 11, '#fff', 'center', 'bold');
  });
}

function drawStation(ctx, state, id) {
  const rect = LAYOUT[id];
  const st = state.stations[id];
  const station = STATIONS[id];
  const busy = !!st.item && st.progress < st.duration;
  const done = !!st.item && st.progress >= st.duration;
  panel(ctx, rect, busy ? '#fff3d6' : '#fdf6e3', done ? '#3d9b4f' : '#d9c98a');
  text(ctx, station.name.toUpperCase(), rect.x + 14, rect.y + 18, 14, COLORS.ink, 'left', 'bold');
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 78;
  if (!st.item) {
    ctx.strokeStyle = '#cbb98d';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'empty', cx, cy, 13, COLORS.muted, 'center', 'normal');
    text(ctx, 'accepts: ' + station.accepts.map((a) => INGREDIENTS[a].name).join(' + '), cx, rect.y + rect.h - 16, 12, COLORS.muted, 'center', 'normal');
    return;
  }
  const ing = INGREDIENTS[st.item];
  drawIngredient(ctx, st.item, cx, cy, 40, done);
  if (busy) {
    const frac = st.progress / st.duration;
    ctx.fillStyle = '#e5d9bd';
    roundRect(ctx, rect.x + 20, rect.y + rect.h - 34, rect.w - 40, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#e9a13b';
    roundRect(ctx, rect.x + 20, rect.y + rect.h - 34, (rect.w - 40) * frac, 12, 6);
    ctx.fill();
    text(ctx, station.verb + '… ' + Math.ceil(st.duration - st.progress) + 's', cx, rect.y + rect.h - 14, 13, COLORS.ink, 'center', 'bold');
  } else {
    text(ctx, 'READY — click to move to counter', cx, rect.y + rect.h - 16, 13, '#3d9b4f', 'center', 'bold');
  }
}

function drawCounter(ctx, state) {
  const c = LAYOUT.counter;
  panel(ctx, c, COLORS.counterTop, COLORS.counterFront);
  ctx.fillStyle = '#fff';
  ctx.fillRect(c.x, c.y, c.w, 6);
  text(ctx, 'COUNTER — finished food waits here, click to plate it', c.x + 12, c.y + 22, 13, '#ffe9c4', 'left', 'bold');
  const slotW = c.w / 5;
  for (let i = 0; i < 5; i++) {
    const sx = c.x + 10 + i * slotW;
    const sy = c.y + 52;
    const item = state.counter[i];
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, sx, sy, slotW - 12, 96, 10);
    ctx.fill();
    if (item) {
      drawIngredient(ctx, item.ing, sx + (slotW - 12) / 2, sy + 40, 30, item.done);
      text(ctx, itemName(item), sx + (slotW - 12) / 2, sy + 82, 11, '#fff', 'center', 'bold');
    }
  }
  text(ctx, state.counter.length + ' / 5 on the counter', c.x + 12, c.y + c.h - 14, 12, '#ffe9c4', 'left', 'normal');
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  panel(ctx, p, '#fdf6e3', '#d9c98a');
  text(ctx, 'PLATE — click a counter item to add it', p.x + 12, p.y + 18, 13, COLORS.muted, 'left', 'bold');
  const cx = p.x + 130;
  const cy = p.y + 108;
  // plate dish
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 105, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.plateRim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#e9e2cf';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 78, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  // stacked ingredients on the plate
  const layers = state.plate;
  let ly = cy - 6;
  for (let i = 0; i < layers.length; i++) {
    const item = layers[i];
    const ing = INGREDIENTS[item.ing];
    ctx.fillStyle = ing.color;
    const lw = 130 - i * 4;
    roundRect(ctx, cx - lw / 2, ly - 14, lw, 13, 6);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ly -= 14;
  }
  if (layers.length === 0) {
    text(ctx, 'empty plate', cx, cy - 2, 13, COLORS.muted, 'center', 'normal');
  }
  // list what is on the plate
  const lx = p.x + 236;
  text(ctx, 'ON THE PLATE', lx, p.y + 44, 12, COLORS.muted, 'left', 'bold');
  if (layers.length === 0) {
    text(ctx, 'nothing yet', lx, p.y + 66, 12, COLORS.muted, 'left', 'normal');
  } else {
    layers.forEach((item, i) => {
      text(ctx, (i + 1) + '. ' + itemName(item), lx, p.y + 66 + i * 20, 12, COLORS.ink, 'left', 'normal');
    });
  }
  text(ctx, 'click plate to take the top item off', p.x + 12, p.y + p.h - 14, 12, COLORS.muted, 'left', 'normal');
}

function drawServe(ctx, state) {
  const s = LAYOUT.serve;
  const match = state.plate.length > 0 && state.orders.some((o) => {
    const have = {};
    for (const it of state.plate) have[it.ing] = (have[it.ing] || 0) + 1;
    const want = {};
    for (const id of o.recipe.needs) want[id] = (want[id] || 0) + 1;
    return Object.keys(want).every((k) => (have[k] || 0) === want[k]) && state.plate.length === o.recipe.needs.length;
  });
  panel(ctx, s, match ? '#e7f6e3' : '#fdf6e3', match ? '#3d9b4f' : '#d9c98a');
  drawBell(ctx, s.x + s.w / 2, s.y + 62, 44, match);
  text(ctx, match ? 'READY TO SERVE!' : 'SERVICE BELL', s.x + s.w / 2, s.y + 118, 16, match ? '#2f7d3e' : COLORS.ink, 'center', 'bold');
  ctx.fillStyle = match ? '#3d9b4f' : '#b09a6a';
  roundRect(ctx, s.x + 48, s.y + 136, s.w - 96, 38, 10);
  ctx.fill();
  text(ctx, 'SERVE  [Space]', s.x + s.w / 2, s.y + 156, 16, '#fff', 'center', 'bold');
}

function drawFooter(ctx, state) {
  const f = LAYOUT.footer;
  const handText = state.hand
    ? 'Hand: ' + itemName(newItem(state.hand)) + (INGREDIENTS[state.hand].station ? ' → take it to the ' + STATIONS[INGREDIENTS[state.hand].station].name : ' → click the counter to set it down')
    : 'Hand: empty — click a pantry ingredient (or press 1-6)';
  text(ctx, handText, 20, 616, 15, '#fff', 'left', 'bold');
  text(ctx, 'Space serve  •  Backspace clear plate  •  P pause  •  M mute  •  R restart', 20, 644, 13, '#e8dcc8', 'left', 'normal');
  text(ctx, 'Served: ' + state.servedCount + '   Missed: ' + state.expiredCount + '   Best combo: x' + state.bestCombo, 20, 672, 13, '#e8dcc8', 'left', 'normal');
  if (state.toast && state.time < state.toast.until) {
    const colors = { info: '#33241a', good: '#2f7d3e', error: '#a92418' };
    ctx.fillStyle = colors[state.toast.kind] || colors.info;
    const w = Math.min(900, 40 + state.toast.text.length * 8.4);
    roundRect(ctx, (CANVAS_W - w) / 2, 700 - 108, w, 34, 17);
    ctx.fill();
    text(ctx, state.toast.text, CANVAS_W / 2, 700 - 90, 15, '#fff', 'center', 'bold');
  }
  if (state.flash && state.time < state.flash.until) {
    ctx.fillStyle = state.flash.kind === 'serve' ? 'rgba(61,155,79,0.18)' : 'rgba(214,58,47,0.18)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(30,18,8,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 290, 120, 700, 480, 18);
  ctx.fill();
  ctx.strokeStyle = accent || '#e9a13b';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, title, CANVAS_W / 2, 178, 40, COLORS.ink, 'center', 'bold');
  let y = 238;
  for (const line of lines) {
    text(ctx, line, CANVAS_W / 2, y, 18, COLORS.ink, 'center', line.startsWith('>') ? 'bold' : 'normal');
    y += 34;
  }
}

export function render(ctx, state) {
  drawBackground(ctx);
  drawHUD(ctx, state);
  drawOrders(ctx, state);
  drawPantry(ctx, state);
  drawStation(ctx, state, 'board');
  drawStation(ctx, state, 'grill');
  drawStation(ctx, state, 'pot');
  drawCounter(ctx, state);
  drawPlate(ctx, state);
  drawServe(ctx, state);
  drawFooter(ctx, state);

  if (state.phase === 'title') {
    overlay(ctx, 'SIZZLE STATION', [
      'You run the busiest little kitchen in town.',
      'Take ingredients, chop and grill them,',
      'build each order on the plate and ring the bell.',
      '',
      'Click the pantry (or keys 1-6), use the stations,',
      'plate from the counter, serve with Space.',
      'Orders lose patience — a lost order costs a life.',
      '',
      '> Click or press Enter to start your shift <',
    ]);
  } else if (state.phase === 'paused') {
    overlay(ctx, 'PAUSED', ['Take a breath, chef.', '', '> Press P or click to keep cooking <'], '#3f7fb5');
  } else if (state.phase === 'over') {
    overlay(ctx, 'SHIFT OVER', [
      'The kitchen got the better of you this time.',
      'Score: ' + state.score + '   •   Dishes served: ' + state.servedCount,
      'Best combo: x' + state.bestCombo + '   •   Orders lost: ' + state.expiredCount,
      '',
      '> Press R or click to try again <',
    ], '#d63a2f');
  } else if (state.phase === 'complete') {
    overlay(ctx, 'SHIFT COMPLETE!', [
      'Service is done and the kitchen still stands.',
      'Score: ' + state.score + '   •   Dishes served: ' + state.servedCount,
      'Best combo: x' + state.bestCombo + '   •   Orders lost: ' + state.expiredCount,
      '',
      '> Press R or click to run another shift <',
    ], '#3d9b4f');
  }
}
