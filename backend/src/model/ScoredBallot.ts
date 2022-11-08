import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Adjudicator } from ".";
import { Debate } from "./Debate";
import { TeamScore } from "./TeamScore";

@Entity()
export class ScoredBallot {
	@ManyToOne(type => Adjudicator)//, adjudicator => adjudicator.ballots)
	public adjudicator: Adjudicator;
	@PrimaryColumn()
	public adjudicatorId: number;
	@OneToOne(type => TeamScore, { cascade: true })
	@JoinColumn()
	public affScore: TeamScore;
	@ManyToOne(type => Debate)//, debate => debate.ballots)
	public debate: Debate;
	@PrimaryColumn()
	public debateId: number;

	public get id(): string {
		return `${this.debateId}-${this.adjudicatorId}`;
	}

	@OneToOne(type => TeamScore, { cascade: true })
	@JoinColumn()
	public negScore: TeamScore;
}