
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { buildAtlas, getAtlasTexture, getAtlasMaterial, getTextureUV, getBlockTextures, BLOCK_TEXTURES, ATLAS_SIZE, TILE_SIZE } from './texture-atlas.js';
import { buildChunkMesh } from './greedy-mesh.js';

// ═══════════════════════════════════════════════════════════
//  КОНСТАНТЫ
// ═══════════════════════════════════════════════════════════
const WORLD_W = 256, WORLD_H = 256, WORLD_D = 64;
const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 6; // чанков вокруг игрока (96 блоков радиус)
const REACH = 6, GRAVITY = 28, JUMP_V = 9, MOVE_SPEED = 5, FLY_SPEED = 12;
const PLAYER_W = 0.6, PLAYER_H = 1.8;
const MAX_HEALTH = 20, MAX_FOOD = 20, MAX_MANA = 100;

// Шумовая функция (упрощённый 2D шум на основе синусов)
// Делает биомы КРУПНЫМИ и плавными
function biomeNoise(x, z, scale, seed = 0) {
  // Несколько октав шума для естественных границ
  const n1 = Math.sin((x + seed) * scale) * Math.cos((z + seed * 1.3) * scale);
  const n2 = Math.sin((x + seed * 2) * scale * 0.5) * Math.cos((z + seed * 1.7) * scale * 0.5);
  const n3 = Math.sin((x - z + seed) * scale * 0.25) * 0.5;
  return n1 * 0.5 + n2 * 0.35 + n3 * 0.15;
}

// ═══════════════════════════════════════════════════════════
//  БЛОКИ (полная копия из blocks.js)
// ═══════════════════════════════════════════════════════════
const BLOCKS = {
  0: { name:'air', solid:false, transparent:true },
  1: { name:'grass', solid:true, top:0x7cba34, side:0x9b7653, bottom:0x6b4423, drop:2 },
  2: { name:'dirt', solid:true, color:0x9b7653, drop:2 },
  3: { name:'stone', solid:true, color:0x888888, drop:4, hardness:1.5 },
  4: { name:'cobble', solid:true, color:0x7d7d7d, drop:4 },
  5: { name:'wood', solid:true, top:0xb8860b, side:0x6b4423, bottom:0xb8860b, drop:5 },
  6: { name:'leaves', solid:true, color:0x4a8a2a, transparent:true, drop:6, hardness:0.2 },
  7: { name:'sand', solid:true, color:0xe6d29a, drop:7 },
  8: { name:'plank', solid:true, color:0xc89a4a, drop:8 },
  9: { name:'glass', solid:true, color:0xa8d8e8, transparent:true, drop:9 },
  10: { name:'brick', solid:true, color:0xa8432a, drop:10, hardness:2 },
  11: { name:'coal_ore', solid:true, color:0x3a3a3a, drop:'coal', hardness:1.8 },
  12: { name:'iron_ore', solid:true, color:0xd8a878, drop:'iron_ore', hardness:2.5 },
  13: { name:'gold_ore', solid:true, color:0xfada5e, drop:'gold_ore', hardness:2.5 },
  14: { name:'diamond_ore', solid:true, color:0x5edfd5, drop:'diamond', hardness:3.5 },
  15: { name:'bedrock', solid:true, color:0x2b2b2b, drop:0, hardness:Infinity },
  16: { name:'water', solid:false, color:0x3a6ea8, transparent:true },
  17: { name:'crafting', solid:true, top:0xb8860b, side:0x8b5a2b, bottom:0x8b5a2b, drop:17 },
  18: { name:'chest', solid:true, color:0xa8782a, drop:18 },
  19: { name:'darkgrass', solid:true, top:0x4a6a24, side:0x6b4423, bottom:0x6b4423, drop:2 },
  20: { name:'moss', solid:true, color:0x5a7a3a, drop:20, hardness:1 },
  21: { name:'spruce', solid:true, top:0x3a2a18, side:0x2a1a08, bottom:0x3a2a18, drop:21 },
  22: { name:'sprleaves', solid:true, color:0x2a5a1a, transparent:true, drop:22 },
  23: { name:'flower', solid:false, color:0xd83a3a, transparent:true, drop:'flower' },
  24: { name:'torch', solid:false, color:0xffa500, transparent:true, drop:'torch', light:true },
  25: { name:'snow', solid:true, color:0xf0f0f8, drop:25 },
  26: { name:'ice', solid:true, color:0x8ac8e8, transparent:true, drop:0 },
  27: { name:'cactus', solid:true, color:0x3a8a3a, drop:27 },
  28: { name:'pumpkin', solid:true, color:0xe88a2a, drop:28 },
  29: { name:'hay', solid:true, color:0xc8b83a, drop:29 },
  30: { name:'mushroom', solid:false, color:0xc83a3a, transparent:true, drop:'mushroom' },
  31: { name:'iron_block', solid:true, color:0xd8d8d8, drop:31, hardness:3 },
  32: { name:'gold_block', solid:true, color:0xfada5e, drop:32, hardness:3 },
  33: { name:'diamond_block', solid:true, color:0x5edfd5, drop:33, hardness:4 },
  34: { name:'obsidian', solid:true, color:0x1a0a2a, drop:34, hardness:8 },
  35: { name:'lava', solid:false, color:0xe85a2a, transparent:true, drop:0 },
  36: { name:'jungle_wood', solid:true, top:0x6a4a2a, side:0x4a2a1a, bottom:0x6a4a2a, drop:36 },
  37: { name:'jungle_leaves', solid:true, color:0x3a7a2a, transparent:true, drop:37 },
  38: { name:'vines', solid:false, color:0x2a6a1a, transparent:true, drop:'vines' },
  39: { name:'cocoa', solid:false, color:0x8a4a2a, transparent:true, drop:'cocoa' },
  40: { name:'bamboo', solid:false, color:0x7aa84a, transparent:true, drop:'bamboo' },
  41: { name:'mud', solid:true, color:0x4a3a1a, drop:41, hardness:0.8 },
  42: { name:'lily', solid:false, color:0x3a8a3a, transparent:true, drop:'lily' },
  43: { name:'swamp_log', solid:true, top:0x5a4a2a, side:0x3a2a1a, bottom:0x5a4a2a, drop:43 },
  44: { name:'willow', solid:true, top:0x6a8a4a, side:0x4a3a1a, bottom:0x6a8a4a, drop:44 },
  45: { name:'algae', solid:false, color:0x2a5a2a, transparent:true, drop:'algae' },
  46: { name:'granite', solid:true, color:0xa87a5a, drop:46, hardness:1.5 },
  47: { name:'diorite', solid:true, color:0xc8c8b8, drop:47, hardness:1.5 },
  48: { name:'andesite', solid:true, color:0x8a8a7a, drop:48, hardness:1.5 },
  49: { name:'snow_block', solid:true, color:0xf0f0f8, drop:49 },
  50: { name:'packed_ice', solid:true, color:0x6aa8d8, transparent:true, drop:0, hardness:0.5 },
  51: { name:'table', solid:true, top:0x8b5a2b, side:0x6b4423, bottom:0x6b4423, drop:51 },
  52: { name:'chair', solid:false, color:0x8b5a2b, transparent:true, drop:52 },
  53: { name:'bed', solid:false, color:0xc83a3a, transparent:true, drop:53 },
  54: { name:'lamp', solid:false, color:0xffe85e, transparent:true, drop:54, light:true },
  55: { name:'bookshelf', solid:true, color:0xb8860b, drop:55, hardness:1 },
  56: { name:'furnace', solid:true, top:0x555555, side:0x777777, bottom:0x555555, drop:56 },
  57: { name:'anvil', solid:true, color:0x444444, drop:57, hardness:3 },
  58: { name:'carpet_red', solid:false, color:0xc83a3a, transparent:true, drop:58 },
  59: { name:'carpet_blue', solid:false, color:0x3a5ac8, transparent:true, drop:59 },
  60: { name:'carpet_green', solid:false, color:0x3a8a3a, transparent:true, drop:60 },
  61: { name:'wool_white', solid:true, color:0xf0f0f0, drop:61, hardness:0.3 },
  62: { name:'wool_black', solid:true, color:0x2a2a2a, drop:62, hardness:0.3 },
  63: { name:'wool_red', solid:true, color:0xc83a3a, drop:63, hardness:0.3 },
  64: { name:'wool_blue', solid:true, color:0x3a5ac8, drop:64, hardness:0.3 },
  65: { name:'fence', solid:false, color:0x8b5a2b, transparent:true, drop:65 },
  66: { name:'fence_gate', solid:false, color:0x8b5a2b, transparent:true, drop:66 },
  67: { name:'door', solid:false, color:0x8b5a2b, transparent:true, drop:67 },
  68: { name:'ladder', solid:false, color:0x8b5a2b, transparent:true, drop:68 },
  69: { name:'sign', solid:false, color:0x8b5a2b, transparent:true, drop:69 },
  70: { name:'flower_pot', solid:false, color:0xa8782a, transparent:true, drop:70 },
  71: { name:'enchant_table', solid:true, top:0x6a2a8a, side:0x4a1a5a, bottom:0x4a1a5a, drop:71, hardness:3 },
  72: { name:'glowstone', solid:true, color:0xffd95e, drop:72, light:true, hardness:0.5 },
  73: { name:'netherrack', solid:true, color:0x8a2a2a, drop:73, hardness:0.5 },
  74: { name:'end_stone', solid:true, color:0xdede88, drop:74, hardness:2 },
  75: { name:'purpur', solid:true, color:0xa87ac8, drop:75, hardness:1.5 },
  76: { name:'crystal', solid:true, color:0xffaa5e, transparent:true, drop:'crystal', light:true, hardness:1 },
  77: { name:'mythril_ore', solid:true, color:0x5ac8c8, drop:'mythril_ore', hardness:4 },
  78: { name:'mythril_block', solid:true, color:0x5ac8c8, drop:78, hardness:4 },
  79: { name:'adamant_ore', solid:true, color:0xc85a5a, drop:'adamant_ore', hardness:5 },
  80: { name:'adamant_block', solid:true, color:0xc85a5a, drop:80, hardness:5 },
  81: { name:'tall_grass', solid:false, color:0x6aaa3a, transparent:true, drop:'grass_item' },
  82: { name:'rose', solid:false, color:0xe83a3a, transparent:true, drop:'rose' },
  83: { name:'dandelion', solid:false, color:0xffe85e, transparent:true, drop:'dandelion' },
  84: { name:'blue_orchid', solid:false, color:0x5a8ada, transparent:true, drop:'blue_orchid' },
  85: { name:'sunflower', solid:false, color:0xffe85e, transparent:true, drop:'sunflower' },
  86: { name:'oak_sapling', solid:false, color:0x4a8a2a, transparent:true, drop:'oak_sapling' },
  87: { name:'berry_bush', solid:false, color:0xc83a5a, transparent:true, drop:'berry', hardness:0.1 },
  88: { name:'fern', solid:false, color:0x4a8a3a, transparent:true, drop:'fern' },
  89: { name:'dead_bush', solid:false, color:0x8a6a3a, transparent:true, drop:'stick' },
  90: { name:'lily_pad', solid:false, color:0x3a8a3a, transparent:true, drop:'lily_pad' },
};

// RARITY
const RARITY = {
  COMMON:    { name:'Обычное',      color:0xffffff, hex:'#ffffff' },
  UNCOMMON:  { name:'Улучшенное',   color:0x4aff4a, hex:'#4aff4a' },
  RARE:      { name:'Редкое',       color:0x4a9aff, hex:'#4a9aff' },
  MYTHIC:    { name:'Мифическое',   color:0xc84aff, hex:'#c84aff' },
  LEGENDARY: { name:'Легендарное',  color:0xffaa3a, hex:'#ffaa3a' },
};

// ITEMS — полная копия (сократил для размера, но всё важное на месте)
const ITEMS = {
  // Материалы
  stick:{name:'Палка',color:0x8b5a2b,type:'material',rarity:'COMMON'},
  coal:{name:'Уголь',color:0x1a1a1a,type:'material',rarity:'COMMON'},
  iron_ore:{name:'Железная руда',color:0xd8a878,type:'material',rarity:'COMMON'},
  iron_ingot:{name:'Железный слиток',color:0xd8d8d8,type:'material',rarity:'UNCOMMON'},
  gold_ore:{name:'Золотая руда',color:0xfada5e,type:'material',rarity:'UNCOMMON'},
  gold_ingot:{name:'Золотой слиток',color:0xffd700,type:'material',rarity:'RARE'},
  diamond:{name:'Алмаз',color:0x5edfd5,type:'material',rarity:'RARE'},
  emerald:{name:'Изумруд',color:0x3aff7a,type:'material',rarity:'RARE'},
  leather:{name:'Кожа',color:0x8b5a2b,type:'material',rarity:'COMMON'},
  wool:{name:'Шерсть',color:0xf0f0f0,type:'material',rarity:'COMMON'},
  feather:{name:'Перо',color:0xf0f0f0,type:'material',rarity:'COMMON'},
  bone:{name:'Кость',color:0xf0f0e0,type:'material',rarity:'COMMON'},
  string:{name:'Нить',color:0xf0f0f0,type:'material',rarity:'COMMON'},
  torch:{name:'Факел',color:0xffa500,type:'material',rarity:'COMMON'},
  flower:{name:'Цветок',color:0xd83a3a,type:'material',rarity:'COMMON'},
  mushroom:{name:'Гриб',color:0xc83a3a,type:'material',rarity:'COMMON'},
  vines:{name:'Лозы',color:0x2a6a1a,type:'material',rarity:'COMMON'},
  bamboo:{name:'Бамбук',color:0x7aa84a,type:'material',rarity:'COMMON'},
  crystal:{name:'Кристалл',color:0xffaa5e,type:'material',rarity:'MYTHIC'},
  mythril_ore:{name:'Мифриловая руда',color:0x5ac8c8,type:'material',rarity:'MYTHIC'},
  mythril_ingot:{name:'Мифриловый слиток',color:0x5ac8c8,type:'material',rarity:'MYTHIC'},
  adamant_ore:{name:'Адамантитовая руда',color:0xc85a5a,type:'material',rarity:'LEGENDARY'},
  adamant_ingot:{name:'Адамантитовый слиток',color:0xc85a5a,type:'material',rarity:'LEGENDARY'},
  dragon_scale:{name:'Чешуя дракона',color:0xc83a3a,type:'material',rarity:'LEGENDARY'},
  golem_core:{name:'Ядро голема',color:0xffd700,type:'material',rarity:'LEGENDARY'},
  ice_shard:{name:'Осколок льда',color:0x8ac8e8,type:'material',rarity:'RARE'},
  poison_gland:{name:'Ядовитая железа',color:0x6aaa3a,type:'material',rarity:'UNCOMMON'},
  spider_silk:{name:'Паутина',color:0xf0f0f0,type:'material',rarity:'UNCOMMON'},
  shark_tooth:{name:'Зуб акулы',color:0xf0f0f0,type:'material',rarity:'RARE'},
  serpent_scale:{name:'Чешуя змея',color:0x4a8a4a,type:'material',rarity:'LEGENDARY'},
  obsidian:{name:'Обсидиан',color:0x1a0a2a,type:'material',rarity:'UNCOMMON'},
  wheat:{name:'Пшеница',color:0xc8b83a,type:'material',rarity:'COMMON'},
  apple:{name:'Яблоко',color:0xe83a3a,type:'material',rarity:'COMMON'},
  // Еда
  meat_raw:{name:'Сырое мясо',color:0xc88a8a,type:'food',heal:2},
  meat_cooked:{name:'Жареное мясо',color:0x8b5a2b,type:'food',heal:6},
  rotten_flesh:{name:'Гнилая плоть',color:0x5a4a3a,type:'food',heal:1},
  golden_apple:{name:'Золотое яблоко',color:0xffd700,type:'food',heal:10,rarity:'RARE'},
  berry:{name:'Ягоды',color:0xc83a5a,type:'food',heal:1},
  mushroom_stew:{name:'Грибной суп',color:0xc8a060,type:'food',heal:5},
  bread:{name:'Хлеб',color:0xc8a060,type:'food',heal:4},
  fish_cooked:{name:'Жареная рыба',color:0xd8d8a0,type:'food',heal:4},
  // Боеприпасы
  arrow:{name:'Стрела',color:0x8b5a2b,type:'ammo',rarity:'COMMON'},
  arrow_iron:{name:'Железная стрела',color:0xd8d8d8,type:'ammo',dmg:2,rarity:'UNCOMMON'},
  arrow_explosive:{name:'Взрывная стрела',color:0xff5a3a,type:'ammo',dmg:5,rarity:'RARE'},
  arrow_mythril:{name:'Мифриловая стрела',color:0x5ac8c8,type:'ammo',dmg:8,rarity:'MYTHIC'},
  // Мечи
  wood_sword:{name:'Деревянный меч',color:0xc89a4a,type:'weapon',subtype:'sword',dmg:3,durability:60,rarity:'COMMON'},
  stone_sword:{name:'Каменный меч',color:0x888888,type:'weapon',subtype:'sword',dmg:5,durability:130,rarity:'COMMON'},
  iron_sword:{name:'Железный меч',color:0xd8d8d8,type:'weapon',subtype:'sword',dmg:7,durability:250,rarity:'UNCOMMON'},
  golden_sword:{name:'Золотой меч',color:0xffd700,type:'weapon',subtype:'sword',dmg:6,durability:200,rarity:'UNCOMMON'},
  diamond_sword:{name:'Алмазный меч',color:0x5edfd5,type:'weapon',subtype:'sword',dmg:10,durability:1500,rarity:'RARE'},
  mythril_sword:{name:'Мифриловый меч',color:0x5ac8c8,type:'weapon',subtype:'sword',dmg:14,durability:2000,rarity:'MYTHIC',critChance:0.2},
  adamant_sword:{name:'Адамантитовый меч',color:0xc85a5a,type:'weapon',subtype:'sword',dmg:18,durability:3000,rarity:'LEGENDARY',critChance:0.3},
  dragon_sword:{name:'Меч дракона',color:0xc83a3a,type:'weapon',subtype:'sword',dmg:22,durability:5000,rarity:'LEGENDARY',critChance:0.4,fireDamage:3},
  forest_blade:{name:'Лесной клинок',color:0x4a8a2a,type:'weapon',subtype:'sword',dmg:12,durability:1500,rarity:'MYTHIC',poison:2},
  swamp_venom:{name:'Болотный яд',color:0x6aaa3a,type:'weapon',subtype:'sword',dmg:11,durability:1500,rarity:'MYTHIC',poison:5},
  sand_reaper:{name:'Жнец песков',color:0xe6d29a,type:'weapon',subtype:'sword',dmg:13,durability:1800,rarity:'MYTHIC'},
  ice_fang:{name:'Ледяной клык',color:0x8ac8e8,type:'weapon',subtype:'sword',dmg:13,durability:1800,rarity:'MYTHIC'},
  jungle_fury:{name:'Ярость джунглей',color:0x3a7a2a,type:'weapon',subtype:'sword',dmg:15,durability:2000,rarity:'LEGENDARY',critChance:0.25,poison:3},
  titan_hammer:{name:'Молот титана',color:0x888888,type:'weapon',subtype:'sword',dmg:20,durability:3000,rarity:'LEGENDARY',knockback:3},
  serpent_trident:{name:'Трезубец змея',color:0x4a8a4a,type:'weapon',subtype:'sword',dmg:25,durability:4000,rarity:'LEGENDARY'},
  lion_claw:{name:'Коготь льва',color:0xffaa3a,type:'weapon',subtype:'sword',dmg:16,durability:2200,rarity:'LEGENDARY',critChance:0.35},
  // Топоры
  wood_axe:{name:'Дерев. топор',color:0xc89a4a,type:'weapon',subtype:'axe',dmg:4,durability:60,rarity:'COMMON'},
  iron_axe:{name:'Железный топор',color:0xd8d8d8,type:'weapon',subtype:'axe',dmg:8,durability:250,rarity:'UNCOMMON'},
  diamond_axe:{name:'Алмазный топор',color:0x5edfd5,type:'weapon',subtype:'axe',dmg:11,durability:1500,rarity:'RARE'},
  war_hammer:{name:'Боевой молот',color:0x444444,type:'weapon',subtype:'axe',dmg:15,durability:2000,rarity:'MYTHIC',knockback:5},
  // Луки
  bow:{name:'Лук',color:0x8b5a2b,type:'weapon',subtype:'bow',ranged:true,dmg:6,durability:300,rarity:'COMMON'},
  bow_iron:{name:'Железный лук',color:0xd8d8d8,type:'weapon',subtype:'bow',ranged:true,dmg:9,durability:500,rarity:'UNCOMMON'},
  bow_diamond:{name:'Алмазный лук',color:0x5edfd5,type:'weapon',subtype:'bow',ranged:true,dmg:13,durability:2000,rarity:'RARE'},
  bow_mythril:{name:'Мифриловый лук',color:0x5ac8c8,type:'weapon',subtype:'bow',ranged:true,dmg:18,durability:3000,rarity:'MYTHIC',critChance:0.25},
  bow_dragon:{name:'Драконий лук',color:0xc83a3a,type:'weapon',subtype:'bow',ranged:true,dmg:25,durability:5000,rarity:'LEGENDARY',critChance:0.4,fireDamage:4},
  // Магические посохи
  staff_fire:{name:'Посох огня',color:0xe85a2a,type:'weapon',subtype:'staff',ranged:true,magic:true,dmg:10,durability:1000,rarity:'MYTHIC',manaCost:10},
  staff_ice:{name:'Посох льда',color:0x8ac8e8,type:'weapon',subtype:'staff',ranged:true,magic:true,dmg:9,durability:1000,rarity:'MYTHIC',manaCost:10},
  staff_lightning:{name:'Посох молний',color:0xffff5a,type:'weapon',subtype:'staff',ranged:true,magic:true,dmg:15,durability:2000,rarity:'LEGENDARY',manaCost:20},
  // Кирки
  wood_pickaxe:{name:'Дерев. кирка',color:0xc89a4a,type:'tool',tier:1,durability:60,rarity:'COMMON'},
  stone_pickaxe:{name:'Камен. кирка',color:0x888888,type:'tool',tier:2,durability:130,rarity:'COMMON'},
  iron_pickaxe:{name:'Желез. кирка',color:0xd8d8d8,type:'tool',tier:3,durability:250,rarity:'UNCOMMON'},
  diamond_pickaxe:{name:'Алмаз. кирка',color:0x5edfd5,type:'tool',tier:4,durability:1500,rarity:'RARE'},
  mythril_pickaxe:{name:'Мифрил. кирка',color:0x5ac8c8,type:'tool',tier:5,durability:2000,rarity:'MYTHIC'},
  // Броня
  leather_helmet:{name:'Кожаный шлем',color:0x8b5a2b,type:'armor',slot:'helmet',def:1,durability:80,rarity:'COMMON'},
  leather_chest:{name:'Кожаный нагрудник',color:0x8b5a2b,type:'armor',slot:'chest',def:3,durability:120,rarity:'COMMON'},
  leather_boots:{name:'Кожаные ботинки',color:0x8b5a2b,type:'armor',slot:'boots',def:1,durability:80,rarity:'COMMON'},
  iron_helmet:{name:'Железный шлем',color:0xd8d8d8,type:'armor',slot:'helmet',def:2,durability:200,rarity:'UNCOMMON'},
  iron_chest:{name:'Железный нагрудник',color:0xd8d8d8,type:'armor',slot:'chest',def:6,durability:300,rarity:'UNCOMMON'},
  iron_boots:{name:'Железные ботинки',color:0xd8d8d8,type:'armor',slot:'boots',def:2,durability:200,rarity:'UNCOMMON'},
  gold_helmet:{name:'Золотой шлем',color:0xffd700,type:'armor',slot:'helmet',def:2,durability:150,rarity:'UNCOMMON'},
  gold_chest:{name:'Золотой нагрудник',color:0xffd700,type:'armor',slot:'chest',def:5,durability:200,rarity:'UNCOMMON'},
  gold_boots:{name:'Золотые ботинки',color:0xffd700,type:'armor',slot:'boots',def:2,durability:150,rarity:'UNCOMMON'},
  diamond_helmet:{name:'Алмазный шлем',color:0x5edfd5,type:'armor',slot:'helmet',def:3,durability:400,rarity:'RARE'},
  diamond_chest:{name:'Алмазный нагрудник',color:0x5edfd5,type:'armor',slot:'chest',def:8,durability:600,rarity:'RARE'},
  diamond_boots:{name:'Алмазные ботинки',color:0x5edfd5,type:'armor',slot:'boots',def:3,durability:400,rarity:'RARE'},
  mythril_helmet:{name:'Мифриловый шлем',color:0x5ac8c8,type:'armor',slot:'helmet',def:5,durability:800,rarity:'MYTHIC'},
  mythril_chest:{name:'Мифриловый нагрудник',color:0x5ac8c8,type:'armor',slot:'chest',def:12,durability:1200,rarity:'MYTHIC'},
  mythril_boots:{name:'Мифриловые ботинки',color:0x5ac8c8,type:'armor',slot:'boots',def:5,durability:800,rarity:'MYTHIC'},
  adamant_helmet:{name:'Адамантитовый шлем',color:0xc85a5a,type:'armor',slot:'helmet',def:7,durability:1500,rarity:'LEGENDARY'},
  adamant_chest:{name:'Адамантитовый нагрудник',color:0xc85a5a,type:'armor',slot:'chest',def:16,durability:2500,rarity:'LEGENDARY'},
  adamant_boots:{name:'Адамантитовые ботинки',color:0xc85a5a,type:'armor',slot:'boots',def:7,durability:1500,rarity:'LEGENDARY'},
  dragon_helmet:{name:'Шлем дракона',color:0xc83a3a,type:'armor',slot:'helmet',def:9,durability:3000,rarity:'LEGENDARY'},
  dragon_chest:{name:'Нагрудник дракона',color:0xc83a3a,type:'armor',slot:'chest',def:20,durability:5000,rarity:'LEGENDARY'},
  dragon_boots:{name:'Ботинки дракона',color:0xc83a3a,type:'armor',slot:'boots',def:9,durability:3000,rarity:'LEGENDARY'},
  golem_armor:{name:'Броня голема',color:0x888888,type:'armor',slot:'chest',def:18,durability:3000,rarity:'LEGENDARY'},
  ice_crown:{name:'Ледяная корона',color:0x8ac8e8,type:'armor',slot:'helmet',def:6,durability:2000,rarity:'LEGENDARY'},
  serpent_scale_armor:{name:'Чешуя змея',color:0x4a8a4a,type:'armor',slot:'chest',def:17,durability:3500,rarity:'LEGENDARY'},
  jungle_cloak:{name:'Плащ джунглей',color:0x3a7a2a,type:'armor',slot:'chest',def:10,durability:2000,rarity:'MYTHIC'},
  sand_veil:{name:'Покрывало песков',color:0xe6d29a,type:'armor',slot:'helmet',def:4,durability:1500,rarity:'MYTHIC'},
};

