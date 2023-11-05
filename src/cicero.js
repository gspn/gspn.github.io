// more polished custom router, might publish

export default class Cicero {
	/**
	 * Creates a cicero router instance
	 * @param {String} root The root of the application that will use the router. Defaults to /.
	 */
	constructor(root = "/"){
		this.routes = [];
		this.root = root;
	}

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
	 */
	get(fragment, path){
		return this.route(fragment, );
	}

	/**
	 * Add a route for a redirect
	 * @param {String} fragment The path to match for
	 * @param {String} path The path to redirect to
	 */
	redirect(fragment, path){
		return this.route(fragment, () => this.navigateTo(path));
	}

	/**
	 * Navigate to the route defined by the current hash
	 */
	navigate(){
		const path = this.currentPath();

		for (const route of this.routes) {
			const params = this.match(route.fragment, path);
			if (params) {
				route.callback(params);
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
	navigateTo(fragment){
		location.hash = new URL(
			fragment,
			new URL(
				this.currentPath(),
				"http://foo"
			)
		).pathname;
		location.reload();
	}

	/**
	 * Returns the current hash value without the leading #
	 * @returns {String} the current hash value, expected to be a path
	 */
	currentPath() {
		return window.location.hash.slice(1);
	}

	start(){
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

		return this;
	};
};