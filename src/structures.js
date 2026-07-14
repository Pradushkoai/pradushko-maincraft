// ═══════════════════════════════════════════════════════════
//  structures.js — генерация структур: дома, подземелья, храмы
// ═══════════════════════════════════════════════════════════

const { BLOCKS } = require('./blocks.js');
const { ITEMS } = require('./items.js');

function randomChestLoot(minItems = 2, maxItems = 4) {
  const loot = [];
  const pool = [
    'iron_ingot','gold_ingot','diamond','emerald','bow','arrow','arrow_iron',
    'iron_sword','leather_chest','iron_chest','string','coal','bread','golden_apple',
    'arrow_explosive','crystal','mythril_ore','adamant_ore','spider_silk','shark_tooth',
  ];
  const n = minItems + Math.floor(Math.random() * (maxItems - minItems + 1));
  for (let i = 0; i < n; i++) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    loot.push({ item, count: 1 + Math.floor(Math.random() * 4) });
  }
  return loot;
}

// Структуры регистрируются в массиве для отображения на карте
const placedStructures = [];

// ═══════════════════════════════════════════════════════════
//  ДОМА — несколько типов, с интерьером
// ═══════════════════════════════════════════════════════════
function buildHouse(world, cx, cz, type = 'wood') {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; }
  }
  if (surfY + 5 >= 100) surfY = 95;

  const w = 7, d = 7, h = 4;
  const x0 = cx - 3, z0 = cz - 3;
  const wallBlock = type === 'wood' ? 8 : type === 'brick' ? 10 : type === 'stone' ? 4 : 8;
  const floorBlock = type === 'wood' ? 8 : 4;
  const roofBlock = type === 'wood' ? 5 : 21;

  // Пол
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
      world.setBlock(x, surfY - 1, z, floorBlock);
    }
  }
  // Стены
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      for (let y = surfY; y < surfY + h; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H || y >= 100) continue;
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge) {
          // Окна на 2-м этаже стен
          if ((x === x0+1 || x === x0+w-2) && (z === z0+1 || z === z0+d-2) && y === surfY+2) {
            world.setBlock(x, z, y, 9); // glass
          } else {
            world.setBlock(x, z, y, wallBlock);
          }
        } else {
          world.setBlock(x, z, y, 0); // воздух внутри
        }
      }
      // Крыша
      if (surfY + h < 100) world.setBlock(x, z, surfY + h, roofBlock);
    }
  }
  // Дверь
  world.setBlock(cx, z0, surfY, 0);
  world.setBlock(cx, z0, surfY+1, 0);
  // Дверной коврик
  world.setBlock(cx, z0-1, surfY-1, 58);

  // Интерьер: крафтовый стол
  world.setBlock(cx - 2, surfY, cz - 2, 17);
  placedStructures.push({ type: 'crafting', x: cx-2, z: cz-2 });

  // Печь
  world.setBlock(cx + 2, surfY, cz - 2, 56);

  // Сундук с лутом
  world.setBlock(cx + 2, surfY, cz + 2, 18);
  placedStructures.push({ type: 'chest', x: cx+2, y: surfY, z: cz+2, loot: randomChestLoot(3, 5) });

  // Кровать (2 блока)
  world.setBlock(cx - 2, surfY, cz + 2, 53);
  world.setBlock(cx - 3, surfY, cz + 2, 53);

  // Стол и стул
  world.setBlock(cx, surfY, cz, 51);
  world.setBlock(cx, surfY, cz + 1, 52);

  // Факелы на стенах
  world.setBlock(x0, surfY + 2, cz, 24);
  world.setBlock(x0 + w - 1, surfY + 2, cz, 24);
  world.setBlock(cx, surfY + 2, z0, 24);
  world.setBlock(cx, surfY + 2, z0 + d - 1, 24);

  // Ковёр
  world.setBlock(cx, surfY, z0 + 1, 58);
  world.setBlock(cx, surfY, z0 + 2, 59);

  placedStructures.push({ type: 'house', x: cx, z: cz, w, h: d });
}

