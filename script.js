(()=>{
const $=id=>document.getElementById(id);
const cv=$('c'),cx=cv.getContext('2d'),stage=$('screen-wrap'),opv=$('opv');
let W=0,H=0,DPR=1,paused=false,mute=false,AC=null,bgmOn=false,beatT=0,beat=0;
const K={l:0,r:0,u:0,d:0};
const titleImg=new Image();titleImg.src='images/title.webp';
let best=0,cleared=false;
try{mute=localStorage.getItem('tg.248.mute')==='1';}catch(e){}
try{best=+localStorage.getItem('tg.248.best')||0;cleared=localStorage.getItem('tg.248.cleared')==='1';}catch(e){}

function resize(){
  const r=stage.getBoundingClientRect();DPR=Math.min(window.devicePixelRatio||1,2);
  W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;cx.setTransform(DPR,0,0,DPR,0,0);
  cv.dataset.logicalWidth=String(Math.round(W));cv.dataset.logicalHeight=String(Math.round(H));
}
window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);resize();

const C={sky:'#221436',sky2:'#3a2458',moon:'#f3e3a6',wood:'#4a3428',wood2:'#2a1c14',
  paper:'#f4e0b8',tatami:'#7a8a4a',tatami2:'#6a7a3c',teal:'#3c7d70',teal2:'#2a5a50',
  purple:'#6b3d78',purple2:'#4a2858',lamp:'#f0d48a',ink:'#f4eee0',hair:'#1a1420',
  skin:'#e8c4a0',blood:'#c4453c',red:'#a83038',ghost:'#c8e8d8'};

function pix(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));}
function gy(){return H*0.78;}
function S(){return Math.max(1.6, Math.min(W/360,H/640)*2.2);}

function unlock(){
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);
  }catch(e){AC=null;}
}
function tone(f0,f1,dur,type,vol,delay){
  if(!AC||mute)return;
  try{
    const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f0,t);
    if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.08,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AC.destination);
    o.start(t);o.stop(t+dur+0.02);
  }catch(e){}
}
function noise(dur,vol,hz){
  if(!AC||mute)return;
  try{
    const n=Math.floor(AC.sampleRate*dur),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
    const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=b;f.type='bandpass';f.frequency.value=hz||1400;g.gain.value=vol||0.12;
    src.connect(f);f.connect(g);g.connect(AC.destination);src.start();
  }catch(e){}
}
const sfx={
  slash(){noise(0.12,0.14,2400);tone(880,240,0.1,'sawtooth',0.05);},
  hit(){noise(0.16,0.22,700);tone(180,70,0.14,'square',0.08);},
  hurt(){tone(220,90,0.18,'square',0.09);},
  jump(){tone(320,720,0.12,'triangle',0.06);},
  ok(){tone(520,780,0.08,'square',0.07);},
  win(){[523,659,784,1046].forEach((f,i)=>tone(f,f,0.18,'square',0.1,i*0.1));},
  lose(){[392,330,262,196].forEach((f,i)=>tone(f,f,0.22,'triangle',0.08,i*0.12));}
};
function startBgm(){
  if(!AC||mute||bgmOn)return;bgmOn=true;beatT=0;beat=0;
}
function stopBgm(){bgmOn=false;}
function tickBgm(dt){
  if(!bgmOn||!AC||mute)return;
  beatT+=dt;if(beatT<0.42)return;beatT=0;beat++;
  const bass=[98,98,130.8,87.3][beat%4];
  tone(bass,bass,0.28,'triangle',0.05);
  const mel=[392,440,523,392,349,392,0,523][beat%8];
  if(mel)tone(mel,mel,0.18,'square',0.035);
  if(beat%2===0)noise(0.05,0.04,2400);
}

