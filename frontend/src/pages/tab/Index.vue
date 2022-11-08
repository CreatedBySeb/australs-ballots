<template>
	<div id="tab">
		<h1 class="center">Nepal Australs 2021 Ballots System</h1>

		<form v-if="!authenticated" class="center" @submit.prevent="authenticate()">
			<label for="tab-password">Password: </label>
			<input id="tab-password" v-model="password" type="password" />
			<input type="submit" value="Submit" />
			<br />
			<label for="tab-password-save">Save Password</label>
			<input id="tab-password-save" v-model="savePassword" type="checkbox" />
		</form>
		<template v-else>
			<router-view :password="password"></router-view>
		</template>
	</div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";

export default defineComponent({
	data() {
		const password = window.localStorage.getItem("tabPassword");

		return {
			authenticated: false,
			password: password ?? "",
			savePassword: password != null,
		};
	},

	methods: {
		async authenticate() {
			try {
				await axios.get("/api/tab", { headers: { Authorization: this.password } });
				this.authenticated = true;

				if (this.savePassword) window.localStorage.setItem("tabPassword", this.password);
			} catch (error) {
				if (error instanceof Error) alert(error.toString());
			}
		},
	},

	mounted() {
		if (this.password) this.authenticate();
	},
});
</script>