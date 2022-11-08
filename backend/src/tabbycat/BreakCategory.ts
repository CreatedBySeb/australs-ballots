export interface BreakCategory {
	_links: { eligibility: string };
	break_size: number;
	is_general: boolean;
	limit: number;
	name: string;
	priority: number;
	rule: "standard" | "aida-1996" | "aida-2016-easters" | "aida-2016-australs" | "aida-2019-australs-open";
	seq: number;
	slug: string;
	url: string;
}
