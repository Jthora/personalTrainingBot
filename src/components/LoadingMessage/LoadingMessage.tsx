import { useEffect, useState } from 'react';
import styles from './LoadingMessage.module.css';

interface LoadingMessageProps {
  progress: number;
}

function getStageLabel(progress: number): string {
  if (progress < 10) return 'Initializing systems';
  if (progress < 40) return 'Restoring cached data';
  if (progress < 70) return 'Loading training modules';
  if (progress < 95) return 'Preparing interface';
  return 'Systems online';
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ progress }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const stageLabel = getStageLabel(progress);

  return (
    <div className={styles.loadingContainer} aria-label="Loading application">
      <h1 className={styles.title}>Starcom Academy</h1>
      <div className={styles.spinner}></div>
      <div className={styles.loadingTextContainer}>
        <div className={styles.loadingText}>{stageLabel}<span className={styles.loadingDots}>{dots}</span></div>
      </div>
      <div className={styles.lineSpace}></div>
      <div
        className={styles.loadingBarTop}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.loadingBarProgress}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className={styles.loadingBarBottom}>
        <div className={styles.loadingBarAnimation}></div>
      </div>
    </div>
  );
};

export default LoadingMessage;
