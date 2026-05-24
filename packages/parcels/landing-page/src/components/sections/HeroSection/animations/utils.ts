export function getThemeColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--lufa-semantic-ui-text-primary').trim() || '#000'
  );
}

export function getOpacityScale(): number {
  return 1;
}
