// ═══════════════════════════════════════════════════════════
//  biomes.js — определения биомов мира
//  Каждый биом: id → { name, color, surfaceBlock, subsurface, trees, mobs, structures, weather }
// ═══════════════════════════════════════════════════════════

const BIOMES = {
  PLAINS: {
    id: 0,
    name: 'Равнины',
    color: 0x7cba34,
    mapColor: '#7cba34',
    surfaceBlock: 1,
    subsurfaceBlock: 2,
    heightBase: 7,
    heightVariation: 1.5,
    treeChance: 0.04,
    treeType: 'oak',
    flowerChance: 0.05,
    mobTypes: ['cow', 'sheep', 'pig', 'horse', 'rabbit'],
    mobDensity: 0.6,
    bossType: 'golem_forest',
    bossSpawnChance: 0.3,
    weather: 'clear',
    structures: ['house', 'well'],
    skyColor: 0x87ceeb,
  },

  FOREST: {
    id: 1,
    name: 'Лес',
    color: 0x3a6a1a,
    mapColor: '#3a6a1a',
    surfaceBlock: 1,
    subsurfaceBlock: 2,
    heightBase: 8,
    heightVariation: 2,
    treeChance: 0.18,
    treeType: 'oak_dense',
    flowerChance: 0.02,
    mobTypes: ['wolf', 'bear', 'fox', 'deer', 'boar'],
    mobDensity: 0.8,
    bossType: 'golem_forest',
    bossSpawnChance: 0.4,
    weather: 'clear',
    structures: ['cabin', 'cave_entrance'],
    skyColor: 0x87ceeb,
  },

  SWAMP: {
    id: 2,
    name: 'Болото',
    color: 0x4a5a24,
    mapColor: '#4a5a24',
    surfaceBlock: 19,
    subsurfaceBlock: 41,
    heightBase: 5,
    heightVariation: 0.8,
    treeChance: 0.10,
    treeType: 'swamp_willow',
    waterChance: 0.20,
    lilyChance: 0.15,
    mobTypes: ['witch', 'frog', 'snake', 'slime', 'mosquito'],
    mobDensity: 0.7,
    bossType: 'swamp_hydra',
    bossSpawnChance: 0.5,
    weather: 'fog',
    structures: ['witch_hut', 'ruined_shrine'],
    skyColor: 0x7a8a9a,
  },

  DESERT: {
    id: 3,
    name: 'Пустыня',
    color: 0xe6d29a,
    mapColor: '#e6d29a',
    surfaceBlock: 7,
    subsurfaceBlock: 7,
    heightBase: 7,
    heightVariation: 1.2,
    treeChance: 0.01,
    treeType: 'cactus',
    cactusChance: 0.05,
    mobTypes: ['scorpion', 'snake_desert', 'camel', 'spider_desert', 'mummy'],
    mobDensity: 0.5,
    bossType: 'sand_worm',
    bossSpawnChance: 0.45,
    weather: 'clear',
    structures: ['pyramid', 'desert_well'],
    skyColor: 0xf0d8a8,
  },

  SNOW: {
    id: 4,
    name: 'Снежные земли',
    color: 0xf0f0f8,
    mapColor: '#f0f0f8',
    surfaceBlock: 25,
    subsurfaceBlock: 2,
    heightBase: 8,
    heightVariation: 1.8,
    treeChance: 0.10,
    treeType: 'spruce',
    iceChance: 0.05,
    mobTypes: ['polar_bear', 'wolf_snow', 'penguin', 'fox_snow', 'yeti'],
    mobDensity: 0.5,
    bossType: 'ice_king',
    bossSpawnChance: 0.5,
    weather: 'snow',
    structures: ['igloo', 'ice_castle'],
    skyColor: 0xc8d8e8,
  },

  JUNGLE: {
    id: 5,
    name: 'Джунгли',
    color: 0x2a5a1a,
    mapColor: '#2a5a1a',
    surfaceBlock: 1,
    subsurfaceBlock: 2,
    heightBase: 9,
    heightVariation: 2.5,
    treeChance: 0.25,
    treeType: 'jungle',
    vineChance: 0.15,
    mobTypes: ['parrot', 'jaguar', 'monkey', 'snake_jungle', 'panther'],
    mobDensity: 0.9,
    bossType: 'jaguar_king',
    bossSpawnChance: 0.55,
    weather: 'clear',
    structures: ['jungle_temple', 'treehouse'],
    skyColor: 0x88b88a,
  },

  MOUNTAINS: {
    id: 6,
    name: 'Горы',
    color: 0x8a8a8a,
    mapColor: '#8a8a8a',
    surfaceBlock: 3,
    subsurfaceBlock: 3,
    heightBase: 14,
    heightVariation: 5,
    treeChance: 0.03,
    treeType: 'spruce_sparse',
    mobTypes: ['eagle', 'goat', 'wolf_mountain', 'troll', 'harpy'],
    mobDensity: 0.4,
    bossType: 'stone_titan',
    bossSpawnChance: 0.6,
    weather: 'clear',
    structures: ['mine_entrance', 'mountain_shrine'],
    skyColor: 0x90a8c0,
  },

  OCEAN: {
    id: 7,
    name: 'Океан',
    color: 0x3a6ea8,
    mapColor: '#3a6ea8',
    surfaceBlock: 16,
    subsurfaceBlock: 7,
    heightBase: 3,
    heightVariation: 0.5,
    treeChance: 0,
    waterLevel: 6,
    mobTypes: ['fish', 'shark', 'squid', 'turtle', 'dolphin'],
    mobDensity: 0.6,
    bossType: 'sea_serpent',
    bossSpawnChance: 0.4,
    weather: 'clear',
    structures: ['shipwreck', 'ocean_temple'],
    skyColor: 0x68a8d8,
  },

  SAVANNA: {
    id: 8,
    name: 'Саванна',
    color: 0xc8b86a,
    mapColor: '#c8b86a',
    surfaceBlock: 19,
    subsurfaceBlock: 2,
    heightBase: 7,
    heightVariation: 1.2,
    treeChance: 0.06,
    treeType: 'acacia',
    mobTypes: ['lion', 'zebra', 'giraffe', 'elephant', 'hyena'],
    mobDensity: 0.7,
    bossType: 'lion_king',
    bossSpawnChance: 0.45,
    weather: 'clear',
    structures: ['savanna_village', 'baobab'],
    skyColor: 0xe8c878,
  },
};

