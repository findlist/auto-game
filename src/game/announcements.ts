// 游戏内公告系统
// 管理游戏公告、活动通知，支持本地标记已读

const ANNOUNCEMENTS_KEY = 'color-sort-announcements-read';

export interface Announcement {
  id: string;
  type: 'info' | 'event' | 'update' | 'tip';
  title: string;
  content: string;
  icon: string;
  createdAt: number;
  dismissible?: boolean;
}

// 获取当前有效公告列表
export function getActiveAnnouncements(): Announcement[] {
  const now = Date.now();
  const all: Announcement[] = [
    {
      id: 'welcome_v112',
      type: 'info',
      title: '欢迎使用色彩排序',
      content: '100关闯关模式、每日挑战、无尽模式、限时挑战，总有一种适合你！',
      icon: '🎨',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'tip_stars',
      type: 'tip',
      title: '追求三星通关',
      content: '步数越少星级越高！对比最优步数，挑战自己的最佳记录。',
      icon: '⭐',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'tip_checkin',
      type: 'tip',
      title: '每日签到领道具',
      content: '每天签到可获得提示道具，连续签到还有额外奖励！',
      icon: '📅',
      createdAt: now,
      dismissible: true,
    },
    {
      id: 'feature_editor',
      type: 'update',
      title: '新增关卡编辑器',
      content: '现在你可以自创关卡并分享给好友！前往设置页试试吧。',
      icon: '🛠️',
      createdAt: now,
      dismissible: true,
    },
  ];
  return all;
}

// 获取已读公告ID列表
function getReadIds(): Set<string> {
  try {
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (data) return new Set(JSON.parse(data));
  } catch (e) { /* 忽略 */ }
  return new Set();
}

// 标记公告为已读
export function markAnnouncementRead(id: string): void {
  try {
    const readIds = getReadIds();
    readIds.add(id);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify([...readIds]));
  } catch (e) { /* 忽略 */ }
}

// 获取未读公告
export function getUnreadAnnouncements(): Announcement[] {
  const readIds = getReadIds();
  return getActiveAnnouncements().filter(a => !readIds.has(a.id));
}

// 获取所有公告（含已读状态）
export function getAllAnnouncementsWithStatus(): Array<Announcement & { isRead: boolean }> {
  const readIds = getReadIds();
  return getActiveAnnouncements().map(a => ({ ...a, isRead: readIds.has(a.id) }));
}
