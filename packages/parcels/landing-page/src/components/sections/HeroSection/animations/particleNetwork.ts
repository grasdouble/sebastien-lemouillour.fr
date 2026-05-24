import { getOpacityScale, getThemeColor } from './utils';

const CONNECTION_THRESHOLD = 130;
const PARTICLE_COUNT = 55;
const SPEED = 0.35;

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export function setupParticleNetwork(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let animId: number;
  let dots: Dot[] = [];
  let w = 0;
  let h = 0;
  let color = getThemeColor();
  let opacityScale = getOpacityScale();

  const updateTheme = () => {
    color = getThemeColor();
    opacityScale = getOpacityScale();
  };

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-mode'],
  });

  const resize = () => {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    dots.forEach((d) => {
      d.x = Math.min(d.x, w);
      d.y = Math.min(d.y, h);
    });
  };

  const init = () => {
    resize();
    dots = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.min(1, 0.25 * opacityScale);
      ctx.fill();
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_THRESHOLD) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.globalAlpha = Math.min(1, 0.07 * opacityScale * (1 - dist / CONNECTION_THRESHOLD));
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  init();
  draw();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
    themeObserver.disconnect();
    ctx.clearRect(0, 0, w, h);
  };
}
