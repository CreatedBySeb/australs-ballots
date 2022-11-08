import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { DebateAdjudicator, DebateTeam, Round, ScoredBallot, Venue } from ".";

@Entity()
export class Debate {
	@OneToMany(type => DebateAdjudicator, debateAdjudicator => debateAdjudicator.debate)
	public adjudicators: DebateAdjudicator[];
	// @OneToMany(type => ScoredBallot, ballot => ballot.debate)
	// public ballots: ScoredBallot[];
	@Column({ default: false })
	public confirmed: boolean;
	@PrimaryColumn()
	public id: number;
	@ManyToOne(type => Round, round => round.debates)
	public round: Round;
	@Column()
	public roundId: number;
	@OneToMany(type => DebateTeam, debateTeam => debateTeam.debate)
	public teams: DebateTeam[];
	@ManyToOne(type => Venue)
	public venue: Venue;
}