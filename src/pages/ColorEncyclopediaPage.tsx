import React, { useState, useCallback, useEffect } from 'react';
import { SoundEngine } from '../game/soundEngine';
import { getTodayColorQuiz, saveDailyQuizResult, getDailyQuizHistory, getQuizStreak } from '../game/announcements';

interface ColorEncyclopediaPageProps {
  onBack: () => void;
  onTestComplete?: (score: number) => void;
  onMixerUse?: (useCount: number) => void;
  onSequenceComplete?: (level: number) => void;
  onPairMatchComplete?: (moves: number) => void;
  onReactionComplete?: (score: number) => void;
  onQuizComplete?: (totalCompleted: number) => void;
  onSearch?: () => void;
  onQuizShare?: () => void;
  onColorView?: (viewedCount: number) => void;
  onGamePlayed?: (gameId: string) => void;
}

// 每日色彩问答组件
const DailyColorQuiz: React.FC<{ onComplete?: (totalCompleted: number) => void; onShare?: () => void }> = ({ onComplete, onShare }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const quiz = useState(() => getTodayColorQuiz())[0];
  const [shareToast, setShareToast] = useState('');
  const [answeredToday, setAnsweredToday] = useState(() => {
    const history = getDailyQuizHistory();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return history.some(h => h.dayIndex === quiz.dayIndex && h.date === todayStr);
  });
  const [historyStats, setHistoryStats] = useState(() => {
    const history = getDailyQuizHistory();
    const correct = history.filter(h => h.correct).length;
    return { total: history.length, correct };
  });
  const [quizStreak, setQuizStreak] = useState(() => getQuizStreak());

  const handleAnswer = useCallback((idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setShowResult(true);
    const correct = idx === quiz.answer;
    if (correct) {
      SoundEngine.star();
    } else {
      SoundEngine.error();
    }
    saveDailyQuizResult(quiz.dayIndex, correct);
    setAnsweredToday(true);
    const history = getDailyQuizHistory();
    const correctCount = history.filter(h => h.correct).length;
    setHistoryStats({ total: history.length, correct: correctCount });
    setQuizStreak(getQuizStreak());
    if (onComplete) onComplete(history.length);
  }, [selectedIdx, quiz, onComplete]);

  const handleShare = useCallback(() => {
    const correct = selectedIdx === quiz.answer;
    const correctCount = historyStats.correct;
    const totalCount = historyStats.total;
    const shareText = `🎨 色彩每日问答\n\n今日题目：${quiz.question}\n我的答案：${quiz.options[selectedIdx ?? 0]}\n结果：${correct ? '✅ 回答正确！' : '❌ 答错了'}\n累计成绩：${correctCount}/${totalCount} 正确\n\n来挑战你的色彩知识吧！👉 https://game.niuzi.asia`;
    if (navigator.share) {
      navigator.share({ title: '色彩每日问答', text: shareText, url: 'https://game.niuzi.asia' }).catch(() => {});
      if (onShare) onShare();
    } else {
      try {
        navigator.clipboard.writeText(shareText);
        setShareToast('已复制到剪贴板！');
        setTimeout(() => setShareToast(''), 2000);
        if (onShare) onShare();
      } catch (e) {
        setShareToast('复制失败，请手动复制');
        setTimeout(() => setShareToast(''), 2000);
      }
    }
  }, [selectedIdx, quiz, historyStats, onShare]);

  return (
    <div className="daily-quiz-container">
      <div className="daily-quiz-header">
        <span className="daily-quiz-badge">📅 每日一题</span>
        <span className={`daily-quiz-difficulty daily-quiz-difficulty-${quiz.difficulty}`}>
          {quiz.difficulty === 'easy' ? '🟢 简单' : quiz.difficulty === 'medium' ? '🟡 中等' : '🔴 困难'}
        </span>
        <span className="daily-quiz-stats">📊 累计：{historyStats.correct}/{historyStats.total} 正确</span>
      </div>
      {quizStreak >= 2 && (
        <div className="daily-quiz-streak-badge">
          🔥 连续答题 {quizStreak} 天！{quizStreak >= 7 ? ' 你是色彩知识达人！' : quizStreak >= 3 ? ' 保持下去！' : ''}
        </div>
      )}
      <div className="daily-quiz-question">
        <p className="daily-quiz-q-text">{quiz.question}</p>
      </div>
      <div className="daily-quiz-options">
        {quiz.options.map((option, i) => (
          <button
            key={i}
            className={`daily-quiz-option ${
              selectedIdx === i ? (i === quiz.answer ? 'dq-correct' : 'dq-wrong') : ''
            } ${selectedIdx !== null && i === quiz.answer ? 'dq-correct' : ''}`}
            onClick={() => handleAnswer(i)}
            disabled={selectedIdx !== null}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="daily-quiz-result">
          <p className="daily-quiz-explanation">{quiz.explanation}</p>
          {!answeredToday && (
            <button className="daily-quiz-share-btn" onClick={handleShare}>
              📤 分享结果
            </button>
          )}
          {shareToast && <p className="daily-quiz-toast">{shareToast}</p>}
        </div>
      )}
      {answeredToday && !showResult && (
        <p className="daily-quiz-answered">✅ 今日已答题，明天再来吧！</p>
      )}
    </div>
  );
};

// 色彩辨识测试组件
const ColorPerceptionTest: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const COLORS = [
    { name: '红色', hex: '#FF6B6B' },
    { name: '蓝色', hex: '#4ECDC4' },
    { name: '黄色', hex: '#FFE66D' },
    { name: '绿色', hex: '#95E1A3' },
    { name: '紫色', hex: '#C589E8' },
    { name: '橙色', hex: '#FFA07A' },
    { name: '粉色', hex: '#FFB6C1' },
    { name: '青色', hex: '#87CEEB' },
    { name: '棕色', hex: '#D4A574' },
    { name: '灰色', hex: '#B0B0B0' },
  ];
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [targetIdx, setTargetIdx] = useState(() => Math.floor(Math.random() * COLORS.length));
  const [options, setOptions] = useState(() => {
    const indices = [targetIdx];
    while (indices.length < 4) {
      const r = Math.floor(Math.random() * COLORS.length);
      if (!indices.includes(r)) indices.push(r);
    }
    return indices.sort(() => Math.random() - 0.5);
  });
  const [feedback, setFeedback] = useState('');

  const handleClick = useCallback((idx: number) => {
    if (finished) return;
    if (idx === targetIdx) {
      setScore(s => s + 1);
      setFeedback('✅ 正确！');
      SoundEngine.star();
    } else {
      setFeedback(`❌ 正确答案：${COLORS[targetIdx].name}`);
      SoundEngine.error();
    }
    setTimeout(() => {
      setFeedback('');
      if (round + 1 >= 10) {
        setFinished(true);
        if (onComplete) onComplete(score + (idx === targetIdx ? 1 : 0));
      } else {
        const newTarget = Math.floor(Math.random() * COLORS.length);
        setTargetIdx(newTarget);
        const newOptions = [newTarget];
        while (newOptions.length < 4) {
          const r = Math.floor(Math.random() * COLORS.length);
          if (!newOptions.includes(r)) newOptions.push(r);
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5));
        setRound(r => r + 1);
      }
    }, 800);
  }, [finished, targetIdx, round, score, onComplete, COLORS]);

  const restart = useCallback(() => {
    setScore(0);
    setRound(0);
    setFinished(false);
    const newTarget = Math.floor(Math.random() * COLORS.length);
    setTargetIdx(newTarget);
    const newOptions = [newTarget];
    while (newOptions.length < 4) {
      const r = Math.floor(Math.random() * COLORS.length);
      if (!newOptions.includes(r)) newOptions.push(r);
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [COLORS]);

  return (
    <div className="cpt-container">
      {!finished ? (
        <>
          <div className="cpt-header">
            <span className="cpt-round">第 {round + 1}/10 轮</span>
            <span className="cpt-score">正确：{score}</span>
          </div>
          <p className="cpt-instruction">找到指定颜色对应的色块：</p>
          <div className="cpt-target">
            <span className="cpt-target-name" style={{ color: COLORS[targetIdx].hex }}>{COLORS[targetIdx].name}</span>
          </div>
          <div className="cpt-options">
            {options.map((idx) => (
              <button
                key={idx}
                className="cpt-color-btn"
                style={{ background: COLORS[idx].hex }}
                onClick={() => handleClick(idx)}
                aria-label={COLORS[idx].name}
              />
            ))}
          </div>
          {feedback && <p className="cpt-feedback">{feedback}</p>}
        </>
      ) : (
        <div className="cpt-result">
          <p className="cpt-result-score">🎉 你答对了 {score}/10 题！</p>
          {score >= 8 && <p className="cpt-result-rating">🌟 色彩辨识大师！</p>}
          {score >= 5 && score < 8 && <p className="cpt-result-rating">👍 不错的色觉！</p>}
          {score < 5 && <p className="cpt-result-rating">💪 多练习，色觉会更好！</p>}
          <button className="cpt-restart-btn" onClick={restart}>🔄 再来一次</button>
        </div>
      )}
    </div>
  );
};

// 色彩记忆配对组件
const ColorPairMatch: React.FC<{ onComplete?: (moves: number) => void }> = ({ onComplete }) => {
  const PAIR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#C589E8',
    '#FFA07A', '#FFB6C1', '#87CEEB', '#D4A574', '#B0B0B0',
  ];
  const DIFFICULTY_CONFIG = {
    easy: { pairs: 6, label: '简单', timeLimit: 60 },
    normal: { pairs: 8, label: '普通', timeLimit: 90 },
    hard: { pairs: 10, label: '困难', timeLimit: 120 },
  };
  type Difficulty = keyof typeof DIFFICULTY_CONFIG;
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [timedMode, setTimedMode] = useState(false);
  const [cards, setCards] = useState<{ color: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const initGame = useCallback((diff: Difficulty, useTimed: boolean = false) => {
    const config = DIFFICULTY_CONFIG[diff];
    const colors = PAIR_COLORS.slice(0, config.pairs);
    const deck = [...colors, ...colors].sort(() => Math.random() - 0.5);
    setCards(deck.map(color => ({ color, flipped: false, matched: false })));
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setTimedMode(useTimed);
    setElapsedTime(0);
    setStartTime(Date.now());
    if (useTimed) {
      setTimeLeft(config.timeLimit);
    } else {
      setTimeLeft(0);
    }
    setGameState('playing');
  }, [PAIR_COLORS]);

  // 计时模式倒计时
  useEffect(() => {
    if (gameState !== 'playing' || !timedMode || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      if (newTime <= 0) {
        setGameState('finished');
        if (onComplete) onComplete(moves);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameState, timedMode, timeLeft, moves, onComplete]);

  // 普通模式计时
  useEffect(() => {
    if (gameState !== 'playing' || timedMode) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timedMode, startTime]);

  const handleCardClick = useCallback((idx: number) => {
    if (gameState !== 'playing') return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].color === newCards[b].color) {
        setTimeout(() => {
          const matched = [...newCards];
          matched[a].matched = true;
          matched[b].matched = true;
          setCards(matched);
          setFlippedIndices([]);
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          if (newMatched >= DIFFICULTY_CONFIG[difficulty].pairs) {
            setGameState('finished');
            if (onComplete) onComplete(moves + 1);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...newCards];
          reset[a].flipped = false;
          reset[b].flipped = false;
          setCards(reset);
          setFlippedIndices([]);
        }, 800);
      }
    }
  }, [gameState, cards, flippedIndices, matchedPairs, difficulty, moves, onComplete]);

  const bestKey = `color_pair_best_${difficulty}`;
  const bestScore = (() => { try { return parseInt(localStorage.getItem(bestKey) || '0', 10); } catch (e) { return 0; } })();
  // 非计时模式的最佳用时记录（秒）
  const bestTimeKey = `color_pair_best_time_${difficulty}`;
  const bestTime = (() => { try { return parseInt(localStorage.getItem(bestTimeKey) || '0', 10); } catch (e) { return 0; } })();
  // 判断是否刷新最佳用时（非计时模式且已完成）
  const isNewBestTime = !timedMode && gameState === 'finished' && elapsedTime > 0 && (bestTime === 0 || elapsedTime < bestTime);
  if (isNewBestTime) {
    try { localStorage.setItem(bestTimeKey, String(elapsedTime)); } catch (e) { /* 忽略 */ }
  }

  return (
    <div className="cpm-container">
      {gameState === 'idle' && (
        <div className="cpm-start">
          <p className="cpm-intro">翻开卡片找到相同颜色的配对，用最少步数完成！</p>
          <div className="cpm-difficulty-select">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
              <button
                key={d}
                className={`cpm-difficulty-btn ${difficulty === d ? 'cpm-difficulty-active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>
          <button className="cpm-start-btn" onClick={() => initGame(difficulty)}>🚀 开始游戏</button>
          {bestScore > 0 && <p className="cpm-best">最佳记录：{bestScore} 步{bestTime > 0 ? ` · 最快 ${bestTime} 秒` : ''}</p>}
        </div>
      )}
      {gameState !== 'idle' && (
        <>
          <div className="cpm-header">
            <span className="cpm-moves">步数：{moves}</span>
            <span className="cpm-pairs">配对：{matchedPairs}/{DIFFICULTY_CONFIG[difficulty].pairs}</span>
            <span className="cpm-difficulty-label">{DIFFICULTY_CONFIG[difficulty].label}</span>
          </div>
          <div className="cpm-cards">
            {cards.map((card, idx) => (
              <button
                key={idx}
                className={`cpm-card ${card.flipped || card.matched ? 'cpm-flipped' : ''} ${card.matched ? 'cpm-matched' : ''}`}
                style={card.flipped || card.matched ? { background: card.color } : {}}
                onClick={() => handleCardClick(idx)}
              />
            ))}
          </div>
        </>
      )}
      {gameState === 'finished' && (
        <div className="cpm-result">
          <p className="cpm-result-text">🎉 完成！用了 {moves} 步{!timedMode && elapsedTime > 0 ? `，耗时 ${elapsedTime} 秒` : ''}</p>
          {bestScore === 0 || moves < bestScore ? (
            <p className="cpm-new-record">🌟 新纪录！</p>
          ) : (
            <p className="cpm-best-compare">最佳：{bestScore} 步</p>
          )}
          {!timedMode && elapsedTime > 0 && (
            <p className="cpm-best-compare">{isNewBestTime ? '⚡ 最快用时纪录！' : bestTime > 0 ? `最快用时：${bestTime} 秒` : ''}</p>
          )}
          <div className="cpm-difficulty-select">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
              <button
                key={d}
                className={`cpm-difficulty-btn ${difficulty === d ? 'cpm-difficulty-active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>
          <button className="cpm-restart-btn" onClick={() => initGame(difficulty)}>🔄 再来一局</button>
        </div>
      )}
    </div>
  );
};

// 色彩序列记忆组件
const ColorSequenceGame: React.FC<{ onComplete?: (level: number) => void }> = ({ onComplete }) => {
  const COLORS = [
    { hex: '#FF6B6B', name: '红', freq: 523.25 },   // C5
    { hex: '#4ECDC4', name: '蓝', freq: 659.25 },   // E5
    { hex: '#FFE66D', name: '黄', freq: 783.99 },   // G5
    { hex: '#95E1A3', name: '绿', freq: 1046.50 },  // C6
  ];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'finished'>('idle');
  const [level, setLevel] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const bestScore = (() => { try { return parseInt(localStorage.getItem('color_sequence_best') || '0', 10); } catch (e) { return 0; } })();

  const startGame = useCallback(() => {
    const first = Math.floor(Math.random() * 4);
    setSequence([first]);
    setLevel(1);
    setPlayerIdx(0);
    setGameState('showing');
  }, []);

  useEffect(() => {
    if (gameState !== 'showing') return;
    let i = 0;
    const showNext = () => {
      if (i >= sequence.length) {
        setActiveColor(null);
        setGameState('playing');
        return;
      }
      setActiveColor(sequence[i]);
      SoundEngine.playTone(COLORS[sequence[i]].freq, 0.3, 'sine', 0.2);
      setTimeout(() => {
        setActiveColor(null);
        setTimeout(() => {
          i++;
          showNext();
        }, 200);
      }, 500);
    };
    const timer = setTimeout(showNext, 600);
    return () => clearTimeout(timer);
  }, [gameState, sequence]);

  const handleColorClick = useCallback((idx: number) => {
    if (gameState !== 'playing') return;
    if (idx === sequence[playerIdx]) {
      setActiveColor(idx);
      SoundEngine.playTone(COLORS[idx].freq, 0.2, 'sine', 0.2);
      setTimeout(() => setActiveColor(null), 200);
      const nextIdx = playerIdx + 1;
      if (nextIdx >= sequence.length) {
        setPlayerIdx(0);
        if (level >= 15) {
          setGameState('finished');
          if (onComplete) onComplete(level);
          return;
        }
        const nextColor = Math.floor(Math.random() * 4);
        const newSeq = [...sequence, nextColor];
        setSequence(newSeq);
        setLevel(l => l + 1);
        setGameState('showing');
      } else {
        setPlayerIdx(nextIdx);
      }
    } else {
      SoundEngine.error();
      setGameState('finished');
      if (onComplete) onComplete(level);
    }
  }, [gameState, sequence, playerIdx, level, onComplete]);

  return (
    <div className="csg-container">
      {gameState === 'idle' && (
        <div className="csg-start">
          <p className="csg-intro">观察颜色亮起的顺序，然后按相同顺序点击！每过一关序列增加一个颜色。</p>
          <button className="csg-start-btn" onClick={startGame}>🚀 开始游戏</button>
          {bestScore > 0 && <p className="csg-best">最高记录：第 {bestScore} 关</p>}
        </div>
      )}
      {gameState !== 'idle' && (
        <>
          <div className="csg-header">
            <span className="csg-level">第 {level} 关</span>
            <span className="csg-status">
              {gameState === 'showing' ? '👀 观察序列...' : gameState === 'playing' ? '🎮 轮到你了！' : ''}
            </span>
          </div>
          <div className="csg-colors">
            {COLORS.map((c, idx) => (
              <button
                key={idx}
                className={`csg-color-btn ${activeColor === idx ? 'csg-active' : ''}`}
                style={{ background: c.hex, opacity: activeColor === idx ? 1 : 0.4 }}
                onClick={() => handleColorClick(idx)}
                disabled={gameState !== 'playing'}
                aria-label={c.name}
              />
            ))}
          </div>
        </>
      )}
      {gameState === 'finished' && (
        <div className="csg-result">
          <p className="csg-result-text">
            {level >= 15 ? '🎉 恭喜通关！' : `游戏结束！到达第 ${level} 关`}
          </p>
          {level >= 10 && <p className="csg-rating">🏆 记忆大师！</p>}
          {level >= 5 && level < 10 && <p className="csg-rating">🌟 记忆超群！</p>}
          {level < 5 && <p className="csg-rating">💪 多练习，记忆力会更好！</p>}
          {level > bestScore && <p className="csg-new-record">🌟 新纪录！</p>}
          <button className="csg-restart-btn" onClick={startGame}>🔄 再来一次</button>
        </div>
      )}
    </div>
  );
};

// 色彩反应力测试组件
const ColorReactionTest: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const REACTION_COLORS = [
    { hex: '#FF6B6B', name: '红', emoji: '🔴' },
    { hex: '#4ECDC4', name: '蓝', emoji: '🔵' },
    { hex: '#FFE66D', name: '黄', emoji: '🟡' },
    { hex: '#95E1A3', name: '绿', emoji: '🟢' },
    { hex: '#C589E8', name: '紫', emoji: '🟣' },
    { hex: '#FFA07A', name: '橙', emoji: '🟠' },
  ];
  const TOTAL_ROUNDS = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'showing' | 'finished'>('idle');
  const [targetColor, setTargetColor] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setGameState('waiting');
  }, []);

  useEffect(() => {
    if (gameState !== 'waiting') return;
    const newTarget = Math.floor(Math.random() * REACTION_COLORS.length);
    setTargetColor(newTarget);
    const opts = [newTarget];
    while (opts.length < 4) {
      const r = Math.floor(Math.random() * REACTION_COLORS.length);
      if (!opts.includes(r)) opts.push(r);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    const timer = setTimeout(() => {
      setGameState('showing');
    }, 800 + Math.random() * 1200);
    return () => clearTimeout(timer);
  }, [gameState, round, REACTION_COLORS]);

  const handleClick = useCallback((idx: number) => {
    if (gameState !== 'showing') return;
    if (idx === targetColor) {
      setScore(s => s + 1);
      setFeedback('✅ 正确！');
      SoundEngine.click();
    } else {
      setFeedback(`❌ 是${REACTION_COLORS[targetColor].name}色`);
      SoundEngine.error();
    }
    setTimeout(() => {
      setFeedback('');
      if (round + 1 >= TOTAL_ROUNDS) {
        setGameState('finished');
        if (onComplete) onComplete(score + (idx === targetColor ? 1 : 0));
      } else {
        setRound(r => r + 1);
        setGameState('waiting');
      }
    }, 600);
  }, [gameState, targetColor, round, score, onComplete, REACTION_COLORS]);

  return (
    <div className="crt-container">
      {gameState === 'idle' && (
        <div className="crt-start">
          <p className="crt-intro">屏幕显示颜色名称后，快速点击对应色块！共 {TOTAL_ROUNDS} 轮挑战。</p>
          <button className="crt-start-btn" onClick={startGame}>🚀 开始测试</button>
        </div>
      )}
      {gameState !== 'idle' && gameState !== 'finished' && (
        <>
          <div className="crt-header">
            <span className="crt-round">第 {round + 1}/{TOTAL_ROUNDS} 轮</span>
            <span className="crt-score">正确：{score}</span>
          </div>
          {gameState === 'waiting' ? (
            <div className="crt-waiting">
              <p className="crt-wait-text">👀 准备...</p>
            </div>
          ) : (
            <>
              <div className="crt-target">
                <span className="crt-target-text">快速点击：</span>
                <span className="crt-target-color" style={{ color: REACTION_COLORS[targetColor].hex }}>
                  {REACTION_COLORS[targetColor].name}色 {REACTION_COLORS[targetColor].emoji}
                </span>
              </div>
              <div className="crt-options">
                {options.map((idx) => (
                  <button
                    key={idx}
                    className="crt-color-btn"
                    style={{ background: REACTION_COLORS[idx].hex }}
                    onClick={() => handleClick(idx)}
                    aria-label={REACTION_COLORS[idx].name}
                  />
                ))}
              </div>
            </>
          )}
          {feedback && <p className="crt-feedback">{feedback}</p>}
        </>
      )}
      {gameState === 'finished' && (
        <div className="crt-result">
          <p className="crt-result-score">🎉 你答对了 {score}/{TOTAL_ROUNDS} 题！</p>
          {score >= TOTAL_ROUNDS && <p className="crt-rating">🏆 反应力满分！</p>}
          {score >= 6 && score < TOTAL_ROUNDS && <p className="crt-rating">🌟 反应迅捷！</p>}
          {score < 6 && <p className="crt-rating">💪 多练习，反应力会更好！</p>}
          <button className="crt-restart-btn" onClick={startGame}>🔄 再来一次</button>
        </div>
      )}
    </div>
  );
};

