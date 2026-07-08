import { Tube, Level, ColorLayer, COLOR_KEYS } from './types';
import { isSolvable, getMinSteps } from './solver';

// 无尽模式存档键
const ENDLESS_KEY = 'color-sort-endless';

// 无尽模式最高分
export function getEndlessHighScore(): number {
  try {
    return parseInt(localStorage.getItem(ENDLESS_KEY) || '0', 10);
  } catch (e) { return 0; }
}

export function saveEndlessScore(score: number) {
  try {
    const current = getEndlessHighScore();
    if (score > current) {
      localStorage.setItem(ENDLESS_KEY, String(score));
    }
  } catch (e) { /* 忽略 */ }
}

// 关卡难度配置（扩展至100关）
const LEVEL_CONFIGS = [
  { tubes: 4, colors: 2, capacity: 4, difficulty: '入门' },   // 1-3关
  { tubes: 5, colors: 3, capacity: 4, difficulty: '简单' },   // 4-6关
  { tubes: 6, colors: 4, capacity: 4, difficulty: '普通' },   // 7-12关
  { tubes: 7, colors: 5, capacity: 4, difficulty: '中等' },   // 13-20关
  { tubes: 8, colors: 6, capacity: 4, difficulty: '困难' },   // 21-30关
  { tubes: 9, colors: 7, capacity: 5, difficulty: '挑战' },   // 31-50关
  { tubes: 10, colors: 8, capacity: 5, difficulty: '高级' },   // 51-70关
  { tubes: 11, colors: 9, capacity: 5, difficulty: '专家' },   // 71-90关
  { tubes: 12, colors: 10, capacity: 5, difficulty: '大师' },  // 91-100关
];

function getLevelConfig(level: number) {
  if (level <= 3) return LEVEL_CONFIGS[0];
  if (level <= 6) return LEVEL_CONFIGS[1];
  if (level <= 12) return LEVEL_CONFIGS[2];
  if (level <= 20) return LEVEL_CONFIGS[3];
  if (level <= 30) return LEVEL_CONFIGS[4];
  if (level <= 50) return LEVEL_CONFIGS[5];
  if (level <= 70) return LEVEL_CONFIGS[6];
  if (level <= 90) return LEVEL_CONFIGS[7];
  return LEVEL_CONFIGS[8];
}

// 洗牌算法
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 生成关卡
export function generateLevel(level: number): Level {
  const config = getLevelConfig(level);
  const { tubes: tubeCount, colors: colorCount, capacity, difficulty: diff } = config;

  // 选择颜色
  const selectedColors = shuffle(COLOR_KEYS).slice(0, colorCount);

  // 创建颜色层池：每种颜色填满一个试管
  const colorPool: ColorLayer[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < capacity; i++) {
      colorPool.push({ color });
    }
  }

  // 洗牌
  const shuffledPool = shuffle(colorPool);

  // 分配到试管
  const tubes: Tube[] = [];
  let poolIndex = 0;
  const filledTubeCount = colorCount;

  for (let i = 0; i < filledTubeCount; i++) {
    const layers: ColorLayer[] = [];
    for (let j = 0; j < capacity; j++) {
      layers.push(shuffledPool[poolIndex++]);
    }
    tubes.push({ id: i, layers, capacity });
  }

  // 添加空试管（至少2个空管用于解谜）
  const emptyTubeCount = tubeCount - filledTubeCount;
  for (let i = 0; i < emptyTubeCount; i++) {
    tubes.push({ id: filledTubeCount + i, layers: [], capacity });
  }

  // 再次打乱试管顺序
  const finalTubes = shuffle(tubes);
  finalTubes.forEach((t, i) => { t.id = i; });

  // 验证可解性，最多重试 5 次
  let solvableTubes = finalTubes;
  if (!isSolvable(solvableTubes)) {
    for (let retry = 0; retry < 5; retry++) {
      const retryPool = shuffle(colorPool);
      let idx = 0;
      const retryTubes: Tube[] = [];
      for (let i = 0; i < filledTubeCount; i++) {
        const layers: ColorLayer[] = [];
        for (let j = 0; j < capacity; j++) {
          layers.push(retryPool[idx++]);
        }
        retryTubes.push({ id: i, layers, capacity });
      }
      for (let i = 0; i < emptyTubeCount; i++) {
        retryTubes.push({ id: filledTubeCount + i, layers: [], capacity });
      }
      const shuffledRetry = shuffle(retryTubes);
      shuffledRetry.forEach((t, i) => { t.id = i; });
      if (isSolvable(shuffledRetry)) {
        solvableTubes = shuffledRetry;
        break;
      }
      solvableTubes = shuffledRetry; // 兜底使用最后一次
    }
  }

  // 计算理论最少步数（仅对简单关卡计算，避免复杂关卡超时）
  let minSteps = -1;
  if (colorCount <= 5) {
    try {
      minSteps = getMinSteps(solvableTubes, 6000);
    } catch (e) {
      minSteps = -1;
    }
  }

  return {
    id: level,
    tubes: solvableTubes,
    tubeCapacity: capacity,
    difficulty: diff,
    minSteps,
  };
}

