// sets up router and handles page changes

import Router from "./router.js";
import pages from "/pages/0.js";

const loadPage = function () {

};

const listPages = function ({ filter, showtags, showinvis }) {

};

const route = new Router();

route
	.get("", () => route.navigateTo("/"))
	//.get("/", () => loadPage("welcome"))
	//.get("/list", () => listPages())

route.start();

window.gspnp = { route };