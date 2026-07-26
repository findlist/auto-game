import React from 'react';

// 游戏遮罩组件：提取自 GameBoard，包含死局遮罩和暂停遮罩
// 设计原因：死局/暂停遮罩与核心游戏逻辑无关，拆分后 GameBoard 更聚焦于游戏交互

interface GameOverlaysProps {
  isDeadlock: boolean;
  isWon: boolean;
  isPaused: boolean;
  isTimeUp: boolean;
  historyLength: number;
  hadDeadlock: boolean;
  onUndo: () => void;
  onReset: () => void;
  onDeadlockRecover?: () => void;
  onTogglePause: () => void;
  onGoHome: () => void;
}

export const GameOverlays: React.FC<GameOverlaysProps> = ({
  isDeadlock,
  isWon,
  isPaused,
  isTimeUp,
  historyLength,
  hadDeadlock,
  onUndo,
  onReset,
  onDeadlockRecover,
  onTogglePause,
  onGoHome,
}) => {
  return (
    <>
      {/* 死局遮罩：无可行操作时提示玩家撤销或重置 */}
      {isDeadlock && !isWon && (
        <div className="deadlock-overlay">
          <div className="deadlock-card">
            <div className="deadlock-emoji">🤔</div>
            <h2>没有可行操作了</h2>
            <p>试试撤销或重新开始</p>
            <div className="win-actions">
              <button className="btn btn-primary" onClick={() => { if (hadDeadlock && onDeadlockRecover) onDeadlockRecover(); onUndo(); }} disabled={historyLength === 0}>↩️ 撤销上一步</button>
              <button className="btn btn-secondary" onClick={onReset}>🔄 重新开始</button>
            </div>
          </div>
        </div>
      )}

      {/* 暂停遮罩：点击背景可恢复游戏 */}
      {isPaused && !isWon && !isTimeUp && (
        <div className="pause-overlay" onClick={onTogglePause}>
          <div className="pause-card" onClick={(e) => e.stopPropagation()}>
            <div className="pause-emoji">⏸️</div>
            <h2>游戏已暂停</h2>
            <p>计时已停止，放松一下吧~</p>
            <div className="win-actions">
              <button className="btn btn-primary" onClick={onTogglePause}>▶️ 继续游戏</button>
              <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回首页</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
