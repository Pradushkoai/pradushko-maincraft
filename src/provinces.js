// ═══════════════════════════════════════════════════════════
//  provinces.js — система провинций, городов, производств и квестов
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
//  ПРОВИНЦИИ — карта мира разделена на регионы
// ═══════════════════════════════════════════════════════════

export const PROVINCES = [
  {
    id: 'central',
    name: 'Центральная провинция',
    color: '#7cba34',
    minX: 100, maxX: 156, minZ: 100, maxZ: 156,
    biome: 'PLAINS',
    description: 'Родные равнины. Здесь находится столица и озеро с рекой.',
    cities: ['capital'],
  },
  {
    id: 'northern',
    name: 'Северная провинция',
    color: '#8a8a8a',
    minX: 100, maxX: 200, minZ: 0, maxZ: 90,
    biome: 'MOUNTAINS',
    description: 'Суровые горы. Здесь добывают руду и мифрил.',
    cities: ['mining_town'],
  },
  {
    id: 'southern',
    name: 'Южная провинция',
    color: '#e6d29a',
    minX: 100, maxX: 200, minZ: 166, maxZ: 256,
    biome: 'DESERT',
    description: 'Знойная пустыня. Песок, скорпионы и древние пирамиды.',
    cities: ['desert_oasis'],
  },
  {
    id: 'eastern',
    name: 'Восточная провинция',
    color: '#3a6a1a',
    minX: 170, maxX: 256, minZ: 90, maxZ: 166,
    biome: 'FOREST',
    description: 'Густые леса. Охота, древесина и дикие звери.',
    cities: ['forest_village'],
  },
  {
    id: 'western',
    name: 'Западная провинция',
    color: '#3a6ea8',
    minX: 0, maxX: 90, minZ: 90, maxZ: 166,
    biome: 'OCEAN',
    description: 'Побережье океана. Рыболовство и морская торговля.',
    cities: ['port_town'],
  },
  {
    id: 'northeast',
    name: 'Снежная провинция',
    color: '#f0f0f8',
    minX: 170, maxX: 256, minZ: 0, maxZ: 90,
    biome: 'SNOW',
    description: 'Вечные снега. Лёд, йети и ледяные руины.',
    cities: ['frost_hold'],
  },
  {
    id: 'southeast',
    name: 'Джунглевая провинция',
    color: '#2a5a1a',
    minX: 170, maxX: 256, minZ: 166, maxZ: 256,
    biome: 'JUNGLE',
    description: 'Дикие джунгли. Редкие травы, ягуары и древние храмы.',
    cities: ['jungle_camp'],
  },
  {
    id: 'southwest',
    name: 'Болотная провинция',
    color: '#4a5a24',
    minX: 0, maxX: 90, minZ: 166, maxZ: 256,
    biome: 'SWAMP',
    description: 'Туманные болота. Ведьмы, яды и заброшенные хижины.',
    cities: ['swamp_hut_village'],
  },
  {
    id: 'northwest',
    name: 'Саванна',
    color: '#c8b86a',
    minX: 0, maxX: 90, minZ: 0, maxZ: 90,
    biome: 'SAVANNA',
    description: 'Жёлтые равнины. Львы, жирафы и баобабы.',
    cities: ['savanna_camp'],
  },
];

export function getProvinceAt(x, z) {
  for (const p of PROVINCES) {
    if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) return p;
  }
  return PROVINCES[0]; // центральная по умолчанию
}

// ═══════════════════════════════════════════════════════════
//  ГОРОДА — расположение и описание
// ═══════════════════════════════════════════════════════════

