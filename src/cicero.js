// more polished custom router, might publish

export default class Cicero {
	/**
	 * Creates a cicero router instance
	 * @param {String} root The root of the application that will use the router. Defaults to /.
	 */
	constructor(root = "/") {
		this.routes = [];
		this.root = root;
	}

	//
	// Route creators
	//

	/**
	 * Add a route to match for
	 * @param {String} fragment The path to match for
	 * @param {Function} callback The callack for the route
	 * @returns the router instance
	 */
	route(fragment, callback) {
		const route = {
			fragment,
			callback,
		};
		this.routes.push(route);
		return this;
	}

	/**
	 * Add a route for a document
	 * @param {String} fragment The path to match for
	 * @param {String} path The path to the document to load
	 * @param {String} target Target querystring for node to load document content into. Defaults to "body"
	 */
	get(fragment, path, target = "body") {
		return this.route(fragment, () => this.loadPage(path, document.querySelector(target)));
	}

	/**
	 * Add a route for a redirect
	 * @param {String} fragment The path to match for
	 * @param {String} path The path to redirect to
	 */
	redirect(fragment, path) {
		return this.route(fragment, () => this.navigateTo(path) && this.navigate());
	}

	//
	// Document manager
	//

	/**
	 * Loads a document
	 * @param {String} uri The path to the document to load
	 * @param {Node} target The node to load the document's body into
	 */
	async loadPage(uri, target = document.body) {
		const html = await fetch(uri).then(res => res.text());
		const newdoc = formatDocument(html);

		// merge heads
		document.head.append(...newdoc.head.childNodes);

		// change target/body
		target.innerHTML = "";
		target.append(...newdoc.body.childNodes);
		target.querySelectorAll("script").forEach(Cicero.replaceAndRunScript);

		//
		// helpers (mostly ripped from fireship's flamethrower)
		function formatDocument(html) {
			const parser = new DOMParser();
			return parser.parseFromString(html, 'text/html');
		}
	}
	static replaceAndRunScript(oldScript) {
		const newScript = document.createElement('script');
		const attrs = Array.from(oldScript.attributes);
		for (const { name, value } of attrs) {
			newScript[name] = value;
		}
		newScript.append(oldScript.textContent);
		oldScript.replaceWith(newScript);
	}

	//
	// Navigation and setup
	//

	/**
	 * Navigate to the route defined by the current hash
	 */
	navigate() {
		const path = this.currentPath();

		for (const route of this.routes) {
			const params = this.match(route.fragment, path);
			if (params) {
				route.callback(params, path);
				return this;
			}
		}

		// If no matching route found, perform default navigation
		//window.location.href = this.root + path;
		return this;
	}

	/**
	 * Sets the hash to the new fragment relative to the current one, then reloads the page
	 * @param {String} fragment the path to navigate to
	 */
	navigateTo(fragment) {
		location.hash = new URL(
			fragment,
			new URL(
				this.currentPath(),
				"http://foo"
			)
		).pathname;
		return true;
	}

	/**
	 * Returns the current hash value without the leading #
	 * @returns {String} the current hash value, expected to be a path
	 */
	currentPath() {
		return window.location.hash.slice(1);
	}

	match(routePath, currentPath) {
		// improved path matching
		const routereg = new RegExp(
			`^${routePath
				.replace(/:([\w]+)/g, "(?<$1>[^\\x00-\\x1f\\x7f <>#%\"{}|\\\\\\^[\\]`;/?:@&=+$,]+)")
				.replace(/\*([\w]+)/g, "(?<$1>[^\\x00-\\x1f\\x7f <>#%\"{}|\\\\\\^[\\]`;?:@&=+$,]+)")}$`
		);

		const match = currentPath.match(routereg);
		return match ? match.groups || {} : null;
	}

	start() {
		this.navigate();

		// Capture clicks on <a> links and use the router's route if available
		document.addEventListener('click', (e) => {
			if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
				const a = e.target
				const href = a.getAttribute('href');

				if ( // don't touch external links, etc
					a.getAttribute("download")
					|| a.getAttribute("target")
					|| a.getAttribute("rel") == "external"
					|| new URL(href, location).origin !== location.origin
					|| new URL(href, location).hash
				) return;

				e.preventDefault();
				this.navigateTo(href);
			}
		});

		// Listen for state changes
		window.addEventListener('popstate', () => this.navigate());

		return this;
	};
};