// ═══════════════════════════════════════════════════════════
//  BIOMES
// ═══════════════════════════════════════════════════════════
const BIOMES = {
  PLAINS:{id:0,name:'Равнины',color:0x7cba34,mapColor:'#7cba34',surfaceBlock:1,subsurfaceBlock:2,heightBase:8,heightVariation:1.5,treeChance:0.012,treeType:'oak',flowerChance:0.04,mobTypes:['cow','sheep','pig','horse','rabbit'],bossType:'golem_forest'},
  FOREST:{id:1,name:'Лес',color:0x3a6a1a,mapColor:'#3a6a1a',surfaceBlock:1,subsurfaceBlock:2,heightBase:9,heightVariation:2.5,treeChance:0.04,treeType:'oak_dense',flowerChance:0.015,mobTypes:['wolf','bear','fox','deer','boar'],bossType:'golem_forest'},
  SWAMP:{id:2,name:'Болото',color:0x4a5a24,mapColor:'#4a5a24',surfaceBlock:19,subsurfaceBlock:41,heightBase:6,heightVariation:1.0,treeChance:0.025,treeType:'swamp_willow',waterChance:0.20,mobTypes:['witch','frog','snake','slime','mosquito'],bossType:'swamp_hydra'},
  DESERT:{id:3,name:'Пустыня',color:0xe6d29a,mapColor:'#e6d29a',surfaceBlock:7,subsurfaceBlock:7,heightBase:8,heightVariation:1.5,treeChance:0,treeType:'cactus',cactusChance:0.015,mobTypes:['scorpion','snake_desert','camel','spider_desert','mummy'],bossType:'sand_worm'},
  SNOW:{id:4,name:'Снежные земли',color:0xf0f0f8,mapColor:'#f0f0f8',surfaceBlock:25,subsurfaceBlock:2,heightBase:9,heightVariation:2.5,treeChance:0.025,treeType:'spruce',iceChance:0.04,mobTypes:['polar_bear','wolf_snow','penguin','fox_snow','yeti'],bossType:'ice_king'},
  JUNGLE:{id:5,name:'Джунгли',color:0x2a5a1a,mapColor:'#2a5a1a',surfaceBlock:1,subsurfaceBlock:2,heightBase:10,heightVariation:3,treeChance:0.06,treeType:'jungle',vineChance:0.10,mobTypes:['parrot','jaguar','monkey','snake_jungle','panther'],bossType:'jaguar_king'},
  MOUNTAINS:{id:6,name:'Горы',color:0x8a8a8a,mapColor:'#8a8a8a',surfaceBlock:3,subsurfaceBlock:3,heightBase:18,heightVariation:7,treeChance:0.008,treeType:'spruce_sparse',mobTypes:['eagle','goat','wolf_mountain','troll','harpy'],bossType:'stone_titan'},
  OCEAN:{id:7,name:'Океан',color:0x3a6ea8,mapColor:'#3a6ea8',surfaceBlock:16,subsurfaceBlock:7,heightBase:4,heightVariation:1.0,waterLevel:8,mobTypes:['fish','shark','squid','turtle','dolphin'],bossType:'sea_serpent'},
  SAVANNA:{id:8,name:'Саванна',color:0xc8b86a,mapColor:'#c8b86a',surfaceBlock:19,subsurfaceBlock:2,heightBase:8,heightVariation:1.5,treeChance:0.015,treeType:'acacia',mobTypes:['lion','zebra','giraffe','elephant','hyena'],bossType:'lion_king'},
};

const SEED = Math.floor(Math.random() * 1000000);

// Кэш биомов для производительности
const biomeCache = new Map();
const BIOME_CACHE_SIZE = 100000;

// ═══════════════════════════════════════════════════════════
//  КАРТА ПО ШАБЛОНУ — предзаданные регионы биомов
//  Карта 256×256 разделена на крупные зоны:
//  Центр — равнины с деревней
//  Север — горы
//  Юг — пустыня
//  Восток — лес
//  Запад — океан
//  СВ — снежные земли
//  ЮВ — джунгли
//  ЮЗ — болото
//  СЗ — саванна
// ═══════════════════════════════════════════════════════════

function getBiomeAt(x, z) {
  const key = x * 10000 + z;
  if (biomeCache.has(key)) return biomeCache.get(key);

  const cx = x - 128, cz = z - 128;
  let result;

  // Определяем регион по квадрантам
  const absX = Math.abs(cx), absZ = Math.abs(cz);
  const dist = Math.sqrt(cx*cx + cz*cz);

  // Центр (радиус 30) — равнины с деревней
  if (dist < 30) {
    result = BIOMES.PLAINS;
  }
  // Океан — западная часть (x < 90)
  else if (cx < -40) {
    if (cz < -30) result = BIOMES.SAVANNA;      // северо-запад — саванна
    else if (cz > 30) result = BIOMES.SWAMP;     // юго-запад — болото
    else result = BIOMES.OCEAN;                   // запад — океан
  }
  // Восточная часть (x > 170)
  else if (cx > 40) {
    if (cz < -30) result = BIOMES.SNOW;          // северо-восток — снег
    else if (cz > 30) result = BIOMES.JUNGLE;    // юго-восток — джунгли
    else result = BIOMES.FOREST;                  // восток — лес
  }
  // Северная часть (z < 90)
  else if (cz < -30) {
    result = BIOMES.MOUNTAINS;                    // север — горы
  }
  // Южная часть (z > 170)
  else if (cz > 30) {
    result = BIOMES.DESERT;                       // юг — пустыня
  }
  // Остальное — равнины (буферная зона)
  else {
    result = BIOMES.PLAINS;
  }

  if (biomeCache.size > BIOME_CACHE_SIZE) biomeCache.clear();
  biomeCache.set(key, result);
  return result;
}

// ═══════════════════════════════════════════════════════════
//  MOBS (копия)
// ═══════════════════════════════════════════════════════════
const MOBS = {
  cow:{name:'Корова',hp:10,speed:1.4,hostile:false,color:0x6b4423,bodyColor:0x6b4423,headColor:0x3a2a18,size:[0.9,1.0,1.4],headSize:0.5,drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:3}]},
  sheep:{name:'Овца',hp:8,speed:1.6,hostile:false,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe8e0d8,size:[0.8,0.9,1.1],headSize:0.45,drops:[{item:'wool',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  pig:{name:'Свинья',hp:8,speed:1.7,hostile:false,color:0xf0a0a0,bodyColor:0xf0a0a0,headColor:0xe89090,size:[0.9,0.8,1.2],headSize:0.5,drops:[{item:'meat_raw',min:1,max:3}]},
  horse:{name:'Лошадь',hp:15,speed:2.5,hostile:false,color:0x8b5a2b,bodyColor:0x8b5a2b,headColor:0x6b4423,size:[0.9,1.4,1.6],headSize:0.55,drops:[{item:'leather',min:1,max:2}]},
  rabbit:{name:'Кролик',hp:3,speed:2.0,hostile:false,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xf0f0f0,size:[0.4,0.5,0.5],headSize:0.35,drops:[{item:'meat_raw',min:0,max:1},{item:'wool',min:0,max:1}]},
  wolf:{name:'Волк',hp:10,speed:2.2,hostile:true,color:0x8a8a8a,bodyColor:0x8a8a8a,headColor:0x6a6a6a,size:[0.5,0.6,1.0],headSize:0.4,attackRange:1.5,attackDmg:3,drops:[{item:'leather',min:0,max:2},{item:'bone',min:1,max:2}]},
  bear:{name:'Медведь',hp:25,speed:1.8,hostile:true,color:0x4a2a18,bodyColor:0x4a2a18,headColor:0x3a1a08,size:[1.0,1.3,1.5],headSize:0.6,attackRange:1.8,attackDmg:6,drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4},{item:'bone',min:1,max:3}]},
  fox:{name:'Лиса',hp:6,speed:2.4,hostile:false,color:0xe85a2a,bodyColor:0xe85a2a,headColor:0xc84a1a,size:[0.4,0.5,0.9],headSize:0.35,drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]},
  deer:{name:'Олень',hp:12,speed:2.6,hostile:false,color:0xa87a4a,bodyColor:0xa87a4a,headColor:0x8a6a3a,size:[0.7,1.2,1.4],headSize:0.5,drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  boar:{name:'Кабан',hp:14,speed:1.9,hostile:true,color:0x5a3a1a,bodyColor:0x5a3a1a,headColor:0x3a2a08,size:[0.8,0.8,1.2],headSize:0.5,attackRange:1.5,attackDmg:4,drops:[{item:'leather',min:1,max:2},{item:'meat_raw',min:1,max:3}]},
  witch:{name:'Ведьма',hp:18,speed:1.5,hostile:true,color:0x6a2a8a,bodyColor:0x6a2a8a,headColor:0x4a1a6a,size:[0.7,1.6,0.4],headSize:0.5,attackRange:8,attackDmg:4,ranged:true,drops:[{item:'poison_gland',min:1,max:3},{item:'mushroom',min:0,max:2},{item:'string',min:0,max:2}]},
  frog:{name:'Лягушка',hp:4,speed:1.4,hostile:false,color:0x4a8a3a,bodyColor:0x4a8a3a,headColor:0x3a6a2a,size:[0.4,0.4,0.5],headSize:0.4,drops:[{item:'poison_gland',min:0,max:1}]},
  snake:{name:'Змея',hp:6,speed:1.8,hostile:true,color:0x4a6a2a,bodyColor:0x4a6a2a,headColor:0x3a5a1a,size:[0.3,0.3,1.2],headSize:0.3,attackRange:1.2,attackDmg:3,poison:2,drops:[{item:'poison_gland',min:0,max:1},{item:'string',min:0,max:1}]},
  slime:{name:'Слизень',hp:8,speed:1.0,hostile:true,color:0x6aaa3a,bodyColor:0x6aaa3a,headColor:0x5a9a2a,size:[0.8,0.8,0.8],headSize:0,attackRange:1.2,attackDmg:2,drops:[{item:'string',min:1,max:2}]},
  mosquito:{name:'Комар',hp:2,speed:2.5,hostile:true,color:0x4a4a4a,bodyColor:0x4a4a4a,headColor:0x2a2a2a,size:[0.2,0.2,0.3],headSize:0.15,attackRange:1.0,attackDmg:1,drops:[]},
  scorpion:{name:'Скорпион',hp:12,speed:1.7,hostile:true,color:0xa87a3a,bodyColor:0xa87a3a,headColor:0x8a6a2a,size:[0.8,0.5,1.0],headSize:0.4,attackRange:1.5,attackDmg:4,poison:3,drops:[{item:'poison_gland',min:1,max:2},{item:'bone',min:1,max:3}]},
  snake_desert:{name:'Пустынная змея',hp:8,speed:2.0,hostile:true,color:0xc8a868,bodyColor:0xc8a868,headColor:0xa88848,size:[0.3,0.3,1.3],headSize:0.3,attackRange:1.3,attackDmg:4,poison:3,drops:[{item:'poison_gland',min:1,max:2},{item:'leather',min:0,max:1}]},
  camel:{name:'Верблюд',hp:18,speed:1.5,hostile:false,color:0xc8a868,bodyColor:0xc8a868,headColor:0xa88848,size:[1.0,1.8,1.6],headSize:0.5,drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  spider_desert:{name:'Пустынный паук',hp:10,speed:2.2,hostile:true,color:0x8a4a2a,bodyColor:0x8a4a2a,headColor:0x6a3a1a,size:[0.8,0.6,0.8],headSize:0.4,attackRange:1.5,attackDmg:3,poison:2,drops:[{item:'spider_silk',min:1,max:3},{item:'poison_gland',min:0,max:1}]},
  mummy:{name:'Мумия',hp:22,speed:1.3,hostile:true,color:0xe8d8a8,bodyColor:0xe8d8a8,headColor:0xd8c898,size:[0.7,1.9,0.4],headSize:0.5,attackRange:1.5,attackDmg:5,drops:[{item:'string',min:2,max:4},{item:'gold_ingot',min:0,max:1}]},
  polar_bear:{name:'Белый медведь',hp:30,speed:1.9,hostile:true,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe0e0e0,size:[1.0,1.3,1.5],headSize:0.6,attackRange:1.8,attackDmg:7,drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4},{item:'ice_shard',min:0,max:2}]},
  wolf_snow:{name:'Снежный волк',hp:14,speed:2.4,hostile:true,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe0e0e0,size:[0.5,0.6,1.0],headSize:0.4,attackRange:1.5,attackDmg:4,drops:[{item:'leather',min:1,max:2},{item:'ice_shard',min:0,max:1}]},
  penguin:{name:'Пингвин',hp:6,speed:1.2,hostile:false,color:0x2a2a2a,bodyColor:0x2a2a2a,headColor:0x1a1a1a,size:[0.4,0.7,0.5],headSize:0.35,drops:[{item:'meat_raw',min:0,max:1},{item:'feather',min:0,max:2}]},
  fox_snow:{name:'Снежная лиса',hp:8,speed:2.6,hostile:false,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe8e8e8,size:[0.4,0.5,0.9],headSize:0.35,drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]},
  yeti:{name:'Йети',hp:35,speed:1.6,hostile:true,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe0e0e0,size:[1.4,2.5,0.8],headSize:0.7,attackRange:2.0,attackDmg:9,drops:[{item:'ice_shard',min:2,max:5},{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4}]},
  parrot:{name:'Попугай',hp:4,speed:2.5,hostile:false,color:0xe83a3a,bodyColor:0xe83a3a,headColor:0xffe85e,size:[0.3,0.4,0.4],headSize:0.3,drops:[{item:'feather',min:1,max:3}]},
  jaguar:{name:'Ягуар',hp:20,speed:2.6,hostile:true,color:0xe8a83a,bodyColor:0xe8a83a,headColor:0xc8881a,size:[0.6,0.7,1.2],headSize:0.45,attackRange:1.7,attackDmg:6,drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  monkey:{name:'Обезьяна',hp:8,speed:2.4,hostile:false,color:0x8a5a2a,bodyColor:0x8a5a2a,headColor:0x6a3a1a,size:[0.4,0.6,0.6],headSize:0.4,drops:[{item:'leather',min:0,max:1},{item:'bamboo',min:0,max:2}]},
  snake_jungle:{name:'Лесная змея',hp:10,speed:1.9,hostile:true,color:0x3a7a2a,bodyColor:0x3a7a2a,headColor:0x2a5a1a,size:[0.3,0.3,1.4],headSize:0.3,attackRange:1.4,attackDmg:4,poison:3,drops:[{item:'poison_gland',min:1,max:2},{item:'leather',min:0,max:1}]},
  panther:{name:'Пантера',hp:22,speed:2.8,hostile:true,color:0x1a1a1a,bodyColor:0x1a1a1a,headColor:0x0a0a0a,size:[0.6,0.7,1.3],headSize:0.45,attackRange:1.7,attackDmg:7,drops:[{item:'leather',min:2,max:3},{item:'meat_raw',min:1,max:2}]},
  eagle:{name:'Орёл',hp:8,speed:3.0,hostile:true,color:0x8a6a3a,bodyColor:0x8a6a3a,headColor:0xf0f0f0,size:[0.3,0.4,0.5],headSize:0.3,attackRange:1.5,attackDmg:3,drops:[{item:'feather',min:2,max:4},{item:'bone',min:0,max:1}]},
  goat:{name:'Горный козёл',hp:12,speed:2.0,hostile:false,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe0e0e0,size:[0.6,0.9,1.1],headSize:0.45,drops:[{item:'leather',min:1,max:2},{item:'meat_raw',min:0,max:2}]},
  wolf_mountain:{name:'Горный волк',hp:16,speed:2.3,hostile:true,color:0x5a5a5a,bodyColor:0x5a5a5a,headColor:0x3a3a3a,size:[0.6,0.7,1.1],headSize:0.45,attackRange:1.6,attackDmg:5,drops:[{item:'leather',min:1,max:2},{item:'bone',min:1,max:2}]},
  troll:{name:'Тролль',hp:40,speed:1.4,hostile:true,color:0x5a6a4a,bodyColor:0x5a6a4a,headColor:0x3a4a2a,size:[1.2,2.3,0.8],headSize:0.6,attackRange:2.0,attackDmg:10,drops:[{item:'iron_ore',min:1,max:2},{item:'bone',min:1,max:3}]},
  harpy:{name:'Гарпия',hp:14,speed:2.8,hostile:true,color:0xa88a5a,bodyColor:0xa88a5a,headColor:0x8a6a3a,size:[0.5,0.8,0.5],headSize:0.4,attackRange:1.8,attackDmg:4,drops:[{item:'feather',min:2,max:4},{item:'bone',min:0,max:1}]},
  fish:{name:'Рыба',hp:3,speed:2.0,hostile:false,color:0xc8a868,bodyColor:0xc8a868,headColor:0xa88848,size:[0.3,0.3,0.6],headSize:0.25,drops:[{item:'meat_raw',min:0,max:1}]},
  duck:{name:'Утка',hp:5,speed:1.5,hostile:false,color:0xe8e8a0,bodyColor:0xe8e8a0,headColor:0x4a8a2a,size:[0.4,0.4,0.5],headSize:0.3,hasLegs:true,hasBeak:true,hasWings:true,drops:[{item:'feather',min:1,max:2},{item:'meat_raw',min:0,max:1}]},
  shark:{name:'Акула',hp:25,speed:2.8,hostile:true,color:0x5a6a7a,bodyColor:0x5a6a7a,headColor:0x3a4a5a,size:[0.8,0.8,2.0],headSize:0.5,attackRange:1.8,attackDmg:8,drops:[{item:'shark_tooth',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  squid:{name:'Кальмар',hp:10,speed:1.8,hostile:false,color:0x8a4a8a,bodyColor:0x8a4a8a,headColor:0x6a2a6a,size:[0.6,0.8,0.8],headSize:0.5,drops:[{item:'meat_raw',min:0,max:1}]},
  turtle:{name:'Черепаха',hp:15,speed:0.8,hostile:false,color:0x4a8a4a,bodyColor:0x4a8a4a,headColor:0x3a6a3a,size:[0.8,0.5,1.0],headSize:0.3,drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]},
  dolphin:{name:'Дельфин',hp:14,speed:3.0,hostile:false,color:0x8ac8e8,bodyColor:0x8ac8e8,headColor:0x6aa8c8,size:[0.5,0.6,1.5],headSize:0.4,drops:[{item:'meat_raw',min:0,max:1}]},
  lion:{name:'Лев',hp:25,speed:2.4,hostile:true,color:0xe8c878,bodyColor:0xe8c878,headColor:0xc8a858,size:[0.7,0.9,1.3],headSize:0.5,attackRange:1.7,attackDmg:7,drops:[{item:'leather',min:2,max:3},{item:'meat_raw',min:2,max:3}]},
  zebra:{name:'Зебра',hp:18,speed:2.8,hostile:false,color:0xf0f0f0,bodyColor:0xf0f0f0,headColor:0xe0e0e0,size:[0.7,1.4,1.5],headSize:0.5,drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]},
  giraffe:{name:'Жираф',hp:22,speed:1.6,hostile:false,color:0xe8d878,bodyColor:0xe8d878,headColor:0xc8b858,size:[0.8,3.5,1.5],headSize:0.4,drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:1,max:3}]},
  elephant:{name:'Слон',hp:50,speed:1.2,hostile:false,color:0x8a8a7a,bodyColor:0x8a8a7a,headColor:0x6a6a5a,size:[1.5,2.5,2.5],headSize:0.7,drops:[{item:'leather',min:3,max:6},{item:'meat_raw',min:2,max:4},{item:'bone',min:1,max:3}]},
  hyena:{name:'Гиена',hp:12,speed:2.2,hostile:true,color:0xa89868,bodyColor:0xa89868,headColor:0x887848,size:[0.5,0.7,1.0],headSize:0.4,attackRange:1.5,attackDmg:4,drops:[{item:'leather',min:0,max:2},{item:'meat_raw',min:0,max:1}]},
  // БОССЫ
  golem_forest:{name:'Лесной Голем',hp:200,speed:1.0,hostile:true,color:0x4a8a2a,bodyColor:0x4a8a2a,headColor:0x3a6a1a,size:[1.8,3.5,1.5],headSize:1.0,attackRange:2.5,attackDmg:15,knockback:5,boss:true,drops:[{item:'golem_core',min:1,max:1},{item:'forest_blade',min:1,max:1},{item:'diamond',min:2,max:4},{item:'emerald',min:1,max:3}]},
  swamp_hydra:{name:'Болотная Химера',hp:250,speed:1.2,hostile:true,color:0x4a6a2a,bodyColor:0x4a6a2a,headColor:0x3a5a1a,size:[1.5,2.5,2.5],headSize:0.8,attackRange:3.0,attackDmg:18,poison:5,ranged:true,boss:true,drops:[{item:'swamp_venom',min:1,max:1},{item:'poison_gland',min:5,max:10},{item:'mythril_ingot',min:2,max:4},{item:'diamond',min:3,max:5}]},
  sand_worm:{name:'Песчаный Червь',hp:300,speed:1.8,hostile:true,color:0xe6d29a,bodyColor:0xe6d29a,headColor:0xc8b278,size:[1.5,1.5,5.0],headSize:1.2,attackRange:3.5,attackDmg:20,knockback:4,boss:true,drops:[{item:'sand_reaper',min:1,max:1},{item:'adamant_ore',min:2,max:4},{item:'gold_ingot',min:5,max:10},{item:'diamond',min:3,max:6}]},
  ice_king:{name:'Ледяной Король',hp:280,speed:1.4,hostile:true,color:0x8ac8e8,bodyColor:0x8ac8e8,headColor:0x6aa8c8,size:[1.2,2.8,1.0],headSize:0.7,attackRange:3.0,attackDmg:18,ranged:true,boss:true,drops:[{item:'ice_crown',min:1,max:1},{item:'ice_fang',min:1,max:1},{item:'ice_shard',min:10,max:20},{item:'diamond',min:4,max:7},{item:'mythril_ingot',min:2,max:4}]},
  jaguar_king:{name:'Король Ягуаров',hp:220,speed:3.0,hostile:true,color:0xe8a83a,bodyColor:0xe8a83a,headColor:0xc8881a,size:[1.0,1.4,2.0],headSize:0.6,attackRange:2.0,attackDmg:22,boss:true,drops:[{item:'jungle_fury',min:1,max:1},{item:'jungle_cloak',min:1,max:1},{item:'emerald',min:3,max:6},{item:'mythril_ingot',min:2,max:4}]},
  stone_titan:{name:'Каменный Титан',hp:400,speed:0.8,hostile:true,color:0x5a5a5a,bodyColor:0x5a5a5a,headColor:0x3a3a3a,size:[2.5,5.0,2.0],headSize:1.5,attackRange:3.5,attackDmg:25,knockback:8,boss:true,drops:[{item:'titan_hammer',min:1,max:1},{item:'golem_armor',min:1,max:1},{item:'adamant_ore',min:3,max:6},{item:'diamond',min:5,max:10},{item:'mythril_ingot',min:3,max:5}]},
  sea_serpent:{name:'Морской Змей',hp:350,speed:2.5,hostile:true,color:0x4a8a4a,bodyColor:0x4a8a4a,headColor:0x2a6a2a,size:[1.5,1.5,6.0],headSize:1.3,attackRange:3.5,attackDmg:22,boss:true,drops:[{item:'serpent_trident',min:1,max:1},{item:'serpent_scale_armor',min:1,max:1},{item:'serpent_scale',min:5,max:10},{item:'diamond',min:5,max:8},{item:'adamant_ore',min:2,max:4}]},
  lion_king:{name:'Царь Львов',hp:240,speed:2.8,hostile:true,color:0xe8c878,bodyColor:0xe8c878,headColor:0xc8a858,size:[1.2,1.6,2.0],headSize:0.7,attackRange:2.2,attackDmg:20,boss:true,drops:[{item:'lion_claw',min:1,max:1},{item:'emerald',min:4,max:8},{item:'gold_ingot',min:5,max:10},{item:'diamond',min:3,max:6}]},
};

