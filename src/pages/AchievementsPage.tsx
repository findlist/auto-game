import React, { useState } from 'react';
import { AchievementManager } from '../game/achievements';

interface AchievementsPageProps {
  onBack: () => void;
}

// 成就分类定义
const CATEGORIES = [
  { id: 'all', name: '全部', icon: '🏆' },
  { id: 'progress', name: '通关进度', icon: '🎯', match: (id: string) => id.startsWith('level_') || id === 'first_win' },
  { id: 'skill', name: '技巧挑战', icon: '⚡', match: (id: string) => ['speed_run', 'efficient', 'no_hint_5', 'streak_3', 'streak_5', 'streak_10'].includes(id) },
  { id: 'speed', name: '速度成就', icon: '🏃', match: (id: string) => id.startsWith('speed_') },
  { id: 'endless', name: '无尽/限时', icon: '∞', match: (id: string) => id.startsWith('endless_') || id.startsWith('timed_') },
  { id: 'daily', name: '每日/签到', icon: '📅', match: (id: string) => id.startsWith('daily_') || id.startsWith('checkin_') || id.startsWith('weekly_') },
  { id: 'collection', name: '收集成就', icon: '⭐', match: (id: string) => id.startsWith('perfect_') || id.startsWith('total_') || id.startsWith('explorer_') || id.startsWith('color_master_') },
  // 百科小游戏分类：色彩知识、辨识测试、记忆游戏、反应测试等相关成就
  { id: 'encyclopedia', name: '百科游戏', icon: '🎨', match: (id: string) => id.startsWith('quiz_') || id.startsWith('color_perception_') || id.startsWith('sequence_memory_') || id.startsWith('pair_') || id.startsWith('reaction_') || id.startsWith('color_mixer_') || id.startsWith('encyclopedia_') || id.startsWith('knowledge_') || id === 'all_encyclopedia_games' },
];

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const achievements = AchievementManager.getAll();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;
  const [activeCategory, setActiveCategory] = useState('all');

  // 按分类过滤
  const filtered = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => {
        const cat = CATEGORIES.find(c => c.id === activeCategory);
        return cat?.match ? cat.match(a.id) : false;
      });

  // 排序方式：已解锁在前，未解锁按原始顺序；已解锁按解锁时间降序（最近解锁在前）
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (a.unlocked && b.unlocked) return (b.unlockedAt || 0) - (a.unlockedAt || 0);
    return 0;
  });

  // 计算各分类解锁数
  const categoryStats = CATEGORIES.map(cat => {
    const catAchievements = cat.id === 'all' 
      ? achievements 
      : achievements.filter(a => cat.match ? cat.match(a.id) : false);
    const unlocked = catAchievements.filter(a => a.unlocked).length;
    return { ...cat, unlocked, total: catAchievements.length };
  });

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">🏆 成就</h1>
        <div className="header-spacer" />
      </header>
      <main className="info-page">
        {/* 总体进度条 */}
        <div className="achievement-overall">
          <div className="achievement-overall-header">
            <span className="achievement-overall-text">已解锁 {unlockedCount} / {totalCount}</span>
            <span className="achievement-overall-pct">{unlockPct}%</span>
          </div>
          <div className="achievement-overall-track">
            <div className="achievement-overall-fill" style={{ width: `${unlockPct}%` }} />
          </div>
        </div>

        {/* 分类筛选标签 */}
        <div className="achievement-category-filter">
          {categoryStats.map(cat => (
            <button
              key={cat.id}
              className={`ach-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="ach-cat-icon">{cat.icon}</span>
              <span className="ach-cat-name">{cat.name}</span>
              <span className="ach-cat-count">{cat.unlocked}/{cat.total}</span>
            </button>
          ))}
        </div>

        {/* 当前分类进度条 */}
        {activeCategory !== 'all' && (
          <div className="achievement-category-progress">
            {(() => {
              const cat = categoryStats.find(c => c.id === activeCategory);
              if (!cat) return null;
              const pct = cat.total > 0 ? Math.round(cat.unlocked / cat.total * 100) : 0;
              return (
                <>
                  <div className="ach-cat-progress-header">
                    <span>{cat.icon} {cat.name}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="ach-cat-progress-track">
                    <div className="ach-cat-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 成就列表 */}
        <div className="achievement-list">
          {sortedFiltered.map(ach => (
            <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">{ach.unlocked ? ach.icon : '🔒'}</div>
              <div className="achievement-info">
                <div className="achievement-name">{ach.name}</div>
                <div className="achievement-desc">{ach.description}</div>
                {ach.unlocked && ach.unlockedAt && (
                  <div className="achievement-date">
                    {new Date(ach.unlockedAt).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
              {ach.unlocked && <span className="achievement-check">✅</span>}
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        {unlockedCount === 0 && (
          <div className="achievement-empty-hint">
            <span>🎮 开始游戏，解锁你的第一个成就吧！</span>
          </div>
        )}
      </main>
    </div>
  );
};
