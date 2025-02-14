export const modulePaths: { [key: string]: () => Promise<any> } = {
    agencies: () => import("../data/training_modules/agencies.json"),
    combat: () => import("../data/training_modules/combat.json"),
    counter_biochem: () => import("../data/training_modules/counter_biochem.json"),
    counter_psyops: () => import("../data/training_modules/counter_psyops.json"),
    cybersecurity: () => import("../data/training_modules/cybersecurity.json"),
    dance: () => import("../data/training_modules/dance.json"),
    equations: () => import("../data/training_modules/equations.json"),
    espionage: () => import("../data/training_modules/espionage.json"),
    fitness: () => import("../data/training_modules/fitness.json"),
    intelligence: () => import("../data/training_modules/intelligence.json"),
    investigation: () => import("../data/training_modules/investigation.json"),
    martial_arts: () => import("../data/training_modules/martial_arts.json"),
    psiops: () => import("../data/training_modules/psiops.json"),
    war_strategy: () => import("../data/training_modules/war_strategy.json")
};
