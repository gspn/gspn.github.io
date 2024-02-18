import { FileFrag } from "./filefrag2.js";

const log = (el, msg) => el.append(document.createElement("br"), document.createTextNode(msg));

// Download
const
	recordin = document.querySelector("#record-dl-in"),
	readrecord = document.querySelector("#record-dl-read"),
	recordout = document.querySelector("#record-dl-content"),
	dlpermlog = document.querySelector("#record-dl-permlog"),
	dltemplog = document.querySelector("#record-dl-templog"),
	dllog = document.querySelector("#record-dl-log");

const downloadFile = async (blob, filename) => Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename }).click();

let ff;
readrecord.onclick = async () => {
	if (dllog.innerText.length > 500) dllog.innerHTML = "";
	// reading the record file and creating the FF instance
	log(dllog, "Reading record...");
	try {
		const recstr = await recordin.files[0].text();
		ff = new FileFrag(recstr);
	} catch (e) {
		log(dllog, `${e.name} (while reading record): ${e.message}`);
		throw e;
	}

	//
	recordout.innerText = "";
	recordout.innerText += `${ff.record.name}\n${ff.record.description ? ff.record.description : ""}\nMirrors:\n`;
	const mirrorlist = document.createElement("ul");
	Object.entries(ff.record.mirrors).forEach(([name, mirror]) => {
		const anchor = document.createElement("a");
		anchor.innerText = `${name} (across ${mirror.length || mirror.uris.length} files)`;
		anchor.href = `javascript:void(0)`;
		anchor.onclick = async () => {
			const blob = await ff.download(name, [dlpermlog, dltemplog]);
			dltemplog.innerText = "";
			dlpermlog.innerText += "Saving to device\n";
			downloadFile(blob, ff.record.name);
		}

		const li = document.createElement("li");
		li.append(anchor);
		mirrorlist.append(li);
	});
	recordout.append(mirrorlist);

	log(dllog, "Record loaded!");
};

// Split
const
	spin = document.querySelector("#split-in"),
	spbtn = document.querySelector("#split-submit"),
	spsize = document.querySelector("#split-size"),
	splog = document.querySelector("#split-log");

spbtn.onclick = async () => {
	const size = Number(spsize.value) * 1000 || (log(splog, "No size specified, defaulting to 8MB"), 8 * 10 ** 6);

	if (splog.innerText.length > 500) splog.innerHTML = "";
	log(splog, "Reading file...");
	try {
		const file = spin.files[0];
		const estimate = file.size / size;
		if (estimate > 999) throw new Error(`Max 999 parts! (would produce ${Math.ceil(estimate)})`);

		log(splog, `Splitting file... (about ${estimate.toFixed(2)} part${estimate.toFixed(2) != 1 ? "s" : ""})`);
		await new Promise(res => setTimeout(res, 100));

		const parts = FileFrag.makeFragments(file, size);
		const partsno = parts.length;
		console.log(parts);
		log(splog, `Produced ${partsno} part${partsno != 1 ? "s" : ""}`);

		const namebase = file.name;
		for (let i = 0; i < parts.length; i++) {
			const p = parts[i];
			downloadFile(p, namebase + "." + String(i + 1).padStart(3, "0"));
		}

	} catch (e) {
		log(splog, `${e.name} (while reading file): ${e.message}`);
		throw e;
	}
}