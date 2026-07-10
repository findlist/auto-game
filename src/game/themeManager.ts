// 主题管理器 - 动态切换全局 CSS 变量和颜色配置
import { GameSettings, ThemeConfig, THEMES, ThemeName } from './settings';
import { updateColors } from './types';

// 应用主题到页面
export function applyTheme(themeName?: ThemeName) {
  // 修复：对无效主题名防御，避免 THEMES[themeName] 为 undefined 时后续访问抛 TypeError 白屏
  const config = themeName ? (THEMES[themeName] || THEMES.classic) : GameSettings.getThemeConfig();
  
  const root = document.documentElement;
  root.style.setProperty('--bg-gradient', config.bgGradient);
  root.style.setProperty('--tube-bg', config.tubeBg);
  root.style.setProperty('--tube-border', config.tubeBorder);
  root.style.setProperty('--primary', config.primary);
  root.style.setProperty('--secondary', config.secondary);
  root.style.setProperty('--text', config.text);
  root.style.setProperty('--text-light', config.textLight);
  root.style.setProperty('--card-bg', config.cardBg);
  
  // 更新动态颜色
  updateColors(config.colors);
  
  // 更新 meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', config.primary);
  }
}

// 初始化主题（在应用启动时调用）
export function initTheme() {
  applyTheme();
}

// 获取当前主题配置
export function getCurrentTheme(): ThemeConfig {
  return GameSettings.getThemeConfig();
}

// 切换主题
export function switchTheme(themeName: ThemeName) {
  GameSettings.setTheme(themeName);
  applyTheme(themeName);
}
