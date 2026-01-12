import styles from './HomePage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';
import { CardProvider } from '../../context/CardContext';
import { useSearchParams } from 'react-router-dom';
import TodaysPlanBanner from '../../components/TodaysPlanBanner/TodaysPlanBanner';

const HomePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const cardSlug = searchParams.get('cardSlug') ?? undefined;

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main id="main-content" className={styles.content} tabIndex={-1}>
                <div className={styles.sidebar}>
                    <Sidebar />
                </div>
                <div className={styles.mainContent}>
                    <TodaysPlanBanner />
                    <CardProvider initialSlug={cardSlug}>
                        <CardTable />
                    </CardProvider>
                </div>
            </main>
        </div>
    );
};

export default HomePage;