'use strict';
/* ============================================================
   DESAFIOS (tudo fictício e educativo, ambiente 100% local)
   logs • logic • audit • vuln • defense • invest
   Cada desafio: CH[tipo](box, spec, efeitos_do_hardware, terminar(nota 0..1, info))
   ============================================================ */
const CH={};let ACTIVE=null;
const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);

function launch(sp){endActive();ACTIVE={sp,cleanup:null,done:false};openWin('chal');const f=fx(),st=TYPESTAT[sp.type];
 $('#b-chal').innerHTML=`<div class="ch"><h3>◆ ${esc(sp.title)}</h3><div><span class="pill g">${TYPEN[sp.type]}</span><span class="pill y">${stars(sp.diff)} nível ${sp.diff}</span><span class="pill c">${STATS[st][0]} ${stat(st)}</span></div><p class="dim">Cliente: ${esc(sp.client)}${sp.kind==='contract'?' • pagamento base $'+sp.c.pay:''}</p><div id="chbox"></div></div>`;
 const box=$('#chbox');ACTIVE.cleanup=CH[sp.type](box,sp,f,(sc,info)=>endChal(sc,info))||null}
function endChal(sc,info={}){if(!ACTIVE||ACTIVE.done)return;ACTIVE.done=true;const sp=ACTIVE.sp;if(ACTIVE.cleanup)ACTIVE.cleanup();
 const r=finishChallenge(sp,sc,info),box=$('#chbox');if(!box)return;const n=Math.round(sc*3+.001);
 box.insertAdjacentHTML('beforeend',`<div class="res ${r.ok?'':'fail'}"><b>${r.ok?'DESAFIO CONCLUÍDO':'DESAFIO FALHOU'}</b><div class="stars">${stars(r.ok?Math.max(1,n):0)}</div><p>Nota: ${Math.round(sc*100)}%</p>`+
  (sp.kind==='contract'?`<p>${r.ok?'Pagamento':'Pagamento'}: <b class="pr">$${r.cash}</b> • XP +${r.xp} • REP +${r.rep}</p>`:`<p>${r.xp?'XP +'+r.xp:(r.ok?'Sem XP extra (treino dominado).':'')}</p>`)+
  (info.note?`<p class="dim">${esc(info.note)}</p>`:'')+`<div class="actions"><button data-fn="chx">FECHAR</button>${sp.kind==='contract'?'<button data-fn="open:con">PRÓXIMO CONTRATO</button>':`<button data-fn="prac:${sp.type}">REPETIR TREINO</button>`}</div></div>`);
 const rs=box.querySelector('.res');if(rs&&rs.scrollIntoView)rs.scrollIntoView({block:'nearest'})}
function endActive(){if(ACTIVE){try{if(ACTIVE.cleanup)ACTIVE.cleanup()}catch(e){}ACTIVE=null}}

/* fluxo de escolha com tentativas (logs, sequência, investigação) */
function pickFlow(box,ans,end,note,tries=2){let t=tries;const all=()=>box.querySelectorAll('[data-a]'),msg=m=>{const e=box.querySelector('#msg');if(e)e.textContent=m};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(b.dataset.a===String(ans)){b.classList.add('good');all().forEach(x=>x.disabled=true);end(t===tries?1:t===tries-1?.6:.5,{note})}
  else{b.classList.add('x');b.disabled=true;t--;if(t<=0){all().forEach(x=>{x.disabled=true;if(x.dataset.a===String(ans))x.classList.add('good')});end(0,{note})}else msg(`Resposta incorreta. Restam ${t} tentativa(s).`)}})}

