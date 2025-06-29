# 🦋 butterfly-bot（日本語版）

**Node.js** 製の Discord Bot です。スプラトゥーンやドラクエ10などのマルチプレイゲーム管理に加え、Google カレンダー連携を行います。

---

## 📂 プロジェクト構成

```text
butterfly-bot/
├─ config/                  Discord クライアント初期化
│   └─ client.js
├─ services/
│   └─ google/
│        ├─ auth.js         # 最初に実行して token.json を生成
│        ├─ authClient.js   # refresh_token または token.json を読み込む
│        └─ calendarService.js  # カレンダー操作ラッパー
├─ features/
│   ├─ scheduler/           # カレンダー・募集管理
│   │   └─ commands/
│   │        ├─ gadd.js     # 予定追加
│   │        └─ glist.js    # 予定一覧
│   ├─ splatoon/            # スプラトゥーン系機能
│   │   ├─ commands/
│   │   │    ├─ wroll.js    # 武器ガチャ
│   │   │    ├─ matchstart.js # プラベ開始
│   │   │    ├─ win.js      # 勝敗記録
│   │   │    ├─ matchjoin.js # 途中参加
│   │   │    └─ matchleave.js # 途中退出
│   └─ common/
│       └─ commands/
│            ├─ ping.js     # pong応答
│            └─ bhelp.js    # ヘルプ表示
├─ token.json               # OAuth 認証結果（git ignore）
├─ .env                     # 認証情報（git ignore）
├─ index.js                 # Bot エントリポイント
└─ README.md                # 本ファイル
```

---

## ⚙️ 環境変数（.env）

| 変数名                    | 説明                              |
| ---------------------- | ------------------------------- |
| `DISCORD_TOKEN`        | Discord Bot トークン                |
| `GOOGLE_CLIENT_ID`     | OAuth2 クライアント ID                |
| `GOOGLE_CLIENT_SECRET` | OAuth2 クライアント シークレット            |
| `GOOGLE_REFRESH_TOKEN` | 取得済みリフレッシュトークン（token.json から抽出） |
| `GOOGLE_CALENDAR_ID`   | 予定を追加するカレンダー ID                 |

> `.env` と `token.json` は **必ず Git から除外** してください（`.gitignore`）

---

## 🚀 主要 npm スクリプト

| スクリプト          | 内容                                          |
| -------------- | ------------------------------------------- |
| `npm start`    | `node index.js` 本番起動                        |
| `npm run dev`  | `nodemon index.js` 開発モード                    |
| `npm run auth` | `node services/google/auth.js` OAuth2 フロー実行 |

> 初回だけ `npm run auth` を実行し、ブラウザで認証して `token.json` を生成します。

---

## 🗂 コマンド一覧（Discord）

### **スプラ関連**

| コマンド                | 機能                                     |
| ------------------- | -------------------------------------- |
| `!wroll <チャンネルID>`  | 武器をランダムに抽選します（VC参加者から取得）※未指定時は自身のVCを対象 |
| `!matchstart <勝利数>` | 先取プラベを開始（ランダムチーム＋勝敗管理）                 |
| `!win`              | 勝敗を記録                                  |
| `!matchjoin <名前>`   | 試合に途中参加                                |
| `!matchleave <名前>`  | 試合から途中退出                               |

### **募集機能**

| コマンド                       | 機能                                |
| -------------------------- | --------------------------------- |
| `!recruit <タイトル> <候補日...>` | リアクション投票形式で募集メッセージを作成             |
| `!fix <メッセージID> <番号>`      | 募集日時を確定し、Googleカレンダーに登録（1時間前通知あり） |
| `!glist [日数]`              | 直近の予定一覧をEmbedで表示（既定：7日）           |
| `!gcleanup`                | 期限切れの募集・予定を削除                     |

### **その他**

| コマンド     | 機能                 |
| -------- | ------------------ |
| `!ping`  | 応答確認用コマンド（pongを返す） |
| `!bhelp` | 全コマンドのヘルプを表示       |

---

## 🔑 Google OAuth2 設定手順（簡易）

1. **GCP → 認証情報**で「OAuth 2.0 クライアント ID（デスクトップ）」を発行。
2. `.env` に `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` を追加。
3. `npm run auth` を実行 → ブラウザで認可 → `token.json` と `refresh_token` を取得。
4. `.env` に `GOOGLE_REFRESH_TOKEN` を貼り付け。（token.json だけでも可）
5. Google カレンダーの「設定と共有」で **サービスアカウント** or 自分アカウントを編集権限付きで共有。

> Koyeb などのホスティング環境では `.env` の全変数を環境変数タブにそのまま登録すれば動作します。token.json は不要です。

---