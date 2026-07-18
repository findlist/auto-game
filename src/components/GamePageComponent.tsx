import { GameBoard } from './GameBoard';
import { GameSettings } from '../game/settings';
import { Tube } from '../game/types';
import { Achievement } from '../game/achievements';

// 游戏页面难度标签
const getDifficultyLabel = (lvl: number) => {
  if (lvl <= 3) return '入门';
  if (lvl <= 6) return '初级';
  if (lvl <= 12) return '普通';
  if (lvl <= 20) return '中等';
  if (lvl <= 30) return '困难';
  if (lvl <= 50) return '挑战';
  if (lvl <= 70) return '高级';
  if (lvl <= 90) return '专家';
  return '大师';
};

// 难度标签对应颜色
const difficultyColors: Record<string, string> = {
  '入门': '#4ECDC4', '简单': '#4ECDC4', '普通': '#667eea',
  '中等': '#667eea', '困难': '#FFA07A', '挑战': '#FFA07A',
  '高级': '#FF6B6B', '专家': '#C589E8', '大师': '#333',
};

interface GamePageComponentProps {
  currentLevel: number;
  endlessScore: number;
  timedScore: number;
  timedDuration: number;
  bestScores: Record<number, number>;
  comboStreak: number;
  isDailyMode: boolean;
  isEndlessMode: boolean;
  isTimedMode: boolean;
  isWeeklyMode: boolean;
  hintPair: [number, number] | null;
  hintItems: number;
  newAchievements: Achievement[];
  showHelpModal: boolean;
  showShareToast: boolean;
  showReplayVideoModal: boolean;
  replayVideoUrl: string;
  replayThumbnail: string;
  generatingVideo: boolean;
  currentTubesRef: React.MutableRefObject<Tube[] | null>;
  onWin: (winMoves: number, minSteps: number, stars: number, playTimeSec: number) => void;
  onMove: (m: number) => void;
  onReset: () => void;
  clearHint: () => void;
  onNextLevel: () => void;
  onPrevLevel: () => void;
  onGoHome: () => void;
  onGoHomeWithConfirm: () => void;
  onShare: (moves: number, level: number) => void;
  onReplayShare: (moveHistory: Array<{ from: number; to: number }>, level: number, stars: number, stepsUsed: number) => void;
  onExportVideo: (moveHistory: Array<{ from: number; to: number }>, levelData: { tubes: Tube[]; tubeCapacity: number }, level: number, stars: number, stepsUsed: number) => void;
  onHint: () => void;
  onDeadlockRecover: () => void;
  onAutoSave: (level: number, mode: string, moves: number, isWon: boolean, extra?: Record<string, number>) => void;
  setShowHelpModal: (v: boolean) => void;
  dismissAchievement: () => void;
  setShowReplayVideoModal: (v: boolean) => void;
  setReplayVideoUrl: (v: string) => void;
}

/**
 * 游戏页面组件 — 从 App.tsx 提取，负责游戏页面的完整渲染
 * 包含游戏头部、关卡信息条、GameBoard、广告位、帮助弹窗、成就通知等
 */
