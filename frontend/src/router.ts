import { createRouter, createWebHistory } from "vue-router";
import Judges from "./pages/Judges.vue";
import Tab from "./pages/tab/Index.vue";
import tabRoutes from "./pages/tab/routes";

export default createRouter({
	history: createWebHistory(),
	routes: [
		{
			name: "Judges",
			path: "/",
			component: Judges,
		},
		{
			name: "Tab",
			path: "/tab",
			component: Tab,
			children: tabRoutes,
		},
	],
});
