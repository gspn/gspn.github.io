// sets up router and handles page changes

import Router from "./router.js";
import pages from "/pages/0.js";

const loadPage = async function (key) {
	const p = pages[key];
	if (!p) throw "Sorry m8, can't find that";

	const content = await fetch(`/pages/${key}/index.html`)
		.then(res => res.text())
		.catch(e => new Error("Sorry m8: ", e))

	document.querySelector(".main").innerHTML = content;
	document.title = p.title;
};

const listPages = function ({ query, showtags, showinvis }) {
	document.title = "GSPN - List";

	const lowerQuery = query === null ? query : query.toLowerCase();

	// filtering the entries
	const matches = (function () {
		// invisibles
		let matches = showinvis
			? Object.entries(pages)
			: Object.entries(pages).filter(([key, page]) => !page.tags.includes("invis"))

		// matching
		matches = query === null
			? matches
			: matches.filter(([key, page]) => {
				const lowerItem = page.toLowerCase();

				const words = lowerQuery.split(' ');

				// Check if all words in the query are present in the item (in any order)
				return words.every(word => lowerItem.includes(word));

				//TODO add tag filtering
			});

		return matches;
	})();

	// displaying the list
	const main = document.querySelector(".main");
	main.innerHTML = "";

	const list = document.createElement("ul");
	list.className = "arlist";

	matches.forEach(([key, entry]) => {
		list.insertAdjacentHTML('beforeend', `<li><a href="/pages/${key}">${entry.name}</a></li>`);
	});

	main.append(list);
};

const route = new Router();

route
	.get("", () => route.navigateTo("/"))
	.get("/", () => loadPage("welcome"))
	.get("/list", () => listPages({ query: null, showinvis: false }))
	.get("/pages/:key", (params) => loadPage(params.key))

route.start();

window.gspnp = { route };