<template>
	<div class="ballot-editor">
		<div v-for="(team, side) in { aff: affTeam, neg: negTeam }" class="team" :key="side">
			<h4>{{ (side == 'aff') ? "Affirmative" : "Negative" }} Team</h4>
			{{ team.name }}

			<table>
				<tr v-for="speakerNo in [0, 1, 2]" :key="speakerNo">
					<td>
						<label :for="`${side}-speaker-${speakerNo}`">{{ ordinals[speakerNo] }} Speaker</label>
						<select :id="`${side}-speaker-${speakerNo}`" v-model="ballot[`${side}Score`].speeches[speakerNo].speaker" :disabled="disabled">
							<option :value="undefined" disabled>Select a speaker...</option>
							<option v-for="speaker in getTeam(side).speakers" :key="speaker.id" :value="speaker.id">{{ speaker.name }}</option>
						</select>
					</td>
					<td>
						<label :for="`${side}-speaker-${speakerNo}-score`">Score</label>
						<input :id="`${side}-speaker-${speakerNo}-score`" v-model="ballot[`${side}Score`].speeches[speakerNo].score" type="number" min="70" max="80" :disabled="disabled" />
					</td>
				</tr>

				<tr>
					<td>
						<label :for="`${side}-reply`">Reply Speaker</label>
						<select :id="`${side}-reply`" v-model="ballot[`${side}Score`].reply.speaker" :disabled="disabled">
							<option :value="undefined" disabled>Select a speaker...</option>
							<option v-for="speaker in getTeam(side).speakers" :key="speaker.id" :value="speaker.id">{{ speaker.name }}</option>
						</select>
					</td>
					<td>
						<label :for="`${side}-reply-score`">Score</label>
						<input :id="`${side}-reply-score`" v-model="ballot[`${side}Score`].reply.score" type="number" min="35" max="40" :disabled="disabled" />
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DebateType, TeamType } from "../../../backend/dist/schema";

export class ScoredBallot {
	public affScore = new TeamScores();
	public negScore = new TeamScores();
}

export class TeamScores {
	public speeches = [new SpeechScore(), new SpeechScore(), new SpeechScore()] as const;
	public reply = new SpeechScore();
}

export class SpeechScore {
	public score: number | null = null;
	public speaker: number | null = null;
}

export default defineComponent({
	props: {
		ballot: {
			required: true,
			type: ScoredBallot,
		},

		debate: {
			required: true,
			type: Object as PropType<DebateType>,
		},

		disabled: {
			default: false,
			type: Boolean,
		},
	},

	data() {
		return {
			ordinals: ["1st", "2nd", "3rd"] as const,
		};
	},

	computed: {
		affTeam(): TeamType {
			return this.debate.teams.find((team) => team.position == 0)!.team;
		},

		negTeam(): TeamType {
			return this.debate.teams.find((team) => team.position == 1)!.team;
		},
	},

	methods: {
		getTeam(side: "aff" | "neg"): TeamType {
			return (side == "aff") ? this.affTeam : this.negTeam;
		},
	},
});
</script>

<style lang="scss">
.ballot-editor {
	display: flex;
	flex-wrap: wrap;
	padding: .5rem;

	.team {
		border: solid .1rem grey;
		border-radius: .5rem;
		flex: 1 0 40%;
		margin: 0;
		min-width: 36rem;
		padding: 1rem;

		&:first-child {
			margin-right: .5rem;
		}

		&:last-child {
			margin-left: .5rem;
		}

		h4 {
			margin: 0;
		}

		table {
			margin-top: 1rem;
			table-layout: fixed;
			width: 100%;

			td {
				box-sizing: border-box;
				display: inline-flex;
				
				&:first-child {
					width: 65%;
				}

				&:last-child {
					width: 35%;
					text-align: right;
				}

				label {
					flex-grow: 1;
					margin-right: .5rem;
				}

				input[type=number] {
					width: 4rem;
				}

				select {
					width: 14rem;
				}
			}
		}
	}
}
</style>