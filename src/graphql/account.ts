// query stats from github using the graphql api
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
        followers {
            totalCount
        }
        following {
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
        repositories {
            totalCount
        }
    }
}
`;

export default async function accountstats(username: string, token: string) {
	const info = await graphql(QUERY, {
		username: username,
		headers: {
			authorization: `bearer ${token}`,
		},
	});
	console.log(info);
	return info;
}
