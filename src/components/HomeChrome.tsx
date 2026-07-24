import { GameSettings } from '../game/settings';
import { SoundEngine } from '../game/soundEngine';
import type { ReactNode } from 'react';

// 首页骨架组件：header（音效/BGM切换 + logo）+ footer（底部导航链接）+ 浮动快捷导航
// 从 App.tsx 提取，集中管理首页外围 UI 框架

interface HomeChromeProps {
  // 页面导航
  onNavigate: (page: string) => void;
  onShowHelp: () => void;
  // 子内容
  children: ReactNode;
  // 弹窗内容
  dialogs?: ReactNode;
}

export function HomeChrome({ onNavigate, onShowHelp, children, dialogs }: HomeChromeProps) {
  return (
    <div className="app">
      <a href="#main-content" className="sr-only">跳转到主要内容</a>
      <header className="home-header">
        <div className="header-controls">
          <button className="sound-toggle-btn" onClick={() => {
            const newSound = GameSettings.toggleSound();
            if (newSound) SoundEngine.click();
            // 关闭音效时同时停止背景音乐
            if (!newSound) SoundEngine.stopBGM();
          }} aria-label={GameSettings.getSound() ? '关闭音效' : '开启音效'} title={GameSettings.getSound() ? '关闭音效' : '开启音效'}>
            {GameSettings.getSound() ? '🔊' : '🔇'}
          </button>
          {/* BGM快捷切换 - 独立于音效开关，方便玩家随时切换背景音乐 */}
          <button className="sound-toggle-btn bgm-toggle-btn" onClick={() => {
            const newBgm = GameSettings.toggleBGM();
            if (newBgm) {
              SoundEngine.resume();
              SoundEngine.startBGM();
            } else {
              SoundEngine.stopBGM();
            }
          }} aria-label={GameSettings.getBGM() ? '关闭背景音乐' : '开启背景音乐'} title={GameSettings.getBGM() ? '关闭背景音乐' : '开启背景音乐'}>
            {GameSettings.getBGM() ? '🎵' : '🎵̸'}
          </button>
        </div>
        <div className="logo">🎨</div>
        <h1 className="title">色彩排序</h1>
        <p className="subtitle">经典好玩的颜色游戏</p>
        <p className="tagline">动动手指排列颜色吧!</p>
      </header>

      <main className="home-main" id="main-content">
        {children}
      </main>

      <footer className="home-footer">
        <button className="footer-link" onClick={() => onNavigate('about')}>关于</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={onShowHelp}>📖 玩法</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('achievements')}>🏆 成就</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('stats')}>📊 统计</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('editor')}>🔧 编辑器</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('settings')}>⚙️ 设置</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('encyclopedia')}>🎨 色彩百科</button>
        <span className="footer-divider">|</span>
        <button className="footer-link" onClick={() => onNavigate('privacy')}>隐私政策</button>
      </footer>

      {/* 浮动快捷导航按钮 */}
      <div className="fab-nav">
        <button className="fab-nav-btn" onClick={() => { onNavigate('achievements'); SoundEngine.click(); }} aria-label="成就" title="成就">🏆</button>
        <button className="fab-nav-btn" onClick={() => { onNavigate('stats'); SoundEngine.click(); }} aria-label="统计" title="统计">📊</button>
        <button className="fab-nav-btn" onClick={() => { onNavigate('settings'); SoundEngine.click(); }} aria-label="设置" title="设置">⚙️</button>
      </div>

      {dialogs}
    </div>
  );
}
