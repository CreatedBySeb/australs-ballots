import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Debate, Team } from ".";

export enum TeamPosition {
	AFFIRMATIVE,
	NEGATIVE,
	OPENING_GOVERNMENT,
	OPENING_OPPOSITION,
	CLOSING_GOVERNMENT,
	CLOSING_OPPOSITION,
}

export const TEAM_POSITION_MAP = {
	"aff": TeamPosition.AFFIRMATIVE,
	"neg": TeamPosition.NEGATIVE,
	"og": TeamPosition.OPENING_GOVERNMENT,
	"oo": TeamPosition.OPENING_OPPOSITION,
	"cg": TeamPosition.CLOSING_GOVERNMENT,
	"co": TeamPosition.CLOSING_OPPOSITION,
};

@Entity()
export class DebateTeam {
	@ManyToOne(type => Debate)
	public debate: Debate;
	@PrimaryColumn()
	public id: string;
	@Column()
	public position: TeamPosition;
	@ManyToOne(type => Team)
	public team: Team;
	@Column()
	public teamId: number;
}