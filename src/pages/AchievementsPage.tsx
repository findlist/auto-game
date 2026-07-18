import React, { useState } from 'react';
import { AchievementManager, AchievementRarity } from '../game/achievements';

// 稀有度配置：标签、颜色、背景色
const RARITY_CONFIG: Record<AchievementRarity, { label: string; color: string; bg: string; glow: string }> = {
  common: { label: '普通', color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.08)', glow: 'none' },
  rare: { label: '稀有', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.08)', glow: '0 2px 8px rgba(33, 150, 243, 0.1)' },
  epic: { label: '史诗', color: '#9C27B0', bg: 'rgba(156, 39, 176, 0.08)', glow: '0 2px 12px rgba(156, 39, 176, 0.15)' },
  legendary: { label: '传说', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)', glow: '0 2px 16px rgba(255, 152, 0, 0.2)' },
};

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
  // 视图模式切换：列表视图 / 时间线视图
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

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

  // 最近解锁时间线：按解锁时间倒序，最多展示20条
  const timelineAchievements = achievements
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 20);

  // 按日期分组时间线
  const timelineGroups: Array<{ date: string; items: typeof achievements }> = [];
  const dateMap = new Map<string, typeof achievements>();
  timelineAchievements.forEach(a => {
    const dateStr = new Date(a.unlockedAt!).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!dateMap.has(dateStr)) dateMap.set(dateStr, []);
    dateMap.get(dateStr)!.push(a);
  });
  dateMap.forEach((items, date) => timelineGroups.push({ date, items }));

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

        {/* 最近解锁与即将达成提示卡片 */}
        <div className="achievement-hint-cards">
          {/* 最近解锁的成就 */}
          {timelineAchievements.length > 0 && (
            <div className="ach-hint-card ach-hint-recent" onClick={() => setViewMode('timeline')}>
              <span className="ach-hint-icon">{timelineAchievements[0].icon}</span>
              <div className="ach-hint-info">
                <span className="ach-hint-label">最近解锁</span>
                <span className="ach-hint-name">{timelineAchievements[0].name}</span>
                <span className="ach-hint-time">{new Date(timelineAchievements[0].unlockedAt!).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          )}
          {/* 下一个待解锁成就 - 选择未解锁中离解锁最近的 */}
          {(() => {
            const locked = achievements.filter(a => !a.unlocked);
            if (locked.length === 0) return (
              <div className="ach-hint-card ach-hint-complete">
                <span className="ach-hint-icon">👑</span>
                <div className="ach-hint-info">
                  <span className="ach-hint-label">全部达成</span>
                  <span className="ach-hint-name">恭喜！所有成就已解锁</span>
                </div>
              </div>
            );
            // 随机展示一个未解锁成就作为目标提示
            const nextTarget = locked[0];
            return (
              <div className="ach-hint-card ach-hint-next">
                <span className="ach-hint-icon">🔒</span>
                <div className="ach-hint-info">
                  <span className="ach-hint-label">下一个目标</span>
                  <span className="ach-hint-name">{nextTarget.name}</span>
                  <span className="ach-hint-time">{nextTarget.description}</span>
                </div>
              </div>
            );
          })()}
        </div>
        {/* 视图切换按钮 */}
        <div className="achievement-view-toggle">
          <button 
            className={`ach-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 列表
          </button>
          <button 
            className={`ach-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            🕒 时间线
          </button>
        </div>

        {viewMode === 'timeline' ? (
          /* 时间线视图：按日期分组展示最近解锁的成就 */
          <div className="achievement-timeline">
            {timelineGroups.length === 0 ? (
              <div className="achievement-empty-hint">
                <span>🎮 还没有解锁任何成就，开始游戏吧！</span>
              </div>
            ) : (
              timelineGroups.map((group, gi) => (
                <div key={gi} className="timeline-group">
                  <div className="timeline-date-header">
                    <span className="timeline-date-icon">📅</span>
                    <span className="timeline-date-text">{group.date}</span>
                    <span className="timeline-date-count">{group.items.length} 个成就</span>
                  </div>
                  <div className="timeline-items">
                    {group.items.map((ach, ii) => (
                      <div key={ach.id} className="timeline-item">
                        <div className="timeline-item-line">
                          {ii < group.items.length - 1 && <span className="timeline-connector" />}
                        </div>
                        <div className="timeline-item-dot">{ach.icon}</div>
                        <div className="timeline-item-content">
                          <div className="timeline-item-name">{ach.name}</div>
                          <div className="timeline-item-desc">{ach.description}</div>
                          <div className="timeline-item-time">
                            {new Date(ach.unlockedAt!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className="achievement-check">✅</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
        <>
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
          {sortedFiltered.map(ach => {
            const rarity = RARITY_CONFIG[ach.rarity || 'common'];
            return (
            <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`} style={{ borderLeftColor: ach.unlocked ? rarity.color : undefined, boxShadow: ach.unlocked ? rarity.glow : undefined }}>
              <div className="achievement-icon">{ach.unlocked ? ach.icon : '🔒'}</div>
              <div className="achievement-info">
                <div className="achievement-name-row">
                  <span className="achievement-name">{ach.name}</span>
                  {ach.rarity && ach.rarity !== 'common' && (
                    <span className="ach-rarity-badge" style={{ color: rarity.color, background: rarity.bg }}>{rarity.label}</span>
                  )}
                </div>
                <div className="achievement-desc">{ach.description}</div>
                {ach.unlocked && ach.unlockedAt && (
                  <div className="achievement-date">
                    {new Date(ach.unlockedAt).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
              {ach.unlocked && <span className="achievement-check">✅</span>}
            </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        {unlockedCount === 0 && (
          <div className="achievement-empty-hint">
            <span>🎮 开始游戏，解锁你的第一个成就吧！</span>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
};
