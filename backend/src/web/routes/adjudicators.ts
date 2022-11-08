import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { BadRequest, NotFound } from "http-errors";
import { Connection, FindOneOptions } from "typeorm";
import { Adjudicator, Debate, EliminationBallot, RoundStage, ScoredBallot, TeamPosition } from "../../model";
import { TeamScore } from "../../model/TeamScore";
import { AdjudicatorSchema, AdjudicatorType, BallotSchema, BallotType, DebateSchema, DebateType } from "../../schema";

async function adjudicatorGuard(db: Connection, condition: FindOneOptions<Adjudicator>): Promise<Adjudicator> {
	const adjudicator = await db.manager.findOne(Adjudicator, condition);
	if (adjudicator) return adjudicator;
	else throw new NotFound();
}

export default <FastifyPluginAsync> async function (server) {
	server.get<{
		Params: { adjudicatorKey: string };
		Reply: AdjudicatorType;
	}>("/:adjudicatorKey", {
		schema: {
			params: {
				key: Type.String(),
			},

			response: {
				200: AdjudicatorSchema,
			},
		},
	}, async (request) => {
		return await adjudicatorGuard(server.db, { where: { key: request.params.adjudicatorKey } });
	});

	server.get<{
		Params: { adjudicatorKey: string };
		Reply: DebateType | null;
	}>("/:adjudicatorKey/debate", {
		schema: {
			params: {
				adjudicatorKey: Type.String(),
			},
			response: {
				200: Type.Union([DebateSchema, Type.Null()]),
			},
		},
	}, async (request) => {
		const adjudicator = await adjudicatorGuard(server.db, { relations: ["debates"], where: { key: request.params.adjudicatorKey } }),
			debateIDs = adjudicator.debates.map((d) => d.debateId);

		const debates = await server.db.manager
			.createQueryBuilder(Debate, "debate")
			.leftJoinAndSelect("debate.adjudicators", "adjudicators")
			.leftJoinAndSelect("adjudicators.adjudicator", "adjudicator")
			.leftJoinAndSelect("debate.round", "round")
			.leftJoinAndSelect("debate.teams", "teams")
			.leftJoinAndSelect("teams.team", "team")
			.leftJoinAndSelect("team.speakers", "speakers")
			.leftJoinAndSelect("debate.venue", "venue")
			.where("adjudicator.id = :adjudicatorID AND round.available = :available", { adjudicatorID: adjudicator.id, available: true })
			.getMany();

		if (debates.length && debates[debates.length - 1]) return debates[debates.length - 1];
		else throw new NotFound();
	});

	server.post<{
		Body: BallotType,
		Params: { adjudicatorKey: string, roundID: number },
	}>("/:adjudicatorKey/debate/:roundID", {
		schema: {
			body: BallotSchema,
			params: {
				adjudicatorKey: Type.String(),
				roundID: Type.Number(),
			},
		}
	}, async (request) => {
		const adjudicator = await adjudicatorGuard(server.db, { relations: ["debates"], where: { key: request.params.adjudicatorKey } }),
			debateIDs = adjudicator.debates.map((d) => d.debateId);

		const debate = await server.db.manager.findOne(Debate, { relations: ["teams"], where: { id: debateIDs[debateIDs.length - 1], round: { id: request.params.roundID } } });
		if (!debate) throw new NotFound();

		if (debate.round.stage == RoundStage.PRELIMINARY) {
			const body = request.body;
			if (!("affScore" in body) || !("negScore" in body)) throw new BadRequest();

			const ballot = new ScoredBallot();
			ballot.debate = debate;
			ballot.adjudicator = adjudicator;
			
			ballot.affScore = new TeamScore();
			ballot.negScore = new TeamScore();

			ballot.affScore.teamId = debate.teams.find((team) => team.position == TeamPosition.AFFIRMATIVE)!.teamId;
			ballot.negScore.teamId = debate.teams.find((team) => team.position == TeamPosition.NEGATIVE)!.teamId;
			
			([1, 2, 3] as const).forEach((num) => {
				ballot.affScore[`speech${num}Score`] = body.affScore.speeches[num - 1].score;
				ballot.affScore[`speech${num}SpeakerId`] = body.affScore.speeches[num - 1].speaker;

				ballot.negScore[`speech${num}Score`] = body.negScore.speeches[num - 1].score;
				ballot.negScore[`speech${num}SpeakerId`] = body.negScore.speeches[num - 1].speaker;
			});

			ballot.affScore.replyScore = body.affScore.reply.score;
			ballot.affScore.replySpeakerId = body.affScore.reply.speaker;
			ballot.negScore.replyScore = body.negScore.reply.score;
			ballot.negScore.replySpeakerId = body.negScore.reply.speaker;

			await server.db.manager.save(ballot.affScore);
			await server.db.manager.save(ballot.negScore);
			await server.db.manager.save(ballot);
		} else {
			if (!("winner" in request.body)) throw new BadRequest();

			const ballot = new EliminationBallot();

			ballot.debate = debate;
			ballot.adjudicator = adjudicator;
			ballot.winner = request.body.winner;

			await server.db.manager.save(ballot);
		}

		server.events.emit("event", {
			debate: debate.id,
			event: "ballot",
			round: request.params.roundID,
		});

		return "OK";
	});
};