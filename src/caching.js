import gspnsw from "./comms.js";

// helpers
const ageType = async url => {
	const cached = await gspnsw.do("cached", { url });
	if (!cached) return -1 // not cached: untracked

	const age = await gspnsw.do("age", { url });
	const day = 1000 * 60 * 60 * 24;
	const week = day * 7;
	if (age < day) return 0; // younger than a day: fresh
	if (age < week) return 1; // younger than a week: stale
	return 2; // older than a week: old
};

// api
const icon = async (uri, reload, istag) => {
	const el = document.createElement("span");
	const age = await ageType(uri);

	el.innerHTML = "⚫&#xFE0E;";
	el.setAttribute("agetype", age);
	el.style.color = age == -1
		? "grey"
		: age == 0
			? "green"
			: age == 1
				? "yellow"
				: "red";

	el.addEventListener("click", async () => {
		el.style.color = "grey";
		if (istag) el.innerHTML = "⚫&#xFE0E;CACHING...";

		await gspnsw.do("cache", [uri]).catch(() => {
			el.style.color = "red";
			if (istag) el.innerHTML = "⚫&#xFE0E;ERROR";
		});

		el.replaceWith(await (istag ? tag : icon)(uri, reload));
		if(reload) location.reload();
	});

	return el;
};
const tag = async (uri, reload) => {
	const el = await icon(uri, reload, true);
	const age = el.getAttribute("agetype");

	el.innerText += age == -1
		? "UNTRACKED"
		: age == 0
			? "FRESH"
			: age == 1
				? "STALE"
				: "OLD";
	return el;
};

const api = { icon, tag };
export default api;
export { icon, tag };