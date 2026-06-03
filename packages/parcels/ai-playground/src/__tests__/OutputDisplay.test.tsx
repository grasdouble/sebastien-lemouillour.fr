import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OutputDisplay } from '../components/OutputDisplay';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

beforeEach(() => {
  // Mock clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
  });
});

afterEach(() => {
  cleanup();
});

describe('OutputDisplay', () => {
  it('renders output text', () => {
    const { getByText } = render(<OutputDisplay output="Test output" />);
    expect(getByText('Test output')).toBeDefined();
  });

  it('shows empty state when no output', () => {
    const { getByText } = render(<OutputDisplay output="" />);
    expect(getByText('playground.output.empty')).toBeDefined();
  });

  it('shows streaming indicator when streaming', () => {
    const { getByText } = render(<OutputDisplay output="" isStreaming />);
    expect(getByText('playground.output.streaming')).toBeDefined();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    const { getByText } = render(<OutputDisplay output="Text" onClear={onClear} />);

    const clearButton = getByText('playground.output.clear');
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });
});
