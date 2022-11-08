import { Static, Type } from "@sinclair/typebox";

export const SpeakerSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
});

export type SpeakerType = Static<typeof SpeakerSchema>;