export interface Debate {
    adjudicators: {
        chair: string;
        panellists: string[];
        trainees: string[];
    };

    id: number;

    sides_confirmed: number;
    
    teams: {
        team: string;
        side: "aff" | "neg" | "og" | "oo" | "cg" | "co";
    }[];

    url: string;
    venue: string;
}