/* ---------- 1) ANÁLISE DE LOGS ---------- */
CH.logs=(box,sp,f,end)=>{const q=rng(sp.seed),d=sp.diff;
 const ips=shuf(q,['203.0.113.45','203.0.113.77','198.51.100.9','198.51.100.23','192.0.2.14','192.0.2.88','203.0.113.12','198.51.100.61']);
 const cul=ips[0],dec=ips[1],typ=ips[2],nn=ips.slice(3),users=['admin','svc_backup','rh_ana','dev_leo','financeiro','root'],gU=()=>rPick(q,users),cu=rPick(q,['admin','svc_backup','rh_ana']);
 const fl=(ip,u)=>({ip,u,ok:0}),ok=(ip,u)=>({ip,u,ok:1}),g1=[],g2=[],g3=[fl(typ,gU()),ok(typ,gU())],g4=[],g5=[];
 for(let i=0;i<3+d+rI(q,0,1);i++)g1.push(fl(cul,cu));g1.push(ok(cul,cu));
 for(let i=0;i<4+d;i++)g2.push(fl(dec,gU()));
 for(let i=0;i<2+d*2;i++)g4.push(ok(rPick(q,nn),gU()));
 for(let i=0;i<d+1;i++)g5.push({n:rPick(q,['cron: backup concluído','sysmon: cpu 12%','nginx: 200 GET /index','cron: rotação de logs','sysmon: disco 47%'])});
 const G=[g1,g2,g3,g4,g5],ev=[];while(G.some(g=>g.length)){const L=G.filter(g=>g.length);let x=q()*L.reduce((a,g)=>a+g.length,0),pk=L[0];for(const g of L){if(x<g.length){pk=g;break}x-=g.length}ev.push(pk.shift())}
 let t=2*3600+rI(q,0,1800);const hm=v=>String(Math.floor(v/3600)%24).padStart(2,'0')+':'+String(Math.floor(v/60)%60).padStart(2,'0')+':'+String(v%60).padStart(2,'0');
 const lines=ev.map(e=>{t+=rI(q,4,95);const tm='['+hm(t)+']';return e.n?{c:'n',x:tm+' '+e.n}:{c:e.ok?'o':'f',x:`${tm} auth: ${e.ok?'SUCESSO':'FALHA'} user=${e.u} ip=${e.ip}`}});
 const cnt={};ev.forEach(e=>{if(e.ip){cnt[e.ip]=cnt[e.ip]||[0,0];cnt[e.ip][e.ok]++}});
 const opts=shuf(q,[cul,dec,typ,nn[0]]);
 box.innerHTML=`<p class="q">Qual IP obteve ACESSO (SUCESSO) depois de várias FALHAS seguidas? (2 tentativas)</p>`+
  (f.filter?'<input id="lf" placeholder="filtrar linhas (ex.: FALHA, 203.0, admin)" autocomplete="off" autocapitalize="none"><div style="height:7px"></div>':'<small class="warn">🔒 Filtro bloqueado: requer SSD 3+, Analisador de Logs ou Olho Clínico.</small>')+
  `<div class="logbox" id="lg"></div>`+(f.hl?`<div class="card"><small>RESUMO (SSD 6+/Olho Clínico) — falhas/sucessos por IP</small>${Object.keys(cnt).map(ip=>`<div>${ip}: ${cnt[ip][0]} / ${cnt[ip][1]}</div>`).join('')}</div>`:'')+
  `<div class="opts">${opts.map(o=>`<button data-a="${o}">${o}</button>`).join('')}</div><p id="msg" class="warn"></p>`;
 const draw=v=>{const k=norm(v||'');$('#lg').innerHTML=lines.filter(l=>norm(l.x).includes(k)).map(l=>`<div class="${l.c}">${esc(l.x)}</div>`).join('')||'<div class="n">(nenhuma linha)</div>'};draw('');
 box.addEventListener('input',e=>{if(e.target.id==='lf')draw(e.target.value)});
 pickFlow(box,cul,end,'IP comprometido: '+cul+' (várias falhas seguidas de sucesso).')};

/* ---------- 2) QUEBRA-CABEÇAS DE LÓGICA ---------- */
const mmFB=(code,g)=>{let ex=0,pa=0;for(let i=0;i<code.length;i++){if(g[i]===code[i])ex++;else if(code.includes(g[i]))pa++}return[ex,pa]};
function mkSeq(q,d){const t=rI(q,0,4);let sq=[],a,k;
 if(t===0){a=rI(q,2,20);k=rI(q,2,9)+d;for(let i=0;i<6;i++)sq.push(a+k*i)}
 else if(t===1){a=rI(q,1,4);k=rI(q,2,3);for(let i=0;i<6;i++)sq.push(a*k**i)}
 else if(t===2){k=rI(q,1,9);for(let i=1;i<=6;i++)sq.push(i*i+k)}
 else if(t===3){a=rI(q,1,5);k=rI(q,2,6);sq=[a,k];for(let i=2;i<6;i++)sq.push(sq[i-1]+sq[i-2])}
 else{a=rI(q,1,9);k=rI(q,1,3);for(let i=0;i<6;i++)sq.push(a+k*i*(i+1)/2)}
 return{seq:sq.slice(0,5),ans:sq[5]}}
