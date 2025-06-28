require('dotenv').config();

const client = require('./config/client');
const fs     = require('fs');
const path   = require('path');
const store  = require('./features/scheduler/services/scheduleStore');

// 既存イベント登録
require('./features/common/events/ready')(client);
require('./features/common/events/messageCreate')(client);
require('./features/scheduler/events/reactionAdd')(client);

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

client.login(process.env.DISCORD_TOKEN);
console.log('✅ Bot started (OAuth2 calendar ready)');
