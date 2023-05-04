// query stats from github using the graphql api
// you need to specify a valid access token for this
// to work either in a local .ENV file or as a secret
// for your repository

import { graphql } from "@octokit/graphql";

const q = `
query {
    rateLimit {
        cost
        remaining
        limit
        resetAt    
    }
    repository(owner:"Redstonerayy", name: "minecraft") {
        forkCount
        isFork
        isArchived
        stargazerCount
        
        collaborators {
            totalCount
        }
        
        watchers {
            totalCount
        }
        
        issues {
            totalCount
        }
        
        issuesopen: issues(states:OPEN) {
            totalCount
        } 
        
        pullrequestsopen: pullRequests(states:OPEN) {
            totalCount
        }
        
        issuesclosed: issues(states:CLOSED) {
            totalCount
        }
    }
}
`;

export default async function accountstats(username) {
	const { repository } = await graphql(
		`
			query {
				user(login: "Redstonerayy") {
					followers {
						totalCount
					}
				}
			}
		`
	);
	console.log(repository);
}

await accountstats();
