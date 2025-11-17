import { Card } from "./Card";

export type CardDeck = {
    id: string;
    name: string;
    description: string;
    focus: string[]; // e.g. ["Power", "Speed"]
    badge?: string; // Gamification badge name
    difficultyTags?: string[]; // e.g. ["Advanced", "Delta III"]
    cards: Card[];
};