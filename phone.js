'use strict';
/* ============================================================
   SANTOS OS — Dispositivo Virtual (iPhone-style)
   Home, Lock, Face ID, App Store, Música, mini-apps
   ============================================================ */

const PIN_CODE = '1234';
let pinBuf = '';
let currentApp = null;
let deviceUnlocked = false;
let installedApps = null; // loaded from save
let faceStream = null;

function loadInstalled(){
  try{
    const raw = localStorage.getItem((KEY||'shs')+'_apps');
    installedApps = raw ? JSON.parse(raw) : null;
  }catch(e){ installedApps = null; }
  if(!Array.isArray(installedApps)){
    installedApps = ['term','music','shop','calc','notes','clock','cal','photos','torch','map','rank','con','set'];
  }
}
function saveInstalled(){
  try{ localStorage.setItem((KEY||'shs')+'_apps', JSON.stringify(installedApps)); }catch(e){}
}

/* Catálogo da App Store */
const STORE_CATALOG = [
  {id:'term',  name:'Santos OS',   desc:'Terminal hacker e núcleo do sistema', ico:'>_', cls:'ico-term',  free:true,  cat:'Sistema'},
  {id:'music', name:'Música',      desc:'Player com faixas originais do lab',  ico:'♫',  cls:'ico-music', free:true,  cat:'Entretenimento'},
  {id:'shop',  name:'App Store',   desc:'Loja de aplicativos do Santos OS',    ico:'A',  cls:'ico-store', free:true,  cat:'Sistema'},
  {id:'calc',  name:'Calculadora', desc:'Cálculos rápidos',                    ico:'☰',  cls:'ico-calc',  free:true,  cat:'Utilitários'},
  {id:'notes', name:'Notas',       desc:'Anotações salvas no progresso',       ico:'✎',  cls:'ico-notes', free:true,  cat:'Produtividade'},
  {id:'clock', name:'Relógio',     desc:'Hora e data',                         ico:'⏱',  cls:'ico-clock', free:true,  cat:'Utilitários'},
  {id:'cal',   name:'Calendário',  desc:'Mês atual',                           ico:'17', cls:'ico-cal',   free:true,  cat:'Utilitários'},
  {id:'photos',name:'Fotos',       desc:'Galeria fictícia',                    ico:'❀',  cls:'ico-photos',free:true,  cat:'Entretenimento'},
  {id:'torch', name:'Lanterna',    desc:'Luz de tela',                         ico:'🔦', cls:'ico-torch', free:true,  cat:'Utilitários'},
  {id:'map',   name:'Mapa',        desc:'Mapa da cidade fictícia',             ico:'🗺', cls:'ico-map',   free:true,  cat:'Jogo'},
  {id:'rank',  name:'Ranking',     desc:'Placar online de operadores',         ico:'🏆', cls:'ico-rank',  free:true,  cat:'Jogo'},
  {id:'con',   name:'Contratos',   desc:'Trabalhos e missões pagas',           ico:'✉',  cls:'ico-con',   free:true,  cat:'Jogo'},
  {id:'pc',    name:'Meu PC',      desc:'Hardware e upgrades',                 ico:'▣',  cls:'ico-pc',    free:true,  cat:'Jogo'},
  {id:'mis',   name:'Missões',     desc:'Lista de missões',                    ico:'☑',  cls:'ico-mis',   free:true,  cat:'Jogo'},
  {id:'ach',   name:'Conquistas',  desc:'Troféus e feitos',                    ico:'★',  cls:'ico-ach',   free:true,  cat:'Jogo'},
  {id:'skl',   name:'Habilidades', desc:'Árvore de skills',                    ico:'⚡', cls:'ico-skl',   free:true,  cat:'Jogo'},
  {id:'inv',   name:'Mochila',     desc:'Itens e ferramentas',                 ico:'▤',  cls:'ico-inv',   free:true,  cat:'Jogo'},
  {id:'files', name:'Arquivos',    desc:'Explorador de arquivos',              ico:'🗂', cls:'ico-files', free:true,  cat:'Produtividade'},
  {id:'web',   name:'Navegador',   desc:'Internet fictícia do Santos',         ico:'🌐', cls:'ico-web',   free:true,  cat:'Utilitários'},
  {id:'prof',  name:'Perfil',      desc:'Seu operador',                        ico:'☻',  cls:'ico-prof',  free:true,  cat:'Sistema'},
  {id:'radar', name:'Radar',       desc:'Radar global de atividade',           ico:'◉',  cls:'ico-radar', free:true,  cat:'Jogo'},
  {id:'city',  name:'Cidade',      desc:'Vista da cidade',                     ico:'🏙', cls:'ico-city',  free:true,  cat:'Jogo'},
  {id:'set',   name:'Ajustes',     desc:'Configurações do sistema',            ico:'⚙',  cls:'ico-set',   free:true,  cat:'Sistema'},
  {id:'face',  name:'Face ID',     desc:'Configurar desbloqueio facial',       ico:'👤', cls:'ico-prof',  free:true,  cat:'Sistema'},
];

