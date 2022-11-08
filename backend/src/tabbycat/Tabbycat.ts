import Axios, { AxiosError, AxiosInstance } from "axios";
import { Adjudicator, BreakCategory, CheckInIdentifier, Debate, DrawStatus, Institution, Round, Speaker, Team, Venue, VenueCategory } from ".";
import { Motion } from "./Motion";
import { SpeakerCategory } from "./SpeakerCategory";

/**
 * Configuration options for a tournament's Tabbycat tab.
 */
export interface TabbycatConfiguration {
	token: string;
	tournament: string;
	url: string;
}

export interface Participants {
	adjudicators: Adjudicator[];
	speakers: Speaker[];
}

/**
 * This is based on tabtastic-beta/tabbycat, not the new tabbycat-js
 * Eventually this will be replaced fully by tabbycat-js, but it is not yet stable
 */
export class Tabbycat {
	public siteURL: string;
	public tournament: string;
	private config: TabbycatConfiguration;
	private http: AxiosInstance;

	constructor(config: TabbycatConfiguration) {
		this.config = config;

		this.http = Axios.create({
			baseURL: this.config.url + "/api",
			headers: { "Authorization": "Token " + this.config.token },
		});

		this.http.interceptors.response.use(undefined, (error: AxiosError) => {
			if (error.response && error.response.status >= 400) console.error(error);
			return Promise.reject(error);
		});

		this.siteURL = this.config.url;
		this.tournament = this.config.tournament;
	}

	public async checkInAll(): Promise<void> {
		const participants = await this.getAllParticipants();
		if (!participants) throw new Error("Unable to fetch participants.");
		else {
			await Promise.all([
				...participants.adjudicators.map((adjudicator) => this.http.put(`/v1/tournaments/${this.tournament}/adjudicators/${adjudicator.id}/checkin`).catch((e) => console.error(e))),
				...participants.speakers.map((speaker) => this.http.put(`/v1/tournaments/${this.tournament}/speakers/${speaker.id}/checkin`).catch((e) => console.error(e))),
			]);
		}
	}

	public async checkInParticipant(id: number, type: "adjudicator" | "speaker"): Promise<void> {
		await this.http.put(`/v1/tournaments/${this.tournament}/${type}s/${id}/checkin`).catch((e) => console.error(e));
	}

	public async checkOutAll(): Promise<void> {
		const participants = await this.getAllParticipants();

		if (!participants) throw new Error("Unable to fetch participants.");
		else {
			await Promise.all([
				...participants.adjudicators.map((adjudicator) => this.http.delete(`/v1/tournaments/${this.tournament}/adjudicators/${adjudicator.id}/checkin`).catch((e) => console.error(e))),
				...participants.speakers.map((speaker) => this.http.delete(`/v1/tournaments/${this.tournament}/speakers/${speaker.id}/checkin`).catch((e) => console.error(e))),
			]);
		}
	}

	public async checkOutParticipant(id: number, type: "adjudicator" | "speaker"): Promise<void> {
		await this.http.delete(`/v1/tournaments/${this.tournament}/${type}s/${id}/checkin`).catch((e) => console.error(e));
	}

	public async createAdjudicator(data: Partial<Adjudicator>): Promise<Adjudicator> {
		const response = await this.http.post(`/v1/tournaments/${this.tournament}/adjudicators`, data);
		return response?.data;
	}

	public async createAllCheckInIdentifiers(): Promise<(CheckInIdentifier | undefined)[]> {
		const participants = await this.getAllParticipants();

		if (!participants) throw new Error("Unable to fetch participants.");
		else {
			const Promises = await Promise.all([
				...participants.adjudicators.map((adjudicator) => this.http.post(`/v1/tournaments/${this.tournament}/adjudicators/${adjudicator.id}/checkin`).catch((e) => console.error(e))),
				...participants.speakers.map((speaker) => this.http.post(`/v1/tournaments/${this.tournament}/speakers/${speaker.id}/checkin`).catch((e) => console.error(e))),
			]);

			return Promises.map((promise) => (promise) ? promise.data : undefined);
		}
	}

