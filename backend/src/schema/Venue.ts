import { Static, Type } from "@sinclair/typebox";

export const VenueSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
});

export type VenueType = Static<typeof VenueSchema>;