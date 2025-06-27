module.exports = {
  name: 'ping',
  description: 'Ping command',
  execute(msg) {
    msg.reply('pong!');
  },
};
