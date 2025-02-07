import styles from './HomePage.module.css';
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';

const HomePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <nav className={styles.nav}>
                <Link to="/">Home</Link> | <Link to="/training-sequence">Training Sequence</Link> | <Link to="/settings">Settings</Link> | <Link to="/schedule">Schedule</Link>
            </nav>
            <div className={styles.content}>
                <Sidebar />
                <CardTable />
            </div>
        </div>
    );
};

export default HomePage;