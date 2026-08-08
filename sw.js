// Service worker: cache-first so the game opens instantly and works offline.
// CACHE name carries the build stamp — a new build invalidates the old cache.
const CACHE='hexarena-1786190949';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(e.request.method==='GET'&&res.ok){
        const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
