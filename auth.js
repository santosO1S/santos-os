'use strict';
/* ============================================================
   LOGIN E TELA INICIAL
   Perfis de operador guardados no próprio navegador (sem servidor).
   Senhas são guardadas como hash PBKDF2 (ou hash simples se o
   navegador não tiver Web Crypto). Não é uma conta online.
   ============================================================ */
const PKEY='shs_profiles',LASTKEY='shs_last';
let PROFILES=[],CUR=null,AUTHMODE='list',SELID=null,AUTHERR='';

function loadProfiles(){try{const a=JSON.parse(localStorage.getItem(PKEY)||'[]');PROFILES=Array.isArray(a)?a.filter(p=>p&&typeof p.id==='string'&&typeof p.key==='string'&&typeof p.name==='string'):[]}catch(e){PROFILES=[]}
 /* migração: save da 0.2.1/0.3 (chave 'shs') vira o operador "operador" sem senha */
 try{if(!PROFILES.length&&localStorage.getItem('shs')){PROFILES=[{id:'legacy',name:'operador',salt:'',hash:'',key:'shs'}];saveProfiles()}}catch(e){}}
function saveProfiles(){try{localStorage.setItem(PKEY,JSON.stringify(PROFILES));return true}catch(e){return false}}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const rnd=n=>{const a=new Uint8Array(n);if(globalThis.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else for(let i=0;i<n;i++)a[i]=Math.random()*256|0;return hex(a)};
async function hashPw(pw,salt){if(!pw)return '';const enc=new TextEncoder();
 try{const k=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:120000},k,256))}
 catch(e){let h=7;for(const c of salt+pw)h=(h*31+c.charCodeAt(0))>>>0;return 'x'+h}}

function loadSession(p){CUR=p;KEY=p.key;try{const r=localStorage.getItem(KEY);s=r?sanitize(JSON.parse(r)):def()}catch(e){s=def()}
 sel=s.loc;try{localStorage.setItem(LASTKEY,p.id)}catch(e){}}
function showScr(id){$('#desk')&&0;$('#auth').classList.toggle('on',id==='auth');$('#home').classList.toggle('on',id==='home')}

/* ---------- tela de login ---------- */
function renderAuth(){const b=$('#auth-body');let h='<div class="brand-big">▣ SANTOS HACKER SIMULATOR</div><p class="sub">ACESSO AO SISTEMA</p>';
 if(AUTHMODE==='list'){h+='<h2>OPERADORES</h2>'+(PROFILES.length?PROFILES.map(p=>`<button class="pf" data-fn="pick:${esc(p.id)}"><b>${esc(p.name)}</b><small>${p.hash?'🔒 protegido':'sem senha'}</small></button>`).join(''):'<p class="sub">Nenhum operador criado ainda.</p>')+'<div class="menu"><button class="primary" data-fn="mode:create">+ NOVO OPERADOR</button></div>'}
 else if(AUTHMODE==='pw'){const p=PROFILES.find(x=>x.id===SELID);if(!p){AUTHMODE='list';return renderAuth()}
  h+=`<h2>${esc(p.name)}</h2><form data-form="login" class="fcol"><input type="password" name="pw" placeholder="senha" autocomplete="current-password" aria-label="Senha"><button class="primary">ENTRAR</button></form><div class="menu"><button data-fn="mode:list">◀ VOLTAR</button></div>`}
 else if(AUTHMODE==='create'){h+=`<h2>NOVO OPERADOR</h2><form data-form="create" class="fcol"><input name="n" maxlength="16" placeholder="nome do operador" autocapitalize="none" autocomplete="username" aria-label="Nome"><input type="password" name="pw" placeholder="senha (opcional, mín. 4)" autocomplete="new-password" aria-label="Senha"><input type="password" name="pw2" placeholder="confirmar senha" autocomplete="new-password" aria-label="Confirmar senha">${NET.mode==='online'?'<label class="cons"><input type="checkbox" name="ok"> Concordo que meu nome, nível e pontuação sejam guardados online para o ranking e para o administrador do jogo. Posso pedir a exclusão pela tela inicial.</label>':''}<button class="primary">CRIAR E ENTRAR</button></form><div class="menu"><button data-fn="mode:list">◀ VOLTAR</button></div><p class="sub" style="text-align:center;margin-top:12px">Letras, números, _ e -. Até 16 caracteres.</p>`}
 if(AUTHERR)h+=`<p class="err">${esc(AUTHERR)}</p>`;
 b.innerHTML=h}
function showAuth(){AUTHERR='';renderAuth();showScr('auth')}