// 生成无尽模式关卡
// 根据当前分数递增难度
export function generateEndlessLevel(score: number): Level {
  // 分数越高难度越大，从第 3 关难度开始
  const fakeLevel = Math.min(3 + score * 2, 60);
  const config = getLevelConfig(fakeLevel);
  const { tubes: tubeCount, colors: colorCount, capacity, difficulty } = config;

  // 选择颜色
  const selectedColors = shuffle(COLOR_KEYS).slice(0, colorCount);

  // 创建颜色层池
  const colorPool: ColorLayer[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < capacity; i++) {
      colorPool.push({ color });
    }
  }

  // 洗牌
  const shuffledPool = shuffle(colorPool);

  // 分配到试管
  const tubes: Tube[] = [];
  let poolIndex = 0;
  const filledTubeCount = colorCount;

  for (let i = 0; i < filledTubeCount; i++) {
    const layers: ColorLayer[] = [];
    for (let j = 0; j < capacity; j++) {
      layers.push(shuffledPool[poolIndex++]);
    }
    tubes.push({ id: i, layers, capacity });
  }

  // 添加空试管
  const emptyTubeCount = tubeCount - filledTubeCount;
  for (let i = 0; i < emptyTubeCount; i++) {
    tubes.push({ id: filledTubeCount + i, layers: [], capacity });
  }

  // 打乱试管顺序
  const finalTubes = shuffle(tubes);
  finalTubes.forEach((t, i) => { t.id = i; });

  // 验证可解性
  let solvableTubes = finalTubes;
  if (!isSolvable(solvableTubes)) {
    for (let retry = 0; retry < 5; retry++) {
      const retryPool = shuffle(colorPool);
      let idx = 0;
      const retryTubes: Tube[] = [];
      for (let i = 0; i < filledTubeCount; i++) {
        const layers: ColorLayer[] = [];
        for (let j = 0; j < capacity; j++) {
          layers.push(retryPool[idx++]);
        }
        retryTubes.push({ id: i, layers, capacity });
      }
      for (let i = 0; i < emptyTubeCount; i++) {
        retryTubes.push({ id: filledTubeCount + i, layers: [], capacity });
      }
      const shuffledRetry = shuffle(retryTubes);
      shuffledRetry.forEach((t, i) => { t.id = i; });
      if (isSolvable(shuffledRetry)) {
        solvableTubes = shuffledRetry;
        break;
      }
      solvableTubes = shuffledRetry;
    }
  }

  // 无尽模式不计算最少步数（难度高，计算耗时）
  return {
    id: -2,
    tubes: solvableTubes,
    tubeCapacity: capacity,
    difficulty: `无尽 ${difficulty}`,
    minSteps: -1,
  };
}

