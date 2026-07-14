// ═══════════════════════════════════════════════════════════
//  greedy-mesh.js — Greedy Meshing для чанков
//  Объединяет соседние блоки одного типа в большие плоскости
//  Сокращает количество полигонов в 5-10 раз
// ═══════════════════════════════════════════════════════════

import { getBlockTextures, getTextureUV } from './texture-atlas.js';

// BLOCKS передаётся через параметр функции
// Направления граней
const FACES = [
  { dir: [1, 0, 0], corners: [[1,0,0],[1,1,0],[1,0,1],[1,1,1]] }, // +X right
  { dir: [-1, 0, 0], corners: [[0,0,1],[0,1,1],[0,0,0],[0,1,0]] }, // -X left
  { dir: [0, 1, 0], corners: [[0,1,1],[1,1,1],[0,1,0],[1,1,0]] }, // +Y top
  { dir: [0, -1, 0], corners: [[0,0,0],[1,0,0],[0,0,1],[1,0,1]] }, // -Y bottom
  { dir: [0, 0, 1], corners: [[1,0,1],[1,1,1],[0,0,1],[0,1,1]] }, // +Z front
  { dir: [0, 0, -1], corners: [[0,0,0],[0,1,0],[1,0,0],[1,1,0]] }, // -Z back
];

// Проверка, видна ли грань блока
function isFaceVisible(world, BLOCKS, x, y, z, dir, currentBlock) {
  const nx = x + dir[0], ny = y + dir[1], nz = z + dir[2];
  const neighbor = world.getBlock(nx, ny, nz);
  if (neighbor === 0) return true;
  // Если соседний блок прозрачный и другого типа — грань видна
  const neighborBlock = BLOCKS[neighbor];
  if (neighborBlock && neighborBlock.transparent && neighbor !== currentBlock) return true;
  return false;
}

// Проверка, можно ли объединить два блока (одинаковый тип + одинаковая текстура на грани)
function canMerge(world, BLOCKS, x, y, z, blockId, faceIdx) {
  const block = world.getBlock(x, y, z);
  if (block !== blockId) return false;
  // Проверяем, что грань тоже видна и имеет ту же текстуру
  const face = FACES[faceIdx];
  return isFaceVisible(world, BLOCKS, x, y, z, face.dir, blockId);
}

