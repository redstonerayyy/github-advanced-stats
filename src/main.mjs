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
        child_process.execSync(`git clone ${repo}`, { cwd: syncdir });
    }
});

// analyse the code in the repositories by file extension
// not all but many programming languages, can be added with pull requests
const languages = {
    asm: "Assembly",
    bat: "Batchfile",
    c: "C",
    cpp: "C++",
    hpp: "C++",
    cmake: "CMake",
    cpy: "COBOL",
    css: "CSS",
    csv: "CSV",
    cl: "OpenCL",
    dockerfile: "Dockerfile",
    glsl: "GLSL",
    go: "Go",
    gradle: "Gradle",
    groovy: "Groovy",
    html: "HTML",
    php: "PHP",
    hs: "Haskell",
    json: "JSON",
    jsx: "JSX",
    java: "Java",
    js: "JavaScript",
    jl: "Julia",
    ipynb: "Jupyter Notebook",
    kt: "Kotlin",
    lua: "Lua",
    md: "Markdown",
    matlab: "Matlab",
    nginxconf: "Nginx",
    ps1: "PowerShell",
    py: "Python",
    rs: "Rust",
    rb: "Ruby",
    scss: "SCSS",
    svg: "SVG",
    sass: "Sass",
    scala: "Scala",
    sh: "Shell",
    bash: "Shell",
    zsh: "Shell",
    swift: "Swift",
    toml: "TOML",
    tex: "TeX",
    bib: "TeX",
    txt: "Text",
    ts: "typescript",
    tsx: "typescriptreact",
    vim: "VimL",
    vb: "Visual Basic",
    yml: "YAML",
    yaml: "YAML",
};

// search for these extensions
const extensions = Object.keys(languages);

// walk each git repository recursively
// look for gitignores first
// nice walk function https://gist.github.com/lovasoa/8691344

async function* walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

function isignored(checkpath, ignorepaths) {
    // https://git-scm.com/docs/gitignore consider reading this
    for (const ipath of ignorepaths) {
    }
}

async function walkrepository(dir, ignorepaths) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entrypath = path.join(dir, d.name);
        if (d.isDirectory()) {
            if (!ignorepaths.includes(entrypath)) {
            }
        } else {
            if (!isignored(entrypath, ignorepaths)) {
            }
        }
    }
}

repopaths = [repopaths[1]];

repopaths.forEach(async (repopath) => {
    // check for all gitignores
    let ignorepaths = [];
    for await (const entrypath of walk(repopath)) {
        if (entrypath.includes(".gitignore")) {
            fs.promises.readFile(entrypath).then((buffer) => {
                let lines = ("" + buffer).split("\n");
                lines = lines.map((line) => line.trim());
                lines = lines.filter((line) => line[0] != "#");
                lines = lines.filter((line) => line != "");
                for (const line of lines) {
                    console.log(line);
                    let ignorepath = path.join(path.dirname(entrypath), line);
                    if (!ignorepaths.includes(ignorepath)) {
                        ignorepaths.push(ignorepath);
                    }
                }
            });
        }
    }
    console.log(ignorepaths);
    // recursively check files in the repository
    walkrepository(repopath, ignorepaths);
});
