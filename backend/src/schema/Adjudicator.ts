import { Static, Type } from "@sinclair/typebox";

export const AdjudicatorSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
});

export type AdjudicatorType = Static<typeof AdjudicatorSchema>;