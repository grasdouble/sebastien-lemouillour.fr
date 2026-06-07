import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getImageUrl } from '../../../../../getImageUrl';
import { debounce, getOpacityScale, getThemeColor } from '../utils';

describe('animations utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.style.removeProperty('--lufa-semantic-ui-text-primary');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.style.removeProperty('--lufa-semantic-ui-text-primary');
  });

  it('always returns 1 for the opacity scale', () => {
    expect(getOpacityScale()).toBe(1);
  });

  it('returns a non-empty theme color when the css variable is set', () => {
    document.documentElement.style.setProperty('--lufa-semantic-ui-text-primary', '#123456');

    expect(getThemeColor()).toBe('#123456');
  });

  it('falls back to #000 when the css variable is empty', () => {
    expect(getThemeColor()).toBe('#000');
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('payload');

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledWith('payload');
  });

  it('resets the timer when called repeatedly', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('first');
    vi.advanceTimersByTime(150);
    debounced('second');
    vi.advanceTimersByTime(199);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('calls the function after the delay with the latest arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('value', 42);
    vi.runAllTimers();

    expect(fn).toHaveBeenCalledWith('value', 42);
  });

  it('returns an asset URL for the requested image', () => {
    expect(getImageUrl('diorama')).toContain('diorama');
  });
});