/* ---------- tela inicial ---------- */
function renderAuthHome(){const n=s.xp%XPL;
 $('#home-body').innerHTML=`<div class="brand-big">▣ SANTOS HACKER SIMULATOR</div><p class="sub">TELA INICIAL • OPERADOR ${esc(s.name.toUpperCase())}</p>
 <div class="stats"><div class="stat"><small>NÍVEL</small><b>${level()}</b></div><div class="stat"><small>CRÉDITOS</small><b>$${s.cash}</b></div><div class="stat"><small>MISSÕES</small><b>${s.done.length}/${MIS.length}</b></div></div>
 <div class="bar"><i style="width:${n/5}%"></i></div><p class="sub">Liga ${esc(tierOf(score()).label)} • ${esc(rank())} • ${n}/${XPL} XP para o próximo nível • Local: ${esc(P(s.loc).name)}</p>
 <div class="menu"><button class="primary" data-fn="play">▶ CONTINUAR</button><button data-fn="theme">${s.set.theme==='halloween'?'🎃 TEMA: HALLOWEEN (trocar para padrão)':'🎨 TEMA: PADRÃO (trocar para Halloween)'}</button><button data-fn="newgame">↺ NOVO JOGO (zera este operador)</button><button data-fn="switch">👤 TROCAR OPERADOR</button><button data-fn="delp">🗑 EXCLUIR OPERADOR</button>${NET.mode==='online'&&CUR&&CUR.consent?'<button data-fn="dataDel">🔒 APAGAR MEUS DADOS ONLINE</button>':''}</div>`}
function showHome(){AUTHERR='';applySettings();renderAuthHome();showScr('home')}
function goAuthHome(){if(!KEY){showAuth();return}persist();endActive();showHome()}
function goSwitch(){persist();KEY=null;CUR=null;endActive();AUTHMODE=PROFILES.length?'list':'create';showAuth()}

/* ---------- ações ---------- */
UIFN.mode=a=>{AUTHMODE=a;AUTHERR='';renderAuth()};
UIFN.pick=id=>{SELID=id;const p=PROFILES.find(x=>x.id===id);if(!p)return;
 if(p.hash){AUTHMODE='pw';AUTHERR='';renderAuth()}else{loadSession(p);showHome()}};
UIFN.play=()=>enterDesktop();
UIFN.dataDel=async()=>{if(!CUR||!confirm('Apagar seus dados online (nome, nível e pontuação) do ranking e do servidor? O progresso deste aparelho continua.'))return;
 try{const r=await fetch('/api/player/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pid:s.pid})});if(!r.ok)throw 0;
  CUR.consent=false;const i=PROFILES.findIndex(x=>x.id===CUR.id);if(i>=0)PROFILES[i].consent=false;saveProfiles();NET.rows=null;toast('Dados online apagados.');renderAuthHome()}
 catch(e){toast('Não foi possível apagar agora. Tente de novo com conexão.')}};
UIFN.newgame=()=>{if(!confirm('Zerar o progresso deste operador? Exporte antes se quiser guardar.'))return;s=def();s.name=CUR.name;persist();renderAuthHome()};
UIFN.switch=()=>goSwitch();
UIFN.delp=()=>{if(!CUR)return;if(!confirm('Excluir o operador "'+CUR.name+'" e todo o progresso dele neste aparelho?'))return;
 try{localStorage.removeItem(CUR.key);localStorage.removeItem(CUR.key+'_bak')}catch(e){}
 PROFILES=PROFILES.filter(x=>x.id!==CUR.id);saveProfiles();KEY=null;CUR=null;s=def();AUTHMODE=PROFILES.length?'list':'create';showAuth()};

FORMS.login=async f=>{const p=PROFILES.find(x=>x.id===SELID);if(!p)return;
 const h=await hashPw(f.pw.value,p.salt);
 if(h!==p.hash){AUTHERR='Senha incorreta.';renderAuth();return}
 loadSession(p);showHome()};
FORMS.create=async f=>{const n=f.n.value.trim(),pw=f.pw.value,pw2=f.pw2.value;
 if(NET.mode==='online'&&!(f.ok&&f.ok.checked)){AUTHERR='Para criar um operador online, aceite o aviso sobre os dados.';renderAuth();return}
 if(!/^[\w-]{1,16}$/.test(n)){AUTHERR='Nome inválido: use letras, números, _ ou - (até 16).';renderAuth();return}
 if(PROFILES.some(p=>p.name.toLowerCase()===n.toLowerCase())){AUTHERR='Já existe um operador com esse nome.';renderAuth();return}
 if(pw&&pw.length<4){AUTHERR='A senha precisa ter pelo menos 4 caracteres (ou deixe em branco).';renderAuth();return}
 if(pw!==pw2){AUTHERR='As senhas não conferem.';renderAuth();return}
 const id='p'+rnd(4),salt=rnd(8),hash=await hashPw(pw,salt),p={id,name:n,salt,hash,key:'shs_p_'+id,consent:NET.mode==='online'};
 PROFILES.push(p);saveProfiles();KEY=p.key;CUR=p;s=def();s.name=n;persist();
 try{localStorage.setItem(LASTKEY,id)}catch(e){}
 NET.submit();
 showHome()};

function initAuth(){loadProfiles();AUTHMODE=PROFILES.length?'list':'create';showAuth()}
