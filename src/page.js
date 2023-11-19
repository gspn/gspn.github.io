// sets up router and handles page changes

import { tag } from "./caching.js";
import Cicero from "./cicero.js";
import pages from "/pages/0.js";

const loadPage = async function (key) {
	const p = pages[key];
	if (!p) throw "Sorry m8, can't find that";

	const path = `/pages/${key}/index.html`;

	if(p.ex === true) return location.replace(path);

	const content = await fetch(path)
		.then(res => res.ok ? res.text() : `Sorry m8, ERROR ${res.status}`)
		.catch(e => new Error("Sorry m8: ", e));

	// change cache puck
	const cachetag = document.querySelector("#cachetag");
	const ctag = await tag(path, true);
	cachetag.replaceChildren(ctag);

	// display content and load scripts
	const main = document.querySelector(".main");
	main.innerHTML = content;
	document.title = p.title;
	main.querySelectorAll("script").forEach(Cicero.replaceAndRunScript);
};

const route = new Cicero();
route
	.redirect("", "/")
	.route("/", () => loadPage("welcome"))

	.redirect("/pages/", "/list")
	.route("/list", () => loadPage("list"))

	.route("/config", () => loadPage("config"))

	.route("/pages/:key/", (params) => loadPage(params.key))

	.start();

window.gspnp = { route };