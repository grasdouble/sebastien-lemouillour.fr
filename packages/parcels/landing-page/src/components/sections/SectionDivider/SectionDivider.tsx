import React, { useEffect, useRef } from 'react';

import styles from './SectionDivider.module.css';

const LINE_COUNT = 22;
const SPEED = 0.012;

export function SectionDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animationId = -1;
    let time = 0;
    let width = 0;
    let height = 0;
    let waveColor = '';

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      waveColor = getComputedStyle(canvas!).getPropertyValue('--wave-line-color').trim();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (let i = 0; i < LINE_COUNT; i++) {
        const t = i / (LINE_COUNT - 1);
        const baseY = height * (0.25 + t * 0.5);

        // Amplitude constant per line (not dependent on vertical position)
        const a1 = 14 + Math.sin(i * 0.9) * 8;
        const a2 = a1 * 0.45;
        const a3 = a1 * 0.2;

        // Brightness drives opacity, line width, and glow effect
        const brightness = (Math.sin(i * 1.1) + 1) / 2; // 0..1
        const isGlow = brightness > 0.8;

        ctx!.save();
        ctx!.globalAlpha = 0.2 + brightness * 0.75;
        ctx!.strokeStyle = waveColor;
        ctx!.lineWidth = 0.5 + brightness * 1.5;
        if (isGlow) {
          ctx!.shadowColor = waveColor;
          ctx!.shadowBlur = 10;
        }

        ctx!.beginPath();

        for (let x = 0; x <= width; x += 2) {
          const yOffset =
            a1 * Math.sin(x * 0.0035 + time + i * 0.22) +
            a2 * Math.sin(x * 0.008 - time * 0.65 + i * 0.14) +
            a3 * Math.sin(x * 0.015 + time * 0.4 + i * 0.35);

          if (x === 0) {
            ctx!.moveTo(x, baseY + yOffset);
          } else {
            ctx!.lineTo(x, baseY + yOffset);
          }
        }

        ctx!.stroke();
        ctx!.restore();
      }

      time += SPEED;
      animationId = requestAnimationFrame(draw);
    }

    resize();
    animationId = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      if (canvas) {
        waveColor = getComputedStyle(canvas).getPropertyValue('--wave-line-color').trim();
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={styles['section-divider']} />;
}
