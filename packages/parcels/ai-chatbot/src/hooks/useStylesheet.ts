import { useEffect } from 'react';

/**
 * Injects a stylesheet link into the document head.
 * Removes the link when the component unmounts (cleanup).
 */
export function useStylesheet(href: string) {
  useEffect(() => {
    // Check if already loaded
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount
      link.remove();
    };
  }, [href]);
}
