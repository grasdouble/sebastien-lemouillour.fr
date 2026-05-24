import { debounce, getOpacityScale, getThemeColor } from './utils';

const CONNECTION_THRESHOLD = 130;
const CONNECTION_THRESHOLD_SQ = CONNECTION_THRESHOLD * CONNECTION_THRESHOLD;
const PARTICLE_COUNT = 55;
const SPEED = 0.35;
const CONNECTION_BUCKETS = 5;

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

    // Batch all dots into a single fill call (same color & opacity)
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.min(1, 0.25 * opacityScale);
    ctx.beginPath();
    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      ctx.moveTo(d.x + 1.5, d.y);
      ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
    });
    ctx.fill();

    // Batch connections by opacity bucket to minimise stroke() calls
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;

    const bucketPaths: Path2D[] = Array.from({ length: CONNECTION_BUCKETS }, () => new Path2D());

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONNECTION_THRESHOLD_SQ) {
          const dist = Math.sqrt(distSq);
          const ratio = 1 - dist / CONNECTION_THRESHOLD;
          const bucket = Math.min(CONNECTION_BUCKETS - 1, Math.floor(ratio * CONNECTION_BUCKETS));
          const path = bucketPaths[bucket];
          path.moveTo(dots[i].x, dots[i].y);
          path.lineTo(dots[j].x, dots[j].y);
        }
      }
    }

    bucketPaths.forEach((path, b) => {
      const ratio = (b + 0.5) / CONNECTION_BUCKETS;
      ctx.globalAlpha = Math.min(1, 0.07 * opacityScale * ratio);
      ctx.stroke(path);
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  init();
  draw();

  const ro = new ResizeObserver(debounce(resize, 50));
  ro.observe(canvas);

  return () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
    themeObserver.disconnect();
    ctx.clearRect(0, 0, w, h);
  };
}
