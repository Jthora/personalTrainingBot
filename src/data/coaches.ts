import tigerIcon from '../assets/images/icons/coaches/tiger_fitness_god-icon.png';
import jonoIcon from '../assets/images/icons/coaches/jono_thora-icon.png';
import taraIcon from '../assets/images/icons/coaches/tara_van_dekar-icon.png';
import simonIcon from '../assets/images/icons/coaches/agent_simon-icon.png';
import raynorIcon from '../assets/images/icons/coaches/StarcomCommander_01.png';

export type Coach = {
    id: string;
    name: string;
    description: string;
    icon: string;
    personality: string;
    traits: Record<string, string>;
    specializations: Record<string, string>;
    additionalDetails: Record<string, string>;
};

export const defaultCoachId = 'star_commander_raynor';

export const coaches: Coach[] = [
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
        name: "Jono Tho'ra",
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
    },
    {
        id: 'star_commander_raynor',
        name: 'Star Commander Raynor',
        description: 'Raynor is the senior mission commander for a USSF orbital response wing. He blends hard science, zero-gravity conditioning, and calm cockpit leadership to keep crews lethal when systems fail.',
        icon: raynorIcon,
        personality: 'Orbital Operations Commander, Calm Mission Lead, Guardian of Formation Discipline.',
        traits: {
            'Orbital Strategist': 'Reads conjunction reports and delta-V ledgers the way other leaders read body language, always two burns ahead.',
            'Formation Steward': 'Keeps every ship riding the same cadence—comms tight, spacing disciplined, ego parked.',
            'Crew Sentinel': 'Monitors morale, breathing cadence, and cognitive load so the team stays sharp when telemetry spikes.'
        },
        specializations: {
            'Zero-G Conditioning Lanes': 'Progressive core, joint, and vestibular work that keeps guardians steady during EVA or high-rate slews.',
            'Fleet Coordination & Comms': 'Battle rhythm briefs, comm windows, and contingency routing that keep allied squadrons synced with the AOC.',
            'Contingency Siege Readiness': 'High-stress drilling for radiation alerts, degraded sensors, and protracted watch rotations without losing judgment.'
        },
        additionalDetails: {
            'Years of Experience': '17 years across Delta ops, SDA, and contingency command.',
            'Favorite Quote': '"Hold formation, hold breath, hold trust."',
            'Training Philosophy': '"Procedures buy confidence. Confidence buys mission tempo."'
        }
    }
];