function setMute(v){
  mute=v;
  try{localStorage.setItem('tg.248.mute',mute?'1':'0');}catch(e){}
  $('btnMute').textContent=mute?'🔇':'♪';
  if($('btnMuteDlg'))$('btnMuteDlg').textContent=mute?'音: オフ':'音: オン';
  if(opv)opv.muted=mute;
  if(mute)stopBgm();else if(G&&(G.mode==='talk'||G.mode==='play'||G.mode==='title'))startBgm();
}
function bindTap(el,handler){
  if(!el)return;
  const fire=e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(err){}
    el.classList.add('is-pressed');if(navigator.vibrate)navigator.vibrate(14);handler(e);};
  const release=()=>el.classList.remove('is-pressed');
  el.addEventListener('pointerdown',fire);
  el.addEventListener('pointerup',release);
  el.addEventListener('pointercancel',release);
}
function bindHold(el,on,off){
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(err){}
    el.classList.add('is-pressed');if(navigator.vibrate)navigator.vibrate(12);on();});
  const end=()=>{el.classList.remove('is-pressed');off();};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
}
function bindDpad(el){
  const set=e=>{
    const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;
    K.l=x<-0.12?1:0;K.r=x>0.12?1:0;K.u=y<-0.12?1:0;K.d=y>0.12?1:0;
    el.classList.toggle('press-l',K.l);el.classList.toggle('press-r',K.r);
    el.classList.toggle('press-u',K.u);el.classList.toggle('press-d',K.d);
  };
  const clear=()=>{K.l=K.r=K.u=K.d=0;el.classList.remove('press-l','press-r','press-u','press-d');};
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(err){}set(e);});
  el.addEventListener('pointermove',e=>{if(el.hasPointerCapture(e.pointerId))set(e);});
  el.addEventListener('pointerup',clear);el.addEventListener('pointercancel',clear);
}

