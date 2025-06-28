module.exports = {
  name: 'ping',
  description: 'Pingコマンド',
  execute(msg) {
    msg.reply('pong!');
  }
};
