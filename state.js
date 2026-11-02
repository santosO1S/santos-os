'use strict';
/* ============================================================
   ESTADO, SALVAMENTO AUTOMÁTICO, EXPORTAR/IMPORTAR
   Chave de armazenamento 'shs' (a mesma da v0.2.1: saves antigos continuam válidos).
   ============================================================ */
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
let KEY=null;const VER=3,BUILD='0.3.0',XPL=500;const bkey=()=>(KEY||'shs')+'_bak';
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const norm=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const ITEM={};ITEMS.forEach(i=>ITEM[i.id]=i);
const P=id=>PLACES.find(p=>p.id===id);

const def=()=>({ver:VER,xp:0,cash:250,rep:0,done:[],visited:['apt'],loc:'apt',inv:[],flags:{},found:[],ui:null,
 cpos:null,name:'guest',pid:rid(),skills:[],ach:[],board:[],bseq:0,docs:{},ntf:[],
 pc:{cpu:'cpu1',ram:'ram1',ssd:'ssd1',net:'nic1',up:{cpu:0,ram:0,ssd:0,net:0},name:'Notebook Básico'},
 stats:{cmds:0,contracts:0,failed:0,earned:0,spent:0,play:0,perfect:0,flawless:0,explored:0,exports:0,sold:0,ch:{},practice:{}},
 set:{fx:true,glow:true,anim:true,font:13,music:true,vol:35,track:'mp3',theme:'padrao'}});

let s=def(),hist=[],hi=0,sel='apt';

/* valida e normaliza qualquer save (localStorage ou importado) */
function sanitize(o){const d=def();if(!o||typeof o!=='object')return d;
 const n=(v,dv=0,mx=1e12)=>Number.isFinite(+v)?clamp(+v,0,mx):dv;
 const arr=(v,max=400)=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.length<60).slice(0,max):[];
 const r=d;
 r.xp=Math.floor(n(o.xp));r.cash=Math.floor(n(o.cash,250));r.rep=Math.floor(n(o.rep));
 r.done=arr(o.done);r.visited=arr(o.visited);r.inv=arr(o.inv);r.found=arr(o.found);r.skills=arr(o.skills);r.ach=arr(o.ach);
 if(!r.visited.includes('apt'))r.visited.push('apt');
 r.loc=PLACES.some(p=>p.id===o.loc)?o.loc:'apt';
 r.flags={};if(o.flags&&typeof o.flags==='object')Object.keys(o.flags).slice(0,500).forEach(k=>{if(o.flags[k]&&k.length<60)r.flags[k]=1});
 r.name=typeof o.name==='string'&&/^[\w-]{1,16}$/.test(o.name)?o.name:'guest';
 r.pid=typeof o.pid==='string'&&o.pid.length<30?o.pid:rid();
 const Pc=o.pc&&typeof o.pc==='object'?o.pc:{};
 ['cpu','ram','ssd','net'].forEach(k=>{r.pc[k]=ITEM[Pc[k]]&&ITEM[Pc[k]].slot===k?Pc[k]:d.pc[k];r.pc.up[k]=clamp(Math.floor(+((Pc.up||{})[k])||0),0,3)});
 r.pc.name=typeof Pc.name==='string'?Pc.name.slice(0,40):d.pc.name;
 r.bseq=Math.floor(n(o.bseq));const cp=o.cpos;r.cpos=cp&&Number.isFinite(+cp.x)&&Number.isFinite(+cp.y)?{x:clamp(Math.round(+cp.x),0,39),y:clamp(Math.round(+cp.y),0,29)}:null;
 r.board=(Array.isArray(o.board)?o.board:[]).filter(c=>c&&typeof c.id==='string'&&TYPES.includes(c.type)&&[1,2,3].includes(c.diff)&&Number.isFinite(c.seed)&&Number.isFinite(c.pay)&&Number.isFinite(c.xp)).slice(0,8)
  .map(c=>({id:c.id.slice(0,20),type:c.type,diff:c.diff,seed:Math.floor(c.seed),client:String(c.client||'').slice(0,50),title:String(c.title||'').slice(0,60),pay:Math.floor(c.pay),xp:Math.floor(c.xp),rep:Math.floor(+c.rep||0)}));
 r.docs={};if(o.docs&&typeof o.docs==='object')Object.keys(o.docs).filter(k=>typeof o.docs[k]==='string'&&k.length<50).slice(-40).forEach(k=>r.docs[k]=o.docs[k].slice(0,4000));
 r.ntf=(Array.isArray(o.ntf)?o.ntf:[]).filter(x=>x&&typeof x.m==='string').slice(0,40).map(x=>({t:+x.t||0,m:x.m.slice(0,200)}));
 const St=o.stats&&typeof o.stats==='object'?o.stats:{};
 Object.keys(d.stats).forEach(k=>{if(typeof d.stats[k]==='number')r.stats[k]=Math.floor(n(St[k]))});
 ['ch','practice'].forEach(k=>{r.stats[k]={};if(St[k]&&typeof St[k]==='object')TYPES.forEach(t=>{if(+St[k][t]>0)r.stats[k][t]=Math.floor(n(St[k][t],0,1e6))})});
 const S=o.set&&typeof o.set==='object'?o.set:{};
 r.set={fx:S.fx!==false,glow:S.glow!==false,anim:S.anim!==false,font:clamp(Math.round(+S.font)||13,11,17),music:S.music!==false,vol:S.vol===undefined?35:clamp(Math.round(+S.vol)||0,0,100),track:S.track==='gen'?'gen':'mp3',theme:S.theme==='halloween'?'halloween':'padrao'};
 if(o.ui&&typeof o.ui==='object'){const u=o.ui,okIds=x=>Array.isArray(x)?x.filter(i=>typeof i==='string'&&i.length<12):[];
  r.ui={open:okIds(u.open),order:okIds(u.order),min:okIds(u.min),max:okIds(u.max),pos:{}};
  if(u.pos&&typeof u.pos==='object')Object.keys(u.pos).slice(0,30).forEach(k=>{const p=u.pos[k];if(p&&[p.x,p.y,p.w,p.h].every(Number.isFinite))r.ui.pos[k]={x:p.x,y:p.y,w:p.w,h:p.h}})}
 r.ver=VER;return r}

