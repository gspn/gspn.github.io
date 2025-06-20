import "./isomorphic-git.min.js";
import "./lightningfs.min.js";
import http from "./isomorphic-git-http.js";

async function loadLibraryCatalog({ repoUrl, fsName = 'fs', dir = '/' }) {
	const fs = new LightningFS(fsName);
	const pfs = fs.promises;

	// Clone just main with no checkout
	await git.clone({
		fs,
		http,
		dir,
		corsProxy: 'https://cors.isomorphic-git.org',
		url: repoUrl,
		ref: 'main',
		singleBranch: true,
		depth: 1
	});

	// Read root directory of main
	const rootDirs = (await pfs.readdir(dir))
		.filter(name => name !== ".git"); // remove .git from directories (if we're in root)

	const libraries = [];

	for (const folder of rootDirs) {
		const libPath = `${dir === "/" ? "" : dir}/${folder}`;

		if (!(await pfs.stat(libPath)).isDirectory()) {
			console.warn(`"${libPath}" is not a directory. Probably your info files, ignoring.`);
			continue;
		}

		console.log(await pfs.readdir(libPath));

		// Check for 'library' file to confirm it's a valid library
		try {
			await pfs.stat(`${libPath}/library`);
		} catch {
			console.warn(`Directory "${libPath}" doesn't have a 'library' file. Ignoring.`);
			continue; // not a valid library
		}

		// Build the library object
		const library = {
			name: folder,
			descriptionPath: `${libPath}/library`,
			description: await pfs.readFile(`${libPath}/library`, "utf8"),
			entries: [],
		};

		const entryFolders = await pfs.readdir(libPath);
		for (const entryName of entryFolders) {
			const entryPath = `${libPath}/${entryName}`;
			let entryStat;
			try {
				entryStat = await pfs.stat(entryPath);
			} catch {
				continue;
			}
			if (!entryStat.isDirectory()) continue;

			// Check for `branches` and main info file
			const branchesPath = `${entryPath}/branches`;
			const mainInfoPath = `${entryPath}/${entryName}.nfo`;

			try {
				await pfs.stat(branchesPath);
				await pfs.stat(mainInfoPath);
			} catch {
				console.warn(`Directory "${entryPath}" doesn't have a 'branches' or nfo file. Ignoring.`);
				continue;
			}

			// Parse branch mapping
			const branchesContent = await pfs.readFile(branchesPath, 'utf8');
			const branchList = parseBranches(branchesContent);

			// Collect other info files
			const entryFiles = await pfs.readdir(entryPath);
			const otherDocsPathes = entryFiles.filter(f => f !== 'branches' && f !== `${entryName}.nfo`);

			library.entries.push({
				name: entryName,
				path: entryPath,
				mainInfoPath,
				mainInfo: await pfs.readFile(mainInfoPath, "utf8"),
				branches: branchList,
				otherDocsPathes,
			});
		}

		libraries.push(library);
	}

	return libraries;
}

function parseBranches(text) {
	return text
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => {
			const [folder, branch] = line.split(/\s+/);
			return { folder, branch };
		});
}


window.loadlib = loadLibraryCatalog;
export { loadLibraryCatalog };