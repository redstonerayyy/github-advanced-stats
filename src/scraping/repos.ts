/*------------ get user repositories using web scraping ------------*/

import * as https from "https";

/*------------ fetch the repositories page of the user and parse it ------------*/
export default async function getrepos(username: string) {
	/*------------ fetch repository tab webpage (do what curl does) ------------*/
	let webpage = "";
	await new Promise((resolve, reject) => {
		https
			.get(`https://github.com/${username}?tab=repositories`, (res) => {
				res.on("data", (chunk) => {
					webpage += chunk;
				}).on("end", () => {
					resolve(webpage);
				});
			})
			.on("error", (err) => {
				console.log("Error: ", err.message);
				console.log(`FATAL ERROR FETCHING REPOSITORIES`);
				process.exit(1);
			});
	});

	/*------------ remove spaces before matching ------------*/
	webpage = webpage.replaceAll(" ", "");
	/*------------ regex w/o spaces to match the relevant parts in the webpage ------------*/
	const reporegex = /<ahref="([A-Za-z:/.-]*)"itemprop="namecodeRepository">/g;
	/*------------ match repos ------------*/
	let array = [...webpage.matchAll(reporegex)];
	let repos = array.map((match) => match[1].split("/").reverse()[0]);

	/*------------ construct urls ------------*/
	let repourls = repos.map(
		(repo) => `https://github.com/${username}/${repo}`
	);

	/*------------ return repoinfo ------------*/
	return { repos: repos, repourls: repourls };
}