CH.logic=(box,sp,f,end)=>{const q=rng(sp.seed),d=sp.diff;
 if(sp.seed%2){const{seq,ans}=mkSeq(q,d),o=new Set([ans]);while(o.size<4){const v=ans+rI(q,1,9)*(q()<.5?-1:1);if(v>0)o.add(v)}
  box.innerHTML=`<p class="q">Qual número completa a sequência de chaves? (${f.attempts>=6?3:2} tentativas)</p><div class="card"><h3>${seq.join(' , ')} , ?</h3></div><div class="opts">${shuf(q,[...o]).map(v=>`<button data-a="${v}">${v}</button>`).join('')}</div><p id="msg" class="warn"></p>`;
  pickFlow(box,ans,end,'Resposta: '+ans,f.attempts>=6?3:2);return}
 const L=d===1?3:4,code=shuf(q,[0,1,2,3,4,5,6,7,8,9]).slice(0,L).join(''),max=f.attempts;let used=0,over=false;
 box.innerHTML=`<p class="q">Cofre de testes autorizado: descubra o código de ${L} dígitos (sem repetição). ● = dígito certo no lugar certo • ○ = dígito certo no lugar errado.</p><p>Tentativas: <b id="left">${max}</b></p><div class="code" id="hist"></div><form id="mf"><input id="gi" inputmode="numeric" maxlength="${L}" placeholder="${'0'.repeat(L)}" autocomplete="off"><button>TESTAR</button></form><p id="msg" class="warn"></p>`;
 box.addEventListener('submit',e=>{e.preventDefault();if(over)return;const g=$('#gi').value.trim(),m=$('#msg');
  if(!new RegExp('^\\d{'+L+'}$').test(g)){m.textContent='Digite exatamente '+L+' dígitos.';return}if(new Set(g).size<L){m.textContent='Dígitos não podem repetir.';return}
  used++;const[ex,pa]=mmFB(code,g);$('#hist').insertAdjacentHTML('beforeend',`<div>${g} → ${'●'.repeat(ex)}${'○'.repeat(pa)}${ex+pa===0?'—':''}</div>`);$('#left').textContent=max-used;$('#gi').value='';m.textContent='';
  if(ex===L){over=true;$('#mf').remove();end(clamp(1-.5*(used-1)/Math.max(1,max-1),.5,1),{note:'Código: '+code})}
  else if(used>=max){over=true;$('#mf').remove();end(0,{note:'Código: '+code})}})};

/* ---------- 3) AUDITORIA DE SEGURANÇA ---------- */
const AUD={r:[['SSH: login de root permitido com senha','Root remoto com senha facilita ataques de força bruta.'],['Política de senha: mínimo de 4 caracteres','Senhas curtas são fáceis de adivinhar.'],['Backups: nenhum configurado','Sem backup, um incidente vira perda total.'],['Painel web com TLS 1.0 habilitado','Protocolos antigos têm falhas conhecidas.'],['Painel admin exposto sem autenticação multifator','Sem MFA, uma senha vazada basta.'],['Conta padrão admin/admin ainda ativa','Credenciais padrão são as primeiras tentadas.'],['Logs desativados para economizar espaço','Sem logs não há detecção nem investigação.'],['Banco de dados aceitando conexões de qualquer origem','Banco deve ficar restrito à rede interna.'],['Atualizações automáticas desligadas há 2 anos','Patches atrasados deixam falhas abertas.'],['Chave de API gravada em texto puro no repositório','Segredos devem ficar em cofre.'],['Compartilhamento de rede com escrita para "todos"','Permissões amplas demais.'],['Sessão de administrador sem expiração','Sessões eternas ampliam o estrago de um roubo.']],
 o:[['SSH: apenas chaves, root bloqueado','Boa prática.'],['Senhas com 14+ caracteres e MFA obrigatório','Boa prática.'],['Backups diários criptografados e testados todo mês','Boa prática.'],['TLS 1.3 com HSTS no painel','Boa prática.'],['Firewall com regra padrão "negar tudo"','Boa prática.'],['Logs centralizados com retenção de 180 dias','Boa prática.'],['Banco acessível só pela rede interna','Boa prática.'],['Patches críticos aplicados em até 72 horas','Boa prática.'],['Segredos guardados em cofre de senhas','Boa prática.'],['Princípio do menor privilégio aplicado','Boa prática.'],['Sessões expiram em 15 minutos','Boa prática.']]};
