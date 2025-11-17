export type CoachModuleMapping = Record<string, string[] | undefined>;

export const coachModuleMapping: CoachModuleMapping = {
    tiger_fitness_god: ['fitness', 'combat', 'martial_arts', 'war_strategy'],
    jono_thora: ['web_three', 'dance', 'cybersecurity', 'equations'],
    tara_van_dekar: ['psiops', 'self_sovereignty', 'counter_psyops', 'anti_psn'],
    agent_simon: ['espionage', 'investigation', 'intelligence', 'agencies'],
    star_commander_raynor: ['space_force'],
};

export const getCoachDefaultModules = (coachId: string): string[] | undefined => {
    return coachModuleMapping[coachId];
};

export const getAllCoachModuleMappings = (): CoachModuleMapping => ({ ...coachModuleMapping });
