import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Debate } from ".";

export enum RoundStage {
	PRELIMINARY,
	ELIMINATION,
}

@Entity()
export class Round {
	@Column()
	public available: boolean;
	@OneToMany(type => Debate, debate => debate.round)
	public debates: Debate[];
	@PrimaryColumn()
	public id: number;
	@Column()
	public name: string;
	@Column({ default: RoundStage.PRELIMINARY })
	public stage: RoundStage;
}