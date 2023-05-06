/*------------ interfaces ------------*/

export interface Config {
	username: string;
	ignored_repos: Array<string>;
	ignored_languages: Array<string>;
	ignored_folders: { [key: string]: Array<string> };
}

/*------------ read config.json ------------*/
import * as fs from "fs";

export function getconfig(filepath: string): Config {
	let filecontents: string = fs.readFileSync("./config.json", {
		encoding: "utf8",
	});
	let config: Config = JSON.parse(filecontents);
	return config;
}
