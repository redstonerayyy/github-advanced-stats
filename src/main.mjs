/*------------ code for each purpose can be found in the other files ------------*/
import getconfig from "./config.mjs";
import getrepos from "./repos.mjs";
import syncrepos from "./reposync.mjs";
import analyserepos from "./analysis.mjs";
import accountstats from "./account.mjs";
import generatesvgs from "./image.mjs";

/*------------ config ------------*/
import * as dotenv from "dotenv";
dotenv.config();
const GHTOKEN = process.env.GHTOKEN;

const config = getconfig("./config.json");
const username = config.username;

/*------------ clone repos, get language stats ------------*/
// const repoinfo = await getrepos(username, config.ignored_repos);

// const repopaths = syncrepos(repoinfo.repos, username);

// const languagestats = await analyserepos(
// 	repopaths,
// 	config.ignored_folders,
// 	config.ignored_languages
// );

/*------------ get user info using the graphql api ------------*/
const accountinfo = await accountstats(username, GHTOKEN);

/*------------ generate svgs ------------*/
// generatesvgs(languagestats);
