// ═══════════════════════════════════════════════════════════
//  texture-atlas.js — генерация текстурного атласа 512×512
//  Все текстуры блоков в одном PNG, доступ через UV-координаты
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

// Размер атласа
export const ATLAS_SIZE = 512;
export const TILE_SIZE = 32; // каждая текстура 32×32
const TILES_PER_ROW = ATLAS_SIZE / TILE_SIZE; // 16 текстур в ряд

// Палитра цветов для пиксель-арта
const PALETTE = {
  // Зелёные
  grass_light: 0x7cba34, grass_dark: 0x5a8a24, grass_bright: 0x8cca44,
  leaves_light: 0x6aaa3a, leaves_dark: 0x3a6a1a, spruce_leaves: 0x2a5a1a,
  // Коричневые / дерево
  dirt: 0x9b7653, dirt_dark: 0x6b4423, wood_top: 0xb8860b, wood_side: 0x6b4423,
  wood_dark: 0x4a2f15, plank: 0xc89a4a, plank_dark: 0xa87a3a,
  // Каменные
  stone: 0x888888, stone_dark: 0x6a6a6a, cobble: 0x7d7d7d, cobble_dark: 0x5a5a5a,
  bedrock: 0x2b2b2b, bedrock_light: 0x4a4a4a, granite: 0xa87a5a, diorite: 0xc8c8b8,
  andesite: 0x8a8a7a, moss: 0x5a7a3a, obsidian: 0x1a0a2a,
  // Песок / пустыня
  sand: 0xe6d29a, sand_dark: 0xc8b278,
  // Снег / лёд
  snow: 0xf0f0f8, snow_dark: 0xd0d0e0, ice: 0x8ac8e8, packed_ice: 0x6aa8d8,
  // Руды
  coal_ore: 0x3a3a3a, iron_ore: 0xd8a878, gold_ore: 0xfada5e, diamond_ore: 0x5edfd5,
  mythril_ore: 0x5ac8c8, adamant_ore: 0xc85a5a,
  // Металлы
  iron_block: 0xd8d8d8, gold_block: 0xfada5e, diamond_block: 0x5edfd5,
  mythril_block: 0x5ac8c8, adamant_block: 0xc85a5a,
  // Жидкости
  water: 0x3a6ea8, water_light: 0x5a8ec8, lava: 0xe85a2a, lava_bright: 0xffa550,
  // Особые
  glass: 0xa8d8e8, brick: 0xa8432a, brick_dark: 0x5a2818,
  crafting_top: 0x5a3a18, crafting_side: 0x8b5a2b,
  chest: 0xa8782a, chest_dark: 0x5a3a18,
  cactus: 0x3a8a3a, cactus_dark: 0x2a6a2a, cactus_light: 0x5aaa5a,
  // Декор
  flower_red: 0xe83a3a, flower_yellow: 0xffe85e, flower_blue: 0x5a8ada,
  torch_wood: 0x8b5a2b, torch_flame: 0xffa500, torch_flame_bright: 0xffe85e,
  glowstone: 0xffd95e, glowstone_bright: 0xffffff,
  // Магические
  enchant_top: 0x6a2a8a, enchant_side: 0x4a1a5a, purpur: 0xa87ac8,
  netherrack: 0x8a2a2a, end_stone: 0xdede88,
  // Болото
  dark_grass: 0x4a6a24, mud: 0x4a3a1a, willow_top: 0x6a8a4a, willow_side: 0x4a3a1a,
  swamp_log_top: 0x5a4a2a, swamp_log_side: 0x3a2a1a,
  // Джунгли
  jungle_wood_top: 0x6a4a2a, jungle_wood_side: 0x4a2a1a,
  jungle_leaves: 0x3a7a2a,
  // Мебель
  table_top: 0x8b5a2b, table_side: 0x6b4423,
  furnace_side: 0x777777, furnace_top: 0x555555, furnace_fire: 0xff8a2a,
  wool_white: 0xf0f0f0, wool_black: 0x2a2a2a, wool_red: 0xc83a3a, wool_blue: 0x3a5ac8,
  carpet_red: 0xc83a3a, carpet_blue: 0x3a5ac8, carpet_green: 0x3a8a3a,
  // Прочее
  crystal: 0xffaa5e, anvil: 0x444444, bookshelf: 0xb8860b,
};

// Карта: имя текстуры → координаты в атласе (tile index)
const TEXTURE_MAP = {};
let nextTileIndex = 0;

