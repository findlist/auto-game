import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tube, Level } from '../game/types';
import { canPour, pour, checkWin, checkDeadlock, cloneTubes } from '../game/levelGenerator';
import { generateLevelForMode } from '../game/levelFactory';
import { SoundEngine } from '../game/soundEngine';
import { TubeView } from './TubeView';
import { ParticleEffect } from './ParticleEffect';
import { GameSettings } from '../game/settings';
import { ReplayPanel } from './ReplayPanel';
import { HelpModal } from './HelpModal';
import { ShareImageModal } from './ShareImageModal';
import { WinOverlay } from './WinOverlay';
import { GameOverlays } from './GameOverlays';
import { LEVEL_TIPS } from '../game/levelTips';
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
  colorBlindMode?: boolean; // 色弱友好模式
  colorLabels?: boolean; // 颜色名称标签
}

export const GameBoard: React.FC<GameBoardProps> = ({ level, endlessScore = 0, timedScore = 0, timedDuration = 120, bestScore = 0, onWin, onMove, onReset, hintPair, clearHint, onNextLevel, onPrevLevel, onGoHome, onShare, onReplayShare, onExportVideo, onTimeUp, tubesRef, onDeadlockRecover, onHint, hintItems = 0, colorBlindMode = false, colorLabels = false }) => {
  const [levelData, setLevelData] = useState<Level>(() =>
    generateLevelForMode(level, endlessScore, timedScore)
  );
  const [tubes, setTubes] = useState<Tube[]>(levelData.tubes);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [hadDeadlock, setHadDeadlock] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [settledTubes, setSettledTubes] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timedDuration);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [starRating, setStarRating] = useState(0); // 星级评价：0-3星
  const [showShareImage, setShowShareImage] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState('');
  const [pouringTo, setPouringTo] = useState<number | null>(null); // 倾倒动画目标试管
  const [movesPulse, setMovesPulse] = useState(false); // 步数变化脉冲
  const [showFirstPourTip, setShowFirstPourTip] = useState(false); // 新手首次倒水成功鼓励提示
  const [activeLevelTip, setActiveLevelTip] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // 已用时间（秒）
  const gameStartTime = useRef<number>(Date.now()); // 游戏开始时间戳

  // 回放系统：记录操作序列（回放 UI 已拆分为独立 ReplayPanel 组件）
  const [moveHistory, setMoveHistory] = useState<Array<{ from: number; to: number }>>([]);
  const [showReplay, setShowReplay] = useState(false);
  // 连击系统
  const comboCountRef = useRef(0);
  const lastPourTimeRef = useRef(0);

  // 帮助弹窗状态
  const [showHelpModal, setShowHelpModal] = useState(false);
  // 暂停状态：玩家可暂停游戏，暂停时冻结计时器和操作
  const [isPaused, setIsPaused] = useState(false);
  // 暂停时记录的已用时间，用于恢复计时
  const pausedElapsedRef = useRef<number>(0);

  // 同步当前 tubes 到父组件的 ref（用于提示功能）
  tubesRef.current = tubes;

  // 新手鼓励：第1关首次成功倒水后显示鼓励提示，增强新手信心
  useEffect(() => {
    if (level === 1 && moves === 1 && !showFirstPourTip) {
      setShowFirstPourTip(true);
      // 4秒后自动消失
      const timer = setTimeout(() => setShowFirstPourTip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [level, moves, showFirstPourTip]);

  // 统一处理第2-15关的关卡提示显示与自动消失，消除11+个重复useEffect
  useEffect(() => {
    const tipConfig = LEVEL_TIPS[level];
    if (tipConfig) {
      setActiveLevelTip(level);
      const t = setTimeout(() => setActiveLevelTip(null), tipConfig.duration);
      return () => clearTimeout(t);
    } else {
      setActiveLevelTip(null);
    }
  }, [level]);

  // 限时模式倒计时（暂停时冻结）
  useEffect(() => {
    if (level !== -3 || isWon || isTimeUp || isPaused) return;
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
  }, [level, timeLeft, isWon, isTimeUp, isPaused, onTimeUp]);

  // 关卡变化时重置
  useEffect(() => {
    const newLevel = generateLevelForMode(level, endlessScore, timedScore);
    
    setLevelData(newLevel);
    setTubes(newLevel.tubes);
    setSelectedTube(null);
    setMoves(0);
    setIsWon(false);
    setHistory([]);
    setMoveHistory([]);
    setHadDeadlock(false);
    setElapsedTime(0);
    setSettledTubes(new Set());
    setTimeLeft(timedDuration); // 重置限时模式倒计时
    setIsTimeUp(false); // 重置时间到标志
    gameStartTime.current = Date.now(); // 重置计时器
  }, [level, endlessScore, timedScore, timedDuration]);

  // 实时计时器（非限时模式也显示已用时间），暂停时冻结
  // 使用 requestAnimationFrame 替代 setInterval，减少不必要的重渲染
  // 仅在秒数变化时更新状态
  useEffect(() => {
    if (isWon || isTimeUp || isPaused) return;
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
  }, [isWon, isTimeUp, isPaused, level]);

  // 处理试管选中/取消选中/切换选中（从 handleTubeClick 拆分）
  // 设计原因：选中逻辑与倾倒逻辑职责分离，降低单函数复杂度
  const handleSelect = useCallback((index: number) => {
    // 空试管不可选中
    if (tubes[index].layers.length === 0) return;
    setSelectedTube(index);
    SoundEngine.select();
  }, [tubes]);

  // 执行倾倒操作：倾倒动画、连击检测、接近完成检测、胜利检查（从 handleTubeClick 拆分）
  // 设计原因：倾倒逻辑约70行，包含动画、音效、连击、胜利等独立职责，单独提取提高可读性
  const executePour = useCallback((fromIndex: number, toIndex: number) => {
    const fromTube = tubes[fromIndex];
    const toTube = tubes[toIndex];

    // 执行倾倒
    const { from: newFrom, to: newTo } = pour(fromTube, toTube);
    // 回滚优化：cloneTubes 深拷贝所有试管，确保 React.memo 检测到引用变化
    const newTubes = cloneTubes(tubes);
    newTubes[fromIndex] = newFrom;
    newTubes[toIndex] = newTo;

    // 保存历史
    setHistory(prev => [...prev, cloneTubes(tubes)]);
    setMoveHistory(prev => [...prev, { from: fromIndex, to: toIndex }]);
    setTubes(newTubes);
    setMoves(prev => prev + 1);
    setSelectedTube(null);
    setPouringTo(toIndex);
    setTimeout(() => setPouringTo(null), 300);
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
      const allSame = t.layers.every(l => l.color === topColor);
      if (allSame && t.layers.length === t.capacity) return;
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
      // 试管归位波纹动画：依次给每个试管添加动画
      newTubes.forEach((_, idx) => {
        setTimeout(() => {
          setSettledTubes(prev => new Set(prev).add(idx));
        }, idx * 80);
      });
      // 2秒后清除归位动画状态
      setTimeout(() => setSettledTubes(new Set()), 2000);
      // 振动反馈
      if (GameSettings.getVibration()) {
        navigator.vibrate?.([100, 50, 100, 50, 200]);
      }
      // 计算游戏时长（秒）
      const playTimeSec = Math.round((Date.now() - gameStartTime.current) / 1000);
      // 计算星级评价
      const min = levelData.minSteps ?? -1;
      let stars = 1;
      if (min > 0) {
        const ratio = (moves + 1) / min;
        if (ratio <= 1.0) stars = 3;
        else if (ratio <= 1.5) stars = 2;
        else stars = 1;
      } else {
        const expectedMoves = levelData.tubes.length * 2;
        if ((moves + 1) <= expectedMoves) stars = 3;
        else if ((moves + 1) <= expectedMoves * 1.5) stars = 2;
        else stars = 1;
      }
      setStarRating(stars);
      for (let i = 0; i < stars; i++) {
        setTimeout(() => SoundEngine.star(), 600 + i * 200);
      }
      setTimeout(() => setShowParticles(false), 3000);
      setTimeout(() => onWin(moves + 1, levelData.minSteps ?? -1, stars, playTimeSec), 500);
    }
  }, [tubes, moves, onWin, onMove, levelData]);

  // 试管点击入口：判断是选中还是倾倒，分发给对应函数（从原 handleTubeClick 简化）
  const handleTubeClick = useCallback((index: number) => {
    if (isWon || isPaused) return;
    SoundEngine.resume();

    // 无选中试管时：尝试选中
    if (selectedTube === null) {
      handleSelect(index);
      return;
    }

    // 点击同一试管：取消选中
    if (selectedTube === index) {
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
        handleSelect(index);
      } else {
        setSelectedTube(null);
      }
      return;
    }

    // 执行倾倒
    executePour(selectedTube, index);
  }, [selectedTube, tubes, isWon, isPaused, handleSelect, executePour]);

  // 使用 ref 保存 handleTubeClick 的最新引用
  // 解决：React.memo 未比较 onClick，导致 TubeView 持有旧闭包
  // 表现为选中试管后点击空试管无响应（旧闭包中 selectedTube 仍为 null）
  const handleTubeClickRef = useRef(handleTubeClick);
  handleTubeClickRef.current = handleTubeClick;
  const stableHandleTubeClick = useCallback((index: number) => {
    handleTubeClickRef.current(index);
  }, []);

  // 撤销（暂停时禁止）
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isWon || isPaused) return;
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

  // 重置当前关卡（暂停时禁止）
  const handleReset = useCallback(() => {
    if (isPaused) return;
    SoundEngine.resume();
    setTubes(cloneTubes(levelData.tubes));
    setSelectedTube(null);
    setMoves(0);
    setHistory([]);
    setMoveHistory([]);
    setIsWon(false);
    setHadDeadlock(false);
    setTimeLeft(timedDuration); // 重置限时模式倒计时
    setIsTimeUp(false); // 重置时间到标志
    // 修复 P1：胜利后点击"再来一局"时，以下状态未重置，导致新关卡残留旧关卡的动画/状态
    setShowParticles(false);
    setSettledTubes(new Set());
    setPouringTo(null);
    setMovesPulse(false);
    setStarRating(0);
    setShowReplay(false);
    setShowShareImage(false);
    gameStartTime.current = Date.now(); // 重置计时器
    SoundEngine.reset();
    onReset();
    StatsTracker.breakStreak(); // 重置关卡中断连胜
  }, [levelData, onReset, timedDuration, isPaused]);

  // stable 版本的 handleUndo / handleReset
  // 修复：键盘事件和 onLongPress 若直接捕获 handleUndo/handleReset，
  // 会因依赖变化导致闭包陷阱（hadDeadlock 变化时键盘持有旧 handleUndo）
  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;
  const stableHandleUndo = useCallback(() => {
    handleUndoRef.current();
  }, []);

  const handleResetRef = useRef(handleReset);
  handleResetRef.current = handleReset;
  const stableHandleReset = useCallback(() => {
    handleResetRef.current();
  }, []);

  // 键盘快捷键
  // 修复：原代码直接捕获 handleTubeClick/handleUndo/handleReset，
  // 这些函数依赖 [tubes, hadDeadlock, history] 等会频繁变化的 state，
  // 但 useEffect 依赖未包含完整集合，导致键盘持有过期闭包
  // （如 hadDeadlock 变化后键盘按 Z 不触发 onDeadlockRecover）
  // 现统一使用 stable 版本，useEffect 依赖只剩 isWon/isTimeUp（用于禁用快捷键）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isTimeUp) return;
      // 数字键 1-9 选择试管（通过 ref 获取最新试管数量，避免闭包陷阱）
      const num = parseInt(e.key, 10);
      const tubeCount = tubesRef.current?.length ?? 0;
      if (!isNaN(num) && num >= 1 && num <= tubeCount) {
        e.preventDefault();
        stableHandleTubeClick(num - 1);
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          stableHandleUndo();
          break;
        case 'r':
          e.preventDefault();
          stableHandleReset();
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
      // 暂停/恢复快捷键（空格或P键）
      if (e.key === ' ' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (!isWon && !isTimeUp) {
          setIsPaused(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWon, isTimeUp, isPaused, onHint, onNextLevel, onPrevLevel, stableHandleTubeClick, stableHandleUndo, stableHandleReset]);

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

  // 回放定时器清理已移至 ReplayPanel 组件内部

  // 暂停/恢复处理：暂停时记录当前已用时间，恢复时调整起始时间戳
  const handleTogglePause = useCallback(() => {
    if (isWon || isTimeUp) return;
    if (!isPaused) {
      // 进入暂停：记录当前已用时间
      pausedElapsedRef.current = Date.now() - gameStartTime.current;
      setIsPaused(true);
      SoundEngine.click();
    } else {
      // 恢复游戏：将起始时间戳向后调整暂停的时长
      gameStartTime.current = Date.now() - pausedElapsedRef.current;
      setIsPaused(false);
      SoundEngine.click();
    }
  }, [isPaused, isWon, isTimeUp]);

  // 使用 ref 保存 handleTogglePause 的最新引用，避免闭包陷阱
  const handleTogglePauseRef = useRef(handleTogglePause);
  handleTogglePauseRef.current = handleTogglePause;
  const stableHandleTogglePause = useCallback(() => {
    handleTogglePauseRef.current();
  }, []);

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
        ) : level === -4 ? (
          <span className="level-badge">周挑战</span>
        ) : (
          <span className="level-badge">第 {level} 关</span>
        )}
        <span className="difficulty-badge">{levelData.difficulty}</span>
        <span className={`moves-badge ${movesPulse ? 'moves-pulse-active' : ''}`}>步数: {moves}</span>
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

      {/* 新手引导提示：第1关且未操作时显示动画箭头指向第一个有颜色的试管 */}
      {level === 1 && moves === 0 && !isWon && !isPaused && (
        <div className="beginner-hint" aria-hidden="true">
          <span className="beginner-hint-arrow">👆</span>
          <span className="beginner-hint-text">点击有颜色的试管开始</span>
        </div>
      )}

      {/* 新手鼓励：首次倒水成功后显示正面反馈，增强继续游玩动力 */}
      {showFirstPourTip && (
        <div className="beginner-encouragement" aria-hidden="true">
          <span className="encouragement-emoji">🎉</span>
          <span className="encouragement-text">做得好！继续把每种颜色归到一个试管</span>
        </div>
      )}

      {/* 第2-15关渐进式提示：配置驱动渲染，根据 activeLevelTip 显示对应关卡提示 */}
      {activeLevelTip !== null && LEVEL_TIPS[activeLevelTip] && (
        <div className={`beginner-encouragement ${LEVEL_TIPS[activeLevelTip].className}`} aria-hidden="true">
          <span className="encouragement-emoji">{LEVEL_TIPS[activeLevelTip].emoji}</span>
          <span className="encouragement-text">{LEVEL_TIPS[activeLevelTip].text}</span>
        </div>
      )}

      <div className="tubes-grid" role="group" aria-label="试管列表">
        {tubes.map((tube, i) => (
          <TubeView
            key={i}
            tube={tube}
            index={i}
            isSelected={selectedTube === i}
            isHinted={hintPair !== null && (hintPair[0] === i || hintPair[1] === i)}
            isPouring={pouringTo === i}
            isSettled={settledTubes.has(i)}
            colorBlindMode={colorBlindMode}
            colorLabels={colorLabels}
            onClick={stableHandleTubeClick}
            onLongPress={stableHandleUndo}
          />
        ))}
      </div>

      <WinOverlay
        isWon={isWon}
        isTimeUp={isTimeUp}
        level={level}
        moves={moves}
        starRating={starRating}
        bestScore={bestScore}
        timedScore={timedScore}
        endlessScore={endlessScore}
        levelData={levelData}
        moveHistory={moveHistory}
        onShowReplay={() => setShowReplay(true)}
        onReplayShare={onReplayShare}
        onExportVideo={onExportVideo}
        onShare={onShare}
        onReset={handleReset}
        onNextLevel={onNextLevel}
        onGoHome={onGoHome}
        onShowShareImage={(url) => { setShareImageUrl(url); setShowShareImage(true); }}
      />

      {showShareImage && (
        <ShareImageModal imageUrl={shareImageUrl} onClose={() => setShowShareImage(false)} />
      )}

      {/* 回放弹窗：已拆分为独立 ReplayPanel 组件 */}
      {showReplay && (
        <ReplayPanel
          moveHistory={moveHistory}
          initialTubes={levelData.tubes}
          onClose={() => setShowReplay(false)}
        />
      )}

      <GameOverlays
        isDeadlock={isDeadlock}
        isWon={isWon}
        isPaused={isPaused}
        isTimeUp={isTimeUp}
        historyLength={history.length}
        hadDeadlock={hadDeadlock}
        onUndo={handleUndo}
        onReset={handleReset}
        onDeadlockRecover={onDeadlockRecover}
        onTogglePause={stableHandleTogglePause}
        onGoHome={onGoHome}
      />

      <div className="game-controls">
        <button className="btn btn-undo" onClick={handleUndo} disabled={history.length === 0 || isWon || isPaused} aria-label="撤销上一步">
          ↩️ 撤销
        </button>
        <button className="btn btn-hint" onClick={() => { if (onHint) onHint(); }} disabled={isWon || hintItems <= 0 || isPaused} aria-label="使用提示道具">
          💡 提示 <span className="hint-count">{hintItems}</span>
        </button>
        <button className="btn btn-pause" onClick={stableHandleTogglePause} disabled={isWon || isTimeUp} aria-label={isPaused ? '继续游戏' : '暂停游戏'}>
          {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
        <button className="btn btn-reset" onClick={handleReset} aria-label="重新开始当前关卡">
          🔄 重置
        </button>
        <button className="btn btn-help" onClick={() => setShowHelpModal(true)} aria-label="查看玩法帮助">
          ❓ 帮助
        </button>
      </div>
      <div className="keyboard-hint">
        <span className="hint-desktop">快捷键: 数字键选管 · Z 撤销 · R 重置 · H 提示(消耗道具) · P/空格 暂停 · PageUp 上一关 · PageDown 下一关 · 移动端长按试管撤销</span>
        <span className="hint-mobile">点击试管选中 → 再点目标试管倒色 · 长按试管撤销 · 💡提示需消耗道具</span>
      </div>



      {/* 游戏内帮助弹窗 */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
};
