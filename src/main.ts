/*------------ imports ------------*/
import { getconfig, Config } from "./config.js";
import accountstats from "./graphql/account.js";
import getrepos from "./scraping/repos.js";
import syncrepos from "./clone/reposync.js";
import analyserepos from "./clone/repoanalysis.js";
import generatesvgs from "./image/image.js";

/*------------ config ------------*/
import * as dotenv from "dotenv";
dotenv.config();
const GHTOKEN = process.env.GHTOKEN || null;

const config = getconfig("./config.json");
const username = config.username;

/*------------ clone repos, analyse cloned repos ------------*/
const repoinfo = await getrepos(username);

const repopaths = syncrepos(repoinfo.repos, username);

const languagestats = await analyserepos(
	repopaths,
	config.ignored_repos,
	config.ignored_folders,
	config.ignored_languages
);

/*------------ get user info using the graphql api ------------*/
if (GHTOKEN !== null) {
	const accountinfo = await accountstats(username, GHTOKEN);
}

/*------------ generate svgs ------------*/
generatesvgs(languagestats);
