'use strict';
/* ============================================================
   APPS DA ÁREA DE TRABALHO
   RENDER[id]() devolve o HTML do app (só renderiza janelas visíveis).
   UIFN[nome](arg) = ações dos botões (data-fn="nome:arg").
   ============================================================ */
const RENDER={},UIFN={},FORMS={};
const TAB={shop:'tool'},FS={d:'root',f:null},WS={h:['busca.hk'],i:0};
const fmt=n=>'$'+n.toLocaleString('pt-BR');
const tabs=(app,list)=>`<div class="tabs">${list.map(([k,l])=>`<button data-fn="tab:${app}.${k}" class="${(TAB[app]||list[0][0])===k?'on':''}">${l}</button>`).join('')}</div>`;
const exploredN=p=>p.ex.filter((_,i)=>s.found.includes(p.id+i)).length;

/* ---------- MAPA ---------- */
function mapSvg(){let h='';for(let x=0;x<=340;x+=34)h+=`<line class="gridl" x1="${x}" y1="0" x2="${x}" y2="270"/>`;for(let y=0;y<=270;y+=30)h+=`<line class="gridl" x1="0" y1="${y}" x2="340" y2="${y}"/>`;
 ROADS.forEach(([a,b])=>{const A=P(a),B=P(b);h+=`<line class="road" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`});
 PLACES.forEach(p=>{const lk=!placeOk(p);h+=`<g class="node${lk?' lock':''}${sel===p.id?' sel':''}" data-id="${p.id}" data-fn="sel:${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}${lk?' (bloqueado)':''}">`+(s.loc===p.id?`<circle class="me" cx="${p.x}" cy="${p.y}" r="26"/>`:'')+`<circle class="c" cx="${p.x}" cy="${p.y}" r="24"/><text x="${p.x}" y="${p.y+4}">${lk?'🔒':s.loc===p.id?'◉':'▣'}</text><text class="lbl" x="${p.x}" y="${p.y+40}">${p.short}</text></g>`});
 return h}
RENDER.map=()=>{const p=P(sel),lk=!placeOk(p),here=s.loc===p.id;
 return `<div class="mapwrap"><svg id="svgmap" viewBox="0 0 340 270" role="img" aria-label="Mapa do mundo">${mapSvg()}</svg></div>
 <div class="info" id="info"><b>${esc(p.name)}</b><p>${esc(p.desc)} • Nível ${p.lvl}+${p.rep?' • Rep '+p.rep+'+':''} • Explorado ${exploredN(p)}/${p.ex.length}</p><p>${esc(p.intro)}</p>
 <button data-fn="go:${p.id}" ${(lk||here)?'disabled':''}>${here?'VOCÊ ESTÁ AQUI':lk?'🔒 REQUER NÍVEL '+p.lvl+(p.rep?' + REP '+p.rep:''):'CONECTAR'}</button></div>
 <div class="map" id="map">${PLACES.map(q=>{const d=!placeOk(q);return `<button class="loc${s.loc===q.id?' here':''}" data-fn="go:${q.id}" ${d?'disabled':''}><b>${d?'🔒 ':'▣ '}${esc(q.name)}</b><small>${esc(q.desc)}</small></button>`}).join('')}</div>`};

/* ---------- LOCAL (atividades, pessoas, arquivos) ---------- */
RENDER.loc=()=>{const p=P(s.loc),np=NPCS.filter(n=>n.p===p.id),ex=exploredN(p);
 return `<h3>${esc(p.name)}</h3><p class="dim">${esc(p.intro)}</p>
 <div class="hd">ATIVIDADES</div><div class="actions"><button data-fn="expl" ${ex>=p.ex.length?'disabled':''}>🔎 EXPLORAR (${ex}/${p.ex.length})</button>${p.acts.map((a,i)=>`<button data-fn="act:${i}">${esc(a[0])}</button>`).join('')}</div>
 <div class="hd">PESSOAS</div>${np.length?np.map(n=>`<div class="card"><div class="row"><div><b>${esc(n.n)}</b><br><small>${esc(n.r)}</small></div><button data-fn="talk:${n.id}">FALAR</button></div></div>`).join(''):'<small>Ninguém por aqui.</small>'}
 <div class="hd">ARQUIVOS DO LOCAL</div>${Object.keys(p.files).map(f=>`<button class="fl" data-fn="fo:${esc(f)}">📄 ${esc(f)}</button>`).join('')}`};

