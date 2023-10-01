// sets up router and handles page changes

import Router from "./router.js";
import pages from "/pages/0.js";

const loadPage = async function (key) {
	const p = pages[key];
	if (!p) throw "Sorry m8, can't find that";

	const content = await fetch(`/pages/${p.home}index.html`)
		.then(res => res.text())
		.catch(e => new Error("Sorry m8: ", e))

	document.querySelector(".main").innerHTML = content;
};

const listPages = function ({ filter, showtags, showinvis }) {

};

const route = new Router();

route
	.get("", () => route.navigateTo("/"))
	.get("/", () => loadPage("welcome"))
//.get("/list", () => listPages())

route.start();

window.gspnp = { route };