import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Speaker, Team } from ".";

@Entity()
export class TeamScore {
	@PrimaryGeneratedColumn()
	public id: number;
	@Column()
	public speech1Score: number;
	@ManyToOne(type => Speaker)
	@JoinColumn()
	public speech1Speaker: Speaker;
	@Column()
	public speech1SpeakerId: number;
	@Column()
	public speech2Score: number;
	@ManyToOne(type => Speaker)
	@JoinColumn()
	public speech2Speaker: Speaker;
	@Column()
	public speech2SpeakerId: number;
	@Column()
	public speech3Score: number;
	@ManyToOne(type => Speaker)
	@JoinColumn()
	public speech3Speaker: Speaker;
	@Column()
	public speech3SpeakerId: number;
	@Column()
	public replyScore: number;
	@ManyToOne(type => Speaker)
	@JoinColumn()
	public replySpeaker: Speaker;
	@Column()
	public replySpeakerId: number;
	@ManyToOne(type => Team)
	public team: Team;
	@Column()
	public teamId: number;
}