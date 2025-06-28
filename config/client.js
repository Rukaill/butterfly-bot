const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions   // ← Reactions用
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction] // 重要
});

module.exports = client;