CH.audit=(box,sp,f,end)=>{const q=rng(sp.seed),n=4+sp.diff*2,nr=clamp(Math.round(n/2)+rI(q,-1,1),1,n-1);
 const it=shuf(q,[...shuf(q,AUD.r).slice(0,nr).map(x=>({t:x[0],w:x[1],risk:1})),...shuf(q,AUD.o).slice(0,n-nr).map(x=>({t:x[0],w:x[1],risk:0}))]);let pr=f.probes;const ans={},probed={};let over=false;
 const draw=()=>{box.innerHTML=`<p class="q">Classifique cada configuração do servidor fictício como OK ou RISCO.</p><p>Sondagens de rede disponíveis (Placa de rede): <b>${pr}</b></p>`+it.map((x,i)=>`<div class="aitem ${over?(ans[i]===x.risk?'ok':'no'):''}"><div class="t">${esc(x.t)}${probed[i]!==undefined?`<br><small class="warn">🔍 Sondagem: ${x.risk?'RISCO':'OK'}</small>`:''}${over?`<br><small>${esc(x.w)}</small>`:''}</div><div class="b">${over?'':`<button data-x="p${i}" ${pr<1||probed[i]!==undefined?'disabled':''}>🔍</button>`}<button data-x="o${i}" class="${ans[i]===0?'sel':''}" ${over?'disabled':''}>OK</button><button data-x="r${i}" class="${ans[i]===1?'sel':''}" ${over?'disabled':''}>RISCO</button></div></div>`).join('')+(over?'':'<div class="actions"><button data-x="go">FINALIZAR AUDITORIA</button></div>')};draw();
 box.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||over||b.disabled)return;const k=b.dataset.x;
  if(k==='go'){over=true;let c=0,w=0;it.forEach((x,i)=>{if(ans[i]===undefined)return;ans[i]===x.risk?c++:w++});draw();end(Math.max(0,(c-.5*w)/n),{note:`${c} de ${n} corretas.`});return}
  const i=+k.slice(1);if(k[0]==='p'){pr--;probed[i]=1}else ans[i]=k[0]==='r'?1:0;draw()})};

