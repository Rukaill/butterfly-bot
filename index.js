/*******************************************************
 * butterfly-bot  起動エントリ
 *   - Discord.js v14
 *   - Express ヘルスチェック (PORT)
 *   - Google / DQX 各種ジョブを登録
 ******************************************************/
require('dotenv').config();

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const { ChannelType } = require('discord.js');

const client  = require('./config/client'); // intents/partials 設定済み Client
const store   = require('./features/scheduler/services/scheduleStore');

/* ====================================================
 * 🌐 ヘルスチェック用 Web サーバー (Koyeb などで必須)
 * ==================================================== */
const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('🦋 butterfly-bot is alive!'));
app.listen(PORT, () => console.log(`✅ Web server running on ${PORT}`));

/* ====================================================
 * 🗓 毎朝 7:00 Google カレンダー通知
 * ==================================================== */
const setupDailyReminder = require('./features/scheduler/jobs/dailyReminder');
setupDailyReminder(client, process.env.RECRUIT_CHANNEL_ID); // 通知チャンネル

/* ====================================================
 * 📦 イベント／ルーティン・ボイス通知などのジョブ登録
 * ==================================================== */
require('./features/common/events/ready')(client);
require('./features/common/events/messageCreate')(client);
require('./features/common/events/voiceStateUpdate')(client);

require('./features/scheduler/events/reactionAdd')(client);          // 募集リアクション管理
require('./features/dqx/jobs/eventNotifier')(client);                // 運営イベント通知

/* ====================================================
 * 🎙 デバッグ用ログ (VC 入退室)
 * ==================================================== */
client.on('voiceStateUpdate', (oldS, newS) => {
  console.log('--- voiceStateUpdate ---',
    'Old:', oldS.channelId,
    'New:', newS.channelId,
    'User:', newS.member?.user?.tag);
});

/* ====================================================
 * ❗ 投票スケジューラ用 リアクション取得
 * ==================================================== */
client.on('messageReactionAdd', (reaction, user) => {
  if (user.bot) return;
  if (store.hasSchedule(reaction.message.id)) {
    store.addVote(reaction.message.id, reaction.emoji.name, user.id);
  }
});

/* ====================================================
 * ❗ Bot コマンド読み込み (!xxxx)
 * ==================================================== */
client.commands = new Map();
(function loadCommands(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return loadCommands(full);
    if (entry.name.endsWith('.js')) {
      const cmd = require(full);
      client.commands.set(cmd.name, cmd);
    }
  });
})(path.join(__dirname, 'features'));

client.on('messageCreate', msg => {
  if (msg.author.bot || !msg.content.startsWith('!')) return;
  const args  = msg.content.slice(1).trim().split(/\s+/);
  const name  = args.shift().toLowerCase();
  const cmd   = client.commands.get(name);
  if (cmd) cmd.execute(msg, args);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'コマンド実行時にエラーが発生しました。', ephemeral: true });
  }
});


/* ====================================================
 * 🚀 起動
 * ==================================================== */
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Bot logged in & ready'))
  .catch(console.error);

client.once('ready', () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  require('./features/dqx/jobs/dqRoutineNotifier')(client);
});
