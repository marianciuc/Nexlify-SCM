import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QuantityInput } from './QuantityInput';

afterEach(cleanup);

describe('QuantityInput', () => {
  it('allows replacing a quantity and commits the integer on blur', () => {
    const onCommit = vi.fn();
    render(<QuantityInput value={20} minimum={5} label="Order quantity" onCommit={onCommit} />);
    const input = screen.getByRole('spinbutton', { name: 'Order quantity' });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: '17' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith(17);
  });

  it('clamps a quantity below the minimum to the minimum', () => {
    const onCommit = vi.fn();
    render(<QuantityInput value={20} minimum={5} label="Order quantity" onCommit={onCommit} />);
    const input = screen.getByRole('spinbutton', { name: 'Order quantity' });

    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith(5);
  });
});
