import fp from "fastify-plugin";
import { createConnection } from "typeorm";
import { Adjudicator, Debate, DebateAdjudicator, DebateTeam, EliminationBallot, Round, ScoredBallot, Speaker, Team, Venue } from "../model";
import { TeamScore } from "../model/TeamScore";

export default fp<{ dbPath: string }>(async (server, { dbPath }) => {
	server.decorate("db", await createConnection({
		type: "sqlite",
		database: dbPath,
		entities: [
			Adjudicator,
			Debate,
			DebateAdjudicator,
			DebateTeam,
			EliminationBallot,
			Round,
			ScoredBallot,
			Speaker,
			Team,
			TeamScore,
			Venue,
		],
		// synchronize: true,
		logging: true,
	}));
}, {
	fastify: "3.x",
	name: "database",
});