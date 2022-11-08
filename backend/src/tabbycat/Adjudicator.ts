export interface Adjudicator {
	_links: { checkin: string };
	adj_core: boolean;
	adjudicator_conflicts: string[];
	anonymous: boolean;
	base_score: number;
	email: string;
	id: number;
	independent: boolean;
	institution: string | null;
	institution_conflicts: string[];
	name: string;
	phone: number;
	pronoun: string;
	team_conflicts: string[];
	trainee: boolean;
	url: string;
	url_key: string;
}
