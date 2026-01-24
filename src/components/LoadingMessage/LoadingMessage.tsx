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
    <div className={styles['loading-container']}>
      <h1 className={styles['title']}>Personal Training Bot</h1> {/* Add this line */}
      <div className={styles.spinner}></div>
      <div className={styles['loading-text-container']}>
        <div className={styles['loading-text']}>App Loading<span className={styles['loading-dots']}>{dots}</span></div>
      </div>
      <div className={styles['line-space']}></div> {/* Add this line */}
      <div className={styles['loading-bar-top']}>
        <div
          className={styles['loading-bar-progress']}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className={styles['loading-bar-bottom']}>
        <div className={styles['loading-bar-animation']}></div>
      </div>
    </div>
  );
};

export default LoadingMessage;
