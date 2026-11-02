'use strict';
/* ============================================================
   LÓGICA DO JOGO: progressão, missões, loja, PC, contratos, conquistas
   ============================================================ */
const level=()=>1+Math.floor(s.xp/XPL),rank=()=>RANKS[Math.min(level()-1,RANKS.length-1)];
const repTitle=()=>[...REPT].reverse().find(r=>s.rep>=r[0])[1];
const isDone=id=>s.done.includes(id),has=id=>s.inv.includes(id),sk=id=>s.skills.includes(id);
const spAvail=()=>Math.max(0,level()-1)-s.skills.reduce((a,id)=>a+(SKILLS.find(k=>k.id===id)||{cost:0}).cost,0);
const score=()=>s.xp+s.rep*20+s.done.length*50+s.stats.contracts*30;
const stat=k=>(ITEM[s.pc[k]]?ITEM[s.pc[k]].v:1)+(s.pc.up[k]||0);
/* efeitos do hardware/ferramentas/habilidades nos desafios */
function fx(){const cpu=stat('cpu'),ram=stat('ram'),ssd=stat('ssd'),net=stat('net');
 return{attempts:Math.min(10,4+Math.floor(ram/2)+(sk('logician')?2:0)),filter:ssd>=3||has('analyzer')||sk('analyst'),hl:ssd>=6||sk('analyst'),
 probes:Math.floor(net/2)+(sk('auditor')?2:0),statics:Math.floor(cpu/3)+(sk('coder')?2:0),dlife:0.8+0.06*cpu,
 shields:(has('fwkit')?1:0)+(sk('hardener')?2:0),compare:ram>=4||sk('forensics'),extraClue:has('forensic')||sk('forensics')}}
const xpMul=k=>1+(k==='m'&&has('overclock')?.1:0)+(sk('mentor')?.1:0);

/* ---------- saída do terminal (com captura para a interface) ---------- */
let cap=null;
const out=(t,c='')=>{const T=$('#term');if(T){const d=document.createElement('div');d.className='line '+c;d.textContent=t;T.append(d);while(T.childElementCount>400)T.firstChild.remove();T.scrollTop=99999}if(cap)cap.push([t,c])};

/* ---------- notificações ---------- */
let unread=0;
function notify(m,t=true){s.ntf.unshift({t:Date.now(),m});if(s.ntf.length>40)s.ntf.length=40;unread++;if(t)toast(m);trayRender()}
function journal(m){const k='diario.txt',old=s.docs[k]||'DIÁRIO DO OPERADOR\n',L=(old+'• '+m+'\n').split('\n');s.docs[k]=L.slice(-40).join('\n');}
function addDoc(name,text){s.docs[name]=String(text).slice(0,4000);const k=Object.keys(s.docs).filter(x=>x!=='diario.txt'&&x!=='notas.txt');while(k.length>25){delete s.docs[k.shift()]}}

/* ---------- XP / dinheiro / reputação ---------- */
function addXP(n){const b=level();s.xp+=n;const a=level();if(a>b){for(let l=b+1;l<=a;l++){out(`▲ NÍVEL ${l} ALCANÇADO — ${RANKS[Math.min(l-1,RANKS.length-1)]}`,'ok');out('+1 ponto de habilidade (app Habilidades)','dim')}notify('▲ Nível '+a+' — '+rank()+' (+1 ponto de habilidade)');journal('Nível '+a+' alcançado.')}}
function addRep(n){if(n<=0)return 0;n=Math.max(1,Math.round(n*(sk('ghost')?1.15:1)));s.rep+=n;return n}
function addCash(n){s.cash+=n;if(n>0)s.stats.earned+=n}

/* ---------- missões ---------- */
const avail=m=>!isDone(m.id)&&level()>=m.lvl&&(m.pre||[]).every(isDone);
function flag(f){if(s.flags[f])return;s.flags[f]=1;MIS.forEach(m=>{if(!avail(m))return;const o=m.obj.find(x=>x[0]===f);if(o)out(`✔ Objetivo: ${o[1]} (${m.name})`,'dim')})}
function finish(m){if(isDone(m.id))return;s.done.push(m.id);const xp=Math.round(m.xp*xpMul('m'));
 out('MISSÃO CONCLUÍDA: '+m.name,'ok');notify('✓ Missão concluída: '+m.name);
 out('Recompensa: +'+xp+' XP | +$'+m.cash+(m.rep?' | +'+m.rep+' REP':''),'warn');if(has('overclock'))out('(Overclock: +10% XP)','dim');if(sk('mentor'))out('(Aprendizado Rápido: +10% XP)','dim');
 addCash(m.cash);if(m.rep)addRep(m.rep);addXP(xp);journal('Missão concluída: '+m.name);
 if(m.id==='c9'){out('★ Operação Eclipse encerrada. Obrigado por jogar, operador.','ok')}}
