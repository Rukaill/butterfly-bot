// services/google/auth.js
//
// OAuth2 デスクトップフロー用：
// 1) ブラウザで認証ページを開く
// 2) http://localhost:3000/oauth2callback でコードを受け取る
// 3) token.json にトークンを保存
//
// .env に以下を用意してください
//  GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
//  GOOGLE_CLIENT_SECRET=xxxxxxxx
//  TOKEN_PATH=token.json           （任意、省略時は token.json で保存）

require('dotenv').config();
const fs   = require('fs');
const http = require('http');
const url  = require('url');
const { google } = require('googleapis');

const SCOPES      = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH  = process.env.TOKEN_PATH || 'token.json';
const CLIENT_ID   = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT        = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

(async () => {
  // open は ES モジュールなので動的 import
  const open = (await import('open')).default;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // 既にトークンがあれば読み込んで終了
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    console.log(`✅ 既存トークンを読み込みました: ${TOKEN_PATH}`);
    process.exit(0);
  }

  // 認証 URL を生成してブラウザで開く
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // refresh_token を必ず取得
  });

  console.log('🔗 ブラウザで認証ページを開きます…');
  await open(authUrl);

  // ローカル HTTP サーバーでコードを受け取る
  const server = http
    .createServer(async (req, res) => {
      if (!req.url.startsWith('/oauth2callback')) return;

      const qs   = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
      const code = qs.get('code');

      if (!code) {
        res.end('認証コードが取得できませんでした');
        return;
      }

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log(`✅ トークンを保存しました → ${TOKEN_PATH}`);
        res.end('認証が完了しました！このウィンドウを閉じてください。');
      } catch (err) {
        console.error('❌ トークン取得に失敗', err);
        res.end('トークン取得に失敗しました。ターミナルを確認してください。');
      } finally {
        server.close();
      }
    })
    .listen(PORT, () => {
      console.log(`🌐 ローカルサーバー待機中: http://localhost:${PORT}`);
    });
})();