/* ---------- 4) REVISÃO DE VULNERABILIDADES (pseudocódigo didático) ---------- */
const VULN=[
{l:['função buscar_usuario(nome):','  consulta = "SELECT * FROM usuarios WHERE nome = \'" + nome + "\'"','  resultado = banco.executar(consulta)','  retornar resultado'],b:1,fix:'Usar consulta parametrizada (placeholders)',w:['Trocar aspas simples por aspas duplas','Aumentar o limite de tamanho do campo','Esconder o campo de busca do formulário'],why:'Concatenar entrada na consulta permite injeção de SQL; parâmetros separam código de dados.'},
{l:['função enviar_relatorio():','  chave_api = "sk_live_FAKE_9f8e7d6c"','  cliente = ServicoRelatorio(chave_api)','  cliente.enviar(dados)'],b:1,fix:'Mover o segredo para variável de ambiente ou cofre e rotacioná-lo',w:['Renomear a variável para algo menos óbvio','Codificar a chave em Base64 dentro do código','Trocar por outra chave e manter no código'],why:'Segredos no código vazam com o repositório.'},
{l:['função baixar(nome_arquivo):','  caminho = "/dados/publico/" + nome_arquivo','  conteudo = disco.ler(caminho)','  retornar conteudo'],b:1,fix:'Normalizar o caminho e validar que continua dentro do diretório permitido',w:['Converter o nome para minúsculas','Acrescentar ".txt" ao final do nome','Mostrar o caminho completo ao usuário'],why:'Sem validação, "../" pode escapar do diretório (path traversal).'},
{l:['função mostrar_comentario(texto):','  html = "<p>" + texto + "</p>"','  pagina.escrever(html)','  retornar ok'],b:1,fix:'Escapar/codificar a saída antes de inserir no HTML',w:['Limitar o comentário a 500 caracteres','Remover apenas a palavra "script"','Guardar o comentário em maiúsculas'],why:'Saída sem escape permite XSS.'},
{l:['rota POST "/admin/apagar_usuario":','  id = requisicao.id','  banco.apagar(id)','  retornar "feito"'],b:2,fix:'Exigir autenticação e checar permissão de admin antes de agir',w:['Mudar a rota para um nome menos óbvio','Pedir o id em um campo oculto','Responder "feito" só no final'],why:'Ação sensível sem controle de acesso.'},
{l:['função salvar_senha(usuario, senha):','  salvo = md5(senha)','  banco.gravar(usuario, salvo)','  retornar ok'],b:1,fix:'Usar hash lento com sal (bcrypt/argon2)',w:['Aplicar md5 duas vezes','Guardar a senha em Base64','Salvar só os 4 primeiros caracteres'],why:'MD5 é rápido demais e sem sal facilita quebra em massa.'},
{l:['função gerar_token_reset():','  token = numero_simples(1000, 9999)','  banco.gravar_token(token)','  retornar token'],b:1,fix:'Gerar o token com gerador criptograficamente seguro e prazo de validade',w:['Usar um número maior, mas ainda previsível','Enviar o token em maiúsculas','Reaproveitar o mesmo token por usuário'],why:'Tokens previsíveis podem ser adivinhados.'},
{l:['função login(usuario, senha):','  se não valido(usuario, senha):','    retornar "Erro: " + banco.ultimo_erro() + " em " + caminho_servidor','  retornar sessao'],b:2,fix:'Mostrar mensagem genérica e registrar o detalhe só em log interno',w:['Mostrar o erro em letras vermelhas','Traduzir o erro para outro idioma','Mostrar só o caminho do servidor'],why:'Mensagens detalhadas revelam a estrutura interna.'}];
CH.vuln=(box,sp,f,end)=>{const q=rng(sp.seed),list=shuf(q,VULN).slice(0,sp.diff);let k=0,tot=0,st=f.statics,pickL=-1,elim=new Set(),phase=0,fixes=[],lineOK=0;
 const show=()=>{const v=list[k];fixes=shuf(q,[v.fix,...v.w]);phase=0;pickL=-1;elim=new Set();draw()};
 const draw=()=>{const v=list[k];box.innerHTML=`<p class="q">Revisão ${k+1}/${list.length}: ${phase===0?'toque na linha VULNERÁVEL.':'qual é a correção mais adequada?'}</p><div class="src">${v.l.map((x,i)=>`<div data-x="l${i}" class="${pickL===i?'sel':''} ${elim.has(i)?'x':''} ${phase===2&&i===v.b?'bad':''}">${i+1}  ${esc(x)}</div>`).join('')}</div>`+
  (phase===0?`<div class="actions"><button data-x="st" ${st<1?'disabled':''}>🔎 ANÁLISE ESTÁTICA (${st})</button><button data-x="ok" ${pickL<0?'disabled':''}>CONFIRMAR LINHA</button></div>`:phase===1?`<div class="opts" style="grid-template-columns:1fr">${fixes.map((x,i)=>`<button data-x="f${i}">${esc(x)}</button>`).join('')}</div>`:`<div class="card"><p>${esc(v.why)}</p></div><div class="actions"><button data-x="nx">${k+1<list.length?'PRÓXIMA REVISÃO':'CONCLUIR'}</button></div>`)};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||b.disabled||!ACTIVE||ACTIVE.done)return;const x=b.dataset.x,v=list[k];
  if(x[0]==='l'&&phase===0){const i=+x.slice(1);if(!elim.has(i)){pickL=i;draw()}}
  else if(x==='st'){const c=v.l.map((_,i)=>i).filter(i=>i!==v.b&&!elim.has(i));if(c.length>1&&st>0){elim.add(rPick(q,c));st--;if(elim.has(pickL))pickL=-1;draw()}}
  else if(x==='ok'){lineOK=pickL===v.b?1:0;phase=1;draw()}
  else if(x[0]==='f'){const good=fixes[+x.slice(1)]===v.fix;tot+=(lineOK+(good?1:0))/2;phase=2;draw()}
  else if(x==='nx'){k++;if(k<list.length)show();else{box.querySelectorAll('button').forEach(z=>z.disabled=true);end(tot/list.length,{note:'Linhas e correções avaliadas.'})}}});show()};