// ═══════════════════════════════════════════════════════════
//  Построение greedy mesh для чанка
//  Возвращает { positions, normals, uvs, indices, transparentPositions, ... }
// ═══════════════════════════════════════════════════════════
export function buildChunkMesh(world, BLOCKS, chunkX, chunkZ, CHUNK_SIZE, WORLD_D) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const transparentPositions = [];
  const transparentNormals = [];
  const transparentUvs = [];
  const transparentIndices = [];

  const startX = chunkX * CHUNK_SIZE;
  const startZ = chunkZ * CHUNK_SIZE;

  // Для каждой грани (6 направлений)
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const face = FACES[faceIdx];
    const dir = face.dir;
    
    // Определяем оси для перебора
    let axisA, axisB, axisC;
    if (dir[0] !== 0) { axisA = 'z'; axisB = 'y'; axisC = 'x'; }
    else if (dir[1] !== 0) { axisA = 'x'; axisB = 'z'; axisC = 'y'; }
    else { axisA = 'x'; axisB = 'y'; axisC = 'z'; }

    const sizeA = axisA === 'x' ? CHUNK_SIZE : axisA === 'y' ? WORLD_D : CHUNK_SIZE;
    const sizeB = axisB === 'x' ? CHUNK_SIZE : axisB === 'y' ? WORLD_D : CHUNK_SIZE;
    const sizeC = axisC === 'x' ? CHUNK_SIZE : axisC === 'y' ? WORLD_D : CHUNK_SIZE;

    // Перебираем все слои по axisC
    for (let c = 0; c < sizeC; c++) {
      const visited = {};
      
      for (let a = 0; a < sizeA; a++) {
        for (let b = 0; b < sizeB; b++) {
          let x, y, z;
          if (axisC === 'x') { x = c; y = b; z = a; }
          else if (axisC === 'y') { x = a; y = c; z = b; }
          else { x = a; y = b; z = c; }

          const wx = startX + x;
          const wz = startZ + z;

          if (wx < 0 || wx >= world.W || wz < 0 || wz >= world.H) continue;

          const key = `${a},${b}`;
          if (visited[key]) continue;

          const blockId = world.getBlock(wx, y, wz);
          if (blockId === 0) continue;

          // Проверяем видимость грани
          if (!isFaceVisible(world, BLOCKS, wx, y, wz, dir, blockId)) continue;

          // Получаем текстуру для этой грани
          const textures = getBlockTextures(blockId);
          const textureName = textures[faceIdx];
          if (!textureName) continue;

          // Жадное расширение по axisA
          let widthA = 1;
          while (a + widthA < sizeA) {
            const nextKey = `${a + widthA},${b}`;
            if (visited[nextKey]) break;
            let nx, ny, nz;
            if (axisC === 'x') { nx = c; ny = b; nz = a + widthA; }
            else if (axisC === 'y') { nx = a + widthA; ny = c; nz = b; }
            else { nx = a + widthA; ny = b; nz = c; }
            const nwx = startX + nx;
            const nwz = startZ + nz;
            if (nwx < 0 || nwx >= world.W || nwz < 0 || nwz >= world.H) break;
            if (!canMerge(world, BLOCKS, nwx, ny, nwz, blockId, faceIdx)) break;
            const nextTextures = getBlockTextures(blockId);
            if (nextTextures[faceIdx] !== textureName) break;
            widthA++;
          }

          // Жадное расширение по axisB
          let widthB = 1;
          while (b + widthB < sizeB) {
            let canExtend = true;
            for (let i = 0; i < widthA; i++) {
              let nx, ny, nz;
              if (axisC === 'x') { nx = c; ny = b + widthB; nz = a + i; }
              else if (axisC === 'y') { nx = a + i; ny = c; nz = b + widthB; }
              else { nx = a + i; ny = b + widthB; nz = c; }
              const nwx = startX + nx;
              const nwz = startZ + nz;
              if (nwx < 0 || nwx >= world.W || nwz < 0 || nwz >= world.H) { canExtend = false; break; }
              const nextKey = `${a + i},${b + widthB}`;
              if (visited[nextKey]) { canExtend = false; break; }
              if (!canMerge(world, BLOCKS, nwx, ny, nwz, blockId, faceIdx)) { canExtend = false; break; }
              const nextTextures = getBlockTextures(blockId);
              if (nextTextures[faceIdx] !== textureName) { canExtend = false; break; }
            }
            if (!canExtend) break;
            widthB++;
          }

          // Помечаем все объединённые блоки как посещённые
          for (let i = 0; i < widthA; i++) {
            for (let j = 0; j < widthB; j++) {
              visited[`${a + i},${b + j}`] = true;
            }
          }

          // Создаём quad
          const uvCoords = getTextureUV(textureName);
          
          const baseX = wx;
          const baseY = y;
          const baseZ = wz;

          let v0, v1, v2, v3;
          if (axisC === 'x') {
            if (dir[0] > 0) {
              v0 = [baseX + 1, baseY, baseZ];
              v1 = [baseX + 1, baseY + widthB, baseZ];
              v2 = [baseX + 1, baseY, baseZ + widthA];
              v3 = [baseX + 1, baseY + widthB, baseZ + widthA];
            } else {
              v0 = [baseX, baseY, baseZ + widthA];
              v1 = [baseX, baseY + widthB, baseZ + widthA];
              v2 = [baseX, baseY, baseZ];
              v3 = [baseX, baseY + widthB, baseZ];
            }
          } else if (axisC === 'y') {
            if (dir[1] > 0) {
              v0 = [baseX, baseY + 1, baseZ + widthB];
              v1 = [baseX + widthA, baseY + 1, baseZ + widthB];
              v2 = [baseX, baseY + 1, baseZ];
              v3 = [baseX + widthA, baseY + 1, baseZ];
            } else {
              v0 = [baseX, baseY, baseZ];
              v1 = [baseX + widthA, baseY, baseZ];
              v2 = [baseX, baseY, baseZ + widthB];
              v3 = [baseX + widthA, baseY, baseZ + widthB];
            }
          } else {
            if (dir[2] > 0) {
              v0 = [baseX + widthA, baseY, baseZ + 1];
              v1 = [baseX + widthA, baseY + widthB, baseZ + 1];
              v2 = [baseX, baseY, baseZ + 1];
              v3 = [baseX, baseY + widthB, baseZ + 1];
            } else {
              v0 = [baseX, baseY, baseZ];
              v1 = [baseX, baseY + widthB, baseZ];
              v2 = [baseX + widthA, baseY, baseZ];
              v3 = [baseX + widthA, baseY + widthB, baseZ];
            }
          }

          const blockDef = BLOCKS[blockId];
          const isTransparent = blockDef && blockDef.transparent;
          const targetPos = isTransparent ? transparentPositions : positions;
          const targetNorm = isTransparent ? transparentNormals : normals;
          const targetUv = isTransparent ? transparentUvs : uvs;
          const targetIdx = isTransparent ? transparentIndices : indices;

          const startIdx = targetPos.length / 3;
          targetPos.push(v0[0], v0[1], v0[2]);
          targetPos.push(v1[0], v1[1], v1[2]);
          targetPos.push(v2[0], v2[1], v2[2]);
          targetPos.push(v3[0], v3[1], v3[2]);

          targetNorm.push(dir[0], dir[1], dir[2]);
          targetNorm.push(dir[0], dir[1], dir[2]);
          targetNorm.push(dir[0], dir[1], dir[2]);
          targetNorm.push(dir[0], dir[1], dir[2]);

          // UV с учётом размеров (растягиваем на весь quad)
          targetUv.push(uvCoords.u0, uvCoords.v1);
          targetUv.push(uvCoords.u0, uvCoords.v0);
          targetUv.push(uvCoords.u1, uvCoords.v1);
          targetUv.push(uvCoords.u1, uvCoords.v0);

          targetIdx.push(startIdx, startIdx + 1, startIdx + 2);
          targetIdx.push(startIdx + 2, startIdx + 1, startIdx + 3);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices),
    transparentPositions: new Float32Array(transparentPositions),
    transparentNormals: new Float32Array(transparentNormals),
    transparentUvs: new Float32Array(transparentUvs),
    transparentIndices: new Uint32Array(transparentIndices),
  };
}