/* ---------- MISSÕES ---------- */
const misCard=m=>{const d=isDone(m.id),pre=(m.pre||[]).every(isDone),lk=level()<m.lvl||!pre;
 return `<div class="mission${d?' done':''}${lk&&!d?' lk':''}"><b>${d?'✓ ':lk?'🔒 ':''}${esc(m.name)}</b><p>${esc(m.desc)}</p>`+
 (d?'':lk?`<small>${level()<m.lvl?'REQUER NÍVEL '+m.lvl:'CONCLUA A MISSÃO ANTERIOR'}</small>`:`<ul>${m.obj.map(o=>`<li class="${s.flags[o[0]]?'y':''}">${s.flags[o[0]]?'☑':'☐'} ${esc(o[1])}</li>`).join('')}</ul><small>RECOMPENSA: ${m.xp} XP • $${m.cash}${m.rep?' • '+m.rep+' REP':''}</small>`)+'</div>'};
RENDER.mis=()=>`<div class="hd" style="margin-top:0">CAMPANHA — OPERAÇÃO ECLIPSE</div>${MIS.filter(m=>m.cat==='e').map(misCard).join('')}<div class="hd">TREINAMENTO</div>${MIS.filter(m=>m.cat==='t').map(misCard).join('')}`;

/* ---------- CONTRATOS ---------- */
RENDER.con=()=>{fillBoard();return `<div class="row"><b class="ok">QUADRO DE CONTRATOS</b><button data-fn="refresh" style="min-height:32px">↻ ATUALIZAR</button></div><small>Contratos aceitos viram desafios. Equipamento melhor rende bônus de pagamento.</small>`+
 s.board.map(c=>{const w=whyNot(c);return `<div class="card"><div class="row"><div><b>${esc(c.title)}</b><br><small>${esc(c.client)}</small></div><button data-fn="acc:${c.id}" ${w?'disabled':''}>ACEITAR</button></div><span class="pill g">${TYPEN[c.type]}</span><span class="pill y">${stars(c.diff)}</span><span class="pill">${fmt(c.pay)}</span><span class="pill">${c.xp} XP</span>${w?`<p class="warn">🔒 ${esc(w)}</p>`:''}</div>`}).join('')+
 `<div class="hd">TREINAMENTO (sem pagamento • XP nas 5 primeiras vezes por tipo)</div><div class="grid2">${TYPES.map(t=>`<button data-fn="prac:${t}">${TYPEN[t]} <small>${s.stats.practice[t]||0}/5</small></button>`).join('')}</div>`};

/* ---------- LOJA ---------- */
function shopCard(t){let lab='COMPRAR',dis=false;
 if(t.kind==='part'){const cur=ITEM[s.pc[t.slot]];if(cur.id===t.id){lab='INSTALADO';dis=true}else if(cur.v>=t.v){lab='—';dis=true}}
 else if(t.kind==='up'){if(s.pc.up[t.stat]>=t.tier){lab='INSTALADO';dis=true}else if(s.pc.up[t.stat]<t.tier-1){lab='🔒 ANTERIOR';dis=true}}
 else if(has(t.id)){lab='COMPRADO';dis=true}
 if(!dis&&level()<t.lvl){lab='🔒 NV '+t.lvl;dis=true}if(!dis&&(s.cash<t.price||!canShop()))dis=true;
 return `<div class="item"><div><b>${esc(t.name)}</b><p>${esc(t.desc)}</p><small class="pr">${fmt(t.price)}</small> <small>• nível ${t.lvl}</small></div><button data-fn="buy:${t.id}" ${dis?'disabled':''}>${lab}</button></div>`}
RENDER.shop=()=>{const T=TAB.shop||'tool',L={tool:TOOLS,cpu:PARTS.filter(x=>x.slot==='cpu'&&x.price),ram:PARTS.filter(x=>x.slot==='ram'&&x.price),ssd:PARTS.filter(x=>x.slot==='ssd'&&x.price),net:PARTS.filter(x=>x.slot==='net'&&x.price),pc:PCS,up:UPS}[T];
 return `<small>${canShop()?'Você está em uma loja. Toque para comprar.':'Conecte-se ao Mercado Virtual ou ao Centro Tecnológico para comprar.'} • Saldo: <b class="pr">${fmt(s.cash)}</b></small>`+
 tabs('shop',[['tool','Ferramentas'],['cpu','CPU'],['ram','RAM'],['ssd','SSD'],['net','Rede'],['pc','PCs'],['up','Melhorias']])+L.map(shopCard).join('')+(T==='cpu'||T==='ram'||T==='ssd'||T==='net'?'<small>Peças são instaladas automaticamente; você recebe 35% do valor da peça antiga.</small>':'')};

