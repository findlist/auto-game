import { useState, useCallback, useEffect } from 'react';
import type { ReplayData } from './replayShare';

// replayShare 模块改为动态导入，降低首屏 bundle 体积
const replayShareModule = () => import('./replayShare');

/**
 * 回放分享与查看 hook
 * 从 App.tsx 提取：
 * - handleReplayShare：生成回放链接并分享/复制到剪贴板
 * - viewReplayData/showViewReplay：从 URL 哈希解析回放数据并展示
 * - handleShare：生成战绩分享文案
 */
export function useReplayShare(
  showShareToast: () => void,
  endlessScore: number,
  timedScore: number,
  timedDuration: number,
) {
  // 回放查看状态（从 URL 哈希打开）
  const [viewReplayData, setViewReplayData] = useState<ReplayData | null>(null);
  const [showViewReplay, setShowViewReplay] = useState(false);

  // 初始化时检查 URL 是否携带回放数据
  useEffect(() => {
    replayShareModule().then(({ parseReplayFromUrl }) => {
      const replayData = parseReplayFromUrl();
      if (replayData) {
        setViewReplayData(replayData);
        setShowViewReplay(true);
      }
    });
  }, []);

  // 回放分享：生成回放链接和导出视频的处理
  const handleReplayShare = useCallback(async (
    moveHistory: Array<{ from: number; to: number }>,
    level: number,
    stars: number,
    stepsUsed: number,
  ) => {
    const { generateReplayUrl, formatReplayShareText } = await replayShareModule();
    const replayData: ReplayData = { level, moves: moveHistory, starRating: stars, stepsUsed };
    // 修复 P0:encodeReplay 在 from/to 越界(>=36)时会抛错,需捕获降级,避免 UI 崩溃
    let url = '';
    let text = '';
    try {
      url = generateReplayUrl(replayData);
      text = formatReplayShareText(replayData) + `\n${url}`;
    } catch (e) {
      // 编码失败(步骤索引越界),仅使用文案分享
      text = formatReplayShareText(replayData);
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: '色彩排序回放', text, url });
      } else {
        await navigator.clipboard.writeText(text);
        showShareToast();
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text);
        showShareToast();
      } catch (e2) { /* 忽略 */ }
    }
  }, [showShareToast]);

  // 战绩分享：根据游戏模式生成不同文案
  const handleShare = useCallback(async (moves: number, level: number) => {
    const text = level === -1
      ? `🎉《色彩排序》每日挑战只用${moves}步完成,来挑战这个关卡吧!👏`
      : level === -2
      ? `🎉《色彩排序》无尽模式连过${endlessScore + 1}关,来挑战吧!🔥🔥`
      : level === -3
      ? `🎉《色彩排序》限时模式${timedDuration}秒连过${timedScore + 1}关,来挑战吧!🔥🔥`
      : level === -4
      ? `🎉《色彩排序》本周周挑战只用${moves}步完成,来挑战吧!🏆`
      : `🎉《色彩排序》第${level}关只用${moves}步完成,来挑战吧!👏`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '色彩排序', text });
      } else {
        await navigator.clipboard.writeText(text);
        showShareToast();
      }
    } catch (e) {
      // 用户取消或分享失败,尝试备用方案
      try {
        await navigator.clipboard.writeText(text);
        showShareToast();
      } catch (e2) { /* 忽略 */ }
    }
  }, [endlessScore, timedScore, timedDuration, showShareToast]);

  // 关闭回放查看弹窗
  const handleCloseViewReplay = useCallback(() => {
    setShowViewReplay(false);
    setViewReplayData(null);
    window.location.hash = '';
  }, []);

  return {
    viewReplayData,
    showViewReplay,
    setShowViewReplay,
    setViewReplayData,
    handleReplayShare,
    handleShare,
    handleCloseViewReplay,
  };
}
