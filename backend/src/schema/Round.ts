import { Static, Type } from "@sinclair/typebox";

export const RoundSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
});

export type RoundType = Static<typeof RoundSchema>;