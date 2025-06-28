// services/google/authClient.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

module.exports = function getAuth() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost' // redirect URI
  );

  const tokenPath = path.join(__dirname, 'token.json');
  if (!fs.existsSync(tokenPath)) {
    throw new Error('❌ token.json が見つかりません。`auth.js` を先に実行してください。');
  }

  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
};
