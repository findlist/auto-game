import React from 'react';
import { StatsTracker } from '../game/statsTracker';
import { DailyCheckin } from '../game/dailyCheckin';
import { getTodayLeaderboard, getDailyStats } from '../game/dailyLeaderboard';

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

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">📊 游戏统计</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
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
            <div className="stat-card-label">撒销使用</div>
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
          <div className="stats-row" style={{ fontSize: '12px', color: '#999' }}><span>说明</span><span>不使用提示和撤销通关才累计连胜</span></div>
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
      </main>
    </div>
  );
};
