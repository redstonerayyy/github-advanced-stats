// use the previously parsed reponames to sync or clone the repos
// with git clone/git pull (requires git in path)
// currently used execSync, but could be changed to an asynchronous variant (exec)
// execSync prevents flooding with processes
// exec is faster, but floods with processes
// returns the paths where the repos are

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as child_process from "child_process";


export default function syncrepos(repos, username){
    // repositories are in ~/.cache/repo-lang-crawler/
    const syncdir = path.join(os.homedir(), ".cache", "repo-lang-crawler");
    if (!fs.existsSync(syncdir)) {
        fs.mkdirSync(syncdir, { recursive: true });
    }
    
    // sync/clone with git, it's important to set the cwd
    // this can take a considerate amount of time if many
    // (large) repositories need to be cloned
    // updating will be much faster once repos are cloned
    let repopaths = []
    repos.forEach((repo) => {
        let repopath = path.join(syncdir, repo);
        repopaths.push(repopath);
        if (fs.existsSync(repopath)) {
            child_process.execSync("git pull", {
                cwd: repopath,
            });
        } else {
            child_process.execSync(
                `git clone https://github.com/${username}/${repo}`,
                {
                    cwd: syncdir,
                }
                );
        }
    });
    
    return repopaths;
}