// 交互式颜色混合器组件
const ColorMixer: React.FC<{ onMixerUse?: (useCount: number) => void }> = ({ onMixerUse }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mixCount, setMixCount] = useState(() => {
    try { return parseInt(localStorage.getItem('color_mixer_count') || '0', 10); } catch (e) { return 0; }
  });
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  const COLOR_RGB: Record<string, { r: number; g: number; b: number; name: string; emoji: string }> = {
    red: { r: 255, g: 107, b: 107, name: '红色', emoji: '🔴' },
    blue: { r: 78, g: 205, b: 196, name: '蓝色', emoji: '🔵' },
    yellow: { r: 255, g: 230, b: 109, name: '黄色', emoji: '🟡' },
    green: { r: 149, g: 225, b: 163, name: '绿色', emoji: '🟢' },
    purple: { r: 197, g: 137, b: 232, name: '紫色', emoji: '🟣' },
    orange: { r: 255, g: 160, b: 122, name: '橙色', emoji: '🟠' },
    pink: { r: 255, g: 182, b: 193, name: '粉色', emoji: '🌸' },
    cyan: { r: 135, g: 206, b: 235, name: '青色', emoji: '🔷' },
    brown: { r: 212, g: 165, b: 116, name: '棕色', emoji: '🟤' },
    gray: { r: 176, g: 176, b: 176, name: '灰色', emoji: '⚫' },
  };

  const toggleColor = useCallback((colorKey: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorKey)) return prev.filter(c => c !== colorKey);
      if (prev.length >= 3) return prev;
      return [...prev, colorKey];
    });
  }, []);

  const clearColors = useCallback(() => {
    if (selectedColors.length > 0) {
      const newCount = mixCount + 1;
      setMixCount(newCount);
      try { localStorage.setItem('color_mixer_count', String(newCount)); } catch (e) { /* 忽略 */ }
      if (onMixerUse) onMixerUse(newCount);
      if (newCount === 1) setShowMilestone('🎉 第一次混合！继续探索色彩吧～');
      else if (newCount === 5) setShowMilestone('🌟 已混合5次，色彩探索者！');
      else if (newCount === 10) setShowMilestone('🏆 混合大师！已混合10次！');
      else if (newCount === 25) setShowMilestone('⭐ 色彩实验室！已混合25次！');
    }
    setSelectedColors([]);
  }, [selectedColors, mixCount, onMixerUse]);

  const getMixedColor = useCallback((): string => {
    if (selectedColors.length === 0) return '#ffffff';
    const total = selectedColors.reduce((acc, key) => {
      const c = COLOR_RGB[key];
      return { r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b };
    }, { r: 0, g: 0, b: 0 });
    const n = selectedColors.length;
    return `rgb(${Math.round(total.r / n)}, ${Math.round(total.g / n)}, ${Math.round(total.b / n)})`;
  }, [selectedColors, COLOR_RGB]);

  const getClosestColorName = useCallback((): string => {
    if (selectedColors.length === 0) return '请选择颜色';
    if (selectedColors.length === 1) return COLOR_RGB[selectedColors[0]].name;
    const mixed = getMixedColor();
    const rgbMatch = mixed.match(/\d+/g);
    if (!rgbMatch) return '混合色';
    const r = parseInt(rgbMatch[0]);
    const g = parseInt(rgbMatch[1]);
    const b = parseInt(rgbMatch[2]);
    let minDist = Infinity;
    let closestName = '混合色';
    Object.values(COLOR_RGB).forEach(c => {
      const dist = Math.sqrt((r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2);
      if (dist < minDist) { minDist = dist; closestName = c.name; }
    });
    if (minDist > 80) {
      return selectedColors.length === 2 ? '混合双色' : '混合三色';
    }
    return `接近${closestName}`;
  }, [selectedColors, getMixedColor, COLOR_RGB]);

  const mixedColor = getMixedColor();
  const closestName = getClosestColorName();

  return (
    <div className="color-mixer-container">
      <div className="color-mixer-intro">
        <p>🎨 选择1-3种颜色，看看混合后的效果！了解色彩混合原理。</p>
      </div>
      <div className="color-mixer-palette">
        {Object.entries(COLOR_RGB).map(([key, c]) => (
          <button
            key={key}
            className={`mixer-color-btn ${selectedColors.includes(key) ? 'mixer-color-active' : ''}`}
            style={{ background: `rgb(${c.r}, ${c.g}, ${c.b})` }}
            onClick={() => toggleColor(key)}
            title={c.name}
            aria-label={c.name}
          >
            <span className="mixer-color-emoji">{c.emoji}</span>
            <span className="mixer-color-name-text">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="color-mixer-result">
        <div className="mixer-result-circle" style={{ background: mixedColor }}>
          {selectedColors.length === 0 && <span className="mixer-placeholder">?</span>}
        </div>
        <div className="mixer-result-info">
          <span className="mixer-result-name">{closestName}</span>
          <span className="mixer-result-rgb">{selectedColors.length > 0 ? mixedColor : '等待选择'}</span>
          {selectedColors.length >= 2 && (
            <span className="mixer-result-formula">
              {selectedColors.map(k => COLOR_RGB[k].name).join(' + ')}
            </span>
          )}
        </div>
        <div className="mixer-counter">
          <span className="mixer-counter-num">{mixCount}</span>
          <span className="mixer-counter-label">次混合</span>
        </div>
      </div>
      {showMilestone && (
        <div className="mixer-milestone-toast" onClick={() => setShowMilestone(null)}>
          {showMilestone}
        </div>
      )}
      {selectedColors.length > 0 && (
        <button className="mixer-clear-btn" onClick={clearColors}>🔄 清除重选</button>
      )}
      <div className="mixer-tips">
        <p>💡 小知识：光的三原色（红绿蓝）等量混合得到白色，颜料三原色（青品红黄）等量混合得到黑色。</p>
      </div>
    </div>
  );
};

// 色彩知识数据
const COLOR_KNOWLEDGE = [
  { name: '红色', emoji: '🔴', hex: '#FF6B6B', wavelength: '620-750nm', keywords: '热情、活力、警示、喜庆', description: '红色是可见光谱中波长最长、能量最低的颜色。在色彩心理学中，红色代表热情、活力和力量，能加速心跳和血液循环。在中国文化中，红色象征喜庆和好运，是节日和婚礼的主色调。', tips: '在色彩排序游戏中，红色是最容易辨识的颜色之一，适合放置在试管底部作为基础色。' },
  { name: '蓝色', emoji: '🔵', hex: '#4ECDC4', wavelength: '450-495nm', keywords: '平静、信任、专业、深度', description: '蓝色是天空和海洋的颜色，在色彩心理学中代表平静、信任和专业。蓝色能降低血压、减缓呼吸，是最受全球欢迎的颜色。在设计中，蓝色常用于科技、医疗和金融领域。', tips: '蓝绿色在试管中容易与青色混淆，开启色弱友好模式可帮助区分。' },
  { name: '黄色', emoji: '🟡', hex: '#FFE66D', wavelength: '570-590nm', keywords: '阳光、快乐、注意、温暖', description: '黄色是可见光谱中最亮的颜色，代表阳光、快乐和希望。黄色能刺激大脑活动，提高注意力和记忆力。在交通信号中，黄色用作警示色。在艺术中，梵高的向日葵是黄色经典之作。', tips: '黄色在浅色背景下辨识度较低，注意观察试管顶部颜色层。' },
  { name: '绿色', emoji: '🟢', hex: '#95E1A3', wavelength: '495-570nm', keywords: '自然、成长、和谐、健康', description: '绿色位于可见光谱中央，是人眼最敏感的颜色。绿色代表自然、成长和生命力，能缓解眼部疲劳。在色彩疗法中，绿色用于平衡身心。绿色也是安全通行的通用信号色。', tips: '绿色与青色相邻，排序时注意不要混淆。观察色层底部渐变可帮助区分。' },
  { name: '紫色', emoji: '🟣', hex: '#C589E8', wavelength: '380-450nm', keywords: '神秘、高贵、创意、灵性', description: '紫色是可见光谱中波长最短的颜色，在历史上因染料稀有而象征高贵和权力。紫色代表神秘、创意和灵性，在色彩心理学中与想象力和直觉相关。薰衣草紫还有助于放松和睡眠。', tips: '紫色与粉色在试管中容易混淆，建议从底部开始有序排列。' },
  { name: '橙色', emoji: '🟠', hex: '#FFA07A', wavelength: '590-620nm', keywords: '温暖、活力、社交、食欲', description: '橙色是红色和黄色的混合色，结合了红色的热情和黄色的快乐。橙色代表温暖、社交和食欲，在餐饮行业广泛使用。橙色也是秋季的象征色，代表丰收和成熟。', tips: '橙色与红色在快速操作时容易混淆，建议放慢节奏仔细辨认。' },
  { name: '粉色', emoji: '🌸', hex: '#FFB6C1', wavelength: '混合色', keywords: '温柔、浪漫、甜美、青春', description: '粉色是红色与白色的混合，降低了红色的攻击性，增添了温柔和浪漫。粉色在色彩心理学中有镇定作用，"贝克-米勒粉"曾用于监狱减少暴力。粉色也是樱花和少女文化的代表色。', tips: '粉色与紫色相邻时需要仔细区分，色弱模式下可看纹理图案辨别。' },
  { name: '青色', emoji: '🔷', hex: '#87CEEB', wavelength: '480-500nm', keywords: '清新、科技、冷静、信任', description: '青色介于蓝色和绿色之间，代表清新、科技和冷静。青色在自然界中常见于孔雀羽毛和绿松石。在RGB色彩模式中，青色是三原色之一。青色还象征水和冰，常用于夏季设计。', tips: '青色是游戏中容易与蓝色和绿色混淆的颜色，建议使用色弱模式辅助辨识。' },
  { name: '棕色', emoji: '🟤', hex: '#D4A574', wavelength: '混合色', keywords: '大地、稳重、自然、温暖', description: '棕色是橙色和黑色的混合，代表大地、泥土和木材。棕色给人稳重、可靠的感觉，在室内设计中广泛使用。棕色也是咖啡和巧克力的颜色，能唤起温暖和舒适感。', tips: '棕色在深色主题下辨识度较低，建议使用浅色主题或开启色弱模式。' },
  { name: '灰色', emoji: '⚫', hex: '#B0B0B0', wavelength: '无波长', keywords: '中性、平衡、专业、低调', description: '灰色是黑色和白色的混合，是无彩色系。灰色代表中性、平衡和专业，在设计中常用作背景色。浅灰色显得优雅，深灰色显得沉稳。灰色还能衬托其他颜色的鲜艳度。', tips: '灰色在所有主题下辨识度一致，是游戏中最容易区分的颜色之一。' },
];

// 色彩理论知识
const COLOR_THEORY = [
  { title: '三原色', content: '光的三原色是红（Red）、绿（Green）、蓝（Blue），即RGB。颜料的三原色是青（Cyan）、品红（Magenta）、黄（Yellow），即CMY。所有颜色都可以由三原色混合得到。色彩排序游戏中的10种颜色都基于三原色的不同组合。' },
  { title: '色相环', content: '色相环是将色彩按波长排列形成的环形图谱。相邻色（如蓝和绿）和谐共存，对比色（如红和绿）产生强烈视觉冲击。了解色相环有助于在游戏中快速辨认相近颜色，提高排序效率。' },
  { title: '冷暖色调', content: '暖色（红、橙、黄）给人前进感和温暖感，冷色（蓝、绿、青）给人后退感和凉爽感。在色彩排序中，先排列暖色或冷色可以帮助建立系统性的排序策略。' },
  { title: '色彩对比', content: '明度对比（亮暗差异）、色相对比（色种差异）和饱和度对比（鲜艳度差异）是色彩辨识的三大维度。色弱玩家在色相对比上较弱，但明度和饱和度对比通常正常，因此色弱模式通过纹理叠加增强对比。' },
];

// 色彩趣味知识
const COLOR_TRIVIA = [
  { q: '世界上最受欢迎的颜色是什么？', a: '根据全球调查，蓝色是最受欢迎的颜色，约40%的人选择蓝色作为最喜欢的颜色。' },
  { q: '为什么消防车是红色的？', a: '红色在可见光谱中波长最长，穿透力强，容易被远距离注意到。不过现代研究发现黄绿色更显眼，部分国家已改用黄绿色消防车。' },
  { q: '变色龙能变出多少种颜色？', a: '变色龙并不能随意变色，它们主要通过调整皮肤中纳米晶体的间距来改变反射光的波长，通常在绿色、棕色和灰色之间变化。' },
  { q: '为什么天空是蓝色的？', a: '这是因为瑞利散射现象。太阳光穿过大气层时，短波长的蓝光被空气分子散射得更多，所以我们看到的天空呈现蓝色。' },
  { q: '色彩能影响食欲吗？', a: '是的，红色和橙色能刺激食欲，所以餐厅常用暖色调装修。蓝色则抑制食欲，减肥时建议使用蓝色餐具。' },
  { q: '为什么紫色象征高贵？', a: '在古代，紫色染料提取自海螺，极其稀有昂贵，只有皇室和贵族才能使用。拜占庭帝国甚至将紫色列为皇家专用色。' },
];

// 色彩知识专题分类
const COLOR_TOPICS = [
  {
    icon: '🌿',
    title: '自然界的色彩',
    description: '天空、海洋、植物和动物身上的颜色奥秘',
    colors: ['蓝色', '绿色', '青色'],
  },
  {
    icon: '🎨',
    title: '艺术与设计中的色彩',
    description: '绘画、设计和文化中色彩运用的智慧',
    colors: ['红色', '黄色', '橙色'],
  },
  {
    icon: '🧠',
    title: '色彩与心理',
    description: '颜色如何影响我们的情绪和行为',
    colors: ['红色', '蓝色', '粉色', '紫色'],
  },
  {
    icon: '🔮',
    title: '色彩的科学与物理',
    description: '波长、光谱和色彩感知的科学原理',
    colors: ['紫色', '青色', '灰色'],
  },
  {
    icon: '🏛️',
    title: '色彩与文化',
    description: '不同文化中色彩的象征意义和传统',
    colors: ['红色', '紫色', '棕色'],
  },
];

export const ColorEncyclopediaPage: React.FC<ColorEncyclopediaPageProps> = ({ onBack, onTestComplete, onMixerUse, onSequenceComplete, onPairMatchComplete, onReactionComplete, onQuizComplete, onSearch, onQuizShare, onColorView, onGamePlayed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAchievementTriggered, setSearchAchievementTriggered] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('encyclopedia_recent_colors');
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  });
  const [expandedColor, setExpandedColor] = useState<string | null>(null);
  const [viewedColorsCount, setViewedColorsCount] = useState<number>(() => {
    try {
      const data = localStorage.getItem('encyclopedia_viewed_colors');
      return data ? JSON.parse(data).length : 0;
    } catch (e) { return 0; }
  });
  const totalColors = COLOR_KNOWLEDGE.length;

  const recordColorView = useCallback((colorName: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== colorName);
      const updated = [colorName, ...filtered].slice(0, 6);
      try { localStorage.setItem('encyclopedia_recent_colors', JSON.stringify(updated)); } catch (e) { /* 忽略 */ }
      return updated;
    });
    if (onColorView) {
      try {
        const viewedKey = 'encyclopedia_viewed_colors';
        const viewedData = localStorage.getItem(viewedKey);
        const viewedSet: Set<string> = viewedData ? new Set(JSON.parse(viewedData)) : new Set();
        viewedSet.add(colorName);
        localStorage.setItem(viewedKey, JSON.stringify([...viewedSet]));
        setViewedColorsCount(viewedSet.size);
        onColorView(viewedSet.size);
      } catch (e) { /* 忽略 */ }
    }
  }, [onColorView]);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredKnowledge = trimmedQuery
    ? COLOR_KNOWLEDGE.filter(c => c.name.toLowerCase().includes(trimmedQuery) || c.keywords.toLowerCase().includes(trimmedQuery) || c.description.toLowerCase().includes(trimmedQuery) || c.tips.toLowerCase().includes(trimmedQuery))
    : COLOR_KNOWLEDGE;
  const filteredTheory = trimmedQuery
    ? COLOR_THEORY.filter(t => t.title.toLowerCase().includes(trimmedQuery) || t.content.toLowerCase().includes(trimmedQuery))
    : COLOR_THEORY;
  const filteredTrivia = trimmedQuery
    ? COLOR_TRIVIA.filter(t => t.q.toLowerCase().includes(trimmedQuery) || t.a.toLowerCase().includes(trimmedQuery))
    : COLOR_TRIVIA;
  const hasResults = filteredKnowledge.length > 0 || filteredTheory.length > 0 || filteredTrivia.length > 0;

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0 && !searchAchievementTriggered) {
      setSearchAchievementTriggered(true);
      if (onSearch) onSearch();
    }
  }, [searchAchievementTriggered, onSearch]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const categoryTags = [
    { label: '🗂️ 知识专题', id: 'section-topics' },
    { label: '🎨 颜色详解', id: 'section-colors' },
    { label: '📚 色彩理论', id: 'section-theory' },
    { label: '🤔 趣味问答', id: 'section-trivia' },
    { label: '📅 每日问答', id: 'section-daily-quiz' },
    { label: '🎯 辨识测试', id: 'section-perception' },
    { label: '🎵 序列记忆', id: 'section-sequence' },
    { label: '🧠 记忆配对', id: 'section-pair' },
    { label: '⚡ 反应力', id: 'section-reaction' },
    { label: '🎨 颜色混合', id: 'section-mixer' },
    { label: '🎮 实用技巧', id: 'section-tips' },
  ];

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">🎨 色彩百科</h1>
        <div className="header-spacer" />
      </header>
      <main className="info-page">
        <h2>🌈 色彩知识小百科</h2>
        <p>了解色彩排序游戏中10种颜色的科学知识、心理学含义和实用辨识技巧，成为色彩达人！</p>

        {/* 搜索框 */}
        <div className="encyclopedia-search-bar">
          <input
            type="text"
            className="encyclopedia-search-input"
            placeholder="🔍 搜索颜色、理论、趣味问答..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="encyclopedia-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* 快速导航标签 */}
        {!trimmedQuery && (
          <div className="encyclopedia-category-tags">
            {categoryTags.map((tag, idx) => (
              <button key={idx} className="encyclopedia-category-tag" onClick={() => scrollToSection(tag.id)}>
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {trimmedQuery && (
          <p className="encyclopedia-search-result-count">
            {hasResults ? `找到 ${filteredKnowledge.length + filteredTheory.length + filteredTrivia.length} 条结果` : '未找到相关内容，试试其他关键词？'}
          </p>
        )}

        {/* 色彩知识专题 */}
        {!trimmedQuery && (
          <>
            <h3 id="section-topics">🗂️ 色彩知识专题</h3>
            <div className="color-topics-grid">
              {COLOR_TOPICS.map((topic, idx) => (
                <div key={idx} className="color-topic-card" onClick={() => {
                  const firstColor = COLOR_KNOWLEDGE.find(c => c.name === topic.colors[0]);
                  if (firstColor) {
                    setExpandedColor(firstColor.name);
                    recordColorView(firstColor.name);
                    scrollToSection('section-colors');
                  }
                }}>
                  <div className="color-topic-icon">{topic.icon}</div>
                  <h4 className="color-topic-title">{topic.title}</h4>
                  <p className="color-topic-desc">{topic.description}</p>
                  <div className="color-topic-colors">
                    {topic.colors.map(cn => {
                      const c = COLOR_KNOWLEDGE.find(ck => ck.name === cn);
                      return c ? <span key={cn} className="color-topic-chip" style={{ background: c.hex }} title={cn}>{c.emoji}</span> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredKnowledge.length > 0 && (
          <>
            <h3 id="section-colors">🎨 十种颜色详解</h3>
            {!trimmedQuery && (
              <div className="encyclopedia-progress-bar">
                <div className="encyclopedia-progress-info">
                  <span className="encyclopedia-progress-text">📖 浏览进度</span>
                  <span className="encyclopedia-progress-count">{viewedColorsCount} / {totalColors}</span>
                </div>
                <div className="encyclopedia-progress-track">
                  <div className="encyclopedia-progress-fill" style={{ width: `${(viewedColorsCount / totalColors) * 100}%` }} />
                </div>
                {viewedColorsCount === totalColors && (
                  <span className="encyclopedia-progress-complete">🎉 已浏览全部颜色！</span>
                )}
              </div>
            )}
            {!trimmedQuery && recentColors.length > 0 && (
              <div className="encyclopedia-recent-colors">
                <span className="recent-colors-label">👁 最近浏览：</span>
                {recentColors.map((name, idx) => {
                  const color = COLOR_KNOWLEDGE.find(c => c.name === name);
                  if (!color) return null;
                  return (
                    <button key={idx} className="recent-color-chip" style={{ borderLeft: `3px solid ${color.hex}` }} onClick={() => scrollToSection('section-colors')} title={color.name}>
                      {color.emoji} {color.name}
                    </button>
                  );
                })}
                <button className="recent-colors-clear" onClick={() => {
                  setRecentColors([]);
                  try { localStorage.removeItem('encyclopedia_recent_colors'); } catch (e) { /* 忽略 */ }
                }}>✕ 清除</button>
              </div>
            )}
            <div className="color-encyclopedia-list">
              {filteredKnowledge.map((color, idx) => (
                <div
                  key={idx}
                  className={`color-encyclopedia-card ${expandedColor === color.name ? 'card-expanded' : ''}`}
                  onClick={() => {
                    if (expandedColor === color.name) {
                      setExpandedColor(null);
                    } else {
                      setExpandedColor(color.name);
                      recordColorView(color.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (expandedColor === color.name) {
                        setExpandedColor(null);
                      } else {
                        setExpandedColor(color.name);
                        recordColorView(color.name);
                      }
                    }
                  }}
                >
                  <div className="color-encyclopedia-header" style={{ borderLeft: `4px solid ${color.hex}` }}>
                    <span className="color-encyclopedia-emoji">{color.emoji}</span>
                    <div>
                      <h4 className="color-encyclopedia-name">{color.name}</h4>
                      <span className="color-encyclopedia-hex">{color.hex} · {color.wavelength}</span>
                    </div>
                    <span className="card-expand-icon">▶</span>
                  </div>
                  <div className="color-encyclopedia-keywords">{color.keywords}</div>
                  <div className="color-encyclopedia-detail">
                    <p className="color-encyclopedia-desc">{color.description}</p>
                    <div className="color-encyclopedia-tip">
                      <span className="tip-icon">💡</span>
                      <span>{color.tips}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredTheory.length > 0 && (
          <>
            <h3 id="section-theory">📚 色彩理论基础</h3>
            <div className="color-theory-section">
              {filteredTheory.map((item, idx) => (
                <div key={idx} className="color-theory-card">
                  <h4>{item.title}</h4>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredTrivia.length > 0 && (
          <>
            <h3 id="section-trivia">🤔 色彩趣味问答</h3>
            <div className="color-trivia-section">
              {filteredTrivia.map((item, idx) => (
                <div key={idx} className="color-trivia-item">
                  <h4>Q: {item.q}</h4>
                  <p><strong>A:</strong> {item.a}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!trimmedQuery && (
          <>
            <h3 id="section-daily-quiz">📅 每日色彩问答</h3>
            <DailyColorQuiz onComplete={onQuizComplete} onShare={onQuizShare} />

            <h3 id="section-perception">🎯 色彩辨识测试</h3>
            <ColorPerceptionTest onComplete={(score: number) => {
              if (onTestComplete) onTestComplete(score);
              if (onGamePlayed) onGamePlayed('perception');
            }} />

            <h3 id="section-sequence">🎵 色彩序列记忆</h3>
            <ColorSequenceGame onComplete={(level: number) => {
              if (onSequenceComplete) onSequenceComplete(level);
              if (onGamePlayed) onGamePlayed('sequence');
            }} />

            <h3 id="section-pair">🧠 色彩记忆配对</h3>
            <ColorPairMatch onComplete={(moves: number) => {
              if (onPairMatchComplete) onPairMatchComplete(moves);
              if (onGamePlayed) onGamePlayed('pair');
            }} />

            <h3 id="section-reaction">⚡ 色彩反应力测试</h3>
            <ColorReactionTest onComplete={(score: number) => {
              if (onReactionComplete) onReactionComplete(score);
              if (onGamePlayed) onGamePlayed('reaction');
            }} />

            <h3 id="section-mixer">🎨 交互式颜色混合器</h3>
            <ColorMixer onMixerUse={(useCount: number) => {
              if (onMixerUse) onMixerUse(useCount);
              if (useCount === 1 && onGamePlayed) onGamePlayed('mixer');
            }} />

            <h3 id="section-tips">🎮 色彩排序游戏中的实用技巧</h3>
            <ul>
              <li>先辨识再行动：开局先观察所有试管颜色分布，制定排序策略</li>
              <li>从底部开始排：试管底部的颜色最难移动，优先确定底部颜色</li>
              <li>善用空管：空试管是宝贵的缓冲空间，不要轻易填满</li>
              <li>颜色分组：将相近颜色（如蓝/青、红/橙）分组处理，减少混淆</li>
              <li>开启色弱模式：如果难以区分某些颜色，在设置中开启色弱友好模式</li>
              <li>使用提示道具：遇到困难时使用提示道具，不消耗步数但影响连胜</li>
            </ul>
          </>
        )}

        <p className="version">色彩百科 | 色彩排序 v1.27.0 | 2026</p>

        {/* SEO 结构化数据 */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: '色彩知识小百科 - 颜色科学、心理学与辨识技巧',
            description: '了解红、橙、黄、绿、蓝、紫、粉、青、棕、灰十种颜色的科学知识、心理学含义和实用辨识技巧。',
            keywords: '色彩知识,颜色百科,色彩心理学,色彩理论,色相环,三原色,冷暖色调,色彩对比,色弱辨识',
            author: { '@type': 'Organization', name: '色彩排序' },
            publisher: { '@type': 'Organization', name: '色彩排序' },
            datePublished: '2026-07-12',
          })
        }} />
      </main>
    </div>
  );
};
