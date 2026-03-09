import type { CompetencyDimension } from '../utils/readiness/competencyModel';

export interface ArchetypeDefinition {
    id: string;
    name: string;
    icon: string;
    description: string;
    coreModules: string[];
    secondaryModules: string[];
    recommendedHandler: string;
    milestoneLabels: [string, string, string, string];
    competencyWeights: Record<CompetencyDimension, number>;
    tier3Gate: { dimension: CompetencyDimension; threshold: number };
    tier4Gate: { dimension: CompetencyDimension; threshold: number };
}

const ARCHETYPE_CATALOG: ArchetypeDefinition[] = [
    {
        id: 'rescue_ranger',
        name: 'Rescue Ranger',
        icon: '🛡️',
        description: 'First responder and extraction specialist. Trained in field triage, hazard navigation, and civilian protection under hostile conditions.',
        coreModules: ['combat', 'counter_biochem', 'fitness', 'investigation'],
        secondaryModules: ['intelligence', 'psiops'],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Field Medic', 'Tier III · Rescue Specialist', 'Tier IV · Rescue Commander'],
        competencyWeights: { triage_execution: 0.40, decision_quality: 0.30, signal_analysis: 0.15, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'triage_execution', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'cyber_sentinel',
        name: 'Cyber Sentinel',
        icon: '🔒',
        description: 'Digital fortress defender and network intrusion hunter. Masters threat intelligence, forensic analysis, and zero-day containment.',
        coreModules: ['cybersecurity', 'intelligence', 'espionage', 'investigation'],
        secondaryModules: ['agencies', 'counter_psyops'],
        recommendedHandler: 'agent_simon',
        milestoneLabels: ['Tier I · Trainee', 'Tier II · Analyst', 'Tier III · Sentinel', 'Tier IV · Cyber Commander'],
        competencyWeights: { signal_analysis: 0.35, artifact_traceability: 0.30, triage_execution: 0.20, decision_quality: 0.15 },
        tier3Gate: { dimension: 'signal_analysis', threshold: 65 },
        tier4Gate: { dimension: 'artifact_traceability', threshold: 70 },
    },
    {
        id: 'psi_operative',
        name: 'Psi Operative',
        icon: '🔮',
        description: 'Psychic combat specialist and counter-psyops agent. Operates in psionic fields, remote viewing, and consciousness defense.',
        coreModules: ['psiops', 'counter_psyops', 'self_sovereignty', 'martial_arts'],
        secondaryModules: ['dance', 'equations'],
        recommendedHandler: 'tara_van_dekar',
        milestoneLabels: ['Tier I · Initiate', 'Tier II · Adept', 'Tier III · Psi Specialist', 'Tier IV · Psi Commander'],
        competencyWeights: { decision_quality: 0.35, signal_analysis: 0.25, triage_execution: 0.25, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'decision_quality', threshold: 65 },
        tier4Gate: { dimension: 'signal_analysis', threshold: 70 },
    },
    {
        id: 'shadow_agent',
        name: 'Shadow Agent',
        icon: '🕵️',
        description: 'Covert operations specialist and intelligence operative. Expert in infiltration, tradecraft, counter-intelligence, and narrative control.',
        coreModules: ['espionage', 'intelligence', 'agencies', 'war_strategy'],
        secondaryModules: ['cybersecurity', 'counter_psyops'],
        recommendedHandler: 'agent_simon',
        milestoneLabels: ['Tier I · Recruit', 'Tier II · Field Agent', 'Tier III · Shadow Specialist', 'Tier IV · Shadow Director'],
        competencyWeights: { artifact_traceability: 0.35, signal_analysis: 0.25, decision_quality: 0.25, triage_execution: 0.15 },
        tier3Gate: { dimension: 'artifact_traceability', threshold: 65 },
        tier4Gate: { dimension: 'signal_analysis', threshold: 70 },
    },
    {
        id: 'cosmic_engineer',
        name: 'Cosmic Engineer',
        icon: '⚡',
        description: 'Reality hacker and quantum-domain architect. Fuses cybersecurity, advanced mathematics, and frequency-based combat into a unified discipline.',
        coreModules: ['cybersecurity', 'equations', 'web_three', 'space_force'],
        secondaryModules: ['dance', 'psiops'],
        recommendedHandler: 'jono_thora',
        milestoneLabels: ['Tier I · Apprentice', 'Tier II · Architect', 'Tier III · Engineer', 'Tier IV · Cosmic Architect'],
        competencyWeights: { artifact_traceability: 0.30, decision_quality: 0.30, signal_analysis: 0.25, triage_execution: 0.15 },
        tier3Gate: { dimension: 'artifact_traceability', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'tactical_guardian',
        name: 'Tactical Guardian',
        icon: '⚔️',
        description: 'Close-quarters combat master and tactical operations lead. Combines martial discipline, field conditioning, and strategic planning.',
        coreModules: ['combat', 'martial_arts', 'war_strategy', 'fitness'],
        secondaryModules: ['espionage', 'counter_biochem'],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: ['Tier I · Trainee', 'Tier II · Warrior', 'Tier III · Guardian', 'Tier IV · Tactical Commander'],
        competencyWeights: { triage_execution: 0.35, decision_quality: 0.30, artifact_traceability: 0.20, signal_analysis: 0.15 },
        tier3Gate: { dimension: 'triage_execution', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'star_commander',
        name: 'Star Commander',
        icon: '🌟',
        description: 'Orbital operations lead and space defense strategist. Trained in zero-gravity readiness, fleet coordination, and contingency command.',
        coreModules: ['space_force', 'war_strategy', 'intelligence', 'fitness'],
        secondaryModules: ['cybersecurity', 'agencies'],
        recommendedHandler: 'star_commander_raynor',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Lieutenant', 'Tier III · Commander', 'Tier IV · Fleet Admiral'],
        competencyWeights: { decision_quality: 0.35, triage_execution: 0.30, signal_analysis: 0.20, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'decision_quality', threshold: 65 },
        tier4Gate: { dimension: 'triage_execution', threshold: 70 },
    },
    {
        id: 'field_scholar',
        name: 'Field Scholar',
        icon: '📖',
        description: 'Knowledge guardian and counter-institutional warfare specialist. Defends sovereignty, decodes manipulation, and preserves critical truth.',
        coreModules: ['self_sovereignty', 'counter_psyops', 'anti_psn', 'anti_tcs_idc_cbc'],
        secondaryModules: ['intelligence', 'investigation'],
        recommendedHandler: 'tara_van_dekar',
        milestoneLabels: ['Tier I · Student', 'Tier II · Researcher', 'Tier III · Scholar', 'Tier IV · Knowledge Commander'],
        competencyWeights: { signal_analysis: 0.35, decision_quality: 0.30, artifact_traceability: 0.20, triage_execution: 0.15 },
        tier3Gate: { dimension: 'signal_analysis', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
];

export const getArchetypeCatalog = (): ArchetypeDefinition[] => ARCHETYPE_CATALOG;

export const findArchetype = (id: string): ArchetypeDefinition | undefined =>
    ARCHETYPE_CATALOG.find((a) => a.id === id);
