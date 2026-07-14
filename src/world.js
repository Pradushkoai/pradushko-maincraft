// ═══════════════════════════════════════════════════════════
//  world.js — чанковая система мира
//  Чанк: 16×16×WORLD_D блоков. Загружаются только чанки вокруг игрока.
// ═══════════════════════════════════════════════════════════

const { BLOCKS } = require('./blocks.js');
const { BIOMES, getBiomeAt } = require('./biomes.js');
const { buildHouse, buildCabin, buildDungeon, buildPyramid, buildJungleTemple, buildShipwreck, buildWitchHut, buildIceCastle, clearStructures, placedStructures } = require('./structures.js');

const CHUNK_SIZE = 16;
const WORLD_DEPTH = 64;
const SEED = Math.floor(Math.random() * 1000000);

class World {
  constructor(W = 256, H = 256) {
    this.W = W;
    this.H = H;
    this.D = WORLD_DEPTH;
    this.chunksX = Math.ceil(W / CHUNK_SIZE);
    this.chunksZ = Math.ceil(H / CHUNK_SIZE);
    this.chunks = new Map(); // "cx,cz" → Uint8Array(CHUNK_SIZE * CHUNK_SIZE * D)
    this.generated = new Set();
    this.modifiedBlocks = new Map(); // "x,y,z" → blockId (для сохранения изменений)
    this.placedStructures = placedStructures;
  }

  chunkKey(cx, cz) { return `${cx},${cz}`; }

