// sets up router and handles page changes

import Cicero from "./cicero.js";
import pages from "/pages/0.js";

const loadPage = async function (key) {
	const p = pages[key];
	if (!p) throw "Sorry m8, can't find that";

	const content = await fetch(`/pages/${key}/index.html`)
		.then(res => res.ok ? res.text() : `Sorry m8, ERROR ${res.status}`)
		.catch(e => new Error("Sorry m8: ", e));

	const main = document.querySelector(".main")
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
	.route("/pages/:key/d/:file", (params) => window.open(`pages/${params.key}/${params.file}`, "_blank"))

	.start();

window.gspnp = { route };