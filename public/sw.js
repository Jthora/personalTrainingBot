const CACHE_VERSION = 'v4';
const CACHE_PREFIX = 'ptb-sw';
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const ALLOWED_CACHES = new Set([PRECACHE_NAME, RUNTIME_NAME]);
const NAV_FALLBACK = '/index.html';
const PRECACHE_URLS = [
  '/',
  NAV_FALLBACK,
  '/training_modules_manifest.json',
  '/training_modules_shards/fitness.json',
];
const MEDIA_CACHE_MAX = 40;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !ALLOWED_CACHES.has(k)).map((k) => caches.delete(k))))
      .then(() => pruneRuntimeCache())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'CACHE_DIAG' && event.ports && event.ports[0]) {
    event.waitUntil(
      collectCacheInfo()
        .then((info) => event.ports[0].postMessage(info))
        .catch(() => event.ports[0].postMessage({ error: 'diag-failed' }))
    );
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

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (shouldHandle(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isMediaAsset(url)) {
    event.respondWith(staleWhileRevalidateMedia(request));
  }
});

async function handleNavigation(request) {
  const cache = await caches.open(PRECACHE_NAME);
  const cached = await cache.match(NAV_FALLBACK);
  if (cached) {
    fetchAndUpdate(cache, NAV_FALLBACK).catch(() => {});
    return cached;
  }

  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      cache.put(NAV_FALLBACK, resp.clone()).catch(() => {});
      return resp;
    }
  } catch (err) {
    if (cached) return cached;
  }

  return Response.error();
}

async function staleWhileRevalidateMedia(request) {
  const cache = await caches.open(RUNTIME_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (resp) => {
      if (resp && resp.ok) {
        await cache.put(request, resp.clone());
        await enforceMediaLimit(cache);
      }
      return resp;
    })
    .catch(() => null);

  if (cached) {
    fetchPromise.catch(() => {});
    return cached;
  }

  const network = await fetchPromise;
  if (network) return network;
  return Response.error();
}

async function enforceMediaLimit(cache) {
  const keys = await cache.keys();
  const mediaKeys = keys.filter((req) => isMediaAsset(new URL(req.url)));
  if (mediaKeys.length <= MEDIA_CACHE_MAX) return;
  const over = mediaKeys.length - MEDIA_CACHE_MAX;
  for (let i = 0; i < over; i += 1) {
    await cache.delete(mediaKeys[i]);
  }
}

async function cacheFirst(request) {
  const runtime = await caches.open(RUNTIME_NAME);
  const precache = await caches.open(PRECACHE_NAME);
  const cached = (await runtime.match(request)) || (await precache.match(request));
  if (cached) {
    fetchAndUpdate(runtime, request);
    return cached;
  }

  const resp = await fetch(request).catch(() => null);
  if (resp && resp.ok) {
    runtime.put(request, resp.clone());
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

function isMediaAsset(url) {
  const isAsset = url.pathname.startsWith('/assets/');
  const isSupported =
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp');
  return isAsset && isSupported;
}

function isStaticAsset(url) {
  const isAsset = url.pathname.startsWith('/assets/');
  if (!isAsset) return false;
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.mp3')
  );
}

function isRuntimeCacheable(url) {
  return (
    url.pathname === '/training_modules_manifest.json' ||
    url.pathname.startsWith('/training_modules_shards/') ||
    isMediaAsset(url) ||
    isStaticAsset(url)
  );
}

async function pruneRuntimeCache() {
  const cache = await caches.open(RUNTIME_NAME);
  const keys = await cache.keys();
  const stale = keys.filter((req) => !isRuntimeCacheable(new URL(req.url)));
  await Promise.all(stale.map((req) => cache.delete(req)));
}

async function collectCacheInfo() {
  const names = await caches.keys();
  const entries = {};
  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    entries[name] = keys.map((req) => new URL(req.url).pathname);
  }
  return { version: CACHE_VERSION, precache: PRECACHE_NAME, runtime: RUNTIME_NAME, entries };
}
