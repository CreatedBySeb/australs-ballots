export interface Speaker {
	_links: { checkin: string };
	anonymous: boolean;
	categories: string[];
	email: string;
	gender: { description: string };
	id: number;
	name: string;
	phone: string;
	pronoun: string;
	team: string;
	url: string;
	url_key: string;
}