/* ---------- MEU PC ---------- */
RENDER.pc=()=>{const f=fx();return `<h3>${esc(s.pc.name)}</h3>`+['cpu','ram','ssd','net'].map(k=>{const it=ITEM[s.pc[k]],v=stat(k),t=s.pc.up[k];
 return `<div class="card"><div class="row"><b>${STATS[k][0]}</b><span class="pill g">atributo ${v}</span></div><div class="meter"><i style="width:${Math.min(100,v/13*100)}%"></i></div><p>${esc(it.name)} • melhorias ${t}/3</p><small>${STATS[k][1]}</small>${t<3?`<div class="actions"><button data-fn="buy:up_${k}${t+1}" ${(!canShop()||s.cash<UPG[k][1][t]||level()<[2,3,5][t])?'disabled':''}>${esc(UPG[k][0])} ${['I','II','III'][t]} — ${fmt(UPG[k][1][t])}</button></div>`:''}</div>`}).join('')+
 `<div class="hd">EFEITOS NOS CONTRATOS</div><div class="card"><p>Tentativas em quebra-cabeças: <b>${f.attempts}</b></p><p>Filtro de logs: <b>${f.filter?'ATIVO':'bloqueado'}</b> • Resumo de falhas: <b>${f.hl?'ATIVO':'bloqueado'}</b></p><p>Sondagens em auditorias: <b>${f.probes}</b></p><p>Análises estáticas: <b>${f.statics}</b></p><p>Tempo de reação na defesa: <b>${Math.round(f.dlife*100)}%</b> • Escudos: <b>${f.shields}</b></p><p>Comparação de evidências: <b>${f.compare?'ATIVA':'bloqueada'}</b> • Relatório forense extra: <b>${f.extraClue?'SIM':'não'}</b></p></div>
 <div class="actions"><button data-fn="open:shop">ABRIR LOJA</button></div>`};

/* ---------- MOCHILA ---------- */
RENDER.inv=()=>{const tl=TOOLS.filter(t=>has(t.id)),lt=LOOT.filter(l=>has(l.id));
 return `<div class="hd" style="margin-top:0">FERRAMENTAS</div>`+(tl.length?tl.map(t=>`<div class="item"><div><b>${esc(t.name)}</b><p>${esc(t.desc)}</p></div></div>`).join(''):'<small>Mochila vazia. Compre ferramentas no Mercado Virtual.</small>')+
 `<div class="hd">ITENS ACHADOS</div>`+(lt.length?lt.map(l=>`<div class="item"><div><b>${esc(l.name)} ×${s.inv.filter(x=>x===l.id).length}</b><p>${esc(l.desc)}</p><small class="pr">vale ${fmt(l.v)} cada</small></div></div>`).join('')+`<div class="actions"><button data-fn="sell" ${s.loc==='market'?'':'disabled'}>VENDER TUDO ${s.loc==='market'?'':'(vá ao Mercado)'}</button></div>`:'<small>Explore os locais para achar itens.</small>')+
 `<div class="hd">HARDWARE</div><div class="card"><b>${esc(s.pc.name)}</b><p>CPU ${stat('cpu')} • RAM ${stat('ram')} • SSD ${stat('ssd')} • Rede ${stat('net')}</p><div class="actions"><button data-fn="open:pc">MEU PC</button></div></div>`};