// ═══════════════════════════════════════════════════════════
//  RECIPES — полная копия
// ═══════════════════════════════════════════════════════════
const RECIPES = [
  {result:'stick',count:4,pattern:['  ','P ','P '],keys:{P:8}},
  {result:17,count:1,pattern:['PP ','PP ','   '],keys:{P:8}},
  {result:'torch',count:4,pattern:['C ','S ','  '],keys:{C:'coal',S:'stick'}},
  {result:56,count:1,pattern:['SSS','S S','SSS'],keys:{S:3}},
  {result:55,count:1,pattern:['P P','PPP','P P'],keys:{P:8}},
  {result:8,count:4,pattern:['W  ','   ','   '],keys:{W:5}},
  {result:8,count:4,pattern:['W  ','   ','   '],keys:{W:21}},
  {result:8,count:4,pattern:['W  ','   ','   '],keys:{W:36}},
  {result:61,count:1,pattern:['WWW','WWW','WWW'],keys:{W:'wool'}},
  {result:31,count:1,pattern:['III','III','III'],keys:{I:'iron_ingot'}},
  {result:32,count:1,pattern:['III','III','III'],keys:{I:'gold_ingot'}},
  {result:33,count:1,pattern:['DDD','DDD','DDD'],keys:{D:'diamond'}},
  {result:78,count:1,pattern:['MMM','MMM','MMM'],keys:{M:'mythril_ingot'}},
  {result:80,count:1,pattern:['AAA','AAA','AAA'],keys:{A:'adamant_ingot'}},
  {result:'iron_ingot',count:1,pattern:['I  ','   ','   '],keys:{I:'iron_ore'}},
  {result:'gold_ingot',count:1,pattern:['I  ','   ','   '],keys:{I:'gold_ore'}},
  {result:'mythril_ingot',count:1,pattern:['I C','   ','   '],keys:{I:'mythril_ore',C:'coal'}},
  {result:'adamant_ingot',count:1,pattern:['IC C','   ','   '],keys:{I:'adamant_ore',C:'coal'}},
  {result:'wood_pickaxe',count:1,pattern:['PPP',' S ',' S '],keys:{P:8,S:'stick'}},
  {result:'stone_pickaxe',count:1,pattern:['PPP',' S ',' S '],keys:{P:4,S:'stick'}},
  {result:'iron_pickaxe',count:1,pattern:['PPP',' S ',' S '],keys:{P:'iron_ingot',S:'stick'}},
  {result:'diamond_pickaxe',count:1,pattern:['PPP',' S ',' S '],keys:{P:'diamond',S:'stick'}},
  {result:'mythril_pickaxe',count:1,pattern:['PPP',' S ',' S '],keys:{P:'mythril_ingot',S:'stick'}},
  {result:'wood_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:8,S:'stick'}},
  {result:'stone_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:4,S:'stick'}},
  {result:'iron_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:'iron_ingot',S:'stick'}},
  {result:'golden_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:'gold_ingot',S:'stick'}},
  {result:'diamond_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:'diamond',S:'stick'}},
  {result:'mythril_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:'mythril_ingot',S:'stick'}},
  {result:'adamant_sword',count:1,pattern:['P  ','P  ','S  '],keys:{P:'adamant_ingot',S:'stick'}},
  {result:'dragon_sword',count:1,pattern:['D D','P P','S S'],keys:{D:'dragon_scale',P:'iron_ingot',S:'stick'}},
  {result:'wood_axe',count:1,pattern:['PP ','PS ',' S '],keys:{P:8,S:'stick'}},
  {result:'iron_axe',count:1,pattern:['PP ','PS ',' S '],keys:{P:'iron_ingot',S:'stick'}},
  {result:'diamond_axe',count:1,pattern:['PP ','PS ',' S '],keys:{P:'diamond',S:'stick'}},
  {result:'war_hammer',count:1,pattern:['AAA','ASA',' S '],keys:{A:'adamant_ingot',S:'stick'}},
  {result:'bow',count:1,pattern:['S  ','S|','S  '],keys:{S:'stick','|':'string'}},
  {result:'bow_iron',count:1,pattern:['S  ','S|','S  '],keys:{S:'iron_ingot','|':'string'}},
  {result:'bow_diamond',count:1,pattern:['S  ','S|','S  '],keys:{S:'diamond','|':'string'}},
  {result:'bow_mythril',count:1,pattern:['S  ','S|','S  '],keys:{S:'mythril_ingot','|':'string'}},
  {result:'bow_dragon',count:1,pattern:['S  ','S|','S  '],keys:{S:'dragon_scale','|':'string'}},
  {result:'arrow',count:4,pattern:[' F ',' S ','I  '],keys:{F:'feather',S:'stick',I:'iron_ingot'}},
  {result:'arrow_iron',count:4,pattern:[' F ',' S ','II '],keys:{F:'feather',S:'stick',I:'iron_ingot'}},
  {result:'arrow_explosive',count:2,pattern:[' F ',' S ','C C'],keys:{F:'feather',S:'stick',C:'coal'}},
  {result:'arrow_mythril',count:2,pattern:[' F ',' S ','M M'],keys:{F:'feather',S:'stick',M:'mythril_ingot'}},
  {result:'staff_fire',count:1,pattern:['  C',' S ','S  '],keys:{C:'crystal',S:'stick'}},
  {result:'staff_ice',count:1,pattern:['  I',' S ','S  '],keys:{I:'ice_shard',S:'stick'}},
  {result:'staff_lightning',count:1,pattern:['  D',' M ','M  '],keys:{D:'diamond',M:'mythril_ingot'}},
  {result:'leather_helmet',count:1,pattern:['LLL','L L','   '],keys:{L:'leather'}},
  {result:'leather_chest',count:1,pattern:['L L','LLL','LLL'],keys:{L:'leather'}},
  {result:'leather_boots',count:1,pattern:['   ','L L','L L'],keys:{L:'leather'}},
  {result:'iron_helmet',count:1,pattern:['III','I I','   '],keys:{I:'iron_ingot'}},
  {result:'iron_chest',count:1,pattern:['I I','III','III'],keys:{I:'iron_ingot'}},
  {result:'iron_boots',count:1,pattern:['   ','I I','I I'],keys:{I:'iron_ingot'}},
  {result:'gold_helmet',count:1,pattern:['GGG','G G','   '],keys:{G:'gold_ingot'}},
  {result:'gold_chest',count:1,pattern:['G G','GGG','GGG'],keys:{G:'gold_ingot'}},
  {result:'gold_boots',count:1,pattern:['   ','G G','G G'],keys:{G:'gold_ingot'}},
  {result:'diamond_helmet',count:1,pattern:['DDD','D D','   '],keys:{D:'diamond'}},
  {result:'diamond_chest',count:1,pattern:['D D','DDD','DDD'],keys:{D:'diamond'}},
  {result:'diamond_boots',count:1,pattern:['   ','D D','D D'],keys:{D:'diamond'}},
  {result:'mythril_helmet',count:1,pattern:['MMM','M M','   '],keys:{M:'mythril_ingot'}},
  {result:'mythril_chest',count:1,pattern:['M M','MMM','MMM'],keys:{M:'mythril_ingot'}},
  {result:'mythril_boots',count:1,pattern:['   ','M M','M M'],keys:{M:'mythril_ingot'}},
  {result:'adamant_helmet',count:1,pattern:['AAA','A A','   '],keys:{A:'adamant_ingot'}},
  {result:'adamant_chest',count:1,pattern:['A A','AAA','AAA'],keys:{A:'adamant_ingot'}},
  {result:'adamant_boots',count:1,pattern:['   ','A A','A A'],keys:{A:'adamant_ingot'}},
  {result:'dragon_helmet',count:1,pattern:['DDD','D D','   '],keys:{D:'dragon_scale'}},
  {result:'dragon_chest',count:1,pattern:['D D','DDD','DDD'],keys:{D:'dragon_scale'}},
  {result:'dragon_boots',count:1,pattern:['   ','D D','D D'],keys:{D:'dragon_scale'}},
  {result:51,count:1,pattern:['   ','PPP','P P'],keys:{P:8}},
  {result:52,count:1,pattern:['P  ','P  ','PP '],keys:{P:8}},
  {result:53,count:1,pattern:['WWW','W W','W W'],keys:{W:'wool'}},
  {result:54,count:1,pattern:['G  ','S  ','S  '],keys:{G:'glowstone',S:'stick'}},
  {result:58,count:1,pattern:['WW ','WW ','   '],keys:{W:'wool'}},
  {result:65,count:1,pattern:['P  ','P  ','P  '],keys:{P:8}},
  {result:66,count:1,pattern:['P P','P P','P P'],keys:{P:8}},
  {result:67,count:1,pattern:['PP ','PP ','PP '],keys:{P:8}},
  {result:68,count:1,pattern:['P  ','P  ','P  '],keys:{P:8}},
  {result:71,count:1,pattern:[' D ','DBD','OOO'],keys:{D:'diamond',B:8,O:'obsidian'}},
  {result:'golden_apple',count:1,pattern:['GGG','GAG','GGG'],keys:{G:'gold_ingot',A:'apple'}},
  {result:'bread',count:1,pattern:['WWW','   ','   '],keys:{W:'wheat'}},
  {result:'forest_blade',count:1,pattern:['  S',' SL','SL '],keys:{S:'stick',L:'leather'}},
  {result:'swamp_venom',count:1,pattern:[' P ','PS ',' S '],keys:{P:'poison_gland',S:'stick'}},
  {result:'ice_fang',count:1,pattern:['  I',' IS',' S '],keys:{I:'ice_shard',S:'stick'}},
  {result:'sand_reaper',count:1,pattern:['  B',' BS',' S '],keys:{B:'bamboo',S:'stick'}},
  {result:'jungle_fury',count:1,pattern:['  V',' VS',' S '],keys:{V:'vines',S:'stick'}},
  {result:'titan_hammer',count:1,pattern:['AAA','ASA',' S '],keys:{A:'adamant_ingot',S:'stick'}},
  {result:'serpent_trident',count:1,pattern:['  S','SPS',' S '],keys:{S:'serpent_scale',P:'iron_ingot'}},
  {result:'lion_claw',count:1,pattern:['  L',' LL',' S '],keys:{L:'leather',S:'stick'}},
  {result:'golem_armor',count:1,pattern:['G G','GGG','GGG'],keys:{G:'golem_core'}},
  {result:'ice_crown',count:1,pattern:['I I','III','   '],keys:{I:'ice_shard'}},
  {result:'serpent_scale_armor',count:1,pattern:['S S','SSS','SSS'],keys:{S:'serpent_scale'}},
  {result:'jungle_cloak',count:1,pattern:['V V','VVV','V V'],keys:{V:'vines'}},
  {result:'sand_veil',count:1,pattern:['B B','BBB','   '],keys:{B:'bamboo'}},
  {result:9,count:1,pattern:['S  ','   ','   '],keys:{S:7}},
  {result:10,count:4,pattern:['SS ','SS ','   '],keys:{S:7}},
  // Стройматериалы
  {result:65,count:3,pattern:['P  ','P  ','P  '],keys:{P:8}},          // забор
  {result:66,count:1,pattern:['P P','P P','P P'],keys:{P:8}},          // калитка
  {result:67,count:1,pattern:['PP ','PP ','PP '],keys:{P:8}},          // дверь
  {result:68,count:3,pattern:['S S','S S','S S'],keys:{S:'stick'}},    // лестница
  {result:57,count:1,pattern:['III','I I','III'],keys:{I:'iron_ingot'}}, // наковальня
  {result:72,count:1,pattern:['C C','CCC','   '],keys:{C:'coal'}},     // glowstone из угля
  // Шерстяные блоки
  {result:61,count:1,pattern:['WW ','WW ','   '],keys:{W:'wool'}},     // белый шерстяной блок
  {result:63,count:1,pattern:['WW ','WW ','   '],keys:{W:'wool'}},     // красный (упрощение)
  {result:64,count:1,pattern:['WW ','WW ','   '],keys:{W:'wool'}},     // синий (упрощение)
  // Ковры
  {result:60,count:3,pattern:['WW ','   ','   '],keys:{W:'wool'}},     // зелёный ковёр
  // Декор
  {result:54,count:1,pattern:['G  ','S  ','S  '],keys:{G:'glowstone',S:'stick'}}, // лампа
  {result:70,count:1,pattern:[' B ',' B ',' B '],keys:{B:4}},           // горшок
  {result:29,count:1,pattern:['WW ','WW ','   '],keys:{W:'wheat'}},     // сено
];

// ═══════════════════════════════════════════════════════════
//  МИР (чанковая система)
// ═══════════════════════════════════════════════════════════
const world = {
  chunks: new Map(),
  generated: new Set(),
  modifiedBlocks: new Map(),
  structures: [],
  W: WORLD_W, H: WORLD_H, D: WORLD_D,

  chunkKey(cx, cz) { return `${cx},${cz}`; },
  getChunk(cx, cz) {
    const key = this.chunkKey(cx, cz);
    if (!this.chunks.has(key)) this.chunks.set(key, new Uint8Array(CHUNK_SIZE*CHUNK_SIZE*WORLD_D));
    return this.chunks.get(key);
  },
  isGenerated(cx, cz) { return this.generated.has(this.chunkKey(cx, cz)); },
  generateChunk(cx, cz) {
    if (this.isGenerated(cx, cz)) return;
    // Помечаем КАК СГЕНЕРИРОВАННЫЙ ДО начала генерации,
    // чтобы setBlockRaw не вызывал generateChunk рекурсивно
    this.generated.add(this.chunkKey(cx, cz));
    const chunk = this.getChunk(cx, cz);
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        if (wx >= WORLD_W || wz >= WORLD_H) continue;
        const biome = getBiomeAt(wx, wz);
        // Высота через биом + шум (более плавные холмы)
        const heightNoise = biomeNoise(wx, wz, 0.08, SEED + 500) * 0.5
                          + biomeNoise(wx, wz, 0.04, SEED + 600) * 0.5;
        let h = biome.heightBase + heightNoise * biome.heightVariation * 2 + (Math.random() - 0.5) * 0.4;
        const surface = Math.max(3, Math.min(WORLD_D - 8, Math.floor(h)));

        for (let y = 0; y < WORLD_D; y++) {
          let id = 0;
          if (y === 0) {
            id = 15; // bedrock
          } else if (y < surface - 4) {
            // Глубокий камень + руда
            id = 3;
            const r = Math.random();
            const depth = surface - y;
            if (r < 0.05 && depth > 4) id = 11;       // coal
            else if (r < 0.085 && depth > 8) id = 12;  // iron
            else if (r < 0.095 && depth > 14) id = 13; // gold
            else if (r < 0.100 && depth > 20) id = 14; // diamond
            else if (r < 0.102 && depth > 28) id = 77; // mythril
            else if (r < 0.103 && depth > 35) id = 79; // adamant
          } else if (y < surface - 1) {
            id = biome.subsurfaceBlock;
          } else if (y === surface - 1) {
            id = biome.surfaceBlock;
            // Океан — заливаем водой до уровня
            if (biome.id === BIOMES.OCEAN.id) {
              id = 7; // песок под водой
              for (let wy = surface; wy <= biome.waterLevel; wy++) {
                if (wy < WORLD_D) this.setBlockRaw(wx, wy, wz, 16);
              }
            }
          }
          this.setBlockRaw(wx, y, wz, id);
        }
        // Деревья — реже, с проверкой на минимальное расстояние
        if (biome.treeChance > 0 && Math.random() < biome.treeChance && surface + 8 < WORLD_D) {
          this.placeTree(wx, surface, wz, biome.treeType);
        }
        // Цветы и декор — реже
        if (biome.flowerChance > 0 && Math.random() < biome.flowerChance && surface < WORLD_D) {
          if (this.getBlock(wx, surface, wz) === 0) {
            const flowerType = Math.random() < 0.5 ? 82 : 83;
            this.setBlockRaw(wx, surface, wz, flowerType);
          }
        }
        // Кактусы в пустыне
        if (biome.cactusChance > 0 && Math.random() < biome.cactusChance) {
          for (let c = 0; c < 2 + Math.floor(Math.random()*2); c++) {
            if (surface + c < WORLD_D) this.setBlockRaw(wx, surface + c, wz, 27);
          }
        }
        // Высокая трава в равнинах
        if (biome.id === BIOMES.PLAINS.id && Math.random() < 0.08 && surface < WORLD_D) {
          if (this.getBlock(wx, surface, wz) === 0) this.setBlockRaw(wx, surface, wz, 81);
        }
      }
    }
    // === ОЗЕРО В ЦЕНТРЕ + РЕКА НА ЗАПАД ===
    this.generateLakeAndRiver(cx, cz);
    this.maybePlaceStructure(cx, cz);
  },
  generateLakeAndRiver(cx, cz) {
    const lakeCX = 128, lakeCZ = 128, lakeR = 18;
    // Река: от озера (128,128) на запад к океану (x~70)
    const riverZ = 128;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        // Озеро — круг в центре
        const distLake = Math.sqrt((wx - lakeCX)**2 + (wz - lakeCZ)**2);
        if (distLake < lakeR) {
          // Найти поверхность и залить водой
          for (let y = WORLD_D - 1; y >= 0; y--) {
            if (this.getBlock(wx, y, wz) > 0) {
              // Песок под водой
              this.setBlockRaw(wx, y, wz, 7);
              for (let wy = y + 1; wy <= 10; wy++) {
                if (wy < WORLD_D) this.setBlockRaw(wx, wy, wz, 16);
              }
              break;
            }
          }
        }
        // Река — полоса на запад от озера
        if (wx >= 70 && wx <= 128 && Math.abs(wz - riverZ) < 4) {
          for (let y = WORLD_D - 1; y >= 0; y--) {
            if (this.getBlock(wx, y, wz) > 0) {
              this.setBlockRaw(wx, y, wz, 7);
              for (let wy = y + 1; wy <= 9; wy++) {
                if (wy < WORLD_D) this.setBlockRaw(wx, wy, wz, 16);
              }
              break;
            }
          }
        }
      }
    }
  },
  placeTree(x, surfY, z, type) {
    const isSpruce = type === 'spruce' || type === 'spruce_sparse';
    const isJungle = type === 'jungle';
    const isSwamp = type === 'swamp_willow';
    const isCactus = type === 'cactus';
    if (isCactus) {
      for (let i = 0; i < 3+Math.floor(Math.random()*2); i++) if (surfY+i < WORLD_D) this.setBlockRaw(x, surfY+i, z, 27);
      return;
    }
    const logId = isSpruce ? 21 : isJungle ? 36 : isSwamp ? 43 : 5;
    const leavesId = isSpruce ? 22 : isJungle ? 37 : 6;
    const trunkH = isSpruce ? 5+Math.floor(Math.random()*2) : isJungle ? 8+Math.floor(Math.random()*4) : isSwamp ? 4+Math.floor(Math.random()*2) : 3+Math.floor(Math.random()*2);
    for (let dy = 0; dy < trunkH; dy++) if (surfY+dy < WORLD_D) this.setBlockRaw(x, surfY+dy, z, logId);
    const topY = surfY + trunkH - 1;
    const radius = isJungle ? 3 : 2;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dy = -1; dy <= (isJungle ? 2 : 1); dy++) {
          if (Math.abs(dx)+Math.abs(dz) > radius+1) continue;
          if (isSpruce && (Math.abs(dx)+Math.abs(dz)) > 1 && dy >= 0) continue;
          const nx = x+dx, nz = z+dz, ny = topY+dy;
          if (nx<0||nx>=WORLD_W||nz<0||nz>=WORLD_H||ny>=WORLD_D) continue;
          if (this.getBlock(nx, ny, nz) === 0 && Math.random() < 0.85) this.setBlockRaw(nx, ny, nz, leavesId);
        }
      }
    }
  },
  maybePlaceStructure(cx, cz) {
    const baseX = cx * CHUNK_SIZE + 8;
    const baseZ = cz * CHUNK_SIZE + 8;
    if (baseX < 5 || baseX >= WORLD_W - 5 || baseZ < 5 || baseZ >= WORLD_H - 5) return;
    const biome = getBiomeAt(baseX, baseZ);
    const r = Math.random();
    // Структуры размещаем с низкой частотой
    if (biome.id === BIOMES.PLAINS.id) {
      if (r < 0.08) this.buildHouse(baseX, baseZ, 'wood');
    } else if (biome.id === BIOMES.FOREST.id) {
      if (r < 0.06) this.buildHouse(baseX, baseZ, 'wood');
    } else if (biome.id === BIOMES.DESERT.id) {
      if (r < 0.04) this.buildPyramid(baseX, baseZ);
    } else if (biome.id === BIOMES.SNOW.id) {
      if (r < 0.03) this.buildIceCastle(baseX, baseZ);
    } else if (biome.id === BIOMES.JUNGLE.id) {
      if (r < 0.04) this.buildJungleTemple(baseX, baseZ);
    } else if (biome.id === BIOMES.OCEAN.id) {
      if (r < 0.06) this.buildShipwreck(baseX, baseZ);
    } else if (biome.id === BIOMES.SWAMP.id) {
      if (r < 0.05) this.buildWitchHut(baseX, baseZ);
    }
    if (r > 0.93) this.buildDungeon(baseX, baseZ, 4 + Math.floor(Math.random() * 5));
  },
  buildHouse(cx, cz, type) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) { if (this.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; } }
    if (surfY + 6 >= WORLD_D) surfY = WORLD_D - 7;

    const w = 9, d = 9, h = 5;
    const x0 = cx - 4, z0 = cz - 4;
    const wallBlock = 5;   // бревно
    const fillBlock = 8;   // доски
    const roofBlock = 10;  // кирпич (черепица)
    const foundBlock = 4;  // булыжник (фундамент)
    const floorBlock = 8;  // доски (пол)

    // === ФУНДАМЕНТ (1 слой булыжника) ===
    for (let x = x0 - 1; x < x0 + w + 1; x++) {
      for (let z = z0 - 1; z < z0 + d + 1; z++) {
        if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
        this.setBlockRaw(x, z, surfY - 1, foundBlock);
      }
    }

    // === СТЕНЫ (бревна по углам, доски между) ===
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + d; z++) {
        for (let y = surfY; y < surfY + h; y++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H||y>=WORLD_D) continue;
          const isCorner = (x === x0 || x === x0+w-1) && (z === z0 || z === z0+d-1);
          const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);

          if (isCorner) {
            // Углы — бревна
            this.setBlockRaw(x, z, y, wallBlock);
          } else if (isEdge) {
            // Стены — доски с окнами
            const isWindowRow = (y === surfY + 2);
            const isWindowPos = ((x === x0+2 || x === x0+w-3) && (z === z0 || z === z0+d-1)) ||
                                ((z === z0+2 || z === z0+d-3) && (x === x0 || x === x0+w-1));
            if (isWindowRow && isWindowPos) {
              this.setBlockRaw(x, z, y, 9); // стекло
            } else {
              this.setBlockRaw(x, z, y, fillBlock);
            }
          } else {
            // Внутри — воздух
            this.setBlockRaw(x, z, y, 0);
          }
        }
        // Пол
        this.setBlockRaw(x, z, surfY - 1, floorBlock);
      }
    }

    // === КРЫША (двускатная из черепицы) ===
    for (let layer = 0; layer < 3; layer++) {
      const inset = layer;
      const roofY = surfY + h + layer;
      if (roofY >= WORLD_D) break;
      for (let x = x0 + inset; x < x0 + w - inset; x++) {
        for (let z = z0 - 1 - inset; z < z0 + d + 1 + inset; z++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
          // Свесы крыши по Z
          const isEdge = (z === z0 - 1 - inset || z === z0 + d + inset);
          this.setBlockRaw(x, z, roofY, roofBlock);
        }
      }
    }
    // Конёк крыши
    if (surfY + h + 3 < WORLD_D) {
      for (let z = z0; z < z0 + d; z++) {
        this.setBlockRaw(cx, z, surfY + h + 3, roofBlock);
      }
    }

    // === ДВЕРЬ (проём в передней стене) ===
    this.setBlockRaw(cx, z0, surfY, 0);
    this.setBlockRaw(cx, z0, surfY + 1, 0);
    // Коврик перед дверью
    this.setBlockRaw(cx, z0 - 1, surfY - 1, 58);

    // === ИНТЕРЬЕР ===
    // Крафтовый стол
    this.setBlockRaw(cx - 3, surfY, cz - 3, 17);
    this.structures.push({ type:'crafting', x:cx-3, z:cz-3 });

    // Печь
    this.setBlockRaw(cx + 3, surfY, cz - 3, 56);

    // Сундук с лутом
    this.setBlockRaw(cx + 3, surfY, cz + 3, 18);
    this.structures.push({ type:'chest', x:cx+3, y:surfY, z:cz+3, loot:this.randomLoot() });

    // Кровать (2 блока)
    this.setBlockRaw(cx - 3, surfY, cz + 3, 53);
    this.setBlockRaw(cx - 3, surfY, cz + 2, 53);

    // Стол и стул
    this.setBlockRaw(cx, surfY, cz, 51);
    this.setBlockRaw(cx, surfY, cz + 1, 52);

    // Книжная полка
    this.setBlockRaw(cx - 3, surfY, cz, 55);

    // Ковёр
    this.setBlockRaw(cx + 1, surfY, cz, 59);
    this.setBlockRaw(cx - 1, surfY, cz, 58);

    // Факелы на стенах
    this.setBlockRaw(x0, surfY + 3, cz, 24);
    this.setBlockRaw(x0 + w - 1, surfY + 3, cz, 24);
    this.setBlockRaw(cx, surfY + 3, z0, 24);
    this.setBlockRaw(cx, surfY + 3, z0 + d - 1, 24);

    this.structures.push({ type:'house', x:cx, z:cz });
  },
  buildDungeon(cx, cz, depth) {
    if (depth < 1 || depth + 6 >= WORLD_D) return;
    const roomY = depth;
    const w = 7, d = 7;
    const x0 = cx - 3, z0 = cz - 3;
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + d; z++) {
        for (let y = roomY; y < roomY + 4; y++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
          const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
          if (isEdge) this.setBlockRaw(x, z, y, 20);
          else this.setBlockRaw(x, z, y, 0);
        }
        this.setBlockRaw(x, z, roomY - 1, 20);
      }
    }
    this.setBlockRaw(cx, roomY, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:roomY, z:cz, loot:this.randomLoot() });
    this.structures.push({ type:'dungeon', x:cx, z:cz });
  },
  buildPyramid(cx, cz) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) { if (this.getBlock(cx, y, cz) > 0) { surfY = y; break; } }
    for (let layer = 0; layer < 5; layer++) {
      const sz = 11 - layer * 2;
      if (sz < 3) break;
      const y = surfY + layer;
      for (let x = -Math.floor(sz/2); x <= Math.floor(sz/2); x++) {
        for (let z = -Math.floor(sz/2); z <= Math.floor(sz/2); z++) {
          const ax = cx + x, az = cz + z;
          if (ax<0||ax>=WORLD_W||az<0||az>=WORLD_H) continue;
          if (y < WORLD_D) this.setBlockRaw(ax, az, y, 7);
        }
      }
    }
    this.setBlockRaw(cx, surfY, cz + 5, 0);
    this.setBlockRaw(cx, surfY + 1, cz + 5, 0);
    for (let y = surfY; y < surfY + 4; y++) this.setBlockRaw(cx, y, cz, 0);
    this.setBlockRaw(cx, surfY + 1, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:surfY+1, z:cz, loot:this.randomLoot() });
    this.structures.push({ type:'pyramid', x:cx, z:cz });
  },
  buildJungleTemple(cx, cz) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) { if (this.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; } }
    const w = 9, d = 9, h = 6;
    const x0 = cx - 4, z0 = cz - 4;
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + d; z++) {
        for (let y = surfY; y < surfY + h; y++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
          const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
          if (isEdge) this.setBlockRaw(x, z, y, 4);
          else this.setBlockRaw(x, z, y, 0);
        }
        this.setBlockRaw(x, z, surfY - 1, 4);
        if (surfY + h < WORLD_D) this.setBlockRaw(x, z, surfY + h, 36);
      }
    }
    this.setBlockRaw(cx, z0, surfY, 0);
    this.setBlockRaw(cx, z0, surfY + 1, 0);
    this.setBlockRaw(cx, surfY, cz, 75);
    this.setBlockRaw(cx, surfY + 1, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:surfY+1, z:cz, loot:this.randomLoot() });
    this.structures.push({ type:'jungle_temple', x:cx, z:cz });
  },
  buildShipwreck(cx, cz) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) {
      const b = this.getBlock(cx, y, cz);
      if (b > 0 && b !== 16) { surfY = y + 1; break; }
      if (b === 16) { surfY = y; break; }
    }
    for (let x = cx - 4; x < cx + 5; x++) {
      for (let z = cz - 1; z < cz + 2; z++) {
        for (let y = surfY; y < surfY + 3; y++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
          const isHull = (z === cz-1 || z === cz+1 || y === surfY);
          if (isHull) this.setBlockRaw(x, z, y, 5);
          else this.setBlockRaw(x, z, y, 0);
        }
      }
    }
    this.setBlockRaw(cx, surfY + 1, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:surfY+1, z:cz, loot:this.randomLoot() });
    this.structures.push({ type:'shipwreck', x:cx, z:cz });
  },
  buildWitchHut(cx, cz) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) { if (this.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; } }
    const w = 5, d = 5, h = 3;
    const x0 = cx - 2, z0 = cz - 2;
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + d; z++) {
        this.setBlockRaw(x, z, surfY, 8);
        for (let y = surfY + 1; y < surfY + h; y++) {
          const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
          if (isEdge && (x === x0+1 || x === x0+w-2) && (z === z0 || z === z0+d-1)) this.setBlockRaw(x, z, y, 9);
          else if (isEdge) this.setBlockRaw(x, z, y, 8);
        }
        if (surfY + h < WORLD_D) this.setBlockRaw(x, z, surfY + h, 22);
      }
    }
    this.setBlockRaw(cx, z0, surfY + 1, 0);
    this.setBlockRaw(cx, surfY + 1, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:surfY+1, z:cz, loot:this.randomLoot() });
    this.setBlockRaw(cx - 1, surfY + 1, cz - 1, 17);
    this.structures.push({ type:'crafting', x:cx-1, z:cz-1 });
    this.structures.push({ type:'witch_hut', x:cx, z:cz });
  },
  buildIceCastle(cx, cz) {
    let surfY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) { if (this.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; } }
    const w = 11, d = 11, h = 8;
    const x0 = cx - 5, z0 = cz - 5;
    for (let x = x0; x < x0 + w; x++) {
      for (let z = z0; z < z0 + d; z++) {
        for (let y = surfY; y < surfY + h; y++) {
          if (x<0||x>=WORLD_W||z<0||z>=WORLD_H) continue;
          const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
          if (isEdge) this.setBlockRaw(x, z, y, 49);
          else this.setBlockRaw(x, z, y, 0);
        }
        this.setBlockRaw(x, z, surfY - 1, 49);
      }
    }
    this.setBlockRaw(cx, z0, surfY, 0);
    this.setBlockRaw(cx, z0, surfY + 1, 0);
    this.setBlockRaw(cx, z0, surfY + 2, 0);
    this.setBlockRaw(cx, surfY, cz, 70);
    this.setBlockRaw(cx, surfY + 1, cz, 18);
    this.structures.push({ type:'chest', x:cx, y:surfY+1, z:cz, loot:this.randomLoot() });
    this.structures.push({ type:'ice_castle', x:cx, z:cz });
  },
  randomLoot() {
    const pool = ['iron_ingot','gold_ingot','diamond','emerald','bow','arrow','arrow_iron','iron_sword','leather_chest','iron_chest','string','coal','bread','golden_apple','arrow_explosive','crystal','mythril_ore','adamant_ore','spider_silk','shark_tooth'];
    const n = 2 + Math.floor(Math.random() * 4);
    const loot = [];
    for (let i = 0; i < n; i++) {
      loot.push({ item: pool[Math.floor(Math.random() * pool.length)], count: 1 + Math.floor(Math.random() * 4) });
    }
    return loot;
  },
  setBlockRaw(x, y, z, id) {
    if (x<0||x>=WORLD_W||y<0||y>=WORLD_D||z<0||z>=WORLD_H) return;
    const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
    const lx = x - cx * CHUNK_SIZE, lz = z - cz * CHUNK_SIZE;
    if (!this.isGenerated(cx, cz)) this.generateChunk(cx, cz);
    const chunk = this.getChunk(cx, cz);
    chunk[(lx * CHUNK_SIZE + lz) * WORLD_D + y] = id;
  },
  getBlock(x, y, z) {
    if (x<0||x>=WORLD_W||y<0||y>=WORLD_D||z<0||z>=WORLD_H) return 0;
    const cx = Math.floor(x / CHUNK_SIZE), cz = Math.floor(z / CHUNK_SIZE);
    if (!this.isGenerated(cx, cz)) this.generateChunk(cx, cz);
    const lx = x - cx * CHUNK_SIZE, lz = z - cz * CHUNK_SIZE;
    const chunk = this.getChunk(cx, cz);
    return chunk[(lx * CHUNK_SIZE + lz) * WORLD_D + y];
  },
  setBlock(x, y, z, id) {
    this.setBlockRaw(x, y, z, id);
    this.modifiedBlocks.set(`${x},${y},${z}`, id);
  },
};

