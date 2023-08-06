/*------------ query stats from github using the rest api ------------*/
// you need to specify a valid access token for this
// to work either in a local .env file or as a secret
// for your repository

import { Octokit } from "@octokit/rest";

export default async function restinfo(
	username: string,
	repos: Array<string>,
	token: string
): Promise<{ [key: string]: any }> {
	/*------------ octokit rest api ------------*/
	const octokit = new Octokit({
		auth: token,
	});

	/*------------ count all repos together ------------*/
	let views = 0;
	let additions = 0;
	let deletions = 0;
	for (const reponame of repos) {
		/*------------ get views ------------*/
		try {
			const trafficinfo = await octokit.request(
				"GET /repos/{owner}/{repo}/traffic/views",
				{
					owner: username,
					repo: reponame,
					headers: {
						"X-GitHub-Api-Version": "2022-11-28",
					},
				}
			);

			views += trafficinfo.data.uniques;
		} catch (e) {
			console.info(
				`REST request for views for ${reponame} failed. This is nothing to worry about.`
			);
		}
		/*------------ changes from user ------------*/
		try {
			const changesinfo: { [key: string]: any } = await octokit.request(
				"GET /repos/{owner}/{repo}/stats/contributors",
				{
					owner: username,
					repo: reponame,
					headers: {
						"X-GitHub-Api-Version": "2022-11-28",
					},
				}
			);

			changesinfo.data.forEach((contributor: any) => {
				if (contributor.author.login == username) {
					contributor.weeks.forEach((week: any) => {
						additions += week.a;
						deletions += week.d;
					});
				}
			});
		} catch (e) {
			console.info(
				`REST request for changes for ${reponame} failed. This is nothing to worry about. There are just no recent changes to this repository`
			);
		}
	}
	/*------------ return stats ------------*/
	return { views: views, additions: additions, deletions: deletions };
}
