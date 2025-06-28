// features/scheduler/commands/glist.js
const dayjs = require('dayjs');
const { EmbedBuilder } = require('discord.js');
const calendarService = require('../../../services/google/calendarService');

module.exports = {
  name: 'glist',
  description: '!glist [日数] 直近予定一覧',

  async execute(msg, args) {
    const days = Number(args[0]) || 7;

    try {
      const events = await calendarService.listUpcomingEvents(days, 10) || []; // ← ★ ここで空配列フォールバック

      if (events.length === 0) {
        return msg.reply(`📅 今後 ${days} 日以内の予定はありません`);
      }

      const lines = events.map(ev => {
        const start = ev.start.dateTime || ev.start.date;
        return `• ${dayjs(start).format('MM/DD HH:mm')} – **${ev.summary}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📅 直近 ${days} 日の予定 (${events.length} 件)`)
        .setDescription(lines);

      await msg.reply({ embeds: [embed] });

    } catch (err) {
      console.error('glist error:', err);
      await msg.reply('❌ 予定一覧の取得に失敗しました');
    }
  },
};