/* ---------- ARQUIVOS ---------- */
const SYSF={'sobre.txt':`SANTOS OS v0.3\nSimulador hacker fictício e 100% offline.\nNenhuma rede ou sistema real é acessado.`,'manual.txt':'GUIA RÁPIDO\n1. CONTRATOS: aceite trabalhos e resolva desafios.\n2. LOJA: melhore o PC.\n3. MAPA: desbloqueie novos locais.\n4. MISSÕES: siga a campanha Eclipse.\n5. CONFIG: exporte seu progresso.','versao.txt':'v0.3 — SO virtual, mundo aberto, contratos, equipamentos, campanha, habilidades, conquistas.\nv0.2.1 — desktop simulado com janelas.\nv0.2 — mundo, loja, missões.'};
function openFile(d,f){FS.d=d;FS.f=f;if(d==='local')readFile(s.loc,f);check();checkAch();save()}
RENDER.files=()=>{const path=FS.d==='root'?'/':FS.d==='home'?'/home/'+s.name:FS.d==='local'?'/local/'+P(s.loc).id:'/sistema',B=`<button data-fn="fd:root" style="min-height:32px">⌂ RAIZ</button>`;
 let body='';if(FS.f){const t=FS.d==='home'?s.docs[FS.f]:FS.d==='local'?P(s.loc).files[FS.f]:SYSF[FS.f];body=`<div class="crumb">${esc(path)}/${esc(FS.f)}</div><pre class="doc">${esc(t||'(arquivo não encontrado)')}</pre><div class="actions"><button data-fn="fb">◀ VOLTAR</button></div>`}
 else if(FS.d==='root')body=`<button class="fl" data-fn="fd:home">📁 home/${esc(s.name)} <small>(${Object.keys(s.docs).length} arquivos)</small></button><button class="fl" data-fn="fd:local">📁 local/${esc(P(s.loc).id)} <small>(${esc(P(s.loc).name)})</small></button><button class="fl" data-fn="fd:sys">📁 sistema</button>`;
 else{const names=FS.d==='home'?Object.keys(s.docs):FS.d==='local'?Object.keys(P(s.loc).files):Object.keys(SYSF);body=(names.length?names.map(n=>`<button class="fl" data-fn="ff:${esc(n)}">📄 ${esc(n)}</button>`).join(''):'<small>Pasta vazia. Conclua contratos para gerar relatórios.</small>')}
 return `<div class="crumb">${B} <b>${esc(path)}</b></div>`+body};
UIFN.fd=a=>{FS.d=a;FS.f=null;render()};UIFN.ff=a=>openFile(FS.d,a);UIFN.fb=()=>{FS.f=null;render()};UIFN.fo=a=>{openWin('files');openFile('local',a)};

