export interface Venue {
	_links: {
		checkin: string;
	};

	categories: string[];
	display_name: string;
	external_url: string;
	id: number;
	name: string;
	priority: number;
	url: string;
}