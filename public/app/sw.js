/* Eyro App service worker.
 * Caches only the app's own shell so it opens with no signal and shows
 * "can't reach Eyro" instead of a browser error. Nothing from Eyro is ever
 * cached: agent data comes over the relay socket, sealed, and stays live. */
const SHELL = "eyro-shell-v2";
const FILES = ["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png",
               "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/logo-96.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // The page: network first so updates land, the cached shell when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => {
      const copy = r.clone(); caches.open(SHELL).then((c) => c.put("./", copy)); return r;
    }).catch(() => caches.match("./")));
    return;
  }
  // Icons and the manifest: cache first.
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

// Push: content-free by design ("Atlas needs you"). Detail loads in the app.
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch {}
  e.waitUntil(self.registration.showNotification(d.title || "Eyro", {
    body: d.body || "Something is waiting for you.",
    icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: d.instance || "eyro",
    data: { instance: d.instance || null },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const inst = e.notification.data && e.notification.data.instance;
  const url = "./" + (inst ? "#" + inst : "");
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((cs) => {
    const c = cs.find((x) => "focus" in x);
    return c ? c.focus().then(() => c.navigate ? c.navigate(url) : c) : self.clients.openWindow(url);
  }));
});
