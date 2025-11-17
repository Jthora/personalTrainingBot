import React from 'react';
import styles from './CoachSelector.module.css';
import { coaches } from '../../data/coaches';
import { useCoachSelection } from '../../hooks/useCoachSelection';

const CoachSelector: React.FC = () => {
    const { coachId: selectedCoach, setCoachId } = useCoachSelection();

    const handleCoachSelect = (coach: string) => {
        setCoachId(coach);
    };

    const selectedCoachData = coaches.find(coach => coach.id === selectedCoach);

    return (
        <div>
            <div className={styles.coachSelector}>
                <div>
                    <h2 className={styles.coachTitle}>Coach Select</h2>
                    <div className={styles.coachList}>
                        {coaches.map(coach => (
                            <button
                                key={coach.id}
                                className={`${styles.coachButton} ${selectedCoach === coach.id ? styles.selected : ''}`}
                                onClick={() => handleCoachSelect(coach.id)}
                            >
                                <h4 className={styles.coachName}>{coach.name}</h4>
                                <img src={coach.icon} alt={coach.name} className={styles.coachIcon} />
                            </button>
                        ))}
                    </div>
                </div>
                {selectedCoachData && (
                    <div className={styles.coachDetails}>
                        <div className={styles.coachHeader}>
                            <div className={styles.coachAdditionalDetails}>
                                <img src={selectedCoachData.icon} alt={selectedCoachData.name} className={styles.coachLargeIcon} />
                                <ul>
                                    {Object.entries(selectedCoachData.additionalDetails).map(([key, value], index) => (
                                        <li key={index}>
                                            <strong>{key}</strong>
                                            <p><i>{value}</i></p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h1>{selectedCoachData.name}</h1>
                                <div className={styles.coachInfo}>
                                    <p className={styles.coachDescription}>{selectedCoachData.description}</p>
                                    <p className={styles.coachPersonality}><strong>Personality:</strong> {selectedCoachData.personality}</p>
                                    <ul className={styles.coachSpecializations}>
                                        {Object.entries(selectedCoachData.specializations).map(([key, value], index) => (
                                            <li key={index}><strong>{key}</strong><ul><li>{value}</li></ul></li>
                                        ))}
                                    </ul>
                                    <ul className={styles.coachTraits}>
                                        {Object.entries(selectedCoachData.traits).map(([key, value], index) => (
                                            <li key={index}><strong>{key}</strong><ul><li>{value}</li></ul></li>
                                        ))}
                                    </ul>
                                    {selectedCoach === 'jono_thora' && (
                                        <a href="https://wiki.fusiongirl.app/index.php?title=Jono_Tho%27ra" target="_blank" rel="noopener noreferrer">
                                            Learn more about Jono Tho'ra
                                        </a>
                                    )}
                                    {selectedCoach === 'tara_van_dekar' && (
                                        <a href="https://wiki.fusiongirl.app/index.php?title=Tara_Van_Dekar" target="_blank" rel="noopener noreferrer">
                                            Learn more about Tara Van Dekar
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachSelector;