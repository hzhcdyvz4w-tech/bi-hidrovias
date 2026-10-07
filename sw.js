const CACHE="bi-hidrovias-mobile-20261007-6";
const SHELL=["./","./index.html","./manifest.webmanifest","./assets/app-icon-180.png","./assets/app-icon-192.png","./assets/app-icon-512.png","./assets/vendor/jszip.min.js","./data/bi_hidrovias_public.json","./data/concessoes_base_integrada_2026.json","./data/politica_hidroviaria_regional_2026.json","./data/concessoes_matriz_consultas_povos_2026.json"];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const networkFirst=event.request.mode==="navigate"||/\.(json|html?)$/i.test(url.pathname);
 if(networkFirst){
   event.respondWith(fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return resp}).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html"))));
 }else{
   event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return resp})));
 }
});
