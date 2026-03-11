import type { TrainingModuleFile } from "../types/TrainingDataFiles";
import { loadShard } from './shardLoader';

export const modulePaths = {
    agencies: async () => (await loadShard("agencies")).module,
    combat: async () => (await loadShard("combat")).module,
    counter_biochem: async () => (await loadShard("counter_biochem")).module,
    counter_psyops: async () => (await loadShard("counter_psyops")).module,
    cybersecurity: async () => (await loadShard("cybersecurity")).module,
    dance: async () => (await loadShard("dance")).module,
    equations: async () => (await loadShard("equations")).module,
    espionage: async () => (await loadShard("espionage")).module,
    fitness: async () => (await loadShard("fitness")).module,
    intelligence: async () => (await loadShard("intelligence")).module,
    investigation: async () => (await loadShard("investigation")).module,
    martial_arts: async () => (await loadShard("martial_arts")).module,
    psiops: async () => (await loadShard("psiops")).module,
    war_strategy: async () => (await loadShard("war_strategy")).module,
    web_three: async () => (await loadShard("web_three")).module,
    self_sovereignty: async () => (await loadShard("self_sovereignty")).module,
    anti_psn: async () => (await loadShard("anti_psn")).module,
    anti_tcs_idc_cbc: async () => (await loadShard("anti_tcs_idc_cbc")).module,
    space_force: async () => (await loadShard("space_force")).module
} satisfies Record<string, () => Promise<TrainingModuleFile>>;
