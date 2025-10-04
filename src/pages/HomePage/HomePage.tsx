import styles from './HomePage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';
import { CardProvider } from '../../context/CardContext';
import { WorkoutScheduleProvider } from '../../context/WorkoutScheduleContext';
import { useSearchParams } from 'react-router-dom';

const HomePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const cardSlug = searchParams.get('cardSlug') ?? undefined;

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.content}>
                <WorkoutScheduleProvider>
                    <Sidebar />
                </WorkoutScheduleProvider>
                <CardProvider initialSlug={cardSlug}>
                    <CardTable />
                </CardProvider>
            </div>
        </div>
    );
};

export default HomePage;