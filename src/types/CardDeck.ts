import { Card } from "./Card";

export type CardDeck = {
    id: string;
    name: string;
    description: string;
    focus: string[]; // e.g. ["Power", "Speed"]
    cards: Card[];
};