let lastTouchEnd=0;
document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTouchEnd<=300)e.preventDefault();lastTouchEnd=now;},{passive:false});
document.addEventListener('touchmove',e=>{if(e.target.closest('[data-scrollable]'))return;e.preventDefault();},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('selectstart',e=>e.preventDefault());

const ROOMS=[
  {id:'desk',kind:'talk',place:'帳場',bg:'room',lines:[
    {w:'女将',t:'塩見の館へようこそ。'},
    {w:'女将',t:'遠いところを、ようおいでくださいました。'},
    {w:'剣士',t:'……人が、おらんようだが。'},
    {w:'女将',t:'今夜は月が欠けておりますゆえ。お茶をどうぞ。'}
  ],choice:true,next:1},
  {id:'guest',kind:'talk',place:'客間',bg:'room',lines:[
    {w:'剣士',t:'帳場に戻ると、女将の姿がない。'},
    {w:'剣士',t:'茶の湯気が、まだ残っている。'},
    {w:'',t:'奥の廊下で、提灯がひとつ、ひとりでに揺れた。'}
  ],next:2},
  {id:'hall',kind:'play',place:'廊下',bg:'hall',next:3},
  {id:'afterHall',kind:'talk',place:'廊下',bg:'hall',lines:[
    {w:'剣士',t:'提灯が、笑っていた。'},
    {w:'剣士',t:'中庭から、傘の骨が鳴る。'}
  ],next:4},
  {id:'yard',kind:'play',place:'中庭',bg:'yard',next:5},
  {id:'afterYard',kind:'talk',place:'中庭',bg:'yard',lines:[
    {w:'女将',t:'お客様を、帰すわけにはまいりません。'},
    {w:'女将',t:'おもてなしは、これからが本番。'}
  ],next:6},
  {id:'true',kind:'play',place:'正体',bg:'yard',next:7}
];

let G=null;
function freshPlayer(){
  const s=S();
  return {x:W*0.22,y:gy(),vx:0,vy:0,kb:0,face:1,on:1,slash:0,rec:0,hurt:0,inv:0,w:12*s,h:22*s};
}
function lan(x,y){return {type:'lan',x,y,hp:1,t:Math.random()*6,hurt:0,sp:38+Math.random()*18};}
function okami(x,y,red){return {type:red?'red':'okami',x,y,hp:red?6:4,max:red?6:4,t:0,atk:0,hurt:0,face:-1,spit:0};}

function enterRoom(i,keepHearts){
  const room=ROOMS[i];
  G.ri=i;G.room=room;G.line=0;G.choosing=false;G.fx=[];G.en=[];G.t=0;
  G.p=freshPlayer();
  if(!keepHearts)G.hearts=3;
  $('place').textContent=room.place;
  if(room.kind==='talk'){G.mode='talk';showLine();startBgm();}
  else{
    G.mode='play';hideTalk();
    const g=gy(),s=S();
    if(room.id==='hall'){
      G.en.push(lan(W*0.68,g-70*s/2),lan(W*0.86,g-110*s/2));
      if(G.hard)G.en.push(lan(W*0.54,g-90*s/2));
    }else if(room.id==='yard'){
      G.en.push(lan(W*0.62,g-90*s/2),okami(W*0.82,g,false));
    }else if(room.id==='true'){
      G.en.push(okami(W*0.78,g,true));
    }
    startBgm();
  }
  syncPad();updHud();
}

function showLine(){
  const room=G.room,L=room.lines[G.line];
  $('box').classList.remove('hidden');$('choices').classList.add('hidden');G.choosing=false;
  $('who').textContent=L.w||'';$('line').textContent=L.t;$('hint').textContent='次へ';
}
function hideTalk(){$('box').classList.add('hidden');$('choices').classList.add('hidden');G.choosing=false;}
function advance(){
  if(paused||!G||G.mode!=='talk'||G.choosing)return;
  G.line++;
  if(G.line>=G.room.lines.length){
    if(G.room.choice){
      G.choosing=true;$('hint').textContent='選ぶ';
      $('choices').classList.remove('hidden');
      return;
    }
    enterRoom(G.room.next,true);
  }else showLine();
}
function pickTea(drink){
  if(!G||!G.choosing)return;
  G.hard=!drink;G.choosing=false;$('choices').classList.add('hidden');sfx.ok();
  $('who').textContent='女将';
  $('line').textContent=drink?'お熱いうちに。塩が、効いておりますよ。':'……そうですか。おもてなしは、まだこれから。';
  $('hint').textContent='次へ';
  G.room={...G.room,choice:false,lines:[{w:'女将',t:$('line').textContent}],next:1};
  G.line=0;
}

function act(){
  if(paused)return;
  if(!G||G.mode==='boot'){beginOp();return;}
  if(G.mode==='op'){if(performance.now()>G.skipAt)endOp();return;}
  if(G.mode==='title'){startAdventure();return;}
  if(G.mode==='talk'){advance();return;}
  if(G.mode==='play'){slash();return;}
  if(G.mode==='over'){enterRoom(G.ri,false);$('over').classList.add('hidden');$('hud').classList.remove('hidden');return;}
  if(G.mode==='clear'){toBoot();return;}
}
function slash(){
  if(!G||G.mode!=='play'||paused)return;
  const p=G.p;if(p.rec>0||p.slash>0)return;
  p.slash=0.18;p.rec=0.28;sfx.slash();
  const reach=56*S(),yy=p.y-p.h*0.55;
  for(const e of G.en){
    const dx=(e.x-p.x)*p.face;
    if(dx>-8&&dx<reach&&Math.abs((e.y||gy())-yy)<48*S()){
      e.hp-=1;e.hurt=0.18;e.x+=p.face*18*S();sfx.hit();
      G.fx.push({x:e.x,y:e.y-20,t:0.5,s:'85',c:C.lamp});
    }
  }
}

function beginOp(){
  unlock();
  G.mode='op';G.skipAt=performance.now()+400;
  $('title').classList.add('hidden');$('over').classList.add('hidden');$('clear').classList.add('hidden');
  stopBgm();opv.classList.remove('hidden','is-on');opv.muted=true;opv.src='opening.mp4';
  const go=()=>{opv.play().catch(()=>{});};
  if(opv.readyState>=2)go();else opv.addEventListener('canplay',go,{once:true});
  opv.addEventListener('error',endOp,{once:true});
  syncPad();
}
function endOp(){
  try{opv.pause();}catch(e){}
  opv.classList.remove('is-on');opv.removeAttribute('src');opv.load();opv.classList.add('hidden');
  G.mode='title';$('title').classList.remove('hidden');showBest();startBgm();syncPad();
}
function startAdventure(){
  $('title').classList.add('hidden');$('hud').classList.remove('hidden');
  G.hard=false;enterRoom(0,false);
}
function toBoot(){
  try{opv.pause();}catch(e){}
  opv.classList.add('hidden');hideTalk();
  $('hud').classList.add('hidden');$('over').classList.add('hidden');$('clear').classList.add('hidden');
  $('title').classList.remove('hidden');
  G={mode:'boot',hearts:3,hard:false,ri:0,fx:[]};showBest();syncPad();
}
function showBest(){
  $('best').textContent=cleared?(best?`クリア済み　ベスト残りハート ${best}`:'クリア済み'):'';
}
function gameOver(){
  G.mode='over';hideTalk();sfx.lose();stopBgm();
  $('over').classList.remove('hidden');syncPad();
}
function win(){
  G.mode='clear';hideTalk();sfx.win();stopBgm();
  const left=G.hearts;
  if(left>best){best=left;try{localStorage.setItem('tg.248.best',String(best));}catch(e){}}
  cleared=true;try{localStorage.setItem('tg.248.cleared','1');}catch(e){}
  $('clearMsg').textContent=`残りハート ${left}　看板だけが、夜に残った。`;
  $('clear').classList.remove('hidden');$('hud').classList.add('hidden');syncPad();
}

function setPaused(on){
  if(!G||G.mode==='boot'||G.mode==='op'||G.mode==='title')return;
  if(G.mode==='over'||G.mode==='clear')return;
  paused=on;
  if(on){try{$('pauseDlg').showModal();}catch(e){}stopBgm();}
  else{try{$('pauseDlg').close();}catch(e){}if(!mute)startBgm();}
}
function syncPad(){
  const m=G?G.mode:'boot';
  $('btnAct').textContent=m==='play'?'斬':m==='talk'?'次へ':(m==='over'||m==='clear')?'再戦':m==='op'?'スキップ':'はじめる';
  $('btnJump').disabled=m!=='play';
  $('hud').classList.toggle('hidden',m==='boot'||m==='op'||m==='title'||m==='clear');
}
function updHud(){
  if(!G)return;
  const n=Math.max(0,G.hearts|0);
  $('hearts').textContent='\u2665'.repeat(n)+'\u2661'.repeat(Math.max(0,3-n));
  $('hearts').style.visibility=G.mode==='play'?'hidden':'visible';
}

function update(dt){
  if(!G||paused)return;
  G.t+=dt;tickBgm(dt);
  for(const f of G.fx)f.t-=dt;G.fx=G.fx.filter(f=>f.t>0);
  if(G.mode!=='play')return;
  const p=G.p,s=S(),g=gy(),spd=130*s;
  p.slash=Math.max(0,p.slash-dt);p.rec=Math.max(0,p.rec-dt);p.hurt=Math.max(0,p.hurt-dt);p.inv=Math.max(0,p.inv-dt);
  let ax=0;if(K.l)ax-=1;if(K.r)ax+=1;
  p.vx=ax*spd;if(ax)p.face=ax;
  if(K.u&&p.on){p.vy=-340*s;p.on=0;sfx.jump();}
  p.vy+=980*s*dt;p.x+=p.vx*dt+p.kb*dt;p.y+=p.vy*dt;p.kb*=Math.pow(0.04,dt);
  if(p.y>=g){p.y=g;p.vy=0;p.on=1;}
  p.x=Math.max(24,Math.min(W-24,p.x));
  for(const e of G.en){
    e.t+=dt;e.hurt=Math.max(0,e.hurt-dt);
    if(e.type==='lan'){
      if(e.y0==null)e.y0=e.y;
      e.y=e.y0+Math.sin(e.t*3)*10*s;
      const dx=p.x-e.x,dy=(p.y-p.h*0.5)-e.y,len=Math.hypot(dx,dy)||1;
      e.x+=dx/len*e.sp*s*dt*0.22;e.y0+=dy/len*e.sp*s*dt*0.12;
    }else{
      e.atk-=dt;e.face=p.x<e.x?-1:1;
      if(e.hurt<=0)e.x+=e.face*46*s*dt*(e.type==='red'?1.25:0.85);
      e.x=Math.max(40,Math.min(W-40,e.x));e.y=g;
      if(e.atk<=0){e.atk=e.type==='red'?1.15:1.7;e.x+=e.face*22*s;}
      if(e.type==='red'){e.spit-=dt;if(e.spit<=0){e.spit=2.4;G.en.push(lan(e.x,e.y-70*s));if(G.en.filter(n=>n.type==='lan').length>3)G.en.splice(G.en.findIndex(n=>n.type==='lan'),1);}}
    }
    if(p.inv<=0){
      const hit=Math.abs(e.x-p.x)<(e.type==='lan'?22*s:28*s)&&Math.abs((e.y||g)-(p.y-p.h*0.4))<(e.type==='lan'?28*s:40*s);
      if(hit){G.hearts--;p.inv=0.95;p.hurt=0.25;p.kb=(p.x<e.x?-1:1)*220*s;sfx.hurt();updHud();if(G.hearts<=0)return gameOver();}
    }
  }
  G.en=G.en.filter(e=>e.hp>0);
  if(G.en.length===0){
    if(G.room.next>=ROOMS.length)win();
    else enterRoom(G.room.next,true);
  }
}

function cover(img){
  if(!img.complete||!img.naturalWidth)return false;
  const ir=img.naturalWidth/img.naturalHeight,sr=W/H;let dw,dh,dx,dy;
  if(sr>ir){dw=W;dh=W/ir;dx=0;dy=(H-dh)/2;}else{dh=H;dw=H*ir;dy=0;dx=(W-dw)/2;}
  cx.imageSmoothingEnabled=true;cx.drawImage(img,dx|0,dy|0,dw|0,dh|0);return true;
}
function u(){return Math.max(2,S()|0);}
function sky(){
  pix(0,0,W,H,C.sky);
  for(let i=0;i<22;i++)pix((i*89+28)%W,(i*47+18)%(H*0.38)|0,2,2,i%3?C.moon:'#d8c878');
  const mx=W*0.24|0,my=H*0.11|0,r=Math.max(16,W*0.055)|0;
  for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2){
    const a=x*x+y*y,cut=(x+r*0.45)*(x+r*0.45)+(y-r*0.1)*(y-r*0.1);
    if(a<=r*r&&cut>r*r*0.42)pix(mx+x,my+y,2,2,C.moon);
  }
  pix(W*0.58,H*0.06,70,16,C.sky2);pix(W*0.62,H*0.04,50,14,'#4a3068');
}
function andon(x,y,h){
  pix(x,y,10,h,C.wood2);pix(x+1,y+4,8,h*0.45,C.lamp);pix(x-4,y+6,18,h*0.35,'rgba(240,212,138,.18)');
}
function drawRoom(){
  sky();
  pix(0,H*0.16,W,H,C.wood2);
  pix(W*0.14,H*0.18,W*0.72,H*0.44,C.paper);
  for(let i=0;i<5;i++)pix(W*0.14+i*W*0.144,H*0.18,3,H*0.44,'#6a5438');
  for(let j=0;j<3;j++)pix(W*0.14,H*0.18+j*H*0.147,W*0.72,3,'#6a5438');
  pix(0,H*0.16,W*0.14,H*0.5,C.wood);pix(W*0.86,H*0.16,W*0.14,H*0.5,C.wood);
  pix(0,H*0.62,W,8,'#5a4430');
  const ty=H*0.64;
  for(let i=0;i<10;i++)pix(0,ty+i*7,W,7,i%2?C.tatami:C.tatami2);
  pix(W*0.32,H*0.58,W*0.36,14,C.wood);pix(W*0.34,H*0.56,W*0.32,8,'#6a4a30');
  pix(W*0.46,H*0.53,18,10,'#6a8a62');pix(W*0.48,H*0.51,8,6,'#4a6a48');
  [[W*0.28,H*0.66],[W*0.62,H*0.66],[W*0.38,H*0.72],[W*0.54,H*0.72]].forEach(([x,y])=>{pix(x,y,28,10,'#3a4a78');pix(x+4,y+2,20,6,'#4a5a88');});
  andon(12,H*0.42,40);andon(W-24,H*0.5,36);
}
function drawHall(){
  sky();
  pix(0,H*0.2,W*0.58,H*0.52,C.wood);
  pix(10,H*0.26,W*0.26,H*0.38,C.paper);
  for(let i=0;i<4;i++)pix(10+i*W*0.065,H*0.26,2,H*0.38,'#6a5438');
  pix(W*0.56,H*0.24,8,H*0.5,'#1a1010');
  pix(W*0.6,H*0.28,W*0.4,H*0.36,C.sky2);
  pix(W*0.68,H*0.4,W*0.3,H*0.2,C.wood2);pix(W*0.7,H*0.36,W*0.26,10,'#2a1c18');
  pix(0,gy()-8,W,H,'#5a4030');
  for(let i=0;i<14;i++)pix(i*(W/14),gy()-8,3,H,'#3a281c');
  andon(16,H*0.36,28);andon(W*0.5,H*0.32,28);
  pix(W*0.62,gy()-26,W*0.36,8,'#2a3820');
}
function drawYard(){
  sky();
  pix(0,H*0.34,W,H*0.18,C.wood2);
  pix(W*0.06,H*0.3,W*0.48,H*0.22,C.wood);
  pix(W*0.04,H*0.28,W*0.52,12,'#2a1c18');
  pix(W*0.12,H*0.36,16,12,C.lamp);pix(W*0.3,H*0.36,16,12,C.lamp);
  pix(W*0.6,H*0.32,W*0.36,H*0.2,C.wood);pix(W*0.58,H*0.3,W*0.4,10,'#2a1c18');
  pix(0,gy()-10,W,H,'#2e3428');
  for(let i=0;i<9;i++){pix(W*0.4+i*12,gy()-32,5,32,'#24301c');pix(W*0.4+i*12-2,gy()-36,9,6,'#1a2414');}
  pix(18,gy()-40,14,40,C.wood2);pix(21,gy()-54,8,14,C.lamp);
  pix(W*0.72,gy()-18,36,10,'#4a5040');
}
function drawHero(p){
  if(p.hurt>0&&((G.t*18)|0)%2===0)return;
  const s=u(),x=p.x|0,y=p.y|0;
  cx.save();cx.translate(x,y);if(p.face<0)cx.scale(-1,1);
  pix(-5*s,-24*s,3*s,6*s,C.hair);pix(2*s,-25*s,4*s,5*s,C.hair);pix(-1*s,-23*s,3*s,4*s,C.hair);
  pix(-6*s,-20*s,13*s,8*s,C.hair);
  pix(-4*s,-18*s,9*s,7*s,C.skin);pix(-2*s,-16*s,2*s,2*s,C.hair);pix(2*s,-16*s,2*s,2*s,C.hair);
  pix(-7*s,-12*s,15*s,13*s,C.teal);pix(-7*s,-5*s,15*s,3*s,'#1e2e28');
  pix(-5*s,1*s,5*s,8*s,C.teal2);pix(1*s,1*s,5*s,8*s,C.teal2);
  pix(-5*s,8*s,5*s,3*s,C.ink);pix(1*s,8*s,5*s,3*s,C.ink);
  if(p.slash>0){pix(8*s,-16*s,18*s,3*s,C.ink);pix(24*s,-18*s,4*s,7*s,C.moon);}
  else{pix(7*s,-6*s,3*s,12*s,C.ink);pix(7*s,5*s,3*s,4*s,C.moon);}
  cx.restore();
}
function drawLantern(e){
  const s=u(),x=e.x|0,y=e.y|0;
  pix(x-12*s,y-2*s,8*s,10*s,C.ghost);pix(x-6*s,y+2*s,10*s,6*s,C.ghost);
  pix(x-8*s,y-18*s,16*s,18*s,C.paper);pix(x-8*s,y-21*s,16*s,4*s,C.wood);pix(x-8*s,y-2*s,16*s,3*s,C.wood);
  pix(x-4*s,y-14*s,3*s,3*s,C.blood);pix(x+2*s,y-14*s,3*s,3*s,C.blood);
  pix(x-1*s,y-8*s,3*s,7*s,C.blood);
}
function drawOkami(e){
  const s=u(),red=e.type==='red',kim=red?C.red:C.purple,kim2=red?C.blood:C.purple2;
  cx.save();cx.translate(e.x|0,e.y|0);if(e.face>0)cx.scale(-1,1);
  pix(-2*s,-24*s,6*s,5*s,C.hair);pix(-6*s,-20*s,13*s,6*s,C.hair);
  pix(-4*s,-18*s,9*s,7*s,C.skin);
  pix(-8*s,-12*s,17*s,14*s,kim);pix(-8*s,-4*s,17*s,3*s,kim2);
  pix(-6*s,2*s,6*s,8*s,kim2);pix(1*s,2*s,6*s,8*s,kim2);
  pix(6*s,-22*s,16*s,3*s,red?C.blood:'#2a3a68');pix(20*s,-22*s,3*s,18*s,red?C.blood:'#2a3a68');
  pix(8*s,-20*s,12*s,10*s,red?'rgba(180,40,40,.25)':'rgba(40,50,100,.25)');
  cx.restore();
}
function drawBars(){
  if(!G||G.mode!=='play')return;
  for(let i=0;i<3;i++)pix(12+i*18,10,14,12,i<G.hearts?C.blood:'#3a2428');
  const boss=G.en.find(e=>e.type==='okami'||e.type==='red');if(!boss)return;
  pix(12,28,W*0.38,8,'#2a1820');pix(12,28,(W*0.38)*(G.hearts/3),8,C.teal);
  pix(W*0.6,28,W*0.36,8,'#2a1820');pix(W*0.6+(W*0.36)*(1-boss.hp/boss.max),28,(W*0.36)*(boss.hp/boss.max),8,C.blood);
}

