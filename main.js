'use strict';
/* INICIALIZAÇÃO — Santos OS Dispositivo Virtual */
let READY = false, INTRO = false;

function bindOnce(){
  if(READY) return;
  READY = true;
  const form = document.getElementById('form');
  if(form) form.onsubmit = e => {
    e.preventDefault();
    const v = document.getElementById('cmd')?.value || '';
    if(document.getElementById('cmd')) document.getElementById('cmd').value = '';
    if(typeof run === 'function') run(v);
  };
  document.querySelectorAll('[data-c]').forEach(b => {
    b.onclick = () => { if(typeof run === 'function') run(b.dataset.c); };
  });
  const cmd = document.getElementById('cmd');
  if(cmd) cmd.onkeydown = e => {
    if(typeof hist === 'undefined') return;
    if(e.key === 'ArrowUp' && hist.length){
      e.preventDefault(); hi = Math.max(0, hi-1); cmd.value = hist[hi];
    } else if(e.key === 'ArrowDown' && hist.length){
      e.preventDefault(); hi = Math.min(hist.length, hi+1); cmd.value = hist[hi] || '';
    }
  };
}

function enterDesktop(){
  // Agora entra no dispositivo virtual
  bindOnce();
  if(typeof normUI === 'function') normUI();
  if(typeof applySettings === 'function') applySettings();
  if(typeof sel !== 'undefined') sel = s.loc;
  if(typeof endActive === 'function') endActive();

  document.getElementById('auth')?.classList.remove('on');
  document.getElementById('home')?.classList.remove('on');

  if(typeof enterDevice === 'function') enterDevice();
  else {
    // fallback
    document.getElementById('lockscreen')?.classList.add('on');
  }

  if(typeof check === 'function') check();
  if(typeof checkAch === 'function') checkAch();
  if(typeof persist === 'function') persist();
  if(typeof Music !== 'undefined' && Music.sync) Music.sync();
  if(typeof NET !== 'undefined' && NET.submit) NET.submit();

  if(!INTRO){
    INTRO = true;
    playIntro();
  }
}

function playIntro(){
  const bt = document.getElementById('boot');
  if(!bt) return;
  bt.innerHTML = '';
  bt.classList.remove('out');
  const lines = [
    'SANTOS OS v0.3.0 ....... OK',
    'Carregando módulos de simulação ....... OK',
    'Iniciando dispositivo virtual ....... OK',
    'Bem-vindo, operador.'
  ];
  let i = 0;
  const iv = setInterval(() => {
    if(i < lines.length) bt.insertAdjacentHTML('beforeend', '<div>' + (typeof esc==='function'?esc(lines[i++]):lines[i++]) + '</div>');
    else {
      clearInterval(iv);
      setTimeout(() => bt.classList.add('out'), 400);
    }
  }, 240);
}

function boot(){
  if(typeof buildWindows === 'function') buildWindows();
  if(typeof bindGlobal === 'function') bindGlobal();
  if(typeof bindPhone === 'function') bindPhone();
  if(typeof initAuth === 'function') initAuth();
  if(typeof NET !== 'undefined' && NET.probe) NET.probe();
  if(typeof updateClocks === 'function') updateClocks();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
