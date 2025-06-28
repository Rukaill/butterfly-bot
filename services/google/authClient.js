// services/google/authClient.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

module.exports = function getAuth() {
  const oAuth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost'   // 実際のランタイムでは使わない
  );

  // ------- ① token.json 優先 -------
  const tokenPath = path.join(__dirname, 'token.json');
  if (fs.existsSync(tokenPath)) {
    oAuth2.setCredentials(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));
    return oAuth2;
  }

  // ------- ② .env の refresh_token -------
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oAuth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return oAuth2;
  }

  throw new Error(
    'Google OAuth2 の資格情報が見つかりません。auth.js を実行して token.json を作成するか、GOOGLE_REFRESH_TOKEN を .env に設定してください。'
  );
};
