import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CallsignInput from '../CallsignInput';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CallsignInput', () => {
  it('renders with empty value by default', () => {
    render(<CallsignInput />);
    const input = screen.getByTestId('callsign-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders with initialValue', () => {
    render(<CallsignInput initialValue="Raven" />);
    const input = screen.getByTestId('callsign-input') as HTMLInputElement;
    expect(input.value).toBe('Raven');
  });

  it('calls onSave with trimmed value on blur', () => {
    const onSave = vi.fn();
    render(<CallsignInput initialValue="" onSave={onSave} />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.change(input, { target: { value: '  Ghost  ' } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledWith('Ghost');
  });

  it('calls onSave on Enter key', () => {
    const onSave = vi.fn();
    render(<CallsignInput initialValue="" onSave={onSave} />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.change(input, { target: { value: 'Falcon' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('Falcon');
  });

  it('does not call onSave if value unchanged', () => {
    const onSave = vi.fn();
    render(<CallsignInput initialValue="Alpha" onSave={onSave} />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('truncates value to 20 characters on commit', () => {
    const onSave = vi.fn();
    render(<CallsignInput initialValue="" onSave={onSave} />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.change(input, { target: { value: 'A'.repeat(25) } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledWith('A'.repeat(20));
  });

  it('shows character count', () => {
    render(<CallsignInput initialValue="Hey" />);
    expect(screen.getByText('3/20')).toBeTruthy();
  });

  it('shows saved indicator temporarily after commit', () => {
    const onSave = vi.fn();
    render(<CallsignInput initialValue="" onSave={onSave} />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.change(input, { target: { value: 'Nova' } });
    fireEvent.blur(input);

    const saved = screen.getByTestId('callsign-saved');
    expect(saved.className).toContain('saved');
    expect(saved.className).not.toContain('savedHidden');

    act(() => { vi.advanceTimersByTime(1600); });
    expect(saved.className).toContain('savedHidden');
  });

  it('displays label text', () => {
    render(<CallsignInput />);
    expect(screen.getByText('Callsign')).toBeTruthy();
  });

  it('updates when initialValue prop changes', () => {
    const { rerender } = render(<CallsignInput initialValue="Alpha" />);
    const input = screen.getByTestId('callsign-input') as HTMLInputElement;
    expect(input.value).toBe('Alpha');

    rerender(<CallsignInput initialValue="Bravo" />);
    expect(input.value).toBe('Bravo');
  });
});
