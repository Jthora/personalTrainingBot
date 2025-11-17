import type { TrainingModuleFile } from "../types/TrainingDataFiles";
import { createJsonLoader } from "./jsonLoader";

export const modulePaths = {
    agencies: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/agencies.json")),
    combat: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/combat.json")),
    counter_biochem: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/counter_biochem.json")),
    counter_psyops: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/counter_psyops.json")),
    cybersecurity: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/cybersecurity.json")),
    dance: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/dance.json")),
    equations: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/equations.json")),
    espionage: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/espionage.json")),
    fitness: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/fitness.json")),
    intelligence: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/intelligence.json")),
    investigation: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/investigation.json")),
    martial_arts: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/martial_arts.json")),
    psiops: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/psiops.json")),
    war_strategy: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/war_strategy.json")),
    web_three: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/web_three.json")),
    self_sovereignty: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/self_sovereignty.json")),
    anti_psn: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/anti_psn.json")),
    anti_tcs_idc_cbc: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/anti_tcs_idc_cbc.json")),
    space_force: createJsonLoader<TrainingModuleFile>(() => import("../data/training_modules/space_force.json"))
} satisfies Record<string, () => Promise<TrainingModuleFile>>;
