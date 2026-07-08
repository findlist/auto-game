import React, { useEffect, useRef } from 'react';

// 粒子效果 - 通关时触发的彩色粒子爆炸（增强版：含彩纸+emoji）
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: 'circle' | 'rect' | 'emoji';
  emoji?: string;
  rotation: number;
  rotSpeed: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#C589E8', '#FFA07A'];
const CONFETTI_EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟', '💫'];

export const ParticleEffect: React.FC<ParticleEffectProps> = ({ trigger, colors = DEFAULT_COLORS }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 从屏幕中心和两侧生成粒子
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 3 + Math.random() * 7;
      const life = 60 + Math.random() * 50;
      const shapeRoll = Math.random();
      let shape: 'circle' | 'rect' | 'emoji' = 'circle';
      let emoji: string | undefined;
      if (shapeRoll < 0.5) {
        shape = 'rect'; // 彩纸条
      } else if (shapeRoll < 0.7) {
        shape = 'emoji';
        emoji = CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)];
      }

      // 部分粒子从两侧底部射出
      const fromSide = Math.random() < 0.3;
      const startX = fromSide ? (Math.random() < 0.5 ? 0 : canvas.width) : cx;
      const startY = fromSide ? canvas.height : cy;
      const dirX = fromSide ? (startX === 0 ? 1 : -1) * (2 + Math.random() * 4) : Math.cos(angle) * speed;
      const dirY = fromSide ? -(8 + Math.random() * 6) : Math.sin(angle) * speed - 2;

      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: dirX,
        vy: dirY,
        life: life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        shape,
        emoji,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // 重力
        p.vx *= 0.99; // 空气阻力
        p.life--;
        p.rotation += p.rotSpeed;

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;

        if (p.shape === 'emoji' && p.emoji) {
          ctx.font = `${p.size * 4}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, p.x, p.y);
        } else if (p.shape === 'rect') {
          // 旋转彩纸条
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
          ctx.restore();
        } else {
          // 圆形粒子
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();

          // 拖尾效果
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x - p.vx, p.y - p.vy, p.size * alpha * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
      particlesRef.current = [];
    };
  }, [trigger, colors]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 150,
      }}
      aria-hidden="true"
    />
  );
};
