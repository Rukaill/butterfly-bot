require('dotenv').config();
const client = require('./config/client'); // clientは config 側で定義済みなのでOK


// イベント登録（順番重要）
require('./features/common/events/ready')(client);
require('./features/common/events/messageCreate')(client);

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

