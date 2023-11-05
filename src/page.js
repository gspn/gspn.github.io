// sets up router and handles page changes

import Cicero from "./cicero.js";
import pages from "/pages/0.js";

const loadPage = async function (key) {
	const p = pages[key];
	if (!p) throw "Sorry m8, can't find that";

	const content = await fetch(`/pages/${key}/index.html`)
		.then(res => res.ok ? res.text() : `Sorry m8, ERROR ${res.status}`)
		.catch(e => new Error("Sorry m8: ", e))

	document.querySelector(".main").innerHTML = content;
	document.title = p.title;
};

const route = new Cicero();
route
	.redirect("", "/")
	.get("/", "/pages/welcome/index.html", ".main")

	.redirect("/pages/", "/list")
	.get("/list", "/pages/list/index.html", ".main")

	.route("/pages/:key/", (params) => loadPage(params.key))
	.route("/pages/:key/d/:file", (params) => window.open(`pages/${params.key}/${params.file}`, "_blank"))

	.start();

window.gspnp = { route };