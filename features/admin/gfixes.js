const { EmbedBuilder } = require('discord.js');
const store = require('../scheduler/services/scheduleStore');
const isAdmin = require('../../utils/isAdmin');

module.exports = {
  name: 'gfixes',
  async execute(msg) {
    if (!isAdmin(msg.member)) return;
    const fixes = store.getAllFixes();
    if (!fixes.length) return msg.reply('fix履歴はありません');
    const embed = new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle('🗂 過去に確定したイベント')
      .setDescription(
        fixes.map(f => `• \`${f.id}\` ${f.fixedDate} (<${f.calendarEventId || '未登録'}>)`).join('\n')
      );
    msg.reply({ embeds: [embed] });
  }
};
