import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ParametersPanel } from '../components/ParametersPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe('ParametersPanel', () => {
  it('renders all parameter controls', () => {
    const { getAllByRole } = render(<ParametersPanel config={{}} onChange={vi.fn()} />);

    const sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(2); // temperature and topP

    const numberInputs = getAllByRole('spinbutton');
    expect(numberInputs).toHaveLength(1); // maxTokens
  });

  it('calls onChange when temperature changes', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(<ParametersPanel config={{ temperature: 0.7 }} onChange={onChange} />);

    const temperatureSlider = getAllByRole('slider')[0];
    fireEvent.change(temperatureSlider, { target: { value: '0.9' } });

    expect(onChange).toHaveBeenCalledWith({ temperature: 0.9 });
  });

  it('displays current values', () => {
    const { getByText } = render(<ParametersPanel config={{ temperature: 1.2, topP: 0.85 }} onChange={vi.fn()} />);

    expect(getByText('1.2')).toBeDefined();
    expect(getByText('0.85')).toBeDefined();
  });
});