export const CITIES = {
  capital: {
    name: 'Столица',
    x: 128, z: 128,
    province: 'central',
    description: 'Главный город империи. Здесь есть кузница, пекарня, рынок и мэр.',
    buildings: ['blacksmith', 'bakery', 'market', 'tannery', 'townhall'],
    npcCount: 6,
  },
  mining_town: {
    name: 'Рудный город',
    x: 150, z: 40,
    province: 'northern',
    description: 'Горнодобывающий посёлок. Кузница и переплавка руды.',
    buildings: ['blacksmith', 'smelter', 'market'],
    npcCount: 4,
  },
  desert_oasis: {
    name: 'Оазис',
    x: 150, z: 220,
    province: 'southern',
    description: 'Торговый город в пустыне. Алхимик и рынок специй.',
    buildings: ['alchemist', 'market', 'weaver'],
    npcCount: 3,
  },
  forest_village: {
    name: 'Лесная деревня',
    x: 220, z: 128,
    province: 'eastern',
    description: 'Деревня лесорубов. Плотник и охотник.',
    buildings: ['carpenter', 'market', 'tannery'],
    npcCount: 3,
  },
  port_town: {
    name: 'Портовый город',
    x: 40, z: 128,
    province: 'western',
    description: 'Морской порт. Рыбный рынок и верфь.',
    buildings: ['fishery', 'market', 'weaver'],
    npcCount: 4,
  },
  frost_hold: {
    name: 'Морозный оплот',
    x: 220, z: 40,
    province: 'northeast',
    description: 'Крепость на снегу. Кузница и алхимик льда.',
    buildings: ['blacksmith', 'alchemist', 'market'],
    npcCount: 3,
  },
  jungle_camp: {
    name: 'Лагерь джунглей',
    x: 220, z: 220,
    province: 'southeast',
    description: 'Тайный лагерь. Алхимик и кожевник.',
    buildings: ['alchemist', 'tannery', 'market'],
    npcCount: 3,
  },
  swamp_hut_village: {
    name: 'Болотный хутор',
    x: 40, z: 220,
    province: 'southwest',
    description: 'Деревня на болоте. Алхимик ядов.',
    buildings: ['alchemist', 'market'],
    npcCount: 2,
  },
  savanna_camp: {
    name: 'Саванна-стан',
    x: 40, z: 40,
    province: 'northwest',
    description: 'Кочевой стан. Рынок и кожевник.',
    buildings: ['tannery', 'market'],
    npcCount: 2,
  },
};

// ═══════════════════════════════════════════════════════════
//  СПЕЦИАЛЬНЫЕ ПРОИЗВОДСТВА
// ═══════════════════════════════════════════════════════════