export function GamePageComponent(props: GamePageComponentProps) {
  const {
    currentLevel, endlessScore, timedScore, timedDuration, bestScores,
    comboStreak, isDailyMode, isEndlessMode, isTimedMode, isWeeklyMode,
    hintPair, hintItems, newAchievements, showHelpModal, showShareToast,
    showReplayVideoModal, replayVideoUrl, replayThumbnail, generatingVideo,
    currentTubesRef, onWin, onMove, onReset, clearHint, onNextLevel, onPrevLevel,
    onGoHome, onGoHomeWithConfirm, onShare, onReplayShare, onExportVideo,
    onHint, onDeadlockRecover, onAutoSave,
    setShowHelpModal, dismissAchievement, setShowReplayVideoModal, setReplayVideoUrl,
  } = props;

  const diffLabel = getDifficultyLabel(currentLevel);
  const diffColor = difficultyColors[diffLabel] || '#667eea';

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onGoHomeWithConfirm}>← 返回</button>
        <h1 className="game-title">{isDailyMode ? "📅 每日挑战" : isEndlessMode ? `∞ 无尽模式 (${endlessScore})` : isTimedMode ? `⏱ 限时挑战 (${timedScore})` : isWeeklyMode ? "🏆 周挑战" : "🎨 色彩排序"}</h1>
        <button className="btn-hint" onClick={onHint}>💡 提示</button>
      </header>
      {!isDailyMode && !isEndlessMode && !isTimedMode && !isWeeklyMode && (
        <div className="level-info-bar">
          <span className="level-info-item">第 {currentLevel} 关</span>
          <span className="level-info-divider">|</span>
          <span className="level-info-item" style={{ color: diffColor }}>🎯 {diffLabel}</span>
          {bestScores[currentLevel] && (
            <>
              <span className="level-info-divider">|</span>
              <span className="level-info-item">🏆 最佳: {bestScores[currentLevel]}步</span>
            </>
          )}
          {comboStreak >= 2 && (
            <>
              <span className="level-info-divider">|</span>
              <span className="level-info-item combo-badge">🔥 {comboStreak}连击</span>
            </>
          )}
        </div>
      )}
      <main className="game-main">
        <GameBoard
          level={currentLevel}
          endlessScore={endlessScore}
          timedScore={timedScore}
          timedDuration={timedDuration}
          bestScore={bestScores[currentLevel] || 0}
          onWin={(winMoves: number, minSteps: number, stars: number, playTimeSec: number) => onWin(winMoves, minSteps, stars, playTimeSec)}
          onMove={(m: number) => { onMove(m); onAutoSave(currentLevel, isDailyMode ? 'daily' : isEndlessMode ? 'endless' : isTimedMode ? 'timed' : isWeeklyMode ? 'weekly' : 'normal', m, false, isEndlessMode ? { endlessScore } : isTimedMode ? { timedScore } : undefined); }}
          onReset={() => onReset()}
          hintPair={hintPair}
          clearHint={() => clearHint()}
          onNextLevel={onNextLevel}
          onPrevLevel={onPrevLevel}
          onGoHome={onGoHome}
          onShare={onShare}
          onReplayShare={onReplayShare}
          onExportVideo={onExportVideo}
          tubesRef={currentTubesRef}
          onDeadlockRecover={onDeadlockRecover}
          onHint={onHint}
          hintItems={hintItems}
          colorBlindMode={GameSettings.getColorBlindMode()}
          colorLabels={GameSettings.getColorLabels()}
        />
        {/* 广告位预留 - 游戏页广告位 */}
        <div className="ad-slot ad-game">
          <span className="ad-label">广告位</span>
        </div>
      </main>

      {/* 游戏内浮动帮助按钮 */}
      <button className="help-fab" onClick={() => setShowHelpModal(true)} aria-label="查看玩法说明">❓</button>

      {/* 玩法说明弹窗 */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
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
              <span className="step-icon">⌨️</span>
              <span>快捷键:数字键选管 · Z撤销 · R重置 · H提示 · PageDown下一关</span>
            </div>
            <button className="btn btn-primary help-modal-close" onClick={() => setShowHelpModal(false)}>
              知道了
            </button>
          </div>
        </div>
      )}

      {/* 分享成功提示 */}
      {showShareToast && (
        <div className="share-toast">📋 战绩已复制到剪贴板!</div>
      )}

      {/* 成就解锁通知 */}
      {newAchievements.length > 0 && (
        <div className="achievement-notification" onClick={dismissAchievement}>
          <div className="achievement-notif-card">
            <div className="achievement-notif-icon">{newAchievements[0].icon}</div>
            <div className="achievement-notif-text">
              <div className="achievement-notif-title">🏆 成就解锁!</div>
              <div className="achievement-notif-name">{newAchievements[0].name}</div>
              <div className="achievement-notif-desc">{newAchievements[0].description}</div>
            </div>
          </div>
        </div>
      )}

      {/* 回放视频导出弹窗 */}
      {showReplayVideoModal && (
        <div className="share-image-overlay" onClick={() => { setShowReplayVideoModal(false); if (replayVideoUrl) URL.revokeObjectURL(replayVideoUrl); setReplayVideoUrl(''); }}>
          <div className="share-image-card" onClick={(e) => e.stopPropagation()}>
            <h3>{generatingVideo ? '🎥 正在生成回放视频...' : '🎬 回放视频已生成'}</h3>
            {generatingVideo && (
              <div className="loading-indicator">
                <div className="loading-spinner" />
                <p>请稍候,正在逐帧渲染操作回放...</p>
              </div>
            )}
            {!generatingVideo && replayVideoUrl && (
              <video src={replayVideoUrl} controls className="replay-video-preview" />
            )}
            {!generatingVideo && !replayVideoUrl && replayThumbnail && (
              <img src={replayThumbnail} alt="回放缩略图" className="share-image-preview" />
            )}
            {!generatingVideo && replayVideoUrl && (
              <div className="share-image-actions">
                <a href={replayVideoUrl} download="color-sort-replay.webm" className="btn btn-primary">💾 保存视频</a>
                <button className="btn btn-secondary" onClick={async () => {
                  try {
                    const blob = await fetch(replayVideoUrl).then(r => r.blob());
                    if (navigator.share) {
                      const file = new File([blob], 'color-sort-replay.webm', { type: 'video/webm' });
                      await navigator.share({ files: [file], title: '色彩排序回放', text: '看看我的操作回放!' });
                    } else {
                      await navigator.clipboard.writeText('回放视频已生成,请点击保存视频下载');
                      alert('请点击保存视频下载回放');
                    }
                  } catch (e) { /* 忽略 */ }
                }}>📤 分享视频</button>
                <button className="btn btn-secondary" onClick={() => { setShowReplayVideoModal(false); URL.revokeObjectURL(replayVideoUrl); setReplayVideoUrl(''); }}>关闭</button>
              </div>
            )}
            {!generatingVideo && !replayVideoUrl && replayThumbnail && (
              <p className="video-fallback-hint">⚠️ 当前浏览器不支持视频录制,已生成回放缩略图</p>
            )}
            {!generatingVideo && !replayVideoUrl && replayThumbnail && (
              <div className="share-image-actions">
                <a href={replayThumbnail} download="color-sort-replay.png" className="btn btn-primary">💾 保存图片</a>
                <button className="btn btn-secondary" onClick={() => setShowReplayVideoModal(false)}>关闭</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
