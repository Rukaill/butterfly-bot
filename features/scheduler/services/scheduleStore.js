// features/scheduler/services/scheduleStore.js
const schedules = new Map();           // messageId → { dates, emojis }
const votes     = new Map();           // messageId → Map<emoji, Set<userId>>
const fixes     = new Map();   // messageId => { fixedDate, calendarEventId }

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

  /* 新規: 一覧取得 */
  getAll() {
    return [...schedules.entries()].map(([id, data]) => ({ id, ...data }));
  },

  /* 新規: 削除 */
  delete(id) {
    schedules.delete(id);
    votes.delete(id);
    fixes.delete(id);
  },

  addFix(messageId, fixedDate, calendarEventId) {
    fixes.set(messageId, { fixedDate, calendarEventId });
  },

  getVotes(messageId, emoji) {
    return votes.get(messageId)?.get(emoji) ?? new Set();
  },
  
  getFix(messageId) { return fixes.get(messageId); },

  getAllFixes()     { return [...fixes.entries()].map(([id,v])=>({id,...v})); },

  /* 新規: 期限切れ判定 */
  cleanupPast(now = Date.now()) {
    for (const [id, data] of schedules.entries()) {
      const last = data.dates.at(-1);
      if (new Date(last).getTime() < now) this.delete(id);
    }
  }

};
