export function getThemeColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--lufa-semantic-ui-text-primary').trim() || '#000'
  );
}

export function getOpacityScale(): number {
  return 1;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
