import { FastifyPluginAsync } from "fastify";
import adjudicators from "./adjudicators";
import tab from "./tab";

export default <FastifyPluginAsync> async function (server) {
	server.register(adjudicators, { prefix: "/adjudicators" });
	server.register(tab, { prefix: "/tab" });
}