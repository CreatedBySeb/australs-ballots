export interface VenueCategory {
	description: string;
	display_in_public_tooltip: boolean;
	display_in_venue_name: "-" | "P" | "S";
	id: number;
	name: string;
	url: string;
	venues: string[];
}