/*------------ generate svg files ------------*/
// more versions in different svg colors could be added

import * as fs from "fs";
import { colors } from "../languages.js";

/*------------ generate language percentages as bar with description ------------*/
export function generatelangsvgs(languagestats: { [key: string]: any }) {
	/*------------ sort languages by linecount so the most used are first the left ------------*/
	let languagesasarray: Array<{ [key: string]: any }> = Object.entries(
		languagestats.statsbylanguage
	).map((lang) => lang[1]);
	languagesasarray.sort((a, b) => b.linecount - a.linecount);

	/*------------ load svg template ------------*/
	let template = fs.readFileSync("./templates/languages.svg", {
		encoding: "utf8",
	});

	/*------------ construct html strings ------------*/
	// adds html elements for each language
	// images may only be shown correctly inside a browser
	let progressstring = "";
	let lang_liststring = "";

	for (const lang of languagesasarray) {
		const color =
			colors[lang.language] !== undefined
				? colors[lang.language]
				: "#000000";
		const percentage = (
			(lang.linecount / languagestats.combinedrepostats.linecount) *
			100
		).toFixed(2);

		progressstring += `
        <span style="background-color: ${color}; 
        width: ${percentage}%;" 
        class="progress-item"></span>
        `;

		lang_liststring += `
        <li style="animation-delay: 0ms;">
        <svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill:${color};"
        viewBox="0 0 16 16" width="16" height="16"><path
        fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
        <span class="lang">${lang.language}</span>
        <span class="percent">${percentage}%</span>
        </li>
        `;
	}

	// insert the generated strings into the template
	template = template.replace("{{ progress }}", progressstring);
	template = template.replace("{{ lang_list }}", lang_liststring);

	// write the file
	fs.writeFileSync("./output/languages.svg", template);
}

/*------------ generate advanced user info ------------*/
export function generateusersvgs(
	graphqlstats: { [key: string]: any },
	reststats: { [key: string]: any }
) {
	/*------------ load svg template ------------*/
	let template = fs.readFileSync("./templates/userinfo.svg", {
		encoding: "utf8",
	});

	/*------------ rest ------------*/
	const lineschanged = reststats.additions + reststats.deletions;

	/*------------ replace info in template ------------*/
	// https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
	template = template.replace("{{ name }}", graphqlstats.username);
	template = template.replace("{{ stars }}", graphqlstats.stars.toString());
	template = template.replace("{{ forks }}", graphqlstats.forks.toString());
	template = template.replace(
		"{{ contributions }}",
		graphqlstats.commitcount.toString()
	);
	template = template.replace(
		"{{ lines_changed }}",
		lineschanged.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	);
	template = template.replace("{{ views }}", reststats.views.toString());
	template = template.replace(
		"{{ repos }}",
		graphqlstats.reporecentcontribs.toString()
	);

	// write the file
	fs.writeFileSync("./output/userinfo.svg", template);
}
