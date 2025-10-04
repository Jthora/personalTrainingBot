export type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number; // in minutes
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate" | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    summaryText?: string; // 140-280 character shareable summary
};