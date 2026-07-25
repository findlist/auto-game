// 回放面板组件
// 从 GameBoard 拆分：负责操作回放弹窗的渲染与交互
// 包含单步播放、自动播放、重新开始等控制
import React, { useRef, useState, useCallback } from 'react';
import { Tube, COLORS } from '../game/types';
import { cloneTubes } from '../game/levelGenerator';
import { pour } from '../game/levelGenerator';
import { SoundEngine } from '../game/soundEngine';

interface ReplayPanelProps {
  /** 操作历史记录 */
  moveHistory: Array<{ from: number; to: number }>;
  /** 初始试管状态（关卡开始时的 tubes） */
  initialTubes: Tube[];
  /** 关闭回放弹窗的回调 */
  onClose: () => void;
}

export const ReplayPanel: React.FC<ReplayPanelProps> = ({ moveHistory, initialTubes, onClose }) => {
  const [showReplay, setShowReplay] = useState(true);
  const [replayStep, setReplayStep] = useState(0);
  const [replayTubes, setReplayTubes] = useState<Tube[]>([]);
  // 回放当前步数 ref：用于自动播放循环驱动，避免依赖 setState updater 的同步性
  const replayStepRef = useRef(0);
  const replayTimerRef = useRef<number | null>(null);

  // 关闭弹窗并清理定时器
  const handleClose = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    setShowReplay(false);
    onClose();
  }, [onClose]);

  // 重新开始回放
  const handleRestart = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    replayStepRef.current = 0;
    setReplayStep(0);
    setReplayTubes(cloneTubes(initialTubes));
  }, [initialTubes]);

  // 单步播放
  const handleStep = useCallback(() => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    const step = replayStepRef.current;
    if (step >= moveHistory.length) return;
    const move = moveHistory[step];
    const currentTubes = step === 0 ? cloneTubes(initialTubes) : cloneTubes(replayTubes);
    const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
    currentTubes[move.from] = from;
    currentTubes[move.to] = to;
    setReplayTubes(currentTubes);
    replayStepRef.current = step + 1;
    setReplayStep(step + 1);
    SoundEngine.pour();
  }, [moveHistory, initialTubes, replayTubes]);

  // 自动播放
  const handleAutoPlay = useCallback(() => {
    // 已在播放则暂停
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
      return;
    }
    // 修复：原代码在 setReplayStep 的 updater 里放副作用，
    // React StrictMode 下 updater 会被调用两次导致音效播放两次
    // 现用 replayStepRef 驱动循环，副作用完全在 updater 外部
    const stepNext = () => {
      const step = replayStepRef.current;
      if (step >= moveHistory.length) {
        if (replayTimerRef.current) {
          clearTimeout(replayTimerRef.current);
          replayTimerRef.current = null;
        }
        return;
      }
      const move = moveHistory[step];
      setReplayTubes(prevTubes => {
        const currentTubes = step === 0 ? cloneTubes(initialTubes) : cloneTubes(prevTubes);
        const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
        currentTubes[move.from] = from;
        currentTubes[move.to] = to;
        return currentTubes;
      });
      replayStepRef.current = step + 1;
      setReplayStep(step + 1);
      SoundEngine.pour();
      replayTimerRef.current = setTimeout(stepNext, 500) as unknown as number;
    };
    stepNext();
  }, [moveHistory, initialTubes]);

  // 组件卸载时清理定时器
  React.useEffect(() => {
    return () => {
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    };
  }, []);

  if (!showReplay) return null;

  return (
    <div className="replay-overlay" onClick={handleClose}>
      <div className="replay-card" onClick={(e) => e.stopPropagation()}>
        <div className="replay-header">
          <h3>🎬 操作回放</h3>
          <span className="replay-progress">第 {replayStep} / {moveHistory.length} 步</span>
        </div>
        <div className="replay-tubes" role="group" aria-label="回放试管列表">
          {(replayStep === 0 ? initialTubes : replayTubes).map((tube, i) => {
            const lastMove = replayStep > 0 ? moveHistory[replayStep - 1] : null;
            const isFrom = lastMove && (lastMove.from === i);
            const isTo = lastMove && (lastMove.to === i);
            return (
              <div key={i} className={`tube-container replay-tube ${isFrom ? 'replay-from' : ''} ${isTo ? 'replay-to' : ''}`}>
                <div className="tube">
                  <div className="tube-inner">
                    {tube.layers.map((layer, j) => {
                      const layerHeight = 100 / tube.capacity;
                      return (
                        <div
                          key={j}
                          className="color-layer"
                          style={{
                            height: `${layerHeight}%`,
                            backgroundColor: COLORS[layer.color] || layer.color,
                            bottom: `${j * layerHeight}%`,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="tube-mouth" />
                </div>
                <div className="tube-index">{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="replay-controls">
          <button className="btn btn-secondary" onClick={handleRestart}>⏮ 重新开始</button>
          <button className="btn btn-primary" onClick={handleStep}>▶ 单步</button>
          <button className="btn btn-primary" onClick={handleAutoPlay}>
            {replayTimerRef.current ? '⏸ 暂停' : '⏩ 自动播放'}
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};
