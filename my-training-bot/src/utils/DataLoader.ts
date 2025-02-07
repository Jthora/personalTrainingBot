import fs from "fs";
import path from "path";
import { TrainingModule } from "../types/TrainingModule";
import { TrainingSubModule } from "../types/TrainingSubModule";
import { CardDeck } from "../types/CardDeck";
import { Card } from "../types/Card";
import TrainingModuleCache from "../cache/TrainingModuleCache";
import { TrainingModuleReference } from "../types/TrainingModuleReference";

class DataLoader {
    private dataPath = path.join(__dirname, "../data");

    async loadAllData() {
        const trainingModules = await this.loadTrainingModules();
        TrainingModuleCache.getInstance().loadData(trainingModules);
    }

    async loadTrainingModules(): Promise<TrainingModule[]> {
        const modulesPath = path.join(this.dataPath, "training_modules.json");
        const data = JSON.parse(fs.readFileSync(modulesPath, "utf-8"));
        const trainingModules: TrainingModule[] = [];

        for (const moduleRef of data.modules as TrainingModuleReference[]) {
            const modulePath = path.join(this.dataPath, "training_modules", `${moduleRef.id}.json`);
            const moduleData = JSON.parse(fs.readFileSync(modulePath, "utf-8"));

            const subModules: TrainingSubModule[] = await Promise.all(
                moduleData.submodules.map(async (subModuleId: string) => {
                    const subModulePath = path.join(this.dataPath, "training_modules", "training_sub_modules", `${subModuleId}.json`);
                    const subModuleData = JSON.parse(fs.readFileSync(subModulePath, "utf-8"));

                    const cardDecks: CardDeck[] = await Promise.all(
                        subModuleData.cardDecks.map(async (deckId: string) => {
                            const deckPath = path.join(this.dataPath, "training_modules", "card_decks", `${deckId}.json`);
                            const deckData = JSON.parse(fs.readFileSync(deckPath, "utf-8"));
                            return {
                                id: deckData.id,
                                name: deckData.name,
                                description: deckData.description,
                                focus: deckData.focus,
                                cards: deckData.cards.map((card: Card) => ({
                                    id: card.id,
                                    title: card.title,
                                    description: card.description,
                                    bulletpoints: card.bulletpoints,
                                    duration: card.duration,
                                    difficulty: card.difficulty
                                }))
                            };
                        })
                    );

                    return {
                        id: subModuleData.id,
                        name: subModuleData.name,
                        description: subModuleData.description,
                        difficulty: subModuleData.difficulty,
                        estimated_time: subModuleData.estimated_time,
                        focus: subModuleData.focus,
                        cardDecks: cardDecks
                    };
                })
            );

            trainingModules.push({
                id: moduleData.id,
                name: moduleData.name,
                description: moduleData.description,
                submodules: subModules
            });
        }

        return trainingModules;
    }
}

export default DataLoader;