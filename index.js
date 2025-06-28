require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('🦋 butterfly-bot is alive!'));
app.listen(PORT, () => console.log(`✅ Web server running on ${PORT}`));

const client = require('./config/client');
const fs     = require('fs');
const path   = require('path');
const store  = require('./features/scheduler/services/scheduleStore');


// 先頭で client 作成後に追加
const setupDailyReminder = require('./features/scheduler/jobs/dailyReminder');
setupDailyReminder(client, '1388260604808003645'); // ← 通知するチャンネルIDを指定

// 既存イベント登録
require('./features/common/events/ready')(client);
require('./features/common/events/messageCreate')(client);
require('./features/scheduler/events/reactionAdd')(client);
require('./features/common/events/voiceStateUpdate')(client);

client.on('voiceStateUpdate', (oldS, newS) => {
  console.log('--- voiceStateUpdate fired ---');
  console.log('Old:', oldS.channelId);
  console.log('New:', newS.channelId);
  console.log('User:', newS.member?.user?.tag);
});


// コマンド読み込み
client.commands = new Map();
(function loadCommands(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return loadCommands(full);
    if (e.name.endsWith('.js')) {
      const cmd = require(full);
      client.commands.set(cmd.name, cmd);
    }
  });
})(path.join(__dirname, 'features'));

client.on('messageCreate', (msg) => {
  if (msg.author.bot || !msg.content.startsWith('!')) return;
  const args = msg.content.slice(1).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const cmd = client.commands.get(commandName);
  if (cmd) cmd.execute(msg, args);
});

client.on('messageReactionAdd', (reaction, user) => {
  if (user.bot) return;
  if (store.hasSchedule(reaction.message.id)) {
    store.addVote(reaction.message.id, reaction.emoji.name, user.id);
  }
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Bot logged in & ready'))
  .catch(console.error);
