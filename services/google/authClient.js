const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// .env に記載された OAuth2 情報
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// OAuth2 クライアントを作成
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 方式①：token.json をファイルから読み込む（ローカル開発用）
const TOKEN_PATH = path.join(__dirname, 'token.json');

if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oAuth2Client.setCredentials(token);
} else if (process.env.GOOGLE_OAUTH_TOKEN_JSON) {
  // 方式②：環境変数から読み込む（Koyeb本番用）
  const token = JSON.parse(process.env.GOOGLE_OAUTH_TOKEN_JSON);
  oAuth2Client.setCredentials(token);
} else {
  console.error('❌ トークン情報が見つかりません');
}

module.exports = oAuth2Client;
