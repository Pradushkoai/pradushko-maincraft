// ═══════════════════════════════════════════════════════════
//  recipes.js — рецепты крафта (сетка 3x3)
//  pattern: 3 строки по 3 символа, keys: буква → id блока или ключ предмета
// ═══════════════════════════════════════════════════════════

const RECIPES = [
  // ═══ БАЗОВЫЕ ═══
  { result:'stick', count:4, pattern:['  ','P ','P '], keys:{P:8} },
  { result:17, count:1, pattern:['PP ','PP ','   '], keys:{P:8} },          // crafting table
  { result:'torch', count:4, pattern:['C ','S ','  '], keys:{C:'coal', S:'stick'} },
  { result:56, count:1, pattern:['SSS','S S','SSS'], keys:{S:3} },          // печь
  { result:55, count:1, pattern:['P P','PPP','P P'], keys:{P:8} },          // книжная полка

  // ═══ ДОСКИ И БЛОКИ ═══
  { result:8, count:4, pattern:['W  ','   ','   '], keys:{W:5} },           // дубовые доски
  { result:8, count:4, pattern:['W  ','   ','   '], keys:{W:21} },          // еловые доски
  { result:8, count:4, pattern:['W  ','   ','   '], keys:{W:36} },          // джунглевые доски
  { result:61, count:1, pattern:['WWW','WWW','WWW'], keys:{W:'wool'} },     // белый шерстяной блок
  { result:62, count:1, pattern:['WWW','WWW','WWW'], keys:{W:'wool'}, extraColor:0x2a2a2a },
  { result:30, count:1, pattern:['III','III','III'], keys:{I:'iron_ingot'} },  // железный блок
  { result:32, count:1, pattern:['III','III','III'], keys:{I:'gold_ingot'} },  // золотой блок
  { result:33, count:1, pattern:['DDD','DDD','DDD'], keys:{D:'diamond'} },     // алмазный блок
  { result:78, count:1, pattern:['MMM','MMM','MMM'], keys:{M:'mythril_ingot'} }, // мифриловый блок
  { result:80, count:1, pattern:['AAA','AAA','AAA'], keys:{A:'adamant_ingot'} }, // адамантитовый блок

  // ═══ ПЕРЕПЛАВКА (упрощённо, без печи — 1 руда → 1 слиток) ═══
  { result:'iron_ingot', count:1, pattern:['I  ','   ','   '], keys:{I:'iron_ore'} },
  { result:'gold_ingot', count:1, pattern:['I  ','   ','   '], keys:{I:'gold_ore'} },
  { result:'mythril_ingot', count:1, pattern:['I C ','   ','   '], keys:{I:'mythril_ore', C:'coal'} },
  { result:'adamant_ingot', count:1, pattern:['I CC','   ','   '], keys:{I:'adamant_ore', C:'coal'} },

  // ═══ КИРКИ ═══
  { result:'wood_pickaxe', count:1, pattern:['PPP',' S ',' S '], keys:{P:8, S:'stick'} },
  { result:'stone_pickaxe', count:1, pattern:['PPP',' S ',' S '], keys:{P:4, S:'stick'} },
  { result:'iron_pickaxe', count:1, pattern:['PPP',' S ',' S '], keys:{P:'iron_ingot', S:'stick'} },
  { result:'diamond_pickaxe', count:1, pattern:['PPP',' S ',' S '], keys:{P:'diamond', S:'stick'} },
  { result:'mythril_pickaxe', count:1, pattern:['PPP',' S ',' S '], keys:{P:'mythril_ingot', S:'stick'} },

  // ═══ МЕЧИ (по материалам) ═══
  { result:'wood_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:8, S:'stick'} },
  { result:'stone_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:4, S:'stick'} },
  { result:'iron_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:'iron_ingot', S:'stick'} },
  { result:'golden_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:'gold_ingot', S:'stick'} },
  { result:'diamond_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:'diamond', S:'stick'} },
  { result:'mythril_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:'mythril_ingot', S:'stick'} },
  { result:'adamant_sword', count:1, pattern:['P  ','P  ','S  '], keys:{P:'adamant_ingot', S:'stick'} },
  { result:'dragon_sword', count:1, pattern:['D D','P P','S S'], keys:{D:'dragon_scale', P:'iron_ingot', S:'stick'} },

  // ═══ ТОПОРЫ (тяжёлое оружие) ═══
  { result:'wood_axe', count:1, pattern:['PP ','PS ',' S '], keys:{P:8, S:'stick'} },
  { result:'iron_axe', count:1, pattern:['PP ','PS ',' S '], keys:{P:'iron_ingot', S:'stick'} },
  { result:'diamond_axe', count:1, pattern:['PP ','PS ',' S '], keys:{P:'diamond', S:'stick'} },
  { result:'war_hammer', count:1, pattern:['AAA','ASA',' S '], keys:{A:'adamant_ingot', S:'stick'} },

  // ═══ ЛУКИ И СТРЕЛЫ ═══
  { result:'bow', count:1, pattern:['S  ','S|','S  '], keys:{S:'stick', '|':'string'} },
  { result:'bow_iron', count:1, pattern:['S  ','S|','S  '], keys:{S:'iron_ingot', '|':'string'} },
  { result:'bow_diamond', count:1, pattern:['S  ','S|','S  '], keys:{S:'diamond', '|':'string'} },
  { result:'bow_mythril', count:1, pattern:['S  ','S|','S  '], keys:{S:'mythril_ingot', '|':'string'} },
  { result:'bow_dragon', count:1, pattern:['S  ','S|','S  '], keys:{S:'dragon_scale', '|':'string'} },

  { result:'arrow', count:4, pattern:[' F ',' S ','I  '], keys:{F:'feather', S:'stick', I:'iron_ingot'} },
  { result:'arrow_iron', count:4, pattern:[' F ',' S ','II '], keys:{F:'feather', S:'stick', I:'iron_ingot'} },
  { result:'arrow_explosive', count:2, pattern:[' F ',' S ','C C'], keys:{F:'feather', S:'stick', C:'coal'} },
  { result:'arrow_mythril', count:2, pattern:[' F ',' S ','M M'], keys:{F:'feather', S:'stick', M:'mythril_ingot'} },

  // ═══ МАГИЧЕСКИЕ ПОСОХИ ═══
  { result:'staff_fire', count:1, pattern:['  C',' S ','S  '], keys:{C:'crystal', S:'stick'} },
  { result:'staff_ice', count:1, pattern:['  I',' S ','S  '], keys:{I:'ice_shard', S:'stick'} },
  { result:'staff_lightning', count:1, pattern:['  D',' M ','M  '], keys:{D:'diamond', M:'mythril_ingot'} },

  // ═══ КОЖАНАЯ БРОНЯ ═══
  { result:'leather_helmet', count:1, pattern:['LLL','L L','   '], keys:{L:'leather'} },
  { result:'leather_chest', count:1, pattern:['L L','LLL','LLL'], keys:{L:'leather'} },
  { result:'leather_boots', count:1, pattern:['   ','L L','L L'], keys:{L:'leather'} },

  // ═══ ЖЕЛЕЗНАЯ БРОНЯ ═══
  { result:'iron_helmet', count:1, pattern:['III','I I','   '], keys:{I:'iron_ingot'} },
  { result:'iron_chest', count:1, pattern:['I I','III','III'], keys:{I:'iron_ingot'} },
  { result:'iron_boots', count:1, pattern:['   ','I I','I I'], keys:{I:'iron_ingot'} },

  // ═══ ЗОЛОТАЯ БРОНЯ ═══
  { result:'gold_helmet', count:1, pattern:['GGG','G G','   '], keys:{G:'gold_ingot'} },
  { result:'gold_chest', count:1, pattern:['G G','GGG','GGG'], keys:{G:'gold_ingot'} },
  { result:'gold_boots', count:1, pattern:['   ','G G','G G'], keys:{G:'gold_ingot'} },

  // ═══ АЛМАЗНАЯ БРОНЯ ═══
  { result:'diamond_helmet', count:1, pattern:['DDD','D D','   '], keys:{D:'diamond'} },
  { result:'diamond_chest', count:1, pattern:['D D','DDD','DDD'], keys:{D:'diamond'} },
  { result:'diamond_boots', count:1, pattern:['   ','D D','D D'], keys:{D:'diamond'} },

  // ═══ МИФРИЛОВАЯ БРОНЯ ═══
  { result:'mythril_helmet', count:1, pattern:['MMM','M M','   '], keys:{M:'mythril_ingot'} },
  { result:'mythril_chest', count:1, pattern:['M M','MMM','MMM'], keys:{M:'mythril_ingot'} },
  { result:'mythril_boots', count:1, pattern:['   ','M M','M M'], keys:{M:'mythril_ingot'} },

  // ═══ АДАМАНТИТОВАЯ БРОНЯ ═══
  { result:'adamant_helmet', count:1, pattern:['AAA','A A','   '], keys:{A:'adamant_ingot'} },
  { result:'adamant_chest', count:1, pattern:['A A','AAA','AAA'], keys:{A:'adamant_ingot'} },
  { result:'adamant_boots', count:1, pattern:['   ','A A','A A'], keys:{A:'adamant_ingot'} },

  // ═══ ДРАКОНЬЯ БРОНЯ ═══
  { result:'dragon_helmet', count:1, pattern:['DDD','D D','   '], keys:{D:'dragon_scale'} },
  { result:'dragon_chest', count:1, pattern:['D D','DDD','DDD'], keys:{D:'dragon_scale'} },
  { result:'dragon_boots', count:1, pattern:['   ','D D','D D'], keys:{D:'dragon_scale'} },

  // ═══ МЕБЕЛЬ И ДЕКОР ═══
  { result:51, count:1, pattern:['   ','PPP','P P'], keys:{P:8} },          // стол
  { result:52, count:1, pattern:['P  ','P  ','PP '], keys:{P:8} },          // стул
  { result:53, count:1, pattern:['WWW','W W','W W'], keys:{W:'wool'} },     // кровать
  { result:54, count:1, pattern:['G  ','S  ','S  '], keys:{G:'glowstone', S:'stick'} }, // лампа
  { result:58, count:1, pattern:['WW ','WW ','   '], keys:{W:'wool'} },     // красный ковёр
  { result:59, count:1, pattern:['WW ','WW ','   '], keys:{W:'wool'} },     // синий ковёр
  { result:65, count:1, pattern:['P  ','P  ','P  '], keys:{P:8} },          // забор
  { result:66, count:1, pattern:['P P','P P','P P'], keys:{P:8} },          // калитка
  { result:67, count:1, pattern:['PP ','PP ','PP '], keys:{P:8} },          // дверь
  { result:68, count:1, pattern:['P  ','P  ','P  '], keys:{P:8} },          // лестница
  { result:70, count:1, pattern:[' B ',' B ',' B '], keys:{B:4} },          // горшок

  // ═══ СТЕКЛО И КИРПИЧ ═══
  { result:9, count:1, pattern:['S  ','   ','   '], keys:{S:7} },           // стекло из песка
  { result:10, count:4, pattern:['SS ','SS ','   '], keys:{S:7} },          // кирпич из песка

  // ═══ ЗОЛОТОЕ ЯБЛОКО ═══
  { result:'golden_apple', count:1, pattern:['GGG','GAG','GGG'], keys:{G:'gold_ingot', A:'apple'} },

  // ═══ ХЛЕБ И СУП ═══
  { result:'bread', count:1, pattern:['WWW','   ','   '], keys:{W:'wheat'} },
  { result:'mushroom_stew', count:1, pattern:['M  ','M  ','B  '], keys:{M:'mushroom', B:28} }, // тыква как миска (упрощение)

  // ═══ ОСОБОЕ СНАРЯЖЕНИЕ С БОССОВ (можно скрафтить, если есть материалы) ═══
  { result:'forest_blade', count:1, pattern:['  S',' SL','SL '], keys:{S:'stick', L:'leather'} },
  { result:'swamp_venom', count:1, pattern:[' P ','PS ',' S '], keys:{P:'poison_gland', S:'stick'} },
  { result:'ice_fang', count:1, pattern:['  I',' IS',' S '], keys:{I:'ice_shard', S:'stick'} },
  { result:'sand_reaper', count:1, pattern:['  B',' BS',' S '], keys:{B:'bamboo', S:'stick'} },
  { result:'jungle_fury', count:1, pattern:['  V',' VS',' S '], keys:{V:'vines', S:'stick'} },
  { result:'titan_hammer', count:1, pattern:['AAA','ASA',' S '], keys:{A:'adamant_ingot', S:'stick'} },
  { result:'serpent_trident', count:1, pattern:['  S','SPS',' S '], keys:{S:'serpent_scale', P:'iron_ingot'} },
  { result:'lion_claw', count:1, pattern:['  L',' LL',' S '], keys:{L:'leather', S:'stick'} },

  // Особая броня
  { result:'golem_armor', count:1, pattern:['G G','GGG','GGG'], keys:{G:'golem_core'} },
  { result:'ice_crown', count:1, pattern:['I I','III','   '], keys:{I:'ice_shard'} },
  { result:'serpent_scale_armor', count:1, pattern:['S S','SSS','SSS'], keys:{S:'serpent_scale'} },
  { result:'jungle_cloak', count:1, pattern:['V V','VVV','V V'], keys:{V:'vines'} },
  { result:'sand_veil', count:1, pattern:['B B','BBB','   '], keys:{B:'bamboo'} },

  // ═══ МАГИЧЕСКИЙ СТОЛ ═══
  { result:71, count:1, pattern:[' D ','DBD','OOO'], keys:{D:'diamond', B:8, O:'obsidian'} },
  { result:72, count:1, pattern:[' C ','   ','   '], keys:{C:'coal'} }, // glowstone из угля (упрощение)
];

module.exports = { RECIPES };
