import React, { useState } from 'react';
import { GameSettings, THEMES, ThemeName } from '../game/settings';
import { switchTheme } from '../game/themeManager';
import { SoundEngine } from '../game/soundEngine';
import { DailyCheckin } from '../game/dailyCheckin';
import { StatsTracker } from '../game/statsTracker';
import { resetHintItems } from '../game/hintItems';
import { getTodayString } from '../game/dailyChallenge';
import { getAllDailyTips } from '../game/announcements';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState(GameSettings.get());

  const toggleSound = () => {
    const newSound = !settings.sound;
    setSettings({ ...settings, sound: newSound });
    GameSettings.set({ sound: newSound });
    if (newSound) {
      SoundEngine.resume();
      SoundEngine.click();
    }
  };

  const toggleVibration = () => {
    const newVib = !settings.vibration;
    setSettings({ ...settings, vibration: newVib });
    GameSettings.set({ vibration: newVib });
    if (newVib) navigator.vibrate?.(50);
  };

  const toggleBGM = () => {
    const newBgm = !settings.bgm;
    setSettings({ ...settings, bgm: newBgm });
    GameSettings.set({ bgm: newBgm });
    if (newBgm) {
      SoundEngine.resume();
      SoundEngine.startBGM();
    } else {
      SoundEngine.stopBGM();
    }
  };

  const handleThemeChange = (theme: ThemeName) => {
    switchTheme(theme);
    setSettings({ ...settings, theme });
    SoundEngine.click();
  };

  const handleResetProgress = () => {
    if (confirm('确认要重置所有游戏数据吗？此操作不可撤销')) {
      localStorage.removeItem('color-sort-progress');
      localStorage.removeItem('color-sort-best-scores');
      localStorage.removeItem('color-sort-tutorial-seen');
      localStorage.removeItem('color-sort-achievements');
      localStorage.removeItem('color-sort-daily');
      localStorage.removeItem('color-sort-timed-highscore');
      localStorage.removeItem('color-sort-stars');
      localStorage.removeItem('color-sort-stats');
      localStorage.removeItem('color-sort-checkin');
      resetHintItems();
      DailyCheckin.reset();
      StatsTracker.reset();
      alert('游戏数据已重置。');
    }
  };

  const handleExportData = () => {
    const keys = [
      'color-sort-progress', 'color-sort-best-scores', 'color-sort-tutorial-seen',
      'color-sort-achievements', 'color-sort-daily', 'color-sort-timed-highscore',
      'color-sort-stars', 'color-sort-stats', 'color-sort-endless',
      'color-sort-settings', 'color-sort-checkin',
      'color-sort-hint-items', 'color-sort-hint-daily-bonus',
    ];
    const data: Record<string, string> = {};
    keys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    data['__export_time'] = new Date().toISOString();
    data['__version'] = '1.1.0';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-sort-backup-${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== 'object' || data === null) throw new Error('格式错误');
        if (!confirm('导入存档将覆盖当前进度，确认导入？')) return;
        Object.keys(data).forEach(k => {
          if (k.startsWith('color-sort-')) {
            localStorage.setItem(k, data[k]);
          }
        });
        alert('存档导入成功！请刷新页面以加载存档数据。');
        location.reload();
      } catch {
        alert('存档文件格式错误，导入失败。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">⚙️ 设置</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
        <div className="settings-card">
          <div className="setting-item" onClick={toggleSound}>
            <div className="setting-info">
              <div className="setting-icon">🔊</div>
              <div>
                <div className="setting-name">音效</div>
                <div className="setting-desc">游戏内音效</div>
              </div>
            </div>
            <div className={`toggle-switch ${settings.sound ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="setting-item" onClick={toggleVibration}>
            <div className="setting-info">
              <div className="setting-icon">📳</div>
              <div>
                <div className="setting-name">震动</div>
                <div className="setting-desc">点击操作时震动（需设备支持）</div>
              </div>
            </div>
            <div className={`toggle-switch ${settings.vibration ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="setting-item" onClick={toggleBGM}>
            <div className="setting-info">
              <div className="setting-icon">🎵</div>
              <div>
                <div className="setting-name">背景音乐</div>
                <div className="setting-desc">开启后循环播放</div>
              </div>
            </div>
            <div className={`toggle-switch ${settings.bgm ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item-static">
            <div className="setting-icon">🎨</div>
            <div>
              <div className="setting-name">主题切换</div>
              <div className="setting-desc">选择喜欢的颜色主题</div>
            </div>
          </div>
          <div className="theme-grid">
            {(Object.values(THEMES)).map(theme => (
              <button
                key={theme.id}
                className={`theme-btn ${settings.theme === theme.id ? 'theme-active' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  background: theme.bgGradient,
                  borderColor: settings.theme === theme.id ? theme.primary : 'transparent',
                }}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name-label">{theme.name}</span>
              </button>
            ))}
          </div>
          {/* 主题预览区域 */}
          <div className="theme-preview" style={{ background: THEMES[settings.theme].bgGradient, borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
            <div className="theme-preview-title" style={{ color: THEMES[settings.theme].textLight, fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
              {THEMES[settings.theme].icon} {THEMES[settings.theme].name} · 预览
            </div>
            <div className="theme-preview-colors" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.values(THEMES[settings.theme].colors).slice(0, 8).map((color, idx) => (
                <div key={idx} style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: color,
                  border: '2px solid rgba(255,255,255,0.3)',
                }} />
              ))}
            </div>
            <div className="theme-preview-tubes" style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: '24px',
                  height: '40px',
                  borderRadius: '4px 4px 12px 12px',
                  background: Object.values(THEMES[settings.theme].colors)[i] || '#ccc',
                  opacity: 0.8,
                  border: `2px solid ${THEMES[settings.theme].tubeBorder}`,
                }} />
              ))}
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item setting-danger" onClick={handleResetProgress}>
            <div className="setting-info">
              <div className="setting-icon">⚠️</div>
              <div>
                <div className="setting-name">重置进度</div>
                <div className="setting-desc">清除所有关卡记录和已获得成就</div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item-static">
            <div className="setting-icon">💾</div>
            <div>
              <div className="setting-name">存档管理</div>
              <div className="setting-desc">导入或恢复游戏数据</div>
            </div>
          </div>
          <div className="backup-actions">
            <button className="btn btn-secondary btn-backup" onClick={handleExportData}>
              📦 导出存档
            </button>
            <label className="btn btn-secondary btn-backup" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (document.getElementById('import-input') as HTMLInputElement)?.click(); } }}>
              📥 导入存档
              <input
                id="import-input"
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={handleImportData}
              />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item-static">
            <div className="setting-icon">💡</div>
            <div>
              <div className="setting-name">策略小贴士</div>
              <div className="setting-desc">30 条游戏技巧，每天轮播一条</div>
            </div>
          </div>
          <div className="tips-list">
            {getAllDailyTips().map((tip, idx) => (
              <div key={idx} className="tip-item">
                <span className="tip-item-icon">{tip.icon}</span>
                <div className="tip-item-content">
                  <div className="tip-item-title">{tip.title}</div>
                  <div className="tip-item-text">{tip.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item-static">
            <div className="setting-icon">ℹ️</div>
            <div>
              <div className="setting-name">版本信息</div>
              <div className="setting-desc">色彩排序 v1.37.0 | 2026</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
