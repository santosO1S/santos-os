'use strict';
/* ============================================================
   MÚSICA DE FUNDO — gerada no navegador (Web Audio API).
   Não usa arquivos de áudio nem serviços externos: é uma trilha
   ambiente original, com acordes lentos e notas pentatônicas.
   Navegadores exigem um toque do jogador antes de tocar som;
   por isso a música começa no primeiro toque após entrar.
   ============================================================ */
/* caminho do MP3 (o build de arquivo único troca por dados embutidos) */
let MUSIC_ERR='';
const TRACK_SRC='assets/shs_trilha_ambiente.mp3';
const Music=(()=>{
 let AUD=null;
 let ctx=null,master=null,filt=null,delay=null,pad=[],arpIv=null,chordIv=null,on=false,ci=0;
 /* acordes (Am, F, C, G) em frequências de vozes: grave, meio, agudo */
 const CH=[[110,164.81,220],[87.31,130.81,174.61],[130.81,164.81,196],[98,146.83,196]];
 /* escala de Lá menor pentatônica */
 const SC=[220,261.63,293.66,329.63,392,440,523.25,587.33,659.25];
 const gainVal=()=>clamp(s.set.vol,0,100)/100*0.5;

 function build(){
  ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  filt=ctx.createBiquadFilter();filt.type='lowpass';filt.frequency.value=700;filt.Q.value=0.7;filt.connect(master);
  /* lenta variação do filtro: o som "respira" */
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=0.06;lg.gain.value=250;lfo.connect(lg);lg.connect(filt.frequency);lfo.start();
  /* pad: três vozes levemente desafinadas */
  for(let i=0;i<3;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.detune.value=(i-1)*7;o.frequency.value=CH[0][i];g.gain.value=0.035;o.connect(g);g.connect(filt);o.start();pad.push(o)}
  /* eco suave para as notas do arpejo */
  delay=ctx.createDelay(1.5);delay.delayTime.value=0.42;
  const fb=ctx.createGain();fb.gain.value=0.38;const dl=ctx.createBiquadFilter();dl.type='lowpass';dl.frequency.value=2200;
  delay.connect(fb);fb.connect(dl);dl.connect(delay);dl.connect(master);
 }
 function note(t){const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=SC[Math.floor(Math.random()*SC.length)];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.05,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.9);
  o.connect(g);g.connect(master);g.connect(delay);o.start(t);o.stop(t+1)}

 /* play() pode falhar. Mostra o motivo ao jogador e, se o MP3 não for suportado, troca para a trilha gerada */
 function playSafe(a){try{const p=a.play();if(p&&p.then)p.then(()=>{MUSIC_ERR=''}).catch(err=>{
   if(err&&err.name==='NotSupportedError'&&s.set.track==='mp3'){s.set.track='gen';save();toast('Este aparelho não toca o MP3. Usando a trilha gerada.');sync();return}
   MUSIC_ERR=err&&err.name==='NotAllowedError'?'O navegador bloqueou o som. Toque em "Testar som" em Config.':'Não foi possível tocar a música ('+(err&&err.name||'erro')+').';
   toast('🔇 '+MUSIC_ERR)})}catch(e){}}
 function mp3(){if(!AUD){AUD=new Audio(TRACK_SRC);AUD.loop=true;AUD.preload='auto'}return AUD}
 function isPlaying(){return on||(!!AUD&&!AUD.paused)}
 function stopGen(){if(!on&&!ctx)return;on=false;clearInterval(arpIv);clearInterval(chordIv);arpIv=chordIv=null;
  if(ctx)master.gain.setTargetAtTime(0,ctx.currentTime,0.3)}
 function start(){
  if(!s.set.music||!KEY)return;
  if(s.set.track==='mp3'){stopGen();const a=mp3();a.volume=clamp(s.set.vol,0,100)/100;if(a.paused)playSafe(a);return}
  if(AUD)AUD.pause();
  try{if(!ctx)build();if(ctx.state==='suspended')ctx.resume()}catch(e){return}
  if(!on){on=true;
   arpIv=setInterval(()=>{if(on&&Math.random()<0.55)note(ctx.currentTime+0.02)},380);
   chordIv=setInterval(()=>{ci=(ci+1)%CH.length;pad.forEach((o,i)=>o.frequency.setTargetAtTime(CH[ci][i],ctx.currentTime,1.2))},8000)}
  master.gain.setTargetAtTime(gainVal(),ctx.currentTime,0.6)}
 function stop(){stopGen();if(AUD)AUD.pause()}
 /* aplica a preferência salva (ligada/desligada, trilha e volume) */
 function sync(){if(s.set.music&&KEY)start();else stop()}

 /* primeiro toque libera o áudio; depois de entrar no desktop a música começa */
 document.addEventListener('pointerdown',()=>{if(!isPlaying()&&KEY&&s.set.music)start()});
 document.addEventListener('visibilitychange',()=>{
  if(ctx){if(document.hidden)ctx.suspend();else if(on)ctx.resume()}
  if(AUD){if(document.hidden)AUD.pause();else if(s.set.track==='mp3'&&s.set.music&&KEY)playSafe(AUD)}});
 /* botão Testar som: toque direto, sempre dentro de um clique */
 function test(){s.set.music=true;if(!KEY)return;
  if(s.set.track==='mp3'){const a=mp3();a.volume=clamp(s.set.vol,0,100)/100;playSafe(a)}else{start()}
  setTimeout(()=>{toast(MUSIC_ERR||'🎵 Se você ouviu a música, está tudo certo.')},400)}
 return{start,stop,sync,test,isPlaying,err:()=>MUSIC_ERR};
})();