function draw(){
  cx.imageSmoothingEnabled=false;
  if(!G||G.mode==='boot'||G.mode==='title'||G.mode==='op'){
    if(!cover(titleImg))sky();
    return;
  }
  const bg=G.room&&G.room.bg;
  if(bg==='hall')drawHall();else if(bg==='yard')drawYard();else drawRoom();
  if(G.mode==='talk'){
    const p=G.p||freshPlayer();
    drawHero({...p,x:W*0.28,y:gy(),face:1,slash:0,hurt:0});
    if(G.room.id!=='guest')drawOkami({x:W*0.72,y:gy(),face:-1,type:'okami'});
  }
  if(G.mode==='play'||G.mode==='over'){
    drawHero(G.p);
    for(const e of G.en){if(e.type==='lan')drawLantern(e);else drawOkami(e);}
    drawBars();
    for(const f of G.fx){cx.globalAlpha=Math.max(0,f.t*2);cx.fillStyle=f.c;cx.font=`${14*S()|0}px monospace`;cx.fillText(f.s,f.x|0,(f.y-20*(1-f.t))|0);cx.globalAlpha=1;}
  }
}

let last=0;
function loop(ts){
  const dt=Math.min((ts-last)/1000||0,0.05);last=ts;
  if(G&&!paused)update(dt);
  draw(ts);
  requestAnimationFrame(loop);
}

