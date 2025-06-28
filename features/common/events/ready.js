module.exports = (client) => {
  client.once('ready', () => {
    console.log(`✅ Bot ready: ${client.user.tag}`);
  });
};