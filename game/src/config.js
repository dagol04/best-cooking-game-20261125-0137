// Sizzle Station — game configuration: canvas, ingredients, recipes, stations.
// Every value here is original to this game.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const SHIFT_SECONDS = 150;
export const MAX_LIVES = 3;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 45;
export const SPAWN_START = 13;
export const SPAWN_END = 7;
export const COUNTER_MAX = 5;
export const PLATE_MAX = 5;

// Ingredient catalogue. `station` is null for ingredients that are ready as-is.
// `cook` is the processing time in seconds on that station.
export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',            key: '1', station: null,    cook: 0,   color: '#e8b45a', dark: '#b97f2e' },
  patty:   { id: 'patty',   name: 'Patty',          key: '2', station: 'grill', cook: 4.0, color: '#a0663a', dark: '#6e4423' },
  tomato:  { id: 'tomato',  name: 'Tomato',         key: '3', station: 'board', cook: 2.5, color: '#e8443a', dark: '#a92418' },
  lettuce: { id: 'lettuce', name: 'Lettuce',        key: '4', station: 'board', cook: 2.0, color: '#58b368', dark: '#2f7d3e' },
  cheese:  { id: 'cheese',  name: 'Cheese',         key: '5', station: null,    cook: 0,   color: '#ffc93c', dark: '#d99a00' },
  noodle:  { id: 'noodle',  name: 'Noodle',         key: '6', station: 'pot',   cook: 5.0, color: '#f2d06b', dark: '#c79a2e' },
};

export const PANTRY_ORDER = ['bun', 'patty', 'tomato', 'lettuce', 'cheese', 'noodle'];

// Processed display names for items that went through a station.
export const COOKED_NAME = {
  patty: 'Grilled Patty',
  tomato: 'Chopped Tomato',
  lettuce: 'Chopped Lettuce',
  noodle: 'Boiled Noodle',
};

// Recipes: each order is one dish. `needs` lists ingredient ids; an id may
// repeat (Garden Salad wants two helpings of chopped lettuce). A plate serves
// an order when its ingredient multiset matches exactly.
export const RECIPES = [
  {
    id: 'burger',
    name: 'Classic Burger',
    needs: ['bun', 'patty', 'tomato', 'lettuce'],
    base: 100,
    color: '#e8b45a',
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    needs: ['bun', 'patty', 'cheese'],
    base: 90,
    color: '#ffc93c',
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    needs: ['lettuce', 'lettuce', 'tomato'],
    base: 80,
    color: '#58b368',
  },
  {
    id: 'noodle',
    name: 'Noodle Bowl',
    needs: ['noodle', 'tomato', 'cheese'],
    base: 110,
    color: '#f2d06b',
  },
];

export const STATIONS = {
  board: { id: 'board', name: 'Chopping Board', accepts: ['tomato', 'lettuce'], verb: 'Chopping' },
  grill: { id: 'grill', name: 'Grill', accepts: ['patty'], verb: 'Grilling' },
  pot: { id: 'pot', name: 'Boiling Pot', accepts: ['noodle'], verb: 'Boiling' },
};

export const COLORS = {
  wall: '#f7e8c8',
  wallStripe: '#f2ddb4',
  floor: '#c98d5a',
  floorLine: '#b57a48',
  counterTop: '#8a5a2b',
  counterFront: '#6e4423',
  steel: '#c9d2d8',
  steelDark: '#9aa7b0',
  board: '#e9c893',
  ticket: '#fffbe8',
  ticketEdge: '#d9c98a',
  ink: '#33241a',
  muted: '#7a6a58',
  red: '#d63a2f',
  green: '#3d9b4f',
  gold: '#e9a13b',
  blue: '#3f7fb5',
  plate: '#fdfdf6',
  plateRim: '#c9c2ae',
};

// Layout rectangles (x, y, w, h) for the kitchen, in canvas pixels.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 62 },
  orders: { x: 16, y: 72, w: 1248, h: 108 },
  pantry: { x: 16, y: 196, w: 372, h: 168 },
  board: { x: 404, y: 196, w: 264, h: 168 },
  grill: { x: 684, y: 196, w: 264, h: 168 },
  pot: { x: 964, y: 196, w: 300, h: 168 },
  counter: { x: 16, y: 380, w: 560, h: 190 },
  plate: { x: 592, y: 380, w: 360, h: 190 },
  serve: { x: 968, y: 380, w: 296, h: 190 },
  footer: { x: 0, y: 586, w: 1280, h: 134 },
};