	public async createCheckInIdentifier(id: number, type: "adjudicator" | "speaker"): Promise<CheckInIdentifier> {
		try {
			const response = await this.http.post(`/v1/tournaments/${this.tournament}/${type}s/${id}/checkin`);
			return response?.data;
		} catch (error) {
			console.error(<AxiosError>error);
			throw error;
		}
	}

	public async createInstitution(data: Partial<Institution>): Promise<Institution> {
		const response = await this.http.post("/v1/institutions", data);
		return response?.data;
	}

	public async createSpeaker(data: Partial<Speaker>): Promise<Speaker> {
		const response = await this.http.post(`/v1/tournaments/${this.tournament}/speakers`, data);
		return response?.data;
	}

	public async createTeam(data: Partial<Team>): Promise<Team> {
		const response = await this.http.post(`/v1/tournaments/${this.tournament}/teams`, data);
		return response?.data;
	}

	public async deleteAdjudicator(id: number): Promise<void> {
		await this.http.delete(`/v1/tournaments/${this.tournament}/adjudicators/${id}`);
	}

	public async deleteInstitution(id: number): Promise<void> {
		await this.http.delete(`/v1/institutions/${id}`);
	}

	public async deleteSpeaker(id: number): Promise<void> {
		await this.http.delete(`/v1/tournaments/${this.tournament}/speakers/${id}`);
	}

	public async deleteSpeakerCategory(id: number): Promise<void> {
		await this.http.delete(`/v1/tournaments/${this.tournament}/speaker-categories/${id}`);
	}

	public async deleteTeam(id: number): Promise<void> {
		await this.http.delete(`/v1/tournaments/${this.tournament}/teams/${id}`);
	}

