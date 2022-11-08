import { Speaker } from "./Speaker";

export interface Team {
	break_categories: string[];
	code_name: string;
	emoji: string;
	id: number;
	institution: string | null;
	institution_conflicts: string[];
	long_name: string;
	reference: string;
	short_name: string;
	short_reference: string;
	speakers: Speaker[];
	url: string;
	use_institution_prefix: boolean;
}
