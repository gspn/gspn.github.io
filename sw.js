const cacheVersion = "v0.1.0";
const preCacheList = [
	// base
	'/',
	'/index.html',
	'/style/shadow.css',
	'/style/share_tech_mono.woff2',
	'/style/layout.css',
	'/src/comms.js',

	// page
	'/src/cicero.js',
	'/src/page.js',
	'/src/caching.js',
	'/pages/0.js',

	// system pages
	'/pages/welcome/index.html',
	'/pages/list/index.html',
	'/pages/config/index.html',
	'/pages/caching/index.html'
];

// handlers

const addResourcesToCache = async (resources) => {
	const cache = await caches.open(cacheVersion);
	await cache.addAll(resources);
};

const clearOldCaches = async keep => {
	const cacheNames = await caches.keys();
	const oldCaches = cacheNames.filter((name) => name !== keep);

	await Promise.all(
		oldCaches.map((cacheName) => {
			return caches.delete(cacheName);
		})
	);
};

const listCache = async () => {
	const cache = await caches.open(cacheVersion);
	const keys = await cache.keys();
	return keys.map(k => k.url);
};

const instruction = async event => {
	const client = event.source;

	if (!event.data || !event.data.action || !event.data.id)
		return client.postMessage({ id: event.data.id, ok: false });

	const action = event.data?.action;
	const data = event.data.data; // Don't mind the confuschied name

	let ok = false, response;
	switch (action) {
		case "cache":
			response = true;
			await addResourcesToCache(data).catch(() => response = false);
			ok = true;
			break;
		case "cached":
			await caches.match(data.url).then(res => response = Boolean(res));
			ok = true;
			break;
		case "age":
			await caches.match(data.url).then(res => response = Math.abs(Date.now() - Date.parse(res.headers.get("Date"))));
			ok = true;
			break;
		case "recache":
			await addResourcesToCache(await listCache());
			response = true;
			ok = true;
			break;
		case "clear":
			await clearOldCaches();
			response = true;
			ok = true;
			break;
		case "reset":
			await clearOldCaches();
			await addResourcesToCache(preCacheList);
			response = true;
			ok = true;
	};

	return client.postMessage({
		id: event.data.id,
		ok,
		data: response
	});
};


// listeners

addEventListener('message', event => instruction(event));

addEventListener('install', event => {
	event.waitUntil(addResourcesToCache(preCacheList));
});

addEventListener('activate', event => {
	event.waitUntil(
		Promise.all([
			clearOldCaches(cacheVersion),
			// Take immediate control of all pages
			clients.claim()
		])
	);
});

addEventListener('fetch', event => {
	let request = event.request.clone();

	// strip hash, for use in cache
	const urlWithoutHash = new URL(request.url);
	urlWithoutHash.hash = '';
	request = new Request(urlWithoutHash, { ...request });

	event.respondWith(
		caches.match(request)
			.then((response) => response || fetch(event.request))
	);
});
