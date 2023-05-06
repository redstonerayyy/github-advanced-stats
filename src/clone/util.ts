import * as fs from "fs";
import * as path from "path";

/*------------ check if any of the strings is included in another string ------------*/
export function checkstringforsubstrings(
	checkstr: string,
	substrings: Array<string>
) {
	for (const substring of substrings) {
		if (checkstr.includes(substring)) {
			return true;
		}
	}

	return false;
}

/*------------ walk a directory recursively ------------*/
// nice walk function taken from https://gist.github.com/lovasoa/8691344
export default async function* walk(
	dir: string,
	dir_ignores: Array<string> = [],
	file_ignores: Array<string> = []
): AsyncGenerator<any, any, any> {
	for await (const d of await fs.promises.opendir(dir)) {
		const entry = path.join(dir, d.name);
		if (d.isDirectory() && !checkstringforsubstrings(entry, dir_ignores))
			yield* walk(entry);
		else if (d.isFile() && !checkstringforsubstrings(entry, file_ignores))
			yield entry;
	}
}