sel=s.loc;

function persist(){if(!KEY)return false;try{localStorage.setItem(KEY,JSON.stringify(s));const d=new Date(),e=$('#saved');if(e)e.textContent='SALVO '+d.toLocaleTimeString('pt-BR');return true}catch(e){const x=$('#saved');if(x)x.textContent='⚠ SEM ARMAZENAMENTO — exporte o progresso';return false}}
function save(){persist();render()}

function exportData(){s.stats.exports++;persist();return JSON.stringify({game:'SANTOS HACKER SIMULATOR',ver:VER,build:BUILD,exported:new Date().toISOString(),data:s})}
const toCode=txt=>btoa(unescape(encodeURIComponent(txt)));
function importData(txt){let o;txt=String(txt||'').trim();
 if(!txt)return[false,'Nada para importar.'];if(txt.length>3e6)return[false,'Arquivo grande demais.'];
 try{if(txt[0]!=='{')txt=decodeURIComponent(escape(atob(txt.replace(/\s+/g,''))));o=JSON.parse(txt)}catch(e){return[false,'Arquivo ou código inválido.']}
 const d=o&&o.data&&typeof o.data==='object'?o.data:o;
 if(!d||typeof d!=='object'||(typeof d.xp==='undefined'&&!Array.isArray(d.done)))return[false,'Não parece um save do SANTOS HACKER SIMULATOR.'];
 try{localStorage.setItem(bkey(),JSON.stringify(s))}catch(e){}
 s=sanitize(d);sel=s.loc;return[true,'Progresso importado (backup do save anterior guardado).']}
function undoImport(){try{const b=localStorage.getItem(bkey());if(!b)return false;s=sanitize(JSON.parse(b));sel=s.loc;return true}catch(e){return false}}

/* autosave: a cada 15s + ao sair/ocultar a aba; também conta tempo de jogo */
let lastTick=Date.now();
setInterval(()=>{const n=Date.now();if(!document.hidden)s.stats.play+=Math.min(30,Math.round((n-lastTick)/1000));lastTick=n;persist()},15000);
addEventListener('pagehide',persist);
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.hidden)persist()});
