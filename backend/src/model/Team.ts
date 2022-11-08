import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Speaker } from ".";

@Entity()
export class Team {
	@PrimaryColumn()
	public id: number;
	@Column()
	public name: string;
	@OneToMany(type => Speaker, speaker => speaker.team)
	public speakers: Speaker[];
}