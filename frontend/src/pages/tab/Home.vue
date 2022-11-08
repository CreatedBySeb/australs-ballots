<template>
	<div id="tab-home">
		<div class="center">
			<button @click="updateRounds">Update Rounds from Tab</button>
		</div>

		<div class="center">
			<label for="select-round">Round: </label>
			<select id="round" v-model="selectedRound" @change="refreshDebates">
				<option :value="undefined" disabled>{{ (rounds.length > 0) ? "Select a round" : "Loading rounds..." }}</option>
				<option v-for="round in rounds" :key="round.id" :value="round.id">{{ round.name }}</option>
			</select>
			<button @click="refreshRounds">Refresh</button>
		</div>

		<template v-if="selectedRound">
			<div>
				<label for="search-box">Search: </label>
				<input id="search-box" v-model="filterText" type="text" />
				<button @click="refreshDebates">Refresh Debates</button>
			</div>

			<ul class="debates">
				<li v-for="debate in filteredDebates" :key="debate.id">
					<router-link :to="{ name: 'Tab/Ballots', params: { debateID: debate.id } }">
						<strong>{{ debate.venue.name }}</strong> <em :class="`ballot-status-${getBallotStatus(debate)}`">{{ ballotStatusText[getBallotStatus(debate)] }}</em>
						<br />
						Panel: {{ toPanelString(debate) }}
					</router-link>
				</li>
			</ul>
		</template>
		<p v-else>
			Select a round to view debates.
		</p>
	</div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { DebateType, RoundType } from "../../../../backend/dist/schema";
import { filterTrainees, toPanelString } from "../../util";

enum BallotStatus {
	CONFIRMED,
	NONE,
	PARTIAL,
	FULL,
}

export default defineComponent({
	props: {
		password: {
			required: true,
			type: String,
		},
	},

	data() {
		const selectedRound = Number(this.$route.query.round);

		return {
			ballotStatusText: {
				[BallotStatus.CONFIRMED]: "Confirmed",
				[BallotStatus.FULL]: "All Submitted",
				[BallotStatus.NONE]: "None Submitted",
				[BallotStatus.PARTIAL]: "Partially Submitted",
			} as Record<BallotStatus, string>,
			debates: [] as DebateType[],
			filterText: "",
			rounds: [] as RoundType[],
			selectedRound: isNaN(selectedRound) ? undefined : selectedRound,
		};
	},

	computed: {
		filteredDebates(): DebateType[] {
			if (!this.filterText) return this.debates;
			else return this.debates.filter((debate) => {
				return debate.venue.name.toLowerCase().includes(this.filterText.toLowerCase());
			});
		},
	},

	methods: {
		getBallotStatus(debate: DebateType): BallotStatus {
			if (debate.confirmed) return BallotStatus.CONFIRMED;
			else if (!debate.ballots || debate.ballots.length < 1) return BallotStatus.NONE;
			else if (debate.ballots.length < filterTrainees(debate.adjudicators).length) return BallotStatus.PARTIAL;
			else return BallotStatus.FULL;
		},

		async refreshDebates() {
			if (!this.selectedRound) return;
			this.$router.push({ name: "Tab/Home", query: { round: this.selectedRound } });

			this.debates = (await axios.get<DebateType[]>(`/api/tab/rounds/${this.selectedRound}`, { headers: { Authorization: this.password } })).data
				.sort((a, b) => {
					const [aStatus, bStatus] = [this.getBallotStatus(a), this.getBallotStatus(b)];
					if (aStatus != bStatus) return bStatus - aStatus;
					else return a.venue.name.localeCompare(b.venue.name);
				});
		},

		async refreshRounds() {
			this.rounds = (await axios.get<RoundType[]>("/api/tab/rounds", { headers: { Authorization: this.password } })).data
				.sort((a, b) => a.id - b.id);
		},

		toPanelString,

		async updateRounds() {
			try {
				alert((await axios.post("/api/tab/update/rounds", {}, { headers: { Authorization: this.password } })).data);
				this.refreshRounds();
			} catch (error) {
				if (error instanceof Error) alert(error.toString());
			}
		},
	},

	mounted() {
		this.refreshRounds();
		if (this.selectedRound) this.refreshDebates();

		const ws = new WebSocket(`${window.location.protocol.replace("http", "ws")}//${window.location.host}/api/tab/events`);

		ws.addEventListener("message", (event) => {
			try {
				const message = JSON.parse(event.data);
				if (message.event == "ballot" && message.round == this.selectedRound) this.refreshDebates();
			} catch (error) {
				console.error(error);
			}
		});
	},
});
</script>

<style lang="scss">
#tab-home {
	.debates {
		margin: .5rem 0;
		padding: 0;

		li {
			border: grey solid .1rem;
			border-radius: .5rem;
			box-sizing: border-box;
			list-style: none;
			margin: .25rem;

			a {
				color: inherit;
				cursor: pointer;
				display: block;
				padding: .5rem;
				position: relative;
				text-decoration: none;

				&::after {
					content: "›";
					font-size: 2.4rem;
					line-height: 3.6rem;
					position: absolute;
					right: 1rem;
					top: 0;
				}
			}

			.ballot-status-0 {
				color: green;
			}

			.ballot-status-1 {
				color: red;
			}

			.ballot-status-2 {
				color: orange;
			}

			.ballot-status-3 {
				color: blue;
			}
		}
	}
}
</style>