function getTileUV(name) {
  if (!(name in TEXTURE_MAP)) {
    TEXTURE_MAP[name] = nextTileIndex++;
  }
  const idx = TEXTURE_MAP[name];
  const row = Math.floor(idx / TILES_PER_ROW);
  const col = idx % TILES_PER_ROW;
  // UV координаты (Three.js использует 0-1)
  const u0 = col * TILE_SIZE / ATLAS_SIZE;
  const v0 = 1 - (row + 1) * TILE_SIZE / ATLAS_SIZE; // инвертируем Y
  const u1 = (col + 1) * TILE_SIZE / ATLAS_SIZE;
  const v1 = 1 - row * TILE_SIZE / ATLAS_SIZE;
  return { idx, u0, v0, u1, v1 };
}

// ═══════════════════════════════════════════════════════════
//  Рисование отдельных текстур (pixel-art стиль)
// ═══════════════════════════════════════════════════════════

function hexToRgb(hex) {
  return { r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff };
}

function px(ctx, x, y, color, alpha = 1) {
  ctx.fillStyle = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.fillRect(x, y, 1, 1);
  ctx.globalAlpha = 1;
}

function fillTile(ctx, ox, oy, color) {
  const c = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
  ctx.fillStyle = c;
  ctx.fillRect(ox, oy, TILE_SIZE, TILE_SIZE);
}