const DOCK_IDS = ['term','con','rank','set'];

const APP_TITLES = {
  term:'Terminal', map:'Mapa', loc:'Local', mis:'Missões', con:'Contratos',
  shop:'App Store', pc:'Meu PC', inv:'Mochila', files:'Arquivos', web:'Navegador',
  rank:'Ranking', ach:'Conquistas', skl:'Habilidades', prof:'Perfil', set:'Ajustes',
  chal:'Desafio', radar:'Radar Global', city:'Cidade',
  calc:'Calculadora', clock:'Relógio', notes:'Notas', music:'Música',
  torch:'Lanterna', photos:'Fotos', cal:'Calendário', face:'Face ID'
};

function catalogById(id){ return STORE_CATALOG.find(a=>a.id===id); }

/* ---------- Clocks ---------- */
function updateClocks(){
  const now = new Date();
  const t = now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const d = now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const dCap = d.charAt(0).toUpperCase() + d.slice(1);
  const set = (id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  set('sb-time', t); set('lock-time', t); set('lock-date', dCap); set('home-date', dCap);
  set('clock-big', t); set('clock-date', dCap);
  const sec = now.toLocaleTimeString('pt-BR',{second:'2-digit'});
  set('clock-sec', sec);
}
setInterval(updateClocks, 1000);

/* ---------- Screens ---------- */
function showScreen(id){
  ['lockscreen','homescreen','appshell'].forEach(s=>{
    const el = document.getElementById(s);
    if(el) el.classList.toggle('on', s===id);
  });
  if(id !== 'lockscreen') stopFaceCam();
}

function goHome(){
  currentApp = null;
  document.querySelectorAll('.app-panel').forEach(p=>p.hidden=true);
  document.getElementById('appshell')?.classList.remove('torch-on');
  showScreen('homescreen');
  renderHome();
}

function openApp(id){
  if(!deviceUnlocked) return;
  currentApp = id;
  const title = APP_TITLES[id] || id;
  const tEl = document.getElementById('app-title');
  if(tEl) tEl.textContent = title;

  document.querySelectorAll('.app-panel').forEach(p=>p.hidden=true);
  let panel = document.getElementById('b-'+id);
  if(!panel){
    // create on the fly for dynamic apps
    panel = document.createElement('div');
    panel.id = 'b-'+id;
    panel.className = 'app-panel';
    document.getElementById('app-body')?.appendChild(panel);
  }
  panel.hidden = false;

  if(id === 'term'){
    // keep static terminal
  } else if(id === 'shop'){
    panel.innerHTML = renderStore();
  } else if(id === 'music'){
    panel.innerHTML = renderMusic();
  } else if(id === 'face'){
    panel.innerHTML = renderFaceSetup();
  } else if(typeof RENDER !== 'undefined' && RENDER[id]){
    try{ panel.innerHTML = RENDER[id](); }catch(e){ console.warn(e); }
  } else if(MINI[id]){
    try{ panel.innerHTML = MINI[id](); }catch(e){ console.warn(e); }
  } else {
    panel.innerHTML = `<p class="dim">App em construção.</p>`;
  }

  if(id==='radar' && typeof Radar!=='undefined') try{ Radar.mount(); }catch(e){}
  if(id==='city' && typeof City!=='undefined') try{ City.mount(); }catch(e){}
  if(id==='rank' && typeof NET!=='undefined'){
    NET.submit?.().then(()=>NET.fetchBoard?.()).then(()=>{
      if(RENDER?.rank && panel) panel.innerHTML = RENDER.rank();
    }).catch(()=>{});
  }
  if(id==='term'){
    const term = document.getElementById('term');
    if(term && !term.dataset.booted){
      term.dataset.booted='1';
      if(typeof out==='function'){
        out('SANTOS OS [build '+(typeof BUILD!=='undefined'?BUILD:'0.3')+']','ok');
        out('Operador: '+(s&&s.name?s.name:'guest')+' • ambiente fictício.','dim');
        out('Digite help para ver os comandos.','dim');
      }
    }
  }

  showScreen('appshell');
  if(typeof render==='function') render();
}

/* ---------- Home ---------- */
function renderHome(){
  loadInstalled();
  const grid = document.getElementById('app-grid');
  const dock = document.getElementById('dock');
  if(!grid) return;

  const iconHTML = a => {
    const c = catalogById(a) || {id:a, name:a, ico:'•', cls:''};
    return `<button class="app-icon" data-app="${c.id}">
      <div class="ico ${c.cls}">${c.ico}</div>
      <span class="lbl">${c.name}</span>
    </button>`;
  };

  const homeIds = installedApps.filter(id => !DOCK_IDS.includes(id));
  grid.innerHTML = homeIds.map(iconHTML).join('');
  if(dock) dock.innerHTML = DOCK_IDS.filter(id => installedApps.includes(id)).map(iconHTML).join('');
}

/* ---------- Lock / PIN / Face ID ---------- */
function updatePinDots(){
  document.querySelectorAll('#pin-dots span').forEach((d,i)=> d.classList.toggle('filled', i < pinBuf.length));
}

function unlockDevice(){
  deviceUnlocked = true;
  pinBuf = '';
  updatePinDots();
  stopFaceCam();
  showScreen('homescreen');
  renderHome();
  if(typeof Music!=='undefined' && Music.sync) Music.sync();
  if(typeof toast==='function') toast('Desbloqueado');
}

function pinPress(key){
  const msg = document.getElementById('pin-msg');
  if(key==='del'){ pinBuf = pinBuf.slice(0,-1); updatePinDots(); return; }
  if(key==='ok'){
    if(pinBuf === PIN_CODE) unlockDevice();
    else {
      pinBuf = ''; updatePinDots();
      if(msg){ msg.textContent = 'Código incorreto'; msg.style.color='#ff7a7a';
        setTimeout(()=>{ msg.textContent='Código: 1234  ·  ou use Face ID'; msg.style.color=''; },1800);
      }
    }
    return;
  }
  if(pinBuf.length>=4) return;
  pinBuf += key;
  updatePinDots();
  if(pinBuf.length===4) setTimeout(()=>pinPress('ok'), 160);
}

function stopFaceCam(){
  if(faceStream){
    faceStream.getTracks().forEach(t=>t.stop());
    faceStream = null;
  }
  const v = document.getElementById('face-video');
  if(v) v.srcObject = null;
}

async function startFaceUnlock(){
  const box = document.getElementById('face-box');
  const msg = document.getElementById('pin-msg');
  if(!box) return;
  box.innerHTML = `<div class="face-frame"><video id="face-video" autoplay playsinline muted></video><div class="face-ring"></div><p class="face-status">Olhe para a câmera…</p></div>`;
  box.classList.add('on');
  try{
    faceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    const v = document.getElementById('face-video');
    if(v) v.srcObject = faceStream;
    // Simulated scan (no real biometrics — fictional)
    setTimeout(()=>{
      const st = document.querySelector('.face-status');
      if(st) st.textContent = 'Reconhecendo…';
    }, 900);
    setTimeout(()=>{
      const st = document.querySelector('.face-status');
      if(st){ st.textContent = 'Face ID OK'; st.style.color = 'var(--g)'; }
      setTimeout(()=>{ unlockDevice(); box.classList.remove('on'); box.innerHTML=''; }, 600);
    }, 2200);
  }catch(err){
    if(msg) msg.textContent = 'Câmera negada — use o código 1234';
    box.classList.remove('on');
    box.innerHTML = '';
    if(typeof toast==='function') toast('Permissão de câmera necessária para Face ID');
  }
}

function bindPhone(){
  document.getElementById('lock-pad')?.addEventListener('click', e=>{
    const b = e.target.closest('[data-pin]');
    if(b) pinPress(b.dataset.pin);
  });

  document.getElementById('face-btn')?.addEventListener('click', ()=> startFaceUnlock());

  document.addEventListener('click', e=>{
    const icon = e.target.closest('[data-app]');
    if(icon){ e.preventDefault(); openApp(icon.dataset.app); }

    const inst = e.target.closest('[data-install]');
    if(inst){
      e.preventDefault();
      const id = inst.dataset.install;
      if(!installedApps.includes(id)){
        installedApps.push(id);
        saveInstalled();
        if(typeof toast==='function') toast('App instalado');
        if(currentApp==='shop') openApp('shop');
        renderHome();
      }
    }
    const uninst = e.target.closest('[data-uninstall]');
    if(uninst){
      e.preventDefault();
      const id = uninst.dataset.uninstall;
      if(DOCK_IDS.includes(id) || id==='shop' || id==='term'){
        if(typeof toast==='function') toast('App do sistema não pode ser removido');
        return;
      }
      installedApps = installedApps.filter(x=>x!==id);
      saveInstalled();
      if(typeof toast==='function') toast('App removido');
      if(currentApp==='shop') openApp('shop');
      renderHome();
    }
  });

  document.getElementById('app-back')?.addEventListener('click', ()=>goHome());
  document.getElementById('app-home')?.addEventListener('click', ()=>goHome());
  document.getElementById('home-indicator')?.addEventListener('click', ()=>{ if(currentApp) goHome(); });
}

/* ---------- App Store ---------- */
function renderStore(){
  loadInstalled();
  const cats = [...new Set(STORE_CATALOG.map(a=>a.cat))];
  let html = `<div class="store-hero"><b>App Store</b><span>Santos OS • apps fictícios</span></div>`;
  cats.forEach(cat=>{
    html += `<h3 class="store-cat">${esc(cat)}</h3>`;
    STORE_CATALOG.filter(a=>a.cat===cat).forEach(a=>{
      const on = installedApps.includes(a.id);
      html += `<div class="store-row">
        <div class="ico ${a.cls}" style="width:48px;height:48px;border-radius:12px;font-size:22px;flex:none">${a.ico}</div>
        <div class="store-info"><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div>
        ${on
          ? `<button class="store-btn on" data-uninstall="${a.id}">Remover</button>`
          : `<button class="store-btn" data-install="${a.id}">Obter</button>`}
      </div>`;
    });
  });
  return html;
}

/* ---------- Music app ---------- */
const TRACKS = [
  {id:'amb',  name:'Trilha Ambiente', artist:'Santos Lab',  type:'mp3'},
  {id:'gen',  name:'Pad Noturno',     artist:'Gerado',      type:'gen'},
  {id:'pulse',name:'Pulse Hacker',    artist:'Gerado',      type:'gen2'},
  {id:'rain', name:'Chuva no Lab',    artist:'Gerado',      type:'gen3'},
];
let currentTrack = 0;

function renderMusic(){
  const tr = TRACKS[currentTrack] || TRACKS[0];
  const playing = typeof Music!=='undefined' && Music.isPlaying && Music.isPlaying();
  return `<div class="music-player">
    <div class="music-art">♫</div>
    <div class="music-title">${esc(tr.name)}</div>
    <div class="music-sub">${esc(tr.artist)} • Faixa ${currentTrack+1}/${TRACKS.length}</div>
    <div class="music-controls">
      <button data-fn="musprev">⏮</button>
      <button class="play" data-fn="mustog">${playing?'⏸':'▶'}</button>
      <button data-fn="musnext">⏭</button>
    </div>
    <div class="track-list">
      ${TRACKS.map((t,i)=>`<button class="track-row ${i===currentTrack?'on':''}" data-fn="mustrack:${i}">
        <span>${esc(t.name)}</span><small>${esc(t.artist)}</small>
      </button>`).join('')}
    </div>
    <p class="dim" style="margin-top:16px;font-size:12px">Faixas originais / geradas no dispositivo.<br>Nenhuma música comercial é usada.</p>
  </div>`;
}

/* ---------- Face ID setup app ---------- */
function renderFaceSetup(){
  return `<div style="text-align:center;padding:24px 12px">
    <div style="font-size:64px;margin-bottom:12px">👤</div>
    <h2>Face ID</h2>
    <p class="dim">Desbloqueio facial <b>fictício</b>. Usa a câmera só para a animação de scan — nenhum dado biométrico é guardado.</p>
    <button class="primary" data-fn="facetest" style="margin-top:20px">Testar Face ID</button>
    <p class="dim" style="margin-top:16px;font-size:12px">Na tela de bloqueio, toque no ícone de rosto para usar.</p>
  </div>`;
}

/* ---------- Mini apps ---------- */
const MINI = {};

MINI.calc = ()=>`<div class="calc-grid" id="calc-ui">
  <div class="calc-display" id="calc-disp">0</div>
  <button data-c="C">C</button><button data-c="±">±</button><button data-c="%">%</button><button class="op" data-c="/">÷</button>
  <button data-c="7">7</button><button data-c="8">8</button><button data-c="9">9</button><button class="op" data-c="*">×</button>
  <button data-c="4">4</button><button data-c="5">5</button><button data-c="6">6</button><button class="op" data-c="-">−</button>
  <button data-c="1">1</button><button data-c="2">2</button><button data-c="3">3</button><button class="op" data-c="+">+</button>
  <button data-c="0" style="grid-column:span 2;border-radius:36px;aspect-ratio:auto">0</button>
  <button data-c=".">.</button><button class="eq" data-c="=">=</button>
</div>`;

let calcVal='0', calcOp=null, calcPrev=null, calcNew=true;
function calcClick(k){
  const d = document.getElementById('calc-disp'); if(!d) return;
  if(k==='C'){ calcVal='0'; calcOp=null; calcPrev=null; calcNew=true; }
  else if(k==='±'){ calcVal = String(-(parseFloat(calcVal)||0)); }
  else if(k==='%'){ calcVal = String((parseFloat(calcVal)||0)/100); }
  else if(['+','-','*','/'].includes(k)){
    if(calcOp && !calcNew) calcEquals();
    calcPrev = parseFloat(calcVal); calcOp=k; calcNew=true;
  } else if(k==='='){ calcEquals(); }
  else if(k==='.'){ if(calcNew){ calcVal='0.'; calcNew=false; } else if(!calcVal.includes('.')) calcVal+='.'; }
  else { if(calcNew){ calcVal=k; calcNew=false; } else { if(calcVal==='0') calcVal=k; else calcVal+=k; } }
  d.textContent = calcVal.length>12 ? parseFloat(calcVal).toExponential(6) : calcVal;
}
function calcEquals(){
  if(calcOp==null || calcPrev==null) return;
  const b = parseFloat(calcVal); let r = calcPrev;
  if(calcOp==='+') r+=b; else if(calcOp==='-') r-=b; else if(calcOp==='*') r*=b; else if(calcOp==='/' && b!==0) r/=b;
  calcVal = String(Math.round(r*1e10)/1e10); calcOp=null; calcPrev=null; calcNew=true;
}

MINI.clock = ()=>{
  const now = new Date();
  const t = now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const d = now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return `<div class="clock-face"><div class="clock-big" id="clock-big">${t}</div><div class="clock-sec" id="clock-sec"></div><div class="clock-date" id="clock-date">${d}</div></div>`;
};

MINI.notes = ()=>{
  const txt = (s && s.docs && s.docs['notas.txt']) || '';
  return `<p class="dim" style="margin-bottom:8px">Notas salvas no progresso</p>
    <textarea class="notes-area" id="notes-area" placeholder="Escreva aqui...">${typeof esc==='function'?esc(txt):txt}</textarea>
    <button class="primary" data-fn="savenotes" style="margin-top:12px">Salvar notas</button>`;
};

MINI.torch = ()=>`<div style="text-align:center;padding:40px 0">
  <p class="dim" style="margin-bottom:20px">Toque para ligar / desligar</p>
  <button class="torch-btn" id="torch-btn" data-fn="torch">🔦</button>
  <p id="torch-state" class="dim" style="margin-top:16px">Desligada</p>
</div>`;

MINI.photos = ()=>`<h2>Fotos</h2><p class="dim">Galeria fictícia</p>
  <div class="grid2" style="margin-top:12px">
    <div class="card" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(145deg,#1a3a28,#0a1a12)">🖼</div>
    <div class="card" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(145deg,#2a1a30,#120a18)">🌃</div>
    <div class="card" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(145deg,#1a2a3a,#0a1218)">📡</div>
    <div class="card" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(145deg,#3a2a1a,#18120a)">🗺</div>
  </div>
  <p class="dim" style="margin-top:16px;font-size:12px">Nenhuma foto real é armazenada.</p>`;

MINI.cal = ()=>{
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();
  const names = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  let cells = '';
  for(let i=0;i<first;i++) cells += '<div></div>';
  for(let d=1;d<=days;d++){
    const isToday = d===now.getDate();
    cells += `<div style="padding:8px;text-align:center;border-radius:50%;${isToday?'background:var(--g);color:#050907;font-weight:700':''}">${d}</div>`;
  }
  return `<h2>${months[m]} ${y}</h2>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:12px;text-align:center;color:var(--m);margin-bottom:6px">${names.map(n=>`<div>${n}</div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:14px">${cells}</div>`;
};

/* UIFN extras */
if(typeof UIFN === 'undefined') window.UIFN = {};
UIFN.savenotes = ()=>{
  const ta = document.getElementById('notes-area');
  if(ta && s){ s.docs = s.docs||{}; s.docs['notas.txt'] = ta.value.slice(0,4000); if(typeof persist==='function') persist(); if(typeof toast==='function') toast('Notas salvas'); }
};
UIFN.mustog = ()=>{
  if(typeof Music==='undefined') return;
  if(Music.isPlaying && Music.isPlaying()){ Music.stop(); }
  else { if(s) s.set.music = true; Music.sync && Music.sync(); Music.start && Music.start(); }
  if(currentApp==='music') openApp('music');
};
UIFN.musprev = ()=>{ currentTrack = (currentTrack - 1 + TRACKS.length) % TRACKS.length; applyTrack(); if(currentApp==='music') openApp('music'); };
UIFN.musnext = ()=>{ currentTrack = (currentTrack + 1) % TRACKS.length; applyTrack(); if(currentApp==='music') openApp('music'); };
UIFN.mustrack = (i)=>{ currentTrack = +i || 0; applyTrack(); if(currentApp==='music') openApp('music'); };
UIFN.torch = ()=>{
  const shell = document.getElementById('appshell');
  const btn = document.getElementById('torch-btn');
  const st = document.getElementById('torch-state');
  const on = shell && shell.classList.toggle('torch-on');
  if(btn) btn.classList.toggle('on', !!on);
  if(st) st.textContent = on ? 'Ligada' : 'Desligada';
};
UIFN.facetest = ()=>{ goHome(); showScreen('lockscreen'); setTimeout(()=>startFaceUnlock(), 300); };

function applyTrack(){
  const tr = TRACKS[currentTrack];
  if(!tr || typeof Music==='undefined' || !s) return;
  if(tr.type==='mp3') s.set.track = 'mp3';
  else s.set.track = 'gen';
  s.set.music = true;
  if(typeof persist==='function') persist();
  Music.stop && Music.stop();
  Music.sync && Music.sync();
  Music.start && Music.start();
}

document.addEventListener('click', e=>{
  const b = e.target.closest('#calc-ui [data-c]');
  if(b) calcClick(b.dataset.c);
});

/* Compat */
function openWin(id){ openApp(id); }
function focusWin(id){ openApp(id); }
function minWin(){ goHome(); }
function layout(){}
function buildWindows(){}
function fillBoard(){ renderHome(); }

function enterDevice(){
  deviceUnlocked = false;
  pinBuf = '';
  loadInstalled();
  updatePinDots();
  updateClocks();
  showScreen('lockscreen');
  const dev = document.getElementById('device');
  if(dev) dev.style.display = 'flex';
  document.getElementById('auth')?.classList.remove('on');
  document.getElementById('home')?.classList.remove('on');
}

window.openApp = openApp;
window.goHome = goHome;
window.enterDevice = enterDevice;
window.openWin = openWin;
window.focusWin = focusWin;
window.renderHome = renderHome;
window.bindPhone = bindPhone;
