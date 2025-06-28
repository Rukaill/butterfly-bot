// features/scheduler/jobs/dailyReminder.js
const cron = require('node-cron');
const calendarService = require('../../../services/google/calendarService');
const dayjs = require('dayjs');
const { EmbedBuilder } = require('discord.js');

module.exports = (client, channelId) => {
  // 毎朝 7:00 に実行
  cron.schedule('0 7 * * *', async () => {
    try {
      const events = await calendarService.listUpcomingEvents(1, 10);
      if (!events.length) return;

      const lines = events.map(ev => {
        const start = ev.start.dateTime || ev.start.date;
        return `• ${dayjs(start).format('MM/DD HH:mm')} – **${ev.summary}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`☀️ 今日の予定（${events.length} 件）`)
        .setDescription(lines);

      const channel = await client.channels.fetch(channelId);
      await channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('[AutoPost Error]', err);
    }
  });
};
