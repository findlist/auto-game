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
import { setupPWAInstallPrompt } from './App';
setupPWAInstallPrompt();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
