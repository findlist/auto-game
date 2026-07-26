// 回放视频导出 hook — 从 App.tsx 提取
// 管理回放视频生成、缩略图、弹窗状态
// 设计原因：视频导出逻辑涉及异步操作和多个状态，独立为 hook 降低 App.tsx 复杂度

import { useState, useCallback } from 'react';
import type { Tube } from './types';

// 回放视频模块动态导入（降低首屏 bundle 体积）
const replayVideoModule = () => import('./replayVideo');

export interface ReplayVideoState {
  showReplayVideoModal: boolean;
  replayVideoUrl: string;
  replayThumbnail: string;
  generatingVideo: boolean;
}

/**
 * 回放视频导出 hook
 */
export function useReplayVideo() {
  const [showReplayVideoModal, setShowReplayVideoModal] = useState(false);
  const [replayVideoUrl, setReplayVideoUrl] = useState('');
  const [replayThumbnail, setReplayThumbnail] = useState('');
  const [generatingVideo, setGeneratingVideo] = useState(false);

  // 导出回放视频
  const handleExportReplayVideo = useCallback(async (
    moveHistory: Array<{ from: number; to: number }>,
    levelData: { tubes: Tube[]; tubeCapacity: number },
    level: number,
    stars: number,
    stepsUsed: number,
  ) => {
    setGeneratingVideo(true);
    setShowReplayVideoModal(true);
    try {
      const { generateReplayVideo, generateReplayThumbnail } = await replayVideoModule();
      // 先生成缩略图
      const thumb = generateReplayThumbnail({
        tubes: levelData.tubes,
        moves: moveHistory,
        level,
        stars,
        stepsUsed,
      });
      setReplayThumbnail(thumb);

      // 生成视频
      const url = await generateReplayVideo({
        tubes: levelData.tubes,
        moves: moveHistory,
        level,
        stars,
        stepsUsed,
      });
      setReplayVideoUrl(url);
    } catch (e) {
      // 视频生成失败时至少展示缩略图
      try {
        const { generateReplayThumbnail } = await replayVideoModule();
        const thumb = generateReplayThumbnail({
          tubes: levelData.tubes,
          moves: moveHistory,
          level,
          stars,
          stepsUsed,
        });
        setReplayThumbnail(thumb);
      } catch (e2) { /* 缩略图也失败，仅显示占位 */ }
    }
    setGeneratingVideo(false);
  }, []);

  return {
    // 状态
    showReplayVideoModal,
    replayVideoUrl,
    replayThumbnail,
    generatingVideo,
    // 状态设置器
    setShowReplayVideoModal,
    setReplayVideoUrl,
    // 动作
    handleExportReplayVideo,
  };
}
