import { useState, useCallback, useEffect } from 'react';
import { getUnreadAnnouncements, markAnnouncementRead, Announcement } from './announcements';

/**
 * 公告系统 hook
 * 从 App.tsx 提取：公告状态管理、未读公告加载、公告关闭/已读标记
 */
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // 初始化：加载未读公告
  useEffect(() => {
    const unread = getUnreadAnnouncements();
    if (unread.length > 0) {
      setAnnouncements(unread);
      setShowAnnouncements(true);
    }
  }, []);

  // 关闭单条公告：标记已读，列表为空时自动关闭弹窗
  const handleDismissAnnouncement = useCallback((id: string) => {
    markAnnouncementRead(id);
    setAnnouncements(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length === 0) {
        setShowAnnouncements(false);
      }
      return filtered;
    });
  }, []);

  // 关闭整个公告弹窗（不标记已读）
  const handleCloseAnnouncements = useCallback(() => {
    setShowAnnouncements(false);
  }, []);

  // 一键跳过所有未读公告：全部标记为已读并关闭弹窗
  // 设计原因：原 UI 仅"知道了"按钮逐条关闭，用户以为点击无反应（实际在切换下一条）
  const handleSkipAllAnnouncements = useCallback(() => {
    setAnnouncements(prev => {
      // 标记当前所有未读公告为已读，避免下次进入再逐条弹出
      prev.forEach(a => markAnnouncementRead(a.id));
      return [];
    });
    setShowAnnouncements(false);
  }, []);

  return {
    announcements,
    showAnnouncements,
    handleDismissAnnouncement,
    handleCloseAnnouncements,
    handleSkipAllAnnouncements,
  };
}
