import React from 'react';
import { Announcement } from '../game/announcements';

// 签到奖励弹窗
const CheckinRewardModal: React.FC<{
  reward: string | null;
  streak: number;
  onClose: () => void;
}> = ({ reward, streak, onClose }) => {
  if (!reward) return null;
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-emoji">🎁</div>
        <h2>签到奖励已发放</h2>
        <p className="modal-body-text-lg">
          {reward}
        </p>
        <p className="modal-hint-text">
          连续签到 {streak} 天
        </p>
        <button className="btn btn-primary btn-large" onClick={onClose}>
          🎉 太棒了!
        </button>
      </div>
    </div>
  );
};

// 公告弹窗
const AnnouncementModal: React.FC<{
  announcements: Announcement[];
  onDismiss: (id: string) => void;
  onClose: () => void;
}> = ({ announcements, onDismiss, onClose }) => {
  if (announcements.length === 0) return null;
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-emoji">{announcements[0].icon}</div>
        <h2>{announcements[0].title}</h2>
        <p className="modal-body-text-announcement">
          {announcements[0].content}
        </p>
        <div className="modal-actions-sm">
          <button className="btn btn-primary btn-large" onClick={() => onDismiss(announcements[0].id)}>
          知道了
          </button>
          {announcements.length > 1 && (
            <p className="modal-hint-text-sm">
              还有 {announcements.length - 1} 条公告
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// 已保存混合配方查看弹窗
interface SavedRecipe {
  colors: string[];
  result: string;
  rgb: string;
  date: string;
}

const SavedRecipesModal: React.FC<{
  recipes: SavedRecipe[];
  onClose: () => void;
  onGoToMixer: () => void;
}> = ({ recipes, onClose, onGoToMixer }) => {
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h2>📋 我的混合配方</h2>
        {recipes.length === 0 ? (
          <p className="modal-body-text-announcement">还没有保存任何配方。前往色彩百科的混合器试试吧!</p>
        ) : (
          <div className="saved-recipes-list">
            {recipes.map((r, i) => (
              <div key={i} className="saved-recipe-item">
                <div className="saved-recipe-colors">
                  {r.colors.map((c, ci) => (
                    <span key={ci} className="saved-recipe-color-name">{c}</span>
                  )).reduce((acc: React.ReactNode[], el, ci) => {
                    if (ci > 0) acc.push(<span key={`plus-${ci}`} className="saved-recipe-plus">+</span>);
                    acc.push(el);
                    return acc;
                  }, [])}
                  <span className="saved-recipe-equal">=</span>
                  <span className="saved-recipe-swatch" style={{ background: r.rgb }} />
                </div>
                <div className="saved-recipe-info">
                  <span className="saved-recipe-result">{r.result}</span>
                  <span className="saved-recipe-rgb">{r.rgb}</span>
                </div>
                <span className="saved-recipe-date">{r.date}</span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions-sm">
          <button className="btn btn-primary btn-large" onClick={onClose}>关闭</button>
          <button className="btn btn-secondary" onClick={() => { onClose(); onGoToMixer(); }}>前往混合器</button>
        </div>
      </div>
    </div>
  );
};

// 首页弹窗集合：将签到奖励、公告、配方查看三个弹窗合并为一个懒加载组件
// 这样可以减少首屏 bundle 体积，这些弹窗仅在用户交互后才需要加载
const HomeModals: React.FC<{
  checkinReward: string | null;
  checkinStreak: number;
  announcements: Announcement[];
  savedRecipes: SavedRecipe[];
  showCheckinReward: boolean;
  showAnnouncements: boolean;
  showSavedRecipes: boolean;
  onCheckinRewardClose: () => void;
  onAnnouncementDismiss: (id: string) => void;
  onAnnouncementClose: () => void;
  onSavedRecipesClose: () => void;
  onGoToMixer: () => void;
}> = ({
  checkinReward, checkinStreak, announcements, savedRecipes,
  showCheckinReward, showAnnouncements, showSavedRecipes,
  onCheckinRewardClose, onAnnouncementDismiss, onAnnouncementClose,
  onSavedRecipesClose, onGoToMixer,
}) => {
  return (
    <>
      {showCheckinReward && (
        <CheckinRewardModal
          reward={checkinReward}
          streak={checkinStreak}
          onClose={onCheckinRewardClose}
        />
      )}
      {showAnnouncements && announcements.length > 0 && (
        <AnnouncementModal
          announcements={announcements}
          onDismiss={onAnnouncementDismiss}
          onClose={onAnnouncementClose}
        />
      )}
      {showSavedRecipes && (
        <SavedRecipesModal
          recipes={savedRecipes}
          onClose={onSavedRecipesClose}
          onGoToMixer={onGoToMixer}
        />
      )}
    </>
  );
};

export default HomeModals;
