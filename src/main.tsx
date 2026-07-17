import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './game/themeManager'

// 初始化主题
initTheme();

// 注册 Service Worker（生产环境）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW 注册失败静默处理，不影响游戏正常运行
    });
  });
}

// PWA 安装引导：捕获 beforeinstallprompt 事件
import { setupPWAInstallPrompt } from './game/pwaInstall';
import { trackVisit, recordSessionDuration } from './game/visitTracker';
// 记录访问数据（阶段二：数据驱动迭代基础）
trackVisit();

// 页面关闭/隐藏时记录会话时长
window.addEventListener('beforeunload', recordSessionDuration);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    recordSessionDuration();
  }
});

setupPWAInstallPrompt();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
