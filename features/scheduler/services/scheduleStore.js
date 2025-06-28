// features/scheduler/services/scheduleStore.js
const schedules = new Map();           // messageId → { dates, emojis }
const votes     = new Map();           // messageId → Map<emoji, Set<userId>>

module.exports = {
  create(messageId, { title, description, dates, emojis }) {
    schedules.set(messageId, { title, description, dates, emojis });
    votes.set(messageId, new Map());
    console.log('[STORE] create', messageId, title, dates);
  },

  /** 募集メッセージIDが登録済みか？ */
  hasSchedule(messageId) {
    return schedules.has(messageId);
  },

  getSchedule(messageId) {
    return schedules.get(messageId);
  },

  addVote(messageId, emoji, userId) {
    if (!votes.has(messageId)) return;
    const emojiVotes = votes.get(messageId);
    if (!emojiVotes.has(emoji)) emojiVotes.set(emoji, new Set());
    emojiVotes.get(emoji).add(userId);
    console.log('[STORE] vote', messageId, emoji, userId);
  },

  getVotes(messageId, emoji) {
    return votes.get(messageId)?.get(emoji) ?? new Set();
  }
};