/* ---------- 5) DEFESA CONTRA ATAQUES SIMULADOS ---------- */
const SVCS=['WEB','SSH','DB','MAIL'];
const ATKS=[{id:'brute',svc:'SSH',txt:'Força bruta contra o SSH',c:'rate'},{id:'phish',svc:'MAIL',txt:'Onda de phishing no e-mail',c:'mail'},{id:'inj',svc:'WEB',txt:'Entrada maliciosa no formulário web',c:'waf'},{id:'flood',svc:'WEB',txt:'Pico anômalo de tráfego',c:'bal'},{id:'exf',svc:'DB',txt:'Cópia anômala de dados no banco',c:'iso'},{id:'old',svc:'DB',txt:'Exploração de versão desatualizada',c:'patch'}];
const CNTS={rate:'Limitar tentativas',mail:'Filtrar e-mail',waf:'Ativar WAF',bal:'Balancear tráfego',iso:'Isolar acesso',patch:'Aplicar patch'};
function defSim(seed,diff,f){const q=rng(seed),total=[0,8,12,16][diff],T=[0,3200,2700,2300][diff],life=T*[0,2.6,2.2,1.9][diff]*f.dlife,dmg=[0,12,16,20][diff];
 const m={t:0,spawned:0,total,atk:[],hp:{WEB:100,SSH:100,DB:100,MAIL:100},shield:f.shields,hits:0,done:false,lost:false,nextAt:800,life};
 const hit=(svc,d)=>{if(m.shield>0){m.shield--;return}m.hp[svc]=Math.max(0,m.hp[svc]-d);m.hits++;if(m.hp[svc]<=0){m.lost=true;m.done=true}};
 m.tick=dt=>{if(m.done)return;m.t+=dt;while(m.spawned<total&&m.t>=m.nextAt){m.atk.push({...rPick(q,ATKS),born:m.nextAt});m.spawned++;m.nextAt+=T}
  for(const a of m.atk.slice()){if(m.t-a.born>=life){m.atk.splice(m.atk.indexOf(a),1);hit(a.svc,dmg)}}
  if(m.spawned>=total&&!m.atk.length)m.done=true};
 m.respond=c=>{const i=m.atk.findIndex(a=>a.c===c);if(i>=0){m.atk.splice(i,1);return true}hit(rPick(q,SVCS),5);return false};
 m.score=()=>m.lost?0:SVCS.reduce((a,k)=>a+m.hp[k],0)/400;return m}
CH.defense=(box,sp,f,end)=>{const m=defSim(sp.seed,sp.diff,f);let iv=null,last=0;
 box.innerHTML=`<p class="q">Ataques SIMULADOS chegam aos serviços do servidor fictício. Toque na contramedida certa antes que o tempo acabe. Tempo de reação (CPU): ${(m.life/1000).toFixed(1)}s • Escudos: ${f.shields}</p><div class="actions"><button data-x="go" id="gob">INICIAR SIMULAÇÃO</button></div><div id="dv"></div>`;
 const draw=()=>{const dv=$('#dv');if(!dv)return;dv.innerHTML=`<div class="svc">${SVCS.map(k=>`<div><b>${k}</b><div class="meter ${m.hp[k]<35?'r':m.hp[k]<70?'y':''}"><i style="width:${m.hp[k]}%"></i></div><small>${m.hp[k]}%</small></div>`).join('')}</div><p class="dim">Ataque ${Math.min(m.spawned,m.total)}/${m.total} • 🛡 ${m.shield}</p>`+
  m.atk.map(a=>{const r=clamp(1-(m.t-a.born)/m.life,0,1);return`<div class="atk"><b>${a.svc}</b> — ${a.txt}<div class="meter ${r<.35?'r':'y'}"><i style="width:${Math.round(r*100)}%"></i></div></div>`}).join('')+`<div class="cnt">${Object.keys(CNTS).map(c=>`<button data-x="c${c}">${CNTS[c]}</button>`).join('')}</div>`};
 const fin=()=>{clearInterval(iv);iv=null;draw();const sc=m.score();end(sc,{flawless:!m.lost&&m.hits===0,note:m.lost?'Um serviço caiu.':m.hits===0?'Defesa impecável!':`${m.hits} falha(s) de resposta.`})};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||!ACTIVE||ACTIVE.done)return;const x=b.dataset.x;
  if(x==='go'&&!iv){b.disabled=true;last=performance.now();iv=setInterval(()=>{const n=performance.now(),dt=Math.min(250,n-last);last=n;if(document.hidden)return;m.tick(dt);if(m.done)fin();else draw()},100);draw()}
  else if(x[0]==='c'&&iv){m.respond(x.slice(1));if(m.done)fin();else draw()}});
 return()=>{if(iv)clearInterval(iv);iv=null}};

