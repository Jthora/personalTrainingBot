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
        description: 'The God of Tiger Fitness is the embodiment of raw power, primal dominance, and relentless drive. He forges warriors in the crucible of pain, stripping away weakness and reshaping them into unstoppable predators. His training is not for the faint-hearted—only those willing to embrace the suffering required to achieve true strength will survive.',
        icon: tigerIcon,
        personality: 'Ferocious Motivator, Master of Primal Strength, Unbreakable Warrior Spirit.',
        traits: {
            'Brutally Honest & Uncompromising': 'No sugarcoating, no weakness, only results.',
            'Intensely Motivational': 'Pushes warriors beyond their limits with pure aggression and unwavering belief.',
            'Peak Physicality': 'The living embodiment of raw strength, endurance, and primal combat.'
        },
        specializations: {
            'Primal Combat Training': 'Turns warriors into apex predators, focusing on raw power and instinct-driven combat.',
            'Pain Endurance & Mental Fortitude': 'Teaches mastery over suffering, transforming pain into fuel for greater strength.',
            'Alpha Presence': 'Commands respect through sheer dominance, making him a leader in any fight or battlefield.'
        },
        additionalDetails: {
            'Years of Experience': 'Eternal.',
            'Favorite Quote': '"Strength is the product of struggle."',
            'Training Philosophy': '"The weak hesitate. The strong dominate."'
        }
    },
    {
        id: 'jono_thora',
        name: 'Jono Tho\'ra',
        description: 'Jono Tho\'ra is the Cosmic Fusion Coach, a cyber-warrior, quantum hacker, and rhythm master who transcends the boundaries of combat, technology, and reality itself. He fuses energy manipulation, psionic engineering, and tactical programming into a training regimen that turns his students into high-frequency warriors of the mind, body, and digital world.',
        icon: jonoIcon,
        personality: 'Raver Superhero Leader, Quantum Codebreaker, Master of Energy Flow and Frequency Combat.',
        traits: {
            'Reality Engineer': 'Sees the universe as a program that can be hacked, rewritten, and optimized in real-time.',
            'Psionic Combat Specialist': 'Integrates martial arts, psionics, and digital synchronization into fluid, high-speed combat.',
            'Rhythmic Precision': 'Fights with the flow of music, dance, and combat movement, making every step an attack and every beat a strategy.'
        },
        specializations: {
            'Fusion Combat Protocols': 'Blends psionic strikes, coded movement, and reality-altering techniques into an advanced combat system.',
            'Quantum Combat Synchronization': 'Processes multiple battle scenarios at once, making him a strategist of both time and space.',
            'Frequency Hacking': 'Manipulates sound, energy fields, and resonance to control the battlefield, from disrupting enemies to enhancing allies.'
        },
        additionalDetails: {
            'Years of Experience': 'Beyond measurable time.',
            'Favorite Quote': '"The universe is just data. Rewrite it."',
            'Training Philosophy': '"You are not bound by physics, gravity, or limitation. You are an equation waiting to be solved."'
        }
    },
    {
        id: 'tara_van_dekar',
        name: 'Tara Van Dekar',
        description: 'Tara Van Dekar is the Last True Rosicrucian, the Guardian of the Cosmic Cypher, and a master of both spiritual and martial warfare. She walks the razor’s edge between divine protection and relentless discipline, training warriors to harmonize body, mind, and soul into an indestructible force. She is both seeker and fighter—one who carries the lost knowledge of the universe while facing the horrors of those who wish to suppress it.',
        icon: taraIcon,
        personality: 'Rosicrucian Warrior-Saint, Keeper of Forbidden Truth, Master of Celestial Combat and Divine Strategy.',
        traits: {
            'Celestial Awareness': 'Guided by angelic forces, she perceives reality through spiritual resonance rather than material limitation.',
            'Unyielding Discipline': 'Trained from childhood to master all forms of combat, she moves with precision, purpose, and unshakable control.',
            'Keeper of the Cosmic Cypher': 'The sole interpreter of the indestructible Cosmic Cypher Sacred Scroll, holding the final key to lost knowledge.'
        },
        specializations: {
            'Esoteric Combat Mastery': 'Blends ancient weaponry, divine energy techniques, and psionic awareness into a seamless fighting style.',
            'Sacred Codex Interpretation': 'Can decipher the Cosmic Cypher Scroll, unlocking hidden truths that shape reality itself.',
            'Divine Resilience': 'Endures and overcomes conditions that would break lesser warriors, fueled by an unwavering spiritual core.'
        },
        additionalDetails: {
            'Years of Experience': 'Lifetimes beyond this one.',
            'Favorite Quote': '"With the strength of Rosicrucians."',
            'Training Philosophy': '"A warrior fights for victory. A guardian fights for balance. Know the difference."'
        }
    },
    {
        id: 'agent_simon',
        name: 'Agent Simon',
        description: 'Agent Simon is the Phantom Guardian, a former FBI Special Investigator who has spent decades dismantling global conspiracies, infiltrating hidden networks, and rewriting the rules of modern warfare. His knowledge spans intelligence, espionage, psychological operations, and deep-cover strategy. He trains operatives to see the battlefield beyond the physical—through information control, deception, and the power of an unseen hand guiding every outcome.',
        icon: simonIcon,
        personality: 'Master of Intelligence, Espionage Operative, Unseen Hand of War.',
        traits: {
            'Strategic Ghost': 'Eliminates threats before they even know they exist, ensuring battles are won before they begin.',
            'Master Manipulator': 'Understands the psychology of control, influence, and perception, using them as weapons in unseen warfare.',
            'Counter-Intelligence Architect': 'Builds operations within operations, ensuring no move is without purpose, no step without an exit plan.'
        },
        specializations: {
            'Shadow Warfare & Espionage': 'Trains operatives in infiltration, counter-surveillance, and the art of being everywhere yet nowhere.',
            'Cybernetic Intelligence & OSINT': 'Masters digital security, hacking, data warfare, and information dominance.',
            'Tactical Subversion & Psychological Ops': 'Teaches how to control narratives, mislead enemies, and rewrite the rules of engagement without ever being seen.'
        },
        additionalDetails: {
            'Years of Experience': 'Classified.',
            'Favorite Quote': '"The most powerful moves are the ones nobody notices until it\'s too late."',
            'Training Philosophy': '"Control information. Control the outcome."'
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