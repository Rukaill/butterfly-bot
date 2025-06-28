const { EmbedBuilder } = require('discord.js');
const store = require('../scheduler/services/scheduleStore');
const isAdmin = require('../../utils/isAdmin');

module.exports = {
  name: 'ginfo',
  async execute(msg, [id]) {
    if (!isAdmin(msg.member)) return;
    const sched = store.getSchedule(id);
    if (!sched) return msg.reply('募集が見つかりません');
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📄 詳細: ${sched.title}`)
      .setDescription(sched.description)
      .addFields(
        { name:'候補日', value: sched.dates.join('\n') },
        { name:'メッセージID', value: id, inline:true }
      );
    msg.reply({ embeds: [embed] });
  }
};
