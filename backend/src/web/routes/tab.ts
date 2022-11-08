import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { NotFound, Unauthorized } from "http-errors";
import { Adjudicator, AdjudicatorRole, Debate, DebateAdjudicator, DebateTeam, EliminationBallot, Round, RoundStage, ScoredBallot, Team, TEAM_POSITION_MAP, Venue } from "../../model";
import { DebateSchema, DebateType, RoundSchema } from "../../schema";

function passwordGuard(request: FastifyRequest, server: FastifyInstance) {
	if (request.headers.authorization != server.password) throw new Unauthorized();
}

export default <FastifyPluginAsync> async function (server) {
	async function createDebateAdjudicator(adjudicator: number, debate: Debate, role: AdjudicatorRole, index?: number) {
		const debateAdjudicator = new DebateAdjudicator();

		debateAdjudicator.adjudicator = (await server.db.manager.findOne(Adjudicator, adjudicator))!;
		debateAdjudicator.debate = debate;
		debateAdjudicator.id = `${debate.id}-${role}`;
		if (index) debateAdjudicator.id += `-${index}`;
		debateAdjudicator.role = role;

		return server.db.manager.save(DebateAdjudicator, debateAdjudicator);
	}

	function findBallots(debate: Debate): Promise<EliminationBallot[] | ScoredBallot[]> {
		return server.db.manager.find((debate.round.stage == RoundStage.PRELIMINARY) ? ScoredBallot : EliminationBallot)
	}
	
	server.addHook("preHandler", async (request) => {
		if (request.routerPath != "/api/tab/events") passwordGuard(request, server);
	});

	server.get("/", async () => {
		return "OK";
	});

	server.get<{
		Params: { debateID: string };
	}>("/debates/:debateID", {
		schema: {
			params: { debateID: Type.String() },
		},
	}, async (request) => {
		const debate = await server.db.manager.createQueryBuilder(Debate, "debate")
			.leftJoinAndSelect("debate.adjudicators", "adjudicators")
			.leftJoinAndSelect("adjudicators.adjudicator", "adjudicator")
			.leftJoinAndSelect("debate.round", "round")
			.leftJoinAndSelect("debate.teams", "teams")
			.leftJoinAndSelect("teams.team", "team")
			.leftJoinAndSelect("team.speakers", "speakers")
			.leftJoinAndSelect("debate.venue", "venue")
			.where("debate.id = :debateID", { debateID: request.params.debateID })
			.getOneOrFail();

		return Object.assign(debate, { ballots: await findBallots(debate) });
	});

	server.get<{
		Params: { debateID: string };
	}>("/debates/:debateID/ballots", {
		schema: {
			params: { debateID: Type.String() },
		},
	}, async (request) => {
		return await server.db.manager.find(ScoredBallot, { relations: ["adjudicator", "affScore", "negScore"], where: { debateId: request.params.debateID } });
	});

	server.post<{
		Params: { debateID: string };
	}>("/debates/:debateID/confirm", {
		schema: {
			params: { debateID: Type.String() },
		},
	}, async (request) => {
		const debate = await server.db.manager.findOne(Debate, { where: { id: request.params.debateID } });
		if (!debate) throw new NotFound();

		debate.confirmed = true;
		await server.db.manager.save(debate);

		server.events.emit("event", {
			debate: debate.id,
			event: "ballot",
			round: debate.roundId,
		});

		return "Ok";
	});

	server.get("/events", { websocket: true }, (connection) => {
		server.events.on("event", (data) => {
			connection.socket.send(JSON.stringify(data));
		});
	});

	server.get("/rounds", {
		schema: {
			response: { 200: Type.Array(RoundSchema) },
		},
	}, async () => {
		return await server.db.manager.find(Round);
	});

	server.get<{
		Params: { roundID: string };
		Reply: DebateType[];
	}>("/rounds/:roundID", {
		schema: {
			params: { roundID: Type.String() },
			response: { 200: Type.Array(DebateSchema) },
		},
	}, async (request) => {
		const debates = await server.db.manager.createQueryBuilder(Debate, "debate")
			.leftJoinAndSelect("debate.adjudicators", "adjudicators")
			.leftJoinAndSelect("adjudicators.adjudicator", "adjudicator")
			.leftJoinAndSelect("debate.round", "round")
			.leftJoinAndSelect("debate.teams", "teams")
			.leftJoinAndSelect("teams.team", "team")
			.leftJoinAndSelect("team.speakers", "speakers")
			.leftJoinAndSelect("debate.venue", "venue")
			.where("roundId = :roundID", { roundID: request.params.roundID })
			.getMany();

		await Promise.all(debates.map(async (debate) => {
			Object.assign(debate, { ballots: await findBallots(debate) });
		}));

		return debates;
	});

	server.post("/update/rounds", async () => {
		const roundData = await server.tabbycat.getRounds();

		const rounds = await Promise.all(roundData.map((r) => {
			const round = new Round();

			round.available = !r.completed && r.draw_status == "R";
			round.id = r.seq;
			round.name = r.name;
			round.stage = (r.stage == "P") ? RoundStage.PRELIMINARY : RoundStage.ELIMINATION;

			return server.db.manager.save(round);
		}));

		server.log.info(`Updated ${rounds.length} rounds.`);

		const availableRounds = await Promise.all(
			rounds.filter((r) => r.available)
				.map(async (round) => {
					const debates = await server.tabbycat.getDebates(round.id);

					return Promise.all(debates.map((async (d) => {
						const debate = new Debate();

						debate.id = d.id;
						debate.round = round;
						debate.venue = (await server.db.manager.findOne(Venue, server.tabbycat.getIDFromURL(d.venue)))!;

						await server.db.manager.save(debate);

						const promises = <Promise<any>[]> d.teams.map(async (position) => {
							const debateTeam = new DebateTeam();

							debateTeam.debate = debate;
							debateTeam.id = `${debate.id}-${position.side}`;
							debateTeam.position = TEAM_POSITION_MAP[position.side];
							debateTeam.team = (await server.db.manager.findOne(Team, server.tabbycat.getIDFromURL(position.team)))!;

							return server.db.manager.save(DebateTeam, debateTeam);
						});

						if (d.adjudicators.chair) {
							promises.push(createDebateAdjudicator(server.tabbycat.getIDFromURL(d.adjudicators.chair), debate, AdjudicatorRole.CHAIR));
						}

						d.adjudicators.panellists.forEach((a, i) => {
							promises.push(createDebateAdjudicator(server.tabbycat.getIDFromURL(a), debate, AdjudicatorRole.PANELLIST, i));
						});

						d.adjudicators.trainees.forEach((a, i) => {
							promises.push(createDebateAdjudicator(server.tabbycat.getIDFromURL(a), debate, AdjudicatorRole.TRAINEE, i));
						});

						await Promise.all(promises);
					})));
				})
		);

		server.log.info(`Updated debates for ${availableRounds.length} available rounds.`);
		return `Updated ${availableRounds.length} available rounds.`;
	});
};