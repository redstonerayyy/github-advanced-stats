/*------------ query stats from github using the graphql api ------------*/
// you need to specify a valid access token for this
// to work either in a local .env file or as a secret
// for your repository

import { graphql } from "@octokit/graphql";

const QUERY = `
query userinf($username: String!) {
    rateLimit {
        cost
        remaining
        limit
        resetAt
    }
    user(login: $username) {
        login
        followers {
            totalCount
        }
        gists {
            totalCount
        }
        organizations {
            totalCount
        }
        projects {
            totalCount
        }
        contributionsCollection {
            totalCommitContributions
            totalRepositoryContributions
        }
        repositoriesContributedTo{
            totalCount
        }
        starredRepositories {
            totalCount
        }
        repositories(first: 100, isFork: false){
            totalCount
            nodes {
                stargazerCount
                forkCount
            }
        }
    }
}
`;

export default async function graphqlinfo(
	username: string,
	token: string
): Promise<{ [key: string]: any }> {
	try {
		let info: { [key: string]: any } = await graphql(QUERY, {
			username: username,
			headers: {
				authorization: `bearer ${token}`,
			},
		});

		/*------------ map object ------------*/
		info = info.user;

		/*------------ count stars and forks ------------*/
		let stars: number = 0;
		let forks: number = 0;
		info.repositories.nodes.forEach(
			(repository: { [key: string]: number }) => {
				stars += repository.stargazerCount;
				forks += repository.forkCount;
			}
		);

		/*------------ other stats ------------*/
		const followerscount = info.followers.totalCount;
		const gistcount = info.gists.totalCount;
		const organizationcount = info.organizations.totalCount;
		const projectcount = info.projects.totalCount;
		const commitcount =
			info.contributionsCollection.totalCommitContributions;
		const repototalcontribs =
			info.contributionsCollection.totalRepositoryContributions;
		const reporecentcontribs = info.repositoriesContributedTo.totalCount;

		/*------------ return stats ------------*/
		return {
			username: info.login,
			stars: stars,
			forks: forks,
			followerscount: followerscount,
			gistcount: gistcount,
			organizationcount: organizationcount,
			projectcount: projectcount,
			commitcount: commitcount,
			repototalcontribs: repototalcontribs,
			reporecentcontribs: reporecentcontribs,
		};
	} catch (e) {
		console.log("Error making GraphQL request!");
		return {};
	}
}
