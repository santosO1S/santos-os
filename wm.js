'use strict';
/* ============================================================
   WM COMPAT — ponte entre o sistema antigo de janelas e o
   novo dispositivo virtual (phone.js). Mantém APPS, RENDER hooks
   e funções que o restante do código ainda chama.
   ============================================================ */

const APPS = [
  ['term','Terminal','▮',[560,520]],
  ['map','Mapa','◎',[420,600]],
  ['loc','Local','⌂',[400,540]],
  ['mis','Missões','☑',[420,540]],
  ['con','Contratos','✉',[440,560]],
  ['shop','Loja','$',[440,520]],
  ['pc','Meu PC','▣',[420,520]],
  ['inv','Mochila','▤',[380,420]],
  ['files','Arquivos','🗂',[460,480]],
  ['web','Navegador','🌐',[520,520]],
  ['rank','Ranking','♛',[380,460]],
  ['ach','Conquistas','★',[400,500]],
  ['skl','Habilidades','⚡',[400,520]],
  ['prof','Perfil','☻',[400,520]],
  ['set','Config','⚙',[420,560]],
  ['radar','Radar Global','◉',[460,560]],
  ['city','Cidade','🏙',[460,520]],
  ['chal','Desafio','◆',[540,600],1]
];

const APPAL = {
  terminal:'term', mapa:'map', local:'loc', lugar:'loc', missoes:'mis', missions:'mis',
  contratos:'con', contracts:'con', loja:'shop', pc:'pc', hardware:'pc', computador:'pc',
  mochila:'inv', inventory:'inv', arquivos:'files', explorador:'files', files:'files',
  navegador:'web', browser:'web', internet:'web', ranking:'rank', conquistas:'ach',
  achievements:'ach', habilidades:'skl', skills:'skl', perfil:'prof', profile:'prof',
  status:'prof', config:'set', configuracoes:'set', settings:'set', desafio:'chal',
  cidade:'city', city:'city', radar:'radar'
};

const isMob = () => true;
const W = id => document.getElementById('w-'+id) || document.getElementById('b-'+id);
const raf = window.requestAnimationFrame ? f => requestAnimationFrame(f) : f => setTimeout(f,16);

function normUI(){
  if(!s.ui || typeof s.ui !== 'object') s.ui = {};
  ['open','order','min','max'].forEach(k => {
    if(!Array.isArray(s.ui[k])) s.ui[k] = [];
  });
  if(!s.ui.pos || typeof s.ui.pos !== 'object') s.ui.pos = {};
}

function renderApp(id){
  const f = typeof RENDER !== 'undefined' ? RENDER[id] : null;
  const b = document.getElementById('b-'+id);
  if(!f || !b) return;
  try { b.innerHTML = f(); } catch(e){ console.warn('renderApp', id, e); }
}

function renderNow(){
  if(typeof currentApp !== 'undefined' && currentApp) renderApp(currentApp);
  if(typeof updateClocks === 'function') updateClocks();
  // tray info
  const ti = document.getElementById('tinfo');
  if(ti && typeof level === 'function') ti.innerHTML = `<b>Nv ${level()}</b> • $${s.cash}`;
}

let rq = 0;
function render(){
  if(rq) return;
  rq = 1;
  raf(() => { rq = 0; renderNow(); });
}

function openWin(id){
  if(typeof openApp === 'function') openApp(id);
  else console.warn('openApp not ready', id);
}

function focusWin(id){ openWin(id); }
function minWin(){ if(typeof goHome === 'function') goHome(); }
function layout(){}
function buildWindows(){}
function fillBoard(){ if(typeof renderHome === 'function') renderHome(); }

function tray(){ renderNow(); }
function trayRender(){}
function notifRender(){
  const nf = document.getElementById('notif');
  if(!nf || !s || !s.ntf) return;
  nf.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="ok">NOTIFICAÇÕES</b></div>` +
    (s.ntf.length ? s.ntf.map(x => `<p>${typeof esc==='function'?esc(x.m):x.m}<small>${new Date(x.t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></p>`).join('') : '<p class="dim">Nada por aqui.</p>');
}

function applySettings(){
  const b = document.body, t = s.set || {};
  b.classList.toggle('fx', !!t.fx);
  b.classList.toggle('noglow', !t.glow);
  b.classList.toggle('noanim', !t.anim);
  document.documentElement.style.setProperty('--fs', (t.font||14)+'px');
}

function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('on'), 2600);
}

function dlg(title, lines){
  const el = document.getElementById('dlg');
  if(!el) return;
  el.querySelector('h3').textContent = title || '';
  el.querySelector('.bd').innerHTML = (lines||[]).map(x => {
    if(Array.isArray(x)) return `<div class="${x[1]||''}">${typeof esc==='function'?esc(x[0]):x[0]}</div>`;
    return `<div>${typeof esc==='function'?esc(x):x}</div>`;
  }).join('');
  el.classList.add('on');
}

let unread = 0;

function bindGlobal(){
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fn]');
    if(f){
      const raw = f.dataset.fn;
      const i = raw.indexOf(':');
      const n = i < 0 ? raw : raw.slice(0,i);
      const arg = i < 0 ? '' : raw.slice(i+1);
      if(typeof UIFN !== 'undefined' && UIFN[n]){ e.preventDefault(); UIFN[n](arg, f, e); }
      if(n === 'dlgx') document.getElementById('dlg')?.classList.remove('on');
      if(n === 'open') openWin(arg);
    }
    const c = e.target.closest('[data-c]');
    if(c && typeof run === 'function'){ e.preventDefault(); run(c.dataset.c); }
  });

  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-form]');
    if(f && typeof FORMS !== 'undefined' && FORMS[f.dataset.form]){
      e.preventDefault();
      FORMS[f.dataset.form](f, e);
    }
    if(e.target.id === 'form' && typeof run === 'function'){
      e.preventDefault();
      const v = document.getElementById('cmd')?.value || '';
      document.getElementById('cmd').value = '';
      run(v);
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      document.getElementById('dlg')?.classList.remove('on');
      document.getElementById('notif')?.classList.remove('on');
      if(typeof currentApp !== 'undefined' && currentApp) goHome();
    }
  });
}

/* UIFN base */
if(typeof UIFN === 'undefined') window.UIFN = {};
UIFN.dlgx = () => document.getElementById('dlg')?.classList.remove('on');
UIFN.open = (arg) => openWin(arg);
UIFN.chx = () => { if(typeof endActive==='function') endActive(); goHome(); };
UIFN.prac = (t) => { if(typeof practice==='function') practice(t); };
UIFN.clrn = () => { if(s) s.ntf = []; notifRender(); };

setInterval(tray, 15000);
