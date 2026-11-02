'use strict';
/* ============================================================
   TERMINAL — todos os comandos da 0.2.1 foram preservados.
   Assinatura: CMD.nome(ARGUMENTO_EM_MAIUSCULAS, argumento_original)
   ============================================================ */
function travel(arg){const a=norm(arg);if(!a){out('Uso: connect <local>. Exemplo: connect lab','warn');return}
 const p=PLACES.find(x=>x.id===a||x.kw.includes(a)||norm(x.name)===a)||(a.length>=3&&PLACES.find(x=>norm(x.name).includes(a)));
 if(!p){out('Local não encontrado. Exemplo: connect lab','warn');return}
 if(level()<p.lvl){out('Acesso bloqueado. Requer nível '+p.lvl,'warn');return}
 if(s.rep<(p.rep||0)){out('Acesso bloqueado. Requer reputação '+p.rep+' (você tem '+s.rep+').','warn');return}
 if(s.loc===p.id){out('Você já está em: '+p.name,'dim');return}
 s.loc=p.id;sel=p.id;if(!s.visited.includes(p.id))s.visited.push(p.id);
 out('Conectado ao ambiente fictício: '+p.name,'ok');out(p.intro,'dim');flag('visit_'+p.id)}
function readFile(placeId,name){const fs=P(placeId).files,n=norm(name);if(!(n in fs))return null;flag(n.replace(/\.\w+$/,''));return fs[n]}
const CMD={
help(){out('COMANDOS: help, scan, connect lab, logs, decrypt ORION, missions, status, clear');out('Use connect corp após alcançar nível 2.');
 out('NOVOS (v0.2):','ok');
 out('  mundo:    map, connect <local>, where, explore, ls, cat <arquivo>');
 out('  missões:  missions, audit, sniff, decode <texto>, scan deep, unlock <senha>');
 out('  economia: shop, buy <id>, inventory (inv)');
 out('  sistema:  status, save, reset, whoami, open <app>, apps');
 out('NOVOS (v0.3):','ok');
 out('  vida hacker: contracts, accept <n>, practice <tipo>, talk <npc>, sell all');
 out('  equipamento: pc, upgrade <cpu|ram|ssd|net>, shop, buy <id>');
 out('  progresso:   skills, learn <id>, achievements, rank, stats, note <texto>');
 out('  sistema:     browse <site>, open <app>, settings, export');
 out('Locais: apt, lab, corp, data, market, tech, under','dim')},
clear(){$('#term').innerHTML=''},
status(){out(`Nível ${level()} | ${s.xp} XP | $${s.cash} créditos | ${s.done.length}/${MIS.length} missões`,'ok');
 out(`Rank: ${rank()} | Local: ${P(s.loc).name} | Ferramentas: ${TOOLS.filter(t=>has(t.id)).length}/${TOOLS.length}`,'dim');
 out(`Reputação: ${s.rep} (${repTitle()}) | Contratos: ${s.stats.contracts} | Pontos de habilidade: ${spAvail()}`,'dim')},
missions(){MIS.forEach(m=>{const d=isDone(m.id),pre=(m.pre||[]).every(isDone),lk=level()<m.lvl||!pre;
  out((d?'[OK] ':lk?'[##] ':'[  ] ')+m.name+' — '+m.desc+(lk&&!d?(level()<m.lvl?' (requer nível '+m.lvl+')':' (conclua a missão anterior)'):''),d?'ok':lk?'dim':'');
  if(!d&&!lk)m.obj.forEach(o=>out('      '+(s.flags[o[0]]?'☑ ':'☐ ')+o[1],s.flags[o[0]]?'ok':'dim'));
  if(!d)out(`      Recompensa: ${m.xp} XP • $${m.cash}${m.rep?' • '+m.rep+' REP':''}`,'dim')})},
scan(arg){if(arg==='DEEP'){if(!tool('deepscan'))return;out('Varredura PROFUNDA em '+P(s.loc).name+'...');
  if(s.loc==='data'){out('Setor 7: COFRE-ONIX localizado [SIMULADO]','ok');out('Use: unlock <senha>','dim');flag('deepscan')}else out('Nenhum alvo oculto aqui. Tente no Data Center Ônix.','dim');return}
 out('Varredura LOCAL do '+(s.loc==='lab'?'laboratório':'ambiente')+' fictício...');P(s.loc).scan.forEach(l=>out(l));out('Nenhum dispositivo real foi consultado.','dim');flag('scan')},
connect(arg,raw){travel(raw)},
logs(){if(level()<2){out('Dica: conclua a primeira missão para alcançar nível 2.','warn');return}out('LOG 01: sessão trainee iniciada.');out('LOG 02: palavra-chave encontrada: ORION.','ok');flag('logs')},
decrypt(arg){if(arg!=='ORION'){out('Código incorreto. Dica: examine os logs fictícios.','warn')}else{out('Enigma resolvido! Chave de treinamento validada.','ok');flag('decrypt')}},
map(){openWin('map');out('MAPA DO MUNDO FICTÍCIO (aberto na janela Mapa)','ok');PLACES.forEach(p=>{const lk=!placeOk(p);out((s.loc===p.id?'▶ ':lk?'🔒 ':'▣ ')+p.id.padEnd(7)+p.name+' — '+p.desc+(lk?' (nível '+p.lvl+(p.rep?', rep '+p.rep:'')+')':'')+(s.loc===p.id?'  [VOCÊ ESTÁ AQUI]':''),s.loc===p.id?'ok':lk?'dim':'')})},
where(){const p=P(s.loc),f=p.ex.filter((_,i)=>s.found.includes(p.id+i)).length;out(p.name,'ok');out(p.intro,'dim');out(`Exploração: ${f}/${p.ex.length}`,'dim');
 const n=NPCS.filter(x=>x.p===p.id);if(n.length)out('Pessoas aqui: '+n.map(x=>x.id).join(', ')+' (talk <id>)','dim')},
ls(arg){if(arg==='HOME'||arg==='~'){out(Object.keys(s.docs).join('   ')||'(vazio)');return}out(Object.keys(P(s.loc).files).join('   '))},
cat(arg,raw){const n=norm(raw);if(!n){out('Uso: cat <arquivo>. Veja ls.','warn');return}
 const t=readFile(s.loc,n);if(t!==null){out(t);return}
 const dk=Object.keys(s.docs).find(k=>norm(k)===n);if(dk){out(s.docs[dk]);return}
 out('Arquivo não encontrado: '+n,'warn')},
explore(){const p=P(s.loc),i=p.ex.findIndex((_,k)=>!s.found.includes(p.id+k));if(i<0){out('Você já explorou tudo em '+p.name+'.','dim');return}
 const e=p.ex[i],xp=Math.round(e[1]*xpMul('x'));s.found.push(p.id+i);s.stats.explored++;out(e[0]);out(`Descoberta: +${xp} XP | +$${e[2]}`,'warn');addCash(e[2]);addXP(xp);
 if(e[3]){s.inv.push(e[3]);out('Item encontrado: '+ITEM[e[3]].name+' (veja inventory; venda com sell)','ok')}},
audit(){if(!at('corp'))return;out('Auditando a Aurora (simulado)...');out('FIREWALL: regras fracas [SIMULADO]');out('TRÁFEGO: pacotes anômalos na porta 4444 [SIMULADO]','warn');out('Sugestão: capture com sniff.','dim');flag('audit')},
sniff(){if(!tool('sniffer'))return;if(!at('corp'))return;out('Capturando pacotes na Aurora...');out('PKT 0x1A: HTTP GET /index [normal]');out('PKT 0x4F: payload QVVST1JBLTc= [suspeito]','warn');out('Dica: decodifique com decode QVVST1JBLTc=','dim');flag('sniff')},
decode(arg,raw){if(!tool('decoder'))return;if(!raw){out('Uso: decode <texto base64>','warn');return}
 let r;try{r=atob(raw.trim());if(!/^[\x20-\x7e]+$/.test(r))throw 0}catch(e){out('Texto inválido para Base64.','warn');return}
 out('Decodificado: '+r,'ok');if(r==='AURORA-7'&&s.flags.sniff){out('Parece uma senha de cofre. Guarde-a.','dim');flag('decode')}},
unlock(arg){if(!at('data'))return;if(!s.flags.deepscan){out('Nenhum cofre localizado. Use scan deep.','warn');return}if(!arg){out('Uso: unlock <senha>','warn');return}
 if(arg!=='AURORA-7'){out('Senha incorreta. Cofre permanece selado.','warn');return}out('COFRE-ONIX ABERTO! Arquivos fictícios revelados.','ok');flag('unlock')},
shop(){out('LOJA — Mercado Virtual / Centro Tecnológico'+(canShop()?'':' (conecte-se: connect market para comprar)'),'ok');
 const L=(t,x)=>out(`${x} ${t.id.padEnd(10)} $${String(t.price).padEnd(5)} nv${t.lvl}  ${t.name} — ${t.desc}`,x==='[OK]'?'dim':'');
 out('— Ferramentas —','dim');TOOLS.forEach(t=>L(t,has(t.id)?'[OK]':'[  ]'));
 out('— Peças (instalação automática, trade-in de 35% da peça antiga) —','dim');PARTS.filter(t=>t.price).forEach(t=>L(t,s.pc[t.slot]===t.id?'[OK]':ITEM[s.pc[t.slot]].v>=t.v?'[--]':'[  ]'));
 out('— Computadores completos —','dim');PCS.forEach(t=>L(t,has(t.id)?'[OK]':'[  ]'));
 out('— Melhorias (+1 atributo, em ordem I→II→III) —','dim');UPS.forEach(t=>L(t,s.pc.up[t.stat]>=t.tier?'[OK]':'[  ]'))},
buy(arg,raw){if(!raw){out('Uso: buy <id>. Veja shop.','warn');return}const id=norm(raw);if(!ITEM[id]){out('Item não encontrado. Veja shop.','warn');return}buyItem(id)},
inventory(){const tl=s.inv.filter(id=>ITEM[id]&&ITEM[id].kind==='tool'),lt=LOOT.filter(l=>s.inv.includes(l.id));
 if(!tl.length&&!lt.length){out('Mochila vazia. Visite o Mercado Virtual.','dim')}else{out('MOCHILA:','ok');tl.forEach(id=>out('• '+ITEM[id].name+' — '+ITEM[id].desc));lt.forEach(l=>out(`• ${l.name} x${s.inv.filter(x=>x===l.id).length} (vale $${l.v}) — id: ${l.id}`,'dim'))}
 out('Hardware instalado: '+s.pc.name+' (digite pc)','dim')},
save(){persist();out('Progresso salvo.','ok')},
whoami(){out(s.name+' — operador '+rank()+' (nível '+level()+')')},
reset(arg){if(arg!=='CONFIRM'){out('Isto apaga TODO o progresso. Para confirmar digite: reset confirm','warn');return}
 const keep=s.set;s=def();s.set=keep;normUI();sel='apt';fillBoard();endActive();layout();$('#term').innerHTML='';out('Progresso reiniciado.','ok');out('SANTOS HACKER SIMULATOR [build '+BUILD+']','ok')},
/* ---- v0.3 ---- */
talk(arg,raw){const a=norm(raw);if(!a){const n=NPCS.filter(x=>x.p===s.loc);out(n.length?'Pessoas aqui: '+n.map(x=>x.id+' ('+x.n+')').join(', ')+'. Uso: talk <id>':'Não há ninguém para conversar aqui.','dim');return}
 const n=NPCS.find(x=>x.id===a||norm(x.n).includes(a));if(!n){out('Pessoa não encontrada. Use talk para ver quem está aqui.','warn');return}
 if(n.p!==s.loc){out(n.n+' está em: '+P(n.p).name+'. Use connect '+n.p,'warn');return}
 const l=n.d.find(x=>x[0]());out(`${n.n} (${n.r}):`,'ok');out('“'+l[1]+'”');s.stats.talks=(s.stats.talks||0)+1;
 if(!s.flags['gift_'+n.id]){s.flags['gift_'+n.id]=1;const x=Math.round(20*xpMul('x'));out(`Primeira conversa: +${x} XP, +1 REP`,'warn');addRep(1);addXP(x)}flag('talk_'+n.id)},
contracts(){fillBoard();out('QUADRO DE CONTRATOS (accept <n>)','ok');s.board.forEach((c,i)=>{const w=whyNot(c);out(`[${i+1}] ${c.title} — ${c.client} • ${TYPEN[c.type]} • nv${c.diff} • $${c.pay} • ${c.xp} XP`+(w?'  🔒 '+w:''),w?'dim':'')});out('Use accept <n>, ou "practice <tipo>" para treinar: '+TYPES.join(', '),'dim');flag('open_con')},
accept(arg,raw){fillBoard();const n=parseInt(raw,10);if(!n||n<1||n>s.board.length){out('Uso: accept <número>. Veja contracts.','warn');return}startContract(s.board[n-1].id)},
practice(arg,raw){const t=norm(raw);if(!t){out('Uso: practice <tipo>. Tipos: '+TYPES.join(', '),'warn');return}startPractice(t)},
pc(){out('SEU COMPUTADOR: '+s.pc.name,'ok');['cpu','ram','ssd','net'].forEach(k=>{const it=ITEM[s.pc[k]];out(`${STATS[k][0].padEnd(15)} ${it.name} • atributo ${stat(k)} (base ${it.v} +${s.pc.up[k]} melhoria)`,'')});
 const f=fx();out(`Efeitos: tentativas lógica ${f.attempts} • filtro de logs ${f.filter?'SIM':'não'} • sondagens ${f.probes} • análises estáticas ${f.statics} • tempo de reação ${(f.dlife*100).toFixed(0)}% • escudos ${f.shields}`,'dim')},
upgrade(arg){const k=norm(arg),m={cpu:'cpu',ram:'ram',ssd:'ssd',net:'net',rede:'net',nic:'net'}[k];if(!m){out('Uso: upgrade <cpu|ram|ssd|net>','warn');return}
 const t=s.pc.up[m];if(t>=3){out('Melhoria já no máximo (III).','dim');return}buyItem('up_'+m+(t+1))},
sell(arg,raw){sellLoot(raw)},
skills(){out(`HABILIDADES — pontos disponíveis: ${spAvail()} (1 por nível ganho)`,'ok');SKILLS.forEach(k=>out(`${sk(k.id)?'[OK]':'[  ]'} ${k.id.padEnd(11)} ${k.cost}pt nv${k.lvl}  ${k.n} — ${k.d}`,sk(k.id)?'ok':''))},
learn(arg,raw){const k=SKILLS.find(x=>x.id===norm(raw));if(!raw){out('Uso: learn <id>. Veja skills.','warn');return}if(!k){out('Habilidade não encontrada. Veja skills.','warn');return}
 if(sk(k.id)){out('Você já aprendeu '+k.n+'.','dim');return}if(level()<k.lvl){out('Requer nível '+k.lvl+'.','warn');return}if(spAvail()<k.cost){out('Pontos insuficientes (custa '+k.cost+').','warn');return}
 s.skills.push(k.id);out('Habilidade aprendida: '+k.n,'ok');notify('⚡ Habilidade: '+k.n)},
achievements(){out(`CONQUISTAS ${s.ach.length}/${ACH.length}`,'ok');ACH.forEach(a=>out((s.ach.includes(a.id)?'★ ':'☆ ')+a.n+' — '+a.d,s.ach.includes(a.id)?'ok':'dim'))},
rank(){const m=myPosition(),L=currentBoard();out('RANKING — você está em #'+m.pos+' de '+m.total+' • '+m.me.t.label+' • '+fmtN(m.me.sc)+' pts','ok');
 L.slice(0,10).forEach((r,i)=>out(`${String(i+1).padStart(2)}. ${r.n.padEnd(14)} ${r.t.lg.n.padEnd(9)} ${fmtN(r.sc).padStart(9)} pts${r.me?'  ← você':''}`,r.me?'ok':''))},
stats(){const t=s.stats,m=Math.floor(t.play/60);out('ESTATÍSTICAS','ok');out(`Contratos: ${t.contracts} concluídos • ${t.failed} falhos • Ganhos: $${t.earned} • Gastos: $${t.spent}`);out(`Por tipo: `+TYPES.map(k=>k+' '+(t.ch[k]||0)).join(' • '),'dim');out(`Tempo de jogo: ${m} min • Explorações: ${t.explored} • Notas máximas: ${t.perfect} • Pontuação: ${score()}`,'dim')},
note(arg,raw){if(!raw){out(s.docs['notas.txt']||'(sem notas) Uso: note <texto>','dim');return}s.docs['notas.txt']=((s.docs['notas.txt']||'')+raw+'\n').slice(-1500);out('Nota salva em ~/notas.txt','ok')},
browse(arg,raw){openWin('web');webGo(raw||'busca.hk');out('Abrindo o navegador fictício...','dim')},
settings(){openWin('set');out('Abrindo configurações...','dim')},
export(){openWin('set');out('Use "Exportar progresso" em Configurações (app Config).','dim')}
};
CMD.open=(arg,raw)=>{const a=norm(raw);if(!a){out('Apps: '+APPS.filter(x=>!x[4]).map(x=>x[0]).join(', ')+'. Uso: open <app>','warn');return}const ap=APPS.find(x=>x[0]===a||norm(x[1])===a||(APPAL[a]===x[0]));if(!ap){out('App não encontrado. Apps: '+APPS.filter(x=>!x[4]).map(x=>x[0]).join(', '),'warn');return}openWin(ap[0]);out('Abrindo '+ap[1]+'...','dim')};
CMD.apps=()=>out('Apps: '+APPS.filter(x=>!x[4]).map(x=>x[0]+' ('+x[1]+')').join(', ')+'. Use: open <app>','ok');
CMD.inv=CMD.inventory;CMD.goto=CMD.connect;CMD.travel=CMD.connect;CMD.dir=CMD.ls;CMD.cls=CMD.clear;CMD.contratos=CMD.contracts;CMD.ach=CMD.achievements;CMD.ranking=CMD.rank;CMD.skill=CMD.skills;CMD.config=CMD.settings;CMD.pcinfo=CMD.pc;

function run(raw){const a=raw.trim().split(/\s+/),c=(a.shift()||'').toLowerCase(),r=a.join(' '),arg=r.toUpperCase();if(!c)return;
 hist.push(raw);hi=hist.length;s.stats.cmds++;out(s.name+'@'+s.loc+':~$ '+raw,'ok');
 if(CMD[c])CMD[c](arg,r);else out('Comando desconhecido. Digite help.','warn');
 check();checkAch();save()}
/* executa um comando a partir de botões de apps e mostra o resultado (toast ou janela de diálogo) */
function runUI(c,modal){cap=[];run(c);const L=cap.slice(1);cap=null;if(!L.length)return;
 if(modal||L.length>2)dlg(c.split(' ')[0].toUpperCase(),L);else toast(L.map(x=>x[0]).join(' · '))}
