module.exports = (client) => {
  client.on('messageCreate', (msg) => {
    if (!msg.content.startsWith('!') || msg.author.bot) return;
    const args = msg.content.slice(1).split(' ');
    const name = args.shift().toLowerCase();
    const command = client.commands.get(name);
    if (command) command.execute(msg, args);
  });
};
