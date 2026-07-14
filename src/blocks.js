// ═══════════════════════════════════════════════════════════
//  blocks.js — определения всех блоков мира
//  Каждый блок: id → { name, solid, transparent, color/топ/бок/низ, drop, hardness }
// ═══════════════════════════════════════════════════════════

const BLOCKS = {
  // Воздух
  0: { name:'air', solid:false, transparent:true },

  // ═══ Базовые блоки (1-10) ═══
  1:  { name:'grass',    solid:true,  top:0x7cba34, side:0x9b7653, bottom:0x6b4423, drop:2 },
  2:  { name:'dirt',     solid:true,  color:0x9b7653, drop:2 },
  3:  { name:'stone',    solid:true,  color:0x888888, drop:4, hardness:1.5 },
  4:  { name:'cobble',   solid:true,  color:0x7d7d7d, drop:4 },
  5:  { name:'wood',     solid:true,  top:0xb8860b, side:0x6b4423, bottom:0xb8860b, drop:5 },
  6:  { name:'leaves',   solid:true,  color:0x4a8a2a, transparent:true, drop:6, hardness:0.2 },
  7:  { name:'sand',     solid:true,  color:0xe6d29a, drop:7 },
  8:  { name:'plank',    solid:true,  color:0xc89a4a, drop:8 },
  9:  { name:'glass',    solid:true,  color:0xa8d8e8, transparent:true, drop:9 },
  10: { name:'brick',    solid:true,  color:0xa8432a, drop:10, hardness:2 },

  // ═══ Руды (11-15) ═══
  11: { name:'coal_ore',    solid:true, color:0x3a3a3a, drop:'coal',      hardness:1.8 },
  12: { name:'iron_ore',    solid:true, color:0xd8a878, drop:'iron_ore',  hardness:2.5 },
  13: { name:'gold_ore',    solid:true, color:0xfada5e, drop:'gold_ore',  hardness:2.5 },
  14: { name:'diamond_ore', solid:true, color:0x5edfd5, drop:'diamond',   hardness:3.5 },
  15: { name:'bedrock',     solid:true, color:0x2b2b2b, drop:0,            hardness:Infinity },

  // ═══ Жидкости и особые (16-18) ═══
  16: { name:'water',   solid:false, color:0x3a6ea8, transparent:true },
  17: { name:'crafting',solid:true,  top:0xb8860b, side:0x8b5a2b, bottom:0x8b5a2b, drop:17 },
  18: { name:'chest',   solid:true,  color:0xa8782a, drop:18 },

  // ═══ Биом-специфичные (19-30) ═══
  19: { name:'darkgrass', solid:true, top:0x4a6a24, side:0x6b4423, bottom:0x6b4423, drop:2 },
  20: { name:'moss',      solid:true, color:0x5a7a3a, drop:20, hardness:1 },
  21: { name:'spruce',    solid:true, top:0x3a2a18, side:0x2a1a08, bottom:0x3a2a18, drop:21 },
  22: { name:'sprleaves', solid:true, color:0x2a5a1a, transparent:true, drop:22 },
  23: { name:'flower',    solid:false, color:0xd83a3a, transparent:true, drop:'flower' },
  24: { name:'torch',     solid:false, color:0xffa500, transparent:true, drop:'torch', light:true },
  25: { name:'snow',      solid:true, color:0xf0f0f8, drop:25 },
  26: { name:'ice',       solid:true, color:0x8ac8e8, transparent:true, drop:0 },
  27: { name:'cactus',    solid:true, color:0x3a8a3a, drop:27 },
  28: { name:'pumpkin',   solid:true, color:0xe88a2a, drop:28 },
  29: { name:'hay',       solid:true, color:0xc8b83a, drop:29 },
  30: { name:'mushroom',  solid:false, color:0xc83a3a, transparent:true, drop:'mushroom' },

  // ═══ Блоки из слитков (31-35) ═══
  31: { name:'iron_block',  solid:true, color:0xd8d8d8, drop:31, hardness:3 },
  32: { name:'gold_block',  solid:true, color:0xfada5e, drop:32, hardness:3 },
  33: { name:'diamond_block',solid:true,color:0x5edfd5, drop:33, hardness:4 },
  34: { name:'obsidian',    solid:true, color:0x1a0a2a, drop:34, hardness:8 },
  35: { name:'lava',        solid:false, color:0xe85a2a, transparent:true, drop:0 },

  // ═══ Джунгли (36-40) ═══
  36: { name:'jungle_wood',    solid:true, top:0x6a4a2a, side:0x4a2a1a, bottom:0x6a4a2a, drop:36 },
  37: { name:'jungle_leaves', solid:true, color:0x3a7a2a, transparent:true, drop:37 },
  38: { name:'vines',         solid:false, color:0x2a6a1a, transparent:true, drop:'vines' },
  39: { name:'cocoa',         solid:false, color:0x8a4a2a, transparent:true, drop:'cocoa' },
  40: { name:'bamboo',        solid:false, color:0x7aa84a, transparent:true, drop:'bamboo' },

  // ═══ Болото (41-45) ═══
  41: { name:'mud',         solid:true,  color:0x4a3a1a, drop:41, hardness:0.8 },
  42: { name:'lily',        solid:false, color:0x3a8a3a, transparent:true, drop:'lily' },
  43: { name:'swamp_log',   solid:true,  top:0x5a4a2a, side:0x3a2a1a, bottom:0x5a4a2a, drop:43 },
  44: { name:'willow',      solid:true,  top:0x6a8a4a, side:0x4a3a1a, bottom:0x6a8a4a, drop:44 },
  45: { name:'algae',       solid:false, color:0x2a5a2a, transparent:true, drop:'algae' },

  // ═══ Горы (46-50) ═══
  46: { name:'granite',     solid:true,  color:0xa87a5a, drop:46, hardness:1.5 },
  47: { name:'diorite',     solid:true,  color:0xc8c8b8, drop:47, hardness:1.5 },
  48: { name:'andesite',    solid:true,  color:0x8a8a7a, drop:48, hardness:1.5 },
  49: { name:'snow_block',  solid:true,  color:0xf0f0f8, drop:49 },
  50: { name:'packed_ice',  solid:true,  color:0x6aa8d8, transparent:true, drop:0, hardness:0.5 },

  // ═══ Декоративные блоки и мебель (51-70) ═══
  51: { name:'table',       solid:true,  top:0x8b5a2b, side:0x6b4423, bottom:0x6b4423, drop:51 },
  52: { name:'chair',       solid:false, color:0x8b5a2b, transparent:true, drop:52 },
  53: { name:'bed',         solid:false, color:0xc83a3a, transparent:true, drop:53 },
  54: { name:'lamp',        solid:false, color:0xffe85e, transparent:true, drop:54, light:true },
  55: { name:'bookshelf',   solid:true,  color:0xb8860b, drop:55, hardness:1 },
  56: { name:'furnace',     solid:true,  top:0x555555, side:0x777777, bottom:0x555555, drop:56 },
  57: { name:'anvil',       solid:true,  color:0x444444, drop:57, hardness:3 },
  58: { name:'carpet_red',  solid:false, color:0xc83a3a, transparent:true, drop:58 },
  59: { name:'carpet_blue', solid:false, color:0x3a5ac8, transparent:true, drop:59 },
  60: { name:'carpet_green',solid:false, color:0x3a8a3a, transparent:true, drop:60 },
  61: { name:'wool_white',  solid:true,  color:0xf0f0f0, drop:61, hardness:0.3 },
  62: { name:'wool_black',  solid:true,  color:0x2a2a2a, drop:62, hardness:0.3 },
  63: { name:'wool_red',    solid:true,  color:0xc83a3a, drop:63, hardness:0.3 },
  64: { name:'wool_blue',   solid:true,  color:0x3a5ac8, drop:64, hardness:0.3 },
  65: { name:'fence',       solid:false, color:0x8b5a2b, transparent:true, drop:65 },
  66: { name:'fence_gate',  solid:false, color:0x8b5a2b, transparent:true, drop:66 },
  67: { name:'door',        solid:false, color:0x8b5a2b, transparent:true, drop:67 },
  68: { name:'ladder',      solid:false, color:0x8b5a2b, transparent:true, drop:68 },
  69: { name:'sign',        solid:false, color:0x8b5a2b, transparent:true, drop:69 },
  70: { name:'flower_pot',  solid:false, color:0xa8782a, transparent:true, drop:70 },

  // ═══ Магические/особые (71-80) ═══
  71: { name:'enchant_table', solid:true, top:0x6a2a8a, side:0x4a1a5a, bottom:0x4a1a5a, drop:71, hardness:3 },
  72: { name:'glowstone',    solid:true, color:0xffd95e, drop:72, light:true, hardness:0.5 },
  73: { name:'netherrack',   solid:true, color:0x8a2a2a, drop:73, hardness:0.5 },
  74: { name:'end_stone',    solid:true, color:0xdede88, drop:74, hardness:2 },
  75: { name:'purpur',       solid:true, color:0xa87ac8, drop:75, hardness:1.5 },
  76: { name:'crystal',      solid:true, color:0xffaa5e, transparent:true, drop:'crystal', light:true, hardness:1 },
  77: { name:'mythril_ore',  solid:true, color:0x5ac8c8, drop:'mythril_ore', hardness:4 },
  78: { name:'mythril_block',solid:true, color:0x5ac8c8, drop:78, hardness:4 },
  79: { name:'adamant_ore',  solid:true, color:0xc85a5a, drop:'adamant_ore', hardness:5 },
  80: { name:'adamant_block',solid:true, color:0xc85a5a, drop:80, hardness:5 },

  // ═══ Растения (81-90) ═══
  81: { name:'tall_grass',   solid:false, color:0x6aaa3a, transparent:true, drop:'grass_item' },
  82: { name:'rose',         solid:false, color:0xe83a3a, transparent:true, drop:'rose' },
  83: { name:'dandelion',    solid:false, color:0xffe85e, transparent:true, drop:'dandelion' },
  84: { name:'blue_orchid',  solid:false, color:0x5a8ada, transparent:true, drop:'blue_orchid' },
  85: { name:'sunflower',    solid:false, color:0xffe85e, transparent:true, drop:'sunflower' },
  86: { name:'oak_sapling',  solid:false, color:0x4a8a2a, transparent:true, drop:'oak_sapling' },
  87: { name:'berry_bush',   solid:false, color:0xc83a5a, transparent:true, drop:'berry', hardness:0.1 },
  88: { name:'fern',         solid:false, color:0x4a8a3a, transparent:true, drop:'fern' },
  89: { name:'dead_bush',    solid:false, color:0x8a6a3a, transparent:true, drop:'stick' },
  90: { name:'lily_pad',     solid:false, color:0x3a8a3a, transparent:true, drop:'lily_pad' },
};

// Список блоков для хотбара (строительные)
const BUILD_BLOCKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 30, 31, 32, 33, 34, 51, 52, 55, 56, 61, 62, 63, 64, 65];

module.exports = { BLOCKS, BUILD_BLOCKS };
