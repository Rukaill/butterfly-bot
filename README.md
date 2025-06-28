# 🦋 butterfly-bot（日本語版）

**Node.js** 製の Discord Bot です。スプラトゥーンやドラクエ10などのマルチプレイゲーム管理に加え、Google カレンダー連携、Steam セール情報の自動通知などを行います。本 README では導入理由・各種コマンド・Google OAuth2 設定手順をまとめています。

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
│   └─ scheduler/
│        └─ commands/
│             ├─ gadd.js    # 予定追加
│             └─ glist.js   # 予定一覧
├─ token.json               # OAuth 認証結果（git ignore）
├─ .env                     # 認証情報（git ignore）
├─ index.js                 # Bot エントリポイント
└─ README.md                # 本ファイル
```

---

## ⚙️ 環境変数（.env）

| 変数名 | 説明 |
|---------|------|
| `DISCORD_TOKEN` | Discord Bot トークン |
| `GOOGLE_CLIENT_ID` | OAuth2 クライアント ID |
| `GOOGLE_CLIENT_SECRET` | OAuth2 クライアント シークレット |
| `GOOGLE_REFRESH_TOKEN` | 取得済みリフレッシュトークン（token.json から抽出） |
| `GOOGLE_CALENDAR_ID` | 予定を追加するカレンダー ID |

> `.env` と `token.json` は **必ず Git から除外** してください（`.gitignore`）

---

## 🚀 主要 npm スクリプト

| スクリプト | 内容 |
|------------|------|
| `npm start` | `node index.js` 本番起動 |
| `npm run dev` | `nodemon index.js` 開発モード |
| `npm run auth` | `node services/google/auth.js` OAuth2 フロー実行 |

> 初回だけ `npm run auth` を実行し、ブラウザで認証して `token.json` を生成します。

---

## 🗂 コマンド一覧（Discord）

| コマンド | 機能 | 備考 |
|----------|------|------|
| `!ping` | Bot 応答テスト | `pong!` を返す |
| `!recruit` | ゲーム募集メッセージ作成 | リアクションで日程投票 |
| `!fix` | 募集日程確定＋リマインド設定 | 1 時間前通知 |
| `!gadd <タイトル>` | Google カレンダーに 1 時間枠で予定を追加 | 今すぐ＋1h |
| `!glist [日数]` | 直近 *n* 日の予定一覧を Embed 表示 | 既定 7 日 |

---

## 🔑 Google OAuth2 設定手順（簡易）

1. **GCP → 認証情報**で「OAuth 2.0 クライアント ID（デスクトップ）」を発行。
2. `.env` に `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` を追加。
3. `npm run auth` を実行 → ブラウザで認可 → `token.json` と `refresh_token` を取得。
4. `.env` に `GOOGLE_REFRESH_TOKEN` を貼り付け。（token.json だけでも可）
5. Google カレンダーの「設定と共有」で **サービスアカウント** or 自分アカウントを編集権限付きで共有。

> Koyeb などのホスティング環境では `.env` の全変数を環境変数タブにそのまま登録すれば動作します。token.json は不要です。

---

## ✨ 追加予定・アイデア

- `!gremove` 予定削除、`!gupdate` 予定編集
- 自動リマインダー機能（30分前 DM / チャンネル通知）
- `!gsearch <keyword>` で予定検索
- 月間カレンダー画像出力 (`!gcalendar`) などのビジュアル化

---

🎮 ゲーム仲間の集いを、もっと便利に。
