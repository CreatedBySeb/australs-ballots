<template>
	<div v-if="debate" id="tab-ballots">
		<div class="debate-header center">
			<h2>{{ debate.round.name }} - {{ debate.venue.name }}</h2>
			<h3>{{ panel }}</h3>
			<div>
				<router-link :to="{ name: 'Tab/Home', query: { round: debate.round.id } }">Back to Debates</router-link>
				<button @click="refreshBallots">Refresh Ballots</button>
				<button :disabled="debate.confirmed" @click="markConfirmed">Mark as Confirmed</button>
				<a :href="`https://australs2021.calicotab.com/_/admin/results/debate/${debate.id}/merge/latest/`" target="_blank" rel="noopener noreferrer">View on Tabbycat</a>
			</div>
		</div>

		<ul class="adjudicators">
			<li v-for="(adj, i) in filterTrainees(debate.adjudicators)" :key="adj.adjudicator.id">
				<h4>{{ formatAdjName(adj) }}</h4>

				<p v-if="!adjBallots[i]"><em>No Ballot Submitted</em></p>
				<ScoredBallotEditor v-else :ballot="adjBallots[i]!" :debate="debate" disabled></ScoredBallotEditor>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { DebateType } from "../../../../backend/dist/schema";
import { filterTrainees, formatAdjName, sortPanel, toPanelString } from "../../util";
import ScoredBallotEditor, { ScoredBallot, SpeechScore } from "../../components/ScoredBallotEditor.vue";

class AdjBallot extends ScoredBallot {
	public adj?: number;
}

export default defineComponent({
	components: { ScoredBallotEditor },

	props: {
		password: {
			required: true,
			type: String,
		},
	},

	data() {
		return {
			ballots: [] as AdjBallot[],
			debate: undefined as DebateType | undefined,
		};
	},

	computed: {
		adjBallots(): (AdjBallot | undefined)[] {
			if (!this.debate) return [];

			return filterTrainees(this.debate.adjudicators).map((adj) => {
				return this.ballots.find((ballot) => ballot.adj == adj.adjudicator.id);
			});
		},

		panel(): string {
			if (!this.debate) return "";
			else return toPanelString(this.debate);
		},
	},

	methods: {
		filterTrainees,
		formatAdjName,

		async markConfirmed() {
			try {
				await axios.post(`/api/tab/debates/${this.$route.params.debateID}/confirm`, {}, { headers: { Authorization: this.password } });
				alert("Successfully confirmed debate");
			} catch (error) {
				if (error instanceof Error) alert(error.toString());
			}
		},

		async refreshBallots() {
			this.ballots = (await axios.get<any[]>(`/api/tab/debates/${this.$route.params.debateID}/ballots`, { headers: { Authorization: this.password } })).data
				.map((data: any) => {
					const ballot = new AdjBallot();
					ballot.adj = data.adjudicatorId;

					(["aff", "neg"] as const).forEach((side) => {
						ballot[`${side}Score`].speeches = [1, 2, 3].map((speakerNo) => {
							const score = new SpeechScore();

							score.score = data[`${side}Score`][`speech${speakerNo}Score`];
							score.speaker = data[`${side}Score`][`speech${speakerNo}SpeakerId`];

							return score;
						}) as [SpeechScore, SpeechScore, SpeechScore];

						ballot[`${side}Score`].reply.score = data[`${side}Score`].replyScore;
						ballot[`${side}Score`].reply.speaker = data[`${side}Score`].replySpeakerId;
					});

					return ballot;
				});
		},
	},

	async mounted() {
		this.debate = (await axios.get<DebateType>(`/api/tab/debates/${this.$route.params.debateID}`, { headers: { Authorization: this.password } })).data;
		this.debate.adjudicators.sort(sortPanel);

		await this.refreshBallots();

		const ws = new WebSocket(`${window.location.protocol.replace("http", "ws")}//${window.location.host}/api/tab/events`);

		ws.addEventListener("message", (event) => {
			try {
				const message = JSON.parse(event.data);
				if (message.event == "ballot" && message.debate == this.$route.params.debateID) this.refreshBallots();
			} catch (error) {
				console.error(error);
			}
		});
	},
});
</script>

<style lang="scss">
#tab-ballots {
	.adjudicators {
		margin: 0;
		padding: 0;

		li {
			border: solid .1rem grey;
			border-radius: .5rem;
			list-style: none;
			margin: .5rem 0;
			padding: .5rem;

			h4 {
				margin: 0;
			}
		}
	}

	.debate-header {
		margin-bottom: 1rem;

		h2, h3 {
			margin: .5rem 0;
		}
	}	
}
</style>