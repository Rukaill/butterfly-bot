const store = require('../scheduler/services/scheduleStore');
const isAdmin = require('../../utils/isAdmin');

module.exports = {
  name: 'gcleanup',
  async execute(msg) {
    if (!isAdmin(msg.member)) return;
    const before = store.getAll().length;
    store.cleanupPast();
    const after = store.getAll().length;
    msg.reply(`🧹 期限切れイベントを削除しました (${before - after} 件)`);
  }
};
