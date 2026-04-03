const CACHE_NAME = "panchayat-water-vite-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);
      await cacheBundledAssets(cache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cachedShell) => cachedShell || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchAndCache = fetch(event.request).then((response) => {
        if (event.request.url.startsWith(self.location.origin) && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });

      if (cached) return cached;
      return fetchAndCache.catch(() => caches.match("/index.html"));
    })
  );
});

async function cacheBundledAssets(cache) {
  try {
    const response = await fetch("/index.html", { cache: "no-store" });
    const html = await response.text();
    const assets = extractAssetUrls(html);
    if (assets.length) {
      await cache.addAll(assets);
    }
  } catch {
    return;
  }
}

function extractAssetUrls(html) {
  const urls = new Set();
  const regex = /(src|href)=["']([^"']+)["']/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[2];
    if (!raw || raw.startsWith("http") || raw.startsWith("data:")) continue;
    if (!(raw.startsWith("/") || raw.startsWith("./"))) continue;

    const normalized = raw.startsWith("./") ? raw.slice(1) : raw;
    if (/\.(css|js|png|svg|webmanifest|json)$/i.test(normalized)) {
      urls.add(normalized);
    }
  }

  return Array.from(urls);
}
