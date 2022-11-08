<template>
	<div id="judges">
		<h1 class="center">Nepal Australs 2021 Ballots System</h1>

		<form v-if="!self" class="center" @submit.prevent="validateCredentials">
			<h2><label for="private-url-input">Enter your Tabbycat Private URL: </label></h2>
			<input id="private-url-input" v-model="privateURL" type="url" :disabled="self != undefined" />
			<input type="submit" value="Submit" :disabled="self != undefined || !key" />
		</form>
		<template v-else>
			<h2 class="center">You're currently submitting as {{ self.name }}. <button @click="resetCredentials">Not you?</button></h2>

			<template v-if="debate">
				<h3 class="center">You are adjudicating in {{ debate.venue.name }} for {{ debate.round.name }} as a {{ role }}</h3>

				<p v-if="debateSelf.role == 0" class="center">
					You are a trainee, and so you are not able to submit a ballot.
				</p>
				<template v-else>
					<ScoredBallotEditor v-if="ballot && debate" :ballot="ballot" :debate="debate"></ScoredBallotEditor>

					<div v-if="warnings.length" class="warnings">
						<h3>Warnings</h3>
						<ul>
							<li v-for="warning in warnings" :key="warning">{{ warning }}</li>
						</ul>
					</div>

					<div class="center">
						<button class="large-button" :disabled="submitting || (warnings.length > 0)" @click="submitBallot()">{{ submitting ? "Submitting..." : "Submit Ballot" }}</button>
					</div>
				</template>
			</template>
			<p v-else>
				You are not currently adjudicating a round. Please contact tab if this is an error.
			</p>
		</template>
	</div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { AdjudicatorType, DebateType } from "../../../backend/dist/schema";
import ScoredBallotEditor, { ScoredBallot } from "../components/ScoredBallotEditor.vue";

const privateURLRegExp = /https?:\/\/[\w\d-.]+\/[\w\d_-]+\/privateurls\/([a-z0-9]{8})\/?/;

export default defineComponent({
	components: {
		ScoredBallotEditor,
	},

	data() {
		let privateURL: string | undefined, self: AdjudicatorType | undefined;

		try {
			const savedPrivateURL = window.localStorage.getItem("privateURL"), savedSelf = window.localStorage.getItem("self");
			if (!savedPrivateURL || !savedSelf) throw new Error();
			self = JSON.parse(savedSelf);
			privateURL = savedPrivateURL;
		} catch (error) {
			window.localStorage.removeItem("privateURL");
			window.localStorage.removeItem("self");
		}

		return {
			ballot: new ScoredBallot(),
			debate: <DebateType | undefined> undefined,
			privateURL: privateURL ?? "",
			self,
			submitting: false,
		};
	},

	computed: {
		debateSelf(): any {
			if (!this.self || !this.debate) return undefined;
			return this.debate.adjudicators.find((adj) => adj.adjudicator.id == this.self?.id);
		},

		key(): string | undefined {
			if (!this.privateURL) return undefined;
			const result = privateURLRegExp.exec(this.privateURL);

			if (result && result[1]) return result[1];
			else return undefined;
		},

		role(): string {
			if (!this.debateSelf) return "";

			switch (this.debateSelf.role) {
			case 0: return "Trainee";
			case 1: return "Panellist";
			case 2: return "Chair";
			}

			return "";
		},

		warnings(): string[] {
			const warnings: string[] = [];

			(["aff", "neg"] as const).forEach((side) => {
				const scores = this.ballot[`${side}Score`];

				scores.speeches.forEach((speech, i) => {
					if (speech.speaker == null) warnings.push(`No speaker selected for ${side} speech ${i + 1}`);
					else if (speech.score == null) warnings.push(`No score input for ${side} speech ${i + 1}`);
					else if (speech.score < 70 || speech.score > 80) warnings.push(`${side} speech ${i + 1} score is outside of permitted range 70-80.`);
				});

				if (scores.reply.speaker == null) warnings.push(`No speaker selected for ${side} reply`);
				else if (scores.reply.speaker == scores.speeches[2].speaker) warnings.push(`3rd speaker cannot give ${side}'s reply`);
				else if (scores.reply.score == null) warnings.push(`No score input for ${side} reply`);
				else if (scores.reply.score < 35 || scores.reply.score > 40) warnings.push(`${side} reply score is outside of permitted range 35-40.`);
			});

			return warnings;
		},
	},
	methods: {
		async fetchDebate() {
			this.debate = (await axios.get<DebateType>(`/api/adjudicators/${this.key}/debate`)).data;
			console.log(this.debate);
		},

		resetCredentials() {
			this.privateURL = "";
			this.self = undefined;
			window.localStorage.removeItem("privateURL");
			window.localStorage.removeItem("self");
		},

		saveCredentials() {
			if (this.key && this.self) {
				window.localStorage.setItem("privateURL", this.privateURL);
				window.localStorage.setItem("self", JSON.stringify(this.self));
			}
		},

		async submitBallot() {
			if (!this.debate || this.warnings.length > 0) return;

			this.submitting = true;

			try {
				await axios.post(`/api/adjudicators/${this.key}/debate/${this.debate.round.id}`, this.ballot);
				alert("Successfully submitted ballot");
			} catch (error) {
				if (error instanceof Error) alert(error.toString());
				this.submitting = false;
			}
		},

		async validateCredentials() {
			if (this.key) {
				this.self = (await axios.get<AdjudicatorType>(`/api/adjudicators/${this.key}`)).data;
				this.saveCredentials();
				this.fetchDebate();
			}
		},
	},
	mounted() {
		if (this.key) this.validateCredentials();
	},
});
</script>

<style lang="scss">
#judges {
	.warnings {
		h3 {
			margin-top: 0;
			margin-bottom: .5rem;
		}

		ul {
			margin: 0;
		}
	}
}
</style>