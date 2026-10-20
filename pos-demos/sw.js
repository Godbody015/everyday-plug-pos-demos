const V = 'pos-v1';
const CORE = ['/', '/shared/css/base.css', '/shared/js/currency.js', '/shared/js/cart.js', '/shared/js/storage.js', '/shared/js/pwa.js',
  '/cafe/', '/cafe/style.css', '/cafe/menu.js', '/cafe/app.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => clients.claim())));
/* Network first so updates show straight away; cache is the offline fallback. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
