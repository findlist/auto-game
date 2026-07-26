import React from 'react';
import { generateShareImage } from '../game/shareImage';
import { Tube, Level } from '../game/types';

// 胜利遮罩组件：提取自 GameBoard，包含胜利结算和时间到结算两个遮罩
// 设计原因：胜利/时间到遮罩逻辑独立，拆分后 GameBoard 只负责游戏核心交互

interface WinOverlayProps {
  isWon: boolean;
  isTimeUp: boolean;
  level: number;
  moves: number;
  starRating: number;
  bestScore: number;
  timedScore: number;
  endlessScore: number;
  levelData: Level;
  moveHistory: Array<{ from: number; to: number }>;
  onShowReplay: () => void;
  onReplayShare?: (moveHistory: Array<{ from: number; to: number }>, level: number, stars: number, stepsUsed: number) => void;
  onExportVideo?: (moveHistory: Array<{ from: number; to: number }>, levelData: { tubes: Tube[]; tubeCapacity: number }, level: number, stars: number, stepsUsed: number) => void;
  onShare: (moves: number, level: number) => void;
  onReset: () => void;
  onNextLevel: () => void;
  onGoHome: () => void;
  onShowShareImage: (url: string) => void;
}

export const WinOverlay: React.FC<WinOverlayProps> = ({
  isWon,
  isTimeUp,
  level,
  moves,
  starRating,
  bestScore,
  timedScore,
  endlessScore,
  levelData,
  moveHistory,
  onShowReplay,
  onReplayShare,
  onExportVideo,
  onShare,
  onReset,
  onNextLevel,
  onGoHome,
  onShowShareImage,
}) => {
  if (!isWon && !isTimeUp) return null;

  // 胜利遮罩
  if (isWon) {
    return (
      <div className="win-overlay">
        <div className={`win-card ${starRating === 3 ? 'three-stars-celebration' : ''}`}>
          <div className="win-emoji">🎉</div>
          <h2>{level === -3 ? `通过第 ${timedScore + 1} 关！` : level === -2 ? `通过第 ${endlessScore + 1} 关！` : '恭喜过关！'}</h2>
          <div className="star-rating">
            {[1, 2, 3].map(s => (
              <span key={s} className={`star ${s <= starRating ? 'star-filled star-pop' : 'star-empty'}`} style={{ animationDelay: `${0.5 + s * 0.2}s` }}>⭐</span>
            ))}
          </div>
          <p>用时 {moves} 步完成{(levelData.minSteps ?? -1) > 0 && ` · 最优 ${levelData.minSteps} 步`}</p>
          {/* 步数效率可视化：直观展示玩家步数与最优步数的差距 */}
          {(levelData.minSteps ?? -1) > 0 && (() => {
            const min = levelData.minSteps ?? 1;
            const ratio = Math.min(moves / min, 2.5);
            const pct = Math.min((ratio / 2.5) * 100, 100);
            const isPerfect = ratio <= 1.0;
            const isGood = ratio <= 1.5;
            const barColor = isPerfect ? '#4ECDC4' : isGood ? '#667eea' : '#FF9800';
            const labelText = isPerfect ? '✨ 完美通关！' : isGood ? '👍 表现良好' : '💪 还有提升空间';
            return (
              <div className="win-efficiency-bar">
                <div className="win-efficiency-label">{labelText}</div>
                <div className="win-efficiency-track">
                  <div className="win-efficiency-fill" style={{ width: `${pct}%`, background: barColor }} />
                  <div className="win-efficiency-marker" style={{ left: `${(1 / 2.5) * 100}%` }} title={`最优: ${min}步`} />
                </div>
                <div className="win-efficiency-scale">
                  <span>0</span>
                  <span>最优 {min}</span>
                  <span>{Math.round(min * 2.5)}</span>
                </div>
              </div>
            );
          })()}
          {bestScore > 0 && moves < bestScore && (
            <p className="new-record-badge">🎉 新纪录！上次最佳 {bestScore} 步</p>
          )}
          {bestScore > 0 && moves === bestScore && (
            <p className="new-record-badge">🎯 平了最佳记录！</p>
          )}
          {bestScore > 0 && moves > bestScore && (
            <p className="prev-best-badge">📊 最佳记录: {bestScore} 步</p>
          )}
          <div className="win-actions">
            <button className="btn btn-primary" onClick={onShowReplay}>🎬 查看回放</button>
            {onReplayShare && (
              <button className="btn btn-primary" onClick={() => {
                onReplayShare(moveHistory, level, starRating, moves);
              }}>🔗 分享回放</button>
            )}
            {onExportVideo && (
              <button className="btn btn-primary" onClick={() => {
                onExportVideo(moveHistory, { tubes: levelData.tubes, tubeCapacity: levelData.tubeCapacity }, level, starRating, moves);
              }}>🎥 导出视频</button>
            )}
            <button className="btn btn-primary" onClick={() => {
              const url = generateShareImage({
                level,
                moves: moves,
                minSteps: levelData.minSteps ?? -1,
                stars: starRating,
                difficulty: levelData.difficulty,
                mode: level === -1 ? 'daily' : level === -2 ? 'endless' : level === -3 ? 'timed' : 'normal',
                endlessScore: endlessScore,
                timedScore: timedScore,
              });
              onShowShareImage(url);
            }}>🖼️ 生成战绩图</button>
            <button className="btn btn-primary" onClick={() => onShare(moves, level)}>📤 分享战绩</button>
            {level > 0 && (
              <button className="btn btn-secondary" onClick={onReset}>🔄 再来一局</button>
            )}
            <button className="btn btn-primary" onClick={onNextLevel}>{level === -3 ? '➡️ 继续挑战' : level === -2 ? '➡️ 继续挑战' : '➡️ 下一关'}</button>
            <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回首页</button>
          </div>
        </div>
      </div>
    );
  }

  // 时间到遮罩
  return (
    <div className="win-overlay">
      <div className="win-card">
        <div className="win-emoji">⏰</div>
        <h2>时间到！</h2>
        <p>限时模式通过了 {timedScore} 关</p>
        <div className="win-actions">
          <button className="btn btn-primary" onClick={() => {
            const url = generateShareImage({
              level,
              moves: timedScore,
              minSteps: -1,
              stars: 0,
              difficulty: '限时模式',
              mode: 'timed',
              timedScore: timedScore,
            });
            onShowShareImage(url);
          }}>🖼️ 生成战绩图</button>
          <button className="btn btn-primary" onClick={() => onShare(timedScore, level)}>📤 分享战绩</button>
          <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回首页</button>
        </div>
      </div>
    </div>
  );
};
