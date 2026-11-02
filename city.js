'use strict';
/* ============================================================
   CIDADE — visão de cima, com ruas e personagens.
   Você anda pelas ruas (toque, setas ou botões) e entra nos
   prédios para acessar os locais. Os locais continuam os mesmos
   de PLACES; a cidade é só outra forma de chegar até eles.
   ============================================================ */
const City=(()=>{
 const W=40,H=30,T=26;
 const COLS=[3,12,20,29,37],ROWS=[4,11,18,25];
 const WALKABLE=t=>t!==1;               /* 0 rua, 2 parque, 3 praça, 4 entrada: andáveis; 1 prédio: bloqueado */
 let grid=null,doors={},cv=null,cx2=null,running=false,lastT=0;
 let px=0,py=0,path=[],lastDoor=null,dirTimer=null,pad=null;

 function rng(seed){return()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff}}
 function build(){
  const r=rng(42);grid=[];
  for(let y=0;y<H;y++){grid.push([]);for(let x=0;x<W;x++){
   const road=COLS.includes(x)||ROWS.includes(y);
   if(road){grid[y].push(0);continue}
   const q=r();grid[y].push(q<0.10?2:q<0.16?3:1)}}
  /* cada local ganha uma entrada na rua mais próxima da posição dele no mapa */
  const roads=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(grid[y][x]===0)roads.push([x,y]);
  const used=new Set();
  PLACES.forEach(p=>{const tx=p.x/340*(W-1),ty=p.y/270*(H-1);
   let best=null,bd=1e9;for(const[x,y]of roads){const k=x+','+y;if(used.has(k))continue;const d=Math.hypot(x-tx,y-ty);if(d<bd){bd=d;best=[x,y]}}
   if(best){used.add(best[0]+','+best[1]);grid[best[1]][best[0]]=4;doors[p.id]=best}});
 }
 const P=id=>PLACES.find(p=>p.id===id);
 /* horário de funcionamento (hora local do aparelho) */
 const HOURS={apt:[0,24],lab:[7,23],corp:[8,18],data:[0,24],market:[8,20],tech:[9,21],under:[20,4]};
 function isOpen(id){const r=HOURS[id];if(!r)return true;const h=new Date().getHours();return r[0]<r[1]?(h>=r[0]&&h<r[1]):(h>=r[0]||h<r[1])}
 function openTxt(id){const r=HOURS[id];return r?String(r[0]).padStart(2,'0')+'h às '+String(r[1]%24).padStart(2,'0')+'h':''}
 /* personagens que andam entre locais (a cada parada, passam a estar naquele local) */
 const ROUTES={rafa:['corp','tech'],caio:['market','tech'],tavares:['data','market'],lidia:['tech','lab']};
 const WALK={};let walkersOn=false;
 function initWalkers(){Object.keys(ROUTES).forEach(id=>{const r=ROUTES[id],n=NPCS.find(x=>x.id===id);if(!n||!doors[r[0]])return;
  const d=doors[r[0]];WALK[id]={x:d[0],y:d[1],path:[],wait:1+Math.random()*3,idx:0,route:r};n.p=r[0]})}
 function updateWalkers(dt){for(const id in WALK){const w=WALK[id],n=NPCS.find(x=>x.id===id);
  if(w.path.length){const[tx,ty]=w.path[0],sp=3*dt,dx=tx-w.x,dy=ty-w.y,dd=Math.hypot(dx,dy);
   if(dd<=sp){w.x=tx;w.y=ty;w.path.shift();if(!w.path.length)n.p=w.route[w.idx]}else{w.x+=dx/dd*sp;w.y+=dy/dd*sp}}
  else{w.wait-=dt;if(w.wait<=0){w.idx=(w.idx+1)%w.route.length;const dst=doors[w.route[w.idx]];
   w.path=findPath(Math.round(w.x),Math.round(w.y),dst[0],dst[1]);w.wait=2+Math.random()*3}}}}
 /* próximo objetivo da campanha/treino, com o local onde fica */
 const GOAL={m1:'lab',m2:'lab',m3:'lab',m7:'market',m4:'corp',m5:'corp',m6:'data',c1:'lab',c2:'lab',c3:'corp',c4:'corp',c5:'tech',c6:'data',c7:'data',c8:'under',c9:'corp'};
 function goal(){const m=MIS.find(x=>avail(x));return m?{m,id:GOAL[m.id]||'apt'}:null}
 function doorAt(x,y){return Object.keys(doors).find(k=>doors[k][0]===x&&doors[k][1]===y)||null}

 /* busca em largura: menor caminho até o alvo */
 function findPath(sx,sy,tx,ty){if(!grid[ty]||!WALKABLE(grid[ty][tx]))return[];
  const prev=new Map(),q=[[sx,sy]],key=(x,y)=>x+','+y;prev.set(key(sx,sy),null);
  while(q.length){const[x,y]=q.shift();if(x===tx&&y===ty){const out=[];let c=[x,y];while(c){out.unshift(c);c=prev.get(key(c[0],c[1]))}return out.slice(1)}
   for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;if(!WALKABLE(grid[ny][nx])||prev.has(key(nx,ny)))continue;prev.set(key(nx,ny),[x,y]);q.push([nx,ny])}}
  return[]}

 function goTo(id){const d=doors[id];if(!d)return false;
  path=findPath(Math.round(px),Math.round(py),d[0],d[1]);return path.length>0}
 function stepDir(dx,dy){const cx=Math.round(px),cy=Math.round(py);const nx=cx+dx,ny=cy+dy;
  if(nx<0||ny<0||nx>=W||ny>=H||!WALKABLE(grid[ny][nx]))return;if(path.length===0)path=[[nx,ny]]}

 /* chegou em uma entrada: abre o local (se o operador puder entrar) */
 function onTile(x,y){const id=doorAt(x,y);if(!id){lastDoor=null;return}
  if(lastDoor===id)return;lastDoor=id;const p=P(id);
  if(!isOpen(id)){toast('🕒 '+p.name+' está fechado agora. Abre das '+openTxt(id)+'.');return}
  if(!placeOk(p)){toast('🔒 '+p.name+': requer nível '+p.lvl+(p.rep?' e reputação '+p.rep:''));return}
  if(s.loc!==id)runUI('connect '+id);
  openWin('loc')}

 function update(dt){if(!path.length)return;const[tx,ty]=path[0],sp=6.5*dt,dx=tx-px,dy=ty-py,d=Math.hypot(dx,dy);
  if(d<=sp){px=tx;py=ty;path.shift();onTile(tx,ty);if(!path.length)save()}
  else{px+=dx/d*sp;py+=dy/d*sp}}

 const COL={road:'#0b1a11',block:'#14291c',park:'#0c3522',plaza:'#122f1f',door:'#1f7a43'};
 function draw(){const dpr=window.devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const g=cx2;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#030705';g.fillRect(0,0,w,h);
  const camX=px*T-w/2,camY=py*T-h/2;
  const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(W-1,Math.ceil((camX+w)/T)+1),y0=Math.max(0,Math.floor(camY/T)-1),y1=Math.min(H-1,Math.ceil((camY+h)/T)+1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=grid[y][x],sx=x*T-camX,sy=y*T-camY;
   let c=t===0?COL.road:t===1?COL.block:t===2?COL.park:t===3?COL.plaza:COL.door;
   g.fillStyle=c;g.fillRect(sx,sy,T,T);
   if(t===1){g.strokeStyle='rgba(92,255,143,0.07)';g.strokeRect(sx+2.5,sy+2.5,T-5,T-5)}
   if(t===2){g.fillStyle='rgba(92,255,143,0.18)';for(let k=0;k<3;k++){g.beginPath();g.arc(sx+6+k*7,sy+8+(k%2)*10,1.6,0,Math.PI*2);g.fill()}}
   if(t===0&&(y===ROWS.find(r=>r===y)||x===COLS.find(c=>c===x))){/* faixa central tracejada */
    g.strokeStyle='rgba(230,255,240,0.08)';g.setLineDash([4,6]);g.beginPath();
    if(ROWS.includes(y)){g.moveTo(sx,sy+T/2);g.lineTo(sx+T,sy+T/2)}else{g.moveTo(sx+T/2,sy);g.lineTo(sx+T/2,sy+T)}g.stroke();g.setLineDash([])}}
  /* entradas: prédio com nome */
  for(const p of PLACES){const d=doors[p.id];if(!d)continue;const sx=d[0]*T-camX,sy=d[1]*T-camY;
   const lk=!placeOk(p),here=s.loc===p.id;
   g.fillStyle=lk?'rgba(60,70,64,0.55)':'rgba(92,255,143,'+(here?0.55:0.25)+')';g.fillRect(sx+3,sy+3,T-6,T-6);
   g.strokeStyle=lk?'#4a5c51':'#5cff8f';g.lineWidth=1.5;g.strokeRect(sx+3,sy+3,T-6,T-6);
   g.fillStyle='#e6fbee';g.font='bold 10px ui-monospace,monospace';g.textAlign='center';g.fillText(lk?'🔒':!isOpen(p.id)?'🕒':p.short,sx+T/2,sy-5)}
  /* marcador do próximo objetivo */
  const gl=goal();if(gl&&doors[gl.id]){const d=doors[gl.id];const r=T*(0.55+0.12*Math.sin(performance.now()/300));g.strokeStyle='#ffd27a';g.lineWidth=2;g.beginPath();g.arc(d[0]*T-camX+T/2,d[1]*T-camY+T/2,r+T*0.45,0,Math.PI*2);g.stroke()}
  /* personagens */
  for(const n of NPCS){let x,y;if(WALK[n.id]){x=WALK[n.id].x;y=WALK[n.id].y}else{const d=doors[n.p];if(!d)continue;x=d[0];y=d[1]}
   const sx=x*T-camX+T*0.78,sy=y*T-camY+T*0.18;g.fillStyle='#ffd27a';g.beginPath();g.arc(sx,sy,3,0,Math.PI*2);g.fill()}
  /* jogador */
  const ox=px*T-camX+T/2,oy=py*T-camY+T/2;
  g.fillStyle='rgba(92,255,143,0.22)';g.beginPath();g.arc(ox,oy,T*0.7,0,Math.PI*2);g.fill();
  g.fillStyle='#5cff8f';g.beginPath();g.arc(ox,oy,T*0.3,0,Math.PI*2);g.fill();
  g.fillStyle='#03140a';g.beginPath();g.arc(ox,oy,T*0.12,0,Math.PI*2);g.fill();
  g.textAlign='start'}

 function frame(now){if(!$('#w-city')||!$('#w-city').classList.contains('show')){running=false;return}
  const dt=Math.min(0.05,(now-lastT)/1000||0);lastT=now;update(dt);updateWalkers(dt);draw();
  const l=$('#cy-loc');if(l){const here=doorAt(Math.round(px),Math.round(py));l.textContent=here?P(here).name:'Rua'}
  const gg=$('#cy-goal');if(gg){const gl=goal();const t=gl?'🎯 '+gl.m.name+' • '+P(gl.id).name:'Sem objetivo no momento';if(gg.textContent!==t)gg.textContent=t}
  requestAnimationFrame(frame)}
 function save(){s.cpos={x:Math.round(px),y:Math.round(py)};persist()}
 function start(){if(!running){running=true;lastT=performance.now();requestAnimationFrame(frame)}}

 function tap(e){const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const camX=px*T-cv.clientWidth/2,camY=py*T-cv.clientHeight/2;
  const tx=Math.floor((mx+camX)/T),ty=Math.floor((my+camY)/T);
  if(tx<0||ty<0||tx>=W||ty>=H)return;
  path=findPath(Math.round(px),Math.round(py),tx,ty)}
 function mount(){
  if(!$('#cy-cv')){if(!grid)build();
   $('#b-city').innerHTML=`<div class="cy"><div class="cy-top"><b>CIDADE</b><span id="cy-loc">Rua</span></div><div class="cy-goal" id="cy-goal">—</div>
    <div class="cy-wrap"><canvas id="cy-cv"></canvas></div>
    <div class="cy-pad"><button data-cy="up" aria-label="Cima">▲</button><div class="cy-row"><button data-cy="left" aria-label="Esquerda">◀</button><button data-cy="down" aria-label="Baixo">▼</button><button data-cy="right" aria-label="Direita">▶</button></div></div>
    <p class="rd-note">Toque na rua para andar. Entre nos prédios para acessar os locais. Setas do teclado também funcionam.</p></div>`;
   cv=$('#cy-cv');cx2=cv.getContext('2d');
   const cp=s.cpos&&grid[s.cpos.y]&&WALKABLE(grid[s.cpos.y][s.cpos.x])?s.cpos:null;const d=cp?[cp.x,cp.y]:(doors[s.loc]||doors.apt);px=d[0];py=d[1];lastDoor=doorAt(Math.round(px),Math.round(py));
   if(!walkersOn){initWalkers();walkersOn=true}
   cv.addEventListener('pointerdown',tap);
   const b=$('#b-city');
   b.addEventListener('pointerdown',e=>{const x=e.target.closest('[data-cy]');if(!x)return;e.preventDefault();const dir={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[x.dataset.cy];
    stepDir(...dir);clearInterval(dirTimer);dirTimer=setInterval(()=>stepDir(...dir),160)});
   const stop=()=>clearInterval(dirTimer);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop)}
  start()}
 const KEYS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
 document.addEventListener('keydown',e=>{const k=KEYS[e.key];if(!k||!$('#w-city')||!$('#w-city').classList.contains('show'))return;
  const ae=document.activeElement;if(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))return;e.preventDefault();stepDir(...k)});
 return{mount,goTo,doors:()=>doors,pos:()=>({x:px,y:py}),tileOf:()=>[Math.round(px),Math.round(py)],isOpen,goal,WALK,ROUTES};
})();
