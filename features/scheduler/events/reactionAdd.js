// features/scheduler/events/reactionAdd.js
const store = require('../services/scheduleStore');
module.exports = (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    // Partial の場合は fetch
    if (reaction.partial) {
      try { await reaction.fetch(); }
      catch { return; }
    }

    const messageId = reaction.message.id;
    const emoji = reaction.emoji.name;

    if (!store.hasSchedule(messageId)) return;
    store.addVote(messageId, emoji, user.id);
  });
};
