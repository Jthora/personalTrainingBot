export type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number; // in minutes
    difficulty: "Beginner" | "Intermediate" | "Advanced";
};