// Script that talks to sw.js


// wrapper for qol
const instructionManager = (action, data) => new Promise(async (res, rej) => {
	const sw = navigator.serviceWorker;

	const toolong = () => {
		e.currentTarget.removeEventListener(e.type, handler);
		rej("Timed out");
	};

	const timeoutId = setTimeout(toolong, 60000);
	const reqid = Math.floor(Math.random() * (10**6));

	sw.addEventListener('message', function handler(e) {
		if (e.data.id !== reqid) return;

		// clean
		e.currentTarget.removeEventListener(e.type, handler);
		clearTimeout(timeoutId);

		if (!e.data.ok) rej("sw.js says it's not ok.")

		res(e.data.data);
	});
	sw.controller.postMessage({ id: reqid, action, data });
});

// hooking things up
const ready = new Promise((res, rej) => {
	if (!'serviceWorker' in navigator) rej('Service Worker API not available, for some reason.');

	const initialise = () => {
		const sw = navigator.serviceWorker;
		sw.addEventListener("message", m => console.log("vwomp! ", m.data));
		sw.controller.postMessage({ message: 'Hello from the client!' });
	};

	// reattach listners on change
	navigator.serviceWorker.addEventListener('controllerchange', () => initialise());

	// register
	navigator.serviceWorker.register('/sw.js').then((registration) => {
		console.log('Service Worker registered with scope:', registration.scope);
		initialise();
		res(true);
	}).catch((error) => {
		res(false)
		console.error('Service Worker registration failed:', error)
	});
});


window.gspnsw = { ready, do: instructionManager };