function syncFlags(){[1,3,5,10].forEach(n=>{if(s.stats.contracts>=n)flag('contracts'+n)})}
function check(){syncFlags();let ch=true;while(ch){ch=false;for(const m of MIS){if(avail(m)&&m.obj.every(o=>s.flags[o[0]])){finish(m);ch=true}}}}
function checkAch(){let ch=true;while(ch){ch=false;for(const a of ACH){if(!s.ach.includes(a.id)&&a.t()){s.ach.push(a.id);notify('★ Conquista: '+a.n+' (+50 XP)');out('★ CONQUISTA: '+a.n+' — +50 XP','ok');addXP(50);ch=true}}}}
const after=()=>{check();checkAch();save()};

/* ---------- ferramentas necessárias / local ---------- */
const tool=(id,msg)=>{if(has(id))return true;const t=ITEM[id];out(`Ferramenta necessária: ${t.name}. ${msg||'Compre no Mercado Virtual (connect market).'}`,'warn');return false};
const at=id=>{if(s.loc===id)return true;out('Disponível apenas em: '+P(id).name+'. Use connect '+id,'warn');return false};
const canShop=()=>s.loc==='market'||s.loc==='tech';
const placeOk=p=>level()>=p.lvl&&s.rep>=(p.rep||0);

/* ---------- loja / PC ---------- */
function buyItem(id){const t=ITEM[id];if(!t||t.kind==='loot'||!t.price){out('Item não encontrado. Veja shop.','warn');return false}
 if(!canShop()){out('Compras apenas no Mercado Virtual ou no Centro Tecnológico. Use connect market','warn');return false}
 if(t.kind==='part'){const cur=ITEM[s.pc[t.slot]];if(cur.id===id){out('Você já tem '+t.name+' instalado.','dim');return false}if(cur.v>=t.v){out('Você já tem uma peça igual ou melhor instalada ('+cur.name+').','dim');return false}}
 else if(t.kind==='up'){const cur=s.pc.up[t.stat];if(cur>=t.tier){out('Você já possui '+t.name+'.','dim');return false}if(cur<t.tier-1){out('Compre primeiro o nível anterior desta melhoria.','warn');return false}}
 else if(has(id)){out('Você já possui '+t.name+'.','dim');return false}
 if(level()<t.lvl){out('Requer nível '+t.lvl+'.','warn');return false}
 if(s.cash<t.price){out(`Créditos insuficientes (precisa de $${t.price}).`,'warn');return false}
 s.cash-=t.price;s.stats.spent+=t.price;
 if(t.kind==='part'){const cur=ITEM[s.pc[t.slot]],rf=Math.round(cur.price*.35);s.pc[t.slot]=id;if(rf){s.cash+=rf}if(!has(id))s.inv.push(id);out(`Comprado e instalado: ${t.name} (-$${t.price})`,'ok');if(rf)out(`Trade-in da peça antiga: +$${rf}`,'dim');flag('upgrade')}
 else if(t.kind==='up'){s.pc.up[t.stat]=t.tier;s.inv.push(id);out(`Melhoria instalada: ${t.name} (-$${t.price})`,'ok');flag('upgrade')}
 else if(t.kind==='pc'){Object.keys(t.parts).forEach(k=>{if(ITEM[t.parts[k]].v>ITEM[s.pc[k]].v)s.pc[k]=t.parts[k]});s.pc.name=t.name;s.inv.push(id);out(`Computador adquirido: ${t.name} (-$${t.price}). Peças melhores foram instaladas.`,'ok');flag('upgrade')}
 else{s.inv.push(id);out(`Comprado: ${t.name} (-$${t.price})`,'ok')}
 flag('buy');return true}
function sellLoot(arg){if(s.loc!=='market'){out('Venda de itens apenas no Mercado Virtual. Use connect market','warn');return}
 const mul=1+(sk('negotiator')?.1:0);let tot=0,n=0;const a=norm(arg);
 const ids=LOOT.map(l=>l.id).filter(id=>a==='all'||a==='tudo'||a===id);
 if(!a){out('Uso: sell <id> ou sell all. Veja inventory.','warn');return}
 ids.forEach(id=>{let c;while((c=s.inv.indexOf(id))>=0){s.inv.splice(c,1);tot+=Math.round(ITEM[id].v*mul);n++;if(a!=='all'&&a!=='tudo')break}});
 if(!n){out('Nada para vender.','dim');return}
 addCash(tot);s.stats.sold+=n;out(`Vendido(s) ${n} item(ns): +$${tot}`,'ok')}

