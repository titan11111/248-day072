# 248-day072 LEARNINGS

## 2026-09-19 初稿（塩見の館）
- オープニングは `opening.mp4`（元 3.4MB → 562KB）。WebKit は H.264 が黒画面になることがあるので、フレームが来るまでタイトル静止画を残し、届いたら映像を重ねる。
- 操作盤を先に置いた（75/25、Pointer Events、`setPointerCapture`、十字、斬／次へ、跳、ミュート、ポーズ）。`localStorage` は `tg.248.mute` / `tg.248.cleared` / `tg.248.best`。
- コアループは聞く・走る・斬る。帳場の茶を断ると提灯が1体増える。
- harness PASS: `docs/harness-reports/248-day072-2026-09-19T09-30-00-758Z.md`。通しプレイ（Chromium）で帳場→客間→廊下→中庭まで到達、コンソールエラー0。iPhone実機は未実施。

## 2026-09-19 公開
- GitHub Pages へ出荷。公開後に URL と harness 再走を記録する。
