import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Adjudicator, Debate } from ".";

export enum AdjudicatorRole {
	TRAINEE,
	PANELLIST,
	CHAIR,
}

@Entity()
export class DebateAdjudicator {
	@ManyToOne(type => Adjudicator, adjudicator => adjudicator.debates)
	public adjudicator: Adjudicator;
	@ManyToOne(type => Debate, debate => debate.adjudicators)
	public debate: Debate;
	@Column({ nullable: true })
	public debateId: number;
	@PrimaryColumn()
	public id: string;
	@Column()
	public role: AdjudicatorRole;
}