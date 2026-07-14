// ═══════════════════════════════════════════════════════════
//  items.js — все предметы: материалы, оружие, броня, еда, декор
//  Раритеты: common / uncommon / rare / mythic / legendary
// ═══════════════════════════════════════════════════════════

const RARITY = {
  COMMON:    { name:'Обычное',      color:0xffffff, glow:0x000000 },
  UNCOMMON:  { name:'Улучшенное',   color:0x4aff4a, glow:0x1a3a1a },
  RARE:      { name:'Редкое',       color:0x4a9aff, glow:0x1a2a4a },
  MYTHIC:    { name:'Мифическое',   color:0xc84aff, glow:0x3a1a4a },
  LEGENDARY: { name:'Легендарное',  color:0xffaa3a, glow:0x4a3a1a },
};

const ITEMS = {
  // ═══════════════════════════════════════════════════════════
  //  МАТЕРИАЛЫ
  // ═══════════════════════════════════════════════════════════
  stick:          { name:'Палка',            color:0x8b5a2b, type:'material', rarity:'COMMON' },
  coal:           { name:'Уголь',            color:0x1a1a1a, type:'material', rarity:'COMMON' },
  iron_ore:       { name:'Железная руда',    color:0xd8a878, type:'material', rarity:'COMMON' },
  iron_ingot:     { name:'Железный слиток',  color:0xd8d8d8, type:'material', rarity:'UNCOMMON' },
  gold_ore:       { name:'Золотая руда',     color:0xfada5e, type:'material', rarity:'UNCOMMON' },
  gold_ingot:     { name:'Золотой слиток',   color:0xffd700, type:'material', rarity:'RARE' },
  diamond:        { name:'Алмаз',            color:0x5edfd5, type:'material', rarity:'RARE' },
  emerald:        { name:'Изумруд',          color:0x3aff7a, type:'material', rarity:'RARE' },
  leather:        { name:'Кожа',             color:0x8b5a2b, type:'material', rarity:'COMMON' },
  wool:           { name:'Шерсть',           color:0xf0f0f0, type:'material', rarity:'COMMON' },
  feather:        { name:'Перо',             color:0xf0f0f0, type:'material', rarity:'COMMON' },
  bone:           { name:'Кость',            color:0xf0f0e0, type:'material', rarity:'COMMON' },
  string:         { name:'Нить',             color:0xf0f0f0, type:'material', rarity:'COMMON' },
  torch:          { name:'Факел',            color:0xffa500, type:'material', rarity:'COMMON' },
  flower:         { name:'Цветок',           color:0xd83a3a, type:'material', rarity:'COMMON' },
  mushroom:       { name:'Гриб',             color:0xc83a3a, type:'material', rarity:'COMMON' },
  vines:          { name:'Лозы',             color:0x2a6a1a, type:'material', rarity:'COMMON' },
  bamboo:         { name:'Бамбук',           color:0x7aa84a, type:'material', rarity:'COMMON' },
  crystal:        { name:'Кристалл',         color:0xffaa5e, type:'material', rarity:'MYTHIC' },
  mythril_ore:    { name:'Мифриловая руда',  color:0x5ac8c8, type:'material', rarity:'MYTHIC' },
  mythril_ingot:  { name:'Мифриловый слиток',color:0x5ac8c8, type:'material', rarity:'MYTHIC' },
  adamant_ore:    { name:'Адамантитовая руда',color:0xc85a5a, type:'material', rarity:'LEGENDARY' },
  adamant_ingot:  { name:'Адамантитовый слиток',color:0xc85a5a, type:'material', rarity:'LEGENDARY' },
  dragon_scale:   { name:'Чешуя дракона',    color:0xc83a3a, type:'material', rarity:'LEGENDARY' },
  golem_core:     { name:'Ядро голема',      color:0xffd700, type:'material', rarity:'LEGENDARY' },
  ice_shard:      { name:'Осколок льда',     color:0x8ac8e8, type:'material', rarity:'RARE' },
  poison_gland:   { name:'Ядовитая железа',  color:0x6aaa3a, type:'material', rarity:'UNCOMMON' },
  spider_silk:    { name:'Паутина',          color:0xf0f0f0, type:'material', rarity:'UNCOMMON' },
  shark_tooth:    { name:'Зуб акулы',        color:0xf0f0f0, type:'material', rarity:'RARE' },
  serpent_scale:  { name:'Чешуя змея',       color:0x4a8a4a, type:'material', rarity:'LEGENDARY' },

  // ═══════════════════════════════════════════════════════════
  //  ЕДА
  // ═══════════════════════════════════════════════════════════
  meat_raw:       { name:'Сырое мясо',       color:0xc88a8a, type:'food', heal:2 },
  meat_cooked:    { name:'Жареное мясо',     color:0x8b5a2b, type:'food', heal:6 },
  rotten_flesh:   { name:'Гнилая плоть',     color:0x5a4a3a, type:'food', heal:1 },
  apple:          { name:'Яблоко',           color:0xe83a3a, type:'food', heal:3 },
  golden_apple:   { name:'Золотое яблоко',   color:0xffd700, type:'food', heal:10, rarity:'RARE' },
  berry:          { name:'Ягоды',            color:0xc83a5a, type:'food', heal:1 },
  mushroom_stew:  { name:'Грибной суп',      color:0xc8a060, type:'food', heal:5 },
  bread:          { name:'Хлеб',             color:0xc8a060, type:'food', heal:4 },
  fish_cooked:    { name:'Жареная рыба',     color:0xd8d8a0, type:'food', heal:4 },
  honey:          { name:'Мёд',              color:0xffd95e, type:'food', heal:3 },

  // ═══════════════════════════════════════════════════════════
  //  БОЕПРИПАСЫ
  // ═══════════════════════════════════════════════════════════
  arrow:          { name:'Стрела',           color:0x8b5a2b, type:'ammo', rarity:'COMMON' },
  arrow_iron:     { name:'Железная стрела',  color:0xd8d8d8, type:'ammo', dmg:2, rarity:'UNCOMMON' },
  arrow_explosive:{ name:'Взрывная стрела',  color:0xff5a3a, type:'ammo', dmg:5, rarity:'RARE' },
  arrow_mythril:  { name:'Мифриловая стрела',color:0x5ac8c8, type:'ammo', dmg:8, rarity:'MYTHIC' },

  // ═══════════════════════════════════════════════════════════
  //  МЕЧИ (по материалам, от слабых к легендарным)
  // ═══════════════════════════════════════════════════════════
  wood_sword:     { name:'Деревянный меч',   color:0xc89a4a, type:'weapon', subtype:'sword', dmg:3,  durability:60,  rarity:'COMMON' },
  stone_sword:    { name:'Каменный меч',     color:0x888888, type:'weapon', subtype:'sword', dmg:5,  durability:130, rarity:'COMMON' },
  iron_sword:     { name:'Железный меч',     color:0xd8d8d8, type:'weapon', subtype:'sword', dmg:7,  durability:250, rarity:'UNCOMMON' },
  golden_sword:   { name:'Золотой меч',      color:0xffd700, type:'weapon', subtype:'sword', dmg:6,  durability:200, rarity:'UNCOMMON' },
  diamond_sword:  { name:'Алмазный меч',     color:0x5edfd5, type:'weapon', subtype:'sword', dmg:10, durability:1500, rarity:'RARE' },
  mythril_sword:  { name:'Мифриловый меч',   color:0x5ac8c8, type:'weapon', subtype:'sword', dmg:14, durability:2000, rarity:'MYTHIC', critChance:0.2 },
  adamant_sword:  { name:'Адамантитовый меч',color:0xc85a5a, type:'weapon', subtype:'sword', dmg:18, durability:3000, rarity:'LEGENDARY', critChance:0.3 },
  dragon_sword:   { name:'Меч дракона',      color:0xc83a3a, type:'weapon', subtype:'sword', dmg:22, durability:5000, rarity:'LEGENDARY', critChance:0.4, fireDamage:3 },

  // Особые мечи с боссов
  forest_blade:   { name:'Лесной клинок',    color:0x4a8a2a, type:'weapon', subtype:'sword', dmg:12, durability:1500, rarity:'MYTHIC', poison:2 },
  swamp_venom:    { name:'Болотный яд',      color:0x6aaa3a, type:'weapon', subtype:'sword', dmg:11, durability:1500, rarity:'MYTHIC', poison:5 },
  sand_reaper:    { name:'Жнец песков',      color:0xe6d29a, type:'weapon', subtype:'sword', dmg:13, durability:1800, rarity:'MYTHIC', slowEffect:true },
  ice_fang:       { name:'Ледяной клык',     color:0x8ac8e8, type:'weapon', subtype:'sword', dmg:13, durability:1800, rarity:'MYTHIC', slowEffect:true },
  jungle_fury:    { name:'Ярость джунглей',  color:0x3a7a2a, type:'weapon', subtype:'sword', dmg:15, durability:2000, rarity:'LEGENDARY', critChance:0.25, poison:3 },
  titan_hammer:   { name:'Молот титана',     color:0x888888, type:'weapon', subtype:'sword', dmg:20, durability:3000, rarity:'LEGENDARY', knockback:3 },
  serpent_trident:{ name:'Трезубец змея',    color:0x4a8a4a, type:'weapon', subtype:'sword', dmg:25, durability:4000, rarity:'LEGENDARY', waterBreathing:true },
  lion_claw:      { name:'Коготь льва',      color:0xffaa3a, type:'weapon', subtype:'sword', dmg:16, durability:2200, rarity:'LEGENDARY', critChance:0.35 },

  // ═══════════════════════════════════════════════════════════
  //  ТЯЖЁЛОЕ ОРУЖИЕ
  // ═══════════════════════════════════════════════════════════
  wood_axe:       { name:'Дерев. топор',     color:0xc89a4a, type:'weapon', subtype:'axe', dmg:4,  durability:60,  rarity:'COMMON', slow:true },
  iron_axe:       { name:'Железный топор',   color:0xd8d8d8, type:'weapon', subtype:'axe', dmg:8,  durability:250, rarity:'UNCOMMON', slow:true },
  diamond_axe:    { name:'Алмазный топор',   color:0x5edfd5, type:'weapon', subtype:'axe', dmg:11, durability:1500, rarity:'RARE', slow:true },
  war_hammer:     { name:'Боевой молот',     color:0x444444, type:'weapon', subtype:'axe', dmg:15, durability:2000, rarity:'MYTHIC', knockback:5, slow:true },

  // ═══════════════════════════════════════════════════════════
  //  ЛУКИ
  // ═══════════════════════════════════════════════════════════
  bow:            { name:'Лук',              color:0x8b5a2b, type:'weapon', subtype:'bow', ranged:true, dmg:6,  durability:300, rarity:'COMMON' },
  bow_iron:       { name:'Железный лук',     color:0xd8d8d8, type:'weapon', subtype:'bow', ranged:true, dmg:9,  durability:500, rarity:'UNCOMMON' },
  bow_diamond:    { name:'Алмазный лук',     color:0x5edfd5, type:'weapon', subtype:'bow', ranged:true, dmg:13, durability:2000, rarity:'RARE' },
  bow_mythril:    { name:'Мифриловый лук',   color:0x5ac8c8, type:'weapon', subtype:'bow', ranged:true, dmg:18, durability:3000, rarity:'MYTHIC', critChance:0.25 },
  bow_dragon:     { name:'Драконий лук',     color:0xc83a3a, type:'weapon', subtype:'bow', ranged:true, dmg:25, durability:5000, rarity:'LEGENDARY', critChance:0.4, fireDamage:4 },

  // ═══════════════════════════════════════════════════════════
  //  МАГИЧЕСКОЕ ОРУЖИЕ
  // ═══════════════════════════════════════════════════════════
  staff_fire:     { name:'Посох огня',       color:0xe85a2a, type:'weapon', subtype:'staff', ranged:true, magic:true, dmg:10, durability:1000, rarity:'MYTHIC', manaCost:10, effect:'fire' },
  staff_ice:      { name:'Посох льда',       color:0x8ac8e8, type:'weapon', subtype:'staff', ranged:true, magic:true, dmg:9,  durability:1000, rarity:'MYTHIC', manaCost:10, effect:'slow' },
  staff_lightning:{ name:'Посох молний',     color:0xffff5a, type:'weapon', subtype:'staff', ranged:true, magic:true, dmg:15, durability:2000, rarity:'LEGENDARY', manaCost:20, effect:'lightning' },

  // ═══════════════════════════════════════════════════════════
  //  КИРКИ
  // ═══════════════════════════════════════════════════════════
  wood_pickaxe:   { name:'Дерев. кирка',     color:0xc89a4a, type:'tool', tier:1, durability:60,  rarity:'COMMON' },
  stone_pickaxe:  { name:'Камен. кирка',     color:0x888888, type:'tool', tier:2, durability:130, rarity:'COMMON' },
  iron_pickaxe:   { name:'Желез. кирка',     color:0xd8d8d8, type:'tool', tier:3, durability:250, rarity:'UNCOMMON' },
  diamond_pickaxe:{ name:'Алмаз. кирка',     color:0x5edfd5, type:'tool', tier:4, durability:1500, rarity:'RARE' },
  mythril_pickaxe:{ name:'Мифрил. кирка',    color:0x5ac8c8, type:'tool', tier:5, durability:2000, rarity:'MYTHIC' },

  // Топоры для рубки
  wood_axe_tool:  { name:'Дерев. плотницкий топор', color:0xc89a4a, type:'tool', subtype:'axe', tier:1, durability:60, rarity:'COMMON' },
  iron_axe_tool:  { name:'Желез. плотницкий топор',  color:0xd8d8d8, type:'tool', subtype:'axe', tier:3, durability:250, rarity:'UNCOMMON' },

  // ═══════════════════════════════════════════════════════════
  //  БРОНЯ (3 слота: helmet, chest, boots)
  // ═══════════════════════════════════════════════════════════
  // Кожаная
  leather_helmet: { name:'Кожаный шлем',     color:0x8b5a2b, type:'armor', slot:'helmet', def:1, durability:80,  rarity:'COMMON' },
  leather_chest:  { name:'Кожаный нагрудник',color:0x8b5a2b, type:'armor', slot:'chest',  def:3, durability:120, rarity:'COMMON' },
  leather_boots:  { name:'Кожаные ботинки',  color:0x8b5a2b, type:'armor', slot:'boots',  def:1, durability:80,  rarity:'COMMON' },
  // Железная
  iron_helmet:    { name:'Железный шлем',    color:0xd8d8d8, type:'armor', slot:'helmet', def:2, durability:200, rarity:'UNCOMMON' },
  iron_chest:     { name:'Железный нагрудник',color:0xd8d8d8, type:'armor', slot:'chest',  def:6, durability:300, rarity:'UNCOMMON' },
  iron_boots:     { name:'Железные ботинки', color:0xd8d8d8, type:'armor', slot:'boots',  def:2, durability:200, rarity:'UNCOMMON' },
  // Золотая (красивая, но слабая)
  gold_helmet:    { name:'Золотой шлем',     color:0xffd700, type:'armor', slot:'helmet', def:2, durability:150, rarity:'UNCOMMON' },
  gold_chest:     { name:'Золотой нагрудник',color:0xffd700, type:'armor', slot:'chest',  def:5, durability:200, rarity:'UNCOMMON' },
  gold_boots:     { name:'Золотые ботинки',  color:0xffd700, type:'armor', slot:'boots',  def:2, durability:150, rarity:'UNCOMMON' },
  // Алмазная
  diamond_helmet: { name:'Алмазный шлем',    color:0x5edfd5, type:'armor', slot:'helmet', def:3, durability:400, rarity:'RARE' },
  diamond_chest:  { name:'Алмазный нагрудник',color:0x5edfd5, type:'armor', slot:'chest',  def:8, durability:600, rarity:'RARE' },
  diamond_boots:  { name:'Алмазные ботинки', color:0x5edfd5, type:'armor', slot:'boots',  def:3, durability:400, rarity:'RARE' },
  // Мифриловая
  mythril_helmet: { name:'Мифриловый шлем',  color:0x5ac8c8, type:'armor', slot:'helmet', def:5, durability:800, rarity:'MYTHIC', manaBoost:20 },
  mythril_chest:  { name:'Мифриловый нагрудник',color:0x5ac8c8, type:'armor', slot:'chest',  def:12,durability:1200,rarity:'MYTHIC', manaBoost:30 },
  mythril_boots:  { name:'Мифриловые ботинки',color:0x5ac8c8, type:'armor', slot:'boots',  def:5, durability:800, rarity:'MYTHIC', speedBoost:1.3 },
  // Адамантитовая
  adamant_helmet: { name:'Адамантитовый шлем',color:0xc85a5a, type:'armor', slot:'helmet', def:7, durability:1500, rarity:'LEGENDARY' },
  adamant_chest:  { name:'Адамантитовый нагрудник',color:0xc85a5a, type:'armor', slot:'chest',  def:16,durability:2500,rarity:'LEGENDARY' },
  adamant_boots:  { name:'Адамантитовые ботинки',color:0xc85a5a, type:'armor', slot:'boots',  def:7, durability:1500, rarity:'LEGENDARY', speedBoost:1.2 },
  // Драконья (из драконьих чешуй)
  dragon_helmet:  { name:'Шлем дракона',     color:0xc83a3a, type:'armor', slot:'helmet', def:9, durability:3000, rarity:'LEGENDARY', fireResist:0.5 },
  dragon_chest:   { name:'Нагрудник дракона',color:0xc83a3a, type:'armor', slot:'chest',  def:20,durability:5000,rarity:'LEGENDARY', fireResist:0.7 },
  dragon_boots:   { name:'Ботинки дракона',  color:0xc83a3a, type:'armor', slot:'boots',  def:9, durability:3000, rarity:'LEGENDARY', speedBoost:1.4, fireResist:0.5 },

  // Особая броня с боссов
  golem_armor:    { name:'Броня голема',     color:0x888888, type:'armor', slot:'chest',  def:18,durability:3000,rarity:'LEGENDARY', knockbackResist:true },
  ice_crown:      { name:'Ледяная корона',   color:0x8ac8e8, type:'armor', slot:'helmet', def:6, durability:2000, rarity:'LEGENDARY', slowImmunity:true },
  serpent_scale_armor: { name:'Чешуя змея',  color:0x4a8a4a, type:'armor', slot:'chest',  def:17,durability:3500,rarity:'LEGENDARY', waterBreathing:true },
  jungle_cloak:   { name:'Плащ джунглей',    color:0x3a7a2a, type:'armor', slot:'chest',  def:10,durability:2000,rarity:'MYTHIC', speedBoost:1.3, poisonImmunity:true },
  sand_veil:      { name:'Покрывало песков', color:0xe6d29a, type:'armor', slot:'helmet', def:4, durability:1500, rarity:'MYTHIC', heatImmunity:true },
};

module.exports = { ITEMS, RARITY };
