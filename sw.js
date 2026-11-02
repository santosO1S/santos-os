/* Service worker: deixa o jogo funcionar offline depois da primeira abertura. */
const CACHE='shs-0.3.16';
const ASSETS=['./','./index.html','./css/style.css','./js/data.js','./js/state.js','./js/game.js','./js/challenges.js','./js/commands.js','./js/net.js','./js/rank.js','./js/radar.js','./js/city.js','./js/wm.js','./js/apps.js','./js/auth.js','./js/music.js','./js/main.js','./manifest.webmanifest','./icons/icon.svg','./assets/shs_trilha_ambiente.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  /* ranking online: sempre da rede, nunca do cache */
  const pth=new URL(e.request.url).pathname;if(pth.startsWith('/api/')||pth==='/admin.html'){e.respondWith(fetch(e.request).catch(()=>new Response(JSON.stringify({error:'offline'}),{status:503,headers:{'Content-Type':'application/json'}})));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./index.html'))))});
