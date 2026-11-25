// Bump VERSION on every release so phones fetch the new files.
const VERSION = '6';
const CACHE = 'apnoe-' + VERSION;
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/bricolage-grotesque-500.woff2', 'fonts/bricolage-grotesque-700.woff2',
  'fonts/figtree-400.woff2', 'fonts/figtree-500.woff2', 'fonts/figtree-600.woff2',
  'fonts/dm-mono-400.woff2', 'fonts/dm-mono-500.woff2',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache so a release is never half old, half new
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('apnoe-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
