import { lazy, Suspense } from 'react';
import { triggerPWAInstall, isPWAInstallDismissed } from '../game/pwaInstall';
import type { AutosaveData } from '../game/homeStorage';
import type { Achievement } from '../game/achievements';
import type { ComboCelebration } from '../game/comboStreak';
import type { Announcement } from '../game/announcements';
import type { ReplayData } from '../game/replayShare';

// 懒加载非首屏弹窗组件
const ChangelogModal = lazy(() => import('./ChangelogModal'));
const HomeModals = lazy(() => import('./HomeModals'));

// 首页弹窗集合组件：自动存档恢复+新手引导+成就通知+连击庆祝+PWA安装+玩法弹窗+回放查看+更新日志+签到/公告/配方弹窗
// 从 App.tsx 提取，集中管理首页所有弹窗和浮层 UI

interface HomeDialogsProps {
  // 自动存档恢复
  showResumeDialog: boolean;
  autosaveData: AutosaveData | null;
  onResume: () => void;
  onDiscardAutosave: () => void;
  onCloseResume: () => void;
  // 新手引导
  showTutorial: boolean;
  onTutorialClose: () => void;
  // 分享提示
  showShareToast: boolean;
  // 成就通知
  newAchievements: Achievement[];
  onDismissAchievement: () => void;
  // 连击庆祝
  comboCelebration: ComboCelebration | null;
  onCloseComboCelebration: () => void;
  // PWA 安装
  showPWAInstall: boolean;
  onClosePWAInstall: () => void;
  // 玩法弹窗
  showHelpModal: boolean;
  onCloseHelp: () => void;
  // 签到奖励/公告/配方弹窗
  showCheckinReward: string | null;
  checkinStreak: number;
  announcements: Announcement[];
  showAnnouncements: boolean;
  showSavedRecipes: boolean;
  savedRecipes: Array<{colors: string[]; result: string; rgb: string; date: string}>;
  onCheckinRewardClose: () => void;
  onAnnouncementDismiss: (id: string) => void;
  onAnnouncementClose: () => void;
  onSavedRecipesClose: () => void;
  onGoToMixer: () => void;
  // 更新日志
  showChangelog: boolean;
  onCloseChangelog: () => void;
  // 回放查看
  showViewReplay: boolean;
  viewReplayData: ReplayData | null;
  onGoToReplayLevel: () => void;
  onCloseViewReplay: () => void;
}

