import { Static, Type } from "@sinclair/typebox";
import { AdjudicatorRole, TeamPosition } from "../model";
import { AdjudicatorSchema } from "./Adjudicator";
import { RoundSchema } from "./Round";
import { SpeakerSchema } from "./Speaker";
import { TeamSchema } from "./Team";
import { VenueSchema } from "./Venue";

const TeamScore = Type.Object({
	speech1Score: Type.Number(),
	speech1Speaker: SpeakerSchema,
	speech2Score: Type.Number(),
	speech2Speaker: SpeakerSchema,
	speech3Score: Type.Number(),
	speech3Speaker: SpeakerSchema,
	replyScore: Type.Number(),
	replySpeaker: SpeakerSchema,
});

export const DebateAdjudicatorSchema = Type.Object({
	adjudicator: AdjudicatorSchema,
	role: Type.Enum(AdjudicatorRole),
});

export const DebateTeamSchema = Type.Object({
	position: Type.Enum(TeamPosition),
	team: TeamSchema,
});

export const DebateSchema = Type.Object({
	adjudicators: Type.Array(DebateAdjudicatorSchema),
	ballots: Type.Optional(Type.Array(Type.Object({
		id: Type.String(),
	}))),
	confirmed: Type.Boolean(),
	id: Type.Number(),
	round: RoundSchema,
	teams: Type.Array(DebateTeamSchema),
	venue: VenueSchema,
});

export type DebateType = Static<typeof DebateSchema>;
export type DebateAdjudicatorType = Static<typeof DebateAdjudicatorSchema>;
export type DebateTeamType = Static<typeof DebateTeamSchema>;