import EventEmitter from "events";
import fastify, { FastifyInstance } from "fastify";
import fastifyWebSocket from "fastify-websocket";
import { TabbycatConfiguration } from "../tabbycat";
import database from "./database";
import routes from "./routes";
import tabbycat from "./tabbycat";

export class WebServer {
	protected server: FastifyInstance;

	constructor(password: string, dbPath: string, tabbycatConfig: TabbycatConfiguration) {
		this.server = fastify({ logger: true });

		this.server.decorate("events", new EventEmitter());
		this.server.decorate("password", password);

		this.server.register(fastifyWebSocket);

		this.server.register(database, { dbPath });

		this.server.register(tabbycat, tabbycatConfig);

		this.server.register(routes, {
			prefix: "/api",
		});
	}

	public async listen(port: number) {
		await this.server.listen(port);
	}
}