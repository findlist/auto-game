import React, { memo } from 'react';
import { Progress } from '../game/homeStorage';

// 首页通关进度条+关卡选择区域组件
// 从 App.tsx 提取，减少主文件代码量，使用 React.memo 优化重渲染

const LEVELS_PER_PAGE = 20; // 关卡选择每页显示数量

interface LevelSelectSectionProps {
  progress: Progress;
  levelStars: Record<number, number>;
  bestScores: Record<number, number>;
  pageLevel: number;
  setPageLevel: React.Dispatch<React.SetStateAction<number>>;
  levelSearchInput: string;
  setLevelSearchInput: (v: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  onSelectLevel: (level: number) => void;
  progressCollapsed: boolean;
  setProgressCollapsed: (v: boolean) => void;
  levelSelectCollapsed: boolean;
  setLevelSelectCollapsed: (v: boolean) => void;
}

export const LevelSelectSection: React.FC<LevelSelectSectionProps> = memo(({
  progress,
  levelStars,
  bestScores,
  pageLevel,
  setPageLevel,
  levelSearchInput,
  setLevelSearchInput,
  difficultyFilter,
  setDifficultyFilter,
  onSelectLevel,
  progressCollapsed,
  setProgressCollapsed,
  levelSelectCollapsed,
  setLevelSelectCollapsed,
}) => {
  // 关卡跳转处理
  const handleLevelJump = () => {
    const lvl = parseInt(levelSearchInput, 10);
    if (lvl >= 1 && lvl <= 100) {
      setPageLevel(Math.floor((lvl - 1) / LEVELS_PER_PAGE));
      onSelectLevel(lvl);
    }
  };

  return (
    <>
      {/* 通关进度条 */}
      <div className="collapsible-section">
        <div className="collapse-header" onClick={() => setProgressCollapsed(!progressCollapsed)} role="button" tabIndex={0} aria-expanded={!progressCollapsed} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProgressCollapsed(!progressCollapsed); } }}>
          <h3>📊 通关进度</h3>
          <span className={`collapse-toggle ${progressCollapsed ? 'collapsed' : ''}`}>▼</span>
        </div>
        <div className={`collapse-content ${progressCollapsed ? 'collapsed' : ''}`}>
          <div className="progress-bar-section">
            <div className="progress-bar-header">
              <span>通关进度</span>
              <span className="progress-percent">{Math.round(progress.completedLevels.length / 100 * 100)}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress.completedLevels.length)}%` }} />
            </div>
            {/* 难度分段进度 */}
            <div className="difficulty-progress">
              {(() => {
                const ranges = [
                  { name: '入门', min: 1, max: 20, color: '#4CAF50' },
                  { name: '中级', min: 21, max: 40, color: '#2196F3' },
                  { name: '高级', min: 41, max: 60, color: '#FF9800' },
                  { name: '专家', min: 61, max: 80, color: '#f44336' },
                  { name: '大师', min: 81, max: 100, color: '#9C27B0' },
                ];
                return ranges.map(r => {
                  const completed = r.min === r.max
                    ? (progress.completedLevels.includes(r.min) ? 1 : 0)
                    : progress.completedLevels.filter(l => l >= r.min && l <= r.max).length;
                  const total = r.max - r.min + 1;
                  const pct = Math.round(completed / total * 100);
                  return (
                    <div key={r.name} className="diff-progress-item">
                      <span className="diff-progress-label" style={{ color: r.color }}>{r.name}</span>
                      <div className="diff-progress-track">
                        <div className="diff-progress-fill" style={{ width: `${pct}%`, background: r.color }} />
                      </div>
                      <span className="diff-progress-count">{completed}/{total}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 关卡选择 */}
      <div className="collapsible-section">
        <div className="collapse-header" onClick={() => setLevelSelectCollapsed(!levelSelectCollapsed)} role="button" tabIndex={0} aria-expanded={!levelSelectCollapsed} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLevelSelectCollapsed(!levelSelectCollapsed); } }}>
          <h3>🎮 选择关卡</h3>
          <span className={`collapse-toggle ${levelSelectCollapsed ? 'collapsed' : ''}`}>▼</span>
        </div>
        <div className={`collapse-content ${levelSelectCollapsed ? 'collapsed' : ''}`}>
          <div className="level-select">
            {/* 关卡总体进度概览：通关数/总星数/最高关卡 */}
            <div className="level-overview-bar">
              <div className="level-overview-item">
                <span className="level-overview-icon">🎯</span>
                <span className="level-overview-text">通关 <strong>{progress.completedLevels.length}</strong>/100</span>
              </div>
              <div className="level-overview-item">
                <span className="level-overview-icon">⭐</span>
                <span className="level-overview-text">总星数 <strong>{Object.values(levelStars).reduce((s, v) => s + v, 0)}</strong></span>
              </div>
              <div className="level-overview-item">
                <span className="level-overview-icon">🏆</span>
                <span className="level-overview-text">最高 <strong>第{progress.currentLevel}关</strong></span>
              </div>
              <div className="level-overview-progress">
                <div className="level-overview-track">
                  <div className="level-overview-fill" style={{ width: `${Math.min(progress.completedLevels.length, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="level-select-header">
              <h3>选择关卡</h3>
              <div className="level-search-box">
                <input
                  type="number"
                  className="level-search-input"
                  placeholder="输入关卡号"
                  min="1"
                  max="100"
                  value={levelSearchInput}
                  onChange={(e) => setLevelSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLevelJump();
                    }
                  }}
                />
                <button
                  className="level-search-btn"
                  onClick={handleLevelJump}
                  disabled={!levelSearchInput}
                >跳转</button>
              </div>
              <div className="level-pages">
                <button
                  className="page-btn"
                  onClick={() => setPageLevel(p => Math.max(0, p - 1))}
                  disabled={pageLevel === 0}
                >◀</button>
                <span className="page-info">第 {pageLevel + 1}/{Math.max(1, Math.ceil(Math.max(20, progress.currentLevel + 5) / LEVELS_PER_PAGE))} 页</span>
                <button
                  className="page-btn"
                  onClick={() => setPageLevel(p => p + 1)}
                  disabled={(pageLevel + 1) * LEVELS_PER_PAGE >= Math.max(20, progress.currentLevel + 5)}
                >▶</button>
              </div>
            </div>
            <div className="difficulty-filter" aria-label="难度筛选">
              <button className={`diff-filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`} onClick={() => setDifficultyFilter('all')}>全部</button>
              <button className={`diff-filter-btn diff-easy ${difficultyFilter === 'easy' ? 'active' : ''}`} onClick={() => setDifficultyFilter('easy')}>入门</button>
              <button className={`diff-filter-btn diff-normal ${difficultyFilter === 'normal' ? 'active' : ''}`} onClick={() => setDifficultyFilter('normal')}>普通</button>
              <button className={`diff-filter-btn diff-medium ${difficultyFilter === 'medium' ? 'active' : ''}`} onClick={() => setDifficultyFilter('medium')}>中等</button>
              <button className={`diff-filter-btn diff-hard ${difficultyFilter === 'hard' ? 'active' : ''}`} onClick={() => setDifficultyFilter('hard')}>困难</button>
              <button className={`diff-filter-btn diff-expert ${difficultyFilter === 'expert' ? 'active' : ''}`} onClick={() => setDifficultyFilter('expert')}>专家</button>
              <button className={`diff-filter-btn diff-master ${difficultyFilter === 'master' ? 'active' : ''}`} onClick={() => setDifficultyFilter('master')}>大师</button>
            </div>
            <div className="level-grid">
              {Array.from({ length: Math.max(20, progress.currentLevel + 5) }, (_, i) => i + 1)
                .filter(lvl => {
                  if (difficultyFilter === 'all') return true;
                  let diffClass = 'diff-easy';
                  if (lvl > 90) diffClass = 'diff-master';
                  else if (lvl > 50) diffClass = 'diff-expert';
                  else if (lvl > 30) diffClass = 'diff-hard';
                  else if (lvl > 20) diffClass = 'diff-medium';
                  else if (lvl > 6) diffClass = 'diff-normal';
                  return diffClass === `diff-${difficultyFilter}`;
                })
                .slice(pageLevel * LEVELS_PER_PAGE, (pageLevel + 1) * LEVELS_PER_PAGE)
                .map(lvl => {
                  const stars = levelStars[lvl] || 0;
                  const best = bestScores[lvl];
                  // 难度颜色匹配
                  let diffClass = 'diff-easy';
                  if (lvl > 50) diffClass = 'diff-expert';
                  else if (lvl > 30) diffClass = 'diff-hard';
                  else if (lvl > 20) diffClass = 'diff-medium';
                  else if (lvl > 12) diffClass = 'diff-normal';
                  else if (lvl > 6) diffClass = 'diff-normal';
                  // 91-100 大师
                  if (lvl > 90) diffClass = 'diff-master';
                  const isCompleted = progress.completedLevels.includes(lvl);
                  const diffNames: Record<string, string> = {
                    'diff-easy': '入门', 'diff-normal': '普通', 'diff-medium': '中等',
                    'diff-hard': '困难', 'diff-expert': '专家', 'diff-master': '大师'
                  };
                  const diffName = diffNames[diffClass] || '普通';
                  return (
                    <button
                      key={lvl}
                      className={`level-btn ${diffClass} ${isCompleted ? 'completed' : ''} ${lvl === progress.currentLevel ? 'current' : ''}`}
                      onClick={() => onSelectLevel(lvl)}
                      aria-label={`第${lvl}关${isCompleted ? `,已完成,最佳${best || '?'}步,${stars}星!` : ''}`}
                      title={isCompleted ? `第${lvl}关 | 最佳: ${best || '?'}步 | ${'⭐'.repeat(stars) || '未评级'}` : `第${lvl}关`}
                    >
                      <span className="level-diff-dot" data-diff={diffClass} />
                      {isCompleted ? `${'⭐'.repeat(Math.min(stars, 3)) || '✓'}` : ''} {lvl}
                      {/* 关卡详情提示：悬停/长按显示最优步数、历史最佳、难度等级 */}
                      <span className="level-tooltip">
                        <span className="level-tooltip-title">第 {lvl} 关 · {diffName}</span>
                        {isCompleted ? (
                          <span className="level-tooltip-detail">
                            <span className="level-tooltip-row">最佳: <strong>{best || '?'}步</strong></span>
                            <span className="level-tooltip-row">星级: {'⭐'.repeat(stars) || '未评级'}</span>
                          </span>
                        ) : (
                          <span className="level-tooltip-detail">
                            <span className="level-tooltip-row">状态: 未挑战</span>
                            <span className="level-tooltip-hint">点击开始!</span>
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

LevelSelectSection.displayName = 'LevelSelectSection';
