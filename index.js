require('dotenv').config();

console.log(JSON.stringify(process.env.GOOGLE_PRIVATE_KEY));

const { google } = require('googleapis');

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // ここが重要
  ['https://www.googleapis.com/auth/calendar']
);

const client = require('./config/client'); // clientは config 側で定義済みなのでOK
const store = require('./features/scheduler/services/scheduleStore');

// イベント登録（順番重要）
require('./features/common/events/ready')(client);
require('./features/common/events/messageCreate')(client);
require('./features/scheduler/events/reactionAdd')(client);


client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('!')) return;

  const args = msg.content.slice(1).split(' ');
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (command) command.execute(msg, args);
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  const messageId = reaction.message.id;
  const emoji = reaction.emoji.name;

  // ✅ 登録された募集であれば記録
  if (store.hasSchedule(messageId)) {
    store.addVote(messageId, emoji, user.id);
  }
});




// コマンド読み込み
const fs = require('fs');
const path = require('path');
client.commands = new Map();

const loadCommands = (dirPath) => {
  fs.readdirSync(dirPath, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) return loadCommands(fullPath);
    if (entry.name.endsWith('.js')) {
      const command = require(fullPath);
      client.commands.set(command.name, command);
    }
  });
};
loadCommands(path.join(__dirname, 'features'));

client.login(process.env.DISCORD_TOKEN);
