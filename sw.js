const cacheVersion = "v0.0.1";
const preCacheList = [
	'/',
	'/index.html',
	'/style/shadow.css',
	'/style/layout.css',
	'/src/comms.js',
	'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap'
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

const instruction = async event => {
	const client = event.source;

	if (!event.data || !event.data.action || !event.data.id)
		return client.postMessage({ id: event.data.id, ok: false });

	const action = event.data?.action;
	const data = event.data.data; // Don't mind the confuschied name

	let ok = false, response;
	switch (action) {
		case "amicache":
			await caches.match(client.url).then(res => response = Boolean(res));
			ok = true;
			break;
		case "iscached":
			await caches.match(data.url).then(res => response = Boolean(res));
			ok = true;
			break;
		case "clearcache":
			await clearOldCaches();
			response = true;
			ok = true;
			break;
		case "cache":
			await addResourcesToCache(data);
			response = true;
			ok = true;
		case "resetcache":
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
