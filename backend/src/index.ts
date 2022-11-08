import "reflect-metadata";
import { readFileSync } from "fs";
import { TabbycatConfiguration } from "./tabbycat";
import { WebServer } from "./web/WebServer";

interface Config {
	dbPath: string;
	password: string;
	port: number;
	tabbycat: TabbycatConfiguration;
}

function init() {
	const env: Config = JSON.parse(readFileSync(`${process.cwd()}/${process.env.ENV_FILE ?? "env.json"}`).toString());

	const server = new WebServer(env.password, env.dbPath, env.tabbycat);
	server.listen(env.port);
}

init();