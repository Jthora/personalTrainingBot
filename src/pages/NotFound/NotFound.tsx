import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => (
  <div className={styles.container} role="main">
    <div className={styles.card}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Sector Not Found</h1>
      <p className={styles.message}>
        The coordinates you entered don't match any known sector.
        Return to base to continue your mission.
      </p>
      <Link to="/train" className={styles.homeLink}>
        Return to Base
      </Link>
    </div>
  </div>
);

export default NotFound;
