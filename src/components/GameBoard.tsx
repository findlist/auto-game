import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tube, Level, COLORS } from '../game/types';
import { generateLevel, canPour, pour, checkWin, checkDeadlock, cloneTubes, generateEndlessLevel, generateTimedLevel } from '../game/levelGenerator';
import { generateDailyChallenge } from '../game/dailyChallenge';
import { SoundEngine } from '../game/soundEngine';
import { TubeView } from './TubeView';
import { ParticleEffect } from './ParticleEffect';
import { GameSettings } from '../game/settings';
import { generateShareImage, dataURLToBlob } from '../game/shareImage';
import { StatsTracker } from '../game/statsTracker';

interface GameBoardProps {
  level: number;
  endlessScore?: number;
  timedScore?: number;
  timedDuration?: number;
  bestScore?: number; // 当前关卡历史最佳步数
  onWin: (moves: number, minSteps: number, stars: number, playTimeSec: number) => void;
  onMove: (moves: number) => void;
  onReset: () => void;
  hintPair: [number, number] | null;
  clearHint: () => void;
  onNextLevel: () => void;
  onPrevLevel?: () => void;
  onGoHome: () => void;
  onShare: (moves: number, level: number) => void;
  onReplayShare?: (moveHistory: Array<{ from: number; to: number }>, level: number, stars: number, stepsUsed: number) => void;
  onExportVideo?: (moveHistory: Array<{ from: number; to: number }>, levelData: { tubes: Tube[]; tubeCapacity: number }, level: number, stars: number, stepsUsed: number) => void;
  onTimeUp?: () => void;
  tubesRef: React.MutableRefObject<Tube[] | null>;
  onDeadlockRecover?: () => void;
  onHint?: () => void;
  hintItems?: number; // 提示道具数量
}

