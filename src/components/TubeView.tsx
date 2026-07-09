import React from 'react';
import { Tube } from '../game/types';
import { COLORS } from '../game/types';

interface TubeViewProps {
  tube: Tube;
  index: number;
  isSelected: boolean;
  isHinted: boolean;
  isPouring?: boolean;
  isSettled?: boolean;
  onClick: (index: number) => void;
  onLongPress?: () => void;
}

export const TubeView: React.FC<TubeViewProps> = React.memo(({ tube, index, isSelected, isHinted, isPouring, isSettled, onClick, onLongPress }) => {
  const longPressTimer = React.useRef<number | null>(null);
  const longPressTriggered = React.useRef(false);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

  // 组件卸载时清理长按定时器，避免卸载后仍触发 onLongPress
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
  }, []);

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onLongPress) return;
    longPressTriggered.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      // 长按触觉反馈
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress();
    }, 500);
  };

  // 触摸移动（超过阈值则取消长按）
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressTimer.current) return;
    const touch = e.touches[0];
    const start = touchStartPos.current;
    if (start) {
      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // 如果长按已触发，阻止click事件
    if (longPressTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
      // 修复：延迟重置标志，避免同一触摸序列后续的鼠标点击被误拦截
      // （触摸结束后 click 事件紧随其后，需让本次 touchend 后的 click 被拦截）
      setTimeout(() => { longPressTriggered.current = false; }, 0);
    }
  };

  // 触摸取消
  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressTriggered.current = false;
  };
  const { layers, capacity } = tube;

  // 计算每层高度百分比
  const layerHeight = 100 / capacity;

  // 构建无障碍描述
  const colorNames: Record<string, string> = {
    red: '红', blue: '蓝', yellow: '黄', green: '绿',
    purple: '紫', orange: '橙', pink: '粉', cyan: '青',
    brown: '棕', gray: '灰',
  };
  const layerDesc = layers.length === 0
    ? '空试管'
    : `试管${index + 1}，从底到顶：${layers.map(l => colorNames[l.color] || l.color).join('、')}`;
  const ariaLabel = `${layerDesc}${isSelected ? '（已选中）' : ''}${isHinted ? '（提示）' : ''}`;

  return (
    <div
      className={`tube-container ${isSelected ? 'selected' : ''} ${isHinted ? 'hinted' : ''} ${isPouring ? 'pouring' : ''} ${isSettled ? 'tube-settled' : ''}`}
      onClick={() => {
        if (!longPressTriggered.current) {
          onClick(index);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(index);
        }
      }}
    >
      <div className="tube">
        <div className="tube-inner">
          {layers.map((layer, i) => (
            <div
              key={i}
              className="color-layer"
              style={{
                height: `${layerHeight}%`,
                backgroundColor: COLORS[layer.color] || layer.color,
                bottom: `${i * layerHeight}%`,
              }}
            />
          ))}
        </div>
        {/* 试管口 */}
        <div className="tube-mouth" />
      </div>
      <div className="tube-index">{index + 1}</div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较：只在关键props变化时重渲染
  return (
    prevProps.tube === nextProps.tube &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHinted === nextProps.isHinted &&
    prevProps.isPouring === nextProps.isPouring &&
    prevProps.isSettled === nextProps.isSettled &&
    prevProps.index === nextProps.index &&
    prevProps.onLongPress === nextProps.onLongPress
  );
});