function buildCabin(world, cx, cz) {
  // Маленькая лесная хижина 5×5
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; }
  }
  const w = 5, d = 5, h = 3;
  const x0 = cx - 2, z0 = cz - 2;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      for (let y = surfY; y < surfY + h; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge) world.setBlock(x, z, y, 8);
        else world.setBlock(x, z, y, 0);
      }
      if (surfY + h < 100) world.setBlock(x, z, surfY + h, 5);
      world.setBlock(x, z, surfY - 1, 8);
    }
  }
  world.setBlock(cx, z0, surfY, 0);
  world.setBlock(cx, z0, surfY+1, 0);
  world.setBlock(cx - 1, surfY, cz - 1, 17);
  placedStructures.push({ type: 'crafting', x: cx-1, z: cz-1 });
  world.setBlock(cx + 1, surfY, cz + 1, 18);
  placedStructures.push({ type: 'chest', x: cx+1, y: surfY, z: cz+1, loot: randomChestLoot(2, 3) });
  placedStructures.push({ type: 'cabin', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  ПОДЗЕМЕЛЬЯ — с этажами, ловушками, сундуками
// ═══════════════════════════════════════════════════════════
function buildDungeon(world, cx, cz, depth) {
  if (depth < 1 || depth + 6 >= 100) return;
  const entranceY = depth;
  // Вход — вертикальная шахта
  for (let y = entranceY; y < entranceY + 3; y++) {
    world.setBlock(cx, cz, y, 0);
  }
  // Лестница вниз
  for (let y = entranceY; y >= entranceY - 4; y--) {
    world.setBlock(cx, cz, y, 0);
    world.setBlock(cx, cz + 1, y, 68); // лестница
  }
  // Камера 1: 7×7, мох и камень
  const room1Y = entranceY - 5;
  const w = 7, d = 7;
  const x0 = cx - 3, z0 = cz - 3;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < x0 + d; z++) {
      for (let y = room1Y; y < room1Y + 4; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge) world.setBlock(x, z, y, 20);
        else world.setBlock(x, z, y, 0);
      }
      world.setBlock(x, z, room1Y - 1, 20);
    }
  }
  // Факелы
  world.setBlock(x0 + 1, room1Y + 2, z0 + 1, 24);
  world.setBlock(x0 + w - 2, room1Y + 2, z0 + d - 2, 24);

  // Сундук в центре 1-й комнаты
  world.setBlock(cx, room1Y, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: room1Y, z: cz, loot: randomChestLoot(3, 5) });

  // Спуск на 2-й этаж
  for (let y = room1Y; y >= room1Y - 5; y--) {
    world.setBlock(cx + 2, cz + 2, y, 0);
    world.setBlock(cx + 2, cz + 3, y, 68);
  }

  // Камера 2: 9×9, глубже, с лавой
  const room2Y = room1Y - 6;
  const w2 = 9, d2 = 9;
  const x1 = cx - 4, z1 = cz - 4;
  for (let x = x1; x < x1 + w2; x++) {
    for (let z = z1; z < x1 + d2; z++) {
      for (let y = room2Y; y < room2Y + 5; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isEdge = (x === x1 || x === x1+w2-1 || z === z1 || z === z1+d2-1);
        if (isEdge) world.setBlock(x, z, y, 34); // обсидиан
        else world.setBlock(x, z, y, 0);
      }
      world.setBlock(x, z, room2Y - 1, 34);
    }
  }
  // Лава в центре 2-й комнаты
  world.setBlock(cx, room2Y - 1, cz, 35);
  world.setBlock(cx + 1, room2Y - 1, cz, 35);
  world.setBlock(cx - 1, room2Y - 1, cz, 35);

  // Сундук-босс в углу 2-й комнаты (с лутом получше)
  world.setBlock(x1 + 1, room2Y, z1 + 1, 18);
  placedStructures.push({ type: 'chest', x: x1+1, y: room2Y, z: z1+1, loot: randomChestLoot(4, 6) });

  // Алтень с редким оружием
  world.setBlock(cx, room2Y, cz, 57); // anvil
  world.setBlock(x1 + w2 - 2, room2Y, z1 + d2 - 2, 18);
  placedStructures.push({ type: 'chest', x: x1+w2-2, y: room2Y, z: z1+d2-2, loot: randomChestLoot(4, 6) });

  placedStructures.push({ type: 'dungeon', x: cx, z: cz, depth: room2Y });
}

