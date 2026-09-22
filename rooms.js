/* 塩見の館 — 部屋データ（ステージ1〜3）
   script.js が 1000行を超えたため分離した（SPEC 9. 実装制約）。
   ここは純粋なデータのみ。描画・状態は持たせない。
   索引が next の宛先そのものなので、**途中に部屋を差し込むと分岐先がずれる**。
   追加は必ず末尾へ。並べ替えるときは branch.opts[].next も同時に直すこと。 */
window.SHIOMI_ROOMS=[
  {id:'desk',kind:'talk',place:'帳場',bg:'desk',lines:[
    {w:'女将',t:'塩見の館へようこそ。'},
    {w:'女将',t:'遠いところを、ようおいでくださいました。'},
    {w:'剣士',t:'……人が、おらんようだが。'},
    {w:'女将',t:'今夜は月が欠けておりますゆえ。お茶をどうぞ。'}
  ],choice:true,okami:true,next:1},
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
  ],okami:true,next:9},
  {id:'true',kind:'play',place:'正体',bg:'yard',next:10},
  {id:'awake',kind:'talk',place:'正体',bg:'yard',salt:1,lines:[
    {w:'剣士',t:'……終わった、か。'},
    {w:'女将',t:'いいえ。わたくしは、戸口に立っていただけ。'},
    {w:'女将',t:'開けてしまわれましたね。'},
    {w:'剣士',t:'障子の向こうで、海が鳴った。潮の音が、逆さに聞こえる。'},
    {w:'剣士',t:'館が、ゆっくりと目を開けた。'},
    {w:'剣士',t:'女将の消えたあとに、塩がひとつまみ残っていた。'},
    {w:'???',t:'四つ。四つ集めて、舳先から撒け。'},
    {w:'剣士',t:'誰の声かは、わからなかった。'}
  ],next:11},

  /* ── ステージ2: 島の外（逃走）──
     自由移動の探索にはしない。部屋送りエンジンのまま「分かれ道を選ぶ」で分岐させる（SPEC 4-2）。
     分岐は 11→(12|13)→14→(15-16|17)→18 で必ず合流する。 */
  {id:'outRoad',kind:'talk',place:'島の外・坂道',bg:'road',lines:[
    {w:'剣士',t:'館の戸を蹴破ると、外はもう朝ではなかった。'},
    {w:'剣士',t:'空も海も、夜の側へ傾いている。'},
    {w:'???',t:'港へ。船の舳先から撒け。四つ、そろえて。'},
    {w:'剣士',t:'坂道が、二つに分かれている。'}
  ],branch:{opts:[
    {t:'浜沿いの道',next:12},
    {t:'杉林の近道',next:13}
  ]},next:12},
  {id:'beach',kind:'play',place:'浜沿いの道',bg:'road',next:14},
  {id:'woods',kind:'play',place:'杉林の近道',bg:'woods',next:14},
  {id:'ridge',kind:'talk',place:'島の外・尾根',bg:'road',lines:[
    {w:'剣士',t:'尾根に出た。眼下の港の灯が、点いては消える。'},
    {w:'剣士',t:'灯台の窓にも灯り。誰かが、まだ油を足している。'},
    {w:'剣士',t:'登れば刃が手に入る。下れば、早い。'}
  ],branch:{opts:[
    {t:'灯台へ登る',next:15},
    {t:'崖沿いに下る',next:17}
  ]},next:15},
  {id:'beaconFight',kind:'play',place:'灯台下',bg:'road',next:16},
  {id:'beaconLoot',kind:'loot',place:'灯台',bg:'road',loot:{kind:'weapon',id:'shiomi',name:'塩見の刀',shape:'rack',bonusExp:40},next:18},
  {id:'cliffRun',kind:'play',place:'崖沿いの道',bg:'road',next:18},
  {id:'salt2',kind:'talk',place:'島の外',bg:'road',salt:2,lines:[
    {w:'剣士',t:'道の終わりに、白いものが盛られていた。'},
    {w:'剣士',t:'潮が固まったものだ。ひとつまみ、懐へ入れる。'},
    {w:'???',t:'二つ。港の男に、名を訊くな。'}
  ],next:19},

  /* ── ステージ3: 港（既存の斬撃エンジンを流用）── */
  {id:'portArrive',kind:'talk',place:'港',bg:'port',okami:true,lines:[
    {w:'剣士',t:'桟橋に、船が一艘。舫綱は、ぴんと張っている。'},
    {w:'女将',t:'まあ。お客様、お帰りでございますか。'},
    {w:'剣士',t:'……斬ったはずだ。'},
    {w:'女将',t:'戸口は、どこにでもございますよ。'}
  ],next:20},
  {id:'wharf',kind:'play',place:'波止場',bg:'port',next:21},
  {id:'portTalk',kind:'talk',place:'桟橋',bg:'port',lines:[
    {w:'剣士',t:'舫綱を切ろうとして、手が止まった。'},
    {w:'剣士',t:'綱の先は、杭ではない。海へ伸びている。'},
    {w:'???',t:'撒け。撒かぬなら、沖で呑む。'}
  ],next:22},
  {id:'portBoss',kind:'play',place:'沖の主',bg:'port',boss:'沖の主',next:23},
  {id:'salt3',kind:'talk',place:'港',bg:'port',salt:3,lines:[
    {w:'剣士',t:'綱が切れた。海が、一度だけ静かになった。'},
    {w:'剣士',t:'杭の根元に、塩がひとつまみ。'},
    {w:'???',t:'三つ。あとは、海の上だ。'},
    {w:'剣士',t:'船に乗る。舳先はまだ、島を向いている。'}
  ],next:24}
];
