const C='concessoes-hidrovias-v17-sei';
const CORE=['./','./index.html','./manifest.webmanifest','./dados_concessoes.json','./camadas_geograficas.json','./jszip.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
