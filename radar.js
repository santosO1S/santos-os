'use strict';
/* ============================================================
   RADAR GLOBAL — globo com ataques SIMULADOS entre cidades.
   Tudo é aleatório e fictício; nenhum sistema real é monitorado.
   Desenhado em canvas, sem bibliotecas externas.
   ============================================================ */
const Radar=(()=>{
 /* contornos grosseiros de continentes (lon, lat) — só para o visual */
 const POLY=[
  [[-168,66],[-140,70],[-95,72],[-60,60],[-55,47],[-70,42],[-80,25],[-97,18],[-88,15],[-80,8],[-100,16],[-118,32],[-125,48],[-140,60]],
  [[-55,60],[-20,70],[-30,83],[-60,80]],
  [[-80,10],[-60,11],[-35,-6],[-40,-22],[-58,-38],[-68,-55],[-74,-45],[-72,-18],[-81,-5]],
  [[-10,36],[-9,43],[-2,48],[5,52],[10,57],[20,60],[30,70],[60,70],[70,60],[40,45],[28,40],[20,38],[12,42],[0,38]],
  [[-17,21],[-5,36],[10,37],[32,31],[43,12],[51,11],[40,-5],[40,-16],[32,-29],[18,-34],[12,-18],[9,-1],[-8,4]],
  [[40,45],[60,70],[100,78],[140,72],[160,60],[140,35],[122,30],[105,10],[100,2],[80,8],[70,20],[57,25],[45,30]],
  [[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[117,-35]]];
 const CITIES=[['São Paulo',-23.5,-46.6],['Nova York',40.7,-74],['Londres',51.5,-0.1],['Tóquio',35.7,139.7],['Lagos',6.5,3.4],['Sydney',-33.9,151.2],['Moscou',55.8,37.6],['Mumbai',19.1,72.9],['Cidade do México',19.4,-99.1],['Pequim',39.9,116.4],['Cairo',30,31.2],['Buenos Aires',-34.6,-58.4]];
 const CATS={phish:{n:'PHISHING',c:'#ff5c8a',v:0},malw:{n:'MALWARE',c:'#ffb347',v:0},rans:{n:'RANSOM',c:'#65ff91',v:0}};
 const CK=Object.keys(CATS);
 let SUNV=[1,0,0],cv=null,cx2=null,running=false,rot=0,zoom=1,spin=true,filter='all',arcs=[],pulses=[],land=[],lastT=0,spawnAcc=0,statAcc=0,total=0;
 const D=Math.PI/180;

 function inPoly(lon,lat,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,yi]=p[i],[xj,yj]=p[j];
  if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))c=!c}return c}
 function buildLand(){for(let la=-60;la<=80;la+=2.5)for(let lo=-180;lo<180;lo+=2.5)if(POLY.some(p=>inPoly(lo,la,p)))land.push([la,lo])}
 /* lat/lon -> vetor 3D já girado (Z>0 = lado visível) */
 function v3(la,lo){const a=la*D,t=lo*D+rot;return[Math.cos(a)*Math.cos(t),Math.sin(a),Math.cos(a)*Math.sin(t)]}
 function rnd(a){return a[Math.floor(Math.random()*a.length)]}
 /* hora UTC e posição do sol (ponto de maior luz) a partir do relógio do aparelho */
 function utcH(){const d=new Date();return d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600}
 function sunVec(){const d=new Date();const doy=(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,1))/864e5+1;
  const dec=23.44*Math.sin(2*Math.PI*(doy-81)/365)*D;const lon=(12-utcH())*15*D;return geo(dec/D,lon/D)}
 /* vetor geográfico sem rotação (usado para dia/noite) */
 function geo(la,lo){const a=la*D,t=lo*D;return[Math.cos(a)*Math.cos(t),Math.sin(a),Math.cos(a)*Math.sin(t)]}
 function isDay(la,lo){const g=geo(la,lo);return(g[0]*SUNV[0]+g[1]*SUNV[1]+g[2]*SUNV[2])>-0.05}
 /* cidades com horário comercial (8h–19h locais) recebem mais ataques */
 function cityW(c){const h=(utcH()+c[2]/15+24)%24;return h>=8&&h<=19?1:0.25}
 function pickCity(){const w=CITIES.map(cityW),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<CITIES.length;i++){r-=w[i];if(r<=0)return CITIES[i]}return CITIES[0]}

 function spawn(){const pool=filter==='all'?CK:[filter];const k=rnd(pool);let a=pickCity(),b=pickCity();
  if(a===b)return;CATS[k].v++;total++;arcs.push({a,b,k,t:0,sp:0.35+Math.random()*0.35})}

 function frame(now){
  if(!$('#w-radar')||!$('#w-radar').classList.contains('show')){running=false;return}
  const dt=Math.min(0.05,(now-lastT)/1000||0);lastT=now;
  if(spin)rot+=dt*0.25;
  SUNV=sunVec();
  spawnAcc+=dt;if(spawnAcc>0.55){spawnAcc=0;spawn()}
  arcs.forEach(x=>x.t+=dt*x.sp);
  arcs=arcs.filter(x=>{if(x.t>=1){pulses.push({p:x.b,k:x.k,age:0});return false}return true});
  pulses.forEach(p=>p.age+=dt);pulses=pulses.filter(p=>p.age<1.2);
  statAcc+=dt;if(statAcc>0.7){statAcc=0;stats()}
  draw();requestAnimationFrame(frame)}

 function draw(){const dpr=window.devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const g=cx2;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2,R=Math.min(w,h)*0.40*zoom;
  const P=(v)=>[cx+R*v[0],cy-R*v[1]];
  /* atmosfera */
  const gr=g.createRadialGradient(cx,cy,R*0.9,cx,cy,R*1.25);gr.addColorStop(0,'rgba(92,255,143,0.18)');gr.addColorStop(1,'rgba(92,255,143,0)');
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R*1.25,0,Math.PI*2);g.fill();
  /* esfera */
  const sg=g.createRadialGradient(cx-R*0.3,cy-R*0.35,R*0.1,cx,cy,R);sg.addColorStop(0,'#15281c');sg.addColorStop(1,'#050a07');
  g.fillStyle=sg;g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.fill();
  g.strokeStyle='rgba(92,255,143,0.25)';g.lineWidth=1;g.stroke();
  /* meridianos e paralelos */
  g.strokeStyle='rgba(92,255,143,0.07)';
  for(let la=-60;la<=60;la+=30){g.beginPath();let f=true;for(let lo=-180;lo<=180;lo+=4){const v=v3(la,lo);if(v[2]<0){f=true;continue}const[x,y]=P(v);f?g.moveTo(x,y):g.lineTo(x,y);f=false}g.stroke()}
  for(let lo=-180;lo<180;lo+=30){g.beginPath();let f=true;for(let la=-90;la<=90;la+=4){const v=v3(la,lo);if(v[2]<0){f=true;continue}const[x,y]=P(v);f?g.moveTo(x,y):g.lineTo(x,y);f=false}g.stroke()}
  /* continentes em pontos */
  for(const[la,lo] of land){const v=v3(la,lo);if(v[2]<0.02)continue;const[x,y]=P(v);
   const k=isDay(la,lo)?1:0.3;g.fillStyle='rgba(150,220,175,'+((0.2+0.7*v[2])*k).toFixed(3)+')';g.fillRect(x-0.9,y-0.9,1.8,1.8)}
  /* cidades */
  for(const c of CITIES){const v=v3(c[1],c[2]);if(v[2]<0)continue;const[x,y]=P(v);const night=!isDay(c[1],c[2]);g.fillStyle=night?'rgba(255,217,138,0.95)':'rgba(230,255,240,0.6)';g.beginPath();g.arc(x,y,night?2.4:1.6,0,Math.PI*2);g.fill()}
  /* arcos de ataque */
  for(const x of arcs){const A=v3(x.a[1],x.a[2]),B=v3(x.b[1],x.b[2]),col=CATS[x.k].c,N=40;let last=null;
   for(let i=0;i<=N;i++){const t=i/N*x.t;const L=[(1-t)*A[0]+t*B[0],(1-t)*A[1]+t*B[1],(1-t)*A[2]+t*B[2]],m=Math.hypot(...L)||1;
    const lift=1+0.32*Math.sin(Math.PI*t);const v=[L[0]/m*lift,L[1]/m*lift,L[2]/m*lift];
    const[px,py]=P(v);if(last&&v[2]>-0.1){g.strokeStyle=hexA(col,0.15+0.85*i/N);g.lineWidth=1.4;g.beginPath();g.moveTo(last[0],last[1]);g.lineTo(px,py);g.stroke()}last=[px,py]}
   if(last){g.fillStyle=col;g.beginPath();g.arc(last[0],last[1],2.2,0,Math.PI*2);g.fill()}}
  /* pulsos de chegada */
  for(const p of pulses){const v=v3(p.p[1],p.p[2]);if(v[2]<0)continue;const[x,y]=P(v);
   g.strokeStyle=hexA(CATS[p.k].c,1-p.age/1.2);g.lineWidth=1.5;g.beginPath();g.arc(x,y,4+p.age*18,0,Math.PI*2);g.stroke()}
 }
 function hexA(hex,a){const n=parseInt(hex.slice(1),16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a.toFixed(3)+')'}

 function stats(){const tm=$('#rd-time');if(tm){const d=new Date();tm.textContent='UTC '+String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')+' • SIMULADO'}
  const el=$('#rd-stats');if(!el)return;
  el.innerHTML=CK.map(k=>`<button data-rd="cat:${k}" class="rd-cat${filter===k?' on':''}" style="--c:${CATS[k].c}"><small>${CATS[k].n}</small><b>${fmtN(CATS[k].v)}</b></button>`).join('')}
 function render(){const b=$('#b-radar');b.innerHTML=`<div class="rd"><div class="rd-top"><b>RADAR GLOBAL</b><span class="rd-live" id="rd-time">● SIMULADO</span></div>
  <div class="rd-wrap"><canvas id="rd-cv"></canvas><div class="rd-ctl"><button data-rd="spin" class="${spin?'on':''}" aria-label="Girar">⟲</button><button data-rd="zin" aria-label="Aproximar">+</button><button data-rd="zout" aria-label="Afastar">−</button></div></div>
  <div class="rd-tabs"><button data-rd="cat:all" class="rd-cat${filter==='all'?' on':''}"><small>TODOS</small><b>${fmtN(total)}</b></button><div id="rd-stats" class="rd-stats"></div></div>
  <p class="rd-note">Ataques aleatórios e fictícios. Nenhum sistema real é monitorado.</p></div>`;
  b.addEventListener('click',e=>{const x=e.target.closest('[data-rd]');if(!x)return;const a=x.dataset.rd;
   if(a==='spin'){spin=!spin;x.classList.toggle('on',spin)}
   else if(a==='zin')zoom=Math.min(1.8,zoom+0.15);
   else if(a==='zout')zoom=Math.max(0.7,zoom-0.15);
   else if(a.startsWith('cat:')){filter=a.slice(4);arcs=arcs.filter(x=>filter==='all'||x.k===filter);render();stats()}});
  cv=$('#rd-cv');cx2=cv.getContext('2d');stats()}
 function fmtN(n){return Number(n).toLocaleString('pt-BR')}

 function mount(){if(!land.length)buildLand();
  if(!$('#rd-cv')){render()}
  if(!running){running=true;lastT=performance.now();requestAnimationFrame(frame)}}
 return{mount,sunVec,isDay,pickCity,setSun:v=>{SUNV=v}};
})();
