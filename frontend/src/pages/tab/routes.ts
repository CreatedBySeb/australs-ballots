import { RouteRecordRaw } from "vue-router";
import Ballots from "./Ballots.vue";
import Home from "./Home.vue";

export default <RouteRecordRaw[]> [
	{
		name: "Tab/Home",
		path: "",
		component: Home,
	},
	{
		name: "Tab/Ballots",
		path: ":debateID",
		component: Ballots,
	},
];