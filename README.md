# Australs Ballots System

This system was developed for Nepal Australs 2021 for blind ballot confirmation. All judges would first submit their ballot via Tabbycat, then would go to this separate ballot system to re-enter their ballot. The system fetches adjudicator, round and draw data from Tabbycat via the API, but the update needs to be manually triggered after each draw.

The general interface for judges is visible at the root page, and the interface for tab is available at `/tab`.

The judge interface is accessed by judges pasting their private URL, which then extracts the key and uses it to identify the judge and present them with the correct ballot for the active round.

The tab interface is accessed using the password defined in your `env.json` file, and lists the debates for each round, along with whether their ballots have been entirely submitted, partially submitted, not submitted at all or confirmed by a tab member, it also features a simple search which matches against room name. You can click a debate to see the ballots submitted for it, and there is a button to view the ballot set on Tabbycat (allowing this to be the central place to watch for ballots) and a button to mark the set as confirmed in the ballot system so that it is moved to the end of the list.

The system worked fairly robustly at Nepal Australs 2021, but has not been used since, so the working state of it with current Tabbycat versions is not guaranteed.

Areas flagged for improvement were the general appearance of the system, comparison with the ballots in Tabbycat on the page for a debate and flagging of discrepancies (now possible via Tabbycat's Ballots API) and confirming in the ballot system also confirming the ballots in Tabbycat.


## Technical Structure

This project is made of two components:

* The Backend, running on Node.js with the Fastify web framework and TypeORM as the database layer (these choices were mainly made for quick and flexible development)
* The Frontend, built by Vite with the Vue.js JavaScript framework and Axios for API requests.

All JavaScript is written in TypeScript for static typing, and Vue components are written as Single File Components (SFCs). WebSockets are used to provide the live updating of the Tab page's ballot statuses for each debate.

This code is sloppy, fair warning, it was developed quickly and only designed for internal use. It is designed to be fairly efficient, but there are definitely potential efficiency gains available throughout, and it is using an older version of the Tabbycat API client developed for Tabtastic.

The folder structure is designed sensibly, frontend code is all under `frontend/` and backend code is all under `backend/`, which are two separate npm packages managed using pnpm. Within frontend, you have static assets in `public/` and the JavaScript code under `src/`, which is then organised with core app code at the root, dynamic assets in `assets/`, reusable components in `components/` and page components in `pages/`. Within backend, you have the database model under `model/`, API schemas under `schema/`, Tabbycat API client under `tabbycat/` and the webserver code under `web/` with only the bootstrap and Cache in the root.

If you have more questions about weird code or design let me know!
