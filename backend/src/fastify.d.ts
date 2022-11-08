import EventEmitter from "events";
import { Connection } from "typeorm";
import { Tabbycat } from "./tabbycat";

declare module "fastify" {
	interface FastifyInstance {
		db: Connection;
		events: EventEmitter;
		password: string;
		tabbycat: Tabbycat;
	} 
}