function noiseTile(ctx, ox, oy, baseColor, intensity = 25, density = 0.6) {
  const { r, g, b } = hexToRgb(baseColor);
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      if (Math.random() > density) {
        const v = (Math.random() - 0.5) * intensity;
        const nr = Math.max(0, Math.min(255, r + v));
        const ng = Math.max(0, Math.min(255, g + v));
        const nb = Math.max(0, Math.min(255, b + v));
        ctx.fillStyle = `rgb(${nr|0},${ng|0},${nb|0})`;
        ctx.fillRect(ox + x, oy + y, 1, 1);
      } else {
        ctx.fillStyle = '#' + baseColor.toString(16).padStart(6, '0');
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}

// Рисует конкретную текстуру в тайле по имени
function drawTexture(ctx, name, ox, oy) {
  switch(name) {
    case 'grass_top':
      noiseTile(ctx, ox, oy, PALETTE.grass_light, 20, 0.7);
      // Пятна
      for (let i = 0; i < 20; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE),
           Math.random() < 0.5 ? PALETTE.grass_dark : PALETTE.grass_bright);
      }
      break;
    case 'grass_side':
      noiseTile(ctx, ox, oy, PALETTE.dirt, 25, 0.7);
      // Зелёный верх
      ctx.fillStyle = '#' + PALETTE.grass_light.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy, TILE_SIZE, 6);
      // Капли зелёного
      for (let i = 0; i < 15; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + 5 + Math.floor(Math.random()*4), PALETTE.grass_dark);
      }
      // Зелёные пятна на боку
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = '#' + PALETTE.grass_bright.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*5), 2, 1);
      }
      break;
    case 'dirt':
      noiseTile(ctx, ox, oy, PALETTE.dirt, 25, 0.7);
      // Камешки
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.dirt_dark.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*(TILE_SIZE-2)), oy + Math.floor(Math.random()*(TILE_SIZE-2)), 2, 2);
      }
      break;
    case 'stone':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      // Трещины
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(ox + Math.random()*TILE_SIZE, oy + Math.random()*TILE_SIZE);
        ctx.lineTo(ox + Math.random()*TILE_SIZE, oy + Math.random()*TILE_SIZE);
        ctx.stroke();
      }
      break;
    case 'cobble':
      noiseTile(ctx, ox, oy, PALETTE.cobble, 20, 0.6);
      // Каменные куски
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random()*0.25})`;
        ctx.fillRect(ox + Math.floor(Math.random()*(TILE_SIZE-3)), oy + Math.floor(Math.random()*(TILE_SIZE-3)), 3, 3);
      }
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random()*0.2})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'wood_top':
      noiseTile(ctx, ox, oy, PALETTE.wood_top, 15, 0.8);
      // Кольца
      ctx.strokeStyle = '#' + PALETTE.wood_side.toString(16).padStart(6, '0'); ctx.lineWidth = 1.5;
      for (let rad = 3; rad < 14; rad += 3) {
        ctx.beginPath();
        ctx.arc(ox + 16, oy + 16, rad, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.fillStyle = '#' + PALETTE.dirt_dark.toString(16).padStart(6, '0');
      ctx.beginPath(); ctx.arc(ox + 16, oy + 16, 2, 0, Math.PI*2); ctx.fill();
      break;
    case 'wood_side':
      noiseTile(ctx, ox, oy, PALETTE.wood_side, 18, 0.75);
      // Вертикальные полосы коры
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? '#' + PALETTE.wood_dark.toString(16).padStart(6, '0') : '#' + PALETTE.dirt_dark.toString(16).padStart(6, '0');
        ctx.fillRect(ox + i * 4 + 1, oy, 2, TILE_SIZE);
      }
      // Узел
      ctx.fillStyle = '#' + PALETTE.wood_dark.toString(16).padStart(6, '0');
      ctx.beginPath(); ctx.arc(ox + 12, oy + 16, 3, 0, Math.PI*2); ctx.fill();
      break;
    case 'plank':
      noiseTile(ctx, ox, oy, PALETTE.plank, 15, 0.8);
      // Горизонтальные линии
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(ox, oy + 15, TILE_SIZE, 1); ctx.fillRect(ox, oy + 31, TILE_SIZE, 1);
      ctx.fillStyle = '#' + PALETTE.plank_dark.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy, TILE_SIZE, 1); ctx.fillRect(ox, oy + 16, TILE_SIZE, 1);
      // Текстура дерева
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = 'rgba(139,90,43,0.4)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'leaves':
      fillTile(ctx, ox, oy, PALETTE.leaves_dark);
      // Плотная листва
      for (let i = 0; i < 80; i++) {
        const v = (Math.random() - 0.5) * 30;
        const c = i % 3 === 0 ? PALETTE.leaves_light : PALETTE.leaves_dark;
        const { r, g, b } = hexToRgb(c);
        ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random()*0.25})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = '#' + PALETTE.leaves_light.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'spruce_leaves':
      fillTile(ctx, ox, oy, PALETTE.spruce_leaves);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random()*0.25})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = '#3a7a2a';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'sand':
      noiseTile(ctx, ox, oy, PALETTE.sand, 15, 0.85);
      // Рябь
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = 'rgba(180,150,100,0.3)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'water':
      fillTile(ctx, ox, oy, PALETTE.water);
      // Волны — диагональные полосы
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(90,142,200,${0.4 + Math.random()*0.3})`;
        const y = i * 4 + Math.floor(Math.random()*2);
        ctx.fillRect(ox, oy + y, TILE_SIZE, 1);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random()*0.15})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'water_1':
      fillTile(ctx, ox, oy, PALETTE.water);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(90,142,200,${0.4 + Math.random()*0.3})`;
        const y = i * 4 + 2 + Math.floor(Math.random()*2);
        ctx.fillRect(ox, oy + y, TILE_SIZE, 1);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random()*0.15})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'water_2':
      fillTile(ctx, ox, oy, PALETTE.water);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(90,142,200,${0.4 + Math.random()*0.3})`;
        const y = i * 4 + 1 + Math.floor(Math.random()*2);
        ctx.fillRect(ox, oy + y, TILE_SIZE, 1);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random()*0.15})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'water_3':
      fillTile(ctx, ox, oy, PALETTE.water);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(90,142,200,${0.4 + Math.random()*0.3})`;
        const y = i * 4 + 3 + Math.floor(Math.random()*2);
        ctx.fillRect(ox, oy + y, TILE_SIZE, 1);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random()*0.15})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'glass':
      ctx.fillStyle = 'rgba(168,216,232,0.3)'; ctx.fillRect(ox, oy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + 1, oy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      // Блик
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(ox + 3, oy + 3, 8, 2);
      ctx.fillRect(ox + 3, oy + 3, 2, 8);
      break;
    case 'brick':
      noiseTile(ctx, ox, oy, PALETTE.brick, 18, 0.8);
      // Кладка
      ctx.fillStyle = '#' + PALETTE.brick_dark.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy + 14, TILE_SIZE, 2); ctx.fillRect(ox, oy + 30, TILE_SIZE, 2);
      ctx.fillRect(ox + 14, oy, 2, 16); ctx.fillRect(ox + 6, oy + 16, 2, 14); ctx.fillRect(ox + 22, oy + 16, 2, 14);
      break;
    case 'bedrock':
      noiseTile(ctx, ox, oy, PALETTE.bedrock, 30, 0.5);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.2 + Math.random()*0.4})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#' + PALETTE.bedrock_light.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'coal_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      // Чёрные вкрапления
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#1a1a1a';
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(sx, sy, 1, 1);
      }
      break;
    case 'iron_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.iron_ore.toString(16).padStart(6, '0');
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillStyle = 'rgba(255,235,200,0.5)';
        ctx.fillRect(sx, sy, 1, 1);
      }
      break;
    case 'gold_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.gold_ore.toString(16).padStart(6, '0');
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillStyle = 'rgba(255,255,200,0.6)';
        ctx.fillRect(sx, sy, 1, 1);
      }
      break;
    case 'diamond_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.diamond_ore.toString(16).padStart(6, '0');
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(sx, sy, 1, 1);
      }
      break;
    case 'mythril_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.mythril_ore.toString(16).padStart(6, '0');
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
      }
      break;
    case 'adamant_ore':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = '#' + PALETTE.adamant_ore.toString(16).padStart(6, '0');
        const sx = ox + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        const sy = oy + 2 + Math.floor(Math.random()*(TILE_SIZE-4));
        ctx.fillRect(sx, sy, 3, 3);
      }
      break;
    case 'iron_block':
      noiseTile(ctx, ox, oy, PALETTE.iron_block, 15, 0.85);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random()*0.3})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox + 1, oy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      break;
    case 'gold_block':
      noiseTile(ctx, ox, oy, PALETTE.gold_block, 15, 0.85);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random()*0.3})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox + 1, oy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      break;
    case 'diamond_block':
      noiseTile(ctx, ox, oy, PALETTE.diamond_block, 15, 0.85);
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox + 1, oy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      break;
    case 'crafting_top':
      fillTile(ctx, ox, oy, PALETTE.crafting_top);
      // Сетка 2×2
      ctx.strokeStyle = '#3a2a08'; ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + 2, oy + 2, 13, 13); ctx.strokeRect(ox + 17, oy + 2, 13, 13);
      ctx.strokeRect(ox + 2, oy + 17, 13, 13); ctx.strokeRect(ox + 17, oy + 17, 13, 13);
      break;
    case 'crafting_side':
      fillTile(ctx, ox, oy, PALETTE.crafting_top);
      ctx.fillStyle = '#' + PALETTE.crafting_side.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy, TILE_SIZE, 8);
      // Текстура дерева
      for (let i = 0; i < 10; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), PALETTE.wood_dark);
      }
      break;
    case 'chest':
      fillTile(ctx, ox, oy, PALETTE.chest_dark);
      ctx.fillStyle = '#' + PALETTE.chest.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 2, oy + 3, 28, 26);
      ctx.fillStyle = '#' + PALETTE.chest_dark.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy + 14, TILE_SIZE, 3); ctx.fillRect(ox + 14, oy + 3, 4, 26);
      // Замок
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(ox + 14, oy + 14, 4, 4);
      break;
    case 'snow':
      noiseTile(ctx, ox, oy, PALETTE.snow, 12, 0.85);
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'ice':
      fillTile(ctx, ox, oy, PALETTE.ice);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random()*0.3})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'packed_ice':
      fillTile(ctx, ox, oy, PALETTE.packed_ice);
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random()*0.3})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 1);
      }
      break;
    case 'cactus_top':
      fillTile(ctx, ox, oy, PALETTE.cactus_dark);
      ctx.fillStyle = '#' + PALETTE.cactus.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 4, oy + 4, 24, 24);
      ctx.fillStyle = '#' + PALETTE.cactus_light.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 8, oy + 8, 16, 16);
      break;
    case 'cactus_side':
      fillTile(ctx, ox, oy, PALETTE.cactus_dark);
      ctx.fillStyle = '#' + PALETTE.cactus.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 4, oy, 24, TILE_SIZE);
      ctx.fillStyle = '#' + PALETTE.cactus_light.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 8, oy, 4, TILE_SIZE); ctx.fillRect(ox + 20, oy, 4, TILE_SIZE);
      // Шипы
      for (let i = 0; i < 10; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 0xffffff);
      }
      break;
    case 'dark_grass_top':
      noiseTile(ctx, ox, oy, PALETTE.dark_grass, 18, 0.75);
      for (let i = 0; i < 15; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 0x3a5a18);
      }
      break;
    case 'dark_grass_side':
      noiseTile(ctx, ox, oy, PALETTE.dirt, 25, 0.7);
      ctx.fillStyle = '#' + PALETTE.dark_grass.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy, TILE_SIZE, 5);
      break;
    case 'mud':
      noiseTile(ctx, ox, oy, PALETTE.mud, 20, 0.7);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 2);
      }
      break;
    case 'moss':
      noiseTile(ctx, ox, oy, PALETTE.stone, 18, 0.6);
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = '#' + PALETTE.moss.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      break;
    case 'obsidian':
      fillTile(ctx, ox, oy, PALETTE.obsidian);
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(80,30,80,${0.3 + Math.random()*0.3})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      ctx.strokeStyle = 'rgba(150,80,150,0.5)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(ox + Math.random()*TILE_SIZE, oy + Math.random()*TILE_SIZE);
        ctx.lineTo(ox + Math.random()*TILE_SIZE, oy + Math.random()*TILE_SIZE);
        ctx.stroke();
      }
      break;
    case 'lava':
    case 'lava_0':
      fillTile(ctx, ox, oy, PALETTE.lava);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#' + PALETTE.lava_bright.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#ffe85e';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'lava_1':
      fillTile(ctx, ox, oy, PALETTE.lava);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#' + PALETTE.lava_bright.toString(16).padStart(6, '0');
        const x = (ox + Math.floor(Math.random()*TILE_SIZE) + 4) % TILE_SIZE + ox;
        ctx.fillRect(x, oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#ffe85e';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'lava_2':
      fillTile(ctx, ox, oy, PALETTE.lava);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#' + PALETTE.lava_bright.toString(16).padStart(6, '0');
        const y = (oy + Math.floor(Math.random()*TILE_SIZE) + 4) % TILE_SIZE + oy;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), y, 2, 2);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#ffe85e';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'lava_3':
      fillTile(ctx, ox, oy, PALETTE.lava);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = '#' + PALETTE.lava_bright.toString(16).padStart(6, '0');
        const x = (ox + Math.floor(Math.random()*TILE_SIZE) + 8) % TILE_SIZE + ox;
        const y = (oy + Math.floor(Math.random()*TILE_SIZE) + 4) % TILE_SIZE + oy;
        ctx.fillRect(x, y, 2, 2);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#ffe85e';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'spruce_top':
      noiseTile(ctx, ox, oy, PALETTE.wood_top, 15, 0.8);
      ctx.strokeStyle = '#' + PALETTE.wood_dark.toString(16).padStart(6, '0'); ctx.lineWidth = 1.5;
      for (let rad = 3; rad < 14; rad += 3) {
        ctx.beginPath(); ctx.arc(ox + 16, oy + 16, rad, 0, Math.PI*2); ctx.stroke();
      }
      break;
    case 'spruce_side':
      noiseTile(ctx, ox, oy, 0x3a2a18, 15, 0.8);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#1a0a08';
        ctx.fillRect(ox + i * 4, oy, 2, TILE_SIZE);
      }
      break;
    case 'jungle_wood_top':
      noiseTile(ctx, ox, oy, PALETTE.jungle_wood_top, 15, 0.8);
      ctx.strokeStyle = '#' + PALETTE.jungle_wood_side.toString(16).padStart(6, '0'); ctx.lineWidth = 1.5;
      for (let rad = 3; rad < 14; rad += 3) {
        ctx.beginPath(); ctx.arc(ox + 16, oy + 16, rad, 0, Math.PI*2); ctx.stroke();
      }
      break;
    case 'jungle_wood_side':
      noiseTile(ctx, ox, oy, PALETTE.jungle_wood_side, 18, 0.75);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#2a1a08';
        ctx.fillRect(ox + i * 4 + 1, oy, 2, TILE_SIZE);
      }
      break;
    case 'jungle_leaves':
      fillTile(ctx, ox, oy, PALETTE.jungle_leaves);
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random()*0.25})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = '#5aaa3a';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'swamp_log_top':
      noiseTile(ctx, ox, oy, PALETTE.swamp_log_top, 15, 0.8);
      ctx.strokeStyle = '#' + PALETTE.swamp_log_side.toString(16).padStart(6, '0'); ctx.lineWidth = 1.5;
      for (let rad = 3; rad < 14; rad += 3) {
        ctx.beginPath(); ctx.arc(ox + 16, oy + 16, rad, 0, Math.PI*2); ctx.stroke();
      }
      break;
    case 'swamp_log_side':
      noiseTile(ctx, ox, oy, PALETTE.swamp_log_side, 18, 0.75);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(ox + i * 4 + 1, oy, 2, TILE_SIZE);
      }
      // Мох на боку
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#' + PALETTE.moss.toString(16).padStart(6, '0');
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*5), 2, 1);
      }
      break;
    case 'granite':
      noiseTile(ctx, ox, oy, PALETTE.granite, 20, 0.7);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgba(120,60,40,0.5)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      break;
    case 'diorite':
      noiseTile(ctx, ox, oy, PALETTE.diorite, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'andesite':
      noiseTile(ctx, ox, oy, PALETTE.andesite, 18, 0.75);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(60,60,50,0.4)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      break;
    case 'furnace_top':
      fillTile(ctx, ox, oy, PALETTE.furnace_top);
      ctx.fillStyle = '#' + PALETTE.furnace_side.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 4, oy + 4, 24, 24);
      break;
    case 'furnace_side':
      noiseTile(ctx, ox, oy, PALETTE.furnace_side, 15, 0.8);
      ctx.fillStyle = '#' + PALETTE.furnace_top.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 4, oy + 4, 24, 24);
      // Огонь
      ctx.fillStyle = '#' + PALETTE.furnace_fire.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 10, oy + 12, 12, 12);
      ctx.fillStyle = '#ffe85e';
      ctx.fillRect(ox + 13, oy + 15, 6, 6);
      break;
    case 'table_top':
      noiseTile(ctx, ox, oy, PALETTE.table_top, 15, 0.8);
      ctx.fillStyle = '#' + PALETTE.table_side.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy + 24, TILE_SIZE, 8);
      break;
    case 'wool_white':
      noiseTile(ctx, ox, oy, PALETTE.wool_white, 10, 0.9);
      break;
    case 'wool_black':
      noiseTile(ctx, ox, oy, PALETTE.wool_black, 10, 0.9);
      break;
    case 'wool_red':
      noiseTile(ctx, ox, oy, PALETTE.wool_red, 15, 0.85);
      break;
    case 'wool_blue':
      noiseTile(ctx, ox, oy, PALETTE.wool_blue, 15, 0.85);
      break;
    case 'carpet_red':
      fillTile(ctx, ox, oy, PALETTE.carpet_red);
      for (let i = 0; i < 20; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 0x8a1a1a, 0.4);
      }
      break;
    case 'carpet_blue':
      fillTile(ctx, ox, oy, PALETTE.carpet_blue);
      for (let i = 0; i < 20; i++) {
        px(ctx, ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 0x1a3a8a, 0.4);
      }
      break;
    case 'glowstone':
      fillTile(ctx, ox, oy, PALETTE.glowstone);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,217,94,${0.4 + Math.random()*0.4})`;
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'enchant_top':
      fillTile(ctx, ox, oy, PALETTE.enchant_top);
      ctx.fillStyle = '#' + PALETTE.enchant_side.toString(16).padStart(6, '0');
      ctx.fillRect(ox + 4, oy + 4, 24, 24);
      // Символы
      for (let i = 0; i < 8; i++) {
        px(ctx, ox + 4 + Math.floor(Math.random()*24), oy + 4 + Math.floor(Math.random()*24), 0xffffff);
      }
      break;
    case 'purpur':
      noiseTile(ctx, ox, oy, PALETTE.purpur, 18, 0.75);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 2, 2);
      }
      break;
    case 'netherrack':
      noiseTile(ctx, ox, oy, PALETTE.netherrack, 20, 0.7);
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = 'rgba(50,10,10,0.5)';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 3, 3);
      }
      break;
    case 'end_stone':
      noiseTile(ctx, ox, oy, PALETTE.end_stone, 15, 0.85);
      break;
    case 'mythril_block':
      noiseTile(ctx, ox, oy, PALETTE.mythril_block, 15, 0.85);
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'adamant_block':
      noiseTile(ctx, ox, oy, PALETTE.adamant_block, 15, 0.85);
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ox + Math.floor(Math.random()*TILE_SIZE), oy + Math.floor(Math.random()*TILE_SIZE), 1, 1);
      }
      break;
    case 'anvil':
      noiseTile(ctx, ox, oy, PALETTE.anvil, 15, 0.8);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox + 2, oy + 8, 28, 8);
      break;
    case 'bookshelf':
      noiseTile(ctx, ox, oy, PALETTE.bookshelf, 15, 0.8);
      // Полки
      ctx.fillStyle = '#' + PALETTE.wood_dark.toString(16).padStart(6, '0');
      ctx.fillRect(ox, oy + 10, TILE_SIZE, 2); ctx.fillRect(ox, oy + 20, TILE_SIZE, 2);
      // Книги
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 8; i++) {
          const colors = [0xc83a3a, 0x3a5ac8, 0x3a8a3a, 0xffe85e, 0xa85ad8];
          ctx.fillStyle = '#' + colors[Math.floor(Math.random()*colors.length)].toString(16).padStart(6, '0');
          ctx.fillRect(ox + i * 4, oy + row * 10 + 1, 3, 8);
        }
      }
      break;
    default:
      // Базовая текстура — серая с шумом
      noiseTile(ctx, ox, oy, 0x888888, 20, 0.7);
  }
}

