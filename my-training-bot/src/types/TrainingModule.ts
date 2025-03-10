import { TrainingSubModule } from "./TrainingSubModule";

export type TrainingModule = {
    id: string;
    name: string;
    description: string;
    color: string;
    submodules: TrainingSubModule[]; // List of Training Sub Module IDs
};