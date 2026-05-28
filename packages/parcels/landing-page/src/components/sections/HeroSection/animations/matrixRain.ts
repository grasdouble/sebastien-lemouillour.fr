import { getOpacityScale, getThemeColor } from './utils';

const CHARS = '<>/{}[]()=;:.#!|&*%$0123456789abcdefghijklmnopqrstuvwxyz';

const FONT_SIZE = 14;
const COL_WIDTH = 18;
const TRAIL_LEN = 22;

type MatrixColumn = {
  y: number;
  speed: number;
  chars: string[];
};

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export function setupMatrixRain(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let animId: number;
  let resizeTimer: ReturnType<typeof setTimeout>;
  let cols: MatrixColumn[] = [];
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

  const initCols = () => {
    const n = Math.ceil(w / COL_WIDTH);
    cols = Array.from({ length: n }, () => ({
      y: Math.random() * -h,
      speed: 1 + Math.random() * 1.5,
      chars: Array.from({ length: TRAIL_LEN }, randomChar),
    }));
  };

  // Accept explicit dimensions to avoid forced layout reflow when called from ResizeObserver
  const resize = (width: number, height: number) => {
    w = canvas.width = width;
    h = canvas.height = height;
    initCols();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.fillStyle = color;

    cols.forEach((col, i) => {
      const x = i * COL_WIDTH;

      col.chars.forEach((ch, j) => {
        const y = col.y - j * FONT_SIZE;
        if (y < 0 || y > h) return;

        const isHead = j === 0;
        ctx.globalAlpha = Math.min(
          1,
          isHead ? 0.45 * opacityScale : Math.max(0, 0.12 * opacityScale * (1 - j / TRAIL_LEN))
        );
        ctx.fillText(ch, x, y);
      });

      if (Math.random() < 0.08) {
        const idx = Math.floor(Math.random() * TRAIL_LEN);
        col.chars[idx] = randomChar();
      }

      col.y += col.speed;

      if (col.y > h + TRAIL_LEN * FONT_SIZE) {
        col.y = Math.random() * -200;
        col.speed = 1 + Math.random() * 1.5;
      }
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  // Defer the initial layout read to rAF to avoid forced reflow after React's commit phase
  const initRafId = requestAnimationFrame(() => {
    resize(canvas.offsetWidth, canvas.offsetHeight);
    draw();
  });

  // Use entries[0].contentRect (already computed by the browser) to avoid a second forced layout
  const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const { width, height } = entries[0].contentRect;
      resize(width, height);
    }, 50);
  });
  ro.observe(canvas);

  return () => {
    cancelAnimationFrame(initRafId);
    cancelAnimationFrame(animId);
    clearTimeout(resizeTimer);
    ro.disconnect();
    themeObserver.disconnect();
    ctx.clearRect(0, 0, w, h);
  };
}