	public async getAdjudicators(): Promise<Adjudicator[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/adjudicators`);
		return response?.data;
	}

	public async getAllParticipants(): Promise<Participants> {
		const adjudicators = await this.getAdjudicators(),
			speakers = await this.getSpeakers();

		if (adjudicators && speakers) return { adjudicators, speakers };
		else if (!adjudicators) throw new Error("Unable to fetch adjudicators.");
		else throw new Error("Unable to fetch speakers");
	}

	public async getBreakCategories(): Promise<BreakCategory[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/break-categories`);
		return response?.data;
	}

	public async getDebates(round: number): Promise<Debate[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/rounds/${round}/pairings`);
		return response?.data || [];
	}

	public getIDFromURL(url: string): number {
		const parts = url.split("/");
		return Number(parts[parts.length - 1]);
	}

	public async getInstitutions(tournament?: string): Promise<Institution[]> {
		const response = await this.http.get((tournament) ? `/v1/tournaments/${tournament}/institutions` : "/v1/institutions");
		return response?.data;
	}

	public async getParticipant(id: number, type: "adjudicator"): Promise<Adjudicator>;
	public async getParticipant(id: number, type: "speaker"): Promise<Speaker>;
	public async getParticipant(id: number, type: "adjudicator" | "speaker"): Promise<Adjudicator | Speaker>;
	public async getParticipant(id: number, type: "adjudicator" | "speaker"): Promise<Adjudicator | Speaker> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/${type}s/${id}`);
		return response?.data;
	}

	public async getPrivateURL(id: number, type: "adjudicator" | "speaker"): Promise<string | undefined> {
		const participant = await this.getParticipant(id, type),
			key = participant?.url_key;
			
		if (key) return `${this.siteURL}/${this.tournament}/privateurls/${key}`;
		else return undefined;
	}

	public async getRound(seq: number): Promise<Round> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/rounds/${seq}`);
		
		if (!response) throw new Error("Unable to fetch round.");
		else return response.data;
	}

	public async getRounds(status?: DrawStatus): Promise<Round[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/rounds`);
		
		if (!response) throw new Error("Unable to fetch rounds.");
		else {
			if (!status) return response.data;
			else return response.data.filter((round: Round) => round.draw_status == status);
		}
	}

	public async getSpeakerCategory(id: number): Promise<SpeakerCategory> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/speaker-categories/${id}`);
		return response?.data;
	}

	public async getSpeakerCategories(): Promise<SpeakerCategory[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/speaker-categories`);
		return response?.data;
	}

	public async getSpeakers(): Promise<Speaker[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/speakers`);
		return response?.data;
	}

	public async getTeam(id: number): Promise<Team> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/teams/${id}`);
		return response?.data;
	}

	public async getTeams(): Promise<Team[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/teams`);
		return response?.data;
	}
	
	public async getVenue(id: number): Promise<Venue> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/venues/${id}`);
		return response?.data;
	}

	public async getVenues(): Promise<Venue[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/venues`);
		return response?.data || [];
	}

	public async getVenueCategories(): Promise<VenueCategory[]> {
		const response = await this.http.get(`/v1/tournaments/${this.tournament}/venue-categories`);
		return response?.data || [];	
	}

	public async releaseDraw(round: Round): Promise<Round> {
		const response = await this.http.post(`/v1/tournaments/${this.tournament}/rounds/${round.seq}`, Object.assign(round, { draw_status: DrawStatus.RELEASED }));
		return response?.data;
	}

	public async releaseMotion(round: Round, start: string): Promise<Round> {
		const response = await this.http.post(`/v1/tournaments/${this.tournament}/rounds/${round.seq}`, Object.assign(round, { motions_released: true, starts_at: start }));

		return response?.data;
	}

	public async setInfoSlide(rounds: Round[], infoSlide: string): Promise<void> {
		await Promise.all(rounds.map((round) => {
			if (!round.motions) round.motions = [{} as Motion];
			round.motions[0].info_slide = infoSlide;
			return this.http.post(`/v1/tournaments/${this.tournament}/rounds/${round.seq}`, round);
		}));
	}

	public async setMotion(rounds: Round[], motion: string): Promise<void> {
		await Promise.all(rounds.map((round) => {
			if (!round.motions) round.motions = [{} as Motion];
			round.motions[0].text = motion;
			return this.http.post(`/v1/tournaments/${this.tournament}/rounds/${round.seq}`, round);
		}));
	}

	public async setVenueURL(venue: Venue, external_url: string): Promise<void> {
		await this.http.post(`/v1/tournaments/${this.tournament}/venues/${venue.id}`, Object.assign(venue, { external_url }));
	}

	public toPrivateURL(key: string | null): string | null {
		return (key) ? `${this.siteURL}/${this.tournament}/privateurls/${key}` : null;
	}

	public async updateAdjudicator(adjudicator: Partial<Adjudicator>): Promise<Adjudicator> {
		const response = await this.http.post<Adjudicator>(`/v1/tournaments/${this.tournament}/adjudicators/${adjudicator.id}`, adjudicator);
		return response.data;
	}

	public async updateInstitution(institution: Partial<Institution>): Promise<Institution> {
		const response = await this.http.post<Institution>(`/v1/institutions/${institution.id}`, institution);
		return response.data;
	}

	public async updateSpeaker(speaker: Partial<Speaker>): Promise<Speaker> {
		const response = await this.http.post<Speaker>(`/v1/tournaments/${this.tournament}/speakers/${speaker.id}`, speaker);
		return response.data;
	}

	public async updateSpeakerCategory(id: number, speakerCategory: Partial<SpeakerCategory>): Promise<SpeakerCategory> {
		const response = await this.http.post<SpeakerCategory>(`/v1/tournaments/${this.tournament}/speaker-categories/${id}`, speakerCategory);
		return response.data;
	}

	public async updateTeam(team: Partial<Omit<Team, "speakers"> & { speakers: Partial<Speaker>[] }>): Promise<Team> {
		const response = await this.http.post<Team>(`/v1/tournaments/${this.tournament}/teams/${team.id}`, team);
		return response.data;
	}
}
