const { EmbedBuilder } = require('discord.js');
const store = require('../scheduler/services/scheduleStore');
const isAdmin = require('../../utils/isAdmin');

module.exports = {
  name: 'gall',
  async execute(msg) {
    if (!isAdmin(msg.member)) return;
    const all = store.getAll();
    if (!all.length) return msg.reply('現在アクティブな募集はありません');

    const lines = all.map(o => `• \`${o.id}\` ${o.title} (${o.dates.join(', ')})`);
    const embed = new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle('📋 アクティブ募集一覧')
      .setDescription(lines.join('\n'));

    msg.reply({ embeds: [embed] });
  }
};
