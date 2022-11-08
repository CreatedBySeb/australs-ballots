import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Venue {
	@PrimaryColumn()
	public id: number;
	@Column()
	public name: string;
}