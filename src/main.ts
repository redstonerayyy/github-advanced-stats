/*------------ imports ------------*/
import { getconfig, Config } from "./config.js";
import graphqlinfo from "./graphql/grapql.js";
import restinfo from "./rest/rest.js";
import getrepos from "./scraping/repos.js";
import syncrepos from "./clone/reposync.js";
import analyserepos from "./clone/repoanalysis.js";
import { generatelangsvgs, generateusersvgs } from "./image/image.js";

/*------------ config ------------*/
import * as dotenv from "dotenv";
import { graphql } from "@octokit/graphql";
dotenv.config();
const GHTOKEN = process.env.GHTOKEN || null;

const config = getconfig("./config.json");
const username = config.username;

/*------------ get public repos ------------*/
const repoinfo = await getrepos(username);

/*------------ clone repos, analyse cloned repos ------------*/
if (config.clone) {
	const repopaths = syncrepos(repoinfo.repos, username);

	const languagestats = await analyserepos(
		repopaths,
		config.ignored_repos,
		config.ignored_folders,
		config.ignored_languages
	);

	generatelangsvgs(languagestats);
}

/*------------ get user info using the graphql/rest api ------------*/
if (config.user) {
	if (GHTOKEN !== null) {
		const graphql = await graphqlinfo(username, GHTOKEN);
		const rest = await restinfo(username, repoinfo.repos, GHTOKEN);
		generateusersvgs(graphql, rest);
	}
}
