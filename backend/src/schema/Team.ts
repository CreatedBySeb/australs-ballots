import { Static, Type } from "@sinclair/typebox";
import { SpeakerSchema } from "./Speaker";

export const TeamSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	speakers: Type.Array(SpeakerSchema),
});

export type TeamType = Static<typeof TeamSchema>;