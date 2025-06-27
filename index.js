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
  ],
});

const fs = require('fs');
const path = require('path');

client.commands = new Map();
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


client.once('ready', () => console.log(`✅ Bot ready: ${client.user.tag}`));

client.on('messageCreate', (msg) => {
  if (!msg.content.startsWith('!') || msg.author.bot) return;

  const args = msg.content.slice(1).split(' ');
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (command) {
    command.execute(msg, args);
  }
});

