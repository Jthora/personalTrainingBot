/**
 * QRCodeScanner — accesses the device camera and decodes QR codes in real time.
 *
 * Uses requestAnimationFrame to pull frames from a video element into an
 * off-screen canvas, then runs jsQR on the resulting ImageData. Stops as
 * soon as a code is found.
 *
 * Props:
 *   onScan   — called once with the decoded string
 *   onError  — optional: called if camera access fails
 */
import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import styles from './QRCodeScanner.module.css';

interface QRCodeScannerProps {
  onScan: (value: string) => void;
  onError?: (message: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onError }) => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const doneRef   = useRef(false);

  // Stable refs so the RAF loop always calls the latest callbacks
  // without needing to restart the camera stream.
  const onScanRef  = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current  = onScan;
  onErrorRef.current = onError;

  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    doneRef.current = false;

    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    const tick = () => {
      if (doneRef.current) return;
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        doneRef.current = true;
        stop();
        onScanRef.current(code.data);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (doneRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()?.catch(() => {/* ignore autoplay quirks */});
        }
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? (err.name === 'NotAllowedError' ? 'Camera access denied' : err.message)
            : 'Camera unavailable';
        setCameraError(msg);
        onErrorRef.current?.(msg);
      });

    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cameraError) {
    return (
      <p className={styles.error} data-testid="qr-scanner-error">
        {cameraError}
      </p>
    );
  }

  return (
    <div className={styles.wrapper} data-testid="qr-scanner-wrapper">
      <video
        ref={videoRef}
        className={styles.video}
        muted
        playsInline
        data-testid="qr-scanner-video"
      />
      {/* Off-screen canvas used for frame analysis — not visible */}
      <canvas ref={canvasRef} className={styles.hiddenCanvas} />
    </div>
  );
};

export default QRCodeScanner;
