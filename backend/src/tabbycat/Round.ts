import { Motion } from "./Motion";

export enum DrawStatus {
    CONFIRMED = "C",
    DRAFT = "D",
    NOT_GENERATED = "N",
    RELEASED = "R",
}

export interface Round {
    _links: {
        pairing: string;
    };

    abbreviation: string;
    break_category: string | null;
    completed: boolean;
    draw_status: DrawStatus;
    draw_type: "R" | "M" | "D" | "P" | "E";
    feedback_weight: number;
    id: number;
    motions: Motion[];
    motions_released: boolean;
    name: string;
    seq: number;
    silent: boolean;
    stage: "P" | "E";
    starts_at: string | null;
    url: string;
}