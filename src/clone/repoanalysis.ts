import * as fs from "fs";
import * as path from "path";

import { languages } from "../languages.js";
import walk, { checkstringforsubstrings } from "./util.js";

/*------------ DESCRIPTION ------------*/
// in each repository all files are read (can take time)
// all empty lines will be removed (only non empty lines count)
// and line by line other stats (brace counts, keywords, ...) are checked
// this happens asynchronously, the repos are processed at the same time
// maybe not enough error handling in promise structure
/*------------ DESCRIPTION ------------*/

/*------------ interface for file info ------------*/

interface FileInfo {
	language: string;
	linecount: number;
	curlybrackets: number;
	squarebrackets: number;
	roundbrackets: number;
	semicolons: number;
}

/*------------ analyse a file ------------*/
// takes in the filepath and reads the file
// returns an object with all the stats
async function analysefile(
	filepath: string,
	languages: { [key: string]: string }
): Promise<FileInfo> {
	/*------------ read file ------------*/
	const buffer = await fs.promises.readFile(filepath);

	/*------------ convert to string, make lines filter out empty lines ------------*/
	let lines = ("" + buffer).split("\n");
	lines = lines.map((line) => line.trim());
	lines = lines.filter((line) => line !== "");

	/*------------ get stats ------------*/
	const language = languages[path.extname(filepath)];
	const linecount = lines.length;
	const linesjoined = lines.join("");
	const curlybrackets = (linesjoined.match(/[{}]/g) || []).length;
	const squarebrackets = (linesjoined.match(/[\[\]]/g) || []).length;
	const roundbrackets = (linesjoined.match(/[()]/g) || []).length;
	const semicolons = (linesjoined.match(/;/g) || []).length;

	/*------------ return as object ------------*/
	return {
		language: language,
		linecount: linecount,
		curlybrackets: curlybrackets,
		squarebrackets: squarebrackets,
		roundbrackets: roundbrackets,
		semicolons: semicolons,
	};
}

/*------------ analyse each file in a folder ------------*/
async function analysefolder(
	repopath: string,
	ignored_folders: { [key: string]: Array<string> }
) {
	/*------------ extensions to match ------------*/
	const fileextensions = Object.keys(languages);

	/*------------ ignored directories ------------*/
	const dir_ignores: Array<string> = [".git", ".github"];
	/*------------ prefix ignored folders with repopath so it only affects exactly matching folders ------------*/
	const reponame: string = path.parse(repopath).name;
	/*------------ repo specific ------------*/
	if (Object.hasOwn(ignored_folders, reponame)) {
		for (const dir of ignored_folders[reponame]) {
			dir_ignores.push(path.join(repopath, dir));
		}
	}
	/*------------ global ------------*/
	for (const dir of ignored_folders["global"]) {
		dir_ignores.push(path.join(repopath, dir));
	}

	/*------------ analyse file, get file info ------------*/
	let promises: Array<Promise<FileInfo>> = [];
	for await (const entrypath of walk(repopath, dir_ignores)) {
		if (fileextensions.includes(path.extname(entrypath))) {
			promises.push(analysefile(entrypath, languages));
		}
	}

	/*------------ use Promise.all() to wait until all file are analysed ------------*/
	const allfilestats = await Promise.all(promises);

	/*------------ combine filestats by language, store which repo this is ------------*/
	let statsbylanguage: { [key: string]: any } = {
		repo: path.parse(repopath).name,
	};
	/*------------ combine stats of individual files ------------*/
	for (const filestats of allfilestats) {
		if (Object.hasOwn(statsbylanguage, filestats.language)) {
			statsbylanguage[filestats.language].linecount +=
				filestats.linecount;
			statsbylanguage[filestats.language].curlybrackets +=
				filestats.curlybrackets;
			statsbylanguage[filestats.language].squarebrackets +=
				filestats.squarebrackets;
			statsbylanguage[filestats.language].roundbrackets +=
				filestats.roundbrackets;
			statsbylanguage[filestats.language].semicolons +=
				filestats.semicolons;
		} else {
			statsbylanguage[filestats.language] = filestats;
		}
	}

	/*------------ return stats object ------------*/
	return statsbylanguage;
}

/*------------ analyse each folder/repo ------------*/
export default async function analysefolders(
	repopaths: Array<string>,
	ignored_repos: Array<string>,
	ignored_folders: { [key: string]: Array<string> },
	ignored_languages: Array<string>
): Promise<{ [key: string]: any }> {
	/*------------ use Promise.all() to wait until all repos have been analysed ------------*/
	let promises = [];
	for (const repopath of repopaths) {
		if (!checkstringforsubstrings(path.basename(repopath), ignored_repos))
			promises.push(analysefolder(repopath, ignored_folders));
	}

	/*------------ list with stats objects for each repo ------------*/
	const allrepostats = await Promise.all(promises);

	/*------------ combine repo stats by language, remove reponames because of loop ------------*/
	let statsbylanguage: { [key: string]: any } = {};
	for (const repostats of allrepostats) {
		delete repostats.repo;
		for (let [lang, langstats] of Object.entries(repostats)) {
			if (Object.hasOwn(statsbylanguage, lang)) {
				statsbylanguage[lang].linecount += langstats.linecount;
				statsbylanguage[lang].curlybrackets += langstats.curlybrackets;
				statsbylanguage[lang].squarebrackets +=
					langstats.squarebrackets;
				statsbylanguage[lang].roundbrackets += langstats.roundbrackets;
				statsbylanguage[lang].semicolons += langstats.semicolons;
			} else {
				statsbylanguage[lang] = langstats;
			}
		}
	}

	/*------------ combine stats of linecount, brackets and semicolons over all languages ------------*/
	let combinedrepostats = {
		linecount: 0,
		curlybrackets: 0,
		squarebrackets: 0,
		roundbrackets: 0,
		semicolons: 0,
	};
	/*------------ combine them ------------*/
	for (const language in statsbylanguage) {
		combinedrepostats.linecount += statsbylanguage[language].linecount;
		combinedrepostats.curlybrackets +=
			statsbylanguage[language].curlybrackets;
		combinedrepostats.squarebrackets +=
			statsbylanguage[language].squarebrackets;
		combinedrepostats.roundbrackets +=
			statsbylanguage[language].roundbrackets;
		combinedrepostats.semicolons += statsbylanguage[language].semicolons;
	}

	/*------------ remove languages which are configured to be ignored ------------*/
	// remove also their linecounts, brackets usw. so the percentages don't get messed up
	for (const lang of ignored_languages) {
        if(statsbylanguage[lang] !== undefined){
            combinedrepostats.linecount -= statsbylanguage[lang].linecount;
            combinedrepostats.curlybrackets -= statsbylanguage[lang].curlybrackets;
            combinedrepostats.squarebrackets -=
                statsbylanguage[lang].squarebrackets;
            combinedrepostats.roundbrackets -= statsbylanguage[lang].roundbrackets;
            combinedrepostats.semicolons -= statsbylanguage[lang].semicolons;
            delete statsbylanguage[lang];
        }
	}

	/*------------ return final stats ------------*/
	return {
		statsbylanguage: statsbylanguage,
		combinedrepostats: combinedrepostats,
	};
}
