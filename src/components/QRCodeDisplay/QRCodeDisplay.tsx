/**
 * QRCodeDisplay — renders a string as a QR code on a <canvas>.
 *
 * Props:
 *   value   — the string to encode
 *   size    — pixel size of the canvas (default 256)
 *   label   — optional accessible label for screen-readers
 */
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styles from './QRCodeDisplay.module.css';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 256,
  label = 'QR code',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    setError(null);
    QRCode.toCanvas(canvasRef.current, value, {
      errorCorrectionLevel: 'H',
      width: size,
      margin: 2,
      color: {
        dark:  '#000000',
        light: '#ffffff',
      },
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'QR generation failed');
    });
  }, [value, size]);

  if (error) {
    return (
      <p className={styles.error} data-testid="qr-code-error">
        {error}
      </p>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label={label}
      className={`${styles.canvas} ${className ?? ''}`}
      data-testid="qr-code-canvas"
    />
  );
};

export default QRCodeDisplay;
