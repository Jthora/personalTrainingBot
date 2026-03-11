import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockJsQR = vi.hoisted(() => vi.fn(() => null));

vi.mock('jsqr', () => ({ default: mockJsQR }));

const makeFakeStream = () => ({
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
});

const mockGetUserMedia = vi.hoisted(() => vi.fn());

// Patch navigator.mediaDevices before tests
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true,
});

// Make requestAnimationFrame synchronous (calls once then stops)
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;
let rafCallbacks: FrameRequestCallback[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  rafCallbacks = [];
  global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  }) as unknown as typeof requestAnimationFrame;
  global.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
});

import QRCodeScanner from '../QRCodeScanner';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('QRCodeScanner', () => {
  describe('camera access denied', () => {
    it('shows error and calls onError when permission is denied', async () => {
      const denied = Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' });
      mockGetUserMedia.mockRejectedValueOnce(denied);
      const onError = vi.fn();

      render(<QRCodeScanner onScan={vi.fn()} onError={onError} />);

      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner-error')).toBeTruthy();
      });
      expect(screen.getByTestId('qr-scanner-error').textContent).toBe('Camera access denied');
      expect(onError).toHaveBeenCalledWith('Camera access denied');
    });

    it('shows generic error message for other getUserMedia failures', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Device busy'));
      const onError = vi.fn();

      render(<QRCodeScanner onScan={vi.fn()} onError={onError} />);

      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner-error')).toBeTruthy();
      });
      expect(screen.getByTestId('qr-scanner-error').textContent).toBe('Device busy');
      expect(onError).toHaveBeenCalledWith('Device busy');
    });

    it('does not call onScan when camera fails', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('No camera'));
      const onScan = vi.fn();

      render(<QRCodeScanner onScan={onScan} />);

      await waitFor(() => screen.getByTestId('qr-scanner-error'));
      expect(onScan).not.toHaveBeenCalled();
    });
  });

  describe('camera access granted', () => {
    it('renders the video element when camera access succeeds', async () => {
      mockGetUserMedia.mockResolvedValueOnce(makeFakeStream());

      render(<QRCodeScanner onScan={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner-video')).toBeTruthy();
      });
    });

    it('calls onScan when jsQR finds a code', async () => {
      const fakeStream = makeFakeStream();
      mockGetUserMedia.mockResolvedValueOnce(fakeStream);
      const onScan = vi.fn();

      mockJsQR.mockReturnValue({ data: '{"keypair":{"pub":"abc"}}' } as unknown as null);

      // Mock canvas context
      const mockCtx = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      };
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as any;

      render(<QRCodeScanner onScan={onScan} />);

      // Wait for getUserMedia to resolve, then flush pending RAF callbacks
      await act(async () => {
        await Promise.resolve(); // let getUserMedia .then() run
      });

      // Patch video.readyState to simulate loaded video then flush RAF
      await act(async () => {
        const video = screen.getByTestId('qr-scanner-video') as HTMLVideoElement;
        Object.defineProperty(video, 'readyState', { value: 4, configurable: true });
        Object.defineProperty(video, 'videoWidth',  { value: 1, configurable: true });
        Object.defineProperty(video, 'videoHeight', { value: 1, configurable: true });
        // Fire pending RAF callbacks
        const pending = [...rafCallbacks];
        rafCallbacks = [];
        pending.forEach((cb) => cb(0));
      });

      expect(onScan).toHaveBeenCalledWith('{"keypair":{"pub":"abc"}}');
      expect(fakeStream.getTracks).toHaveBeenCalled();

      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });
});
