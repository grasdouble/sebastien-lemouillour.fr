import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptEditor } from '../components/PromptEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('PromptEditor', () => {
  it('renders textarea with value', () => {
    const { getByRole } = render(<PromptEditor value="Test prompt" onChange={vi.fn()} />);

    const textarea = getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Test prompt');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<PromptEditor value="" onChange={onChange} />);

    const textarea = getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('disables textarea when disabled prop is true', () => {
    const { getByRole } = render(<PromptEditor value="" onChange={vi.fn()} disabled />);

    const textarea = getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });
});
