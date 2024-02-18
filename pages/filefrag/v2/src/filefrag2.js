import yaml from "./yaml.min.js";

class FileFrag {
	constructor(recordstr) {
		this.record = yaml.parse(recordstr);

		// nauseating type checks
		const r = this.record; console.log(this);
		if (
			typeof r.name !== 'string' ||
			typeof r.mirrors !== 'object' ||
			!['string', 'undefined'].includes(typeof r.description)
		) throw new TypeError("Unexpected record format");
		Object.values(r.mirrors).forEach(mirror => {
			if (typeof mirror.type !== 'string') throw new TypeError("Mirror type must be a string");
			if (mirror.type === "strip") {
				if (typeof mirror.length === 'undefined') throw new TypeError("Strip mirror requires 'length' parameter");
				if (typeof mirror.root === 'undefined') throw new TypeError("Strip mirror requires 'root' parameter");

				if (typeof mirror.length !== 'number') throw new TypeError("'length' parameter must be a number");
				if (typeof mirror.root !== 'string') throw new TypeError("'root' parameter must be a string");

				if (mirror.length > 999) throw new TypeError("'length' parameter must be at maximum 999");
			} else if (mirror.type === "list") {
				if (typeof mirror.uris === 'undefined') throw new TypeError("List mirror requires 'uris' parameter");

				if (mirror.uris.constructor !== Array) throw new TypeError("'uris' parameter must be an array");
			} else {
				throw new TypeError("Mirror type must be one of: strip, list");
			}
		});
	}

	async download(mirrorname, [permlog = { innerText: "" }, templog = { innerText: "" }]) {
		if (!mirrorname in this.record.mirrors) throw new TypeError(`No mirror named '${mirrorname}' in record`);

		permlog.innerText = "";
		templog.innerText = "";

		const mirror = this.record.mirrors[mirrorname];
		const progressdl = async (uri, part) => {
			const res = await fetch(uri);

			const reader = res.body.getReader();
			const contentLength = +res.headers.get('Content-Length');

			let receivedLength = 0;
			const chunks = [];
			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				chunks.push(value);
				receivedLength += value.length;

				templog.innerText = `(${part}) collecting part (${(receivedLength / contentLength * 100).toFixed(2)}%)`;
			}

			let chunksAll = new Uint8Array(receivedLength);
			let position = 0;
			for (let chunk of chunks) {
				chunksAll.set(chunk, position);
				position += chunk.length;
			}

			return new Blob([chunksAll]);
		};

		let uris = [];
		switch (mirror.type) {
			case "strip":
				for (let i = 0; i < mirror.length; i++) uris.push(`${mirror.root}.${String(i + 1).padStart(3, "0")}`);
				break;

			case "list":
				uris = mirror.uris;
				break;
		}
		console.log(uris)

		permlog.innerText += `Downloading ${mirror.type} mirror "${mirrorname}" (${mirror.length || mirror.uris.length} parts)\n`;
		const blobs = [];
		try {
			for (const [i, uri] of uris.entries()) {
				const blob = await progressdl(uri, i + 1);
				blobs.push(blob);
				permlog.innerText += `(${i + 1}/${uris.length}) part collected (${blob.size} bytes)\n`;
			}
		} catch (e) {
			permlog.innerText += `${e.name} (while fetching part ${blobs.length + 1}): ${e.message}\n`;
			throw e;
		}

		templog.innerText += "Joining fragments\n";
		const joinedblob = new Blob(blobs);
		templog.innerText = "";
		permlog.innerText += "Joined fragments\n";
		return joinedblob;
	}

	static makeFragments(blob, blocksize = 8 * 10 ** 6) {
		const frags = [];
		const blocks = Math.ceil(blob.size / blocksize);
		for (let i = 0; i < blocks; i++) {
			const pos = blocksize * i;
			frags.push(blob.slice(pos, pos + blocksize));
		};
		return frags;
	}
}

export { FileFrag };