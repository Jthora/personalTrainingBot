export type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number; // in minutes
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate" | "Advanced" | "Heavy" | "Challenge" | "Unknown";
};