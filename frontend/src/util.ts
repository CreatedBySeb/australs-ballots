import { DebateAdjudicatorType, DebateType } from "../../backend/dist/schema";

export function sortPanel(a: DebateAdjudicatorType, b: DebateAdjudicatorType): number {
	if (a.role != b.role) return b.role - a.role;
	else return a.adjudicator.name.localeCompare(b.adjudicator.name);
}

export function filterTrainees(panel: DebateAdjudicatorType[]): DebateAdjudicatorType[] {
	return panel.filter((adj) => adj.role > 0);
}

export function formatAdjName(adj: DebateAdjudicatorType): string {
	let str = adj.adjudicator.name;

	if (adj.role == 2) str += " Ⓒ";
	else if (adj.role == 0) str += " Ⓣ";

	return str;
}

export function toPanelString(debate: DebateType): string {
	const parts = debate.adjudicators
		.sort(sortPanel)
		.map(formatAdjName);

	if (parts.length == 1) return parts[0];
	else return parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1];
}