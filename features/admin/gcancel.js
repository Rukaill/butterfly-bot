const store = require('../scheduler/services/scheduleStore');
const calendarService = require('../../services/google/calendarService');
const isAdmin = require('../../utils/isAdmin');

module.exports = {
  name: 'gcancel',
  description: '!gcancel <messageId>',
  async execute(msg, [id]) {
    if (!isAdmin(msg.member)) return;
    const fix = store.getFix(id);
    if (!fix) return msg.reply('fix履歴が見つかりません');

    // Google カレンダー削除
    if (fix.calendarEventId) {
      try {
        await calendarService.deleteEvent(fix.calendarEventId);
      } catch (e) { console.error('Calendar delete error', e); }
    }

    store.delete(id);
    msg.reply(`🗑 イベント \`${id}\` をキャンセルし、ストアとカレンダーから削除しました`);
  }
};