/* ---------- contratos ---------- */
const hashStr=t=>{let h=7;for(const c of t)h=(h*31+c.charCodeAt(0))>>>0;return h};
function genContract(){const q=rng(++s.bseq*7919+hashStr(s.pid)),lv=level(),maxd=lv>=4?3:lv>=2?2:1;
 const x=q(),diff=maxd===1?1:maxd===2?(x<.6?1:2):(x<.3?1:x<.7?2:3),type=rPick(q,TYPES);
 return{id:'k'+s.bseq,type,diff,seed:Math.floor(q()*1e9),client:rPick(q,CLIENTS[type]),title:rPick(q,CTITLE[type]),pay:Math.round(DREW[diff].cash*TMUL[type]/10)*10,xp:DREW[diff].xp,rep:DREW[diff].rep}}
function fillBoard(){while(s.board.length<5)s.board.push(genContract())}
function refreshBoard(){s.board=[];fillBoard()}
const need=c=>[0,0,3,5][c.diff],minLvl=c=>[0,1,2,4][c.diff];
function whyNot(c){if(level()<minLvl(c))return 'Requer nível '+minLvl(c);const st=TYPESTAT[c.type];if(need(c)&&stat(st)<need(c))return `Requer ${STATS[st][0]} ${need(c)}+ (você tem ${stat(st)})`;return ''}

/* ---------- desafios: início e fim ---------- */
function startContract(id){const c=s.board.find(x=>x.id===id);if(!c){out('Contrato não encontrado. Digite contracts.','warn');return false}
 const w=whyNot(c);if(w){out('Não é possível aceitar: '+w,'warn');return false}
 out(`Contrato aceito: ${c.title} (${c.client})`,'ok');launch({kind:'contract',type:c.type,diff:c.diff,seed:c.seed,title:c.title,client:c.client,c});return true}
function startPractice(type){if(!TYPES.includes(type)){out('Tipos: '+TYPES.join(', '),'warn');return false}
 const d=level()>=4?2:1,seed=Math.floor(Math.random()*1e9);out('Treino iniciado: '+TYPEN[type],'ok');
 launch({kind:'practice',type,diff:d,seed,title:'Treino — '+TYPEN[type],client:'Treinamento (sem pagamento)'});return true}
function finishChallenge(sp,sc,info={}){const ok=sc>=0.5,r={ok,score:sc,cash:0,xp:0,rep:0,cap:false};
 if(sp.kind==='contract'){const c=sp.c,st=stat(TYPESTAT[sp.type]),perf=1+Math.min(.4,.04*Math.max(0,st-sp.diff*2)),mc=1+(has('vpn')?.1:0)+(sk('negotiator')?.1:0);
  r.cash=ok?Math.round(c.pay*(.5+.5*sc)*perf*mc):0;r.xp=Math.round(c.xp*(ok?.6+.4*sc:.25)*xpMul('m'));r.rep=ok?addRep(c.rep):0;
  addCash(r.cash);addXP(r.xp);s.board=s.board.filter(x=>x.id!==c.id);fillBoard();
  if(ok){s.stats.contracts++;s.stats.ch[sp.type]=(s.stats.ch[sp.type]||0)+1;flag('contract_done');flag('ch_'+sp.type);if(sp.diff===3)flag('ch_'+sp.type+'3');if(sc>=.999)s.stats.perfect++;if(info.flawless)s.stats.flawless++;
   addDoc('relatorio_'+String(s.stats.contracts).padStart(3,'0')+'.txt',`RELATÓRIO DE CONTRATO #${s.stats.contracts}\nCliente: ${c.client}\nServiço: ${c.title} (${TYPEN[sp.type]}, nível ${sp.diff})\nNota: ${Math.round(sc*100)}%\nPagamento: $${r.cash} • XP ${r.xp} • REP +${r.rep}\n${info.note||''}`);
   journal('Contrato concluído: '+c.title+' ('+Math.round(sc*100)+'%)');out(`CONTRATO CONCLUÍDO: ${c.title} — nota ${Math.round(sc*100)}%`,'ok');out(`Recompensa: +$${r.cash} | +${r.xp} XP | +${r.rep} REP`,'warn');notify('✓ Contrato concluído: +$'+r.cash)}
  else{s.stats.failed++;out('CONTRATO FALHOU: '+c.title+'. O cliente contratou outra pessoa. +'+r.xp+' XP de consolação.','bad');notify('✗ Contrato falhou: '+c.title)}}
 else{const pr=s.stats.practice[sp.type]||0;if(ok&&pr<5){r.xp=Math.round(30*sp.diff*xpMul('x'));addXP(r.xp);s.stats.practice[sp.type]=pr+1;out(`Treino concluído (+${r.xp} XP, ${pr+1}/5 com XP).`,'ok')}else{r.cap=ok;out(ok?'Treino concluído. Você já dominou este treino (sem XP extra).':'Treino falhou. Tente de novo.',ok?'dim':'warn')}}
 after();return r}

/* ---------- rng utilitário (usado por contratos e desafios) ---------- */
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rI=(q,a,b)=>a+Math.floor(q()*(b-a+1)),rPick=(q,arr)=>arr[Math.floor(q()*arr.length)];
const shuf=(q,arr)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(q()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