/* ---------- NAVEGADOR FICTÍCIO ---------- */
const SITE_LIST=[['noticias.santos','Notícias Santos'],['aurora.corp','Corporação Aurora'],['onix.host','Data Center Ônix'],['mercado.virtual','Mercado Virtual'],['meridiano.tech','Centro Meridiano'],['freela.hack','Freela.hack (contratos)'],['raizes.under','Raízes (restrito)']];
const lnk=(u,t)=>`<a href="#" data-fn="w:${u}">${t||u}</a>`;
const SITES={
'busca.hk':()=>`<h3>BUSCAKI</h3><p>A internet fictícia do SANTOS OS. Nenhum site real é acessado.</p><form data-form="search" style="margin:8px 0"><input name="q" placeholder="buscar na rede fictícia" autocomplete="off"><button>BUSCAR</button></form><div class="grid2">${SITE_LIST.map(x=>`<button data-fn="w:${x[0]}">${x[1]}</button>`).join('')}</div>`,
'noticias.santos':()=>`<h3>NOTÍCIAS SANTOS</h3><p>• ${lnk('noticias.santos/aurora','Aurora investiga tráfego incomum em sua rede interna')}</p><p>• ${lnk('noticias.santos/onix','Ônix reforça segurança de racks após alertas')}</p>${isDone('c4')?'<p>• Vazamento interno na Aurora é esclarecido; responsável identificado.</p>':''}${isDone('c6')?'<p>• Ônix resiste a ataque simulado e vira referência em resposta a incidentes.</p>':''}${isDone('c9')?'<p>• <b>Eclipse desmantelado:</b> operação conjunta Aurora–Ônix–Raízes encerra o grupo.</p>':''}`,
'noticias.santos/aurora':()=>`<h3>Aurora investiga tráfego incomum</h3><p>A Corporação Aurora confirmou que sua equipe de segurança detectou muitas falhas de login seguidas de um acesso bem-sucedido durante a madrugada. A empresa chamou analistas independentes. “Precisamos olhar os logs com calma”, disse a CISO.</p><div class="box">Dica de jogo: contratos de Análise de Logs revelam esse tipo de padrão.</div>${lnk('noticias.santos','← voltar')}`,
'noticias.santos/onix':()=>`<h3>Ônix reforça segurança</h3><p>O Data Center Ônix investe em treinamento de defesa e simulações de ataque para preparar sua equipe. Tempo de reação é o diferencial.</p>${lnk('noticias.santos','← voltar')}`,
'aurora.corp':()=>`<h3>CORPORAÇÃO AURORA</h3><p>Tecnologia, pessoas e dados — com segurança.</p><p>${lnk('aurora.corp/equipe','Nossa equipe')}</p><div class="box">Vagas: Analista de Segurança Jr. ${isDone('c9')?'<br><b>Você foi convidado(a) a se candidatar.</b>':''}</div>`,
'aurora.corp/equipe':()=>`<h3>Equipe</h3><p>Dra. Helena Vance — CISO<br>Rafael — TI (estagiário)<br>Mais 3 pessoas fictícias e uma cafeteira.</p>${lnk('aurora.corp','← voltar')}`,
'onix.host':()=>`<h3>DATA CENTER ÔNIX</h3><p>Hospedagem fictícia com uptime fictício de 99,9%.</p><p>${lnk('onix.host/status','Status dos serviços')}</p>`,
'onix.host/status':()=>`<h3>Status</h3><p>WEB: operacional<br>SSH: operacional<br>DB: operacional<br>MAIL: operacional</p>${lnk('onix.host','← voltar')}`,
'mercado.virtual':()=>`<h3>MERCADO VIRTUAL</h3><p>Ferramentas, peças e computadores. As compras são feitas no app Loja, estando no mercado ou no Centro Meridiano.</p><button data-fn="open:shop">ABRIR LOJA</button>`,
'meridiano.tech':()=>`<h3>CENTRO MERIDIANO</h3><p>Pesquisa em defesa de redes e hardware.</p><p>${lnk('meridiano.tech/pesquisa','Pesquisa')}</p>`,
'meridiano.tech/pesquisa':()=>`<h3>Pesquisa</h3><p>Hardware melhor reduz a pressão em incidentes: mais CPU dá mais tempo de reação; mais RAM, mais tentativas; SSD acelera o filtro de logs; rede melhor permite mais sondagens.</p>${lnk('meridiano.tech','← voltar')}`,
'freela.hack':()=>`<h3>FREELA.HACK</h3><p>${s.board.length} contratos abertos no momento.</p><button data-fn="open:con">ABRIR CONTRATOS</button>`,
'raizes.under':()=>s.visited.includes('under')?`<h3>RAÍZES</h3><p>Informação circula, dano não.</p><div class="box">Padrão do Eclipse: falhas, falhas, falhas… sucesso. Procure isso nos logs.</div>`:`<h3>ERRO 403</h3><p>Acesso restrito: conecte-se à Rede Subterrânea primeiro.</p>`
};
const WEBFLAG={'noticias.santos/aurora':'read_news'};
const webNorm=u=>norm(String(u||'')).replace(/^(https?:\/\/|santos:\/\/)/,'').replace(/\s+/g,'').replace(/\/+$/,'')||'busca.hk';
function webGo(u,push=true){u=webNorm(u);if(push){WS.h=WS.h.slice(0,WS.i+1);WS.h.push(u);WS.i=WS.h.length-1}if(WEBFLAG[u]){flag(WEBFLAG[u]);check();checkAch();save()}else render()}
RENDER.web=()=>{const u=WS.h[WS.i],pg=SITES[u];
 return `<div class="nav"><button data-fn="wb" ${WS.i<1?'disabled':''}>◀</button><button data-fn="wf" ${WS.i>=WS.h.length-1?'disabled':''}>▶</button><button data-fn="w:busca.hk">⌂</button><form data-form="web"><input name="u" value="${esc(u)}" autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Endereço"><button>IR</button></form></div><div class="page">${pg?pg():`<h3>ERRO 404</h3><p>O endereço “${esc(u)}” não existe na internet fictícia.</p>${lnk('busca.hk','Ir para a busca')}`}</div><div class="foot">Internet fictícia • nenhum site real é acessado</div>`};
UIFN.w=a=>webGo(a);UIFN.wb=()=>{if(WS.i>0){WS.i--;render()}};UIFN.wf=()=>{if(WS.i<WS.h.length-1){WS.i++;render()}};
FORMS.web=f=>webGo(f.u.value);
FORMS.search=f=>{const q=norm(f.q.value);const r=SITE_LIST.filter(x=>norm(x[0]+' '+x[1]).includes(q));if(!q||!r.length){toast('Nada encontrado na rede fictícia.');return}if(r.length===1)webGo(r[0][0]);else dlg('RESULTADOS',r.map(x=>[x[1]+' — '+x[0],'']))};

