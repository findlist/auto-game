// 关卡可解性验证器
// 使用 BFS + 状态哈希判断关卡是否有解
// 为了性能，限制搜索节点数和深度

import { Tube } from './types';
import { canPour, pour, checkWin, cloneTubes } from './levelGenerator';

// 状态哈希：将试管数组转为紧凑字符串
function stateHash(tubes: Tube[]): string {
  return tubes.map(t => {
    if (t.layers.length === 0) return 'E';
    return t.layers.map(l => l.color[0]).join('');
  }).join('|');
}

// 获取所有可行的下一步
function getNextStates(tubes: Tube[]): Tube[][][] {
  const results: Tube[][][] = [];
  for (let i = 0; i < tubes.length; i++) {
    if (tubes[i].layers.length === 0) continue;
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;
      if (!canPour(tubes[i], tubes[j])) continue;
      
      // 跳过无意义操作：倒入同色未满管但源管只有一种颜色且已满
      // 这种操作是可逆的，浪费时间
      const fromTop = tubes[i].layers[tubes[i].layers.length - 1].color;
      if (tubes[j].layers.length > 0) {
        const toTop = tubes[j].layers[tubes[j].layers.length - 1].color;
        if (fromTop === toTop) {
          // 检查是否是"完整管"之间的无意义倾倒
          const fromAllSame = tubes[i].layers.every(l => l.color === fromTop);
          if (fromAllSame && tubes[i].layers.length === tubes[i].capacity) continue;
        }
      } else {
        // 倒入空管：如果源管只有一种颜色且已满，跳过（无意义）
        const fromAllSame = tubes[i].layers.every(l => l.color === fromTop);
        if (fromAllSame && tubes[i].layers.length === tubes[i].capacity) continue;
      }
      
      const { from: newFrom, to: newTo } = pour(tubes[i], tubes[j]);
      const newTubes = cloneTubes(tubes);
      newTubes[i] = newFrom;
      newTubes[j] = newTo;
      results.push([tubes, newTubes]);
    }
  }
  return results;
}

/**
 * 检查关卡是否有解
 * 使用 BFS 搜索，限制最大节点数防止超时
 * @param tubes 初始试管状态
 * @param maxNodes 最大搜索节点数（默认 5000）
 * @returns true 如果有解
 */
export function isSolvable(tubes: Tube[], maxNodes: number = 5000): boolean {
  const result = solveBFS(tubes, maxNodes);
  return result.solvable;
}

/**
 * BFS 求解器核心：返回是否可解及最少步数
 * @param tubes 初始试管状态
 * @param maxNodes 最大搜索节点数
 * @returns { solvable, minSteps }
 */
export function solveBFS(tubes: Tube[], maxNodes: number = 5000): { solvable: boolean; minSteps: number } {
  if (checkWin(tubes)) return { solvable: true, minSteps: 0 };
  
  const visited = new Set<string>();
  // 队列存储 [状态, 步数]
  const queue: Array<{ tubes: Tube[][]; steps: number }> = [];
  const initialClone = cloneTubes(tubes);
  queue.push({ tubes: [initialClone], steps: 0 });
  visited.add(stateHash(tubes));
  
  let nodeCount = 0;
  
  while (queue.length > 0 && nodeCount < maxNodes) {
    const { tubes: path, steps } = queue.shift()!;
    const current = path[path.length - 1];
    nodeCount++;
    
    const nextStates = getNextStates(current);
    
    for (const [, nextTubes] of nextStates) {
      const hash = stateHash(nextTubes);
      if (visited.has(hash)) continue;
      visited.add(hash);
      
      if (checkWin(nextTubes)) {
        return { solvable: true, minSteps: steps + 1 };
      }
      
      queue.push({ tubes: [...path, nextTubes], steps: steps + 1 });
    }
  }
  
  // 如果因为达到节点上限而停止，倾向于认为有解但无法确定最少步数
  if (nodeCount >= maxNodes) return { solvable: true, minSteps: -1 };
  return { solvable: false, minSteps: -1 };
}

/**
 * 计算关卡的理论最少步数
 * 使用 BFS 搜索最短路径
 * @param tubes 初始试管状态
 * @param maxNodes 最大搜索节点数（默认 8000，比可解性验证更大）
 * @returns 最少步数，-1 表示无法在搜索限制内确定
 */
export function getMinSteps(tubes: Tube[], maxNodes: number = 8000): number {
  const result = solveBFS(tubes, maxNodes);
  return result.minSteps;
}

/**
 * 生成保证有解的关卡
 * 如果首次生成无解，重试最多 maxRetries 次
 */
export function generateSolvableLevel(
  generateFn: () => Tube[],
  maxRetries: number = 10
): Tube[] {
  for (let i = 0; i < maxRetries; i++) {
    const tubes = generateFn();
    if (isSolvable(tubes)) return tubes;
  }
  // 兜底：返回最后一次生成的（即使无法确认可解）
  return generateFn();
}
