# gas-issue
Googleスプレッドシートを使ったGitHubのissueっぽい課題管理表。  
技術的な知識がない方でも簡単に利用できるよう、  
セットアップはコピペだけで完了し、  
UIは課題管理で馴染み深いExcelっぽい雰囲気にしています。

# ビルド
```
sh build.sh
```

# 利用者向けセットアップ方法
- スプレッドシートを作る
- スクリプトエディタを開く
- [./dist/index.js](https://raw.githubusercontent.com/naosim/gas-issue/main/dist/index.js)のソースをスクリプトエディタにコピペする
- setupを実行する
- 権限などを確認されたら、すべてokにする
- スプレッドシートをリロードする（メニューを読み込むため）
- 以下が確認できたらセットアップ完了
  - シートができている
    - 一覧
    - config
    - テンプレ
  - メニューに「課題管理」が表示されている

# 使い方
## 課題を作る
- メニュー → 課題管理 → 課題作成をクリック
- 課題のタイトルを入力し、OKを押す
- 以下が確認できたら完了
  - 一覧に作成した課題がある
  - 一覧に表示されたID列のリンクに飛ぶと、課題が表示される

# Q&A
## どうしてclaspを使わないの？
非エンジニアの方にも使っていただくためです。  
セットアップがコピペだけ済むようにしました。  
またUIも凝ったことをせず「安心のExcel感」を出しています。

## build.shは何してるの？
denoでTypeScriptをビルドしたコードをそのままGoogleAppsScriptで使うと「`import`は予約語だぞ」と怒られます。  
それを回避するために、build.shの中で黒魔術的な処理をしています。

# 開発コンセプト・設計思想など。思いつき
- 課題の内容は極力カスタマイズ可能にする
- 最終的にソースは1つにまとめ、gasのコードにコピペ1回で済むようにする
- オニオンアーキテクチャ：インフラ層、サービス層、ドメイン層
- SpreadsheetAppなどGAS独自のライブラリはインフラ層でのみ使える