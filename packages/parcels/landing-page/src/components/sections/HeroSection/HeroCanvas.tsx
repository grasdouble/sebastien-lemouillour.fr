import React, { useEffect, useRef, useState } from 'react';

import { Cluster } from '@grasdouble/lufa_design-system';

import { setupFloatingTokens } from './animations/floatingTokens';
import { setupMatrixRain } from './animations/matrixRain';
import { setupParticleNetwork } from './animations/particleNetwork';
import styles from './HeroCanvas.module.css';

type AnimationType = 'tokens' | 'network' | 'matrix';

type AnimationConfig = {
  id: AnimationType;
  label: string;
  title: string;
  setup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => () => void;
};

const ANIMATIONS: AnimationConfig[] = [
  { id: 'tokens', label: '</>', title: 'Tokens flottants', setup: setupFloatingTokens },
  { id: 'network', label: '◎', title: 'Réseau de particules', setup: setupParticleNetwork },
  { id: 'matrix', label: '▓', title: 'Matrix', setup: setupMatrixRain },
];

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<AnimationType>('tokens');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initial sync, empty deps, no cascade risk
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = ANIMATIONS.find((a) => a.id === active);
    if (!config) return;

    return config.setup(canvas, ctx);
  }, [active, reducedMotion, isVisible]);

  if (reducedMotion) return null;

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.switcher}>
        <Cluster spacing="tight" align="center" role="group" aria-label="Style d'animation">
          {ANIMATIONS.map(({ id, label, title }) => (
            <button
              key={id}
              className={`${styles.switcherBtn}${active === id ? ` ${styles.switcherBtnActive}` : ''}`}
              onClick={() => setActive(id)}
              aria-pressed={active === id}
              aria-label={title}
              title={title}
            >
              {label}
            </button>
          ))}
        </Cluster>
      </div>
    </>
  );
}
