import { useState } from 'react';
import { Tube, COLOR_KEYS } from '../game/types';
import { pour, cloneTubes, checkWin, checkDeadlock, canPour } from '../game/levelGenerator';
import { SoundEngine } from '../game/soundEngine';
import { GameSettings } from '../game/settings';
import { ParticleEffect } from '../components/ParticleEffect';
import {
  exportLevelCode, validateLevel, generateLevelId, CustomLevel
} from '../game/levelEditor';

interface LevelEditorPageProps {
  onBack: () => void;
  customLevels: CustomLevel[];
  onPlay: (level: CustomLevel) => void;
  onDelete: (id: string) => void;
  onSave: (level: CustomLevel) => void;
  onImport: (code: string) => boolean;
}

export function LevelEditorPage({ onBack, customLevels, onPlay, onDelete, onSave, onImport }: LevelEditorPageProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'import'>('list');
  const [editTubes, setEditTubes] = useState<Tube[]>([]);
  const [editCapacity, setEditCapacity] = useState(4);
  const [levelName, setLevelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_KEYS[0]);
  const [validationMsg, setValidationMsg] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const colorMap: Record<string, string> = { red: '#FF6B6B', blue: '#4ECDC4', yellow: '#FFE66D', green: '#95E1A3', purple: '#C589E8', orange: '#FFA07A', pink: '#FFB6C1', cyan: '#87CEEB', brown: '#D4A574', gray: '#B0B0B0' };

  const initEditor = () => {
    const tubes: Tube[] = [];
    for (let i = 0; i < 2; i++) {
      const colors: string[] = [];
      for (let j = 0; j < editCapacity; j++) {
        colors.push(COLOR_KEYS[i]);
      }
      tubes.push({ id: i, layers: colors.map(c => ({ color: c })), capacity: editCapacity });
    }
    tubes.push({ id: 2, layers: [], capacity: editCapacity });
    setEditTubes(tubes);
  };

  const handleCreateMode = () => {
    setMode('create');
    setLevelName('');
    setValidationMsg('');
    initEditor();
  };

  const handleAddTube = () => {
    const newId = editTubes.length;
    setEditTubes([...editTubes, { id: newId, layers: [], capacity: editCapacity }]);
  };

  const handleRemoveTube = (index: number) => {
    if (editTubes.length <= 2) return;
    const newTubes = editTubes.filter((_, i) => i !== index);
    newTubes.forEach((t, i) => t.id = i);
    setEditTubes(newTubes);
  };

  const handleTubeClick = (index: number) => {
    const tube = editTubes[index];
    if (tube.layers.length >= tube.capacity) {
      const newTubes = cloneTubes(editTubes);
      newTubes[index].layers = newTubes[index].layers.slice(0, -1);
      setEditTubes(newTubes);
      return;
    }
    const newTubes = cloneTubes(editTubes);
    newTubes[index].layers.push({ color: selectedColor });
    setEditTubes(newTubes);
  };

  const handleClearTube = (index: number) => {
    const newTubes = cloneTubes(editTubes);
    newTubes[index].layers = [];
    setEditTubes(newTubes);
  };

  const handleSave = () => {
    const validation = validateLevel(editTubes);
    if (!validation.valid) {
      setValidationMsg(validation.reason);
      return;
    }
    const level: CustomLevel = {
      id: generateLevelId(),
      name: levelName || `自定关卡 ${customLevels.length + 1}`,
      tubes: cloneTubes(editTubes),
      tubeCapacity: editCapacity,
      difficulty: '自定义',
      createdAt: Date.now(),
    };
    onSave(level);
    setMode('list');
    setValidationMsg('');
  };

  const handleExport = (level: CustomLevel) => {
    const code = exportLevelCode(level);
    const text = `色彩排序关卡「${level.name}」\n关卡码：${code}`;
    navigator.clipboard.writeText(text).then(() => {
      setImportMsg('📋 关卡码已复制到剪贴板！');
      setTimeout(() => setImportMsg(''), 3000);
    });
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      setImportMsg('请输入关卡码');
      return;
    }
    const success = onImport(importCode.trim());
    if (success) {
      setImportMsg('✅ 关卡导入成功！');
      setImportCode('');
      setTimeout(() => { setMode('list'); setImportMsg(''); }, 1500);
    } else {
      setImportMsg('❌ 关卡码格式错误');
    }
  };

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">🔧 关卡编辑器</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
        {importMsg && <div className="share-toast">{importMsg}</div>}

        {mode === 'list' && (
          <>
            <div className="editor-actions">
              <button className="btn btn-primary" onClick={handleCreateMode}>➕ 创建新关卡</button>
              <button className="btn btn-secondary" onClick={() => { setMode('import'); setImportCode(''); setImportMsg(''); }}>📥 导入关卡码</button>
            </div>

            {customLevels.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎨</span>
                <p>你还没有自定关卡</p>
                <p className="empty-hint">来创建你的第一个关卡吧！</p>
              </div>
            ) : (
              <div className="custom-levels-grid">
                {customLevels.map(lv => (
                  <div key={lv.id} className="custom-level-item">
                    <div className="custom-level-item-header">
                      <span className="custom-level-item-name">{lv.name}</span>
                      <span className="custom-level-item-diff">{lv.difficulty}</span>
                    </div>
                    <div className="custom-level-item-info">
                      <span>🧪 {lv.tubes.length}管</span>
                      <span>📜 {lv.tubeCapacity}层</span>
                      {lv.completed && <span>🏆 最佳{lv.bestMoves}步</span>}
                    </div>
                    <div className="custom-level-item-actions">
                      <button className="btn btn-primary btn-small" onClick={() => onPlay(lv)}>▶ 游玩</button>
                      <button className="btn btn-secondary btn-small" onClick={() => handleExport(lv)}>📤 导出码</button>
                      <button className="btn btn-danger btn-small" onClick={() => { if (confirm(`删除关卡「${lv.name}」？`)) onDelete(lv.id); }}>🗑 删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'create' && (
          <>
            <div className="editor-section">
              <label className="editor-label">关卡名称</label>
              <input
                type="text"
                className="editor-input"
                placeholder="输入关卡名称"
                value={levelName}
                maxLength={20}
                onChange={(e) => setLevelName(e.target.value)}
              />
            </div>

            <div className="editor-section">
              <label className="editor-label">试管容量</label>
              <div className="capacity-picker">
                {[3, 4, 5].map(cap => (
                  <button
                    key={cap}
                    className={`capacity-btn ${editCapacity === cap ? 'capacity-selected' : ''}`}
                    onClick={() => {
                      setEditCapacity(cap);
                      const tubes: Tube[] = [];
                      for (let i = 0; i < 2; i++) {
                        const colors: string[] = [];
                        for (let j = 0; j < cap; j++) colors.push(COLOR_KEYS[i]);
                        tubes.push({ id: i, layers: colors.map(c => ({ color: c })), capacity: cap });
                      }
                      tubes.push({ id: 2, layers: [], capacity: cap });
                      setEditTubes(tubes);
                    }}
                  >{cap}层</button>
                ))}
              </div>
            </div>

            <div className="editor-section">
              <label className="editor-label">选择颜色</label>
              <div className="color-picker">
                {COLOR_KEYS.map(color => (
                  <button
                    key={color}
                    className={`color-swatch ${selectedColor === color ? 'color-selected' : ''}`}
                    style={{ background: colorMap[color] || '#B0B0B0' }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="editor-section">
              <label className="editor-label">试管（点击添加颜色层，右键移除层）</label>
              <div className="editor-tubes">
                {editTubes.map((tube, i) => (
                  <div key={i} className="tube-container editor-tube">
                    <div
                      className="tube"
                      onClick={() => handleTubeClick(i)}
                      onContextMenu={(e) => { e.preventDefault(); handleClearTube(i); }}
                      title="点击添加/移除颜色层，右键清空"
                    >
                      <div className="tube-inner">
                        {tube.layers.map((layer, j) => {
                          const layerHeight = 100 / tube.capacity;
                          return (
                            <div
                              key={j}
                              className="color-layer"
                              style={{
                                height: `${layerHeight}%`,
                                backgroundColor: colorMap[layer.color] || layer.color,
                                bottom: `${j * layerHeight}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="tube-mouth" />
                    </div>
                    <div className="tube-index">{i + 1}</div>
                    {editTubes.length > 2 && (
                      <button className="tube-remove-btn" onClick={() => handleRemoveTube(i)}>×</button>
                    )}
                  </div>
                ))}
                <button className="add-tube-btn" onClick={handleAddTube}>+ 添加试管</button>
              </div>
            </div>

            {validationMsg && (
              <div className="validation-msg">⚠️ {validationMsg}</div>
            )}

            <div className="editor-actions">
              <button className="btn btn-primary" onClick={handleSave}>💾 保存关卡</button>
              <button className="btn btn-secondary" onClick={initEditor}>🔄 重置编辑器</button>
              <button className="btn btn-secondary" onClick={() => setMode('list')}>取消</button>
            </div>

            <div className="editor-tips">
              <p>💡 操作提示：</p>
              <p>1. 选择颜色后点试管添加对应颜色</p>
              <p>2. 试管满了点击可移除最顶层颜色</p>
              <p>3. 右键试管可以清空全部颜色</p>
              <p>4. 至少需要1个空试管</p>
              <p>5. 每种颜色的层数必须能整除试管容量</p>
            </div>
          </>
        )}

        {mode === 'import' && (
          <>
            <div className="editor-section">
              <label className="editor-label">导入关卡码</label>
              <textarea
                className="editor-textarea"
                placeholder="粘贴已分享的关卡码..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                rows={4}
              />
            </div>
            <div className="editor-actions">
              <button className="btn btn-primary" onClick={handleImport}>📥 导入关卡</button>
              <button className="btn btn-secondary" onClick={() => setMode('list')}>取消</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// 自定关卡游玩器
interface CustomLevelPlayerProps {
  level: CustomLevel;
  onWin: (moves: number) => void;
  onShare: (code: string) => void;
  onGoHome: () => void;
}

export function CustomLevelPlayer({ level, onWin, onShare, onGoHome }: CustomLevelPlayerProps) {
  const [tubes, setTubes] = useState<Tube[]>(() => cloneTubes(level.tubes));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [pouringTo, setPouringTo] = useState<number | null>(null);
  const colorMap: Record<string, string> = { red: '#FF6B6B', blue: '#4ECDC4', yellow: '#FFE66D', green: '#95E1A3', purple: '#C589E8', orange: '#FFA07A', pink: '#FFB6C1', cyan: '#87CEEB', brown: '#D4A574', gray: '#B0B0B0' };

  const handleTubeClick = (index: number) => {
    if (isWon) return;
    SoundEngine.resume();

    if (selectedTube === null) {
      if (tubes[index].layers.length === 0) return;
      setSelectedTube(index);
      SoundEngine.select();
      return;
    }

    if (selectedTube === index) {
      setSelectedTube(null);
      SoundEngine.click();
      return;
    }

    const fromTube = tubes[selectedTube];
    const toTube = tubes[index];

    if (!canPour(fromTube, toTube)) {
      SoundEngine.error();
      if (tubes[index].layers.length > 0) {
        setSelectedTube(index);
        SoundEngine.select();
      } else {
        setSelectedTube(null);
      }
      return;
    }

    const { from: newFrom, to: newTo } = pour(fromTube, toTube);
    const newTubes = cloneTubes(tubes);
    newTubes[selectedTube] = newFrom;
    newTubes[index] = newTo;
    setHistory(prev => [...prev, cloneTubes(tubes)]);
    setTubes(newTubes);
    setMoves(prev => prev + 1);
    setSelectedTube(null);
    setPouringTo(index);
    setTimeout(() => setPouringTo(null), 300);
    SoundEngine.pour();
    if (GameSettings.getVibration()) navigator.vibrate?.(30);

    if (checkWin(newTubes)) {
      setIsWon(true);
      setShowParticles(true);
      SoundEngine.win();
      if (GameSettings.getVibration()) navigator.vibrate?.([100, 50, 100, 50, 200]);
      setTimeout(() => setShowParticles(false), 3000);
      setTimeout(() => onWin(moves + 1), 500);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const prev = history[history.length - 1];
    setTubes(prev);
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelectedTube(null);
    SoundEngine.undo();
  };

  const handleReset = () => {
    setTubes(cloneTubes(level.tubes));
    setSelectedTube(null);
    setMoves(0);
    setHistory([]);
    setIsWon(false);
    SoundEngine.reset();
  };

  const isDeadlock = !isWon && checkDeadlock(tubes);

  return (
    <div className="game-board" role="region" aria-label="自定关卡游戏区域">
      <ParticleEffect trigger={showParticles} />
      <div className="game-info" role="status" aria-live="polite">
        <span className="level-badge">🎮 {level.name}</span>
        <span className="difficulty-badge">{level.difficulty}</span>
        <span className="moves-badge">步数: {moves}</span>
      </div>

      <div className="tubes-grid" role="group" aria-label="试管列表">
        {tubes.map((tube, i) => (
          <div
            key={i}
            className={`tube-container ${selectedTube === i ? 'tube-selected' : ''} ${pouringTo === i ? 'tube-pouring' : ''}`}
            onClick={() => handleTubeClick(i)}
          >
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
                        backgroundColor: colorMap[layer.color] || layer.color,
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
        ))}
      </div>

      {isWon && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2>关卡完成！</h2>
            <p>用时 {moves} 步完成</p>
            {level.bestMoves && moves <= (level.bestMoves || Infinity) && (
              <p className="new-record-badge">🏆 {moves < level.bestMoves ? '新纪录！' : '平局！'}</p>
            )}
            <div className="win-actions">
              <button className="btn btn-primary" onClick={handleReset}>🔄 再来一次</button>
              <button className="btn btn-primary" onClick={() => onShare(exportLevelCode(level))}>📤 分享关卡</button>
              <button className="btn btn-secondary" onClick={onGoHome}>🏠 返回</button>
            </div>
          </div>
        </div>
      )}

      {isDeadlock && !isWon && (
        <div className="deadlock-overlay">
          <div className="deadlock-card">
            <div className="deadlock-emoji">😮</div>
            <h2>没有可行操作了</h2>
            <div className="win-actions">
              <button className="btn btn-primary" onClick={handleUndo} disabled={history.length === 0}>⏪ 撒销</button>
              <button className="btn btn-secondary" onClick={handleReset}>🔄 重置</button>
            </div>
          </div>
        </div>
      )}

      <div className="game-controls">
        <button className="btn btn-undo" onClick={handleUndo} disabled={history.length === 0 || isWon}>⏪ 撒销</button>
        <button className="btn btn-reset" onClick={handleReset}>🔄 重置</button>
        <button className="btn btn-secondary" onClick={() => onShare(exportLevelCode(level))}>📤 分享</button>
      </div>
    </div>
  );
}
