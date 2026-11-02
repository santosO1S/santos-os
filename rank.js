'use strict';
/* ============================================================
   SISTEMA DE RANK: ligas e divisões a partir da pontuação.
   Ranking = rivais fictícios + operadores deste aparelho + você.
   ============================================================ */
const LEAGUES=[
 {n:'Bronze',min:0,c:'#c08a5a',i:'◆',div:true},
 {n:'Prata',min:1500,c:'#c9d4dc',i:'◆',div:true},
 {n:'Ouro',min:5000,c:'#ffd45c',i:'◆',div:true},
 {n:'Platina',min:12000,c:'#7fe3d0',i:'◆',div:true},
 {n:'Diamante',min:25000,c:'#7fdcff',i:'◆',div:true},
 {n:'Mestre',min:45000,c:'#c18bff',i:'◆',div:true},
 {n:'Lenda',min:80000,c:'#5cff8f',i:'★',div:false}];
const DIVS=['III','II','I'];

/* liga, divisão e progresso até o próximo degrau */
function tierOf(sc){let li=0;for(let i=0;i<LEAGUES.length;i++)if(sc>=LEAGUES[i].min)li=i;
 const L=LEAGUES[li],nx=LEAGUES[li+1],hi=nx?nx.min:null,lo=L.min;
 let dv=null,idx=0;
 if(L.div){const span=(hi-lo)/3;idx=Math.min(2,Math.floor((sc-lo)/span));dv=DIVS[idx]}
 const pct=hi?Math.min(100,Math.max(0,Math.round((sc-lo)/(hi-lo)*100))):100;
 /* próximo degrau: próxima divisão dentro da liga, ou próxima liga */
 let next=null;if(L.div){const span=(hi-lo)/3;next=idx<2?Math.round(lo+span*(idx+1)):hi}else next=null;
 return{li,lg:L,dv,lo,hi,pct,next,toNext:next!=null?Math.max(0,next-sc):0,label:dv?L.n+' '+dv:L.n}}

/* pontuação de qualquer save (mesma fórmula de score()) */
const scoreOf=o=>(o.xp||0)+(o.rep||0)*20+((o.done||[]).length)*50+((o.stats&&o.stats.contracts)||0)*30;
const fmtN=n=>Number(n).toLocaleString('pt-BR');

/* operadores deste aparelho (exceto o atual) */
function localOperators(){const out=[];
 for(const p of PROFILES){if(CUR&&p.id===CUR.id)continue;
  try{const r=localStorage.getItem(p.key);if(!r)continue;const o=sanitize(JSON.parse(r));out.push({n:o.name||p.name,sc:scoreOf(o),local:true})}catch(e){}}
 return out}

/* ranking completo, ordenado */
function rankBoard(){const rows=RIVALS.map(r=>({n:r[0],sc:r[1],bot:true,me:false}));
 localOperators().forEach(x=>rows.push(x));
 if(KEY)rows.push({n:s.name,sc:score(),me:true,local:true});
 rows.forEach(r=>{r.t=tierOf(r.sc)});
 rows.sort((a,b)=>b.sc-a.sc);return rows}


/* ranking usado na tela: online (jogadores reais) ou local (rivais fictícios) */
function currentBoard(){
 if(NET.online()){const L=NET.rows.map(x=>({...x}));
  if(KEY&&!L.some(x=>x.me)){L.push({n:s.name,sc:score(),me:true,local:true,t:tierOf(score())})}
  L.sort((a,b)=>b.sc-a.sc);return L}
 return rankBoard()}
function myPosition(){
 if(NET.online()&&NET.me){const me=NET.rows.find(x=>x.me)||{n:s.name,sc:score(),me:true,local:true,t:tierOf(score())};return{pos:NET.me.pos,total:NET.total,me}}
 const L=currentBoard(),i=L.findIndex(x=>x.me);return{pos:i+1,total:L.length,me:L[i]}}
