// 游戏设置管理
// 管理音效、振动、主题等本地设置

import { STORAGE_KEYS } from './storageKeys';

const SETTINGS_KEY = STORAGE_KEYS.SETTINGS;

// 主题类型
export type ThemeName = 'classic' | 'dark' | 'pastel' | 'neon' | 'forest' | 'ocean';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  icon: string;
  bgGradient: string;
  tubeBg: string;
  tubeBorder: string;
  primary: string;
  secondary: string;
  text: string;
  textLight: string;
  cardBg: string;
  colors: Record<string, string>;
}

// 四套主题配色
export const THEMES: Record<ThemeName, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: '经典紫',
    icon: '🟣',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tubeBg: 'rgba(255, 255, 255, 0.15)',
    tubeBorder: 'rgba(255, 255, 255, 0.4)',
    primary: '#667eea',
    secondary: '#764ba2',
    text: '#333',
    textLight: '#fff',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    colors: {
      red: '#FF6B6B', blue: '#4ECDC4', yellow: '#FFE66D', green: '#95E1A3',
      purple: '#C589E8', orange: '#FFA07A', pink: '#FFB6C1', cyan: '#87CEEB',
      brown: '#D4A574', gray: '#B0B0B0',
    },
  },
  dark: {
    id: 'dark',
    name: '暗夜黑',
    icon: '🌑',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    tubeBg: 'rgba(255, 255, 255, 0.08)',
    tubeBorder: 'rgba(255, 255, 255, 0.25)',
    primary: '#e94560',
    secondary: '#0f3460',
    text: '#e0e0e0',
    textLight: '#f0f0f0',
    cardBg: 'rgba(30, 30, 50, 0.9)',
    colors: {
      red: '#FF6B6B', blue: '#4ECDC4', yellow: '#FFE66D', green: '#95E1A3',
      purple: '#C589E8', orange: '#FFA07A', pink: '#FFB6C1', cyan: '#87CEEB',
      brown: '#D4A574', gray: '#B0B0B0',
    },
  },
  pastel: {
    id: 'pastel',
    name: '马卡龙',
    icon: '🌸',
    bgGradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    tubeBg: 'rgba(255, 255, 255, 0.25)',
    tubeBorder: 'rgba(255, 255, 255, 0.6)',
    primary: '#f093fb',
    secondary: '#f5576c',
    text: '#5a4a5a',
    textLight: '#fff',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    colors: {
      red: '#FF9AA2', blue: '#9AD4D4', yellow: '#FFDAC1', green: '#B5EAD7',
      purple: '#C7CEEA', orange: '#FFB7B2', pink: '#FFC8DD', cyan: '#A0E7E5',
      brown: '#D4A574', gray: '#E0E0E0',
    },
  },
  neon: {
    id: 'neon',
    name: '霓虹光',
    icon: '⚡',
    bgGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    tubeBg: 'rgba(0, 255, 255, 0.08)',
    tubeBorder: 'rgba(0, 255, 255, 0.3)',
    primary: '#00ffff',
    secondary: '#ff00ff',
    text: '#e0e0ff',
    textLight: '#00ffff',
    cardBg: 'rgba(20, 20, 40, 0.9)',
    colors: {
      red: '#ff006e', blue: '#00f5ff', yellow: '#ffbe0b', green: '#39ff14',
      purple: '#bd00ff', orange: '#ff5e00', pink: '#ff00ff', cyan: '#00fff5',
      brown: '#cc8800', gray: '#888888',
    },
  },
  forest: {
    id: 'forest',
    name: '护眼绿',
    icon: '🌿',
    bgGradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    tubeBg: 'rgba(255, 255, 255, 0.2)',
    tubeBorder: 'rgba(255, 255, 255, 0.5)',
    primary: '#2d8a2d',
    secondary: '#56ab2f',
    text: '#1a3c1a',
    textLight: '#fff',
    cardBg: 'rgba(245, 255, 240, 0.92)',
    colors: {
      red: '#E57373', blue: '#64B5F6', yellow: '#FFD54F', green: '#81C784',
      purple: '#BA68C8', orange: '#FF8A65', pink: '#F06292', cyan: '#4DD0E1',
      brown: '#A1887F', gray: '#BDBDBD',
    },
  },
  ocean: {
    id: 'ocean',
    name: '海洋蓝',
    icon: '🌊',
    bgGradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    tubeBg: 'rgba(255, 255, 255, 0.18)',
    tubeBorder: 'rgba(255, 255, 255, 0.45)',
    primary: '#0288d1',
    secondary: '#026ca7',
    text: '#013a52',
    textLight: '#fff',
    cardBg: 'rgba(240, 248, 255, 0.93)',
    colors: {
      red: '#EF5350', blue: '#42A5F5', yellow: '#FFCA28', green: '#66BB6A',
      purple: '#AB47BC', orange: '#FF7043', pink: '#EC407A', cyan: '#26C6DA',
      brown: '#8D6E63', gray: '#78909C',
    },
  },
};

export interface Settings {
  sound: boolean;
  vibration: boolean;
  theme: ThemeName;
  bgm: boolean; // 背景音乐开关
  colorBlindMode: boolean; // 色弱友好模式
  autoDarkMode: boolean; // 暗色主题自动跟随系统
  colorLabels: boolean; // 色弱模式下显示颜色名称标签
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  vibration: true,
  theme: 'classic',
  bgm: false, // 默认关闭，用户可手动开启
  colorBlindMode: false, // 默认关闭
  autoDarkMode: false, // 默认关闭
  colorLabels: false, // 默认关闭
};

function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) { /* 忽略 */ }
  // 修复：返回副本而非原始引用，避免外部修改污染默认值
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* 忽略 */ }
}

// 全局设置管理器
export const GameSettings = {
  _cache: null as Settings | null,

  get(): Settings {
    if (!this._cache) this._cache = loadSettings();
    // 返回副本，避免外部直接修改污染缓存
    return { ...this._cache };
  },

  set(settings: Partial<Settings>): Settings {
    const current = this.get();
    const newSettings = { ...current, ...settings };
    saveSettings(newSettings);
    this._cache = newSettings;
    return newSettings;
  },

  getSound(): boolean {
    return this.get().sound;
  },

  getVibration(): boolean {
    return this.get().vibration;
  },

  getTheme(): ThemeName {
    return this.get().theme;
  },

  setTheme(theme: ThemeName): ThemeName {
    return this.set({ theme }).theme;
  },

  getThemeConfig(): ThemeConfig {
    return THEMES[this.get().theme] || THEMES.classic;
  },

  toggleSound(): boolean {
    return this.set({ sound: !this.get().sound }).sound;
  },

  toggleVibration(): boolean {
    return this.set({ vibration: !this.get().vibration }).vibration;
  },

  getBGM(): boolean {
    return this.get().bgm;
  },

  toggleBGM(): boolean {
    return this.set({ bgm: !this.get().bgm }).bgm;
  },

  getColorBlindMode(): boolean {
    return this.get().colorBlindMode;
  },

  toggleColorBlindMode(): boolean {
    return this.set({ colorBlindMode: !this.get().colorBlindMode }).colorBlindMode;
  },

  getAutoDarkMode(): boolean {
    return this.get().autoDarkMode;
  },

  toggleAutoDarkMode(): boolean {
    return this.set({ autoDarkMode: !this.get().autoDarkMode }).autoDarkMode;
  },

  getColorLabels(): boolean {
    return this.get().colorLabels;
  },

  toggleColorLabels(): boolean {
    return this.set({ colorLabels: !this.get().colorLabels }).colorLabels;
  },
};
