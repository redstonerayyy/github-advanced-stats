// take in the username and the ignored repos
// parse the repository overview page for all PUBLIC repos
// return repos and urls for repos

import * as https from "https";


export default async function getrepos(username, ignored_repos){
    // fetch repository tab webpage (do what curl does)
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
                console.log(`FATAL ERROR FETCHING REPOSITORIES`)
                process.exit(1)
            });
    });
    
    // remove spaces before matching
    webpage = webpage.replaceAll(" ", "");
    // regex w/o spaces to match the relevant parts in the webpage
    const reporegex = /<ahref="([A-Za-z:/.-]*)"itemprop="namecodeRepository">/g;
    // match repos
    let array = [...webpage.matchAll(reporegex)];
    let repos = array.map((match) => match[1].split("/").reverse()[0]);
    
    // remove ignored repos
    repos = repos.filter((repo) => !ignored_repos.includes(repo));
    // construct urls
    let repourls = repos.map((repo) => `https://github.com/${username}/` + repo);
    
    // return repoinfo
    return {repos: repos, repourls: repourls};
}
