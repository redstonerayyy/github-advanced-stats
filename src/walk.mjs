// walk a directory recursively
// nice walk function taken from https://gist.github.com/lovasoa/8691344

import * as fs from "fs";
import * as path from "path";


// check if any of the strings is included in another string
export function checkstringforsubstrings(checkstr, substrings){
    for(const substring of substrings){
        if(checkstr.includes(substring)){
            return true;
        }
    }
    
    return false;
}

// return a list of filepaths, no directories are returned
// it's possible to ignore directories or files by supplying a
// lists of substrings, so that all filepaths where one of the substrings
// is included are ignored
export default async function* walk(dir, dir_ignores=[], file_ignores=[]) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory() && !checkstringforsubstrings(entry, dir_ignores)) yield* walk(entry);
        else if (d.isFile() && !checkstringforsubstrings(entry, file_ignores)) yield entry;
    }
}