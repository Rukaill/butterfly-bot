// features/scheduler/events/reactionAdd.js
module.exports = (client) => {
  client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;
    const nums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const dateIndex = nums.indexOf(reaction.emoji.name);
    if (dateIndex === -1) return;

    store.addReaction(reaction.message.id, dateIndex, user.id);
  });
};