// ═══════════════════════════════════════════════════════════
//  Маппинг блоков на текстуры (6 граней)
// ═══════════════════════════════════════════════════════════
// Для каждого блока: [right, left, top, bottom, front, back]
// Используем имена текстур из атласа
export const BLOCK_TEXTURES = {
  1:  ['grass_side','grass_side','grass_top','dirt','grass_side','grass_side'],
  2:  ['dirt','dirt','dirt','dirt','dirt','dirt'],
  3:  ['stone','stone','stone','stone','stone','stone'],
  4:  ['cobble','cobble','cobble','cobble','cobble','cobble'],
  5:  ['wood_side','wood_side','wood_top','wood_top','wood_side','wood_side'],
  6:  ['leaves','leaves','leaves','leaves','leaves','leaves'],
  7:  ['sand','sand','sand','sand','sand','sand'],
  8:  ['plank','plank','plank','plank','plank','plank'],
  9:  ['glass','glass','glass','glass','glass','glass'],
  10: ['brick','brick','brick','brick','brick','brick'],
  11: ['coal_ore','coal_ore','coal_ore','coal_ore','coal_ore','coal_ore'],
  12: ['iron_ore','iron_ore','iron_ore','iron_ore','iron_ore','iron_ore'],
  13: ['gold_ore','gold_ore','gold_ore','gold_ore','gold_ore','gold_ore'],
  14: ['diamond_ore','diamond_ore','diamond_ore','diamond_ore','diamond_ore','diamond_ore'],
  15: ['bedrock','bedrock','bedrock','bedrock','bedrock','bedrock'],
  16: ['water_0','water_0','water_0','water_0','water_0','water_0'],
  17: ['crafting_side','crafting_side','crafting_top','crafting_side','crafting_side','crafting_side'],
  18: ['chest','chest','chest','chest','chest','chest'],
  19: ['dark_grass_side','dark_grass_side','dark_grass_top','dirt','dark_grass_side','dark_grass_side'],
  20: ['moss','moss','moss','moss','moss','moss'],
  21: ['spruce_side','spruce_side','spruce_top','spruce_top','spruce_side','spruce_side'],
  22: ['spruce_leaves','spruce_leaves','spruce_leaves','spruce_leaves','spruce_leaves','spruce_leaves'],
  25: ['snow','snow','snow','snow','snow','snow'],
  26: ['ice','ice','ice','ice','ice','ice'],
  27: ['cactus_side','cactus_side','cactus_top','cactus_top','cactus_side','cactus_side'],
  31: ['iron_block','iron_block','iron_block','iron_block','iron_block','iron_block'],
  32: ['gold_block','gold_block','gold_block','gold_block','gold_block','gold_block'],
  33: ['diamond_block','diamond_block','diamond_block','diamond_block','diamond_block','diamond_block'],
  34: ['obsidian','obsidian','obsidian','obsidian','obsidian','obsidian'],
  35: ['lava_0','lava_0','lava_0','lava_0','lava_0','lava_0'],
  36: ['jungle_wood_side','jungle_wood_side','jungle_wood_top','jungle_wood_top','jungle_wood_side','jungle_wood_side'],
  37: ['jungle_leaves','jungle_leaves','jungle_leaves','jungle_leaves','jungle_leaves','jungle_leaves'],
  41: ['mud','mud','mud','mud','mud','mud'],
  43: ['swamp_log_side','swamp_log_side','swamp_log_top','swamp_log_top','swamp_log_side','swamp_log_side'],
  46: ['granite','granite','granite','granite','granite','granite'],
  47: ['diorite','diorite','diorite','diorite','diorite','diorite'],
  48: ['andesite','andesite','andesite','andesite','andesite','andesite'],
  49: ['snow','snow','snow','snow','snow','snow'],
  50: ['packed_ice','packed_ice','packed_ice','packed_ice','packed_ice','packed_ice'],
  51: ['table_top','table_top','table_top','table_side','table_top','table_top'],
  55: ['bookshelf','bookshelf','plank','plank','bookshelf','bookshelf'],
  56: ['furnace_side','furnace_side','furnace_top','furnace_top','furnace_side','furnace_side'],
  57: ['anvil','anvil','anvil','anvil','anvil','anvil'],
  58: ['carpet_red','carpet_red','carpet_red','carpet_red','carpet_red','carpet_red'],
  59: ['carpet_blue','carpet_blue','carpet_blue','carpet_blue','carpet_blue','carpet_blue'],
  61: ['wool_white','wool_white','wool_white','wool_white','wool_white','wool_white'],
  62: ['wool_black','wool_black','wool_black','wool_black','wool_black','wool_black'],
  63: ['wool_red','wool_red','wool_red','wool_red','wool_red','wool_red'],
  64: ['wool_blue','wool_blue','wool_blue','wool_blue','wool_blue','wool_blue'],
  71: ['enchant_top','enchant_top','enchant_top','enchant_top','enchant_top','enchant_top'],
  72: ['glowstone','glowstone','glowstone','glowstone','glowstone','glowstone'],
  73: ['netherrack','netherrack','netherrack','netherrack','netherrack','netherrack'],
  74: ['end_stone','end_stone','end_stone','end_stone','end_stone','end_stone'],
  75: ['purpur','purpur','purpur','purpur','purpur','purpur'],
  77: ['mythril_ore','mythril_ore','mythril_ore','mythril_ore','mythril_ore','mythril_ore'],
  78: ['mythril_block','mythril_block','mythril_block','mythril_block','mythril_block','mythril_block'],
  79: ['adamant_ore','adamant_ore','adamant_ore','adamant_ore','adamant_ore','adamant_ore'],
  80: ['adamant_block','adamant_block','adamant_block','adamant_block','adamant_block','adamant_block'],
};

