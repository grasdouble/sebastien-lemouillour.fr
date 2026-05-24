import { debounce, getThemeColor } from './utils';

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

  const resize = () => {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
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

  resize();
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
