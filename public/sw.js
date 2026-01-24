const CACHE_NAME = 'ptb-sw-v1';
const PRECACHE = ['/training_modules_manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const shouldHandle = (url) => {
  return (
    url.pathname === '/training_modules_manifest.json' ||
    url.pathname.startsWith('/training_modules_shards/')
  );
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!shouldHandle(url)) return;

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    // Update in background
    fetchAndUpdate(cache, request);
    return cached;
  }

  const resp = await fetch(request).catch(() => null);
  if (resp && resp.ok) {
    cache.put(request, resp.clone());
    return resp;
  }

  if (cached) return cached;
  return resp ?? Response.error();
}

async function fetchAndUpdate(cache, request) {
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      await cache.put(request, resp.clone());
    }
  } catch (e) {
    // ignore
  }
}
