// Service worker: cache-first so the game opens instantly and works offline.
// CACHE name carries the build stamp — a new build invalidates the old cache.
const CACHE='hexarena-202608082232';
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
  const req=e.request;
  const isPage = req.mode==='navigate' ||
                 (req.method==='GET' && (req.headers.get('accept')||'').includes('text/html'));
  if(isPage){
    // network-first: always try for a fresh build, fall back to cache offline
    e.respondWith(
      fetch(req).then(res=>{
        const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));
        return res;
      }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }
  // everything else (icons, manifest): cache-first
  e.respondWith(
    caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(req.method==='GET'&&res.ok){
        const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