// Дефолтная текстура (если блок не в карте)
export function getBlockTextures(blockId) {
  return BLOCK_TEXTURES[blockId] || ['stone','stone','stone','stone','stone','stone'];
}

// ═══════════════════════════════════════════════════════════
//  Генерация атласа
// ═══════════════════════════════════════════════════════════
let atlasCanvas = null;
let atlasTexture = null;
let atlasMaterial = null;

export function buildAtlas() {
  atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = ATLAS_SIZE;
  atlasCanvas.height = ATLAS_SIZE;
  const ctx = atlasCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Прозрачный фон
  ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);

  // Собираем все уникальные имена текстур
  const allTextures = new Set();
  for (const id in BLOCK_TEXTURES) {
    BLOCK_TEXTURES[id].forEach(t => allTextures.add(t));
  }
  // Добавляем базовые для иконок
  ['coal_ore','iron_ore','gold_ore','diamond_ore','dirt','sand','snow','water','lava','wood_side','plank','stone','cobble','leaves','glass','brick',
   'water_0','water_1','water_2','water_3','lava_0','lava_1','lava_2','lava_3'
  ].forEach(t => allTextures.add(t));

  // Рисуем каждую текстуру
  let idx = 0;
  for (const name of allTextures) {
    const row = Math.floor(idx / TILES_PER_ROW);
    const col = idx % TILES_PER_ROW;
    const ox = col * TILE_SIZE;
    const oy = row * TILE_SIZE;
    drawTexture(ctx, name, ox, oy);
    TEXTURE_MAP[name] = idx;
    idx++;
  }
  console.log(`Atlas built: ${idx} textures, ${allTextures.size} unique`);

  return atlasCanvas;
}