export const PRODUCTIONS = {
  blacksmith: {
    name: 'Кузница',
    blockId: 57, // anvil как символ
    icon: '🔨',
    description: 'Здесь можно выковать оружие и броню из металла.',
    recipes: [
      { input: { iron_ingot: 3, stick: 1 }, output: 'iron_sword', count: 1 },
      { input: { iron_ingot: 5 }, output: 'iron_chest', count: 1 },
      { input: { iron_ingot: 3 }, output: 'iron_helmet', count: 1 },
      { input: { iron_ingot: 3 }, output: 'iron_boots', count: 1 },
      { input: { iron_ingot: 2, stick: 1 }, output: 'iron_pickaxe', count: 1 },
      { input: { iron_ingot: 2, stick: 1 }, output: 'iron_axe', count: 1 },
      { input: { diamond: 2, stick: 1 }, output: 'diamond_sword', count: 1 },
      { input: { diamond: 4 }, output: 'diamond_chest', count: 1 },
      { input: { mythril_ingot: 2, stick: 1 }, output: 'mythril_sword', count: 1 },
      { input: { mythril_ingot: 4 }, output: 'mythril_chest', count: 1 },
      { input: { adamant_ingot: 2, stick: 1 }, output: 'adamant_sword', count: 1 },
      { input: { adamant_ingot: 4 }, output: 'adamant_chest', count: 1 },
    ],
  },
  smelter: {
    name: 'Плавильня',
    blockId: 56, // furnace
    icon: '🔥',
    description: 'Переплавка руды в слитки.',
    recipes: [
      { input: { iron_ore: 1, coal: 1 }, output: 'iron_ingot', count: 1 },
      { input: { gold_ore: 1, coal: 1 }, output: 'gold_ingot', count: 1 },
      { input: { mythril_ore: 2, coal: 2 }, output: 'mythril_ingot', count: 1 },
      { input: { adamant_ore: 3, coal: 3 }, output: 'adamant_ingot', count: 1 },
      { input: { iron_ore: 1 }, output: 'iron_ingot', count: 1 }, // упрощение
      { input: { gold_ore: 1 }, output: 'gold_ingot', count: 1 },
    ],
  },
  bakery: {
    name: 'Пекарня',
    blockId: 56, // furnace как печь
    icon: '🍞',
    description: 'Выпечка хлеба и приготовление еды.',
    recipes: [
      { input: { wheat: 3 }, output: 'bread', count: 1 },
      { input: { meat_raw: 1 }, output: 'meat_cooked', count: 1 },
      { input: { mushroom: 2 }, output: 'mushroom_stew', count: 1 },
    ],
  },
  tannery: {
    name: 'Кожевня',
    blockId: 57, // anvil
    icon: '🧥',
    description: 'Изготовление кожаной брони из кожи животных.',
    recipes: [
      { input: { leather: 5 }, output: 'leather_helmet', count: 1 },
      { input: { leather: 8 }, output: 'leather_chest', count: 1 },
      { input: { leather: 4 }, output: 'leather_boots', count: 1 },
    ],
  },
  alchemist: {
    name: 'Алхимия',
    blockId: 71, // enchant_table
    icon: '⚗️',
    description: 'Варка зелий и магических предметов.',
    recipes: [
      { input: { poison_gland: 3, stick: 1 }, output: 'swamp_venom', count: 1 },
      { input: { crystal: 1, stick: 1 }, output: 'staff_fire', count: 1 },
      { input: { ice_shard: 2, stick: 1 }, output: 'staff_ice', count: 1 },
      { input: { diamond: 1, mythril_ingot: 2 }, output: 'staff_lightning', count: 1 },
      { input: { golden_apple: 1 }, output: 'golden_apple', count: 1 }, // заглушка
    ],
  },
  carpenter: {
    name: 'Плотник',
    blockId: 17, // crafting table
    icon: '🪚',
    description: 'Изготовление мебели и деревянных предметов.',
    recipes: [
      { input: { plank: 4 }, output: 51, count: 1 }, // стол
      { input: { plank: 3 }, output: 52, count: 1 }, // стул
      { input: { wool: 3, plank: 3 }, output: 53, count: 1 }, // кровать
      { input: { plank: 6 }, output: 55, count: 1 }, // книжная полка
      { input: { plank: 6 }, output: 65, count: 3 }, // забор
      { input: { plank: 6 }, output: 67, count: 1 }, // дверь
      { input: { plank: 3 }, output: 68, count: 3 }, // лестница
    ],
  },
  market: {
    name: 'Рынок',
    blockId: 18, // chest
    icon: '💰',
    description: 'Торговля. Обмен ресурсов.',
    recipes: [
      { input: { wool: 2 }, output: 'string', count: 1 },
      { input: { string: 3 }, output: 'wool', count: 1 },
      { input: { coal: 3 }, output: 'iron_ingot', count: 1 },
      { input: { iron_ingot: 2 }, output: 'gold_ingot', count: 1 },
      { input: { gold_ingot: 3 }, output: 'diamond', count: 1 },
      { input: { leather: 2 }, output: 'feather', count: 3 },
    ],
  },
  weaver: {
    name: 'Ткач',
    blockId: 17,
    icon: '🧵',
    description: 'Изготовление тканей и одежды.',
    recipes: [
      { input: { wool: 4 }, output: 61, count: 1 }, // шерстяной блок
      { input: { wool: 2 }, output: 58, count: 3 }, // красный ковёр
      { input: { wool: 2 }, output: 59, count: 3 }, // синий ковёр
      { input: { string: 2, stick: 1 }, output: 'bow', count: 1 },
      { input: { string: 1, stick: 2 }, output: 'fishing_rod', count: 1 }, // заглушка
    ],
  },
  fishery: {
    name: 'Рыбный рынок',
    blockId: 18,
    icon: '🐟',
    description: 'Рыбная торговля.',
    recipes: [
      { input: { meat_raw: 1 }, output: 'fish_cooked', count: 1 },
      { input: { meat_raw: 2 }, output: 'bread', count: 1 }, // обмен
      { input: { shark_tooth: 3, iron_ingot: 1 }, output: 'arrow_iron', count: 4 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
//  КВЕСТЫ
// ═══════════════════════════════════════════════════════════

export const QUEST_TEMPLATES = [
  {
    id: 'kill_zombies',
    npc: 'Мэр',
    title: 'Угроза нежити',
    description: 'В окрестностях города появились зомби. Убей 5 зомби.',
    type: 'kill',
    target: 'zombie',
    count: 5,
    reward: { item: 'iron_sword', count: 1 },
    rewardText: 'Железный меч',
  },
  {
    id: 'collect_wood',
    npc: 'Плотник',
    title: 'Запасы древесины',
    description: 'Принеси 20 брёвен для строительства.',
    type: 'collect',
    target: 5, // wood block id
    count: 20,
    reward: { item: 'iron_axe', count: 1 },
    rewardText: 'Железный топор',
  },
  {
    id: 'kill_boss_forest',
    npc: 'Мэр',
    title: 'Лесная угроза',
    description: 'Победи Лесного Голема — босса лесной провинции.',
    type: 'kill_boss',
    target: 'golem_forest',
    count: 1,
    reward: { item: 'forest_blade', count: 1 },
    rewardText: 'Лесной клинок',
  },
  {
    id: 'collect_iron',
    npc: 'Кузнец',
    title: 'Руда для кузницы',
    description: 'Принеси 10 железной руды для кузницы.',
    type: 'collect',
    target: 'iron_ore',
    count: 10,
    reward: { item: 'iron_pickaxe', count: 1 },
    rewardText: 'Железная кирка',
  },
  {
    id: 'kill_wolves',
    npc: 'Охотник',
    title: 'Волчья стая',
    description: 'Убей 5 волков, которые нападают на скот.',
    type: 'kill',
    target: 'wolf',
    count: 5,
    reward: { item: 'leather_chest', count: 1 },
    rewardText: 'Кожаный нагрудник',
  },
  {
    id: 'collect_leather',
    npc: 'Кожевник',
    title: 'Кожа для брони',
    description: 'Принеси 10 кусков кожи.',
    type: 'collect',
    target: 'leather',
    count: 10,
    reward: { item: 'leather_boots', count: 1 },
    rewardText: 'Кожаные ботинки',
  },
  {
    id: 'kill_skeletons',
    npc: 'Мэр',
    title: 'Костяная угроза',
    description: 'Убей 5 скелетов из подземелья.',
    type: 'kill',
    target: 'skeleton',
    count: 5,
    reward: { item: 'bow', count: 1, extra: { item: 'arrow', count: 10 } },
    rewardText: 'Лук + 10 стрел',
  },
  {
    id: 'find_diamonds',
    npc: 'Кузнец',
    title: 'Алмазы для короны',
    description: 'Добудь 3 алмаза из глубины.',
    type: 'collect',
    target: 'diamond',
    count: 3,
    reward: { item: 'diamond_pickaxe', count: 1 },
    rewardText: 'Алмазная кирка',
  },
  {
    id: 'kill_boss_ice',
    npc: 'Мэр',
    title: 'Ледяной кошмар',
    description: 'Победи Ледяного Короля в снежной провинции.',
    type: 'kill_boss',
    target: 'ice_king',
    count: 1,
    reward: { item: 'ice_crown', count: 1 },
    rewardText: 'Ледяная корона',
  },
  {
    id: 'kill_boss_desert',
    npc: 'Торговец',
    title: 'Песчаный ужас',
    description: 'Победи Песчаного Червя в пустыне.',
    type: 'kill_boss',
    target: 'sand_worm',
    count: 1,
    reward: { item: 'sand_reaper', count: 1 },
    rewardText: 'Жнец песков',
  },
];

// Состояние квестов игрока
export const questState = {
  active: [],      // активные квесты
  completed: [],   // завершённые квесты
  // { id, template, progress: 0, npc: {x,y,z} }
};

// NPC в городах
export const npcs = [];

export function spawnCityNPCs() {
  for (const cityId in CITIES) {
    const city = CITIES[cityId];
    const questNpcs = Math.min(city.npcCount, QUEST_TEMPLATES.length);
    for (let i = 0; i < questNpcs; i++) {
      const template = QUEST_TEMPLATES[i % QUEST_TEMPLATES.length];
      // NPC стоит в городе
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetZ = (Math.random() - 0.5) * 8;
      npcs.push({
        id: `${cityId}_npc_${i}`,
        cityId: cityId,
        name: template.npc,
        x: city.x + offsetX,
        z: city.z + offsetZ,
        quest: template,
        hasQuest: !questState.completed.includes(template.id),
      });
    }
  }
}

export function getNearbyNPC(maxDist = 4) {
  for (const npc of npcs) {
    const dx = npc.x - player.pos.x;
    const dz = npc.z - player.pos.z;
    if (Math.sqrt(dx*dx + dz*dz) < maxDist) return npc;
  }
  return null;
}

export function updateQuestProgress(type, target, count = 1) {
  for (const q of questState.active) {
    if (q.template.type === type) {
      if (q.template.target === target || q.template.target === parseInt(target)) {
        q.progress = Math.min(q.template.count, q.progress + count);
        if (q.progress >= q.template.count) {
          // Квест выполнен — но не завершён, пока игрок не сдал его NPC
          flashHint('📋 Квест выполнен! Вернись к NPC.');
        }
      }
    }
  }
}

export function tryCompleteQuest(npc) {
  for (let i = questState.active.length - 1; i >= 0; i--) {
    const q = questState.active[i];
    if (q.template.id === npc.quest.id && q.progress >= q.template.count) {
      // Выдаём награду
      const reward = q.template.reward;
      addItemToInventory(reward.item, reward.count);
      if (reward.extra) addItemToInventory(reward.extra.item, reward.extra.count);
      flashHint(`🎉 Квест выполнен! Награда: ${q.template.rewardText}`);
      questState.completed.push(q.template.id);
      questState.active.splice(i, 1);
      npc.hasQuest = false;
      return true;
    }
  }
  return false;
}

export function acceptQuest(npc) {
  if (!npc.hasQuest) return false;
  if (questState.active.find(q => q.template.id === npc.quest.id)) {
    flashHint('У тебя уже есть этот квест');
    return false;
  }
  questState.active.push({
    id: npc.quest.id,
    template: npc.quest,
    progress: 0,
  });
  flashHint(`📋 Новый квест: ${npc.quest.title}`);
  return true;
}