export const GameBoard: React.FC<GameBoardProps> = ({ level, endlessScore = 0, timedScore = 0, timedDuration = 120, bestScore = 0, onWin, onMove, onReset, hintPair, clearHint, onNextLevel, onPrevLevel, onGoHome, onShare, onReplayShare, onExportVideo, onTimeUp, tubesRef, onDeadlockRecover, onHint, hintItems = 0 }) => {
  const [levelData, setLevelData] = useState<Level>(() =>
    level === -1 ? generateDailyChallenge() : level === -2 ? generateEndlessLevel(endlessScore) : level === -3 ? generateTimedLevel(timedScore) : generateLevel(level)
  );
  const [tubes, setTubes] = useState<Tube[]>(levelData.tubes);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [hadDeadlock, setHadDeadlock] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timedDuration);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [starRating, setStarRating] = useState(0); // 星级评价：0-3星
  const [showShareImage, setShowShareImage] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState('');
  const [pouringTo, setPouringTo] = useState<number | null>(null); // 倾倒动画目标试管
  const [movesPulse, setMovesPulse] = useState(false); // 步数变化脉冲
  const [elapsedTime, setElapsedTime] = useState(0); // 已用时间（秒）
  const gameStartTime = useRef<number>(Date.now()); // 游戏开始时间戳
  const shareImageRef = useRef<HTMLAnchorElement | null>(null);

  // 回放系统：记录操作序列
  const [moveHistory, setMoveHistory] = useState<Array<{ from: number; to: number }>>([]);
  const [showReplay, setShowReplay] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [replayTubes, setReplayTubes] = useState<Tube[]>([]);
  const replayTimerRef = useRef<number | null>(null);
  // 连击系统
  const comboCountRef = useRef(0);
  const lastPourTimeRef = useRef(0);

  // 帮助弹窗状态
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 同步当前 tubes 到父组件的 ref（用于提示功能）
  tubesRef.current = tubes;

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isTimeUp) return;
      // 数字键 1-9 选择试管
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= tubes.length) {
        e.preventDefault();
        handleTubeClick(num - 1);
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          handleUndo();
          break;
        case 'r':
          e.preventDefault();
          handleReset();
          break;
        case 'h':
          e.preventDefault();
          if (onHint) onHint();
          break;
      }
      // Page Up/Down 上一关/下一关（仅在已通关时生效）
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        if (e.key === 'PageDown' && onNextLevel && isWon) {
          onNextLevel();
        } else if (e.key === 'PageUp' && onPrevLevel && isWon) {
          onPrevLevel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tubes, isWon, isTimeUp, selectedTube, history, onHint]);

  // 限时模式倒计时
  useEffect(() => {
    if (level !== -3 || isWon || isTimeUp) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      SoundEngine.timeUp();
      if (onTimeUp) onTimeUp();
      return;
    }
    // 最后10秒每秒滴答声
    if (timeLeft <= 10 && timeLeft > 0) {
      SoundEngine.tick();
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [level, timeLeft, isWon, isTimeUp, onTimeUp]);

  // 关卡变化时重置
  useEffect(() => {
    const newLevel = level === -1 ? generateDailyChallenge() : level === -2 ? generateEndlessLevel(endlessScore) : level === -3 ? generateTimedLevel(timedScore) : generateLevel(level);
    setLevelData(newLevel);
    setTubes(newLevel.tubes);
    setSelectedTube(null);
    setMoves(0);
    setIsWon(false);
    setHistory([]);
    setMoveHistory([]);
    setHadDeadlock(false);
    setElapsedTime(0);
    gameStartTime.current = Date.now(); // 重置计时器
  }, [level, endlessScore, timedScore]);

  // 实时计时器（非限时模式也显示已用时间）
  // 使用 requestAnimationFrame 替代 setInterval，减少不必要的重渲染
  // 仅在秒数变化时更新状态
  useEffect(() => {
    if (isWon || isTimeUp) return;
    let rafId: number;
    let lastSecond = -1;
    const tick = () => {
      const sec = Math.floor((Date.now() - gameStartTime.current) / 1000);
      if (sec !== lastSecond) {
        lastSecond = sec;
        setElapsedTime(sec);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isWon, isTimeUp, level]);

  const handleTubeClick = useCallback((index: number) => {
    if (isWon) return;
    SoundEngine.resume();

    if (selectedTube === null) {
      // 选中试管
      if (tubes[index].layers.length === 0) return;
      setSelectedTube(index);
      SoundEngine.select();
      return;
    }

    if (selectedTube === index) {
      // 取消选中
      setSelectedTube(null);
      SoundEngine.click();
      return;
    }

    // 尝试倾倒
    const fromTube = tubes[selectedTube];
    const toTube = tubes[index];

    if (!canPour(fromTube, toTube)) {
      // 不能倒，切换选中
      SoundEngine.error();
      if (tubes[index].layers.length > 0) {
        setSelectedTube(index);
        SoundEngine.select();
      } else {
        setSelectedTube(null);
      }
      return;
    }

    // 执行倾倒
    const { from: newFrom, to: newTo } = pour(fromTube, toTube);
    const newTubes = cloneTubes(tubes);
    newTubes[selectedTube] = newFrom;
    newTubes[index] = newTo;

    // 保存历史
    setHistory(prev => [...prev, cloneTubes(tubes)]);
    setMoveHistory(prev => [...prev, { from: selectedTube, to: index }]);
    setTubes(newTubes);
    setMoves(prev => prev + 1);
    setSelectedTube(null);
    setPouringTo(index); // 触发倾倒动画
    setTimeout(() => setPouringTo(null), 300);
    // 步数脉冲动画
    setMovesPulse(true);
    setTimeout(() => setMovesPulse(false), 300);
    SoundEngine.pour();
    // 倾倒轻振动
    if (GameSettings.getVibration()) {
      navigator.vibrate?.(30);
    }
    onMove(moves + 1);

    // 连击检测：3秒内连续高效倾倒（同色合并）
    const now = Date.now();
    if (now - lastPourTimeRef.current < 3000 && fromTube.layers.length > 0 && toTube.layers.length > 0) {
      const fromTopColor = fromTube.layers[fromTube.layers.length - 1]?.color;
      const toTopColor = toTube.layers[toTube.layers.length - 1]?.color;
      if (fromTopColor === toTopColor) {
        comboCountRef.current += 1;
        if (comboCountRef.current >= 2) {
          SoundEngine.combo(comboCountRef.current);
        }
      } else {
        comboCountRef.current = 0;
      }
    } else {
      comboCountRef.current = 0;
    }
    lastPourTimeRef.current = now;

    // 接近完成检测：统计未归位的颜色组数
    const colorGroups = new Map<string, number>();
    newTubes.forEach(t => {
      if (t.layers.length === 0) return;
      const topColor = t.layers[t.layers.length - 1].color;
      // 检查是否已满且单色
      const allSame = t.layers.every(l => l.color === topColor);
      if (allSame && t.layers.length === t.capacity) return; // 已完成
      colorGroups.set(topColor, (colorGroups.get(topColor) || 0) + 1);
    });
    const remainingGroups = colorGroups.size;
    if (remainingGroups === 1 && !checkWin(newTubes)) {
      SoundEngine.nearComplete();
    }

    // 检查胜利
    if (checkWin(newTubes)) {
      setIsWon(true);
      setShowParticles(true);
      SoundEngine.win();
      // 振动反馈
      if (GameSettings.getVibration()) {
        navigator.vibrate?.([100, 50, 100, 50, 200]);
      }
      // 计算游戏时长（秒）
      const playTimeSec = Math.round((Date.now() - gameStartTime.current) / 1000);
      // 计算星级评价
      const min = levelData.minSteps ?? -1;
      let stars = 1; // 通关默认1星
      if (min > 0) {
        const ratio = (moves + 1) / min;
        if (ratio <= 1.0) stars = 3; // 达到或超过最优
        else if (ratio <= 1.5) stars = 2; // 1.5倍以内2星
        else stars = 1; // 超过1.5倍1星
      } else {
        // 无最优步数参考时，根据步数粗略评级
        const expectedMoves = levelData.tubes.length * 2;
        if ((moves + 1) <= expectedMoves) stars = 3;
        else if ((moves + 1) <= expectedMoves * 1.5) stars = 2;
        else stars = 1;
      }
      setStarRating(stars);
      // 播放星星音效
      for (let i = 0; i < stars; i++) {
        setTimeout(() => SoundEngine.star(), 600 + i * 200);
      }
      // 3秒后移除粒子
      setTimeout(() => setShowParticles(false), 3000);
      setTimeout(() => onWin(moves + 1, levelData.minSteps ?? -1, stars, playTimeSec), 500);
    }
  }, [selectedTube, tubes, isWon, moves, onWin, onMove, levelData]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isWon) return;
    SoundEngine.resume();
    const prev = history[history.length - 1];
    setTubes(prev);
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelectedTube(null);
    SoundEngine.undo();
    StatsTracker.recordUndo();
    // 如果之前处于死局状态，记录恢复
    if (hadDeadlock && onDeadlockRecover) {
      onDeadlockRecover();
    }
  }, [history, isWon, hadDeadlock, onDeadlockRecover]);

  // 重置当前关卡
  const handleReset = useCallback(() => {
    SoundEngine.resume();
    setTubes(cloneTubes(levelData.tubes));
    setSelectedTube(null);
    setMoves(0);
    setHistory([]);
    setMoveHistory([]);
    setIsWon(false);
    setHadDeadlock(false);
    gameStartTime.current = Date.now(); // 重置计时器
    SoundEngine.reset();
    onReset();
    StatsTracker.breakStreak(); // 重置关卡中断连胜
  }, [levelData, onReset]);

  // 清除提示
  useEffect(() => {
    if (hintPair) {
      const timer = setTimeout(() => clearHint(), 3000);
      return () => clearTimeout(timer);
    }
  }, [hintPair, clearHint]);

  const isDeadlock = !isWon && checkDeadlock(tubes);

  // 检测到死局时更新状态
  useEffect(() => {
    if (isDeadlock) {
      setHadDeadlock(true);
      SoundEngine.deadlock();
    }
  }, [isDeadlock]);

  return (
    <div className="game-board" role="region" aria-label="游戏区域" aria-live="polite">
      <ParticleEffect trigger={showParticles} />
      {/* 无障碍：屏幕阅读器游戏状态播报 */}
      <span className="sr-only" role="status" aria-live="assertive">
        {isWon ? `恭喜过关！用时${moves}步，${starRating}星评价` : isDeadlock ? '没有可行操作了，请撤销或重新开始' : isTimeUp ? '时间到' : ''}
      </span>
      <div className="game-info" role="status" aria-live="polite" aria-atomic="true">
        {level === -3 && (
          <span className={`timer-badge ${timeLeft <= 10 ? 'timer-danger' : ''}`}>⏱️ {timeLeft}s</span>
        )}
        {level !== -3 && (
          <span className="timer-badge timer-normal">⏱️ {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</span>
        )}
        {level === -3 ? (
          <span className="level-badge">限时模式 #{timedScore + 1}</span>
        ) : level === -2 ? (
          <span className="level-badge">无尽模式 #{endlessScore + 1}</span>
        ) : level === -1 ? (
          <span className="level-badge">每日挑战</span>
        ) : (
          <span className="level-badge">第 {level} 关</span>
        )}
        <span className="difficulty-badge">{levelData.difficulty}</span>
        <span className={`moves-badge ${movesPulse ? 'pulse' : ''}`}>步数: {moves}</span>
        {levelData.minSteps && levelData.minSteps > 0 && (
          <>
            <span className="optimal-badge">💎 最优: {levelData.minSteps}</span>
            {moves > 0 && !isWon && (() => {
              const ratio = moves / levelData.minSteps;
              let label = '✨ 完美';
              let cls = 'eff-perfect';
              if (ratio <= 1.0) { label = '✨ 完美'; cls = 'eff-perfect'; }
              else if (ratio <= 1.3) { label = '👍 良好'; cls = 'eff-good'; }
              else if (ratio <= 1.8) { label = '⚠️ 偏多'; cls = 'eff-warn'; }
              else { label = '💡 可优化'; cls = 'eff-bad'; }
              return <span className={`efficiency-badge ${cls}`}>{label}</span>;
            })()}
          </>
        )}
      </div>

      <div className="tubes-grid" role="group" aria-label="试管列表">
        {tubes.map((tube, i) => (
          <TubeView
            key={i}
            tube={tube}
            index={i}
            isSelected={selectedTube === i}
            isHinted={hintPair !== null && (hintPair[0] === i || hintPair[1] === i)}
            isPouring={pouringTo === i}
            onClick={handleTubeClick}
            onLongPress={handleUndo}
          />
        ))}
      </div>

      {isWon && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2>{level === -3 ? `通过第 ${timedScore + 1} 关！` : level === -2 ? `通过第 ${endlessScore + 1} 关！` : '恭喜过关！'}</h2>
            <div className="star-rating">
              {[1, 2, 3].map(s => (
                <span key={s} className={`star ${s <= starRating ? 'star-filled' : 'star-empty'}`}>⭐</span>
              ))}
            </div>
            <p>用时 {moves} 步完成{(levelData.minSteps ?? -1) > 0 && ` · 最优 ${levelData.minSteps} 步`}</p>
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
              <button className="btn btn-primary" onClick={() => {
                // 初始化回放：从初始状态开始
                setReplayTubes(cloneTubes(levelData.tubes));
                setReplayStep(0);
                setShowReplay(true);
              }}>🎬 查看回放</button>
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
                setShareImageUrl(url);
                setShowShareImage(true);
              }}>🖼️ 生成战绩图</button>
              <button className="btn btn-primary" onClick={() => onShare(moves, level)}>📤 分享战绩</button>
              <button className="btn btn-primary" onClick={onNextLevel}>{level === -3 ? '➡️ 继续挑战' : level === -2 ? '➡️ 继续挑战' : '➡️ 下一关'}</button>
              <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回首页</button>
            </div>
          </div>
        </div>
      )}

      {isTimeUp && !isWon && (
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
                setShareImageUrl(url);
                setShowShareImage(true);
              }}>🖼️ 生成战绩图</button>
              <button className="btn btn-primary" onClick={() => onShare(timedScore, level)}>📤 分享战绩</button>
              <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回首页</button>
            </div>
          </div>
        </div>
      )}

      {showShareImage && (
        <div className="share-image-overlay" onClick={() => setShowShareImage(false)}>
          <div className="share-image-card" onClick={(e) => e.stopPropagation()}>
            <h3>战绩图已生成</h3>
            <img src={shareImageUrl} alt="战绩图" className="share-image-preview" />
            <div className="share-image-actions">
              <a
                ref={shareImageRef}
                href={shareImageUrl}
                download="color-sort-score.png"
                className="btn btn-primary"
              >💾 保存图片</a>
              <button className="btn btn-secondary" onClick={async () => {
                const blob = dataURLToBlob(shareImageUrl);
                if (blob && navigator.share) {
                  try {
                    const file = new File([blob], 'color-sort-score.png', { type: 'image/png' });
                    await navigator.share({ files: [file], title: '色彩排序战绩', text: '看看我在色彩排序的成绩！' });
                  } catch (e) { /* 用户取消 */ }
                } else {
                  // 降级：复制图片到剪贴板
                  try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob! })]);
                    alert('图片已复制到剪贴板！');
                  } catch (e2) {
                    alert('请长按图片保存，或点击"保存图片"下载。');
                  }
                }
              }}>📤 直接分享</button>
              <button className="btn btn-secondary" onClick={() => setShowShareImage(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 回放弹窗 */}
      {showReplay && (
        <div className="replay-overlay" onClick={() => { setShowReplay(false); if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; } }}>
          <div className="replay-card" onClick={(e) => e.stopPropagation()}>
            <div className="replay-header">
              <h3>🎬 操作回放</h3>
              <span className="replay-progress">第 {replayStep} / {moveHistory.length} 步</span>
            </div>
            <div className="replay-tubes" role="group" aria-label="回放试管列表">
              {(replayStep === 0 ? levelData.tubes : replayTubes).map((tube, i) => {
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
              <button className="btn btn-secondary" onClick={() => {
                // 回到开头
                if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; }
                setReplayStep(0);
                setReplayTubes(cloneTubes(levelData.tubes));
              }}>⏮ 重新开始</button>
              <button className="btn btn-primary" onClick={() => {
                if (replayStep >= moveHistory.length) return;
                if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; }
                // 执行下一步
                const move = moveHistory[replayStep];
                const currentTubes = replayStep === 0 ? cloneTubes(levelData.tubes) : cloneTubes(replayTubes);
                const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
                currentTubes[move.from] = from;
                currentTubes[move.to] = to;
                setReplayTubes(currentTubes);
                setReplayStep(s => s + 1);
                SoundEngine.pour();
              }}>▶ 单步</button>
              <button className="btn btn-primary" onClick={() => {
                // 自动播放
                if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; return; }
                const autoPlay = () => {
                  setReplayStep(prevStep => {
                    if (prevStep >= moveHistory.length) {
                      if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; }
                      return prevStep;
                    }
                    const move = moveHistory[prevStep];
                    setReplayTubes(prevTubes => {
                      const currentTubes = prevStep === 0 ? cloneTubes(levelData.tubes) : cloneTubes(prevTubes);
                      const { from, to } = pour(currentTubes[move.from], currentTubes[move.to]);
                      currentTubes[move.from] = from;
                      currentTubes[move.to] = to;
                      return currentTubes;
                    });
                    SoundEngine.pour();
                    replayTimerRef.current = setTimeout(autoPlay, 500) as unknown as number;
                    return prevStep + 1;
                  });
                };
                autoPlay();
              }}>{replayTimerRef.current ? '⏸ 暂停' : '⏩ 自动播放'}</button>
              <button className="btn btn-secondary" onClick={() => { setShowReplay(false); if (replayTimerRef.current) { clearTimeout(replayTimerRef.current); replayTimerRef.current = null; } }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {isDeadlock && !isWon && (
        <div className="deadlock-overlay">
          <div className="deadlock-card">
            <div className="deadlock-emoji">🤔</div>
            <h2>没有可行操作了</h2>
            <p>试试撤销或重新开始</p>
            <div className="win-actions">
              <button className="btn btn-primary" onClick={() => { if (hadDeadlock && onDeadlockRecover) onDeadlockRecover(); handleUndo(); }} disabled={history.length === 0}>↩️ 撤销上一步</button>
              <button className="btn btn-secondary" onClick={handleReset}>🔄 重新开始</button>
            </div>
          </div>
        </div>
      )}

      <div className="game-controls">
        <button className="btn btn-undo" onClick={handleUndo} disabled={history.length === 0 || isWon} aria-label="撤销上一步">
          ↩️ 撤销
        </button>
        <button className="btn btn-hint" onClick={() => { if (onHint) onHint(); }} disabled={isWon || hintItems <= 0} aria-label="使用提示道具">
          💡 提示 <span className="hint-count">{hintItems}</span>
        </button>
        <button className="btn btn-reset" onClick={handleReset} aria-label="重新开始当前关卡">
          🔄 重置
        </button>
        <button className="btn btn-help" onClick={() => setShowHelpModal(true)} aria-label="查看玩法帮助">
          ❓ 帮助
        </button>
      </div>
      <div className="keyboard-hint">快捷键: 数字键选管 · Z 撤销 · R 重置 · H 提示(消耗道具) · PageUp 上一关 · PageDown 下一关 · 移动端长按试管可撤销</div>

      {/* 游戏内帮助弹窗 */}
      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>📖 玩法帮助</h3>
              <button className="help-close-btn" onClick={() => setShowHelpModal(false)} aria-label="关闭帮助">✕</button>
            </div>
            <div className="help-modal-body">
              <div className="help-section">
                <h4>🎮 基本玩法</h4>
                <ul>
                  <li>点击有颜色的试管选中它（高亮显示）</li>
                  <li>再点击另一个试管，颜色会从上往下倒过去</li>
                  <li>只能倒入<strong>空试管</strong>或<strong>顶部颜色相同</strong>的试管</li>
                  <li>把每种颜色全部归到同一个试管即获胜！</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>⌨️ 快捷键</h4>
                <ul>
                  <li><kbd>1-9</kbd> 选择对应编号的试管</li>
                  <li><kbd>Z</kbd> 撤销上一步操作</li>
                  <li><kbd>R</kbd> 重新开始当前关卡</li>
                  <li><kbd>H</kbd> 使用提示道具（需消耗道具）</li>
                  <li><kbd>PageUp</kbd> 上一关（通关后可用）</li>
                  <li><kbd>PageDown</kbd> 下一关（通关后可用）</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>📱 移动端操作</h4>
                <ul>
                  <li>点击试管选中/倾倒</li>
                  <li><strong>长按试管 0.5 秒</strong>可撤销上一步</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>⭐ 星级评价</h4>
                <ul>
                  <li>⭐⭐⭐ 达到或超过最优步数</li>
                  <li>⭐⭐ 步数不超过最优的 1.5 倍</li>
                  <li>⭐ 超过 1.5 倍但通关</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>💡 小技巧</h4>
                <ul>
                  <li>优先处理只剩少量颜色的试管</li>
                  <li>保持至少一个空试管作为缓冲</li>
                  <li>遇到死局时可以撤销或重置</li>
                  <li>连续高效倾倒可触发连击音效</li>
                </ul>
              </div>
            </div>
            <div className="help-modal-footer">
              <button className="btn btn-primary" onClick={() => setShowHelpModal(false)}>知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