// 生成限时模式关卡
// 难度固定在中等偏下，追求快速通关的节奏感
export function generateTimedLevel(score: number): Level {
  // 根据已通关数微调难度，但保持在快速可解范围
  const fakeLevel = Math.min(3 + Math.floor(score / 3), 15);
  const config = getLevelConfig(fakeLevel);
  const { tubes: tubeCount, colors: colorCount, capacity, difficulty } = config;

  // 选择颜色
  const selectedColors = shuffle(COLOR_KEYS).slice(0, colorCount);

  // 创建颜色层池
  const colorPool: ColorLayer[] = [];
  for (const color of selectedColors) {
    for (let i = 0; i < capacity; i++) {
      colorPool.push({ color });
    }
  }

  // 洗牌
  const shuffledPool = shuffle(colorPool);

  // 分配到试管
  const tubes: Tube[] = [];
  let poolIndex = 0;
  const filledTubeCount = colorCount;

  for (let i = 0; i < filledTubeCount; i++) {
    const layers: ColorLayer[] = [];
    for (let j = 0; j < capacity; j++) {
      layers.push(shuffledPool[poolIndex++]);
    }
    tubes.push({ id: i, layers, capacity });
  }

  // 添加空试管（限时模式多一个空管，降低难度）
  const emptyTubeCount = tubeCount - filledTubeCount + 1;
  for (let i = 0; i < emptyTubeCount; i++) {
    tubes.push({ id: filledTubeCount + i, layers: [], capacity });
  }

  // 打乱试管顺序
  const finalTubes = shuffle(tubes);
  finalTubes.forEach((t, i) => { t.id = i; });

  // 验证可解性
  let solvableTubes = finalTubes;
  if (!isSolvable(solvableTubes)) {
    for (let retry = 0; retry < 5; retry++) {
      const retryPool = shuffle(colorPool);
      let idx = 0;
      const retryTubes: Tube[] = [];
      for (let i = 0; i < filledTubeCount; i++) {
        const layers: ColorLayer[] = [];
        for (let j = 0; j < capacity; j++) {
          layers.push(retryPool[idx++]);
        }
        retryTubes.push({ id: i, layers, capacity });
      }
      for (let i = 0; i < emptyTubeCount; i++) {
        retryTubes.push({ id: filledTubeCount + i, layers: [], capacity });
      }
      const shuffledRetry = shuffle(retryTubes);
      shuffledRetry.forEach((t, i) => { t.id = i; });
      if (isSolvable(shuffledRetry)) {
        solvableTubes = shuffledRetry;
        break;
      }
      solvableTubes = shuffledRetry;
    }
  }

  // 限时模式不计算最少步数
  return {
    id: -3,
    tubes: solvableTubes,
    tubeCapacity: capacity,
    difficulty: `限时 ${difficulty}`,
    minSteps: -1,
  };
}

// 检查是否可以倾倒
export function canPour(from: Tube, to: Tube): boolean {
  // 源试管必须有液体
  if (from.layers.length === 0) return false;
  // 目标试管不能已满
  if (to.layers.length >= to.capacity) return false;
  // 源试管顶部颜色
  const fromTopColor = from.layers[from.layers.length - 1].color;
  // 目标试管为空，或顶部颜色相同
  if (to.layers.length === 0) return true;
  const toTopColor = to.layers[to.layers.length - 1].color;
  return fromTopColor === toTopColor;
}

// 执行倾倒操作
export function pour(from: Tube, to: Tube): { from: Tube; to: Tube } {
  if (!canPour(from, to)) return { from, to };

  const newFrom = { ...from, layers: [...from.layers] };
  const newTo = { ...to, layers: [...to.layers] };

  // 倾倒所有可以倒的同色层
  while (newFrom.layers.length > 0 && newTo.layers.length < newTo.capacity) {
    const fromTop = newFrom.layers[newFrom.layers.length - 1];
    if (newTo.layers.length > 0 && newTo.layers[newTo.layers.length - 1].color !== fromTop.color) {
      break;
    }
    const layer = newFrom.layers.pop()!;
    newTo.layers.push(layer);
  }

  return { from: newFrom, to: newTo };
}

// 检查是否胜利
export function checkWin(tubes: Tube[]): boolean {
  // 所有试管要么为空，要么全部填满同一种颜色
  return tubes.every(tube => {
    if (tube.layers.length === 0) return true;
    if (tube.layers.length !== tube.capacity) return false;
    const firstColor = tube.layers[0].color;
    return tube.layers.every(layer => layer.color === firstColor);
  });
}

// 检查是否死局（无可行操作）
export function checkDeadlock(tubes: Tube[]): boolean {
  // 快速检查：如果有空管，一定不是死局（任何非空试管都可倒入空管）
  const hasEmpty = tubes.some(t => t.layers.length === 0);
  const hasNonEmpty = tubes.some(t => t.layers.length > 0);
  if (hasEmpty && hasNonEmpty) return false;
  
  // 遍历所有试管对，检查是否存在任何有效的倾倒操作
  for (let i = 0; i < tubes.length; i++) {
    const from = tubes[i];
    if (from.layers.length === 0) continue; // 空管不能作为源
    const fromTopColor = from.layers[from.layers.length - 1].color;
    
    // 如果源试管已满且全部同色，跳过（已是完成状态）
    if (from.layers.length === from.capacity && 
        from.layers.every(l => l.color === fromTopColor)) continue;
    
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;
      const to = tubes[j];
      
      // 目标试管已满，不能倒
      if (to.layers.length >= to.capacity) continue;
      
      // 目标试管为空，可以倒
      if (to.layers.length === 0) return false;
      
      // 目标试管顶部颜色相同且有空间，可以倒
      const toTopColor = to.layers[to.layers.length - 1].color;
      if (fromTopColor === toTopColor) return false;
    }
  }
  return true;
}

// 深拷贝试管数组
export function cloneTubes(tubes: Tube[]): Tube[] {
  return tubes.map(t => ({ ...t, layers: [...t.layers] }));
}
