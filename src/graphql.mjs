// query stats from github using the graphql api
// you need to specify a valid access token for this
// to work either in a local .ENV file or as a secret
// for your repository

const endpoint = "https://api.github.com/graphql";

const query = `
query {
    rateLimit {
      cost
      remaining
      resetAt    
    }
    repository(owner:"Redstonerayy", name: "minecraft") {
      collaborators {
        totalCount
      }
    	forkCount
    	isFork
    	isArchived
    	stargazerCount
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