// === ДАЛЕЕ: THREE.JS RENDERER, UI, MOBS, ВВОД ===
// (продолжение в renderer.js)
// Здесь оставим точку входа

// ═══════════════════════════════════════════════════════════
//  THREE.JS SETUP
// ═══════════════════════════════════════════════════════════
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 80);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.insertBefore(renderer.domElement, document.body.firstChild);

// Bloom post-processing
let composer = null;
let bloomPass = null;
function initBloom() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.3, 0.85);
  composer.addPass(bloomPass);
}
initBloom();

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (composer) composer.setSize(innerWidth, innerHeight);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(60, 120, 40);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x6b4423, 0.3));

// ═══════════════════════════════════════════════════════════
//  ТЕКСТУРНЫЙ АТЛАС + GREEDY MESHING
// ═══════════════════════════════════════════════════════════

// Строим атлас текстур один раз при старте
let atlasBuilt = false;
let atlasCanvas = null;
function ensureAtlasBuilt() {
  if (!atlasBuilt) {
    atlasCanvas = buildAtlas();
    atlasBuilt = true;
    initAnimatedTextures();
  }
}

// ═══════════════════════════════════════════════════════════
//  АНИМИРОВАННЫЕ ТЕКСТУРЫ (вода и лава)
// ═══════════════════════════════════════════════════════════
let waterCanvas, waterTexture, waterMaterial;
let lavaCanvas, lavaTexture, lavaMaterial;
let animFrame = 0;
let animTimer = 0;

