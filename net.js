'use strict';
/* ============================================================
   REDE — ranking online.
   Hospedado (https): envia a pontuação e lê o ranking real via
   /api/leaderboard (função do Netlify).
   Aberto direto do arquivo: modo local, com rivais fictícios.
   ============================================================ */
const NET={
 endpoint:'/api/leaderboard',
 mode:'local',   /* vira 'online' só se o servidor do ranking responder de verdade */
 /* testa se a função do Netlify existe; sem ela, o jogo continua em modo local */
 probe(){if(location.protocol!=='https:'||location.hostname==='localhost'||typeof fetch!=='function')return Promise.resolve();
  return fetch(this.endpoint+'?pid=probe',{cache:'no-store'}).then(r=>{const ct=(r.headers&&r.headers.get&&r.headers.get('content-type'))||'';if(r.ok&&ct.includes('json'))this.mode='online'}).catch(()=>{}).then(()=>{const a=$('#auth');if(a&&a.classList.contains('on')&&typeof renderAuth==='function')renderAuth()})},
 rows:null,me:null,total:0,updated:0,status:'',
 async submit(){if(this.mode!=='online'||!KEY||!CUR||CUR.consent!==true)return;
  try{const r=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pid:s.pid,name:s.name,score:score(),lv:level()})});
   if(!r.ok)this.status=r.status===429?'Aguarde alguns segundos para atualizar.':'Não foi possível enviar sua pontuação.';else this.status=''}
  catch(e){this.status='Sem conexão com o ranking online.'}},
 async fetchBoard(){if(this.mode!=='online'||!KEY)return null;
  try{const r=await fetch(this.endpoint+'?pid='+encodeURIComponent(s.pid),{cache:'no-store'});if(!r.ok)throw 0;
   const j=await r.json();this.rows=(j.rows||[]).map(x=>({n:String(x.n),sc:+x.sc||0,me:!!x.me,local:false,t:tierOf(+x.sc||0)}));
   this.me=j.me||null;this.total=j.total||this.rows.length;this.updated=Date.now();this.status='';return this.rows}
  catch(e){this.status='Sem conexão com o ranking online. Mostrando ranking local.';return null}},
 online(){return this.mode==='online'&&this.rows!==null}
};
/* atualiza o ranking enquanto a janela estiver aberta */
setInterval(()=>{const w=$('#w-rank');if(w&&w.classList.contains('show')&&NET.mode==='online'){NET.submit().then(()=>NET.fetchBoard()).then(()=>render())}},30000);
