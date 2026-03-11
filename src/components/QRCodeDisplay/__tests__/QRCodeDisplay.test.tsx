import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the qrcode library
const mockToCanvas = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock('qrcode', () => ({
  default: { toCanvas: mockToCanvas },
}));

import QRCodeDisplay from '../QRCodeDisplay';

beforeEach(() => {
  vi.clearAllMocks();
  mockToCanvas.mockResolvedValue(undefined);
});

describe('QRCodeDisplay', () => {
  it('renders a canvas element', () => {
    render(<QRCodeDisplay value="test-value" />);
    expect(screen.getByTestId('qr-code-canvas')).toBeTruthy();
  });

  it('calls QRCode.toCanvas with the provided value', async () => {
    render(<QRCodeDisplay value="hello-qr" />);
    await waitFor(() => {
      expect(mockToCanvas).toHaveBeenCalled();
    });
    const callArgs = mockToCanvas.mock.calls[0] as unknown[];
    const value = callArgs[1];
    const opts = callArgs[2] as { errorCorrectionLevel: string; width: number };
    expect(value).toBe('hello-qr');
    expect(opts.errorCorrectionLevel).toBe('H');
  });

  it('uses the provided size', async () => {
    render(<QRCodeDisplay value="x" size={128} />);
    await waitFor(() => expect(mockToCanvas).toHaveBeenCalled());
    const callArgs = mockToCanvas.mock.calls[0] as unknown[];
    const opts = callArgs[2] as { width: number };
    expect(opts.width).toBe(128);
  });

  it('defaults size to 256', async () => {
    render(<QRCodeDisplay value="x" />);
    await waitFor(() => expect(mockToCanvas).toHaveBeenCalled());
    const callArgs = mockToCanvas.mock.calls[0] as unknown[];
    const opts = callArgs[2] as { width: number };
    expect(opts.width).toBe(256);
  });

  it('shows error when QRCode.toCanvas rejects', async () => {
    mockToCanvas.mockRejectedValueOnce(new Error('Value too long'));
    render(<QRCodeDisplay value="bad-value" />);
    await waitFor(() => {
      expect(screen.getByTestId('qr-code-error')).toBeTruthy();
    });
    expect(screen.getByTestId('qr-code-error').textContent).toBe('Value too long');
  });

  it('shows a generic error message for non-Error rejections', async () => {
    mockToCanvas.mockRejectedValueOnce('oops');
    render(<QRCodeDisplay value="bad" />);
    await waitFor(() => {
      expect(screen.getByTestId('qr-code-error').textContent).toBe('QR generation failed');
    });
  });

  it('renders a canvas with aria-label', () => {
    render(<QRCodeDisplay value="x" label="My QR code" />);
    const canvas = screen.getByTestId('qr-code-canvas');
    expect(canvas.getAttribute('aria-label')).toBe('My QR code');
  });
});
