import * as https from "https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as child_process from "child_process";

const username = "Redstonerayy";

// fetch repository tab webpage
var webpage = "";

webpage = await new Promise((resolve, reject) => {
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
            reject("ERROR");
        });
});

// remove spaces before matches
webpage = webpage.replaceAll(" ", "");

// get repository urls
const reporegex = /<ahref="([A-Za-z:/.-]*)"itemprop="namecodeRepository">/g;

let array = [...webpage.matchAll(reporegex)];
let repos = array.map((match) => "https://github.com" + match[1]);

// create or update local copy of all public repositories in ~/.cache/repo-lang-crawler/
const syncdir = path.join(os.homedir(), ".cache", "repo-lang-crawler");
if (!fs.existsSync(syncdir)) {
    fs.mkdirSync(syncdir, { recursive: true });
}

// get paths of repos, also used later on
var repopaths = [];
repos.forEach((repo) => {
    let reponame = repo.split("/")[repo.split("/").length - 1];
    let repopath = path.join(syncdir, reponame);
    repopaths.push(repopath);
});

// sync/clone with git
repopaths.forEach((repopath) => {
    if (fs.existsSync(repopath)) {
        child_process.execSync("git pull", {
            cwd: repopath,
        });
    } else {
        child_process.execSync(
            `git clone https://github.com/${username}/${path.basename(
                repopath
            )}`,
            {
                cwd: syncdir,
            }
        );
    }
});

// analyse the code in the repositories by file extension
// not all but many programming languages, can be added with pull requests
const languages = {
    ".asm": "Assembly",
    ".bat": "Batchfile",
    ".c": "C",
    ".cpp": "C++",
    ".hpp": "C++",
    ".cmake": "CMake",
    ".css": "CSS",
    ".csv": "CSV",
    ".cl": "OpenCL",
    ".dockerfile": "Dockerfile",
    ".glsl": "GLSL",
    ".go": "Go",
    ".gradle": "Gradle",
    ".groovy": "Groovy",
    ".html": "HTML",
    ".php": "PHP",
    ".hs": "Haskell",
    ".json": "JSON",
    ".jsx": "JSX",
    ".java": "Java",
    ".js": "JavaScript",
    ".mjs": "Javascript Module",
    ".jl": "Julia",
    ".ipynb": "Jupyter Notebook",
    ".kt": "Kotlin",
    ".lua": "Lua",
    ".md": "Markdown",
    ".matlab": "Matlab",
    ".nginxconf": "Nginx",
    ".ps1": "PowerShell",
    ".py": "Python",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".scss": "SCSS",
    ".svg": "SVG",
    ".sass": "Sass",
    ".scala": "Scala",
    ".sh": "Shell",
    ".bash": "Shell",
    ".zsh": "Shell",
    ".swift": "Swift",
    ".toml": "TOML",
    ".tex": "TeX",
    ".bib": "TeX",
    ".txt": "Text",
    ".ts": "TypeScript",
    ".tsx": "TSX",
    ".vim": "Vim",
    ".vb": "Visual Basic",
    ".yml": "YAML",
    ".yaml": "YAML",
};

// search for these extensions
const extensions = Object.keys(languages);

// walk each git repository recursively
// nice walk function https://gist.github.com/lovasoa/8691344

async function* walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory() && !d.name.includes(".git")) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

let globalstats = {
    curlybrackets: 0,
    squarebrackets: 0,
    roundbrackets: 0,
    semicolons: 0,
    codelines: 0,
};

async function analyserepo(repopath) {
    let languages = {};
    let stats = {
        curlybrackets: 0,
        squarebrackets: 0,
        roundbrackets: 0,
        semicolons: 0,
        codelines: 0,
    };
    let promises = [];
    for await (const entrypath of walk(repopath)) {
        if (extensions.includes(path.extname(entrypath))) {
            promises.push(
                fs.promises.readFile(entrypath).then((buffer) => {
                    let lines = ("" + buffer).split("\n");
                    lines = lines.map((line) => line.trim());
                    lines = lines.filter((line) => line != "");
                    // add linecount
                    if (Object.hasOwn(languages, path.extname(entrypath))) {
                        languages[path.extname(entrypath)] += lines.length;
                    } else {
                        languages[path.extname(entrypath)] = lines.length;
                    }
                    // get stats
                    let full = lines.join("");
                    stats.curlybrackets += (full.match(/[{}]/g) || []).length;
                    stats.squarebrackets += (
                        full.match(/[\[\]]/g) || []
                    ).length;
                    stats.roundbrackets += (full.match(/[\(\)]/g) || []).length;
                    stats.semicolons += (full.match(/[;]/g) || []).length;
                })
            );
        }
    }

    await Promise.all(promises);
    // calculate linecount
    // add to global
    for (const key of Object.keys(languages)) {
        stats.codelines += languages[key];
        if (Object.hasOwn(globalstats, key)) {
            globalstats[key] += languages[key];
        } else {
            globalstats[key] = languages[key];
        }
    }

    for (const key of Object.keys(stats)) {
        globalstats[key] += stats[key];
    }

    // print repo info
    console.log(path.basename(repopath), languages, stats);
}

let repopromises = [];
for (const rpath of repopaths) {
    repopromises.push(analyserepo(rpath));
}

await Promise.all(repopromises);

console.log(globalstats);
