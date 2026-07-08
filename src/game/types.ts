// 游戏类型定义

// 单个颜色层
export interface ColorLayer {
  color: string; // 颜色值
}

// 试管
export interface Tube {
  id: number;
  layers: ColorLayer[]; // 从底部到顶部的颜色层
  capacity: number; // 试管容量
}

// 关卡定义
export interface Level {
  id: number;
  tubes: Tube[];
  tubeCapacity: number;
  difficulty: string;
  minSteps?: number; // 理论最少步数（-1 表示无法计算）
}

// 游戏状态
export interface GameState {
  level: number;
  tubes: Tube[];
  selectedTube: number | null; // 当前选中的试管索引
  moves: number; // 移动步数
  isWon: boolean;
  history: Tube[][]; // 撤销历史
}

// 颜色配置 - 默认经典主题色（运行时由 ThemeManager 动态覆盖）
export const COLORS: Record<string, string> = {
  red: '#FF6B6B',
  blue: '#4ECDC4',
  yellow: '#FFE66D',
  green: '#95E1A3',
  purple: '#C589E8',
  orange: '#FFA07A',
  pink: '#FFB6C1',
  cyan: '#87CEEB',
  brown: '#D4A574',
  gray: '#B0B0B0',
};

export const COLOR_KEYS = Object.keys(COLORS);

// 动态更新颜色配置（由主题系统调用）
export function updateColors(newColors: Record<string, string>) {
  Object.keys(newColors).forEach(key => {
    COLORS[key] = newColors[key];
  });
}
