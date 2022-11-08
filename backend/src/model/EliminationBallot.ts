import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Adjudicator, Debate } from ".";
import { TeamPosition } from "./DebateTeam";

@Entity()
export class EliminationBallot {
	@ManyToOne(type => Adjudicator)//, adjudicator => adjudicator.ballots)
	public adjudicator: Adjudicator;
	@PrimaryColumn()
	public adjudicatorId: number;
	@ManyToOne(type => Debate)//, debate => debate.ballots)
	public debate: Debate;
	@PrimaryColumn()
	public debateId: number;

	public get id(): string {
		return `${this.debateId}-${this.adjudicatorId}`;
	}

	@Column()
	public winner: TeamPosition;
}