(()=>{
const $=id=>document.getElementById(id);
const cv=$('c'),cx=cv.getContext('2d'),stage=$('screen-wrap'),opv=$('opv');
let W=0,H=0,DPR=1,paused=false,mute=false,AC=null,bgmOn=false,beatT=0,beat=0,chipOn=false;
const bgmEl=$('bgm');
if(bgmEl){bgmEl.loop=true;bgmEl.preload='auto';bgmEl.volume=0.4;}
const K={l:0,r:0,u:0,d:0};
const titleImg=new Image();titleImg.src='images/title.webp';
function loadImg(src){const im=new Image();im.src=src;return im;}
const IMG={
  title:titleImg,
  desk:loadImg('images/bg-desk.webp'),
  guest:loadImg('images/bg-guest.webp'),
  hall:loadImg('images/bg-hall.webp'),
  yard:loadImg('images/bg-yard.webp'),
  hero:loadImg('images/spr-hero.webp'),
  heroSlash:loadImg('images/spr-hero-slash.webp'),
  heroFront:loadImg('images/spr-hero-front.webp'),
  okami:loadImg('images/spr-okami.webp'),
  okamiFront:loadImg('images/spr-okami-front.webp'),
  okamiRed:loadImg('images/spr-okami-red.webp'),
  lantern:loadImg('images/spr-lantern.webp'),
  portHero:loadImg('images/port-hero.webp'),
  portOkami:loadImg('images/port-okami.webp')
};
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
function gy(){
  const bg=G&&G.room&&G.room.bg;
  if(bg==='hall')return H*0.87;
  if(bg==='yard')return H*0.85;
  return H*0.80;
}
function S(){return Math.max(1.5, Math.min(W/360,H/640)*2.05);}
function charH(){
  const play=G&&G.mode==='play';
  return Math.max(play?108:92, Math.min(H*(play?0.32:0.28), W*(play?0.50:0.42)));
}
const BG_CROP={
  hall:{x:0.00,y:0.30,w:1.00,h:0.58},
  yard:{x:0.04,y:0.34,w:0.92,h:0.58}
};

function unlock(){
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);
  }catch(e){AC=null;}
  primeBgm();
}
function primeBgm(){
  if(!bgmEl)return;
  try{
    bgmEl.muted=true;
    const p=bgmEl.play();
    if(p&&typeof p.then==='function')p.then(()=>{
      if(!bgmOn){try{bgmEl.pause();bgmEl.currentTime=0;}catch(e){}}
      bgmEl.muted=mute;
    }).catch(()=>{});
  }catch(e){}
}
function startChip(){
  if(!AC||mute||chipOn)return;chipOn=true;bgmOn=true;beatT=0;beat=0;
}
function startBgm(){
  if(mute||bgmOn)return;
  if(bgmEl){
    bgmOn=true;chipOn=false;
    bgmEl.muted=false;bgmEl.volume=0.4;
    const p=bgmEl.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{bgmOn=false;startChip();});
    return;
  }
  startChip();
}
function stopBgm(){
  bgmOn=false;chipOn=false;
  if(bgmEl){try{bgmEl.pause();}catch(e){}}
}
function tickBgm(dt){
  if(!chipOn||!AC||mute)return;
  beatT+=dt;if(beatT<0.42)return;beatT=0;beat++;
  const bass=[98,98,130.8,87.3][beat%4];
  tone(bass,bass,0.28,'triangle',0.05);
  const mel=[392,440,523,392,349,392,0,523][beat%8];
  if(mel)tone(mel,mel,0.18,'square',0.035);
  if(beat%2===0)noise(0.05,0.04,2400);
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
  get(){tone(660,990,0.12,'square',0.08);tone(880,1320,0.16,'triangle',0.06,0.05);},
  lv(){[523,659,784].forEach((f,i)=>tone(f,f,0.12,'square',0.09,i*0.07));},
  rare(){tone(784,1174,0.2,'square',0.1);tone(1174,1568,0.22,'triangle',0.08,0.08);},
  win(){[523,659,784,1046].forEach((f,i)=>tone(f,f,0.18,'square',0.1,i*0.1));},
  lose(){[392,330,262,196].forEach((f,i)=>tone(f,f,0.22,'triangle',0.08,i*0.12));}
};

