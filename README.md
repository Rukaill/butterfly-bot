# 🦋 butterfly-bot（日本語版）

**Node.js** 製の Discord Bot です。

---

## 📂 プロジェクト構成

```
butterfly-bot/
├─ commands/          # 個別のコマンドモジュール（ping.jsなど）
├─ test/              # Jest によるユニットテスト
├─ index.js           # メインエントリーポイント（Bot起動 + ヘルスチェック）
├─ .env.example       # 環境変数テンプレート（本番用 .env はGitに含めない）
├─ .prettierrc        # Prettier の整形ルール
├─ .prettierignore    # Prettier が無視するファイル一覧
├─ eslint.config.mjs  # ESLint の設定（Node.js環境指定）
├─ package.json       # スクリプトや依存関係の定義
└─ README.md          # ← 本ファイル
```

---

## ⚙️ 使用する環境変数

| 名前                    | 用途                            |
| --------------------- | ----------------------------- |
| `DISCORD_TOKEN`       | Discord Bot トークン（開発者ポータルから取得） |
| `GOOGLE_CLIENT_EMAIL` | Google API用サービスアカウントのメールアドレス  |
| `GOOGLE_PRIVATE_KEY`  | サービスアカウントの秘密鍵（\n はエスケープ）      |
| `PORT`                | Expressのポート番号（省略時は **8000**）  |

`.env.example` を参考に `.env` を作成し、**Gitには含めないよう **\`\`** に記述**してください。

---

## 🛠 インストール手順

```bash
# リポジトリをクローンして移動
git clone https://github.com/<ユーザー名>/butterfly-bot.git
cd butterfly-bot

# 必要パッケージのインストール
npm install
```

---

## 🚀 npm スクリプト一覧

| コマンド              | 実行内容                 | 説明                |
| ----------------- | -------------------- | ----------------- |
| `npm run dev`     | `nodemon index.js`   | 開発中に自動再起動するモード    |
| `npm start`       | `node index.js`      | 本番起動（Koyeb で使用）   |
| `npm test`        | `jest`               | Jest によるユニットテスト   |
| `npm run lint`¹   | `eslint .`           | ESLint による静的解析    |
| `npm run format`¹ | `prettier . --write` | Prettier によるコード整形 |

¹ 下記のように `package.json` に追加します：

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest",
  "lint": "eslint .",
  "format": "prettier . --write"
}
```

---

## ✨ 導入ツールとその目的

| ツール名         | npm パッケージ名               | 導入理由                               |
| ------------ | ------------------------ | ---------------------------------- |
| **Prettier** | `prettier`（開発依存）         | コード整形を統一してレビュー効率UP・可読性向上           |
| **ESLint**   | `eslint` + `@eslint/js`等 | 静的解析。未使用変数や文法ミス検出 (`require`未定義など) |
| **Jest**     | `jest`（開発依存）             | ユニットテスト。コマンドロジックなどの動作確認に有効         |
| **nodemon**  | `nodemon`（開発依存）          | 開発中に保存するたびに自動で再起動（効率向上）            |

---

## 🗂 コマンド構造

各ファイルは `name`, `description`, `execute()` を持つオブジェクトを `module.exports` で定義します：

```js
// commands/ping.js
module.exports = {
  name: 'ping',
  description: 'Pingコマンド',
  execute(msg) {
    msg.reply('pong!');
  },
};
```

**index.js** では以下のようにコマンドファイルを自動読み込み：

```js
const fs = require('fs');
client.commands = new Map();
fs.readdirSync('./commands')
  .filter(f => f.endsWith('.js'))
  .forEach(f => {
    const cmd = require(`./commands/${f}`);
    client.commands.set(cmd.name, cmd);
  });
```

これによりメイン処理がシンプルになり、新しいコマンド追加も容易です。

---

## ☁️ Koyeb へのデプロイ手順

1. Koyeb で **GitHubリポジトリを接続** → *New App* → Gitからデプロイ
2. 環境変数（`DISCORD_TOKEN`, `GOOGLE_PRIVATE_KEY` 等）を設定
3. **Scaling は Min=1 / Max=1** にする（重複起動を防ぐ）
4. `npm start` を実行し、Express のヘルスチェック `/` が正常起動の目印となる

**main ブランチに push すると自動で再デプロイ**されます。

---

## 💡 今後の拡張予定

* スラッシュコマンドの自動登録
* Discord.js モックを用いた統合テスト
* GitHub Actions による CI (`npm test && npm run lint`)
* Docker 対応（他ホスティングやローカル開発向け）

---

🎮 ゲーム仲間の集いを、もっと楽しく、もっと便利に。