/* ---------- RANKING ---------- */
RENDER.rank=()=>{const L=currentBoard(),m=myPosition(),tab=TAB.rank||'geral',list=tab==='aparelho'?L.filter(x=>x.local):L;
 const row=(x,i)=>`<div class="rk${x.me?' you':''}"><span class="pos">${i+1}</span><span class="lg" style="color:${x.t.lg.c}" title="${esc(x.t.label)}">${x.t.lg.i}</span><span class="nm">${esc(x.n)}${x.me?' <small>(você)</small>':''}<small>${esc(x.t.label)}</small></span><b>${fmtN(x.sc)}</b></div>`;
 const pod=list.slice(0,3),rest=list.slice(3,30);
 const t=m.me.t;
 return `<div class="lcard" style="--lc:${t.lg.c}"><div class="lbadge">${t.lg.i}</div><div class="lmid"><small>SUA LIGA</small><b>${esc(t.label)}</b><div class="bar lbar"><i style="width:${t.pct}%"></i></div><small>${t.lg.div||t.dv?(t.hi?fmtN(t.toNext)+' pts para o próximo degrau':'Liga máxima'):'Liga máxima'}</small></div><div class="lpos"><small>POSIÇÃO</small><b>#${m.pos}</b><small>de ${m.total}</small></div></div>`+
 tabs('rank',[['geral','Geral'],['aparelho','Neste aparelho']])+
 (list.length?`<div class="podium">${pod.map((x,i)=>`<div class="pod p${i+1}${x.me?' you':''}"><span>${i+1}º</span><b>${esc(x.n)}</b><small style="color:${x.t.lg.c}">${x.t.lg.i} ${esc(x.t.label)}</small><em>${fmtN(x.sc)}</em></div>`).join('')}</div>`+rest.map((x,i)=>row(x,i+3)).join(''):'<p class="sub">Nenhum operador neste aparelho ainda.</p>')+
 `<div class="hd">LIGAS</div><div class="ladder">${LEAGUES.map((g,i)=>`<div class="lstep${i===t.li?' on':''}" style="--lc:${g.c}"><span>${g.i}</span><b>${g.n}</b><small>${fmtN(g.min)}+</small></div>`).join('')}</div>
 <small>Pontuação = XP + reputação×20 + missões×50 + contratos×30. ${NET.online()?'Ranking online: jogadores reais, atualizado a cada 30 s.':'Ranking local: rivais fictícios e operadores deste aparelho.'}${NET.status?'<br>'+esc(NET.status):''}</small>`};
/* ---------- CONQUISTAS / HABILIDADES / PERFIL ---------- */
RENDER.ach=()=>`<div class="row"><b class="ok">CONQUISTAS</b><span class="pill g">${s.ach.length}/${ACH.length}</span></div>`+ACH.map(a=>{const d=s.ach.includes(a.id);return `<div class="card" style="${d?'':'opacity:.55'}"><b>${d?'★':'☆'} ${esc(a.n)}</b><p>${esc(a.d)}</p></div>`}).join('');
RENDER.skl=()=>`<div class="row"><b class="ok">HABILIDADES</b><span class="pill y">${spAvail()} pontos</span></div><small>Você ganha 1 ponto a cada nível.</small>`+SKILLS.map(k=>{const own=sk(k.id),why=own?'APRENDIDA':level()<k.lvl?'🔒 NV '+k.lvl:spAvail()<k.cost?k.cost+' pts':'APRENDER ('+k.cost+')';return `<div class="item"><div><b>${esc(k.n)}</b><p>${esc(k.d)}</p><small>custo ${k.cost} • nível ${k.lvl}</small></div><button data-fn="learn:${k.id}" ${own||level()<k.lvl||spAvail()<k.cost?'disabled':''}>${why}</button></div>`}).join('');
RENDER.prof=()=>{const n=s.xp%XPL,t=s.stats;return `<div class="stats"><div class="stat"><small>NÍVEL</small><b id="lv">${level()}</b></div><div class="stat"><small>XP</small><b id="xp">${s.xp}</b></div><div class="stat"><small>CRÉDITOS</small><b id="cash">${s.cash}</b></div></div><div class="bar"><i id="bar" style="width:${n/5}%"></i></div><div class="rank"><small id="next">${n} / ${XPL} XP para próximo nível</small><small id="rank">RANK: ${rank().toUpperCase()}</small></div>
 <div class="hd">OPERADOR ${esc(s.name.toUpperCase())}</div><div class="card"><p>Liga: <b style="color:${tierOf(score()).lg.c}">${esc(tierOf(score()).label)}</b> • Posição: <b>#${myPosition().pos}</b></p><p>Reputação: <b>${s.rep}</b> (${repTitle()}) • Pontuação: <b>${score()}</b></p><p>Local: ${esc(P(s.loc).name)}</p><p>PC: ${esc(s.pc.name)} — CPU ${stat('cpu')} • RAM ${stat('ram')} • SSD ${stat('ssd')} • Rede ${stat('net')}</p><p>Missões: ${s.done.length}/${MIS.length} • Conquistas: ${s.ach.length}/${ACH.length} • Habilidades: ${s.skills.length}/${SKILLS.length}</p></div>
 <div class="hd">ESTATÍSTICAS</div><div class="card"><p>Contratos concluídos: <b>${t.contracts}</b> • falhos: ${t.failed}</p><p>Ganhos: ${fmt(t.earned)} • Gastos: ${fmt(t.spent)}</p><p>${TYPES.map(k=>TYPEN[k]+': '+(t.ch[k]||0)).join('<br>')}</p><p>Tempo de jogo: ${Math.floor(t.play/60)} min • Comandos: ${t.cmds} • Explorações: ${t.explored}</p></div>`};

