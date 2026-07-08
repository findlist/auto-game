// 种子随机数生成器 - 用于每日挑战的可复现随机
// 使用 Mulberry32 算法（轻量快速，适合游戏用途）

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  // 生成 [0, 1) 区间的浮点数
  next(): number {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // 生成 [min, max] 区间的整数
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // 洗牌算法（种子版）
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// 根据日期生成种子
// 格式：YYYYMMDD → 数字种子
export function dateToSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

// 获取今日的每日挑战种子
export function getDailySeed(): number {
  return dateToSeed(new Date());
}

// 获取指定日期偏移量的种子（用于查看历史挑战）
export function getDailySeedByOffset(dayOffset: number): number {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return dateToSeed(date);
}
