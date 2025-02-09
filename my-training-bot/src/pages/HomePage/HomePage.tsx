import styles from './HomePage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';

const HomePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.content}>
                <Sidebar />
                <CardTable />
            </div>
        </div>
    );
};

export default HomePage;