/* ---------- 6) INVESTIGAÇÃO DIGITAL ---------- */
CH.invest=(box,sp,f,end)=>{const q=rng(sp.seed),d=sp.diff,N=3+d;
 const names=shuf(q,['Ana Lopes','Bruno Reis','Carla Nunes','Diego Matos','Elisa Prado','Fábio Torres','Gabi Souza','Heitor Lima']).slice(0,N),devs=['NB-04','NB-17','PC-22','PC-31','LT-09','LT-12'],D=rPick(q,devs),ci=rI(q,0,N-1);
 const S=names.map((n,i)=>{if(i===ci)return{n,dev:D,out:true,clr:rI(q,3,5),sh:'noite'};const o={n,dev:rPick(q,devs),out:q()<.5,clr:rI(q,2,5),sh:q()<.5?'dia':'noite'},w=rI(q,0,2);
  if(w===0){while(o.dev===D)o.dev=rPick(q,devs)}else if(w===1)o.out=false;else o.clr=2;return o});
 const extra=d>=3||f.extraClue,files=[
  ['📄 Log de acessos',`21:40 — o arquivo CONFIDENCIAL-RH foi copiado a partir do dispositivo ${D}.\n\nDispositivos atribuídos:\n`+S.map(x=>` • ${x.n}: ${x.dev}`).join('\n')],
  ['🪪 Registro de crachás',`A cópia foi feita remotamente: a pessoa NÃO estava no prédio às 21:40.\n\nSituação dos crachás:\n`+S.map(x=>` • ${x.n}: ${x.out?'FORA do prédio':'dentro do prédio'}`).join('\n')],
  ['🔐 Matriz de permissões',`O arquivo exige autorização de nível 3 ou superior.\n\nNíveis:\n`+S.map(x=>` • ${x.n}: nível ${x.clr}`).join('\n')]];
 if(extra)files.push(['🧪 Relatório forense','O acesso ocorreu durante o turno da NOITE.\n\nTurnos:\n'+S.map(x=>` • ${x.n}: ${x.sh}`).join('\n')]);
 const chk=[x=>x.dev===D,x=>x.out,x=>x.clr>=3,x=>x.sh==='noite'],opened=new Set();
 box.innerHTML=`<p class="q">Um arquivo confidencial vazou. Leia as evidências, cruze os dados e acuse o responsável. (2 tentativas)</p><div class="actions">${files.map((x,i)=>`<button data-x="f${i}">${x[0]}</button>`).join('')}${f.compare?'<button data-x="cmp">⚖ COMPARAR</button>':''}</div><pre class="doc" id="vw">Abra uma evidência.</pre>${f.compare?'':'<small class="warn">Comparação automática: requer RAM 4+ ou Perícia Digital.</small>'}<div id="sus">${S.map((x,i)=>`<div class="card" id="s${i}"><div class="row"><b>${esc(x.n)}</b><button data-a="${i}">ACUSAR</button></div></div>`).join('')}</div><p id="msg" class="warn"></p>`;
 box.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b)return;const x=b.dataset.x;
  if(x[0]==='f'){const i=+x.slice(1);opened.add(i);$('#vw').textContent=files[i][1]}
  else if(x==='cmp'){S.forEach((p,i)=>{const bad=[...opened].some(j=>!chk[j](p));$('#s'+i).style.opacity=bad?.35:1;$('#s'+i).querySelector('b').style.textDecoration=bad?'line-through':''});$('#msg').textContent=opened.size?'Suspeitos que contradizem as evidências abertas foram riscados.':'Abra ao menos uma evidência.'}});
 pickFlow(box,ci,end,'Responsável: '+names[ci]+'.')};
