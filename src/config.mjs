// read the config, parse the config, return a config object
// features:
// configure ignores for repos, languages, folders in repos

import * as fs from "fs";


export default function getconfig(filepath) { 
    let config = fs.readFileSync("./config.json", { encoding: "utf8" });
    config = JSON.parse(config);
    return config;
}
