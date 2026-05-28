import React, { useEffect, useRef, useState } from 'react';

import { Cluster } from '@grasdouble/lufa_design-system';

import styles from './HeroCanvas.module.css';

type AnimationType = 'tokens' | 'network' | 'matrix';

type AnimationConfig = {
  id: AnimationType;
  label: string;
  title: string;
};

const ANIMATIONS: AnimationConfig[] = [
  { id: 'tokens', label: '</>', title: 'Tokens flottants' },
  { id: 'network', label: '◎', title: 'Réseau de particules' },
  { id: 'matrix', label: '▓', title: 'Matrix' },
];

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<AnimationType>('tokens');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Read the user's motion preference once on mount, then keep it in sync
  // when the OS setting changes (e.g. user toggles "Reduce Motion").
  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Initial sync: matchMedia is only available client-side, so we read the
    // current state here instead of during render to avoid SSR/hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initial sync, empty deps, no cascade risk
    setReducedMotion(motionMq.matches);
    setHasMounted(true);

    // Keep state in sync when the user changes their OS preference.
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionMq.addEventListener('change', motionHandler);

    // Remove listener on unmount to avoid memory leaks.
    return () => {
      motionMq.removeEventListener('change', motionHandler);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(canvas);
    return () => io.disconnect();
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    if (reducedMotion || !isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const loadAndStart = async () => {
      let setup: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => () => void;

      switch (active) {
        case 'tokens':
          setup = (await import('./animations/floatingTokens')).setupFloatingTokens;
          break;
        case 'network':
          setup = (await import('./animations/particleNetwork')).setupParticleNetwork;
          break;
        case 'matrix':
          setup = (await import('./animations/matrixRain')).setupMatrixRain;
          break;
        default:
          return;
      }

      if (cancelled) return;
      cleanup = setup(canvas, ctx);
    };

    void loadAndStart();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [active, reducedMotion, isVisible, hasMounted]);

  if (!hasMounted || reducedMotion) return null;

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