  getChunk(cx, cz) {
    const key = this.chunkKey(cx, cz);
    if (!this.chunks.has(key)) {
      this.chunks.set(key, new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * this.D));
    }
    return this.chunks.get(key);
  }

  isChunkGenerated(cx, cz) {
    return this.generated.has(this.chunkKey(cx, cz));
  }

  generateChunk(cx, cz) {
    if (this.isChunkGenerated(cx, cz)) return;
    const chunk = this.getChunk(cx, cz);
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        if (wx >= this.W || wz >= this.H) continue;
        const biome = getBiomeAt(wx, wz, SEED);
        // Высота поверхности
        let h = biome.heightBase;
        // Шум высоты
        h += Math.sin(wx * 0.05) * biome.heightVariation;
        h += Math.cos(wz * 0.04) * biome.heightVariation;
        h += Math.sin((wx + wz) * 0.03) * (biome.heightVariation * 0.5);
        h += (Math.random() - 0.5) * 0.8;
        const surface = Math.max(3, Math.min(this.D - 6, Math.floor(h)));

        for (let y = 0; y < this.D; y++) {
          let blockId = 0;
          if (y === 0) {
            blockId = 15; // bedrock
          } else if (y < surface - 4) {
            // Глубокий камень + руда
            blockId = 3;
            const r = Math.random();
            if (r < 0.04) blockId = 11;       // coal
            else if (r < 0.07 && y < surface - 6) blockId = 12; // iron
            else if (r < 0.085 && y < surface - 10) blockId = 13; // gold
            else if (r < 0.092 && y < surface - 15) blockId = 14; // diamond
            else if (r < 0.094 && y < surface - 20) blockId = 77; // mythril
            else if (r < 0.095 && y < surface - 25) blockId = 79; // adamant
          } else if (y < surface - 1) {
            blockId = biome.subsurfaceBlock;
          } else if (y === surface - 1) {
            blockId = biome.surfaceBlock;
            // Вода в болотах и океанах
            if (biome.id === BIOMES.SWAMP.id && Math.random() < 0.20) {
              blockId = 7;
              // Создаём лужу сверху
              if (surface < this.D) this.setBlockRaw(wx, surface, wz, 16);
            } else if (biome.id === BIOMES.OCEAN.id) {
              blockId = 7;
              for (let wy = surface; wy <= biome.waterLevel || wy <= 6; wy++) {
                if (wy < this.D) this.setBlockRaw(wx, wy, wz, 16);
              }
            }
          }
          this.setBlockRaw(wx, y, wz, blockId);
        }

        // Деревья
        if (biome.treeChance > 0 && Math.random() < biome.treeChance && surface + 6 < this.D) {
          this.placeTree(wx, surface, wz, biome.treeType);
        }
        // Цветы и декор
        if (biome.flowerChance > 0 && Math.random() < biome.flowerChance && surface < this.D) {
          const flower = Math.random() < 0.5 ? 82 : 83; // rose или dandelion
          if (this.getBlock(wx, surface, wz) === 0) this.setBlockRaw(wx, surface, wz, flower);
        }
        // Кактусы
        if (biome.cactusChance > 0 && Math.random() < biome.cactusChance) {
          for (let c = 0; c < 2 + Math.floor(Math.random() * 2); c++) {
            if (surface + c < this.D) this.setBlockRaw(wx, surface + c, wz, 27);
          }
        }
        // Лилии в болотах
        if (biome.id === BIOMES.SWAMP.id && Math.random() < 0.10) {
          if (this.getBlock(wx, surface, wz) === 0) this.setBlockRaw(wx, surface, wz, 42);
        }
        // Лёд в снегу
        if (biome.iceChance > 0 && Math.random() < biome.iceChance) {
          if (this.getBlock(wx, surface - 1, wz) === 25) this.setBlockRaw(wx, surface, wz, 26);
        }
        // Лозы в джунглях
        if (biome.vineChance > 0 && Math.random() < biome.vineChance) {
          if (surface < this.D) this.setBlockRaw(wx, surface, wz, 38);
        }
      }
    }
    this.generated.add(this.chunkKey(cx, cz));
    // Возможно, размещаем структуру в этом чанке
    this.maybePlaceStructure(cx, cz);
  }

  placeTree(x, surfaceY, z, type) {
    const isSpruce = type === 'spruce' || type === 'spruce_sparse';
    const isJungle = type === 'jungle';
    const isSwamp = type === 'swamp_willow';
    const isCactus = type === 'cactus';
    const isAcacia = type === 'acacia';
    const isOakDense = type === 'oak_dense';

    if (isCactus) {
      for (let i = 0; i < 3 + Math.floor(Math.random() * 2); i++) {
        if (surfaceY + i < this.D) this.setBlockRaw(x, surfaceY + i, z, 27);
      }
      return;
    }

    const logId = isSpruce ? 21 : isJungle ? 36 : isSwamp ? 43 : 5;
    const leavesId = isSpruce ? 22 : isJungle ? 37 : isSwamp ? 6 : 6;
    const trunkH = isSpruce ? 5 + Math.floor(Math.random() * 2)
                  : isJungle ? 8 + Math.floor(Math.random() * 4)
                  : isSwamp ? 4 + Math.floor(Math.random() * 2)
                  : 3 + Math.floor(Math.random() * 2);
    // Ствол
    for (let dy = 0; dy < trunkH; dy++) {
      if (surfaceY + dy < this.D) this.setBlockRaw(x, surfaceY + dy, z, logId);
    }
    // Листва
    const topY = surfaceY + trunkH - 1;
    const radius = isSpruce ? 1 : isJungle ? 3 : isOakDense ? 2 : 2;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dy = -1; dy <= (isJungle ? 2 : 1); dy++) {
          if (Math.abs(dx) + Math.abs(dz) > radius + 1) continue;
          // Ель — конус
          if (isSpruce && (Math.abs(dx) + Math.abs(dz)) > 1 && dy >= 0) continue;
          const nx = x + dx, nz = z + dz, ny = topY + dy;
          if (nx < 0 || nx >= this.W || nz < 0 || nz >= this.H || ny >= this.D) continue;
          if (this.getBlock(nx, ny, nz) === 0 && Math.random() < 0.85) {
            this.setBlockRaw(nx, ny, nz, leavesId);
          }
        }
      }
    }
  }

  maybePlaceStructure(cx, cz) {
    // Размещаем структуры в чанках с вероятностью
    const baseX = cx * CHUNK_SIZE + 8;
    const baseZ = cz * CHUNK_SIZE + 8;
    if (baseX < 5 || baseX >= this.W - 5 || baseZ < 5 || baseZ >= this.H - 5) return;

    const biome = getBiomeAt(baseX, baseZ, SEED);
    const r = Math.random();

    if (biome.id === BIOMES.PLAINS.id) {
      if (r < 0.10) buildHouse(this, baseX, baseZ, 'wood');
      else if (r < 0.13) buildHouse(this, baseX, baseZ, 'brick');
    } else if (biome.id === BIOMES.FOREST.id) {
      if (r < 0.08) buildCabin(this, baseX, baseZ);
    } else if (biome.id === BIOMES.SWAMP.id) {
      if (r < 0.06) buildWitchHut(this, baseX, baseZ);
    } else if (biome.id === BIOMES.DESERT.id) {
      if (r < 0.05) buildPyramid(this, baseX, baseZ);
    } else if (biome.id === BIOMES.SNOW.id) {
      if (r < 0.04) buildIceCastle(this, baseX, baseZ);
    } else if (biome.id === BIOMES.JUNGLE.id) {
      if (r < 0.05) buildJungleTemple(this, baseX, baseZ);
    } else if (biome.id === BIOMES.OCEAN.id) {
      if (r < 0.08) buildShipwreck(this, baseX, baseZ);
    }

    // Подземелья под землёй — отдельный шанс
    if (r > 0.92) {
      buildDungeon(this, baseX, baseZ, 4 + Math.floor(Math.random() * 5));
    }
  }

  // Прямая запись в чанк (без модификаций)
  setBlockRaw(x, y, z, id) {
    if (x < 0 || x >= this.W || y < 0 || y >= this.D || z < 0 || z >= this.H) return;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    if (!this.isChunkGenerated(cx, cz)) this.generateChunk(cx, cz);
    const chunk = this.getChunk(cx, cz);
    const idx = (lx * CHUNK_SIZE + lz) * this.D + y;
    chunk[idx] = id;
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= this.W || y < 0 || y >= this.D || z < 0 || z >= this.H) return 0;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    if (!this.isChunkGenerated(cx, cz)) this.generateChunk(cx, cz);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    const chunk = this.getChunk(cx, cz);
    const idx = (lx * CHUNK_SIZE + lz) * this.D + y;
    return chunk[idx];
  }

  setBlock(x, y, z, id) {
    if (x < 0 || x >= this.W || y < 0 || y >= this.D || z < 0 || z >= this.H) return;
    this.setBlockRaw(x, y, z, id);
    this.modifiedBlocks.set(`${x},${y},${z}`, id);
  }

  // Сохранение мира в файл (для Electron — через FS API)
  serialize() {
    return {
      W: this.W, H: this.H, D: this.D,
      seed: SEED,
      modified: Array.from(this.modifiedBlocks.entries()),
      structures: this.placedStructures.map(s => ({ ...s })),
    };
  }

  static deserialize(data) {
    const w = new World(data.W, data.H);
    for (const [key, id] of data.modified) {
      const [x, y, z] = key.split(',').map(Number);
      w.setBlockRaw(x, y, z, id);
      w.modifiedBlocks.set(key, id);
    }
    // Структуры восстанавливаем
    if (data.structures) {
      w.placedStructures.length = 0;
      data.structures.forEach(s => w.placedStructures.push(s));
    }
    return w;
  }
}

module.exports = { World, CHUNK_SIZE };