// ═══════════════════════════════════════════════════════════
//  ПИРАМИДА (пустыня)
// ═══════════════════════════════════════════════════════════
function buildPyramid(world, cx, cz) {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y; break; }
  }
  const size = 11; // 11×11
  for (let layer = 0; layer < 5; layer++) {
    const sz = size - layer * 2;
    if (sz < 3) break;
    const y = surfY + layer;
    for (let x = -Math.floor(sz/2); x <= Math.floor(sz/2); x++) {
      for (let z = -Math.floor(sz/2); z <= Math.floor(sz/2); z++) {
        const ax = cx + x, az = cz + z;
        if (ax < 0 || ax >= world.W || az < 0 || az >= world.H) continue;
        if (y < 100) world.setBlock(ax, az, y, 7); // песчаник (упрощённо — песок)
      }
    }
  }
  // Вход в пирамиду
  world.setBlock(cx, surfY, cz + Math.floor(size/2), 0);
  world.setBlock(cx, surfY + 1, cz + Math.floor(size/2), 0);
  // Внутри — комната с сундуком
  world.setBlock(cx, surfY, cz, 0);
  world.setBlock(cx, surfY + 1, cz, 0);
  world.setBlock(cx, surfY + 2, cz, 0);
  world.setBlock(cx, surfY + 3, cz, 0);
  world.setBlock(cx, surfY + 1, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: surfY+1, z: cz, loot: randomChestLoot(4, 6) });
  placedStructures.push({ type: 'pyramid', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  ХРАМ В ДЖУНГЛЯХ
// ═══════════════════════════════════════════════════════════
function buildJungleTemple(world, cx, cz) {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; }
  }
  const w = 9, d = 9, h = 6;
  const x0 = cx - 4, z0 = cz - 4;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      for (let y = surfY; y < surfY + h; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge) world.setBlock(x, z, y, 4); // камень
        else world.setBlock(x, z, y, 0);
      }
      // Пол и крыша
      world.setBlock(x, z, surfY - 1, 4);
      if (surfY + h < 100) world.setBlock(x, z, surfY + h, 36); // джунглевое дерево
    }
  }
  // Вход
  world.setBlock(cx, z0, surfY, 0);
  world.setBlock(cx, z0, surfY + 1, 0);
  // Внутри — алтарь с лутом
  world.setBlock(cx, surfY, cz, 75); // purpur (магический блок)
  world.setBlock(cx, surfY + 1, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: surfY+1, z: cz, loot: randomChestLoot(5, 7) });
  // Факелы
  world.setBlock(cx - 2, surfY + 3, cz - 2, 24);
  world.setBlock(cx + 2, surfY + 3, cz + 2, 24);
  placedStructures.push({ type: 'jungle_temple', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  КОРАБЛЕКРУШЕНИЕ (океан)
// ═══════════════════════════════════════════════════════════
function buildShipwreck(world, cx, cz) {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    const b = world.getBlock(cx, y, cz);
    if (b > 0 && b !== 16) { surfY = y + 1; break; }
    if (b === 16) { surfY = y; break; }
  }
  // Корпус 9×3
  const w = 9, d = 3, h = 3;
  const x0 = cx - 4, z0 = cz - 1;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      for (let y = surfY; y < surfY + h; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isHull = (z === z0 || z === z0+d-1 || y === surfY);
        if (isHull) world.setBlock(x, z, y, 5);
        else world.setBlock(x, z, y, 0);
      }
    }
  }
  // Сундук с лутом
  world.setBlock(cx, surfY + 1, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: surfY+1, z: cz, loot: randomChestLoot(4, 6) });
  placedStructures.push({ type: 'shipwreck', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  ВЕДЬМИНА ХИЖИНА (болото)
// ═══════════════════════════════════════════════════════════
function buildWitchHut(world, cx, cz) {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; }
  }
  const w = 5, d = 5, h = 3;
  const x0 = cx - 2, z0 = cz - 2;
  // Опоры из дерева
  for (const [px, pz] of [[x0, z0], [x0+w-1, z0], [x0, z0+d-1], [x0+w-1, z0+d-1]]) {
    for (let y = surfY; y < surfY + h + 1; y++) {
      world.setBlock(px, pz, y, 43); // болотное бревно
    }
  }
  // Пол и стены из досок
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      world.setBlock(x, z, surfY, 8);
      for (let y = surfY + 1; y < surfY + h; y++) {
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge && (x === x0+1 || x === x0+w-2) && (z === z0 || z === z0+d-1)) {
          world.setBlock(x, z, y, 9); // окно
        } else if (isEdge) {
          world.setBlock(x, z, y, 8);
        }
      }
      // Крыша из листвы
      if (surfY + h < 100) world.setBlock(x, z, surfY + h, 22);
    }
  }
  // Дверь
  world.setBlock(cx, z0, surfY + 1, 0);
  // Сундук с зельями (упрощённо — лут)
  world.setBlock(cx, surfY + 1, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: surfY+1, z: cz, loot: randomChestLoot(3, 5) });
  // Крафтовый стол
  world.setBlock(cx - 1, surfY + 1, cz - 1, 17);
  placedStructures.push({ type: 'crafting', x: cx-1, z: cz-1 });
  placedStructures.push({ type: 'witch_hut', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  ЛЕДЯНОЙ ЗАМОК (снежный биом)
// ═══════════════════════════════════════════════════════════
function buildIceCastle(world, cx, cz) {
  let surfY = 0;
  for (let y = 100; y >= 0; y--) {
    if (world.getBlock(cx, y, cz) > 0) { surfY = y + 1; break; }
  }
  const w = 11, d = 11, h = 8;
  const x0 = cx - 5, z0 = cz - 5;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      for (let y = surfY; y < surfY + h; y++) {
        if (x < 0 || x >= world.W || z < 0 || z >= world.H) continue;
        const isEdge = (x === x0 || x === x0+w-1 || z === z0 || z === z0+d-1);
        if (isEdge) {
          world.setBlock(x, z, y, 49); // snow block
          // Башни по углам
          if ((x === x0 || x === x0+w-1) && (z === z0 || z === z0+d-1) && y < surfY + h + 3) {
            world.setBlock(x, z, y, 50); // packed ice
          }
        } else {
          world.setBlock(x, z, y, 0);
        }
      }
      world.setBlock(x, z, surfY - 1, 49);
    }
  }
  // Башни выше
  for (const [px, pz] of [[x0, z0], [x0+w-1, z0], [x0, z0+d-1], [x0+w-1, z0+d-1]]) {
    for (let y = surfY + h; y < surfY + h + 3; y++) {
      if (y < 100) world.setBlock(px, pz, y, 50);
    }
  }
  // Вход
  world.setBlock(cx, z0, surfY, 0);
  world.setBlock(cx, z0, surfY + 1, 0);
  world.setBlock(cx, z0, surfY + 2, 0);
  // Тронный зал с сундуком
  world.setBlock(cx, surfY, cz, 70); // flower_pot (упрощение — алтарь)
  world.setBlock(cx, surfY + 1, cz, 18);
  placedStructures.push({ type: 'chest', x: cx, y: surfY+1, z: cz, loot: randomChestLoot(5, 8) });
  placedStructures.push({ type: 'ice_castle', x: cx, z: cz });
}

// ═══════════════════════════════════════════════════════════
//  Очистить реестр структур (для новой генерации)
// ═══════════════════════════════════════════════════════════
function clearStructures() {
  placedStructures.length = 0;
}

module.exports = {
  buildHouse, buildCabin, buildDungeon, buildPyramid,
  buildJungleTemple, buildShipwreck, buildWitchHut, buildIceCastle,
  randomChestLoot, clearStructures, placedStructures
};
