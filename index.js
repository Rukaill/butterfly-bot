// 必須: HTTPサーバーを立ててKoyebのヘルスチェックを通す
const express = require('express');
const app = express();

app.get('/', (_, res) => res.send('Bot is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Web server running on port ${PORT}`);
});

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once('ready', () => console.log(`✅ Bot ready: ${client.user.tag}`));

client.on('messageCreate', msg => {
  if (msg.content === '!ping') msg.reply('pong!');
});

client.login(process.env.DISCORD_TOKEN);
