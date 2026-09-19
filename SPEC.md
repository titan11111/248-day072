# 塩見の館 — 仕様

## 0. ドキュメント情報
- 対象ゲーム: 248-day072
- 作成日: 2026-09-19
- 更新日: 2026-09-19
- ステータス: 実装済み
- 参照ファイル: index.html / style.css / script.js / opening.mp4 / images/title.webp

## 1. ゲーム概要
- ジャンル: 部屋送りアクション（会話→移動→斬撃）
- 一言説明: 夜の宿に招かれ、おもてなしの正体を斬る。
- 想定プレイ時間: 5〜8分
- 想定プレイヤー: iPhone縦持ち。100日チャレンジ Day072
- クリア体験の要点: 女将の歓迎から提灯お化け、中庭、正体までを一続きで斬り抜ける

## 2. 対象環境

### 必須
- 配信先: GitHub Pages
- 最優先端末: iPhone Safari
- 対応画面幅: 320px〜430px
- 実装方式: 静的 HTML / CSS / JS。外部CDNなし

## 3. 操作 / 設定UI（必須・実装1手目）

| 項目 | 内容 |
|---|---|
| 画面 | 上75% `#game-stage` / 下25% `#control-deck` |
| 入力 | Pointer Events + `setPointerCapture`。十字はDOMオーバーレイ |
| タッチ | 左: 十字。右: 次へ／斬、跳。システム: ミュート・ポーズ |
| キーボード | ←→↑↓ / Z・X 斬 / Space 跳または次へ / Enter 次へ / P・Escape ポーズ / M ミュート |
| ポーズ | Ⅱ / P / Escape / タブ非表示。プレイヤーが自分で止められる |
| ミュート | `tg.248.mute` |
| クリア記録 | `tg.248.cleared` `tg.248.best`（残りハート） |
| 音声unlock | はじめるタップで AudioContext。OP動画はその後に再生 |
| iOS | viewport / safe-area / ダブルタップ防止。body=`manipulation`、canvas=`none` |

## 4. コアループ
- 聞く → 走る → 斬る、を部屋単位で繰り返す
- ハート3。0でその部屋から再戦
- 帳場で茶を受ける／断る。断ると提灯が1体増える

## 5. 画面 / 状態遷移
- boot（はじめる）→ op（opening.mp4、0.4秒後スキップ可）→ title → talk／play → over または clear
- 部屋: 帳場 → 客間 → 廊下 → 中庭 → 正体

## 6. 勝敗
- クリア: 正体の女将を倒す
- 敗北: ハート0。再戦でその戦闘部屋へ
- スコア: クリア時の残りハートをベストとして保存

## 7. 音声
- 開始タップで AudioContext。失敗してもゲームは止めない
- OP中はBGMを止める。終了後に矩形＋三角＋ノイズの3声ループ
- SE: 斬・被弾・選択・クリア。ミュート時は無音
- `visibilitychange` でポーズ＋BGM停止

## 8. ファイル構成
```
248-day072/
  index.html
  style.css
  script.js
  opening.mp4
  images/title.webp
  SPEC.md
  LEARNINGS.md
```

## 9. 実装制約
- 公開実体 20.00MB 以下（`.git` 除外）
- バニラJS。`requestAnimationFrame`
- 台詞は `textContent`。ユーザー入力を innerHTML に渡さない
- 1ファイル 1000行超で分割

## 10. 未確定事項
なし（公開ブロッカーなし）