export function getAtlasTexture() {
  if (!atlasTexture && atlasCanvas) {
    atlasTexture = new THREE.CanvasTexture(atlasCanvas);
    atlasTexture.magFilter = THREE.NearestFilter;
    atlasTexture.minFilter = THREE.NearestFilter;
    atlasTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return atlasTexture;
}

export function getAtlasMaterial(transparent = false) {
  if (!atlasMaterial) {
    const tex = getAtlasTexture();
    atlasMaterial = new THREE.MeshLambertMaterial({
      map: tex,
      alphaTest: 0.1,
    });
  }
  if (transparent) {
    // Возвращаем новый материал для прозрачных блоков
    const m = new THREE.MeshLambertMaterial({
      map: getAtlasTexture(),
      transparent: true,
      opacity: 0.85,
      alphaTest: 0.1,
    });
    return m;
  }
  return atlasMaterial;
}

// Получить UV-координаты для текстуры по имени
export function getTextureUV(name) {
  if (!(name in TEXTURE_MAP)) {
    // Если текстуры нет в карте, используем stone
    name = 'stone';
  }
  const idx = TEXTURE_MAP[name];
  const row = Math.floor(idx / TILES_PER_ROW);
  const col = idx % TILES_PER_ROW;
  const u0 = col * TILE_SIZE / ATLAS_SIZE;
  const v0 = 1 - (row + 1) * TILE_SIZE / ATLAS_SIZE;
  const u1 = (col + 1) * TILE_SIZE / ATLAS_SIZE;
  const v1 = 1 - row * TILE_SIZE / ATLAS_SIZE;
  return { u0, v0, u1, v1 };
}


