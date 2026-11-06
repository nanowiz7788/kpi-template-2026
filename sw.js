// 캐시 버전: j3-kpi-template-2026-v6-scroll1
const C='j3-kpi-template-2026-v6-scroll1';
const A=["./","index.html","manifest.json","robots.txt","core/j3_splash.html","core/launcher.js","core/launcher.css","core/gate.js","core/gate.css","app/icons/icon-192.png","app/icons/icon-512.png","app/icons/icon.svg","app/icons/apple-touch-icon-180.png","app/icons/favicon.ico","app/icons/favicon-32.png","app/icons/maskable-192.png","app/icons/maskable-512.png","app/content/index.html","app/content/app.css","app/content/app.js","app/content/seed.js","app/content/mascot.js","app/content/mascot/kpi_mascot_low.png","app/content/mascot/kpi_mascot_mid.png","app/content/mascot/kpi_mascot_high.png","app/game/index.html","app/game/game.css","app/game/engine.js","app/game/game.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));}return r}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('index.html'))))});