// Получить биом по координатам через шум
function getBiomeAt(x, z, seed = 12345) {
  // Используем синусоиды разной частоты для крупных биомов
  const nx = x / 80 - 0.5;
  const nz = z / 80 - 0.5;
  // Несколько слоёв шума Перлина (упрощённо через синусы)
  let r = Math.sin(nx * 6 + seed * 0.001) * 0.4
        + Math.cos(nz * 5 + seed * 0.002) * 0.4
        + Math.sin((nx + nz) * 4) * 0.3
        + Math.cos((nx - nz) * 7) * 0.2;

  // Шум для температуры (отделяет жаркие биомы)
  const temp = Math.sin(nx * 3.5 + 1.7) * 0.5 + Math.cos(nz * 4.2 + 2.3) * 0.5;

  if (r < -0.7) return BIOMES.OCEAN;
  if (r < -0.3) {
    return temp > 0.2 ? BIOMES.SWAMP : BIOMES.SAVANNA;
  }
  if (r < 0.1) {
    return temp > 0.3 ? BIOMES.DESERT : BIOMES.PLAINS;
  }
  if (r < 0.4) {
    return temp < -0.3 ? BIOMES.SNOW : BIOMES.FOREST;
  }
  if (r < 0.7) {
    return temp > 0.2 ? BIOMES.JUNGLE : BIOMES.FOREST;
  }
  return BIOMES.MOUNTAINS;
}

module.exports = { BIOMES, getBiomeAt };