/* ---------- CONFIGURAÇÕES ---------- */
const sw=(k,l)=>`<div class="sw"><span>${l}</span><button data-fn="tg:${k}">${s.set[k]?'LIGADO':'DESLIGADO'}</button></div>`;
RENDER.set=()=>`<h3>CONFIGURAÇÕES</h3><form data-form="name"><input name="n" value="${esc(s.name)}" maxlength="16" pattern="[A-Za-z0-9_-]{1,16}" autocapitalize="none" aria-label="Nome do operador"><button>SALVAR NOME</button></form><small>Nome do operador (letras, números, _ e -). Aparece no terminal.</small>
 <div class="hd">VISUAL</div>${sw('fx','Efeito de linhas CRT')}${sw('glow','Brilho neon')}${sw('anim','Animações')}${sw('music','Música de fundo')}<div class="sw"><span>Volume da música: ${s.set.vol}%</span><span><button data-fn="vol:-10">−</button> <button data-fn="vol:10">+</button></span></div><div class="sw"><span>Trilha: ${s.set.track==='mp3'?'AMBIENTE (MP3)':'GERADA (sintética)'}</span><button data-fn="track">TROCAR</button></div><div class="sw"><span>Tema: ${s.set.theme==='halloween'?'HALLOWEEN 🎃':'PADRÃO'}</span><button data-fn="theme">TROCAR</button></div><div class="sw"><span>Som não toca?</span><button data-fn="testsom">▶ TESTAR SOM</button></div><div class="sw"><span>Tamanho do texto: ${s.set.font}px</span><span><button data-fn="fs:-1">A−</button> <button data-fn="fs:1">A+</button></span></div>
 <div class="hd">PROGRESSO</div><small>Salvamento automático ativo (a cada ação, a cada 15s e ao sair). Exporte para guardar um backup ou levar para outro aparelho.</small>
 <div class="actions"><button data-fn="xport">⬇ BAIXAR ARQUIVO</button><button data-fn="cpy">📋 COPIAR CÓDIGO</button></div>
 <div class="hd">IMPORTAR</div><textarea id="impt" placeholder="Cole aqui o código ou o conteúdo do arquivo de progresso" aria-label="Código de progresso"></textarea><div class="actions"><button data-fn="imp">IMPORTAR CÓDIGO</button><label><input type="file" accept=".json,application/json,text/plain" data-change="impf" style="display:none"><span class="fl" style="display:inline-flex;border:1px solid #28643c;border-radius:5px;padding:10px;color:var(--g);font-size:11px;min-height:40px;cursor:pointer">ESCOLHER ARQUIVO</span></label><button data-fn="undo">DESFAZER IMPORTAÇÃO</button></div>
 <div class="hd">SISTEMA</div><div class="actions"><button data-fn="rst">REINICIAR PROGRESSO</button></div><div class="card"><p>SANTOS HACKER SIMULATOR ${BUILD} • save v${VER}</p><p>Simulação fictícia e offline. Nenhuma rede ou sistema real é acessado.</p></div>`;
