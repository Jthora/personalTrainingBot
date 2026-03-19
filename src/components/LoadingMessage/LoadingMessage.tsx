import { useEffect, useState } from 'react';
import styles from './LoadingMessage.module.css'; // Import the CSS module

interface LoadingMessageProps {
  progress: number; // Add progress prop
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ progress }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <h1 className={styles.title}>Starcom Academy</h1>
      <div className={styles.spinner}></div>
      <div className={styles.loadingTextContainer}>
        <div className={styles.loadingText}>App Loading<span className={styles.loadingDots}>{dots}</span></div>
      </div>
      <div className={styles.lineSpace}></div> {/* Add this line */}
      <div className={styles.loadingBarTop}>
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
