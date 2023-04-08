// in each repository all files are read (can take time)
// all empty lines will be removed (only non empty lines count)
// and line by line other stats (brace counts, keywords, ...) are checked
// this happens asynchronously, the repos are processed at the same time
// maybe not enough error handling in promise structure

import * as fs from "fs";
import * as path from "path";
import { languages } from "./languages.mjs";
import walk from "./walk.mjs";


// function to analyse a file
// takes in the filepath and reads the file
// returns an object with all the stats
async function analysefile(filepath, languages){
    // read file
    const buffer = await fs.promises.readFile(filepath);
    
    // convert to string, make lines,
    // filter out empty lines
    let lines = ("" + buffer).split("\n");
    lines = lines.map((line) => line.trim());
    lines = lines.filter((line) => line !== "");
    
    // get stats
    const language = languages[path.extname(filepath)];
    const linecount = lines.length;
    const linesjoined = lines.join("");
    const curlybrackets = (linesjoined.match(/[{}]/g) || []).length;
    const squarebrackets = (linesjoined.match(/[\[\]]/g) || []).length;
    const roundbrackets = (linesjoined.match(/[()]/g) || []).length;
    const semicolons = (linesjoined.match(/;/g) || []).length;
    
    // return as object
    return {
        "language": language,
        "linecount": linecount,
        "curlybrackets": curlybrackets,
        "squarebrackets": squarebrackets,
        "roundbrackets": roundbrackets,
        "semicolons": semicolons
    }
}

async function analyserepo(repopath, ignored_folders) {
    // search for these extensions
    const fileextensions = Object.keys(languages);
    
    // ignored directories
    const dir_ignores = [".git", ".github"]
    // prefix ignored folders with repopath so it only affects exactly matching folders
    const reponame = path.parse(repopath).name;
    // repo specific
    if(Object.hasOwn(ignored_folders, reponame)){
        for(const dir of ignored_folders[reponame]){
            dir_ignores.push(path.join(repopath, dir))
        }
    }
    // global
    for(const dir of ignored_folders["global"]){
        dir_ignores.push(path.join(repopath, dir))
    }
    
    // analysefile is an async function and returns a promise
    // it should return a stats object on success
    let promises = [];
    for await (const entrypath of walk(repopath, dir_ignores)) {
        if (fileextensions.includes(path.extname(entrypath))) {
            promises.push(analysefile(entrypath, languages));
        }
    }
    
    // Promise.all() waits until all promises fullfill
    // so until all files have been analysed
    // list with stats objects for each file
    const allfilestats = await Promise.all(promises);
    
    // combine filestats by language, store which repo this is
    let statsbylanguage = {"repo": path.parse(repopath).name};
    for(const filestats of allfilestats){
        if(Object.hasOwn(statsbylanguage, filestats.language)){
            statsbylanguage[filestats.language].linecount += filestats.linecount;
            statsbylanguage[filestats.language].curlybrackets += filestats.curlybrackets;
            statsbylanguage[filestats.language].squarebrackets += filestats.squarebrackets;
            statsbylanguage[filestats.language].roundbrackets += filestats.roundbrackets;
            statsbylanguage[filestats.language].semicolons += filestats.semicolons;
        } else {
            // language is still in filestats, but thats negligible
            statsbylanguage[filestats.language] = filestats;
        }
    }
    
    // return stats object
    return statsbylanguage;
}

export default async function analyserepos(repopaths, ignored_folders, ignored_languages){
    // analyserepo is an async function and returns a promise
    // it should return a stats object on success
    let promises = [];
    for (const repopath of repopaths) {
        promises.push(analyserepo(repopath, ignored_folders));
    }
    
    // Promise.all() waits until all promises fullfill
    // so until all repos have been analysed
    // list with stats objects for each repository
    const allrepostats = await Promise.all(promises);
    
    // combine repo stats by language, remove reponames because of loop
    let statsbylanguage = {};
    for(const repostats of allrepostats){
        delete repostats.repo;
        for(let [lang, langstats] of Object.entries(repostats)){
            if(Object.hasOwn(statsbylanguage, lang)){
                statsbylanguage[lang].linecount += langstats.linecount;
                statsbylanguage[lang].curlybrackets += langstats.curlybrackets;
                statsbylanguage[lang].squarebrackets += langstats.squarebrackets;
                statsbylanguage[lang].roundbrackets += langstats.roundbrackets;
                statsbylanguage[lang].semicolons += langstats.semicolons;
            } else {
                // language is still in stats, but thats negligible
                statsbylanguage[lang] = langstats;
            }
        }
    }
    
    // combine stats of linecount, brackets and semicolons over all languages
    let combinedrepostats = {
        "linecount": 0,
        "curlybrackets": 0,
        "squarebrackets": 0,
        "roundbrackets": 0,
        "semicolons": 0,
    };
    for(const language in statsbylanguage){
        combinedrepostats.linecount += statsbylanguage[language].linecount;
        combinedrepostats.curlybrackets += statsbylanguage[language].curlybrackets;
        combinedrepostats.squarebrackets += statsbylanguage[language].squarebrackets;
        combinedrepostats.roundbrackets += statsbylanguage[language].roundbrackets;
        combinedrepostats.semicolons += statsbylanguage[language].semicolons;
    }
    
    // remove languages which are configured to be ignored
    // important is to remove also their linecounts so the percentages don't get messed up
    for(const lang of ignored_languages){
        combinedrepostats.linecount -= statsbylanguage[lang].linecount;
        delete statsbylanguage[lang];
    }
    
    // return final stats
    return { "statsbylanguage": statsbylanguage, "combinedrepostats": combinedrepostats};
}
