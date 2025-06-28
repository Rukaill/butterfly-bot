// features/scheduler/commands/glist.js
const dayjs = require('dayjs');
const calendarService = require('../../../services/google/calendarService');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'glist',
  description: '!glist [日数]   直近の予定を一覧表示',

  async execute(msg, args) {
    const days = Number(args[0]) || 7;   // デフォルト7日
    try {
      const events = await calendarService.listUpcomingEvents(days, 10);

      if (!events.length) {
        return msg.reply(`📅 今後 ${days} 日以内の予定はありません`);
      }

      // 予定を整形
      const lines = events.map(ev => {
        const start = ev.start.dateTime || ev.start.date; // 終日予定対応
        return `• ${dayjs(start).format('MM/DD HH:mm')} – **${ev.summary}**`;
      }).join('\n');

      // Embed 表示
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📅 直近 ${days} 日の予定 (${events.length} 件)`)
        .setDescription(lines);

      msg.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      msg.reply('❌ 予定一覧の取得に失敗しました');
    }
  },
};
