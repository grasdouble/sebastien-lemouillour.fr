import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

import { getMermaidThemeVariables } from './getMermaidThemeVariables';
import styles from './MermaidBlock.module.css';
import { useDSThemeKey } from './useDSThemeKey';

type MermaidBlockProps = { chart: string };

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-z0-9]/gi, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const themeKey = useDSThemeKey();

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'strict',
      fontSize: 18,
      themeVariables: getMermaidThemeVariables(),
    });

    mermaid
      .render(diagramId, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSvg(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [diagramId, chart, themeKey]);

  if (svg) {
    return (
      <div
        data-testid="mermaid-block"
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
        aria-label="Diagram"
        className={styles['mermaid-container']}
      />
    );
  }

  return (
    <pre
      data-testid="mermaid-block"
      aria-busy={!error}
      aria-label={error ? 'Diagram (error)' : 'Diagram (loading)'}
      className={styles['mermaid-container']}
    >
      {chart}
    </pre>
  );
}
