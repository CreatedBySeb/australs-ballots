import fp from "fastify-plugin";
import { Adjudicator, Speaker, Team, Venue } from "../model";
import { Tabbycat, TabbycatConfiguration } from "../tabbycat";

export default fp<TabbycatConfiguration>(async (server, config) => {
	const tabbycat = new Tabbycat(config);
	server.decorate("tabbycat", tabbycat);

	async function updateAdjudicators() {
		const adjudicatorData = await server.tabbycat.getAdjudicators();

		const adjudicators = await Promise.all(adjudicatorData.map((a) => {
			const adjudicator = new Adjudicator();

			adjudicator.id = a.id;
			adjudicator.key = a.url_key;
			adjudicator.name = a.name;
			
			return server.db.manager.save(adjudicator);
		}));

		server.log.info(`Updated ${adjudicators.length} adjudicators.`);
	}

	async function updateTeams() {
		const teamData = await server.tabbycat.getTeams();

		const teams = await Promise.all(teamData.map(async (t) => {
			const team = new Team();

			team.id = t.id;
			team.name = t.short_name;

			await server.db.manager.save(team);

			await Promise.all(t.speakers.map((s) => {
				const speaker = new Speaker();

				speaker.id = s.id;
				speaker.name = s.name;
				speaker.team = team;

				return server.db.manager.save(speaker);
			}));

			return team;
		}));

		server.log.info(`Updated ${teams.length} teams.`);
	}

	async function updateVenues() {
		const venueData = await server.tabbycat.getVenues();

		const venues = await Promise.all(venueData.map((v) => {
			const venue = new Venue();

			venue.id = v.id;
			venue.name = v.display_name;

			return server.db.manager.save(venue);
		}));

		server.log.info(`Updated ${venues.length} venues.`);
	}
	
	Promise.all([
		updateAdjudicators(),
		updateTeams(),
		updateVenues(),
	]);	
}, {
	"fastify": "3.x",
	"dependencies": ["database"],
	"name": "tabbycat",
});