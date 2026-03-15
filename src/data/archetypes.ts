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
        name: 'Search & Rescue',
        icon: '🛡️',
        description: 'First responder and extraction specialist. Trained in field triage, hazard navigation, and civilian protection across hostile theatres of the Earth Alliance.',
        coreModules: ['combat', 'counter_biochem', 'fitness', 'investigation'],
        secondaryModules: ['intelligence', 'psiops'],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (SAR)', 'Tier III · Lieutenant (SAR)', 'Tier IV · Commander (SAR)'],
        competencyWeights: { triage_execution: 0.40, decision_quality: 0.30, signal_analysis: 0.15, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'triage_execution', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'cyber_sentinel',
        name: 'CyberCom',
        icon: '🔒',
        description: 'Digital fortress defender and network intrusion hunter. Masters threat intelligence, forensic analysis, and zero-day containment for EarthForce information systems.',
        coreModules: ['cybersecurity', 'intelligence', 'espionage', 'investigation'],
        secondaryModules: ['agencies', 'counter_psyops'],
        recommendedHandler: 'agent_simon',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Cyber)', 'Tier III · Lieutenant (Cyber)', 'Tier IV · Commander (Cyber)'],
        competencyWeights: { signal_analysis: 0.35, artifact_traceability: 0.30, triage_execution: 0.20, decision_quality: 0.15 },
        tier3Gate: { dimension: 'signal_analysis', threshold: 65 },
        tier4Gate: { dimension: 'artifact_traceability', threshold: 70 },
    },
    {
        id: 'psi_operative',
        name: 'Psi Corps',
        icon: '🔮',
        description: 'Psionic combat specialist and counter-psyops agent. Operates across psionic fields, remote sensing, and consciousness defense under Psi Corps doctrine.',
        coreModules: ['psiops', 'counter_psyops', 'self_sovereignty', 'martial_arts'],
        secondaryModules: ['dance', 'equations'],
        recommendedHandler: 'tara_van_dekar',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Psi)', 'Tier III · Lieutenant (Psi)', 'Tier IV · Commander (Psi)'],
        competencyWeights: { decision_quality: 0.35, signal_analysis: 0.25, triage_execution: 0.25, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'decision_quality', threshold: 65 },
        tier4Gate: { dimension: 'signal_analysis', threshold: 70 },
    },
    {
        id: 'shadow_agent',
        name: 'Intelligence Division',
        icon: '🕵️',
        description: 'Covert operations specialist and intelligence officer. Expert in infiltration, tradecraft, counter-intelligence, and narrative control for the Earth Alliance.',
        coreModules: ['espionage', 'intelligence', 'agencies', 'war_strategy'],
        secondaryModules: ['cybersecurity', 'counter_psyops'],
        recommendedHandler: 'agent_simon',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Intel)', 'Tier III · Lieutenant (Intel)', 'Tier IV · Commander (Intel)'],
        competencyWeights: { artifact_traceability: 0.35, signal_analysis: 0.25, decision_quality: 0.25, triage_execution: 0.15 },
        tier3Gate: { dimension: 'artifact_traceability', threshold: 65 },
        tier4Gate: { dimension: 'signal_analysis', threshold: 70 },
    },
    {
        id: 'cosmic_engineer',
        name: 'Engineering Corps',
        icon: '⚡',
        description: 'Systems architect and quantum-domain engineer. Fuses cybersecurity, advanced mathematics, and frequency-domain analysis into a unified engineering discipline for the fleet.',
        coreModules: ['cybersecurity', 'equations', 'web_three', 'space_force'],
        secondaryModules: ['dance', 'psiops'],
        recommendedHandler: 'jono_thora',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Eng)', 'Tier III · Lieutenant (Eng)', 'Tier IV · Commander (Eng)'],
        competencyWeights: { artifact_traceability: 0.30, decision_quality: 0.30, signal_analysis: 0.25, triage_execution: 0.15 },
        tier3Gate: { dimension: 'artifact_traceability', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'tactical_guardian',
        name: 'GroundForce',
        icon: '⚔️',
        description: 'Close-quarters combat master and tactical operations lead. Combines martial discipline, field conditioning, and strategic planning for EarthForce ground operations.',
        coreModules: ['combat', 'martial_arts', 'war_strategy', 'fitness'],
        secondaryModules: ['espionage', 'counter_biochem'],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Ground)', 'Tier III · Lieutenant (Ground)', 'Tier IV · Commander (Ground)'],
        competencyWeights: { triage_execution: 0.35, decision_quality: 0.30, artifact_traceability: 0.20, signal_analysis: 0.15 },
        tier3Gate: { dimension: 'triage_execution', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
    {
        id: 'star_commander',
        name: 'Fleet Command',
        icon: '🌟',
        description: 'Orbital operations lead and space defense strategist. Trained in zero-gravity readiness, fleet coordination, and contingency command for EarthForce Starcom.',
        coreModules: ['space_force', 'war_strategy', 'intelligence', 'fitness'],
        secondaryModules: ['cybersecurity', 'agencies'],
        recommendedHandler: 'star_commander_raynor',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Fleet)', 'Tier III · Lieutenant (Fleet)', 'Tier IV · Commander (Fleet)'],
        competencyWeights: { decision_quality: 0.35, triage_execution: 0.30, signal_analysis: 0.20, artifact_traceability: 0.15 },
        tier3Gate: { dimension: 'decision_quality', threshold: 65 },
        tier4Gate: { dimension: 'triage_execution', threshold: 70 },
    },
    {
        id: 'field_scholar',
        name: 'Diplomatic Corps',
        icon: '📖',
        description: 'Knowledge guardian and counter-institutional warfare specialist. Defends sovereignty, decodes manipulation, and preserves critical truth for the Earth Alliance.',
        coreModules: ['self_sovereignty', 'counter_psyops', 'anti_psn', 'anti_tcs_idc_cbc'],
        secondaryModules: ['intelligence', 'investigation'],
        recommendedHandler: 'tara_van_dekar',
        milestoneLabels: ['Tier I · Cadet', 'Tier II · Ensign (Diplo)', 'Tier III · Lieutenant (Diplo)', 'Tier IV · Commander (Diplo)'],
        competencyWeights: { signal_analysis: 0.35, decision_quality: 0.30, artifact_traceability: 0.20, triage_execution: 0.15 },
        tier3Gate: { dimension: 'signal_analysis', threshold: 65 },
        tier4Gate: { dimension: 'decision_quality', threshold: 70 },
    },
];

export const getArchetypeCatalog = (): ArchetypeDefinition[] => ARCHETYPE_CATALOG;

export const findArchetype = (id: string): ArchetypeDefinition | undefined =>
    ARCHETYPE_CATALOG.find((a) => a.id === id);
