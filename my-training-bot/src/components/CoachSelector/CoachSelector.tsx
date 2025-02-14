import React, { useState, useEffect } from 'react';
import styles from './CoachSelector.module.css';
import tigerIcon from '../../assets/images/icons/coaches/tiger_fitness_god-icon.png';
import jonoIcon from '../../assets/images/icons/coaches/jono_thora-icon.png';
import taraIcon from '../../assets/images/icons/coaches/tara_van_dekar-icon.png';
import simonIcon from '../../assets/images/icons/coaches/agent_simon-icon.png';

const coaches = [
    {
        id: 'tiger_fitness_god',
        name: 'Tiger Fitness God',
        description: 'The God of Tiger Fitness is a fierce and relentless coach, known for his powerful presence and unwavering determination.',
        icon: tigerIcon,
        personality: 'Ferocious Motivator, Master of Primal Strength, Unbreakable Warrior Spirit.',
        traits: {
            'Brutally Honest & Uncompromising': 'No sugarcoating, no weakness, only results.',
            'Intensely Motivational': 'Pushes warriors beyond their limits with pure aggression and unwavering belief.',
            'Peak Physicality': 'The living embodiment of raw strength, endurance, and primal combat.'
        },
        specializations: {
            'Primal Combat Training': 'A training regimen that turns warriors into unstoppable predators.',
            'Pain Endurance & Mental Fortitude': 'Teaches students to embrace suffering as the path to ultimate strength.',
            'Alpha Presence': 'Commands respect through sheer dominance, making him a leader on any battlefield.'
        },
        additionalDetails: {
            'Years of Experience': 'Forever!',
            'Favorite Quote': '"Strength is the product of struggle."',
            'Training Philosophy': '"Embrace the pain, for it is the path to greatness."'
        }
    },
    {
        id: 'jono_thora',
        name: 'Jono Tho\'ra',
        description: 'Jono Tho\'ra is the Cosmic Fusion Coach, a master of energy flow, resilience, and mind-over-matter training.',
        icon: jonoIcon,
        personality: 'Techie Super Hero Trainer, Cybernetic Raver Warrior, Master of Quantum Flow.',
        traits: {
            'Hyperintelligent & Adaptive': 'Sees the world through patterns, probability, and flow states.',
            'Cybernetic & Strategic': 'Masters technology, hacking, and quantum combat techniques.',
            'Rhythm & Combat Synergy': 'Moves like a dancer, fights like a tactician, commands like a hacker.'
        },
        specializations: {
            'Fusion Combat Mastery': 'Blends martial arts, psionics, and tech-enhanced agility for fluid combat.',
            'Quantum Synchronization': 'Can process multiple battle scenarios simultaneously, predicting movements like a chess master.',
            'Reality Hacking': 'Utilizes knowledge of cybernetics, psionics, and frequency manipulation to “rewrite” engagements.'
        },
        additionalDetails: {
            'Years of Experience': '10',
            'Favorite Quote': '"The mind is the limit."',
            'Training Philosophy': '"Harness the power of technology and the mind to transcend physical limits."'
        }
    },
    {
        id: 'tara_van_dekar',
        name: 'Tara Van Dekar',
        description: 'Tara Van Dekar is the Warrior of Truth, a spiritual guide and battle-hardened mentor who trains her students in physical endurance, mental clarity, and soul resilience.',
        icon: taraIcon,
        personality: 'Spiritual Warrior, Keeper of Forbidden Knowledge, Master of Esoteric Combat.',
        traits: {
            'Profoundly Wise & Intuitive': 'Sees the world through spiritual resonance and divine will.',
            'Relentlessly Disciplined': 'Trained from childhood, she is a master of multiple weapon styles and close-quarters combat.',
            'Angelically Protected': 'Guided by celestial forces, she walks a path few can follow.'
        },
        specializations: {
            'Esoteric Combat': 'A unique martial system blending ancient weaponry, psionics, and divine energy techniques.',
            'Sacred Scroll Interpretation': 'The only person capable of deciphering the Cosmic Cypher Sacred Scroll.',
            'Divine Endurance': 'Survives and thrives under conditions that would break most warriors, due to spiritual resilience.'
        },
        additionalDetails: {
            'Years of Experience': '20',
            'Favorite Quote': '"With the strength of Rosicrucians."',
            'Training Philosophy': '"Balance the body, mind, and soul to achieve true strength."'
        }
    },
    {
        id: 'agent_simon',
        name: 'Agent Simon',
        description: 'Agent Simon is a Master of Intelligence, Investigations, and Espionage. A former FBI Special Investigator, he spent decades unraveling the world’s darkest conspiracies, exposing criminal networks, and dismantling rogue operations before they could even act.',
        icon: simonIcon,
        personality: 'Master of Intelligence, Investigations, and Espionage.',
        traits: {
            'Mastermind & Strategist': 'Plans operations multiple steps ahead, ensuring victory before action is taken.',
            'Expert in Psychological Warfare': 'Knows how to manipulate perception, predict behavior, and control outcomes.',
            'Unmatched Investigator': 'Nothing escapes his attention—he sees the hidden connections others overlook.'
        },
        specializations: {
            'Espionage & Deception': 'Teaches infiltration, disguise, manipulation, and counterintelligence tactics.',
            'Cybersecurity & Intelligence Warfare': 'Masters hacking, digital security, OSINT, and counter-surveillance methods.',
            'War Strategy & Tactical Operations': 'Develops battle plans, mission execution techniques, and leadership under pressure.'
        },
        additionalDetails: {
            'Years of Experience': '30',
            'Favorite Quote': '"Victory is decided before the first move is made."',
            'Training Philosophy': '"Your mind is your greatest weapon—sharpen it, or be outplayed."'
        }
    }
];

const CoachSelector: React.FC = () => {
    const [selectedCoach, setSelectedCoach] = useState<string>('tiger_fitness_god');

    useEffect(() => {
        const storedCoach = localStorage.getItem('selectedCoach');
        if (storedCoach) {
            setSelectedCoach(storedCoach);
        }
    }, []);

    const handleCoachSelect = (coach: string) => {
        setSelectedCoach(coach);
        localStorage.setItem('selectedCoach', coach);
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