function initAnimatedTextures() {
  // Вода — анимированная canvas-текстура
  waterCanvas = document.createElement('canvas');
  waterCanvas.width = 32; waterCanvas.height = 32;
  waterTexture = new THREE.CanvasTexture(waterCanvas);
  waterTexture.magFilter = THREE.NearestFilter;
  waterTexture.minFilter = THREE.NearestFilter;
  waterTexture.colorSpace = THREE.SRGBColorSpace;
  waterMaterial = new THREE.MeshLambertMaterial({
    map: waterTexture,
    transparent: true,
    opacity: 0.75,
    alphaTest: 0.1,
  });
  
  // Лава — анимированная canvas-текстура
  lavaCanvas = document.createElement('canvas');
  lavaCanvas.width = 32; lavaCanvas.height = 32;
  lavaTexture = new THREE.CanvasTexture(lavaCanvas);
  lavaTexture.magFilter = THREE.NearestFilter;
  lavaTexture.minFilter = THREE.NearestFilter;
  lavaTexture.colorSpace = THREE.SRGBColorSpace;
  lavaMaterial = new THREE.MeshLambertMaterial({
    map: lavaTexture,
    transparent: true,
    opacity: 0.95,
    emissive: 0xff4400,
    emissiveIntensity: 0.5,
  });
  
  drawWaterFrame(0);
  drawLavaFrame(0);
}

function drawWaterFrame(frame) {
  const ctx = waterCanvas.getContext('2d');
  ctx.fillStyle = '#3a6ea8';
  ctx.fillRect(0, 0, 32, 32);
  // Волны — диагональные полосы, сдвинутые по кадру
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(90,142,200,${0.4 + Math.random()*0.3})`;
    const y = (i * 4 + frame * 2) % 32;
    ctx.fillRect(0, y, 32, 1);
  }
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random()*0.15})`;
    ctx.fillRect(Math.floor(Math.random()*32), Math.floor(Math.random()*32), 2, 1);
  }
  waterTexture.needsUpdate = true;
}

function drawLavaFrame(frame) {
  const ctx = lavaCanvas.getContext('2d');
  ctx.fillStyle = '#e85a2a';
  ctx.fillRect(0, 0, 32, 32);
  // Пузыри лавы, сдвинутые по кадру
  for (let i = 0; i < 25; i++) {
    const x = (Math.floor(Math.random()*32) + frame * 3) % 32;
    const y = (Math.floor(Math.random()*32) + frame * 2) % 32;
    ctx.fillStyle = '#ffa550';
    ctx.fillRect(x, y, 2, 2);
  }
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = '#ffe85e';
    ctx.fillRect(Math.floor(Math.random()*32), Math.floor(Math.random()*32), 1, 1);
  }
  lavaTexture.needsUpdate = true;
}

function updateAnimatedTextures(dt) {
  animTimer += dt;
  if (animTimer > 0.25) { // 4 кадра в секунду
    animTimer = 0;
    animFrame = (animFrame + 1) % 4;
    drawWaterFrame(animFrame);
    drawLavaFrame(animFrame);
  }
}

// Кэш mesh'ей чанков: ключ "cx,cz" → { mesh, transparentMesh, lastBuilt }
const chunkMeshes = new Map();

// Greedy meshing для одного чанка
function buildChunkGreedyMesh(chunkX, chunkZ) {
  ensureAtlasBuilt();
  
  const meshData = buildChunkMesh(world, BLOCKS, chunkX, chunkZ, CHUNK_SIZE, WORLD_D);
  const meshes = [];
  
  // Основной mesh (непрозрачные блоки)
  if (meshData.positions.length > 0) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(meshData.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(meshData.uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, getAtlasMaterial(false));
    mesh.frustumCulled = true;
    meshes.push(mesh);
  }
  
  // Прозрачный mesh (стекло, листва)
  if (meshData.transparentPositions.length > 0) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(meshData.transparentPositions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.transparentNormals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(meshData.transparentUvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(meshData.transparentIndices, 1));
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, getAtlasMaterial(true));
    mesh.frustumCulled = true;
    meshes.push(mesh);
  }
  
  // Water mesh (анимированная текстура)
  if (meshData.waterPositions.length > 0) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(meshData.waterPositions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.waterNormals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(meshData.waterUvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(meshData.waterIndices, 1));
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, waterMaterial);
    mesh.frustumCulled = true;
    meshes.push(mesh);
  }
  
  // Lava mesh (анимированная текстура)
  if (meshData.lavaPositions.length > 0) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(meshData.lavaPositions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.lavaNormals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(meshData.lavaUvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(meshData.lavaIndices, 1));
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, lavaMaterial);
    mesh.frustumCulled = true;
    meshes.push(mesh);
  }
  
  return meshes;
}

// Получить UV для блока/грани (для иконок в инвентаре)
function getBlockFaceUV(blockId, faceIdx) {
  const textures = getBlockTextures(blockId);
  const name = textures[faceIdx] || textures[2]; // по умолчанию top
  return getTextureUV(name);
}

// ═══════════════════════════════════════════════════════════
//  РЕНДЕР МИРА — через greedy meshing по чанкам
// ═══════════════════════════════════════════════════════════
const worldMeshes = {}; // Совместимость со старым кодом (raycaster)

function isBlockVisible(x, y, z) {
  const id = world.getBlock(x, y, z);
  if (id === 0) return false;
  const neighbors = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for (const [dx, dy, dz] of neighbors) {
    const n = world.getBlock(x+dx, y+dy, z+dz);
    if (n === 0) return true;
    if (BLOCKS[n] && BLOCKS[n].transparent && n !== id) return true;
  }
  return false;
}

function buildWorldMesh() {
  ensureAtlasBuilt();
  
  // Удаляем старые чанк-mesh'ы
  for (const [key, data] of chunkMeshes) {
    if (data.meshes) {
      data.meshes.forEach(m => scene.remove(m));
    }
  }
  chunkMeshes.clear();
  
  // Очищаем worldMeshes для raycaster
  for (const id in worldMeshes) {
    scene.remove(worldMeshes[id]);
    delete worldMeshes[id];
  }
  
  // Строим mesh для каждого чанка в радиусе
  const pcx = Math.floor(player.pos.x / CHUNK_SIZE);
  const pcz = Math.floor(player.pos.z / CHUNK_SIZE);
  const allMeshes = [];
  
  for (let dcx = -RENDER_DISTANCE; dcx <= RENDER_DISTANCE; dcx++) {
    for (let dcz = -RENDER_DISTANCE; dcz <= RENDER_DISTANCE; dcz++) {
      const cx = pcx + dcx, cz = pcz + dcz;
      if (!world.isGenerated(cx, cz)) world.generateChunk(cx, cz);
      
      const meshes = buildChunkGreedyMesh(cx, cz);
      meshes.forEach(m => {
        scene.add(m);
        allMeshes.push(m);
      });
      
      chunkMeshes.set(`${cx},${cz}`, { meshes, lastBuilt: Date.now() });
    }
  }
  
  // Для raycaster: используем все mesh'ы как один массив
  worldMeshes[0] = { meshes: allMeshes }; // специальный ключ
  // Совместимость: создаём псевдо-mesh для raycaster
  // Raycaster будет искать по allMeshes
}

// Обновить только один чанк (при изменении блока)
function rebuildChunkAt(cx, cz) {
  const key = `${cx},${cz}`;
  const old = chunkMeshes.get(key);
  if (old && old.meshes) {
    old.meshes.forEach(m => scene.remove(m));
  }
  
  const meshes = buildChunkGreedyMesh(cx, cz);
  meshes.forEach(m => scene.add(m));
  chunkMeshes.set(key, { meshes, lastBuilt: Date.now() });
  
  // Перестроить и соседние чанки (на границе мог измениться видимость)
  const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dx, dz] of neighbors) {
    const ncx = cx + dx, ncz = cz + dz;
    const nkey = `${ncx},${ncz}`;
    const nold = chunkMeshes.get(nkey);
    if (nold && nold.meshes) {
      nold.meshes.forEach(m => scene.remove(m));
      const nmeshes = buildChunkGreedyMesh(ncx, ncz);
      nmeshes.forEach(m => scene.add(m));
      chunkMeshes.set(nkey, { meshes: nmeshes, lastBuilt: Date.now() });
    }
  }
  
  // Обновить worldMeshes для raycaster
  const allMeshes = [];
  for (const [key, data] of chunkMeshes) {
    if (data.meshes) allMeshes.push(...data.meshes);
  }
  worldMeshes[0] = { meshes: allMeshes };
}

// ═══════════════════════════════════════════════════════════
//  ПОДСВЕТКА ЦЕЛИ
// ═══════════════════════════════════════════════════════════
const highlightGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
const highlightEdges = new THREE.EdgesGeometry(highlightGeo);
const highlightMesh = new THREE.LineSegments(highlightEdges, new THREE.LineBasicMaterial({ color:0x000000 }));
highlightMesh.visible = false;
scene.add(highlightMesh);

// === ИГРОК, ВВОД, МОБЫ, UI, КРАФТ, КАРТА, ГЛАВНЫЙ ЦИКЛ ===
// (продолжение в части 2 — renderer-part2.js)




// ═══════════════════════════════════════════════════════════
//  renderer-part2.js — игрок, мобы, UI, крафт, карта
//  ВНИМАНИЕ: этот файл ожидает, что index.html уже загрузил
//  THREE, BLOCKS, ITEMS, BIOMES, MOBS, RECIPES, world, scene, camera, renderer, materials
// ═══════════════════════════════════════════════════════════

// Эти переменные объявлены в index.html через module scope
// Получаем к ним доступ через window (так как type=module)

// ═══════════════════════════════════════════════════════════
//  ИГРОК
// ═══════════════════════════════════════════════════════════
const player = {
  pos: new THREE.Vector3(128, 80, 128),
  vel: new THREE.Vector3(),
  onGround: false,
  flying: false,
  health: 20,
  food: 20,
  mana: 100,
  hotbar: new Array(9).fill(null).map(() => ({block:0, item:null, count:0, durability:0})),
  selectedSlot: 0,
  inventory: new Array(27).fill(null).map(() => ({block:0, item:null, count:0, durability:0})),
  equip: { weapon:null, helmet:null, chest:null, boots:null },
  craftGrid: new Array(9).fill(null).map(() => ({block:0, item:null, count:0})),
  fallStart: null,
};

function giveStarterItems() {
  player.hotbar[0] = {block:1, item:null, count:32};
  player.hotbar[1] = {block:8, item:null, count:32};
  player.hotbar[2] = {block:17, item:null, count:4};
  player.hotbar[3] = {block:0, item:'wood_pickaxe', count:1, durability:60};
  player.hotbar[4] = {block:0, item:'wood_sword', count:1, durability:60};
  player.hotbar[5] = {block:0, item:'torch', count:16};
}

function findSpawn() {
  const sx = 128, sz = 128;
  for (let y = WORLD_D - 1; y >= 0; y--) {
    if (world.getBlock(sx, y, sz) > 0) {
      player.pos.set(sx + 0.5, y + 2, sz + 0.5);
      return;
    }
  }
  player.pos.set(sx + 0.5, WORLD_D, sz + 0.5);
}

// ═══════════════════════════════════════════════════════════
//  УПРАВЛЕНИЕ
// ═══════════════════════════════════════════════════════════
let yaw = 0, pitch = 0;
const keys = {};
let paused = true;
let inInventory = false;
let inBigMap = false;

addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Escape') {
    if (inInventory) { closeInventory(); return; }
    if (inBigMap) { inBigMap = false; document.getElementById('bigmap').classList.remove('show'); return; }
    paused = true;
    document.getElementById('blocker').style.display = 'flex';
    if (document.exitPointerLock) document.exitPointerLock();
  }
  if (e.code === 'KeyE' && !paused) {
    if (inBigMap) { inBigMap = false; document.getElementById('bigmap').classList.remove('show'); }
    if (inInventory) closeInventory();
    else openInventory();
    e.preventDefault();
  }
  if (e.code === 'KeyM' && !paused) {
    inBigMap = !inBigMap;
    document.getElementById('bigmap').classList.toggle('show', inBigMap);
    if (inBigMap) { if (document.exitPointerLock) document.exitPointerLock(); renderBigMap(); }
    e.preventDefault();
  }
  if (e.code === 'KeyF' && !paused && !inInventory) {
    player.flying = !player.flying;
    player.vel.y = 0;
    flashHint(player.flying ? '✈ Полёт вкл' : '🚶 Полёт выкл');
  }
  if (e.code === 'KeyR' && !paused) tryPickup();
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.code.slice(5)) - 1;
    if (n >= 0 && n < 9) { player.selectedSlot = n; updateHotbar(); }
  }
});
addEventListener('keyup', e => { keys[e.code] = false; });

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement || document.pointerLockElement === document.body;
  if (!locked && !inInventory && !inBigMap && !paused) {
    paused = true;
    document.getElementById('blocker').style.display = 'flex';
  }
});

document.addEventListener('mousemove', e => {
  if (paused || inInventory || inBigMap) return;
  yaw -= e.movementX * 0.0025;
  pitch -= e.movementY * 0.0025;
  pitch = Math.max(-Math.PI/2+0.05, Math.min(Math.PI/2-0.05, pitch));
});

document.addEventListener('mousedown', e => {
  if (paused || inInventory || inBigMap) return;
  if (e.button === 0) {
    const sel = player.hotbar[player.selectedSlot];
    if (sel.item && ITEMS[sel.item] && ITEMS[sel.item].type === 'weapon') attackMob();
    else mineBlock();
  }
  else if (e.button === 2) {
    const sel = player.hotbar[player.selectedSlot];
    if (sel.item && ITEMS[sel.item] && ITEMS[sel.item].type === 'food') eatFood();
    else placeBlock();
  }
});
document.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('wheel', e => {
  if (paused || inInventory) return;
  if (e.deltaY > 0) player.selectedSlot = (player.selectedSlot + 1) % 9;
  else player.selectedSlot = (player.selectedSlot - 1 + 9) % 9;
  updateHotbar();
}, { passive: true });

document.getElementById('playBtn').addEventListener('click', () => {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  paused = false;
  document.getElementById('blocker').style.display = 'none';
  renderer.domElement.requestPointerLock();
});

// ═══════════════════════════════════════════════════════════
//  ФИЗИКА
// ═══════════════════════════════════════════════════════════
function isSolidAt(x, y, z) {
  const b = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
  return b > 0 && BLOCKS[b].solid;
}

function checkCollision(x, y, z) {
  const half = PLAYER_W / 2;
  const corners = [
    [x-half, y, z-half], [x+half, y, z-half],
    [x-half, y, z+half], [x+half, y, z+half],
    [x-half, y+PLAYER_H, z-half], [x+half, y+PLAYER_H, z-half],
    [x-half, y+PLAYER_H, z+half], [x+half, y+PLAYER_H, z+half],
  ];
  for (const [cx, cy, cz] of corners) if (isSolidAt(cx, cy, cz)) return true;
  return false;
}

function updatePlayer(dt) {
  const speed = player.flying ? FLY_SPEED : MOVE_SPEED;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const move = new THREE.Vector3();
  if (keys['KeyW'] || keys['ArrowUp'])    move.add(forward);
  if (keys['KeyS'] || keys['ArrowDown'])  move.sub(forward);
  if (keys['KeyA'] || keys['ArrowLeft'])  move.sub(right);
  if (keys['KeyD'] || keys['ArrowRight']) move.add(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * dt);
    const newX = player.pos.x + move.x;
    if (!checkCollision(newX, player.pos.y, player.pos.z)) player.pos.x = newX;
    const newZ = player.pos.z + move.z;
    if (!checkCollision(player.pos.x, player.pos.y, newZ)) player.pos.z = newZ;
  }
  if (player.flying) {
    if (keys['Space']) {
      const newY = player.pos.y + FLY_SPEED * dt;
      if (!checkCollision(player.pos.x, newY, player.pos.z)) player.pos.y = newY;
    }
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
      const newY = player.pos.y - FLY_SPEED * dt;
      if (!checkCollision(player.pos.x, newY, player.pos.z)) player.pos.y = newY;
    }
    player.vel.y = 0;
  } else {
    player.vel.y -= GRAVITY * dt;
    const newY = player.pos.y + player.vel.y * dt;
    if (!checkCollision(player.pos.x, newY, player.pos.z)) {
      player.pos.y = newY;
      player.onGround = false;
      if (player.vel.y < 0 && !player.fallStart) player.fallStart = player.pos.y;
    } else {
      if (player.vel.y < 0) {
        // Урон от падения
        if (player.fallStart) {
          const fallDist = player.fallStart - player.pos.y;
          if (fallDist > 4) {
            const dmg = Math.floor(fallDist - 3);
            if (dmg > 0) damagePlayer(dmg);
          }
          player.fallStart = null;
        }
        player.pos.y = Math.floor(newY) + 1;
        player.onGround = true;
      } else {
        player.pos.y = Math.floor(newY + PLAYER_H) - PLAYER_H - 0.001;
      }
      player.vel.y = 0;
    }
    if (keys['Space'] && player.onGround) { player.vel.y = JUMP_V; player.onGround = false; soundJump(); }
  }
  if (player.pos.y < 0) { player.pos.y = 1; player.vel.y = 0; }
  player.pos.x = Math.max(0.5, Math.min(WORLD_W-0.5, player.pos.x));
  player.pos.z = Math.max(0.5, Math.min(WORLD_H-0.5, player.pos.z));

  camera.position.set(player.pos.x, player.pos.y + 1.6, player.pos.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // Голод
  if (Math.random() < 0.0008) player.food = Math.max(0, player.food - 1);
  if (player.food === 0 && Math.random() < 0.003) damagePlayer(1);
  // Восстановление маны
  if (player.mana < MAX_MANA && Math.random() < 0.05) player.mana = Math.min(MAX_MANA, player.mana + 1);
  // Регенерация HP при полном голоде
  if (player.food >= 18 && player.health < MAX_HEALTH && Math.random() < 0.005) player.health++;
}

// ═══════════════════════════════════════════════════════════
//  ВЗАИМОДЕЙСТВИЕ С БЛОКАМИ
// ═══════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
raycaster.far = REACH;

function getTargetBlock() {
  raycaster.setFromCamera({x:0, y:0}, camera);
  // Собираем все mesh'ы чанков для raycaster
  const allMeshes = [];
  for (const [key, data] of chunkMeshes) {
    if (data.meshes) allMeshes.push(...data.meshes);
  }
  if (allMeshes.length === 0) return null;
  const intersects = raycaster.intersectObjects(allMeshes);
  if (intersects.length === 0) return null;
  const hit = intersects[0];
  // Позиция попадания — на поверхности блока
  const point = hit.point.clone();
  // Нормаль грани
  const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0,1,0);
  // Блок находится «внутри» от точки попадания по нормали
  const blockPos = point.clone().sub(normal.multiplyScalar(0.5));
  const bx = Math.floor(blockPos.x + 0.5);
  const by = Math.floor(blockPos.y + 0.5);
  const bz = Math.floor(blockPos.z + 0.5);
  const blockId = world.getBlock(bx, by, bz);
  if (blockId === 0) return null;
  return {
    x: bx, y: by, z: bz,
    blockId: blockId,
    normal: normal,
  };
}

function mineBlock() {
  const target = getTargetBlock();
  if (!target) return;
  const b = BLOCKS[target.blockId];
  if (b.hardness === Infinity) { flashHint('🚫 Нельзя сломать: bedrock'); return; }
  const drop = b.drop;
  if (drop !== 0 && drop !== undefined) {
    addItemToInventory(drop, 1);
    flashHint('+1 ' + (typeof drop === 'string' ? ITEMS[drop].name : BLOCKS[drop].name));
    soundDig();
  }
  if (target.blockId === 18) {
    const idx = world.structures.findIndex(s => s.type === 'chest' && s.x === target.x && s.y === target.y && s.z === target.z);
    if (idx >= 0 && world.structures[idx].loot) {
      world.structures[idx].loot.forEach(l => addItemToInventory(l.item, l.count));
      flashHint('📦 Сундук: +' + world.structures[idx].loot.length + ' предметов');
      soundChest();
    }
  }
  world.setBlock(target.x, target.y, target.z, 0);
  // Перестроить только затронутый чанк (и соседние)
  const cx = Math.floor(target.x / CHUNK_SIZE);
  const cz = Math.floor(target.z / CHUNK_SIZE);
  rebuildChunkAt(cx, cz);
  updateHotbar();
}

function placeBlock() {
  const target = getTargetBlock();
  if (!target) return;
  const sel = player.hotbar[player.selectedSlot];
  if (sel.block === 0 && !sel.item) { flashHint('Слот пуст'); return; }
  if (sel.item) {
    if (sel.item === 'torch') {
      const nx = target.x + Math.round(target.normal.x);
      const ny = target.y + Math.round(target.normal.y);
      const nz = target.z + Math.round(target.normal.z);
      if (getBlockSafe(nx, ny, nz) === 0) {
        world.setBlock(nx, ny, nz, 24);
        sel.count--;
        if (sel.count <= 0) player.hotbar[player.selectedSlot] = {block:0, item:null, count:0};
        buildWorldMesh();
        updateHotbar();
      }
    }
    return;
  }
  if (sel.count <= 0) return;
  const nx = target.x + Math.round(target.normal.x);
  const ny = target.y + Math.round(target.normal.y);
  const nz = target.z + Math.round(target.normal.z);
  if (getBlockSafe(nx, ny, nz) !== 0) return;
  const ppx = Math.floor(player.pos.x), ppz = Math.floor(player.pos.z);
  const ppy = Math.floor(player.pos.y), ppyH = Math.floor(player.pos.y + 1);
  if (nx === ppx && nz === ppz && (ny === ppy || ny === ppyH)) { flashHint('Здесь ты стоишь'); return; }
  world.setBlock(nx, ny, nz, sel.block);
  sel.count--;
  if (sel.count <= 0) player.hotbar[player.selectedSlot] = {block:0, item:null, count:0};
  const pcx = Math.floor(nx / CHUNK_SIZE);
  const pcz = Math.floor(nz / CHUNK_SIZE);
  rebuildChunkAt(pcx, pcz);
  updateHotbar();
  soundPlace();
}

function getBlockSafe(x, y, z) {
  if (x<0||x>=WORLD_W||y<0||y>=WORLD_D||z<0||z>=WORLD_H) return -1;
  return world.getBlock(x, y, z);
}

// ═══════════════════════════════════════════════════════════
//  ИНВЕНТАРЬ
// ═══════════════════════════════════════════════════════════
function addItemToInventory(itemOrBlock, count) {
  const allSlots = [...player.hotbar, ...player.inventory];
  // Стек
  for (const s of allSlots) {
    if (typeof itemOrBlock === 'string' && s.item === itemOrBlock) { s.count += count; return true; }
    if (typeof itemOrBlock === 'number' && s.block === itemOrBlock && !s.item) { s.count += count; return true; }
  }
  // Пустой слот
  for (const s of player.hotbar) {
    if (s.count === 0) {
      if (typeof itemOrBlock === 'string') { s.block=0; s.item=itemOrBlock; s.count=count; }
      else { s.block=itemOrBlock; s.item=null; s.count=count; }
      return true;
    }
  }
  for (const s of player.inventory) {
    if (s.count === 0) {
      if (typeof itemOrBlock === 'string') { s.block=0; s.item=itemOrBlock; s.count=count; }
      else { s.block=itemOrBlock; s.item=null; s.count=count; }
      return true;
    }
  }
  return false;
}

function countItem(itemOrBlock) {
  let n = 0;
  for (const s of player.hotbar) {
    if (typeof itemOrBlock === 'string' && s.item === itemOrBlock) n += s.count;
    if (typeof itemOrBlock === 'number' && s.block === itemOrBlock && !s.item) n += s.count;
  }
  for (const s of player.inventory) {
    if (typeof itemOrBlock === 'string' && s.item === itemOrBlock) n += s.count;
    if (typeof itemOrBlock === 'number' && s.block === itemOrBlock && !s.item) n += s.count;
  }
  return n;
}

function removeItem(itemOrBlock, count) {
  let need = count;
  const removeFrom = (arr) => {
    for (let i = 0; i < arr.length && need > 0; i++) {
      const s = arr[i];
      const match = (typeof itemOrBlock === 'string' && s.item === itemOrBlock) ||
                    (typeof itemOrBlock === 'number' && s.block === itemOrBlock && !s.item);
      if (match) {
        const take = Math.min(need, s.count);
        s.count -= take; need -= take;
        if (s.count === 0) { s.block = 0; s.item = null; }
      }
    }
  };
  removeFrom(player.hotbar);
  removeFrom(player.inventory);
  return need === 0;
}

// ═══════════════════════════════════════════════════════════
//  ИКОНКИ
// ═══════════════════════════════════════════════════════════
function getItemIcon(itemKey) {
  const c = document.createElement('canvas');
  c.width = 38; c.height = 38;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  const it = ITEMS[itemKey];
  if (!it) return c;
  const color = it.color;
  const r = (color>>16)&0xff, g = (color>>8)&0xff, b = color&0xff;

  if (it.type === 'weapon' && !it.ranged) {
    cx.fillStyle = `rgb(${r},${g},${b})`;
    cx.fillRect(22, 4, 9, 20);
    cx.fillStyle = '#5a3a18';
    cx.fillRect(8, 20, 16, 4);
    cx.fillRect(6, 24, 11, 7);
    cx.fillStyle = 'rgba(255,255,255,0.4)';
    cx.fillRect(24, 6, 2, 16);
  } else if (it.type === 'weapon' && it.ranged) {
    cx.strokeStyle = `rgb(${r},${g},${b})`;
    cx.lineWidth = 3;
    cx.beginPath(); cx.arc(8, 19, 13, -Math.PI/2, Math.PI/2); cx.stroke();
    cx.strokeStyle = '#f0f0f0'; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(8, 6); cx.lineTo(8, 32); cx.stroke();
  } else if (it.type === 'tool') {
    cx.fillStyle = `rgb(${r},${g},${b})`;
    cx.fillRect(12, 4, 16, 7);
    cx.fillStyle = '#5a3a18'; cx.fillRect(18, 11, 4, 20);
  } else if (it.type === 'armor') {
    if (it.slot === 'helmet') {
      cx.fillStyle = `rgb(${r},${g},${b})`; cx.fillRect(8, 8, 22, 14);
      cx.fillStyle = 'rgba(0,0,0,0.4)'; cx.fillRect(11, 16, 16, 4);
    } else if (it.slot === 'chest') {
      cx.fillStyle = `rgb(${r},${g},${b})`; cx.fillRect(6, 8, 26, 22);
      cx.fillStyle = 'rgba(0,0,0,0.3)'; cx.fillRect(6, 16, 26, 2);
    } else {
      cx.fillStyle = `rgb(${r},${g},${b})`;
      cx.fillRect(8, 6, 9, 22); cx.fillRect(21, 6, 9, 22);
    }
  } else if (itemKey === 'arrow') {
    cx.fillStyle = '#8b5a2b'; cx.fillRect(4, 18, 26, 2);
    cx.fillStyle = '#f0f0f0'; cx.fillRect(26, 16, 7, 6);
    cx.fillStyle = '#d83a3a'; cx.fillRect(2, 16, 4, 6);
  } else if (itemKey === 'stick') {
    cx.fillStyle = '#8b5a2b'; cx.fillRect(16, 4, 4, 30);
  } else if (itemKey === 'torch') {
    cx.fillStyle = '#8b5a2b'; cx.fillRect(17, 14, 4, 20);
    cx.fillStyle = '#ffa500'; cx.fillRect(15, 4, 8, 12);
    cx.fillStyle = '#ffe85e'; cx.fillRect(17, 6, 4, 5);
  } else if (itemKey === 'feather') {
    cx.fillStyle = '#f0f0f0'; cx.fillRect(20, 4, 4, 24);
    cx.fillRect(16, 8, 8, 4); cx.fillRect(14, 12, 10, 4);
    cx.fillStyle = '#8b5a2b'; cx.fillRect(22, 26, 2, 8);
  } else if (itemKey === 'meat_raw' || itemKey === 'meat_cooked' || itemKey === 'rotten_flesh') {
    cx.fillStyle = `rgb(${r},${g},${b})`; cx.fillRect(8, 12, 22, 16);
    cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.fillRect(10, 14, 4, 4); cx.fillRect(20, 18, 4, 4);
    cx.fillStyle = '#f0f0f0'; cx.fillRect(6, 16, 4, 8);
  } else {
    cx.fillStyle = `rgb(${r},${g},${b})`; cx.fillRect(6, 6, 26, 26);
    cx.fillStyle = 'rgba(255,255,255,0.3)'; cx.fillRect(8, 8, 8, 8);
  }
  return c;
}

function getBlockIcon(blockId) {
  ensureAtlasBuilt();
  const c = document.createElement('canvas');
  c.width = 38; c.height = 38;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  if (blockId === 0) return c;
  
  // Получаем текстуры из атласа
  const textures = getBlockTextures(blockId);
  const topName = textures[2]; // top
  const sideName = textures[0]; // side
  
  // Получаем UV координаты из атласа
  const topUV = getTextureUV(topName);
  const sideUV = getTextureUV(sideName);
  
  // Рисуем иконку из атласа
  // Верх (ромб)
  const tileSize = ATLAS_SIZE / (ATLAS_SIZE / TILE_SIZE);
  cx.save();
  cx.translate(19, 12);
  cx.transform(1, -0.5, 1, 0.5, 0, 0);
  cx.drawImage(atlasCanvas, 
    topUV.u0 * ATLAS_SIZE, (1 - topUV.v1) * ATLAS_SIZE, 
    TILE_SIZE, TILE_SIZE, 
    -8, -8, 16, 16);
  cx.restore();
  // Левый бок
  cx.save();
  cx.translate(11, 16);
  cx.transform(1, 0.5, 0, 1, 0, 0);
  cx.drawImage(atlasCanvas, 
    sideUV.u0 * ATLAS_SIZE, (1 - sideUV.v1) * ATLAS_SIZE, 
    TILE_SIZE, TILE_SIZE, 
    0, 0, 16, 16);
  cx.fillStyle = 'rgba(0,0,0,0.25)'; cx.fillRect(0, 0, 16, 16);
  cx.restore();
  // Правый бок
  cx.save();
  cx.translate(27, 16);
  cx.transform(1, -0.5, 0, 1, 0, 0);
  cx.drawImage(atlasCanvas, 
    sideUV.u0 * ATLAS_SIZE, (1 - sideUV.v1) * ATLAS_SIZE, 
    TILE_SIZE, TILE_SIZE, 
    0, 0, 16, 16);
  cx.restore();
  return c;
}

// ═══════════════════════════════════════════════════════════
//  ХОТБАР
// ═══════════════════════════════════════════════════════════
const hotbarEl = document.getElementById('hotbar');

function drawSlot(slotEl, slotData, equipped) {
  slotEl.innerHTML = '';
  // Rarity bar
  if (slotData.item) {
    const it = ITEMS[slotData.item];
    if (it.rarity && it.rarity !== 'COMMON') {
      const bar = document.createElement('div');
      bar.className = 'rarity';
      bar.style.background = RARITY[it.rarity].hex;
      slotEl.appendChild(bar);
    }
  }
  if (slotData.block > 0) {
    const icon = document.createElement('canvas');
    icon.width = 38; icon.height = 38;
    icon.getContext('2d').drawImage(getBlockIcon(slotData.block), 0, 0);
    slotEl.appendChild(icon);
  } else if (slotData.item) {
    const icon = document.createElement('canvas');
    icon.width = 38; icon.height = 38;
    icon.getContext('2d').drawImage(getItemIcon(slotData.item), 0, 0);
    slotEl.appendChild(icon);
  }
  if (slotData.count > 1) {
    const cnt = document.createElement('div');
    cnt.className = 'count';
    cnt.textContent = slotData.count;
    slotEl.appendChild(cnt);
  }
  if (equipped) slotEl.classList.add('equipped');
  else slotEl.classList.remove('equipped');
}

function buildHotbar() {
  hotbarEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot' + (i === player.selectedSlot ? ' active' : '');
    slot.dataset.idx = i;
    const key = document.createElement('div');
    key.className = 'key'; key.textContent = i + 1;
    slot.appendChild(key);
    drawSlot(slot, player.hotbar[i]);
    slot.addEventListener('click', () => { player.selectedSlot = i; updateHotbar(); });
    hotbarEl.appendChild(slot);
  }
}

function updateHotbar() {
  const slots = hotbarEl.children;
  for (let i = 0; i < slots.length; i++) {
    slots[i].classList.toggle('active', i === player.selectedSlot);
    drawSlot(slots[i], player.hotbar[i]);
  }
}

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════
const hudEl = document.getElementById('hud');
const hintEl = document.getElementById('hint');
let hintTimer = null;

function flashHint(text) {
  hintEl.textContent = text;
  hintEl.classList.add('show');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hintEl.classList.remove('show'), 2000);
}

function updateHUD() {
  const sel = player.hotbar[player.selectedSlot];
  let selName = 'пусто';
  let rarityColor = '#fff';
  if (sel.block > 0) selName = BLOCKS[sel.block].name;
  else if (sel.item) {
    selName = ITEMS[sel.item].name;
    if (ITEMS[sel.item].rarity) rarityColor = RARITY[ITEMS[sel.item].rarity].hex;
  }
  hudEl.innerHTML = `X:<b>${player.pos.x.toFixed(1)}</b> Y:<b>${player.pos.y.toFixed(1)}</b> Z:<b>${player.pos.z.toFixed(1)}</b><br>В руке: <b style="color:${rarityColor}">${selName}</b>${sel.count>1?' x'+sel.count:''}`;
  const hb = document.getElementById('healthBar');
  const fb = document.getElementById('foodBar');
  hb.innerHTML = ''; fb.innerHTML = '';
  for (let i = 0; i < MAX_HEALTH; i++) {
    const h = document.createElement('div');
    h.className = 'heart' + (i < player.health ? ' full' : '');
    hb.appendChild(h);
  }
  for (let i = 0; i < MAX_FOOD; i++) {
    const f = document.createElement('div');
    f.className = 'food' + (i < player.food ? ' full' : '');
    fb.appendChild(f);
  }
  document.getElementById('manaFill').style.width = (player.mana / MAX_MANA * 100) + '%';
}

function updateHighlight() {
  const target = getTargetBlock();
  if (target) {
    highlightMesh.position.set(target.x+0.5, target.y+0.5, target.z+0.5);
    highlightMesh.visible = true;
  } else highlightMesh.visible = false;
}

function damagePlayer(dmg) {
  let def = 0;
  if (player.equip.helmet) def += ITEMS[player.equip.helmet].def;
  if (player.equip.chest) def += ITEMS[player.equip.chest].def;
  if (player.equip.boots) def += ITEMS[player.equip.boots].def;
  const realDmg = Math.max(1, dmg - Math.floor(def / 2));
  player.health = Math.max(0, player.health - realDmg);
  flashHint('💔 -' + realDmg + ' HP');
  soundDamage();
  if (player.health === 0) {
    flashHint('💀 Ты погиб! Респаун...');
    setTimeout(() => {
      player.health = MAX_HEALTH;
      player.food = MAX_FOOD;
      player.mana = MAX_MANA;
      findSpawn();
    }, 1500);
  }
}

function eatFood() {
  const sel = player.hotbar[player.selectedSlot];
  if (!sel.item || ITEMS[sel.item].type !== 'food') return;
  const heal = ITEMS[sel.item].heal;
  player.food = Math.min(MAX_FOOD, player.food + heal);
  if (sel.item === 'golden_apple') player.health = Math.min(MAX_HEALTH, player.health + 5);
  flashHint('🍖 +' + heal + ' голод' + (sel.item === 'golden_apple' ? ' +5 HP' : ''));
  sel.count--;
  if (sel.count <= 0) player.hotbar[player.selectedSlot] = {block:0, item:null, count:0};
  updateHotbar();
}

// ═══════════════════════════════════════════════════════════
//  ИНВЕНТАРЬ / КРАФТ UI
// ═══════════════════════════════════════════════════════════
const invEl = document.getElementById('inventory');

function openInventory() {
  inInventory = true;
  invEl.classList.add('show');
  if (document.exitPointerLock) document.exitPointerLock();
  const px = Math.floor(player.pos.x), pz = Math.floor(player.pos.z);
  let nearTable = false;
  for (const s of world.structures) {
    if (s.type === 'crafting' && Math.abs(s.x - px) <= 4 && Math.abs(s.z - pz) <= 4) { nearTable = true; break; }
  }
  document.getElementById('invTitle').textContent = nearTable ? 'Крафт-стол (полный крафт 3×3)' : 'Инвентарь (нужен крафт-стол рядом для 3×3)';
  renderInventory();
  renderRecipes();
}

function closeInventory() {
  inInventory = false;
  invEl.classList.remove('show');
  for (let i = 0; i < 9; i++) {
    const s = player.craftGrid[i];
    if (s.block > 0) addItemToInventory(s.block, s.count);
    else if (s.item) addItemToInventory(s.item, s.count);
    player.craftGrid[i] = {block:0, item:null, count:0};
  }
}

function renderInventory() {
  const invGrid = document.getElementById('invGrid');
  invGrid.innerHTML = '';
  for (let i = 0; i < 27; i++) {
    const slotEl = document.createElement('div');
    slotEl.className = 'invSlot';
    const slot = player.inventory[i];
    drawInvSlot(slotEl, slot);
    slotEl.addEventListener('click', (e) => onInvSlotClick(i, e.shiftKey));
    invGrid.appendChild(slotEl);
  }
  const craftSlots = document.querySelectorAll('#craftGrid .craftSlot');
  craftSlots.forEach((el, i) => {
    el.innerHTML = '';
    drawInvSlot(el, player.craftGrid[i]);
    el.addEventListener('click', () => onCraftSlotClick(i));
  });
  updateCraftResult();
  renderEquip();
}

function drawInvSlot(slotEl, slotData) {
  slotEl.innerHTML = '';
  if (slotData.item) {
    const it = ITEMS[slotData.item];
    if (it.rarity && it.rarity !== 'COMMON') {
      const bar = document.createElement('div');
      bar.className = 'rarity';
      bar.style.background = RARITY[it.rarity].hex;
      slotEl.appendChild(bar);
    }
  }
  if (slotData.block > 0) {
    const icon = document.createElement('canvas');
    icon.width = 38; icon.height = 38;
    icon.getContext('2d').drawImage(getBlockIcon(slotData.block), 0, 0);
    slotEl.appendChild(icon);
  } else if (slotData.item) {
    const icon = document.createElement('canvas');
    icon.width = 38; icon.height = 38;
    icon.getContext('2d').drawImage(getItemIcon(slotData.item), 0, 0);
    slotEl.appendChild(icon);
  }
  if (slotData.count > 1) {
    const cnt = document.createElement('div');
    cnt.className = 'count'; cnt.textContent = slotData.count;
    slotEl.appendChild(cnt);
  }
}

function renderEquip() {
  let totalDmg = 1; // кулак
  let totalDef = 0;

  ['weapon','helmet','chest','boots'].forEach(slot => {
    const el = document.getElementById('eq-' + slot);
    el.innerHTML = '';
    el.classList.remove('equipped');

    if (player.equip[slot]) {
      const itemKey = player.equip[slot];
      const it = ITEMS[itemKey];
      el.classList.add('equipped');

      // Rarity bar
      if (it.rarity && it.rarity !== 'COMMON') {
        const bar = document.createElement('div');
        bar.className = 'rarity-bar';
        bar.style.background = RARITY[it.rarity].hex;
        el.appendChild(bar);
      }

      const icon = document.createElement('canvas');
      icon.width = 40; icon.height = 40;
      icon.getContext('2d').drawImage(getItemIcon(itemKey), 0, 0);
      el.appendChild(icon);

      // Считаем статы
      if (it.type === 'weapon' && it.dmg) totalDmg = Math.max(totalDmg, it.dmg);
      if (it.type === 'armor' && it.def) totalDef += it.def;
    }

    el.onclick = () => {
      if (player.equip[slot]) {
        if (addItemToInventory(player.equip[slot], 1)) {
          flashHint('Снято: ' + ITEMS[player.equip[slot]].name);
          player.equip[slot] = null;
          renderEquip();
          updateHotbar();
        }
      }
    };
  });

  // Обновляем статы
  const dmgEl = document.getElementById('stat-dmg');
  const defEl = document.getElementById('stat-def');
  const hpEl = document.getElementById('stat-hp');
  if (dmgEl) dmgEl.textContent = totalDmg;
  if (defEl) defEl.textContent = totalDef;
  if (hpEl) hpEl.textContent = player.health + '/' + MAX_HEALTH;
}

