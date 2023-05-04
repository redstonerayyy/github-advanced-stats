// only use standard nodejs libraries, does not require npm install
// code for each purpose can be found in the other files
import getconfig from "./config.mjs";
import getrepos from "./repos.mjs";
import syncrepos from "./reposync.mjs";
import analyserepos from "./analysis.mjs";
import generatesvgs from "./image.mjs";

const config = getconfig("./config.json");
const username = config.username;

// clone repos, get language stats
const repoinfo = await getrepos(username, config.ignored_repos);

const repopaths = syncrepos(repoinfo.repos, username);

const languagestats = await analyserepos(
	repopaths,
	config.ignored_folders,
	config.ignored_languages
);

generatesvgs(languagestats);
