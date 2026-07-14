// ═══════════════════════════════════════════════════════════
//  mobs.js — определения всех мобов
//  Каждый моб: { name, hp, speed, hostile, color, size, drops, boss? }
// ═══════════════════════════════════════════════════════════

const MOBS = {
  // ═══════════════════════════════════════════════════════════
  //  МИРНЫЕ ЖИВОТНЫЕ — РАВНИНЫ
  // ═══════════════════════════════════════════════════════════
  cow: {
    name:'Корова', hp:10, speed:1.4, hostile:false, color:0x6b4423,
    bodyColor:0x6b4423, headColor:0x3a2a18,
    size:[0.9, 1.0, 1.4], headSize:0.5,
    hasHorns:false, hasLegs:true,
    drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:3}]
  },
  sheep: {
    name:'Овца', hp:8, speed:1.6, hostile:false, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe8e0d8,
    size:[0.8, 0.9, 1.1], headSize:0.45,
    hasLegs:true, fluffy:true,
    drops:[{item:'wool',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  pig: {
    name:'Свинья', hp:8, speed:1.7, hostile:false, color:0xf0a0a0,
    bodyColor:0xf0a0a0, headColor:0xe89090,
    size:[0.9, 0.8, 1.2], headSize:0.5,
    hasLegs:true, hasSnout:true,
    drops:[{item:'meat_raw',min:1,max:3}]
  },
  horse: {
    name:'Лошадь', hp:15, speed:2.5, hostile:false, color:0x8b5a2b,
    bodyColor:0x8b5a2b, headColor:0x6b4423,
    size:[0.9, 1.4, 1.6], headSize:0.55,
    hasLegs:true, hasMane:true,
    drops:[{item:'leather',min:1,max:2}]
  },
  rabbit: {
    name:'Кролик', hp:3, speed:2.0, hostile:false, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xf0f0f0,
    size:[0.4, 0.5, 0.5], headSize:0.35,
    hasLegs:true, hasEars:true,
    drops:[{item:'meat_raw',min:0,max:1},{item:'wool',min:0,max:1}]
  },

  // ═══════════════════════════════════════════════════════════
  //  ЛЕСНЫЕ ЖИВОТНЫЕ
  // ═══════════════════════════════════════════════════════════
  wolf: {
    name:'Волк', hp:10, speed:2.2, hostile:true, color:0x8a8a8a,
    bodyColor:0x8a8a8a, headColor:0x6a6a6a,
    size:[0.5, 0.6, 1.0], headSize:0.4,
    hasLegs:true, hasTail:true, hasEars:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:3,
    drops:[{item:'leather',min:0,max:2},{item:'bone',min:1,max:2}]
  },
  bear: {
    name:'Медведь', hp:25, speed:1.8, hostile:true, color:0x4a2a18,
    bodyColor:0x4a2a18, headColor:0x3a1a08,
    size:[1.0, 1.3, 1.5], headSize:0.6,
    hasLegs:true, hasEars:true, aggressiveLook:true,
    attackRange:1.8, attackDmg:6,
    drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4},{item:'bone',min:1,max:3}]
  },
  fox: {
    name:'Лиса', hp:6, speed:2.4, hostile:false, color:0xe85a2a,
    bodyColor:0xe85a2a, headColor:0xc84a1a,
    size:[0.4, 0.5, 0.9], headSize:0.35,
    hasLegs:true, hasTail:true, hasEars:true,
    drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]
  },
  deer: {
    name:'Олень', hp:12, speed:2.6, hostile:false, color:0xa87a4a,
    bodyColor:0xa87a4a, headColor:0x8a6a3a,
    size:[0.7, 1.2, 1.4], headSize:0.5,
    hasLegs:true, hasAntlers:true,
    drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  boar: {
    name:'Кабан', hp:14, speed:1.9, hostile:true, color:0x5a3a1a,
    bodyColor:0x5a3a1a, headColor:0x3a2a08,
    size:[0.8, 0.8, 1.2], headSize:0.5,
    hasLegs:true, hasTusks:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:4,
    drops:[{item:'leather',min:1,max:2},{item:'meat_raw',min:1,max:3}]
  },

  // ═══════════════════════════════════════════════════════════
  //  БОЛОТНЫЕ Мобы
  // ═══════════════════════════════════════════════════════════
  witch: {
    name:'Ведьма', hp:18, speed:1.5, hostile:true, color:0x6a2a8a,
    bodyColor:0x6a2a8a, headColor:0x4a1a6a,
    size:[0.7, 1.6, 0.4], headSize:0.5,
    hasLegs:true, hasHat:true, aggressiveLook:true, magic:true,
    attackRange:8, attackDmg:4, ranged:true,
    drops:[{item:'poison_gland',min:1,max:3},{item:'mushroom',min:0,max:2},{item:'string',min:0,max:2}]
  },
  frog: {
    name:'Лягушка', hp:4, speed:1.4, hostile:false, color:0x4a8a3a,
    bodyColor:0x4a8a3a, headColor:0x3a6a2a,
    size:[0.4, 0.4, 0.5], headSize:0.4,
    hasLegs:true, hasEyes:true,
    drops:[{item:'poison_gland',min:0,max:1}]
  },
  snake: {
    name:'Змея', hp:6, speed:1.8, hostile:true, color:0x4a6a2a,
    bodyColor:0x4a6a2a, headColor:0x3a5a1a,
    size:[0.3, 0.3, 1.2], headSize:0.3,
    hasLegs:false, slithers:true, aggressiveLook:true,
    attackRange:1.2, attackDmg:3, poison:2,
    drops:[{item:'poison_gland',min:0,max:1},{item:'string',min:0,max:1}]
  },
  slime: {
    name:'Слизень', hp:8, speed:1.0, hostile:true, color:0x6aaa3a,
    bodyColor:0x6aaa3a, headColor:0x5a9a2a,
    size:[0.8, 0.8, 0.8], headSize:0,
    hasLegs:false, blob:true, hasEyes:true,
    attackRange:1.2, attackDmg:2,
    drops:[{item:'string',min:1,max:2}]
  },
  mosquito: {
    name:'Комар', hp:2, speed:2.5, hostile:true, color:0x4a4a4a,
    bodyColor:0x4a4a4a, headColor:0x2a2a2a,
    size:[0.2, 0.2, 0.3], headSize:0.15,
    hasLegs:false, flies:true, aggressiveLook:true,
    attackRange:1.0, attackDmg:1,
    drops:[]
  },

  // ═══════════════════════════════════════════════════════════
  //  ПУСТЫННЫЕ Мобы
  // ═══════════════════════════════════════════════════════════
  scorpion: {
    name:'Скорпион', hp:12, speed:1.7, hostile:true, color:0xa87a3a,
    bodyColor:0xa87a3a, headColor:0x8a6a2a,
    size:[0.8, 0.5, 1.0], headSize:0.4,
    hasLegs:true, hasTail:true, hasClaws:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:4, poison:3,
    drops:[{item:'poison_gland',min:1,max:2},{item:'chitin',min:1,max:3}]
  },
  snake_desert: {
    name:'Пустынная змея', hp:8, speed:2.0, hostile:true, color:0xc8a868,
    bodyColor:0xc8a868, headColor:0xa88848,
    size:[0.3, 0.3, 1.3], headSize:0.3,
    hasLegs:false, slithers:true, aggressiveLook:true,
    attackRange:1.3, attackDmg:4, poison:3,
    drops:[{item:'poison_gland',min:1,max:2},{item:'leather',min:0,max:1}]
  },
  camel: {
    name:'Верблюд', hp:18, speed:1.5, hostile:false, color:0xc8a868,
    bodyColor:0xc8a868, headColor:0xa88848,
    size:[1.0, 1.8, 1.6], headSize:0.5,
    hasLegs:true, hasHump:true,
    drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  spider_desert: {
    name:'Пустынный паук', hp:10, speed:2.2, hostile:true, color:0x8a4a2a,
    bodyColor:0x8a4a2a, headColor:0x6a3a1a,
    size:[0.8, 0.6, 0.8], headSize:0.4,
    hasLegs:true, eightLegs:true, hasEyes:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:3, poison:2,
    drops:[{item:'spider_silk',min:1,max:3},{item:'poison_gland',min:0,max:1}]
  },
  mummy: {
    name:'Мумия', hp:22, speed:1.3, hostile:true, color:0xe8d8a8,
    bodyColor:0xe8d8a8, headColor:0xd8c898,
    size:[0.7, 1.9, 0.4], headSize:0.5,
    hasLegs:true, wrapped:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:5,
    drops:[{item:'string',min:2,max:4},{item:'gold_ingot',min:0,max:1}]
  },

  // ═══════════════════════════════════════════════════════════
  //  СНЕЖНЫЕ Мобы
  // ═══════════════════════════════════════════════════════════
  polar_bear: {
    name:'Белый медведь', hp:30, speed:1.9, hostile:true, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe0e0e0,
    size:[1.0, 1.3, 1.5], headSize:0.6,
    hasLegs:true, hasEars:true, aggressiveLook:true,
    attackRange:1.8, attackDmg:7,
    drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4},{item:'ice_shard',min:0,max:2}]
  },
  wolf_snow: {
    name:'Снежный волк', hp:14, speed:2.4, hostile:true, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe0e0e0,
    size:[0.5, 0.6, 1.0], headSize:0.4,
    hasLegs:true, hasTail:true, hasEars:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:4, slowEffect:true,
    drops:[{item:'leather',min:1,max:2},{item:'ice_shard',min:0,max:1}]
  },
  penguin: {
    name:'Пингвин', hp:6, speed:1.2, hostile:false, color:0x2a2a2a,
    bodyColor:0x2a2a2a, headColor:0x1a1a1a,
    size:[0.4, 0.7, 0.5], headSize:0.35,
    hasLegs:true, hasBeak:true, hasWings:true,
    drops:[{item:'meat_raw',min:0,max:1},{item:'feather',min:0,max:2}]
  },
  fox_snow: {
    name:'Снежная лиса', hp:8, speed:2.6, hostile:false, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe8e8e8,
    size:[0.4, 0.5, 0.9], headSize:0.35,
    hasLegs:true, hasTail:true, hasEars:true,
    drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]
  },
  yeti: {
    name:'Йети', hp:35, speed:1.6, hostile:true, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe0e0e0,
    size:[1.4, 2.5, 0.8], headSize:0.7,
    hasLegs:true, big:true, aggressiveLook:true,
    attackRange:2.0, attackDmg:9, slowEffect:true,
    drops:[{item:'ice_shard',min:2,max:5},{item:'leather',min:2,max:4},{item:'meat_raw',min:2,max:4}]
  },

  // ═══════════════════════════════════════════════════════════
  //  ДЖУНГЛИ
  // ═══════════════════════════════════════════════════════════
  parrot: {
    name:'Попугай', hp:4, speed:2.5, hostile:false, color:0xe83a3a,
    bodyColor:0xe83a3a, headColor:0xffe85e,
    size:[0.3, 0.4, 0.4], headSize:0.3,
    hasLegs:false, flies:true, hasBeak:true, hasWings:true, colorful:true,
    drops:[{item:'feather',min:1,max:3}]
  },
  jaguar: {
    name:'Ягуар', hp:20, speed:2.6, hostile:true, color:0xe8a83a,
    bodyColor:0xe8a83a, headColor:0xc8881a,
    size:[0.6, 0.7, 1.2], headSize:0.45,
    hasLegs:true, hasTail:true, hasSpots:true, aggressiveLook:true,
    attackRange:1.7, attackDmg:6,
    drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  monkey: {
    name:'Обезьяна', hp:8, speed:2.4, hostile:false, color:0x8a5a2a,
    bodyColor:0x8a5a2a, headColor:0x6a3a1a,
    size:[0.4, 0.6, 0.6], headSize:0.4,
    hasLegs:true, hasTail:true,
    drops:[{item:'leather',min:0,max:1},{item:'bamboo',min:0,max:2}]
  },
  snake_jungle: {
    name:'Лесная змея', hp:10, speed:1.9, hostile:true, color:0x3a7a2a,
    bodyColor:0x3a7a2a, headColor:0x2a5a1a,
    size:[0.3, 0.3, 1.4], headSize:0.3,
    hasLegs:false, slithers:true, aggressiveLook:true,
    attackRange:1.4, attackDmg:4, poison:3,
    drops:[{item:'poison_gland',min:1,max:2},{item:'leather',min:0,max:1}]
  },
  panther: {
    name:'Пантера', hp:22, speed:2.8, hostile:true, color:0x1a1a1a,
    bodyColor:0x1a1a1a, headColor:0x0a0a0a,
    size:[0.6, 0.7, 1.3], headSize:0.45,
    hasLegs:true, hasTail:true, aggressiveLook:true,
    attackRange:1.7, attackDmg:7, critChance:0.2,
    drops:[{item:'leather',min:2,max:3},{item:'meat_raw',min:1,max:2}]
  },

  // ═══════════════════════════════════════════════════════════
  //  ГОРЫ
  // ═══════════════════════════════════════════════════════════
  eagle: {
    name:'Орёл', hp:8, speed:3.0, hostile:true, color:0x8a6a3a,
    bodyColor:0x8a6a3a, headColor:0xf0f0f0,
    size:[0.3, 0.4, 0.5], headSize:0.3,
    hasLegs:false, flies:true, hasBeak:true, hasWings:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:3,
    drops:[{item:'feather',min:2,max:4},{item:'bone',min:0,max:1}]
  },
  goat: {
    name:'Горный козёл', hp:12, speed:2.0, hostile:false, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe0e0e0,
    size:[0.6, 0.9, 1.1], headSize:0.45,
    hasLegs:true, hasHorns:true, hasBeard:true,
    drops:[{item:'leather',min:1,max:2},{item:'meat_raw',min:0,max:2}]
  },
  wolf_mountain: {
    name:'Горный волк', hp:16, speed:2.3, hostile:true, color:0x5a5a5a,
    bodyColor:0x5a5a5a, headColor:0x3a3a3a,
    size:[0.6, 0.7, 1.1], headSize:0.45,
    hasLegs:true, hasTail:true, hasEars:true, aggressiveLook:true,
    attackRange:1.6, attackDmg:5,
    drops:[{item:'leather',min:1,max:2},{item:'bone',min:1,max:2}]
  },
  troll: {
    name:'Тролль', hp:40, speed:1.4, hostile:true, color:0x5a6a4a,
    bodyColor:0x5a6a4a, headColor:0x3a4a2a,
    size:[1.2, 2.3, 0.8], headSize:0.6,
    hasLegs:true, big:true, aggressiveLook:true,
    attackRange:2.0, attackDmg:10, knockback:2,
    drops:[{item:'stone',min:2,max:5},{item:'iron_ore',min:1,max:2},{item:'bone',min:1,max:3}]
  },
  harpy: {
    name:'Гарпия', hp:14, speed:2.8, hostile:true, color:0xa88a5a,
    bodyColor:0xa88a5a, headColor:0x8a6a3a,
    size:[0.5, 0.8, 0.5], headSize:0.4,
    hasLegs:false, flies:true, hasWings:true, aggressiveLook:true,
    attackRange:1.8, attackDmg:4,
    drops:[{item:'feather',min:2,max:4},{item:'bone',min:0,max:1}]
  },

  // ═══════════════════════════════════════════════════════════
  //  ОКЕАН
  // ═══════════════════════════════════════════════════════════
  fish: {
    name:'Рыба', hp:3, speed:2.0, hostile:false, color:0xc8a868,
    bodyColor:0xc8a868, headColor:0xa88848,
    size:[0.3, 0.3, 0.6], headSize:0.25,
    hasLegs:false, swims:true,
    drops:[{item:'meat_raw',min:0,max:1}]
  },
  shark: {
    name:'Акула', hp:25, speed:2.8, hostile:true, color:0x5a6a7a,
    bodyColor:0x5a6a7a, headColor:0x3a4a5a,
    size:[0.8, 0.8, 2.0], headSize:0.5,
    hasLegs:false, swims:true, aggressiveLook:true, hasFins:true,
    attackRange:1.8, attackDmg:8,
    drops:[{item:'shark_tooth',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  squid: {
    name:'Кальмар', hp:10, speed:1.8, hostile:false, color:0x8a4a8a,
    bodyColor:0x8a4a8a, headColor:0x6a2a6a,
    size:[0.6, 0.8, 0.8], headSize:0.5,
    hasLegs:false, swims:true, hasTentacles:true,
    drops:[{item:'ink_sac',min:0,max:1},{item:'meat_raw',min:0,max:1}]
  },
  turtle: {
    name:'Черепаха', hp:15, speed:0.8, hostile:false, color:0x4a8a4a,
    bodyColor:0x4a8a4a, headColor:0x3a6a3a,
    size:[0.8, 0.5, 1.0], headSize:0.3,
    hasLegs:true, hasShell:true,
    drops:[{item:'leather',min:0,max:1},{item:'meat_raw',min:0,max:1}]
  },
  dolphin: {
    name:'Дельфин', hp:14, speed:3.0, hostile:false, color:0x8ac8e8,
    bodyColor:0x8ac8e8, headColor:0x6aa8c8,
    size:[0.5, 0.6, 1.5], headSize:0.4,
    hasLegs:false, swims:true,
    drops:[{item:'meat_raw',min:0,max:1},{item:'shark_tooth',min:0,max:1}]
  },

  // ═══════════════════════════════════════════════════════════
  //  САВАННА
  // ═══════════════════════════════════════════════════════════
  lion: {
    name:'Лев', hp:25, speed:2.4, hostile:true, color:0xe8c878,
    bodyColor:0xe8c878, headColor:0xc8a858,
    size:[0.7, 0.9, 1.3], headSize:0.5,
    hasLegs:true, hasTail:true, hasMane:true, aggressiveLook:true,
    attackRange:1.7, attackDmg:7, critChance:0.15,
    drops:[{item:'leather',min:2,max:3},{item:'meat_raw',min:2,max:3}]
  },
  zebra: {
    name:'Зебра', hp:18, speed:2.8, hostile:false, color:0xf0f0f0,
    bodyColor:0xf0f0f0, headColor:0xe0e0e0,
    size:[0.7, 1.4, 1.5], headSize:0.5,
    hasLegs:true, striped:true, hasMane:true,
    drops:[{item:'leather',min:1,max:3},{item:'meat_raw',min:1,max:2}]
  },
  giraffe: {
    name:'Жираф', hp:22, speed:1.6, hostile:false, color:0xe8d878,
    bodyColor:0xe8d878, headColor:0xc8b858,
    size:[0.8, 3.5, 1.5], headSize:0.4,
    hasLegs:true, hasSpots:true, hasLongNeck:true,
    drops:[{item:'leather',min:2,max:4},{item:'meat_raw',min:1,max:3}]
  },
  elephant: {
    name:'Слон', hp:50, speed:1.2, hostile:false, color:0x8a8a7a,
    bodyColor:0x8a8a7a, headColor:0x6a6a5a,
    size:[1.5, 2.5, 2.5], headSize:0.7,
    hasLegs:true, big:true, hasTrunk:true, hasTusks:true,
    drops:[{item:'leather',min:3,max:6},{item:'meat_raw',min:2,max:4},{item:'bone',min:1,max:3}]
  },
  hyena: {
    name:'Гиена', hp:12, speed:2.2, hostile:true, color:0xa89868,
    bodyColor:0xa89868, headColor:0x887848,
    size:[0.5, 0.7, 1.0], headSize:0.4,
    hasLegs:true, hasTail:true, hasSpots:true, aggressiveLook:true,
    attackRange:1.5, attackDmg:4,
    drops:[{item:'leather',min:0,max:2},{item:'meat_raw',min:0,max:1}]
  },

  // ═══════════════════════════════════════════════════════════
  //  БОССЫ — по одному на биом (mega HP, mega лут)
  // ═══════════════════════════════════════════════════════════
  golem_forest: {
    name:'Лесной Голем', hp:200, speed:1.0, hostile:true, color:0x4a8a2a,
    bodyColor:0x4a8a2a, headColor:0x3a6a1a,
    size:[1.8, 3.5, 1.5], headSize:1.0,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:2.5, attackDmg:15, knockback:5,
    drops:[
      {item:'golem_core',min:1,max:1},
      {item:'forest_blade',min:1,max:1},
      {item:'diamond',min:2,max:4},
      {item:'emerald',min:1,max:3}
    ]
  },
  swamp_hydra: {
    name:'Болотная Химера', hp:250, speed:1.2, hostile:true, color:0x4a6a2a,
    bodyColor:0x4a6a2a, headColor:0x3a5a1a,
    size:[1.5, 2.5, 2.5], headSize:0.8, hasThreeHeads:true,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:3.0, attackDmg:18, poison:5, ranged:true,
    drops:[
      {item:'swamp_venom',min:1,max:1},
      {item:'poison_gland',min:5,max:10},
      {item:'mythril_ingot',min:2,max:4},
      {item:'diamond',min:3,max:5}
    ]
  },
  sand_worm: {
    name:'Песчаный Червь', hp:300, speed:1.8, hostile:true, color:0xe6d29a,
    bodyColor:0xe6d29a, headColor:0xc8b278,
    size:[1.5, 1.5, 5.0], headSize:1.2, hasMouth:true,
    hasLegs:false, slithers:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:3.5, attackDmg:20, knockback:4,
    drops:[
      {item:'sand_reaper',min:1,max:1},
      {item:'adamant_ore',min:2,max:4},
      {item:'gold_ingot',min:5,max:10},
      {item:'diamond',min:3,max:6}
    ]
  },
  ice_king: {
    name:'Ледяной Король', hp:280, speed:1.4, hostile:true, color:0x8ac8e8,
    bodyColor:0x8ac8e8, headColor:0x6aa8c8,
    size:[1.2, 2.8, 1.0], headSize:0.7, hasCrown:true,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true, magic:true,
    attackRange:3.0, attackDmg:18, slowEffect:true, ranged:true,
    drops:[
      {item:'ice_crown',min:1,max:1},
      {item:'ice_fang',min:1,max:1},
      {item:'ice_shard',min:10,max:20},
      {item:'diamond',min:4,max:7},
      {item:'mythril_ingot',min:2,max:4}
    ]
  },
  jaguar_king: {
    name:'Король Ягуаров', hp:220, speed:3.0, hostile:true, color:0xe8a83a,
    bodyColor:0xe8a83a, headColor:0xc8881a,
    size:[1.0, 1.4, 2.0], headSize:0.6, hasCrown:true,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true, hasSpots:true,
    attackRange:2.0, attackDmg:22, critChance:0.3,
    drops:[
      {item:'jungle_fury',min:1,max:1},
      {item:'jungle_cloak',min:1,max:1},
      {item:'emerald',min:3,max:6},
      {item:'mythril_ingot',min:2,max:4}
    ]
  },
  stone_titan: {
    name:'Каменный Титан', hp:400, speed:0.8, hostile:true, color:0x5a5a5a,
    bodyColor:0x5a5a5a, headColor:0x3a3a3a,
    size:[2.5, 5.0, 2.0], headSize:1.5,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:3.5, attackDmg:25, knockback:8,
    drops:[
      {item:'titan_hammer',min:1,max:1},
      {item:'golem_armor',min:1,max:1},
      {item:'adamant_ore',min:3,max:6},
      {item:'diamond',min:5,max:10},
      {item:'mythril_ingot',min:3,max:5}
    ]
  },
  sea_serpent: {
    name:'Морской Змей', hp:350, speed:2.5, hostile:true, color:0x4a8a4a,
    bodyColor:0x4a8a4a, headColor:0x2a6a2a,
    size:[1.5, 1.5, 6.0], headSize:1.3, hasFins:true,
    hasLegs:false, swims:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:3.5, attackDmg:22, waterBreathing:true,
    drops:[
      {item:'serpent_trident',min:1,max:1},
      {item:'serpent_scale_armor',min:1,max:1},
      {item:'serpent_scale',min:5,max:10},
      {item:'diamond',min:5,max:8},
      {item:'adamant_ore',min:2,max:4}
    ]
  },
  lion_king: {
    name:'Царь Львов', hp:240, speed:2.8, hostile:true, color:0xe8c878,
    bodyColor:0xe8c878, headColor:0xc8a858,
    size:[1.2, 1.6, 2.0], headSize:0.7, hasMane:true, hasCrown:true,
    hasLegs:true, big:true, boss:true, aggressiveLook:true, hasGlow:true,
    attackRange:2.2, attackDmg:20, critChance:0.35,
    drops:[
      {item:'lion_claw',min:1,max:1},
      {item:'emerald',min:4,max:8},
      {item:'gold_ingot',min:5,max:10},
      {item:'diamond',min:3,max:6}
    ]
  },
};

module.exports = { MOBS };
