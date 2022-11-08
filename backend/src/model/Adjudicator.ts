import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DebateAdjudicator, ScoredBallot } from ".";

@Entity()
export class Adjudicator {
	// @OneToMany(type => ScoredBallot, ballot => ballot.adjudicator)
	// public ballots: ScoredBallot[];
	@OneToMany(type => DebateAdjudicator, debateAdjudicator => debateAdjudicator.adjudicator)
	public debates: DebateAdjudicator[];
	@PrimaryColumn()
	public id: number;
	@Column()
	public key: string;
	@Column()
	public name: string;
}