G={mode:'boot',hearts:3,hard:false,ri:0,fx:[]};
setMute(mute);showBest();syncPad();
bindDpad($('dpad'));
bindTap($('btnAct'),()=>{unlock();act();});
bindHold($('btnJump'),()=>{K.u=1;},()=>{K.u=0;});
bindTap($('btnMute'),()=>{unlock();setMute(!mute);});
bindTap($('btnPause'),()=>setPaused(!paused));
bindTap($('btnResume'),()=>setPaused(false));
bindTap($('btnMuteDlg'),()=>{unlock();setMute(!mute);});
bindTap($('btnQuit'),()=>{setPaused(false);toBoot();});
bindTap($('c0'),()=>pickTea(true));
bindTap($('c1'),()=>pickTea(false));
opv.addEventListener('ended',endOp);
opv.addEventListener('timeupdate',()=>{
  if(!G||G.mode!=='op')return;
  if(opv.currentTime>0.03){opv.classList.add('is-on');if(!mute)opv.muted=false;}
});
cv.addEventListener('pointerdown',e=>{
  e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(err){}
  unlock();act();
});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){e.preventDefault();setPaused(!paused);return;}
  if(e.key==='m'||e.key==='M'){unlock();setMute(!mute);return;}
  if(e.key==='ArrowLeft'||e.key==='a')K.l=1;
  if(e.key==='ArrowRight'||e.key==='d')K.r=1;
  if(e.key==='ArrowUp'||e.key==='w')K.u=1;
  if(e.key==='ArrowDown'||e.key==='s')K.d=1;
  if(e.key==='z'||e.key==='Z'||e.key==='x'||e.key==='X'||e.key==='Enter'){e.preventDefault();unlock();act();}
  if(e.key===' '){e.preventDefault();unlock();if(G&&G.mode==='play')K.u=1;else act();}
});
window.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a')K.l=0;
  if(e.key==='ArrowRight'||e.key==='d')K.r=0;
  if(e.key==='ArrowUp'||e.key==='w'||e.key===' ')K.u=0;
  if(e.key==='ArrowDown'||e.key==='s')K.d=0;
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(G&&(G.mode==='play'||G.mode==='talk'))setPaused(true);stopBgm();try{opv.pause();}catch(e){}}
});
requestAnimationFrame(loop);
})();
