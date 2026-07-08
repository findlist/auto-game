import React from 'react';
import { AchievementManager } from '../game/achievements';

interface AchievementsPageProps {
  onBack: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const achievements = AchievementManager.getAll();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">🏆 成就</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
        <div className="achievement-summary">
          已解锁 {unlockedCount} / {achievements.length}
        </div>
        <div className="achievement-list">
          {achievements.map(ach => (
            <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">{ach.unlocked ? ach.icon : '🔒'}</div>
              <div className="achievement-info">
                <div className="achievement-name">{ach.name}</div>
                <div className="achievement-desc">{ach.description}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
