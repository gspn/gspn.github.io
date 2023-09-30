// custom router, might publish one day

class Router {
	constructor() {
		this.routes = [];
		this.root = '/';
	}

	get(fragment, callback) {
		const route = {
			fragment,
			callback,
		};
		this.routes.push(route);
		return this;
	}

	navigate() {
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

	navigateTo(fragment) {
		window.location.hash = new URL(
			fragment,
			new URL(
				this.currentPath(),
				"http://foo"
			)
		).pathname;
	}

	currentPath() {
		return window.location.hash.slice(1);
	}

	match(routePath, currentPath) {
		// Simple path matching with named fields
		const routeParts = routePath.split('/');
		const currentParts = currentPath.split('/');

		if (routeParts.length !== currentParts.length) return null;

		const params = {};
		for (const [i, routePart] of routeParts.entries()) {
			const currentPart = currentParts[i];

			if (routePart.startsWith(':')) {
				const paramName = routePart.slice(1);
				params[paramName] = currentPart;
			} else if (routePart !== currentPart) {
				return null;
			}
		}

		return params;
	}

	start() {
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

		// Listen for hash changes
		window.addEventListener('hashchange', (e) => this.navigate());

		// Initial navigation
		this.navigate();
		return this;
	}
};

export default Router;