function setMute(v){
  mute=v;
  try{localStorage.setItem('tg.248.mute',mute?'1':'0');}catch(e){}
  $('btnMute').textContent=mute?'🔇':'♪';
  if($('btnMuteDlg'))$('btnMuteDlg').textContent=mute?'音: オフ':'音: オン';
  if(opv)opv.muted=mute;
  if(bgmEl)bgmEl.muted=mute;
  if(mute)stopBgm();else if(G&&(G.mode==='talk'||G.mode==='play'||G.mode==='title'||G.mode==='loot'))startBgm();
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

const WEAPONS={
  wakizashi:{name:'脇差', atk:1, reach:1.18},
  shikomi:{name:'仕込み刀', atk:2, reach:1.48},
  shiomi:{name:'塩見の刀', atk:3, reach:1.68}
};
const ARMORS={
  tabi:{name:'旅装', hp:3, inv:1.15},
  haori:{name:'館の羽織', hp:4, inv:1.2},
  fuda:{name:'塩札', hp:4, inv:1.55}
};
const LV_AT=[0, 36, 88, 160, 260];

function weapon(){return WEAPONS[(G&&G.weapon)||'wakizashi']||WEAPONS.wakizashi;}
function armor(){return ARMORS[(G&&G.armor)||'tabi']||ARMORS.tabi;}
function maxHp(){return armor().hp;}
function atkPow(){return weapon().atk + Math.max(0,((G&&G.lv)||1)-1);}
function needExp(lv){return LV_AT[lv]||9999;}
function grantExp(n,x,y,rare){
  if(!G||n<=0)return;
  G.exp=(G.exp||0)+n;
  G.fx.push({k:'num',x,y,t:rare?1.1:0.7,s:(rare?n+'!!':'+'+n),rare:!!rare});
  if(rare)sfx.rare();
  let up=0;
  while(G.lv<5 && G.exp>=needExp(G.lv)){G.lv++;up++;}
  if(up){
    sfx.lv();G.flash=0.16;G.toast={s:'Lv.'+G.lv+'  斬れ味が上がった',t:1.6};
    G.hearts=Math.min(maxHp(), (G.hearts||0)+1);
    updHud();
  }
}

const ROOMS=[
  {id:'desk',kind:'talk',place:'帳場',bg:'desk',lines:[
    {w:'女将',t:'塩見の館へようこそ。'},
    {w:'女将',t:'遠いところを、ようおいでくださいました。'},
    {w:'剣士',t:'……人が、おらんようだが。'},
    {w:'女将',t:'今夜は月が欠けておりますゆえ。お茶をどうぞ。'}
  ],choice:true,next:1},
  {id:'guest',kind:'talk',place:'客間',bg:'guest',lines:[
    {w:'剣士',t:'帳場に戻ると、女将の姿がない。'},
    {w:'剣士',t:'茶の湯気が、まだ残っている。'},
    {w:'剣士',t:'奥の押入れが、半開きだ。'}
  ],next:2},
  {id:'closet',kind:'loot',place:'押入れ',bg:'guest',loot:{kind:'armor',id:'haori',name:'館の羽織',shape:'chest'},next:3},
  {id:'armory',kind:'loot',place:'武具の間',bg:'hall',loot:{kind:'weapon',id:'shikomi',name:'仕込み刀',shape:'rack'},next:4},
  {id:'hall',kind:'play',place:'廊下',bg:'hall',next:5},
  {id:'afterHall',kind:'talk',place:'廊下',bg:'hall',lines:[
    {w:'剣士',t:'提灯が、笑っていた。'},
    {w:'剣士',t:'中庭の祠から、塩の匂いがする。'}
  ],next:6},
  {id:'shrine',kind:'loot',place:'祠',bg:'yard',loot:{kind:'armor',id:'fuda',name:'塩札',shape:'shrine',bonusExp:100},next:7},
  {id:'yard',kind:'play',place:'中庭',bg:'yard',next:8},
  {id:'afterYard',kind:'talk',place:'中庭',bg:'yard',lines:[
    {w:'女将',t:'お客様を、帰すわけにはまいりません。'},
    {w:'女将',t:'おもてなしは、これからが本番。'}
  ],next:9},
  {id:'true',kind:'play',place:'正体',bg:'yard',next:10}
];

let G=null;
function freshPlayer(){
  const h=charH();
  return {x:W*0.32,y:gy(),vx:0,vy:0,kb:0,face:1,on:1,slash:0,rec:0,hurt:0,inv:0,w:h*0.42,h};
}
function lan(x,y,gold){return {type:'lan',x,y,hp:gold?2:1,gold:!!gold,exp:gold?90:12,t:Math.random()*6,hurt:0,sp:38+Math.random()*18};}
function okami(x,y,red){return {type:red?'red':'okami',x,y,hp:red?8:4,max:red?8:4,exp:red?80:40,t:0,atk:0,hurt:0,face:-1,spit:0};}

function enterRoom(i,keepHearts){
  const room=ROOMS[i];
  G.ri=i;G.room=room;G.line=0;G.choosing=false;G.fx=[];G.en=[];G.t=0;G.shake=0;G.flash=0;G.hitstop=0;
  G.p=freshPlayer();G.item=null;
  if(!keepHearts)G.hearts=maxHp();
  $('place').textContent=room.place;
  if(room.kind==='talk'){G.mode='talk';showLine();startBgm();}
  else if(room.kind==='loot'){
    G.mode='play';hideTalk();
    G.p.x=W*0.22;
    const L=room.loot;
    G.item={kind:L.kind,id:L.id,name:L.name,shape:L.shape,bonusExp:L.bonusExp||0,taken:false,x:W*0.68};
    startBgm();
  }else{
    G.mode='play';hideTalk();
    const g=gy(),ch=charH();
    G.p.x=W*0.22;
    if(room.id==='hall'){
      G.en.push(lan(W*0.58,g-ch*0.42,Math.random()<0.28),lan(W*0.82,g-ch*0.62,false));
      if(G.hard)G.en.push(lan(W*0.70,g-ch*0.78,Math.random()<0.18));
    }else if(room.id==='yard'){
      G.en.push(lan(W*0.48,g-ch*0.70,Math.random()<0.22),okami(W*0.78,g,false));
    }else if(room.id==='true'){
      G.en.push(okami(W*0.74,g,true));
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

function nearLoot(){
  if(!G||!G.item||G.item.taken||!G.p)return false;
  return Math.abs(G.p.x-G.item.x)<charH()*0.55;
}
function takeLoot(){
  if(!G||!G.item||G.item.taken)return false;
  if(!nearLoot()){G.toast={s:'近づいて 取れ',t:0.8};return false;}
  const L=G.item;G.item.taken=true;
  if(L.kind==='weapon')G.weapon=L.id;
  if(L.kind==='armor'){G.armor=L.id;G.hearts=Math.min(maxHp(),(G.hearts||0)+1);}
  if(L.bonusExp)grantExp(L.bonusExp,G.p.x,G.p.y-24,true);
  sfx.get();G.toast={s:L.name+' を得た',t:1.5};G.flash=0.1;updHud();syncPad();
  return true;
}
function act(){
  if(paused)return;
  if(!G||G.mode==='boot'){beginOp();return;}
  if(G.mode==='op'){if(performance.now()>G.skipAt)endOp();return;}
  if(G.mode==='title'){startAdventure();return;}
  if(G.mode==='talk'){advance();return;}
  if(G.mode==='play'){
    if(G.room&&G.room.kind==='loot'){
      if(G.item&&!G.item.taken)takeLoot();
      else enterRoom(G.room.next,true);
      return;
    }
    slash();return;
  }
  if(G.mode==='over'){enterRoom(G.ri,false);$('over').classList.add('hidden');$('hud').classList.remove('hidden');return;}
  if(G.mode==='clear'){toBoot();return;}
}
function slash(){
  if(!G||G.mode!=='play'||paused)return;
  const p=G.p;if(p.rec>0||p.slash>0)return;
  let aim=null,ad=1e9;
  for(const e of G.en){const d=Math.abs(e.x-p.x);if(d<ad){ad=d;aim=e;}}
  if(aim)p.face=aim.x>=p.x?1:-1;
  p.slash=0.22;p.rec=Math.max(0.18,0.32-G.lv*0.02);sfx.slash();
  const reach=charH()*weapon().reach,yy=p.y-p.h*0.42,dmg=atkPow();
  for(const e of G.en){
    const dx=(e.x-p.x)*p.face;
    const ey=e.type==='lan'?e.y:(e.y||gy())-charH()*0.42;
    if(dx>-18&&dx<reach&&Math.abs(ey-yy)<charH()*0.85){
      e.hp-=dmg;e.hurt=0.18;e.x+=p.face*16*S();sfx.hit();G.shake=0.18;G.flash=0.10;G.hitstop=0.055;
      G.fx.push({k:'hit',x:e.x,y:ey,t:0.38});
      G.fx.push({k:'slash',x:p.x+p.face*charH()*0.55,y:yy,t:0.16,face:p.face});
      G.fx.push({k:'num',x:e.x,y:ey-10,t:0.45,s:dmg>1?('-'+dmg):'斬'});
    }
  }
}

function beginOp(){
  unlock();
  G.mode='op';G.skipAt=performance.now()+400;G.opDone=false;
  // タイトルはここで消さない。opvがz-index上で覆うので、最初のフレームが出た時点で消す（timeupdate）
  $('over').classList.add('hidden');$('clear').classList.add('hidden');
  stopBgm();opv.classList.remove('hidden','is-on');opv.muted=true;
  try{opv.currentTime=0;}catch(e){}
  // iOS Safariでは、ユーザー操作中にplay()を呼ばないと再生許可が失われる。
  // 読込完了イベントを待たず、この「はじめる」操作の中で開始する。
  const started=opv.play();
  if(started&&typeof started.catch==='function')started.catch(endOp);
  opv.addEventListener('error',endOp,{once:true});
  syncPad();
}
function endOp(){
  // ended / error / play()のreject / スキップ の4経路から呼ばれるため冪等にする
  if(!G||G.opDone)return;
  G.opDone=true;
  try{opv.pause();}catch(e){}
  // 先にタイトルを敷いてから動画をフェードで退かせる＝黒画面を挟まないクロスフェード
  G.mode='title';
  $('title').classList.remove('hidden','pre');showBest();startBgm();syncPad();
  opv.classList.remove('is-on');
  setTimeout(()=>{
    if(!G||G.mode!=='title')return;
    opv.classList.add('hidden');
    try{opv.currentTime=0;}catch(e){}
  },300);
}
function startAdventure(){
  $('title').classList.add('hidden');$('hud').classList.remove('hidden');
  G.hard=false;G.lv=1;G.exp=0;G.weapon='wakizashi';G.armor='tabi';G.toast=null;
  enterRoom(0,false);
}
function toBoot(){
  try{opv.pause();}catch(e){}
  opv.classList.add('hidden');hideTalk();
  $('hud').classList.add('hidden');$('over').classList.add('hidden');$('clear').classList.add('hidden');
  $('title').classList.remove('hidden');$('title').classList.add('pre');
  G={mode:'boot',hearts:3,hard:false,ri:0,fx:[],lv:1,exp:0,weapon:'wakizashi',armor:'tabi'};showBest();syncPad();
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
  $('clearMsg').textContent=`Lv${G.lv}　${weapon().name}　残りハート ${left}`;
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
  const loot=G&&G.room&&G.room.kind==='loot';
  $('btnAct').textContent=loot?(G.item&&!G.item.taken?(nearLoot()?'取る':'近づく'):'進む'):m==='play'?'斬':m==='talk'?'次へ':(m==='over'||m==='clear')?'再戦':m==='op'?'スキップ':m==='title'?'館へ入る':'はじめる';
  $('btnJump').disabled=m!=='play';
  $('hud').classList.toggle('hidden',m==='boot'||m==='op'||m==='title'||m==='clear');
  $('place').classList.toggle('hidden',m==='play'&&!loot);
}
function updHud(){
  if(!G)return;
  const n=Math.max(0,G.hearts|0),max=maxHp();
  $('hearts').textContent='\u2665'.repeat(n)+'\u2661'.repeat(Math.max(0,max-n));
  $('hearts').style.visibility=G.mode==='play'?'hidden':'visible';
  if($('stat')){
    $('stat').textContent=`Lv${G.lv||1}  ${weapon().name}\n${armor().name}`;
    $('stat').style.visibility=G.mode==='play'?'hidden':'visible';
  }
}

function update(dt){
  if(!G||paused)return;
  G.t+=dt;if(G.shake>0)G.shake=Math.max(0,G.shake-dt*3.2);
  if(G.flash>0)G.flash=Math.max(0,G.flash-dt*4.2);
  if(G.toast){G.toast.t-=dt;if(G.toast.t<=0)G.toast=null;}
  tickBgm(dt);
  for(const f of G.fx)f.t-=dt;G.fx=G.fx.filter(f=>f.t>0);
  if(G.hitstop>0){G.hitstop=Math.max(0,G.hitstop-dt);return;}
  if(G.mode!=='play')return;
  const p=G.p,s=S(),g=gy(),spd=128*s;
  p.h=charH();p.w=p.h*0.42;
  p.slash=Math.max(0,p.slash-dt);p.rec=Math.max(0,p.rec-dt);p.hurt=Math.max(0,p.hurt-dt);p.inv=Math.max(0,p.inv-dt);
  let ax=0;if(K.l)ax-=1;if(K.r)ax+=1;
  p.vx=ax*spd;if(ax)p.face=ax;
  const wasOn=p.on;
  if(K.u&&p.on){p.vy=-340*s;p.on=0;sfx.jump();}
  p.vy+=980*s*dt;p.x+=p.vx*dt+p.kb*dt;p.y+=p.vy*dt;p.kb*=Math.pow(0.04,dt);
  if(p.y>=g){
    if(!wasOn&&p.vy>80)G.fx.push({k:'dust',x:p.x,y:g,t:0.28});
    p.y=g;p.vy=0;p.on=1;
  }
  if(ax&&p.on&&((G.t*9)|0)%5===0)G.fx.push({k:'dust',x:p.x-p.face*8,y:g,t:0.18});
  p.x=Math.max(charH()*0.38,Math.min(W-charH()*0.38,p.x));
  if(G.room&&G.room.kind==='loot'){
    if(G.item&&!G.item.taken&&nearLoot())takeLoot();
    syncPad();return;
  }
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
      e.x=Math.max(charH()*0.38,Math.min(W-charH()*0.38,e.x));e.y=g;
      if(e.atk<=0){e.atk=e.type==='red'?1.15:1.7;e.x+=e.face*22*s;}
      if(e.type==='red'){
        e.spit-=dt;
        if(e.spit<=0){
          e.spit=2.4;
          const side=p.x<e.x?-1:1;
          G.en.push(lan(e.x-side*charH()*0.7,e.y-charH()*0.62,Math.random()<0.16));
          if(G.en.filter(n=>n.type==='lan').length>3)G.en.splice(G.en.findIndex(n=>n.type==='lan'),1);
        }
      }
    }
    if(p.inv<=0){
      const ey=e.type==='lan'?e.y:(e.y||g)-charH()*0.4;
      const hit=Math.abs(e.x-p.x)<(e.type==='lan'?charH()*0.16:charH()*0.26)&&Math.abs(ey-(p.y-p.h*0.45))<(e.type==='lan'?charH()*0.2:charH()*0.36);
      if(hit){G.hearts--;p.inv=armor().inv;p.hurt=0.25;p.kb=(p.x<e.x?-1:1)*220*s;G.shake=0.22;G.flash=0.08;sfx.hurt();updHud();if(G.hearts<=0)return gameOver();}
    }
  }
  for(const e of G.en){
    if(e.hp<=0&&!e.paid){e.paid=true;grantExp(e.exp||12,e.x,e.y-(e.gold?18:8),!!e.gold);}
  }
  G.en=G.en.filter(e=>e.hp>0);
  if(G.en.length===0){
    if(G.room.next>=ROOMS.length)win();
    else enterRoom(G.room.next,true);
  }
}

function ready(img){return img&&img.complete&&img.naturalWidth>0;}
function cover(img){
  if(!ready(img))return false;
  const ir=img.naturalWidth/img.naturalHeight,sr=W/H;let dw,dh,dx,dy;
  if(sr>ir){dw=W;dh=W/ir;dx=0;dy=(H-dh)/2;}else{dh=H;dw=H*ir;dy=0;dx=(W-dw)/2;}
  cx.imageSmoothingEnabled=true;cx.drawImage(img,dx|0,dy|0,dw|0,dh|0);return true;
}
function paintCrop(img,crop,look){
  if(!ready(img))return false;
  const iw=img.naturalWidth,ih=img.naturalHeight;
  let sx=crop?iw*crop.x:0,sy=crop?ih*crop.y:0,sw=crop?iw*crop.w:iw,sh=crop?ih*crop.h:ih;
  const pan=Math.max(0,sw*0.06);
  sx=Math.max(0,Math.min(iw-sw,sx+pan*(look||0)));
  const ir=sw/sh,sr=W/H;let dw,dh,dx,dy;
  if(sr>ir){dw=W;dh=W/ir;dx=0;dy=H-dh;}else{dh=H;dw=H*ir;dy=0;dx=(W-dw)/2;}
  cx.imageSmoothingEnabled=true;
  cx.drawImage(img,sx,sy,sw,sh,dx|0,dy|0,dw|0,dh|0);
  return true;
}
function sky(){
  pix(0,0,W,H,C.sky);
  for(let i=0;i<22;i++)pix((i*89+28)%W,(i*47+18)%(H*0.38)|0,2,2,i%3?C.moon:'#d8c878');
}
function blit(img,x,y,h,face,ax,ay){
  if(!ready(img)||h<=0)return false;
  const dw=h*(img.naturalWidth/img.naturalHeight),dh=h;
  ax=ax==null?0.5:ax;ay=ay==null?1:ay;
  cx.save();cx.imageSmoothingEnabled=false;cx.translate(x|0,y|0);if(face<0)cx.scale(-1,1);
  cx.drawImage(img,(-dw*ax)|0,(-dh*ay)|0,dw|0,dh|0);cx.restore();return true;
}
function shadowAt(x,y,w){
  const rw=Math.max(12,w*0.30)|0;
  cx.fillStyle='rgba(8,4,12,.30)';
  cx.fillRect((x-rw)|0,(y-5)|0,rw*2,4);
  cx.fillStyle='rgba(8,4,12,.16)';
  cx.fillRect((x-rw+6)|0,y|0,rw*2-12,3);
}
function motes(play){
  const t=G&&G.t||0,n=play?22:14;
  for(let i=0;i<n;i++){
    const x=(i*89+t*(play?28:16)+Math.sin(t*0.7+i)*18)%W;
    const y=H*(play?0.18:0.10)+(i*47+Math.cos(t*0.9+i*1.3)*24)%(H*(play?0.70:0.62));
    cx.fillStyle=i%3?'rgba(240,212,138,.5)':'rgba(210,230,255,.34)';
    cx.fillRect(x|0,y|0,play&&i%4===0?3:2,2);
  }
}
function ash(){
  const t=G&&G.t||0;
  for(let i=0;i<18;i++){
    const x=(i*73+t*40)%W, y=(i*91+t*70)%H;
    pix(x,y,2,2,i%2?'rgba(255,180,120,.45)':'rgba(40,8,8,.55)');
  }
}
function vignette(red){
  const g=cx.createRadialGradient(W*0.5,H*0.55,H*0.12,W*0.5,H*0.58,H*0.82);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,red?'rgba(48,0,10,.55)':'rgba(8,4,16,.42)');
  cx.fillStyle=g;cx.fillRect(0,0,W,H);
  const top=cx.createLinearGradient(0,0,0,H*0.22);
  top.addColorStop(0,'rgba(8,4,12,.55)');top.addColorStop(1,'rgba(8,4,12,0)');
  cx.fillStyle=top;cx.fillRect(0,0,W,H*0.22);
}
function drawBG(){
  const id=G.room&&G.room.id,bg=G.room&&G.room.bg;
  const img=bg==='hall'?IMG.hall:bg==='yard'?IMG.yard:id==='guest'?IMG.guest:IMG.desk;
  const crop=BG_CROP[bg]||null;
  const look=(G.mode==='play'&&G.p)?((G.p.x/W)-0.5)*1.4:0;
  const ok=crop?paintCrop(img,crop,look):cover(img);
  if(!ok)sky();
  if(id==='true'){
    cx.fillStyle='rgba(88,4,16,.34)';cx.fillRect(0,0,W,H);
    ash();
  }
  motes(G.mode==='play');vignette(id==='true');
}
function drawHero(p,front){
  if(!p)return;
  if(p.hurt>0&&((G.t*18)|0)%2===0)return;
  const h=p.h||charH();
  const run=p.vx?1:0;
  const bob=run?Math.sin(G.t*14)*4:Math.sin(G.t*3)*1.2;
  const lean=run?p.face*0.04:0;
  shadowAt(p.x,p.y,h);
  if(p.slash>0.12){
    cx.save();cx.globalAlpha=0.28;
    blit(IMG.heroSlash,p.x-p.face*10,p.y+bob,h,p.face,0.34,1);
    cx.restore();
  }
  cx.save();
  if(lean){cx.translate(p.x,p.y);cx.rotate(lean);cx.translate(-p.x,-p.y);}
  const img=front?IMG.heroFront:(p.slash>0?IMG.heroSlash:IMG.hero);
  const ax=p.slash>0&&!front?0.34:0.5;
  if(!blit(img,p.x,p.y+bob,h,front?1:p.face,ax,1)){
    cx.fillStyle=C.teal;cx.fillRect((p.x-h*0.18)|0,(p.y-h)|0,h*0.36,h);
  }
  cx.restore();
}
function drawLantern(e){
  const h=charH()*(e.gold?0.56:0.48),pulse=1+Math.sin((G.t+e.t)*4)*0.05;
  const glow=h*(e.gold?0.85:0.55)+Math.sin((G.t+e.t)*5)*4;
  const grd=cx.createRadialGradient(e.x,e.y,2,e.x,e.y,glow);
  grd.addColorStop(0,e.gold?'rgba(255,240,120,.8)':'rgba(255,220,120,.55)');
  grd.addColorStop(1,e.gold?'rgba(255,200,40,0)':'rgba(255,160,40,0)');
  cx.fillStyle=grd;cx.fillRect((e.x-glow)|0,(e.y-glow)|0,glow*2,glow*2);
  if(e.hurt>0&&((G.t*18)|0)%2===0)return;
  if(!blit(IMG.lantern,e.x,e.y+h*0.38,h*pulse,1,0.5,1)){
    cx.fillStyle=e.gold?'#f0d48a':C.paper;cx.fillRect((e.x-h*0.2)|0,(e.y-h*0.3)|0,h*0.4,h*0.5);
  }
}
function drawOkami(e,front,hMul){
  const h=charH()*(hMul||(e.type==='red'?1.18:1.06));
  shadowAt(e.x,e.y,h);
  if(e.hurt>0&&((G.t*20)|0)%2===0)return;
  const img=front?IMG.okamiFront:(e.type==='red'?IMG.okamiRed:IMG.okami);
  const face=front?1:(e.face>0?-1:1);
  if(e.type==='red'){
    const pulse=22+Math.sin(G.t*6)*6;
    cx.fillStyle='rgba(180,20,30,.22)';
    cx.fillRect((e.x-h*0.4)|0,(e.y-h)|0,h*0.8,h);
    pix(e.x-2,e.y-h-pulse,4,pulse,'rgba(255,80,60,.45)');
  }
  if(!blit(img,e.x,e.y+Math.sin(G.t*2.2)*1.5,h,face,0.48,1)){
    cx.fillStyle=e.type==='red'?C.red:C.purple;cx.fillRect((e.x-h*0.2)|0,(e.y-h)|0,h*0.4,h);
  }
}
function woodFrame(x,y,w,h){
  pix(x-3,y-3,w+6,h+6,'#1a1010');
  pix(x-1,y-1,w+2,h+2,'#c4a070');
  pix(x,y,w,h,'#241418');
}
function drawLoot(){
  if(!G||!G.item||G.item.taken)return;
  const x=G.item.x, y=gy(), bob=Math.sin(G.t*4)*5, near=nearLoot();
  const glow=28+Math.sin(G.t*5)*6;
  const grd=cx.createRadialGradient(x,y-30,4,x,y-24,glow+20);
  grd.addColorStop(0,near?'rgba(255,230,140,.7)':'rgba(240,212,138,.4)');
  grd.addColorStop(1,'rgba(240,180,60,0)');
  cx.fillStyle=grd;cx.fillRect((x-glow-16)|0,(y-70)|0,(glow+16)*2,80);
  shadowAt(x,y,70);
  if(G.item.shape==='rack'){
    pix(x-4,y-62+bob,8,62,'#4a3428');
    pix(x-22,y-58+bob,44,7,'#e8d090');
    pix(x-18,y-54+bob,8,8,'#8a6a48');
  }else if(G.item.shape==='shrine'){
    pix(x-22,y-16,44,16,'#6a6860');
    pix(x-10,y-40+bob,20,26,'#c4a070');
    pix(x-6,y-48+bob,12,10,'#f0d48a');
  }else{
    pix(x-20,y-24+bob,40,22,'#6a4a28');
    pix(x-20,y-32+bob,40,12,'#8a6238');
    pix(x-4,y-28+bob,8,6,'#f0d48a');
  }
  cx.fillStyle=C.lamp;
  cx.font=`${Math.max(12,H*0.022)|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
  cx.textAlign='center';
  cx.fillText(G.item.name,(x)|0,(y-72+bob)|0);
  cx.fillText(near?'取る':'近づく',x,(y+18)|0);
  cx.textAlign='left';
}
function drawBars(){
  if(!G||G.mode!=='play')return;
  const top=Math.max(10,H*0.02), ph=Math.max(48,H*0.082), pad=8, max=maxHp();
  woodFrame(pad,top,ph,ph);
  blit(IMG.portHero,pad+ph/2,top+ph-2,ph*0.92,1,0.5,1);
  const bx=pad+ph+8, by=top+6, bw=W*0.38, bh=Math.max(10,H*0.016);
  woodFrame(bx,by,bw,bh+42);
  pix(bx+4,by+4,bw-8,bh,'#1a1010');
  pix(bx+4,by+4,(bw-8)*(G.hearts/max),bh,C.teal);
  for(let i=0;i<max;i++){
    cx.fillStyle=i<G.hearts?C.blood:'#4a3030';
    cx.font=`${Math.max(12,H*0.02)|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
    cx.fillText(i<G.hearts?'♥':'♡',bx+6+i*16,by+bh+16);
  }
  const need=needExp(G.lv), prev=needExp(G.lv-1)||0, span=Math.max(1,need-prev);
  const ratio=G.lv>=5?1:Math.max(0,Math.min(1,(G.exp-prev)/span));
  pix(bx+4,by+bh+20,bw-8,6,'#1a1010');
  pix(bx+4,by+bh+20,(bw-8)*ratio,6,C.lamp);
  cx.fillStyle=C.ink;cx.font=`${Math.max(10,H*0.016)|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
  cx.fillText(`Lv${G.lv} ${weapon().name}`,bx+4,by+bh+38);
  const boss=G.en.find(e=>e.type==='okami'||e.type==='red');if(!boss)return;
  woodFrame(W-pad-ph,top,ph,ph);
  blit(IMG.portOkami,W-pad-ph/2,top+ph-2,ph*0.92,1,0.5,1);
  const rbx=W-pad-ph-8-bw;
  woodFrame(rbx,by,bw,bh+22);
  pix(rbx+4,by+4,bw-8,bh,'#1a1010');
  const br=Math.max(0,boss.hp/boss.max);
  pix(rbx+4+(bw-8)*(1-br),by+4,(bw-8)*br,bh,C.blood);
  cx.fillStyle=C.lamp;cx.font=`${Math.max(10,H*0.018)|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
  cx.fillText(boss.type==='red'?'正体':'女将',rbx+6,by+bh+20);
}
function drawFx(){
  for(const f of G.fx){
    if(f.k==='hit'){
      const a=Math.max(0,f.t*3);cx.save();cx.globalAlpha=Math.min(1,a);
      cx.translate(f.x|0,f.y|0);
      for(let i=0;i<10;i++){
        const ang=i*0.63,r=8+(0.38-f.t)*90;
        pix(Math.cos(ang)*r,Math.sin(ang)*r,i%2?5:3,i%2?5:3,i%2?'#fff6d0':'#f0b44a');
      }
      pix(-8,-8,16,16,'#fff1a8');cx.restore();
    }else if(f.k==='slash'){
      cx.save();cx.globalAlpha=Math.max(0,f.t*6);
      cx.translate(f.x|0,f.y|0);if(f.face<0)cx.scale(-1,1);
      pix(0,-6,28,4,'#fff6d0');pix(8,-16,18,4,'#f0b44a');pix(12,6,16,3,'#ffd080');
      cx.restore();
    }else if(f.k==='dust'){
      cx.save();cx.globalAlpha=Math.max(0,f.t*4);
      pix((f.x-10)|0,(f.y-6)|0,6,4,'#c4a070');
      pix((f.x+6)|0,(f.y-8)|0,5,3,'#8a6a48');
      pix((f.x-2)|0,(f.y-12)|0,4,3,'#d8c090');
      cx.restore();
    }else if(f.k==='num'){
      cx.save();cx.globalAlpha=Math.max(0,f.t*(f.rare?1.4:2));
      cx.fillStyle=f.rare?'#ffe56a':C.lamp;
      cx.font=`${Math.max(f.rare?20:16,(f.rare?18:14)*S())|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
      cx.fillText(f.s,(f.x-12)|0,(f.y-32*(1-Math.min(1,f.t)))|0);cx.restore();
    }
  }
}
function drawTalk(){
  const indoor=G.room.bg==='desk'||G.room.bg==='guest';
  const speaker=((G.room.lines||[])[G.line]||{}).w;
  const showOkami=G.room.id==='desk'||G.room.id==='afterYard';
  if(indoor){
    const y=H*0.98;
    const heroH=H*(speaker==='剣士'?0.58:0.48);
    const okaH=H*(speaker==='女将'?0.60:0.48);
    if(showOkami)drawOkami({x:W*0.72,y,face:-1,type:'okami',hurt:0},true,okaH/charH());
    drawHero({x:W*0.26,y,face:1,slash:0,hurt:0,h:heroH,vx:0},true);
  }else{
    const y=gy(), h=charH();
    drawHero({x:W*0.26,y,face:1,slash:0,hurt:0,h,vx:0},false);
    if(showOkami)drawOkami({x:W*0.74,y,face:-1,type:'okami',hurt:0},false);
  }
}
function drawActors(){
  const items=[];
  if(G.p)items.push({y:G.p.y,draw:()=>drawHero(G.p,false)});
  for(const e of G.en){
    const y=e.type==='lan'?e.y+charH()*0.2:e.y;
    items.push({y,draw:()=>e.type==='lan'?drawLantern(e):drawOkami(e,false)});
  }
  items.sort((a,b)=>a.y-b.y);
  for(const it of items)it.draw();
}

function draw(){
  cx.imageSmoothingEnabled=true;
  if(!G||G.mode==='boot'||G.mode==='title'||G.mode==='op'){
    if(!cover(IMG.title))sky();
    return;
  }
  cx.save();
  if(G.shake>0){const m=G.shake*10;cx.translate((Math.random()*2-1)*m,(Math.random()*2-1)*m*0.55);}
  drawBG();
  if(G.mode==='talk')drawTalk();
  if(G.mode==='play'||G.mode==='over'){
    drawLoot();drawActors();drawFx();drawBars();
    if(G.toast){
      cx.save();cx.globalAlpha=Math.min(1,G.toast.t*2);
      const tw=Math.min(W-16, 12+G.toast.s.length*14), th=28, tx=(W-tw)/2, ty=H*0.18;
      woodFrame(tx,ty,tw,th);
      cx.fillStyle=C.moon;cx.font=`${Math.max(12,H*0.022)|0}px "Hiragino Mincho ProN","Yu Mincho",serif`;
      cx.textAlign='center';cx.fillText(G.toast.s,W/2,(ty+20)|0);cx.textAlign='left';
      cx.restore();
    }
  }
  if(G.flash>0){
    cx.fillStyle=`rgba(255,236,200,${Math.min(0.35,G.flash*2.2)})`;
    cx.fillRect(0,0,W,H);
  }
  cx.restore();
}

let last=0;
function loop(ts){
  const dt=Math.min((ts-last)/1000||0,0.05);last=ts;
  if(G&&!paused)update(dt);
  draw(ts);
  requestAnimationFrame(loop);
}

G={mode:'boot',hearts:3,hard:false,ri:0,fx:[],lv:1,exp:0,weapon:'wakizashi',armor:'tabi'};
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
  if(opv.currentTime>0.03){opv.classList.add('is-on');$('title').classList.add('hidden');if(!mute)opv.muted=false;}
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
