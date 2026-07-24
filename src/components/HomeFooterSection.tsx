import { useState, useCallback, memo, Suspense, lazy } from 'react';
import { AchievementManager } from '../game/achievements';
import type { CustomLevel } from '../game/levelEditor';

// 懒加载 FAQ 组件
const FaqList = lazy(() => import('./FaqList'));

interface HomeFooterSectionProps {
  customLevels: CustomLevel[];
  onPlayCustomLevel: (level: CustomLevel) => void;
  onNavigateToEditor: () => void;
  onNavigateToAchievements: () => void;
  onOpenSavedRecipes: () => void;
}

/**
 * 首页底部内容区块：自定关卡入口 + 广告位 + 捐赠 + FAQ + 配方收藏入口 + 成就快捷入口
 * 合并首页底部零散区块为独立组件，减少 App.tsx 代码量
 */
function HomeFooterSectionComponent({
  customLevels,
  onPlayCustomLevel,
  onNavigateToEditor,
  onNavigateToAchievements,
  onOpenSavedRecipes,
}: HomeFooterSectionProps) {
  const [faqCollapsed, setFaqCollapsed] = useState(true);

  const handleEnterPress = useCallback((fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  }, []);

  // 已保存混合配方数量
  let recipeCount = 0;
  try { recipeCount = JSON.parse(localStorage.getItem('color_mixer_recipes') || '[]').length; } catch (e) { /* 忽略 */ }

  // 成就数据
  const allAchievements = AchievementManager.getAll();
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const pct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;
  const unlockedSorted = allAchievements
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
  const recent = unlockedSorted[0];
  const nextTarget = allAchievements.find(a => !a.unlocked);

  return (
    <>
      {/* 自定关卡快速入口 */}
      {customLevels.length > 0 && (
        <div className="custom-levels-section">
          <h3 className="custom-levels-title">💻 我的关卡</h3>
          <div className="custom-levels-list">
            {customLevels.slice(0, 3).map(lv => (
              <div key={lv.id} className="custom-level-card" onClick={() => onPlayCustomLevel(lv)}>
                <span className="custom-level-icon">🎮</span>
                <div className="custom-level-info">
                  <span className="custom-level-name">{lv.name}</span>
                  <span className="custom-level-meta">{lv.difficulty} · {lv.tubes.length}管 · {lv.completed ? '✅ 已通关' : '未通关'}</span>
                </div>
                <span className="custom-level-arrow">→</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-small" onClick={onNavigateToEditor}>查看全部 →</button>
        </div>
      )}

      {/* 广告位预留 - 首页底部 */}
      <div className="ad-slot ad-home">
        <span className="ad-label">广告位</span>
      </div>

      {/* 捐赠 */}
      <div className="donate-section">
        <p>喜欢这个游戏?</p>
        <a href="#" className="donate-link" onClick={(e) => e.preventDefault()}>
          👍 支持开发者
        </a>
      </div>

      {/* 常见问题 */}
      <div className="collapsible-section">
        <div className="collapse-header" onClick={() => setFaqCollapsed(!faqCollapsed)} role="button" tabIndex={0} aria-expanded={!faqCollapsed} onKeyDown={handleEnterPress(() => setFaqCollapsed(!faqCollapsed))}>
          <h3>❓ 常见问题</h3>
          <span className={`collapse-toggle ${faqCollapsed ? 'collapsed' : ''}`}>▼</span>
        </div>
        <div className={`collapse-content ${faqCollapsed ? 'collapsed' : ''}`}>
          <Suspense fallback={<div style={{padding:'20px',textAlign:'center',color:'#999'}}>加载中...</div>}>
            <FaqList />
          </Suspense>
        </div>
      </div>

      {/* 已保存混合配方快速查看入口 */}
      {recipeCount > 0 && (
        <div className="saved-recipes-entry" onClick={onOpenSavedRecipes} role="button" tabIndex={0} onKeyDown={handleEnterPress(onOpenSavedRecipes)}>
          <span className="saved-recipes-icon">📋</span>
          <div className="saved-recipes-info">
            <span className="saved-recipes-title">我的混合配方</span>
            <span className="saved-recipes-count">已保存 {recipeCount} 个配色配方</span>
          </div>
          <span className="saved-recipes-arrow">→</span>
        </div>
      )}

      {/* 今日成就快捷入口 */}
      <div className="today-achievement-card" onClick={onNavigateToAchievements} role="button" tabIndex={0}
        onKeyDown={handleEnterPress(onNavigateToAchievements)}>
        <div className="today-ach-header">
          <span className="today-ach-icon">🏆</span>
          <div className="today-ach-info">
            <span className="today-ach-label">今日成就</span>
            <span className="today-ach-progress">{unlockedCount}/{totalCount} 已解锁 · {pct}%</span>
          </div>
        </div>
        <div className="today-ach-bar">
          <div className="today-ach-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="today-ach-detail">
          {recent ? (
            <span className="today-ach-recent">最近解锁: {recent.icon} {recent.name}</span>
          ) : (
            <span className="today-ach-recent">开始游戏解锁你的第一个成就!</span>
          )}
          {nextTarget && (
            <span className="today-ach-next">下一个目标: {nextTarget.icon} {nextTarget.name}</span>
          )}
        </div>
      </div>
    </>
  );
}

export const HomeFooterSection = memo(HomeFooterSectionComponent);
