import React, { useState, useCallback } from 'react';
import { StatsTracker } from '../game/statsTracker';
import { DailyCheckin } from '../game/dailyCheckin';
import { getTodayLeaderboard, getDailyStats, getDailyLeaderboard } from '../game/dailyLeaderboard';
import { getVisitSummary, getRecentVisitTrend, getAvgSessionDuration, getReturnRate } from '../game/visitTracker';
import { getWeeklyStreak, getWeeklyRecord, getWeeklyInfo, getWeeklyHistory } from '../game/weeklyChallenge';

interface StatsPageProps {
  onBack: () => void;
  timedHighScore: number;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBack, timedHighScore }) => {
  const stats = StatsTracker.get();
  const avgStars = stats.totalWins > 0 ? (stats.totalStars / stats.totalWins).toFixed(1) : '0';
  const avgMoves = stats.totalWins > 0 ? Math.round(stats.totalMoves / stats.totalWins) : 0;
  const completedLevels = Object.keys(stats.levelStats).length;
  const perfectRate = stats.totalWins > 0 ? Math.round(stats.perfectLevels / stats.totalWins * 100) : 0;
  const [shareImgUrl, setShareImgUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const generateStatsShareImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    const W = 600, H = 420;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景渐变
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#667eea');
    bgGrad.addColorStop(1, '#764ba2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 装饰色点
    ctx.globalAlpha = 0.08;
    const dotColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#C589E8'];
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = dotColors[i % dotColors.length];
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 10 + Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 色彩排序 · 战绩', W / 2, 45);

    ctx.font = '13px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText(new Date().toLocaleDateString('zh-CN'), W / 2, 68);
    ctx.globalAlpha = 1;

    // 核心数据网格
    const items = [
      { label: '总通关', value: `${stats.totalWins}`, icon: '🎮' },
      { label: '总星数', value: `${stats.totalStars}`, icon: '⭐' },
      { label: '完美通关', value: `${stats.perfectLevels}`, icon: '💎' },
      { label: '已过关卡', value: `${completedLevels}/100`, icon: '🎯' },
      { label: '无尽记录', value: `${stats.bestEndlessScore}`, icon: '∞' },
      { label: '限时记录', value: `${timedHighScore}`, icon: '⚡' },
    ];
    const cols = 3;
    const cellW = 160, cellH = 72;
    const startX = (W - cols * cellW) / 2;
    const startY = 90;
    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.roundRect(x + 6, y + 4, cellW - 12, cellH - 8, 10);
      ctx.fill();
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(item.value, x + cellW / 2, y + 34);
      ctx.font = '11px sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText(`${item.icon} ${item.label}`, x + cellW / 2, y + 54);
      ctx.globalAlpha = 1;
    });

    // 底部信息
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.85;
    ctx.fillText(`平均${avgStars}⭐ · 完美率${perfectRate}% · 用时${StatsTracker.formatTime(stats.totalPlayTime)}`, W / 2, 260);
    ctx.globalAlpha = 1;

    // 试管装饰
    const tubeY = 300;
    const tubeColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3'];
    tubeColors.forEach((color, i) => {
      const x = 80 + i * 50 + (W - 80 * 2 - 3 * 50) / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, tubeY);
      ctx.lineTo(x, tubeY + 50);
      ctx.quadraticCurveTo(x, tubeY + 56, x + 24/2, tubeY + 56);
      ctx.quadraticCurveTo(x + 24, tubeY + 56, x + 24, tubeY + 50);
      ctx.lineTo(x + 24, tubeY);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x + 2, tubeY + 18, 20, 30);
      ctx.beginPath();
      ctx.arc(x + 12, tubeY + 50, 10, 0, Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // 底部引导
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.globalAlpha = 0.6;
    ctx.fillText('来挑战我吧！ game.niuzi.asia', W / 2, 390);
    ctx.globalAlpha = 1;

    setShareImgUrl(canvas.toDataURL('image/png'));
    setShowShareModal(true);
  }, [stats, avgStars, perfectRate, completedLevels, timedHighScore]);

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">📊 游戏统计</h1>
        <div className="header-spacer" />
      </header>
      <main className="info-page">
        <div className="stats-share-bar">
          <button className="btn btn-primary btn-share" onClick={generateStatsShareImage}>📤 分享我的战绩</button>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">🎮</div>
            <div className="stat-card-value">{stats.totalWins}</div>
            <div className="stat-card-label">总通关数</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">👣</div>
            <div className="stat-card-value">{stats.totalMoves}</div>
            <div className="stat-card-label">总步数</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⭐</div>
            <div className="stat-card-value">{stats.totalStars}</div>
            <div className="stat-card-label">总星数</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">💎</div>
            <div className="stat-card-value">{stats.perfectLevels}</div>
            <div className="stat-card-label">完美通关</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⏱</div>
            <div className="stat-card-value">{StatsTracker.formatTime(stats.totalPlayTime)}</div>
            <div className="stat-card-label">游戏时长</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📅</div>
            <div className="stat-card-value">{stats.dailyCompletions}</div>
            <div className="stat-card-label">每日挑战数</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">∞</div>
            <div className="stat-card-value">{stats.bestEndlessScore}</div>
            <div className="stat-card-label">无尽记录</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⚡</div>
            <div className="stat-card-value">{timedHighScore}</div>
            <div className="stat-card-label">限时记录</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">💡</div>
            <div className="stat-card-value">{stats.hintsUsed}</div>
            <div className="stat-card-label">提示使用</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">↩️</div>
            <div className="stat-card-value">{stats.undosUsed}</div>
            <div className="stat-card-label">撤销使用</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🎯</div>
            <div className="stat-card-value">{completedLevels}</div>
            <div className="stat-card-label">已通关卡数</div>
          </div>
        </div>

        <div className="stats-detail">
          <h3>💪 效率分析</h3>
          <div className="stats-row"><span>平均步数</span><span>{avgMoves} 步/关</span></div>
          <div className="stats-row"><span>平均星级</span><span>{avgStars} ⭐</span></div>
          <div className="stats-row"><span>完美率</span><span>{perfectRate}%</span></div>
          <div className="stats-row"><span>通关进度</span><span>{completedLevels}/100 关</span></div>
        </div>

        <div className="stats-detail">
          <h3>🎉 连胜记录</h3>
          <div className="stats-row"><span>当前连胜</span><span>🔥 {stats.currentStreak} 连胜</span></div>
          <div className="stats-row"><span>最佳连胜</span><span>🏆 {stats.bestStreak} 连胜</span></div>
          <div className="stats-row stats-note"><span>说明</span><span>不使用提示和撤销通关才累计连胜</span></div>
        </div>

        {/* 签到记录 */}
        <div className="stats-detail">
          <h3>📅 签到记录</h3>
          {(() => {
            const checkinRecord = DailyCheckin.get();
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            const historySet = new Set(checkinRecord.history);
            const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            return (
              <>
                <div className="stats-row"><span>连续签到</span><span>🔥 {checkinRecord.currentStreak} 天</span></div>
                <div className="stats-row"><span>最长连续</span><span>🏆 {checkinRecord.bestStreak} 天</span></div>
                <div className="stats-row"><span>累计签到</span><span>📊 {checkinRecord.totalCheckins} 天</span></div>
                <div className="checkin-calendar">
                  <div className="calendar-header">{year}年{month + 1}月</div>
                  <div className="calendar-weekdays">
                    {weekdays.map(d => <span key={d} className="calendar-weekday">{d}</span>)}
                  </div>
                  <div className="calendar-days">
                    {Array.from({ length: firstDay }, (_, i) => (
                      <span key={`empty-${i}`} className="calendar-day calendar-day-empty" />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const checked = historySet.has(dateStr);
                      const isToday = dateStr === todayStr;
                      return (
                        <span key={day} className={`calendar-day ${checked ? 'calendar-day-checked' : ''} ${isToday ? 'calendar-day-today' : ''}`}>
                          {day}
                          {checked && <span className="calendar-day-mark">✓</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* 星级分布图 */}
        <div className="stats-detail">
          <h3>⭐ 星级分布</h3>
          {(() => {
            const levelEntries = Object.entries(stats.levelStats).filter(([, s]) => s.stars > 0);
            if (levelEntries.length === 0) return <p style={{ color: '#999', fontSize: '13px' }}>还未通关哦</p>;
            const star3 = levelEntries.filter(([, s]) => s.stars === 3).length;
            const star2 = levelEntries.filter(([, s]) => s.stars === 2).length;
            const star1 = levelEntries.filter(([, s]) => s.stars === 1).length;
            const total = star3 + star2 + star1 || 1;
            const bars = [
              { label: '⭐⭐⭐ 完美', count: star3, color: '#FFD700' },
              { label: '⭐⭐ 不错', count: star2, color: '#C0C0C0' },
              { label: '⭐ 一般', count: star1, color: '#CD7F32' },
            ];
            return (
              <>
                {bars.map(bar => (
                  <div key={bar.label} className="chart-bar-row">
                    <span className="chart-bar-label">{bar.label}</span>
                    <div className="chart-bar-track">
                      <div className="chart-bar-fill" style={{ width: `${(bar.count / total) * 100}%`, background: bar.color }} />
                    </div>
                    <span className="chart-bar-count">{bar.count}</span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* 关卡热力图 */}
        <div className="stats-detail">
          <h3>🔥 通关进度</h3>
          {(() => {
            const totalLevels = 100;
            const completed = Object.keys(stats.levelStats).length;
            const pct = Math.round(completed / totalLevels * 100);
            return (
              <>
                <div className="progress-overall">
                  <div className="progress-overall-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="stats-row"><span>完成度</span><span>{completed}/{totalLevels} ({pct}%)</span></div>
                {/* 关卡热力图 */}
                <div className="level-grid-chart">
                  {Array.from({ length: totalLevels }, (_, i) => {
                    const lv = i + 1;
                    const ls = stats.levelStats[lv];
                    let bg = '#e0e0e0';
                    if (ls) {
                      if (ls.stars === 3) bg = '#FFD700';
                      else if (ls.stars === 2) bg = '#C0C0C0';
                      else bg = '#CD7F32';
                    }
                    return (
                      <div key={lv} className="level-grid-cell" style={{ background: bg }} title={`关卡 ${lv}${ls ? ` · ${ls.stars}星 · 最佳${ls.bestMoves}步` : ' · 未通关'}`} />
                    );
                  })}
                </div>
                <div className="level-grid-legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#FFD700' }} />完美</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#C0C0C0' }} />不错</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#CD7F32' }} />一般</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#e0e0e0' }} />未通关</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* 步数分布图 */}
        <div className="stats-detail">
          <h3>📊 步数分布</h3>
          {(() => {
            const records = stats.recentRecords;
            if (records.length === 0) return <p style={{ color: '#999', fontSize: '13px' }}>还未通关哦</p>;
            const ranges = [
              { label: '1-10步', min: 1, max: 10, color: '#4CAF50' },
              { label: '11-20步', min: 11, max: 20, color: '#2196F3' },
              { label: '21-30步', min: 21, max: 30, color: '#FF9800' },
              { label: '31-50步', min: 31, max: 50, color: '#f44336' },
              { label: '50+步', min: 51, max: 9999, color: '#9C27B0' },
            ];
            const counts = ranges.map(r => records.filter(rec => rec.moves >= r.min && rec.moves <= r.max).length);
            const maxCount = Math.max(...counts, 1);
            return (
              <>
                {ranges.map((r, i) => (
                  <div key={r.label} className="chart-bar-row">
                    <span className="chart-bar-label">{r.label}</span>
                    <div className="chart-bar-track">
                      <div className="chart-bar-fill" style={{ width: `${(counts[i] / maxCount) * 100}%`, background: r.color }} />
                    </div>
                    <span className="chart-bar-count">{counts[i]}</span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* 关卡效率分析 */}
        <div className="stats-detail">
          <h3>🎯 关卡效率分析</h3>
          {(() => {
            const levelEntries = Object.entries(stats.levelStats).filter(([, s]) => s.playCount > 0);
            if (levelEntries.length === 0) return <p style={{ color: '#999', fontSize: '13px' }}>还未通关哦</p>;
            // 分析各难度区间平均步数与重玩率
            const ranges = [
              { name: '入门(1-6)', min: 1, max: 6, color: '#4ECDC4' },
              { name: '初级(7-12)', min: 7, max: 12, color: '#667eea' },
              { name: '中等(13-20)', min: 13, max: 20, color: '#FFA07A' },
              { name: '困难(21-30)', min: 21, max: 30, color: '#FF6B6B' },
              { name: '挑战(31-50)', min: 31, max: 50, color: '#C589E8' },
              { name: '高级(51+)', min: 51, max: 100, color: '#333' },
            ];
            return (
              <>
                {ranges.map(r => {
                  const levels = levelEntries.filter(([l]) => {
                    const lv = parseInt(l, 10);
                    return lv >= r.min && lv <= r.max;
                  });
                  if (levels.length === 0) return null;
                  const avgMoves = Math.round(levels.reduce((sum, [, s]) => sum + s.bestMoves, 0) / levels.length);
                  const avgStars = (levels.reduce((sum, [, s]) => sum + s.stars, 0) / levels.length).toFixed(1);
                  const totalPlays = levels.reduce((sum, [, s]) => sum + s.playCount, 0);
                  const completed = levels.length;
                  return (
                    <div key={r.name} className="chart-bar-row">
                      <span className="chart-bar-label">{r.name}</span>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ width: `${(completed / (r.max - r.min + 1)) * 100}%`, background: r.color }} />
                      </div>
                      <span className="chart-bar-count">{completed}关 · 均{avgMoves}步 · 均{avgStars}⭐ · {totalPlays}次</span>
                    </div>
                  );
                })}
                {/* 最常重玩的关卡 Top5 */}
                {(() => {
                  const sorted = levelEntries.sort((a, b) => b[1].playCount - a[1].playCount);
                  const top5 = sorted.filter(([, s]) => s.playCount > 1).slice(0, 5);
                  if (top5.length === 0) return null;
                  return (
                    <>
                      <h4 style={{ marginTop: '12px', color: '#667eea' }}>🔁 最常重玩关卡</h4>
                      {top5.map(([lv, s]) => (
                        <div key={lv} className="stats-row">
                          <span>第 {lv} 关</span>
                          <span>重玩 {s.playCount} 次 · 最佳 {s.bestMoves} 步 · {'⭐'.repeat(s.stars)}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </>
            );
          })()}
        </div>

        {/* 用时趋势图 */}
        <div className="stats-detail">
          <h3>📈 近通关用时趋势</h3>
          {(() => {
            const records = stats.recentRecords.slice(-15);
            if (records.length === 0) return <p style={{ color: '#999', fontSize: '13px' }}>还未通关哦</p>;
            const times = records.map(r => r.playTimeSec);
            const maxTime = Math.max(...times, 1);
            return (
              <>
                <div className="trend-chart">
                  {records.map((rec, i) => {
                    const pct = (rec.playTimeSec / maxTime) * 100;
                    const modeIcon = rec.mode === 'daily' ? '📅' : rec.mode === 'endless' ? '∞' : rec.mode === 'timed' ? '⚡' : '🎮';
                    return (
                      <div key={i} className="trend-bar-wrapper" title={`第${rec.level}关 · ${rec.moves}步 · ${rec.playTimeSec}秒 · ${'⭐'.repeat(rec.stars)}`}>
                        <div className="trend-bar" style={{ height: `${Math.max(pct, 5)}%` }} />
                        <span className="trend-bar-label">{modeIcon}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="stats-row" style={{ marginTop: '8px' }}><span>最快</span><span>{Math.min(...times)}秒</span></div>
                <div className="stats-row"><span>最慢</span><span>{Math.max(...times)}秒</span></div>
                <div className="stats-row"><span>平均</span><span>{Math.round(times.reduce((a, b) => a + b, 0) / times.length)}秒</span></div>
              </>
            );
          })()}
        </div>

        <div className="stats-detail">
          <h3>📈 访问数据</h3>
          {(() => {
            const visit = getVisitSummary();
            const trend = getRecentVisitTrend(7);
            const avgDuration = getAvgSessionDuration();
            const returnRate = getReturnRate();
            const firstVisit = visit.firstVisit ? new Date(visit.firstVisit).toLocaleDateString('zh-CN') : '今日';
            const maxVisits = Math.max(...trend.map(t => t.visits), 1);
            return (
              <>
                <div className="stats-row"><span>总访问次数</span><span>👁️ {visit.totalVisits} 次</span></div>
                <div className="stats-row"><span>首次访问</span><span>📅 {firstVisit}</span></div>
                <div className="stats-row"><span>回访次数</span><span>🔄 {visit.returnVisits} 次</span></div>
                <div className="stats-row"><span>回访率</span><span>📊 {returnRate}%</span></div>
                <div className="stats-row"><span>总会话数</span><span>🔒 {visit.totalSessions} 次</span></div>
                <div className="stats-row"><span>平均会话时长</span><span>⏱️ {Math.floor(avgDuration / 60)}分{avgDuration % 60}秒</span></div>
                {/* 近7天访问趋势 */}
                <h4 style={{ marginTop: '12px', color: '#667eea' }}>近7天访问趋势</h4>
                <div className="trend-chart" style={{ height: '80px' }}>
                  {trend.map((t, i) => {
                    const pct = (t.visits / maxVisits) * 100;
                    const dateLabel = t.date.slice(5).replace('-', '/');
                    return (
                      <div key={i} className="trend-bar-wrapper" title={`${t.date} · ${t.visits}次访问`}>
                        <div className="trend-bar" style={{ height: `${Math.max(pct, 3)}%` }} />
                        <span className="trend-bar-label" style={{ fontSize: '10px' }}>{dateLabel}</span>
                      </div>
                    );
                  })}
                </div>
                {/* 30天访问热力图 - 类似GitHub贡献图，展示长期活跃度 */}
                <h4 style={{ marginTop: '16px', color: '#667eea' }}>近30天活跃热力图</h4>
                {(() => {
                  const trend30 = getRecentVisitTrend(30);
                  const maxV = Math.max(...trend30.map(t => t.visits), 1);
                  return (
                    <div className="stats-heatmap">
                      <div className="stats-heatmap-grid">
                        {trend30.map((t, i) => {
                          const intensity = t.visits === 0 ? 0 : Math.ceil((t.visits / maxV) * 4);
                          const bgColor = t.visits === 0 ? 'rgba(255,255,255,0.08)' : `rgba(102,126,234,${0.3 + intensity * 0.18})`;
                          const dateLabel = t.date.slice(5);
                          return (
                            <div
                              key={i}
                              className="stats-heatmap-cell"
                              style={{ background: bgColor }}
                              title={`${dateLabel} · ${t.visits}次访问`}
                            />
                          );
                        })}
                      </div>
                      <div className="stats-heatmap-legend">
                        <span>少</span>
                        <span className="stats-heatmap-cell" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <span className="stats-heatmap-cell" style={{ background: 'rgba(102,126,234,0.48)' }} />
                        <span className="stats-heatmap-cell" style={{ background: 'rgba(102,126,234,0.66)' }} />
                        <span className="stats-heatmap-cell" style={{ background: 'rgba(102,126,234,0.84)' }} />
                        <span className="stats-heatmap-cell" style={{ background: 'rgba(102,126,234,1)' }} />
                        <span>多</span>
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </div>

        {/* 每日挑战历史日历热力图 — 展示最近30天每日挑战完成情况 */}
        <div className="stats-detail">
          <h3>📅 每日挑战日历</h3>
          {(() => {
            const leaderboard = getDailyLeaderboard();
            // 构建日期到最佳成绩的映射
            const dateMap = new Map<string, { stars: number; moves: number }>();
            for (const entry of leaderboard) {
              const existing = dateMap.get(entry.date);
              if (!existing || entry.stars > existing.stars || (entry.stars === existing.stars && entry.moves < existing.moves)) {
                dateMap.set(entry.date, { stars: entry.stars, moves: entry.moves });
              }
            }
            // 生成最近30天日期数组
            const days: { date: string; record: { stars: number; moves: number } | null }[] = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(d.getDate() - i);
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const record = dateMap.get(dateStr) || null;
              days.push({ date: dateStr, record });
            }
            const completedCount = days.filter(d => d.record).length;
            if (completedCount === 0) {
              return <p style={{ color: '#999', fontSize: '13px' }}>还未完成每日挑战，点击首页“每日挑战”开始吧！</p>;
            }
            return (
              <>
                <div className="stats-row"><span>近30天完成</span><span>📅 {completedCount} 天</span></div>
                <h4 style={{ marginTop: '16px', color: '#667eea' }}>近30天挑战日历</h4>
                <div className="stats-heatmap">
                  <div className="stats-heatmap-grid">
                    {days.map((d, i) => {
                      let bgColor = 'rgba(255,255,255,0.08)';
                      let title = `${d.date.slice(5)} · 未挑战`;
                      if (d.record) {
                        // 根据星级使用不同颜色深度
                        const intensity = d.record.stars;
                        const colors = [
                          'rgba(158, 158, 158, 0.4)',   // 0星 — 已挑战但未满星
                                                   'rgba(255, 167, 38, 0.5)',   // 1星 — 橙色
                                                   'rgba(102, 187, 106, 0.5)',  // 2星 — 绿色
                                                   'rgba(102, 126, 234, 0.85)', // 3星 — 蓝紫色
                        ];
                        bgColor = colors[Math.min(intensity, 3)] || colors[0];
                        title = `${d.date.slice(5)} · ⭐${d.record.stars} · ${d.record.moves}步`;
                      }
                      return (
                        <div
                          key={i}
                          className="stats-heatmap-cell"
                          style={{ background: bgColor }}
                          title={title}
                        />
                      );
                    })}
                  </div>
                  <div className="stats-heatmap-legend">
                    <span>未挑战</span>
                    <span className="stats-heatmap-cell" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <span className="stats-heatmap-cell" style={{ background: 'rgba(255, 167, 38, 0.5)' }} />
                    <span className="stats-heatmap-cell" style={{ background: 'rgba(102, 187, 106, 0.5)' }} />
                    <span className="stats-heatmap-cell" style={{ background: 'rgba(102, 126, 234, 0.85)' }} />
                    <span>⭐3星</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* 每日挑战排行榜 */}
        <div className="stats-detail">
          <h3>🏆 每日挑战排行</h3>
          {(() => {
            const dailyStats = getDailyStats();
            const todayEntries = getTodayLeaderboard();
            if (dailyStats.totalCompletions === 0) {
              return <p style={{ color: '#999', fontSize: '13px' }}>还未完成每日挑战，去挑战一下吧！</p>;
            }
            return (
              <>
                <div className="stats-row"><span>完成天数</span><span>📅 {dailyStats.totalDays} 天</span></div>
                <div className="stats-row"><span>总完成次数</span><span>🎮 {dailyStats.totalCompletions} 次</span></div>
                <div className="stats-row"><span>历史最少步数</span><span>💎 {dailyStats.bestMoves} 步</span></div>
                <div className="stats-row"><span>平均步数</span><span>📊 {dailyStats.avgMoves} 步</span></div>
                <div className="stats-row"><span>满星天数</span><span>⭐ {dailyStats.perfectDays} 天</span></div>
                {todayEntries.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '12px', color: '#667eea' }}>今日成绩</h4>
                    {todayEntries.slice(0, 5).map((entry, i) => (
                      <div key={i} className="stats-row daily-leaderboard-row">
                        <span>#{i + 1} {'⭐'.repeat(entry.stars)}{'☆'.repeat(3 - entry.stars)}</span>
                        <span>{entry.moves} 步 · {entry.playTimeSec} 秒{entry.minSteps > 0 ? ` · 最优 ${entry.minSteps}` : ''}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            );
          })()}
        </div>

        {/* 周挑战统计 */}
        <div className="stats-detail">
          <h3>🏆 周挑战统计</h3>
          {(() => {
            const streak = getWeeklyStreak();
            const record = getWeeklyRecord();
            const info = getWeeklyInfo();
            if (streak.totalCompletions === 0 && !record) {
              return <p style={{ color: '#999', fontSize: '13px' }}>还未完成周挑战，每周日更新新关卡！</p>;
            }
            return (
              <>
                <div className="stats-row"><span>当前周数</span><span>📅 第{info.week}周</span></div>
                <div className="stats-row"><span>本周成绩</span><span>{record ? `${record.moves}步 · {'⭐'.repeat(record.stars)} · ${record.playTimeSec}秒` : '未完成'}</span></div>
                <div className="stats-row"><span>当前连胜</span><span>🔥 {streak.currentStreak}周</span></div>
                <div className="stats-row"><span>最长连胜</span><span>💎 {streak.bestStreak}周</span></div>
                <div className="stats-row"><span>总完成次数</span><span>🎮 {streak.totalCompletions}次</span></div>
                {/* 周挑战历史记录 */}
                {(() => {
                  const history = getWeeklyHistory();
                  if (history.length === 0) return null;
                  const sorted = [...history].sort((a, b) => b.year * 100 + b.week - a.year * 100 - a.week);
                  return (
                    <>
                      <h4 style={{ marginTop: '12px', color: '#667eea' }}>📜 历史成绩</h4>
                      <div className="weekly-history-list">
                        {sorted.slice(0, 10).map((h, i) => (
                          <div key={i} className="stats-row weekly-history-row">
                            <span>📅 第{h.week}周</span>
                            <span>{h.moves}步 · {'⭐'.repeat(h.stars)} · {h.playTimeSec}秒</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </>
            );
          })()}
        </div>
      </main>

      {showShareModal && shareImgUrl && (
        <div className="tutorial-overlay" onClick={() => setShowShareModal(false)}>
          <div className="tutorial-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>📊 我的战绩</h2>
            <img src={shareImgUrl} alt="战绩分享图" style={{ width: '100%', borderRadius: '12px' }} />
            <div className="modal-actions" style={{ flexDirection: 'column', gap: '8px' }}>
              <a href={shareImgUrl} download="color-sort-stats.png" className="btn btn-primary">💾 保存图片</a>
              <button className="btn btn-secondary" onClick={() => {
                navigator.clipboard.writeText('🎨 色彩排序战绩分享\n' +
                  `总通关${stats.totalWins}次 · 总星数${stats.totalStars} · 完美${stats.perfectLevels}关\n` +
                  `已过关卡${completedLevels}/100 · 无尽记录${stats.bestEndlessScore} · 限时记录${timedHighScore}\n` +
                  `平均${avgStars}⭐ · 完美率${perfectRate}% · 用时${StatsTracker.formatTime(stats.totalPlayTime)}\n` +
                  '来挑战我吧！ game.niuzi.asia'
                ).then(() => {
                  setShowShareModal(false);
                });
              }}>📋 复制战绩文字</button>
              <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