function onInvSlotClick(idx, shift) {
  const slot = player.inventory[idx];
  if (shift && (slot.item || slot.block > 0)) {
    if (slot.item) {
      const it = ITEMS[slot.item];
      if (it.type === 'armor') {
        const slotName = it.slot;
        if (player.equip[slotName]) addItemToInventory(player.equip[slotName], 1);
        player.equip[slotName] = slot.item;
        slot.count--;
        if (slot.count <= 0) player.inventory[idx] = {block:0, item:null, count:0};
        flashHint('Надето: ' + it.name);
        renderInventory(); updateHotbar();
        return;
      }
      if (it.type === 'weapon') {
        if (player.equip.weapon) addItemToInventory(player.equip.weapon, 1);
        player.equip.weapon = slot.item;
        slot.count--;
        if (slot.count <= 0) player.inventory[idx] = {block:0, item:null, count:0};
        flashHint('Взято: ' + it.name);
        renderInventory(); updateHotbar();
        return;
      }
      if (it.type === 'food') {
        player.food = Math.min(MAX_FOOD, player.food + it.heal);
        slot.count--;
        if (slot.count <= 0) player.inventory[idx] = {block:0, item:null, count:0};
        flashHint('Съедено: +' + it.heal);
        soundPickup();
        renderInventory();
        return;
      }
    }
  }
  if (slot.block > 0 || slot.item) {
    for (let i = 0; i < 9; i++) {
      if (player.hotbar[i].count === 0) {
        player.hotbar[i] = {...slot};
        player.inventory[idx] = {block:0, item:null, count:0};
        renderInventory(); updateHotbar();
        return;
      }
    }
    flashHint('Хотбар полон');
  }
}

function onCraftSlotClick(i) {
  const slot = player.craftGrid[i];
  if (slot.block > 0 || slot.item) {
    if (slot.block > 0) addItemToInventory(slot.block, slot.count);
    else addItemToInventory(slot.item, slot.count);
    player.craftGrid[i] = {block:0, item:null, count:0};
    renderInventory(); updateHotbar();
  } else {
    for (let j = 0; j < 27; j++) {
      const s = player.inventory[j];
      if (s.block > 0 || s.item) {
        player.craftGrid[i] = s.block > 0 ? {block:s.block, item:null, count:1} : {block:0, item:s.item, count:1};
        s.count--;
        if (s.count <= 0) player.inventory[j] = {block:0, item:null, count:0};
        renderInventory(); updateHotbar();
        return;
      }
    }
    for (let j = 0; j < 9; j++) {
      const s = player.hotbar[j];
      if (s.block > 0 || s.item) {
        player.craftGrid[i] = s.block > 0 ? {block:s.block, item:null, count:1} : {block:0, item:s.item, count:1};
        s.count--;
        if (s.count <= 0) player.hotbar[j] = {block:0, item:null, count:0};
        renderInventory(); updateHotbar();
        return;
      }
    }
  }
}

function matchRecipe(recipe) {
  const grid = player.craftGrid;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      const ch = recipe.pattern[i][j];
      const slot = grid[idx];
      if (ch === ' ') {
        if (slot.block > 0 || slot.item) return false;
      } else {
        const want = recipe.keys[ch];
        if (typeof want === 'number') {
          if (slot.block !== want || slot.item) return false;
        } else {
          if (slot.item !== want || slot.block > 0) return false;
        }
      }
    }
  }
  return true;
}

function updateCraftResult() {
  const resultEl = document.getElementById('resultSlot');
  resultEl.innerHTML = '';
  for (const r of RECIPES) {
    if (matchRecipe(r)) {
      const icon = document.createElement('canvas');
      icon.width = 42; icon.height = 42;
      if (typeof r.result === 'number') icon.getContext('2d').drawImage(getBlockIcon(r.result), 0, 0, 42, 42);
      else icon.getContext('2d').drawImage(getItemIcon(r.result), 0, 0, 42, 42);
      resultEl.appendChild(icon);
      if (r.count > 1) {
        const cnt = document.createElement('div');
        cnt.className = 'count'; cnt.textContent = r.count;
        resultEl.appendChild(cnt);
      }
      resultEl.onclick = () => doCraft(r);
      return;
    }
  }
  resultEl.onclick = null;
}

function doCraft(recipe) {
  if (!matchRecipe(recipe)) return;
  for (let i = 0; i < 9; i++) {
    const s = player.craftGrid[i];
    if (s.block > 0 || s.item) {
      s.count--;
      if (s.count <= 0) player.craftGrid[i] = {block:0, item:null, count:0};
    }
  }
  addItemToInventory(recipe.result, recipe.count);
  flashHint('✓ Скрафчено: ' + (typeof recipe.result === 'string' ? ITEMS[recipe.result].name : BLOCKS[recipe.result].name) + ' x' + recipe.count);
  soundCraft();
  renderInventory(); updateHotbar();
}

function renderRecipes() {
  const listEl = document.getElementById('recipeList');
  listEl.innerHTML = '';
  RECIPES.forEach(r => {
    const div = document.createElement('div');
    div.className = 'recipe';
    const icon = document.createElement('canvas');
    icon.width = 26; icon.height = 26;
    if (typeof r.result === 'number') icon.getContext('2d').drawImage(getBlockIcon(r.result), 0, 0, 26, 26);
    else icon.getContext('2d').drawImage(getItemIcon(r.result), 0, 0, 26, 26);
    div.appendChild(icon);
    const name = document.createElement('div');
    name.className = 'name';
    const itName = typeof r.result === 'string' ? ITEMS[r.result].name : BLOCKS[r.result].name;
    name.textContent = itName + ' x' + r.count;
    div.appendChild(name);
    // Rarity tag
    if (typeof r.result === 'string' && ITEMS[r.result].rarity && ITEMS[r.result].rarity !== 'COMMON') {
      const tag = document.createElement('div');
      tag.className = 'rarity-tag';
      tag.style.background = RARITY[ITEMS[r.result].rarity].hex;
      tag.style.color = '#000';
      tag.textContent = RARITY[ITEMS[r.result].rarity].name;
      div.appendChild(tag);
    }
    const canCraft = checkRecipeResources(r);
    const status = document.createElement('div');
    status.className = 'can';
    status.textContent = canCraft ? '✓' : '✗';
    if (!canCraft) status.style.color = '#aa2a2a';
    div.appendChild(status);
    div.addEventListener('click', () => autoFillRecipe(r));
    listEl.appendChild(div);
  });
}

function checkRecipeResources(recipe) {
  for (const ch in recipe.keys) {
    const want = recipe.keys[ch];
    let need = 0;
    for (const row of recipe.pattern) for (const c of row) if (c === ch) need++;
    if (countItem(want) < need) return false;
  }
  return true;
}

function autoFillRecipe(recipe) {
  for (let i = 0; i < 9; i++) {
    const s = player.craftGrid[i];
    if (s.block > 0) addItemToInventory(s.block, s.count);
    else if (s.item) addItemToInventory(s.item, s.count);
    player.craftGrid[i] = {block:0, item:null, count:0};
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ch = recipe.pattern[i][j];
      const idx = i * 3 + j;
      if (ch === ' ') continue;
      const want = recipe.keys[ch];
      if (countItem(want) > 0) {
        removeItem(want, 1);
        if (typeof want === 'number') player.craftGrid[idx] = {block:want, item:null, count:1};
        else player.craftGrid[idx] = {block:0, item:want, count:1};
      }
    }
  }
  renderInventory(); updateHotbar();
}

// ═══════════════════════════════════════════════════════════
//  МОБЫ
// ═══════════════════════════════════════════════════════════
const mobs = [];

// Кэш материалов для мобов (2 материала: непрозрачный и светящийся для боссов)
const mobMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
const mobGlowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.3 });

// Вспомогательная функция: добавляет box в массивы вершин
function addBoxToArrays(positions, normals, colors, x, y, z, w, h, d, color) {
  const r = ((color >> 16) & 0xff) / 255;
  const g = ((color >> 8) & 0xff) / 255;
  const b = (color & 0xff) / 255;
  
  const x0 = x - w/2, x1 = x + w/2;
  const y0 = y - h/2, y1 = y + h/2;
  const z0 = z - d/2, z1 = z + d/2;
  
  // 6 граней, 4 вершины каждая
  const faces = [
    // +X
    { n: [1,0,0], v: [[x1,y0,z0],[x1,y1,z0],[x1,y0,z1],[x1,y1,z1]] },
    // -X
    { n: [-1,0,0], v: [[x0,y0,z1],[x0,y1,z1],[x0,y0,z0],[x0,y1,z0]] },
    // +Y
    { n: [0,1,0], v: [[x0,y1,z1],[x1,y1,z1],[x0,y1,z0],[x1,y1,z0]] },
    // -Y
    { n: [0,-1,0], v: [[x0,y0,z0],[x1,y0,z0],[x0,y0,z1],[x1,y0,z1]] },
    // +Z
    { n: [0,0,1], v: [[x1,y0,z1],[x1,y1,z1],[x0,y0,z1],[x0,y1,z1]] },
    // -Z
    { n: [0,0,-1], v: [[x0,y0,z0],[x0,y1,z0],[x1,y0,z0],[x1,y1,z0]] },
  ];
  
  for (const f of faces) {
    for (const v of f.v) {
      positions.push(v[0], v[1], v[2]);
      normals.push(f.n[0], f.n[1], f.n[2]);
      colors.push(r, g, b);
    }
  }
}

function makeMobMesh(mobType) {
  const def = MOBS[mobType];
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  
  const [bw, bh, bd] = def.size;
  
  // Тело
  addBoxToArrays(positions, normals, colors, 0, bh / 2, 0, bw, bh, bd * 0.5, def.bodyColor);
  
  // Голова
  const hs = def.headSize || bw * 0.7;
  if (hs > 0) {
    addBoxToArrays(positions, normals, colors, 0, bh + hs/2 - 0.2, bd * 0.25, hs, hs, hs, def.headColor);
    // Глаза
    const eyeColor = def.hostile ? 0xff0000 : 0x000000;
    addBoxToArrays(positions, normals, colors, -hs*0.3, bh + hs*0.1, bd * 0.25 + hs/2, 0.1, 0.1, 0.06, eyeColor);
    addBoxToArrays(positions, normals, colors, hs*0.3, bh + hs*0.1, bd * 0.25 + hs/2, 0.1, 0.1, 0.06, eyeColor);
    // Корона для боссов
    if (def.boss) {
      addBoxToArrays(positions, normals, colors, 0, bh + hs * 0.7, bd * 0.25, hs * 1.2, 0.2, hs * 1.2, 0xffd700);
    }
  }
  
  // Ноги
  if (def.hasLegs !== false) {
    addBoxToArrays(positions, normals, colors, -bw * 0.25, bh * 0.25, 0, bw * 0.3, bh * 0.5, bd * 0.3, def.headColor);
    addBoxToArrays(positions, normals, colors, bw * 0.25, bh * 0.25, 0, bw * 0.3, bh * 0.5, bd * 0.3, def.headColor);
  }
  
  // Хвост (если есть)
  if (def.hasTail) {
    addBoxToArrays(positions, normals, colors, 0, bh * 0.6, -bd * 0.3, 0.15, 0.15, bd * 0.4, def.bodyColor);
  }
  
  // Уши (если есть)
  if (def.hasEars) {
    addBoxToArrays(positions, normals, colors, -hs*0.4, bh + hs*0.7, bd * 0.25, 0.15, 0.25, 0.1, def.headColor);
    addBoxToArrays(positions, normals, colors, hs*0.4, bh + hs*0.7, bd * 0.25, 0.15, 0.25, 0.1, def.headColor);
  }
  
  // Рога (если есть)
  if (def.hasHorns) {
    addBoxToArrays(positions, normals, colors, -hs*0.35, bh + hs*0.8, bd * 0.25, 0.1, 0.2, 0.1, 0xeeeedd);
    addBoxToArrays(positions, normals, colors, hs*0.35, bh + hs*0.8, bd * 0.25, 0.1, 0.2, 0.1, 0xeeeedd);
  }
  
  // Клыки (если есть)
  if (def.hasTusks) {
    addBoxToArrays(positions, normals, colors, -hs*0.15, bh - 0.1, bd * 0.25 + hs/2, 0.08, 0.15, 0.08, 0xeeeedd);
    addBoxToArrays(positions, normals, colors, hs*0.15, bh - 0.1, bd * 0.25 + hs/2, 0.08, 0.15, 0.08, 0xeeeedd);
  }
  
  // Грива (если есть)
  if (def.hasMane) {
    addBoxToArrays(positions, normals, colors, 0, bh * 0.8, -bd * 0.1, bw * 1.1, bh * 0.4, bd * 0.2, 0x8a5a2a);
  }
  
  // Клюв (для уток, попугаев и т.д.)
  if (def.hasBeak) {
    addBoxToArrays(positions, normals, colors, 0, bh + hs * 0.15, bd * 0.25 + hs / 2 + 0.05, 0.15, 0.08, 0.15, 0xe8a020);
  }
  
  // Крылья (для птиц)
  if (def.hasWings) {
    addBoxToArrays(positions, normals, colors, -bw * 0.7, bh * 0.6, 0, 0.1, bh * 0.5, bd * 0.4, def.bodyColor);
    addBoxToArrays(positions, normals, colors, bw * 0.7, bh * 0.6, 0, 0.1, bh * 0.5, bd * 0.4, def.bodyColor);
  }
  
  // Хобот (для слона)
  if (def.hasTrunk) {
    addBoxToArrays(positions, normals, colors, 0, bh * 0.5, bd * 0.4, 0.15, bh * 0.5, 0.15, def.headColor);
  }
  
  // Горб (для верблюда)
  if (def.hasHump) {
    addBoxToArrays(positions, normals, colors, 0, bh * 1.1, 0, bw * 0.7, bh * 0.4, bd * 0.3, def.bodyColor);
  }
  
  // Пятна (для жирафа, ягуара, гиены)
  if (def.hasSpots) {
    for (let i = 0; i < 5; i++) {
      addBoxToArrays(positions, normals, colors, 
        (Math.random()-0.5) * bw, 
        bh * 0.3 + Math.random() * bh * 0.5, 
        (Math.random()-0.5) * bd * 0.3, 
        0.08, 0.08, 0.08, 0x2a1a08);
    }
  }
  
  // Длинная шея (для жирафа)
  if (def.hasLongNeck) {
    addBoxToArrays(positions, normals, colors, 0, bh * 1.5, 0, 0.2, bh * 0.8, 0.2, def.bodyColor);
  }
  
  // Раковина (для черепахи)
  if (def.hasShell) {
    addBoxToArrays(positions, normals, colors, 0, bh * 0.8, 0, bw * 1.2, bh * 0.5, bd * 1.0, 0x3a5a2a);
  }
  
  // Индексы
  const vertexCount = positions.length / 3;
  for (let i = 0; i < vertexCount; i += 4) {
    indices.push(i, i + 1, i + 2, i + 2, i + 1, i + 3);
  }
  
  // Создаём geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  
  const mesh = new THREE.Mesh(geometry, mobMaterial);
  mesh.frustumCulled = true;
  
  // Для боссов — масштаб + свечение
  if (def.boss) {
    mesh.scale.set(1.5, 1.5, 1.5);
  }
  
  return mesh;
}

function spawnMob(type, x, y, z) {
  const def = MOBS[type];
  if (!def) return;
  const mesh = makeMobMesh(type);
  mesh.position.set(x, y, z);
  if (def.boss) {
    mesh.scale.set(1.5, 1.5, 1.5);
  }
  scene.add(mesh);
  mobs.push({
    type, mesh, def,
    pos: new THREE.Vector3(x, y, z),
    vel: new THREE.Vector3(),
    hp: def.hp, maxHp: def.hp,
    onGround: false,
    lastAttack: 0,
    wanderDir: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(),
    wanderTimer: 0,
    hitFlash: 0,
  });
}

function spawnInitialMobs() {
  // По чанкам вокруг спавна
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(Math.random() * WORLD_W);
    const z = Math.floor(Math.random() * WORLD_H);
    const biome = getBiomeAt(x, z);
    let surfY = 1;
    for (let y = WORLD_D-1; y >= 1; y--) {
      const b = world.getBlock(x, y, z);
      if (b > 0 && BLOCKS[b].solid) { surfY = y + 1; break; }
    }
    if (biome.mobTypes && biome.mobTypes.length > 0 && surfY < WORLD_D - 2) {
      const type = biome.mobTypes[Math.floor(Math.random() * biome.mobTypes.length)];
      spawnMob(type, x + 0.5, surfY, z + 0.5);
    }
  }
  // Рыба и утки в озере (центр карты, радиус 18)
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 16;
    const x = 128 + Math.floor(Math.cos(angle) * dist);
    const z = 128 + Math.floor(Math.sin(angle) * dist);
    // Найти уровень воды
    let waterY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) {
      if (world.getBlock(x, y, z) === 16) { waterY = y; break; }
    }
    if (waterY > 0) {
      spawnMob(Math.random() < 0.6 ? 'fish' : 'duck', x + 0.5, waterY, z + 0.5);
    }
  }
  // Рыба в реке
  for (let i = 0; i < 10; i++) {
    const x = 75 + Math.floor(Math.random() * 50);
    const z = 125 + Math.floor(Math.random() * 6) - 3;
    let waterY = 0;
    for (let y = WORLD_D-1; y >= 0; y--) {
      if (world.getBlock(x, y, z) === 16) { waterY = y; break; }
    }
    if (waterY > 0) spawnMob('fish', x + 0.5, waterY, z + 0.5);
  }
  // Боссы — по 2 на биом
  for (const biomeKey in BIOMES) {
    const biome = BIOMES[biomeKey];
    if (!biome.bossType) continue;
    for (let i = 0; i < 2; i++) {
      let tries = 30;
      while (tries-- > 0) {
        const x = Math.floor(Math.random() * WORLD_W);
        const z = Math.floor(Math.random() * WORLD_H);
        const b = getBiomeAt(x, z);
        if (b.id === biome.id) {
          let surfY = 1;
          for (let y = WORLD_D-1; y >= 1; y--) {
            const bb = world.getBlock(x, y, z);
            if (bb > 0 && BLOCKS[bb].solid) { surfY = y + 1; break; }
          }
          if (surfY < WORLD_D - 2) {
            spawnMob(biome.bossType, x + 0.5, surfY, z + 0.5);
            break;
          }
        }
      }
    }
  }
}

function updateMobs(dt) {
  for (let i = mobs.length - 1; i >= 0; i--) {
    const m = mobs[i];
    // Hit flash — меняем масштаб материала (так как vertexColors, emissive не работает)
    if (m.hitFlash > 0) {
      m.hitFlash -= dt;
      // Пропускаем — flash будет через opacity или scale
    }

    // Mob AI culling — обновляем только мобов в радиусе 40 блоков
    const distToPlayer = m.pos.distanceTo(player.pos);
    if (distToPlayer > 50) {
      // Дальний моб — только гравитация, без AI
      m.vel.y -= GRAVITY * dt;
      const newY = m.pos.y + m.vel.y * dt;
      if (!isSolidAt(m.pos.x, newY, m.pos.z)) {
        m.pos.y = newY;
        m.onGround = false;
      } else {
        if (m.vel.y < 0) m.pos.y = Math.floor(newY) + 1;
        m.vel.y = 0;
        m.onGround = true;
      }
      if (m.pos.y < -5) {
        scene.remove(m.mesh);
        mobs.splice(i, 1);
        continue;
      }
      m.mesh.position.copy(m.pos);
      continue;
    }

    m.wanderTimer -= dt;
    if (m.wanderTimer <= 0) {
      m.wanderDir = new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5);
      if (m.wanderDir.lengthSq() > 0) m.wanderDir.normalize();
      m.wanderTimer = 2 + Math.random() * 3;
    }

    let targetPos = null;
    if (m.def.hostile) {
      const distToPlayer = m.pos.distanceTo(player.pos);
      if (distToPlayer < 15) {
        targetPos = player.pos;
        if (distToPlayer < (m.def.attackRange || 1.5) && Date.now() - m.lastAttack > 1000) {
          damagePlayer(m.def.attackDmg);
          m.lastAttack = Date.now();
        }
      }
    }

    const moveDir = targetPos ? new THREE.Vector3().subVectors(targetPos, m.pos).setY(0) : m.wanderDir;
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      const speed = m.def.speed * dt;
      const newX = m.pos.x + moveDir.x * speed;
      const newZ = m.pos.z + moveDir.z * speed;
      if (!isSolidAt(newX, m.pos.y, m.pos.z) && newX > 0.5 && newX < WORLD_W-0.5) m.pos.x = newX;
      if (!isSolidAt(m.pos.x, m.pos.y, newZ) && newZ > 0.5 && newZ < WORLD_H-0.5) m.pos.z = newZ;
      if (isSolidAt(m.pos.x, m.pos.y - 0.1, m.pos.z + moveDir.z) && m.onGround) m.vel.y = 6;
      m.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    }

    m.vel.y -= GRAVITY * dt;
    const newY = m.pos.y + m.vel.y * dt;
    if (!isSolidAt(m.pos.x, newY, m.pos.z)) {
      m.pos.y = newY;
      m.onGround = false;
    } else {
      if (m.vel.y < 0) m.pos.y = Math.floor(newY) + 1;
      m.vel.y = 0;
      m.onGround = true;
    }

    if (m.pos.y < -5) {
      scene.remove(m.mesh);
      mobs.splice(i, 1);
      continue;
    }

    m.mesh.position.copy(m.pos);
  }
}

