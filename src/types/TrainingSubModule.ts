import { CardDeck } from "./CardDeck";

export type TrainingSubModule = {
    id: string;
    name: string;
    description: string;
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate" | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    estimated_time: string; // Example: "12-24 months"
    focus: string[]; // Example: ["Close Combat", "Efficiency", "Sensitivity"]
    cardDecks: CardDeck[]; // List of Card Decks
};