FORMS.name=f=>{const n=f.n.value.trim();if(!/^[\w-]{1,16}$/.test(n)){toast('Nome inválido: use letras, números, _ ou -');return}s.name=n;save();toast('Nome salvo: '+n)};
FORMS.impf=f=>{const file=f.files&&f.files[0];if(!file)return;if(file.size>3e6){toast('Arquivo grande demais');return}const r=new FileReader();r.onload=()=>doImport(String(r.result));r.onerror=()=>toast('Não foi possível ler o arquivo');r.readAsText(file);f.value=''};
function doImport(txt){const[ok,msg]=importData(txt);if(ok){normUI();fillBoard();applySettings();endActive();layout();persist();notify('📥 '+msg)}dlg(ok?'IMPORTADO':'ERRO',[[msg,ok?'ok':'bad']])}
function download(name,text){const b=new Blob([text],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},1500)}
function copyText(t){const done=()=>toast('📋 Código copiado'),fb=()=>{const x=document.createElement('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.append(x);x.select();try{document.execCommand('copy');done()}catch(e){toast('Não foi possível copiar. Use BAIXAR ARQUIVO.')}x.remove()};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fb);else fb()}

/* ---------- AÇÕES DOS BOTÕES ---------- */
UIFN.sel=a=>{sel=a;render();setTimeout(()=>{const g=$('#svgmap [data-id="'+sel+'"]');if(g&&g.focus)g.focus()},60)};
UIFN.go=a=>runUI('connect '+a);
UIFN.tab=a=>{const[k,v]=a.split('.');TAB[k]=v;render()};
UIFN.buy=a=>runUI('buy '+a);
UIFN.acc=a=>startContract(a);
UIFN.prac=a=>startPractice(a);
UIFN.refresh=()=>{refreshBoard();save();toast('Quadro atualizado')};
UIFN.talk=a=>runUI('talk '+a,true);
UIFN.expl=()=>runUI('explore',true);
UIFN.sell=()=>runUI('sell all');
UIFN.learn=a=>runUI('learn '+a);
UIFN.open=a=>openWin(a);
UIFN.chx=()=>closeWin('chal');
UIFN.clrn=()=>{s.ntf=[];notifRender()};
UIFN.act=a=>{const x=P(s.loc).acts[+a];if(!x)return;const[t,v]=x[1].split(':');
 if(t==='app')openWin(v);else if(t==='practice')startPractice(v);else if(x[1]==='sell')runUI('sell all');
 else if(x[1]==='rest'){persist();dlg('DESCANSO',[['Você descansa, toma café e revisa suas anotações.','dim'],['Progresso salvo.','ok']])}};
UIFN.tg=a=>{s.set[a]=!s.set[a];applySettings();if(a==='music')Music.sync();save()};
UIFN.vol=a=>{s.set.vol=clamp(s.set.vol+(+a),0,100);Music.sync();save()};
UIFN.testsom=()=>Music.test();
UIFN.theme=()=>{s.set.theme=s.set.theme==='halloween'?'padrao':'halloween';applySettings();save();if($('#home').classList.contains('on'))renderHome()};
UIFN.track=()=>{s.set.track=s.set.track==='mp3'?'gen':'mp3';Music.sync();save()};
UIFN.fs=a=>{s.set.font=clamp(s.set.font+(+a),11,17);applySettings();save()};
UIFN.xport=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');download(`santos-hacker-save-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`,exportData());checkAch();save();toast('⬇ Arquivo gerado')};
UIFN.cpy=()=>{copyText(toCode(exportData()));checkAch();save()};
UIFN.imp=()=>{const t=$('#impt');if(t)doImport(t.value)};
UIFN.undo=()=>{if(undoImport()){normUI();fillBoard();applySettings();layout();persist();dlg('DESFEITO',[['Save anterior restaurado.','ok']])}else dlg('ERRO',[['Não há backup para restaurar.','bad']])};
UIFN.rst=()=>{if(confirm('Isto apaga TODO o progresso. Exporte antes se quiser guardar. Continuar?'))run('reset confirm')};
UIFN.dlgx=()=>$('#dlg').classList.remove('on');
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('g[data-fn]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