function attackMob() {
  let closestMob = null, closestDist = REACH;
  for (const m of mobs) {
    const dist = m.pos.distanceTo(camera.position);
    if (dist > REACH) continue;
    const dir = new THREE.Vector3().subVectors(m.pos, camera.position).normalize();
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    if (dir.dot(camDir) > 0.7 && dist < closestDist) {
      closestMob = m;
      closestDist = dist;
    }
  }
  if (!closestMob) return;
  let dmg = 1;
  const sel = player.hotbar[player.selectedSlot];
  if (sel.item && ITEMS[sel.item].type === 'weapon' && !ITEMS[sel.item].ranged) {
    dmg = ITEMS[sel.item].dmg;
    if (ITEMS[sel.item].critChance && Math.random() < ITEMS[sel.item].critChance) {
      dmg *= 2;
      flashHint('💥 КРИТ! x2 урон');
    }
    sel.durability = (sel.durability || 60) - 1;
    if (sel.durability <= 0) {
      flashHint('Сломалось: ' + ITEMS[sel.item].name);
      player.hotbar[player.selectedSlot] = {block:0, item:null, count:0};
    }
  } else if (player.equip.weapon) {
    dmg = ITEMS[player.equip.weapon].dmg;
    if (ITEMS[player.equip.weapon].critChance && Math.random() < ITEMS[player.equip.weapon].critChance) {
      dmg *= 2;
      flashHint('💥 КРИТ! x2 урон');
    }
  }
  closestMob.hp -= dmg;
  closestMob.hitFlash = 0.2;
  flashHint('⚔ ' + closestMob.def.name + ' -' + dmg + ' HP (' + Math.max(0,closestMob.hp) + '/' + closestMob.maxHp + ')');
  soundHit();
  const pushDir = new THREE.Vector3().subVectors(closestMob.pos, player.pos).setY(0).normalize();
  closestMob.pos.add(pushDir.multiplyScalar(0.8));
  closestMob.vel.y = 4;
  if (closestMob.hp <= 0) {
    for (const d of closestMob.def.drops) {
      const n = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
      if (n > 0) {
        addItemToInventory(d.item, n);
        flashHint('+ ' + n + 'x ' + (ITEMS[d.item] ? ITEMS[d.item].name : d.item));
      }
    }
    if (closestMob.def.boss) {
      flashHint('🏆 БОСС ПОВЕРЖЕН: ' + closestMob.def.name + '!');
      soundBossKill();
    } else {
      soundMobDeath();
    }
    scene.remove(closestMob.mesh);
    mobs.splice(mobs.indexOf(closestMob), 1);
  }
  updateHotbar();
}

function tryPickup() {
  flashHint('Лут падает прямо в инвентарь');
}

// ═══════════════════════════════════════════════════════════
//  КАРТЫ
// ═══════════════════════════════════════════════════════════
const minimapCanvas = document.querySelector('#minimap canvas');
const minimapCtx = minimapCanvas.getContext('2d');
const bigmapCanvas = document.getElementById('bigmapCanvas');
const bigmapCtx = bigmapCanvas.getContext('2d');

function getBiomeColor(biome) { return biome.mapColor; }

function renderMinimap() {
  const ctx = minimapCtx;
  const size = 220;
  const range = 40;
  ctx.clearRect(0, 0, size, size);
  const px = Math.floor(player.pos.x), pz = Math.floor(player.pos.z);
  for (let dx = -range/2; dx < range/2; dx++) {
    for (let dz = -range/2; dz < range/2; dz++) {
      const x = px + Math.floor(dx), z = pz + Math.floor(dz);
      if (x < 0 || x >= WORLD_W || z < 0 || z >= WORLD_H) continue;
      const biome = getBiomeAt(x, z);
      let color = biome.mapColor;
      let topY = 0;
      for (let y = WORLD_D-1; y >= 0; y--) { if (world.getBlock(x, z, y) > 0) { topY = y; break; } }
      const block = world.getBlock(x, z, topY);
      if (block === 16) color = '#3a6ea8';
      ctx.fillStyle = color;
      const s = size / range;
      ctx.fillRect((dx + range/2) * s, (dz + range/2) * s, s + 1, s + 1);
    }
  }
  // Игрок (крупная стрелка)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  const cx = size/2, cy = size/2;
  const angle = yaw;
  ctx.moveTo(cx + Math.sin(angle)*8, cy - Math.cos(angle)*8);
  ctx.lineTo(cx + Math.sin(angle+2.5)*5, cy - Math.cos(angle+2.5)*5);
  ctx.lineTo(cx + Math.sin(angle-2.5)*5, cy - Math.cos(angle-2.5)*5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Крафт-столы (крупные жёлтые квадраты)
  for (const s of world.structures) {
    if (s.type !== 'crafting') continue;
    const dx = s.x - px, dz = s.z - pz;
    if (Math.abs(dx) < range/2 && Math.abs(dz) < range/2) {
      const s2 = size / range;
      ctx.fillStyle = '#ffd95e';
      ctx.fillRect((dx + range/2) * s2 - 3, (dz + range/2) * s2 - 3, 6, 6);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect((dx + range/2) * s2 - 3, (dz + range/2) * s2 - 3, 6, 6);
    }
  }
  // Сундуки (крупные голубые)
  for (const s of world.structures) {
    if (s.type !== 'chest') continue;
    const dx = s.x - px, dz = s.z - pz;
    if (Math.abs(dx) < range/2 && Math.abs(dz) < range/2) {
      const s2 = size / range;
      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect((dx + range/2) * s2 - 2, (dz + range/2) * s2 - 2, 5, 5);
    }
  }
  // Дома (бордовые)
  for (const s of world.structures) {
    if (!['house','cabin','pyramid','jungle_temple','ice_castle','witch_hut','shipwreck'].includes(s.type)) continue;
    const dx = s.x - px, dz = s.z - pz;
    if (Math.abs(dx) < range/2 && Math.abs(dz) < range/2) {
      const s2 = size / range;
      ctx.fillStyle = '#a8432a';
      ctx.fillRect((dx + range/2) * s2 - 3, (dz + range/2) * s2 - 3, 6, 6);
    }
  }
  // Подземелья (тёмные)
  for (const s of world.structures) {
    if (s.type !== 'dungeon') continue;
    const dx = s.x - px, dz = s.z - pz;
    if (Math.abs(dx) < range/2 && Math.abs(dz) < range/2) {
      const s2 = size / range;
      ctx.fillStyle = '#5a3a18';
      ctx.fillRect((dx + range/2) * s2 - 3, (dz + range/2) * s2 - 3, 6, 6);
    }
  }
  // Мобы (крупные)
  for (const m of mobs) {
    const dx = m.pos.x - px, dz = m.pos.z - pz;
    if (Math.abs(dx) < range/2 && Math.abs(dz) < range/2) {
      const s2 = size / range;
      ctx.fillStyle = m.def.hostile ? (m.def.boss ? '#ff00ff' : '#ff3b3b') : '#7cba34';
      const sz = m.def.boss ? 6 : 4;
      ctx.fillRect((dx + range/2) * s2 - sz/2, (dz + range/2) * s2 - sz/2, sz, sz);
    }
  }
}

function renderBigMap() {
  const ctx = bigmapCtx;
  const size = 640;
  const scale = size / WORLD_W;
  ctx.clearRect(0, 0, size, size);
  // Биомы
  for (let x = 0; x < WORLD_W; x++) {
    for (let z = 0; z < WORLD_H; z++) {
      const biome = getBiomeAt(x, z);
      ctx.fillStyle = biome.mapColor;
      ctx.fillRect(x * scale, z * scale, scale + 0.5, scale + 0.5);
    }
  }
  // Структуры — крупные отметки
  for (const s of world.structures) {
    let color = '#fff', sz = 6;
    if (s.type === 'crafting') { color = '#ffd95e'; sz = 8; }
    else if (s.type === 'chest') { color = '#4dd0e1'; sz = 8; }
    else if (s.type === 'house' || s.type === 'cabin') { color = '#a8432a'; sz = 10; }
    else if (s.type === 'pyramid' || s.type === 'jungle_temple' || s.type === 'ice_castle' || s.type === 'witch_hut' || s.type === 'shipwreck') { color = '#ff8a3a'; sz = 12; }
    else if (s.type === 'dungeon') { color = '#5a3a18'; sz = 10; }
    ctx.fillStyle = color;
    ctx.fillRect(s.x * scale - sz/2, s.z * scale - sz/2, sz, sz);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x * scale - sz/2, s.z * scale - sz/2, sz, sz);
  }
  // Мобы
  for (const m of mobs) {
    ctx.fillStyle = m.def.hostile ? (m.def.boss ? '#ff00ff' : '#ff3b3b') : '#7cba34';
    const sz = m.def.boss ? 8 : 4;
    ctx.fillRect(m.pos.x * scale - sz/2, m.pos.z * scale - sz/2, sz, sz);
  }
  // Игрок (крупная стрелка)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  const cx = player.pos.x * scale, cy = player.pos.z * scale;
  const angle = yaw;
  ctx.moveTo(cx + Math.sin(angle)*8, cy - Math.cos(angle)*8);
  ctx.lineTo(cx + Math.sin(angle+2.5)*6, cy - Math.cos(angle+2.5)*6);
  ctx.lineTo(cx + Math.sin(angle-2.5)*6, cy - Math.cos(angle-2.5)*6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ═══════════════════════════════════════════════════════════
//  PARTICLE SYSTEM + LIGHT CULLING (для огня/факелов)
// ═══════════════════════════════════════════════════════════

// Particle pool — фиксированный набор частиц огня
const MAX_FIRE_PARTICLES = 200;
const fireParticles = [];
let fireParticleGeo = null;
let fireParticleMesh = null;
const fireParticlePositions = new Float32Array(MAX_FIRE_PARTICLES * 3);
const fireParticleColors = new Float32Array(MAX_FIRE_PARTICLES * 3);
const fireParticleData = []; // {x,y,z, vx,vy,vz, life, maxLife}

function initFireParticles() {
  for (let i = 0; i < MAX_FIRE_PARTICLES; i++) {
    fireParticleData.push({ x:0, y:0, z:0, vx:0, vy:0, vz:0, life:0, maxLife:1, active:false });
    fireParticlePositions[i*3] = 0;
    fireParticlePositions[i*3+1] = -100; // скрыть
    fireParticlePositions[i*3+2] = 0;
  }
  fireParticleGeo = new THREE.BufferGeometry();
  fireParticleGeo.setAttribute('position', new THREE.BufferAttribute(fireParticlePositions, 3));
  fireParticleGeo.setAttribute('color', new THREE.BufferAttribute(fireParticleColors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  fireParticleMesh = new THREE.Points(fireParticleGeo, mat);
  fireParticleMesh.frustumCulled = false;
  scene.add(fireParticleMesh);
}

// Кэш источников света факелов
const torchLights = [];
const MAX_TORCH_LIGHTS = 8;

// Найти ближайшие факелы и создать для них PointLight
function updateTorchLights() {
  // Найти все блоки-факелы в радиусе 15 блоков
  const px = Math.floor(player.pos.x), py = Math.floor(player.pos.y), pz = Math.floor(player.pos.z);
  const candidates = [];
  for (let dx = -10; dx <= 10; dx++) {
    for (let dy = -5; dy <= 5; dy++) {
      for (let dz = -10; dz <= 10; dz++) {
        const b = world.getBlock(px+dx, py+dy, pz+dz);
        if (b === 24) { // факел
          const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
          candidates.push({ x: px+dx+0.5, y: py+dy+0.8, z: pz+dz+0.5, dist: d });
        }
      }
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);
  
  // Обновляем источники света
  for (let i = 0; i < MAX_TORCH_LIGHTS; i++) {
    if (i < candidates.length) {
      if (!torchLights[i]) {
        torchLights[i] = new THREE.PointLight(0xff8800, 1.2, 8);
        scene.add(torchLights[i]);
      }
      torchLights[i].position.set(candidates[i].x, candidates[i].y, candidates[i].z);
      torchLights[i].visible = true;
    } else if (torchLights[i]) {
      torchLights[i].visible = false;
    }
  }
}

// Спавн частиц огня для факелов в радиусе
function updateFireParticles(dt) {
  const px = player.pos.x, py = player.pos.y, pz = player.pos.z;
  
  // Найти факелы в радиусе 12
  const torches = [];
  for (let dx = -8; dx <= 8; dx++) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dz = -8; dz <= 8; dz++) {
        const b = world.getBlock(Math.floor(px)+dx, Math.floor(py)+dy, Math.floor(pz)+dz);
        if (b === 24) {
          torches.push({ x: Math.floor(px)+dx+0.5, y: Math.floor(py)+dy+0.8, z: Math.floor(pz)+dz+0.5 });
        }
      }
    }
  }
  
  // Спавн новых частиц
  for (const t of torches) {
    if (Math.random() < 0.3) {
      // Найти свободную частицу
      for (let i = 0; i < MAX_FIRE_PARTICLES; i++) {
        if (!fireParticleData[i].active) {
          fireParticleData[i].x = t.x + (Math.random()-0.5) * 0.2;
          fireParticleData[i].y = t.y;
          fireParticleData[i].z = t.z + (Math.random()-0.5) * 0.2;
          fireParticleData[i].vx = (Math.random()-0.5) * 0.5;
          fireParticleData[i].vy = 1 + Math.random() * 1.5;
          fireParticleData[i].vz = (Math.random()-0.5) * 0.5;
          fireParticleData[i].life = 0;
          fireParticleData[i].maxLife = 0.5 + Math.random() * 0.5;
          fireParticleData[i].active = true;
          break;
        }
      }
    }
  }
  
  // Обновление частиц
  for (let i = 0; i < MAX_FIRE_PARTICLES; i++) {
    const p = fireParticleData[i];
    if (!p.active) {
      fireParticlePositions[i*3+1] = -100;
      continue;
    }
    p.life += dt;
    if (p.life >= p.maxLife) {
      p.active = false;
      fireParticlePositions[i*3+1] = -100;
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.vy *= 0.95; // замедление
    
    fireParticlePositions[i*3] = p.x;
    fireParticlePositions[i*3+1] = p.y;
    fireParticlePositions[i*3+2] = p.z;
    
    // Цвет: оранжевый → жёлтый → красный (затухание)
    const t = p.life / p.maxLife;
    fireParticleColors[i*3] = 1.0; // R
    fireParticleColors[i*3+1] = 0.6 - t * 0.6; // G
    fireParticleColors[i*3+2] = 0.1; // B
  }
  
  if (fireParticleGeo) {
    fireParticleGeo.attributes.position.needsUpdate = true;
    fireParticleGeo.attributes.color.needsUpdate = true;
  }
}

// ═══════════════════════════════════════════════════════════
//  ГЛАВНЫЙ ЦИКЛ
// ═══════════════════════════════════════════════════════════
let lastTime = performance.now();
let minimapTimer = 0;
let meshRebuildTimer = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!paused) {
    updatePlayer(dt);
    updateMobs(dt);
    updateAnimatedTextures(dt);
    updateFireParticles(dt);
    updateHighlight();
    updateHUD();
    minimapTimer += dt;
    if (minimapTimer > 0.2) { renderMinimap(); minimapTimer = 0; }
    // Свет факелов — обновляем реже (каждые 0.5 сек)
    if (minimapTimer > 0.1) updateTorchLights();
    // Перестройка mesh при движении игрока в новый чанк
    meshRebuildTimer += dt;
    if (meshRebuildTimer > 0.5) {
      const pcx = Math.floor(player.pos.x / CHUNK_SIZE);
      const pcz = Math.floor(player.pos.z / CHUNK_SIZE);
      if (lastPCX !== pcx || lastPCZ !== pcz) {
        buildWorldMesh();
        lastPCX = pcx; lastPCZ = pcz;
      }
      meshRebuildTimer = 0;
    }
    maybePlayAmbient(now);
  }
  if (composer) composer.render();
  else renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

let lastPCX = -1, lastPCZ = -1;

// ═══════════════════════════════════════════════════════════
//  СТАРТ
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
//  ЗВУКОВАЯ СИСТЕМА (Web Audio API — процедурная генерация)
// ═══════════════════════════════════════════════════════════
let audioCtx = null;
let masterGain = null;
const soundsEnabled = true;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  } catch(e) { console.log('Audio not available:', e.message); }
}

// Простой звук-тон с огибающей
function playTone(freq, duration, type = 'sine', volume = 1) {
  if (!audioCtx || !soundsEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.3, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

// Шум (для копания, шагов)
function playNoise(duration, volume = 0.5, filterFreq = 1000) {
  if (!audioCtx || !soundsEnabled) return;
  try {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    source.connect(filter); filter.connect(gain); gain.connect(masterGain);
    source.start();
    source.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

// Звук копания блока
function soundDig() {
  playNoise(0.15, 0.4, 800);
  playTone(150 + Math.random()*50, 0.1, 'square', 0.3);
}
// Звук установки блока
function soundPlace() {
  playTone(200, 0.08, 'square', 0.4);
  playNoise(0.1, 0.3, 1500);
}
// Звук прыжка
function soundJump() {
  playTone(400, 0.1, 'sine', 0.4);
  playTone(600, 0.05, 'sine', 0.3);
}
// Звук удара по мобу
function soundHit() {
  playNoise(0.08, 0.5, 2000);
  playTone(120, 0.1, 'sawtooth', 0.4);
}
// Звук получения урона
function soundDamage() {
  playTone(200, 0.2, 'sawtooth', 0.5);
  playTone(150, 0.3, 'sawtooth', 0.4);
}
// Звук смерти моба
function soundMobDeath() {
  playTone(300, 0.15, 'sawtooth', 0.4);
  setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.3), 100);
}
// Звук крафта
function soundCraft() {
  playTone(523, 0.08, 'sine', 0.3); // C5
  setTimeout(() => playTone(659, 0.08, 'sine', 0.3), 80); // E5
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 160); // G5
}
// Звук подбора предмета
function soundPickup() {
  playTone(800, 0.05, 'sine', 0.3);
  setTimeout(() => playTone(1200, 0.08, 'sine', 0.3), 50);
}
// Звук открытия сундука
function soundChest() {
  playTone(440, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.3), 80);
  setTimeout(() => playTone(659, 0.2, 'sine', 0.3), 160);
}
// Звук победы над боссом
function soundBossKill() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'triangle', 0.4), i * 120));
}
// Звук открытия инвентаря
function soundInventory() {
  playTone(600, 0.05, 'sine', 0.2);
}
// Ambient-звук (фоновый ветер) — периодически
let lastAmbient = 0;
function maybePlayAmbient(now) {
  if (!audioCtx || !soundsEnabled) return;
  if (now - lastAmbient > 8000 + Math.random() * 5000) {
    lastAmbient = now;
    playNoise(1.5, 0.08, 400);
  }
}

function start() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.textContent = 'Генерация чанков...';
  console.log('Start: readyState =', document.readyState, 'body exists =', !!document.body);
  const sx = Math.floor(player.pos.x / CHUNK_SIZE);
  const sz = Math.floor(player.pos.z / CHUNK_SIZE);
  let count = 0;
  for (let dcx = -RENDER_DISTANCE; dcx <= RENDER_DISTANCE; dcx++) {
    for (let dcz = -RENDER_DISTANCE; dcz <= RENDER_DISTANCE; dcz++) {
      world.generateChunk(sx + dcx, sz + dcz);
      count++;
    }
  }
  console.log('Generated', count, 'chunks');
  const lf = document.getElementById('loadFill');
  if (lf) lf.style.width = '100%';
  setTimeout(finishLoad, 100);
}

function finishLoad() {
  buildWorldMesh();
  initFireParticles();
  giveStarterItems();
  buildHotbar();
  spawnInitialMobs();
  findSpawn();
  lastPCX = Math.floor(player.pos.x / CHUNK_SIZE);
  lastPCZ = Math.floor(player.pos.z / CHUNK_SIZE);
  document.getElementById('loading').style.display = 'none';
  document.getElementById('blocker').style.display = 'flex';
  requestAnimationFrame(loop);
}

// Запуск после загрузки DOM
function init() {
  findSpawn();
  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