export function HomeDialogs({
  showResumeDialog,
  autosaveData,
  onResume,
  onDiscardAutosave,
  onCloseResume,
  showTutorial,
  onTutorialClose,
  showShareToast,
  newAchievements,
  onDismissAchievement,
  comboCelebration,
  onCloseComboCelebration,
  showPWAInstall,
  onClosePWAInstall,
  showHelpModal,
  onCloseHelp,
  showCheckinReward,
  checkinStreak,
  announcements,
  showAnnouncements,
  showSavedRecipes,
  savedRecipes,
  onCheckinRewardClose,
  onAnnouncementDismiss,
  onAnnouncementClose,
  onSavedRecipesClose,
  onGoToMixer,
  showChangelog,
  onCloseChangelog,
  showViewReplay,
  viewReplayData,
  onGoToReplayLevel,
  onCloseViewReplay,
}: HomeDialogsProps) {
  return (
    <>
      {/* 自动存档恢复对话框 */}
      {showResumeDialog && autosaveData && (
        <div className="tutorial-overlay" onClick={onCloseResume}>
          <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
            <div className="tutorial-emoji">💾</div>
            <h2>发现未完成的游戏</h2>
            <p className="modal-body-text">
              {autosaveData.mode === 'endless'
                ? `无尽模式第 ${(autosaveData.endlessScore ?? 0) + 1} 关已走 ${autosaveData.moves} 步`
                : autosaveData.mode === 'timed'
                ? `限时挑战已走 ${autosaveData.moves} 步`
                : autosaveData.mode === 'daily'
                ? `每日挑战已走 ${autosaveData.moves} 步`
                : autosaveData.mode === 'weekly'
                ? `周挑战已走 ${autosaveData.moves} 步`
                : `第 ${autosaveData.level} 关已走 ${autosaveData.moves} 步`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-large" onClick={onResume}>▶ 继续游戏</button>
              <button className="btn btn-secondary" onClick={onDiscardAutosave}>放弃存档</button>
            </div>
          </div>
        </div>
      )}

      {/* 新手引导 */}
      {showTutorial && (
        <div className="tutorial-overlay" onClick={onTutorialClose}>
          <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
            <div className="tutorial-emoji">🎨</div>
            <h2>欢迎来到色彩排序!</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-icon">1️⃣</span>
                <span>点击一个有颜色的试管选中它</span>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">2️⃣</span>
                <span>再点击一个试管,颜色会倒过去</span>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">3️⃣</span>
                <span>只能倒入空管或顶部颜色相同的试管</span>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">4️⃣</span>
                <span>把每种颜色归到一个试管就赢了!</span>
              </div>
            </div>
            <button className="btn btn-primary btn-large" onClick={onTutorialClose}>
              知道了,开始玩!
            </button>
          </div>
        </div>
      )}

      {/* 分享成功提示 */}
      {showShareToast && (
        <div className="share-toast">📋 战绩已复制到剪贴板!</div>
      )}

      {/* 成就解锁通知 — 根据稀有度显示不同边框颜色和标签 */}
      {newAchievements.length > 0 && (() => {
        const ach = newAchievements[0];
        const rarityLabels: Record<string, { label: string; color: string }> = {
          common: { label: '', color: '#4CAF50' },
          rare: { label: '⭐ 稀有', color: '#2196F3' },
          epic: { label: '⭐⭐ 史诗', color: '#9C27B0' },
          legendary: { label: '⭐⭐⭐ 传说', color: '#FF9800' },
        };
        const rarity = rarityLabels[ach.rarity || 'common'] || rarityLabels.common;
        return (
          <div className="achievement-notification" onClick={onDismissAchievement}>
            <div className="achievement-notif-card" style={{ borderColor: rarity.color }}>
              <div className="achievement-notif-icon">{ach.icon}</div>
              <div className="achievement-notif-text">
                <div className="achievement-notif-title">🏆 成就解锁!</div>
                <div className="achievement-notif-name">{ach.name}</div>
                <div className="achievement-notif-desc">{ach.description}</div>
                {rarity.label && <div className="achievement-notif-rarity" style={{ color: rarity.color }}>{rarity.label}</div>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 连击里程碑庆祝弹窗 */}
      {comboCelebration && (
        <div className="combo-celebration-overlay" onClick={onCloseComboCelebration}>
          <div className="combo-celebration-card" style={{ borderColor: comboCelebration.color }}>
            <div className="combo-celebration-emoji" style={{ animation: 'comboPop 0.6s ease-out' }}>{comboCelebration.emoji}</div>
            <div className="combo-celebration-title" style={{ color: comboCelebration.color }}>{comboCelebration.title}</div>
            <div className="combo-celebration-desc">{comboCelebration.desc}</div>
            <button className="btn btn-primary" onClick={onCloseComboCelebration}>继续</button>
          </div>
        </div>
      )}

      {/* PWA 安装提示弹窗 */}
      {showPWAInstall && (
        <div className="pwa-install-banner">
          <div className="pwa-install-content">
            <span className="pwa-install-icon">📱</span>
            <div className="pwa-install-text">
              <div className="pwa-install-title">安装到桌面</div>
              <div className="pwa-install-desc">离线也能玩,更流畅</div>
            </div>
            <button className="pwa-install-btn" onClick={async () => {
              const ok = await triggerPWAInstall();
              onClosePWAInstall();
              if (!ok) isPWAInstallDismissed(); // 关闭后标记已忽略
            }}>安装</button>
            <button className="pwa-install-close" onClick={onClosePWAInstall}>✕</button>
          </div>
        </div>
      )}

      {/* 首页玩法弹窗 */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={onCloseHelp}>
          <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>📖 玩法说明</h2>
            <div className="help-modal-step">
              <span className="step-icon">1️⃣</span>
              <span>点击一个有颜色的试管选中它</span>
            </div>
            <div className="help-modal-step">
              <span className="step-icon">2️⃣</span>
              <span>再点击一个试管,颜色会倒过去</span>
            </div>
            <div className="help-modal-step">
              <span className="step-icon">3️⃣</span>
              <span>只能倒入空管或顶部颜色相同的试管</span>
            </div>
            <div className="help-modal-step">
              <span className="step-icon">4️⃣</span>
              <span>把每种颜色归到一个试管就赢了!</span>
            </div>
            <div className="help-modal-step">
              <span className="step-icon">⭐</span>
              <span>关卡越后星级越高,追求三星通关!</span>
            </div>
            <button className="btn btn-primary help-modal-close" onClick={onCloseHelp}>
              知道了
            </button>
          </div>
        </div>
      )}

      {/* 首页弹窗集合（签到奖励、公告、配方查看）— 懒加载以降低首屏 bundle */}
      {(showCheckinReward || (showAnnouncements && announcements.length > 0) || showSavedRecipes) && (
        <Suspense fallback={null}>
          <HomeModals
            checkinReward={showCheckinReward}
            checkinStreak={checkinStreak}
            announcements={announcements}
            savedRecipes={savedRecipes}
            showCheckinReward={!!showCheckinReward}
            showAnnouncements={showAnnouncements}
            showSavedRecipes={showSavedRecipes}
            onCheckinRewardClose={onCheckinRewardClose}
            onAnnouncementDismiss={onAnnouncementDismiss}
            onAnnouncementClose={onAnnouncementClose}
            onSavedRecipesClose={onSavedRecipesClose}
            onGoToMixer={onGoToMixer}
          />
        </Suspense>
      )}

      {/* 更新日志弹窗 - 懒加载以降低首屏 bundle */}
      {showChangelog && (
        <Suspense fallback={<div className="tutorial-overlay"><div className="tutorial-card"><p style={{padding:'40px',textAlign:'center'}}>加载中...</p></div></div>}>
          <ChangelogModal onClose={onCloseChangelog} />
        </Suspense>
      )}

      {/* 回放查看弹窗(从分享链接打开) */}
      {showViewReplay && viewReplayData && (
        <div className="tutorial-overlay" onClick={onCloseViewReplay}>
          <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
            <div className="tutorial-emoji">🎥</div>
            <h2>查看回放</h2>
            <p className="replay-info-text">
              {viewReplayData.level === -1 ? "每日挑战" : viewReplayData.level === -2 ? "无尽模式" : viewReplayData.level === -3 ? "限时模式" : `第 ${viewReplayData.level} 关`}
              {' 步数 '}{viewReplayData.stepsUsed} 步 · {'⭐'.repeat(viewReplayData.starRating)}
            </p>
            <p className="replay-actions-hint">点击下方按钮在游戏中查看完整回放</p>
            <div className="replay-view-actions">
              <button className="btn btn-primary" onClick={onGoToReplayLevel}>🎯 前往关卡</button>
              <button className="btn btn-secondary" onClick={onCloseViewReplay}>关闭</button>
            </div>
            <p className="replay-detail-moves">
              操作序列:{viewReplayData.moves.map(m => `${m.from + 1}→${m.to + 1}`).join(', ')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
