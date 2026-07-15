// 主题管理器 - 动态切换全局 CSS 变量和颜色配置
import { GameSettings, ThemeConfig, THEMES, ThemeName } from './settings';
import { updateColors } from './types';

// 系统暗色模式媒体查询对象引用
let darkMediaQuery: MediaQueryList | null = null;
// 系统暗色模式变化监听器
let darkModeListener: ((e: MediaQueryListEvent) => void) | null = null;

// 判断当前系统是否为暗色模式
function isSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 根据 autoDarkMode 设置决定实际使用的主题
function resolveTheme(): ThemeName {
  const settings = GameSettings.get();
  if (settings.autoDarkMode && isSystemDark()) {
    return 'dark';
  }
  return settings.theme;
}

// 应用主题到页面
export function applyTheme(themeName?: ThemeName) {
  // 如果未传入主题名，则根据 autoDarkMode 设置解析
  if (!themeName) {
    themeName = resolveTheme();
  }
  // 修复：对无效主题名防御，避免 THEMES[themeName] 为 undefined 时后续访问抛 TypeError 白屏
  const config = THEMES[themeName] || THEMES.classic;
  
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
  // 如果 autoDarkMode 开启，注册系统暗色模式变化监听器
  if (GameSettings.getAutoDarkMode()) {
    setupAutoDarkModeListener();
  }
  applyTheme();
}

// 注册系统暗色模式变化监听器
function setupAutoDarkModeListener() {
  if (darkMediaQuery) return; // 避免重复注册
  darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeListener = () => {
    applyTheme();
  };
  darkMediaQuery.addEventListener('change', darkModeListener);
}

// 移除系统暗色模式变化监听器
function removeAutoDarkModeListener() {
  if (darkMediaQuery && darkModeListener) {
    darkMediaQuery.removeEventListener('change', darkModeListener);
    darkMediaQuery = null;
    darkModeListener = null;
  }
}

// 开启/关闭 autoDarkMode 时调用
export function onAutoDarkModeChange(enabled: boolean) {
  if (enabled) {
    setupAutoDarkModeListener();
  } else {
    removeAutoDarkModeListener();
  }
  applyTheme();
}

// 获取当前主题配置
export function getCurrentTheme(): ThemeConfig {
  const resolvedTheme = resolveTheme();
  return THEMES[resolvedTheme] || THEMES.classic;
}

// 切换主题
export function switchTheme(themeName: ThemeName) {
  GameSettings.setTheme(themeName);
  // 如果 autoDarkMode 开启，需要重新判断是否应该使用暗色主题
  applyTheme(resolveTheme());
}
