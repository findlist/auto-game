// 分享图片弹窗组件
// 从 GameBoard 拆分：展示生成的战绩图，支持保存和直接分享
import React, { useRef } from 'react';
import { dataURLToBlob } from '../game/shareImage';

interface ShareImageModalProps {
  /** 战绩图的 data URL */
  imageUrl: string;
  /** 关闭弹窗的回调 */
  onClose: () => void;
}

export const ShareImageModal: React.FC<ShareImageModalProps> = ({ imageUrl, onClose }) => {
  const shareImageRef = useRef<HTMLAnchorElement | null>(null);

  // 直接分享：优先使用 navigator.share，降级到剪贴板
  const handleShare = async () => {
    const blob = dataURLToBlob(imageUrl);
    if (blob && navigator.share) {
      try {
        const file = new File([blob], 'color-sort-score.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: '色彩排序战绩', text: '看看我在色彩排序的成绩！' });
      } catch (e) { /* 用户取消 */ }
    } else {
      // 降级：复制图片到剪贴板
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob! })]);
        alert('图片已复制到剪贴板！');
      } catch (e2) {
        alert('请长按图片保存，或点击"保存图片"下载。');
      }
    }
  };

  return (
    <div className="share-image-overlay" onClick={onClose}>
      <div className="share-image-card" onClick={(e) => e.stopPropagation()}>
        <h3>战绩图已生成</h3>
        <img src={imageUrl} alt="战绩图" className="share-image-preview" />
        <div className="share-image-actions">
          <a
            ref={shareImageRef}
            href={imageUrl}
            download="color-sort-score.png"
            className="btn btn-primary"
          >💾 保存图片</a>
          <button className="btn btn-secondary" onClick={handleShare}>📤 直接分享</button>
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};
