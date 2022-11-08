import { Static, Type } from "@sinclair/typebox";
import { TeamPosition } from "../model";

export const SpeechScoreSchema = Type.Object({
	score: Type.Number({ minimum: 70, maximum: 80 }),
	speaker: Type.Number(),
});

export const ReplyScoreSchema = Type.Object({
	score: Type.Number({ minimum: 35, maximum: 40 }),
	speaker: Type.Number(),
});

export const TeamScoreSchema = Type.Object({
	speeches: Type.Tuple([SpeechScoreSchema, SpeechScoreSchema, SpeechScoreSchema]),
	reply: ReplyScoreSchema,
});

export const ScoredBallotSchema = Type.Object({
	affScore: TeamScoreSchema,
	negScore: TeamScoreSchema,
});

export const EliminationBallotSchema = Type.Object({
	winner: Type.Enum(TeamPosition),
});

export const BallotSchema = Type.Union([EliminationBallotSchema, ScoredBallotSchema])

export type SpeechScoreType = Static<typeof SpeechScoreSchema>;
export type ReplyScoreType = Static<typeof ReplyScoreSchema>;
export type TeamScoreType = Static<typeof TeamScoreSchema>;
export type ScoredBallotSchema = Static<typeof ScoredBallotSchema>;
export type EliminationBallotSchema = Static<typeof EliminationBallotSchema>;
export type BallotType = Static<typeof BallotSchema>;