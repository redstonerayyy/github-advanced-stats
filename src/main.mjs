import * as https from "https";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as child_process from "child_process";

// read config and info
let config = fs.readFileSync("./config.json", { encoding: "utf8" });
config = JSON.parse(config);

const ignored_repos = config.ignored_repos.map(
    (reponame) => `https://github.com/${config.username}/${reponame}`
);

const username = config.username;

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

// remove ignored repos
repos = repos.filter((repo) => !ignored_repos.includes(repo));

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
    ".h": "C",
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
    ".java": "Java",
    ".jsx": "JavaScript",
    ".js": "JavaScript",
    ".mjs": "Javascript",
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
    ".tsx": "TypeScript",
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
    languages: {},
};

async function analyserepo(repopath) {
    let langs = {};
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
                    if (Object.hasOwn(langs, path.extname(entrypath))) {
                        langs[path.extname(entrypath)] += lines.length;
                    } else {
                        langs[path.extname(entrypath)] = lines.length;
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
    for (const key of Object.keys(langs)) {
        stats.codelines += langs[key];
        if (Object.hasOwn(globalstats.languages, key)) {
            globalstats.languages[key] += langs[key];
        } else {
            globalstats.languages[key] = langs[key];
        }
    }

    for (const key of Object.keys(stats)) {
        globalstats[key] += stats[key];
    }
}

let repopromises = [];
for (const rpath of repopaths) {
    repopromises.push(analyserepo(rpath));
}

await Promise.all(repopromises);

// generate images

const colors = {
    Assembly: "#56223B",
    Batchfile: "Batchfile",
    C: "#404552",
    "C++": "#2E2292",
    CMake: "CMake",
    CSS: "#264EE4",
    CSV: "CSV",
    OpenCL: "OpenCL",
    Dockerfile: "Dockerfile",
    GLSL: "GLSL",
    Go: "#6AD7E5",
    Gradle: "Gradle",
    Groovy: "Groovy",
    HTML: "#F0652A",
    PHP: "#767BB3",
    Haskell: "Haskell",
    JSON: "JSON",
    Javascript: "#FFD73D",
    Java: "#FF9710",
    Julia: "Julia",
    "Jupyter Notebook": "#3E7CAB",
    Kotlin: "#D6697E",
    Lua: "Lua",
    Markdown: "Markdown",
    Matlab: "Matlab",
    Nginx: "Nginx",
    Powershell: "#4372CA",
    Python: "#3E7CAB",
    Rust: "#000000",
    Ruby: "#AB1401",
    SCSS: "SCSS",
    SVG: "#f77518",
    SASS: "Sass",
    Scala: "#DB322F",
    Shell: "#2C3137",
    Swift: "#F05038",
    TOML: "TOML",
    TeX: "#008080",
    Text: "#9fa0a3",
    TypeScript: "#3178C6",
    Vim: "Vim",
    "Visual Basic": "Visual Basic",
    YAML: "YAML",
    YAML: "YAML",
};

// merge file endings
let mergedlangs = {};

for (const key of Object.keys(globalstats.languages)) {
    if (Object.hasOwn(mergedlangs, languages[key])) {
        mergedlangs[languages[key]] += globalstats.languages[key];
    } else {
        mergedlangs[languages[key]] = globalstats.languages[key];
    }
}

// remove unwantet languages
globalstats.codelines -= mergedlangs["C"];
delete mergedlangs.C;

// sort languages
let sortlangs = Object.entries(mergedlangs);
sortlangs.sort((a, b) => a[1] - b[1]);
sortlangs.reverse();

// load template
let template = fs.readFileSync("./templates/languages.svg", {
    encoding: "utf8",
});

// add langs
let progress = "";
let lang_list = "";

for (const lang of sortlangs) {
    let color = colors[lang[0]] !== undefined ? colors[lang[0]] : "#000000";

    console.log(lang, ((lang[1] / globalstats.codelines) * 100).toFixed(2));
    progress += `
    <span style="background-color: ${color}; 
    width: ${((lang[1] / globalstats.codelines) * 100).toFixed(2)}%;" 
    class="progress-item"></span>
    `;

    lang_list += `
    <li style="animation-delay: 0ms;">
    <svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill:${color};"
    viewBox="0 0 16 16" version="1.1" width="16" height="16"><path
    fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
    <span class="lang">${lang[0]}</span>
    <span class="percent">${((lang[1] / globalstats.codelines) * 100).toFixed(
        2
    )}%</span>
    </li>
    `;
}

template = template.replace("{{ progress }}", progress);
template = template.replace("{{ lang_list }}", lang_list);

fs.writeFileSync("./output/languages.svg", template);
