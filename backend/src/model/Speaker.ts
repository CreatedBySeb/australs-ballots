import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Team } from ".";

@Entity()
export class Speaker {
	@PrimaryColumn()
	public id: number;
	@Column()
	public name: string;
	@ManyToOne(type => Team, team => team.speakers)
	public team: Team;
}