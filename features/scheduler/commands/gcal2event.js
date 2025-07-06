const { google } = require('googleapis');
const calendarService = require('../../../services/google/calendarService');

module.exports = {
  name: 'gcal2event',
  description: '今月のGoogleカレンダー予定をDiscordイベントに登録',
  async execute(msg, args) {
    if (!msg.guild) return msg.reply('サーバー内でのみ使用できます');
    const guild = msg.guild;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let events;
    try {
      events = await calendarService.listEvents({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      });
    } catch (e) {
      console.error(e);
      return msg.reply('Googleカレンダーの取得に失敗しました');
    }
    if (!events || events.length === 0) {
      return msg.reply('今月の予定はありません');
    }

    let created = 0;
    for (const ev of events) {
      try {
        await guild.scheduledEvents.create({
          name: ev.summary || '予定',
          scheduledStartTime: ev.start.dateTime || ev.start.date,
          scheduledEndTime: ev.end?.dateTime || ev.end?.date,
          privacyLevel: 2, // GUILD_ONLY
          entityType: 3,   // EXTERNAL
          description: ev.description || '',
          entityMetadata: { location: ev.location || '未定' },
        });
        created++;
      } catch (err) {
        console.error('イベント作成失敗:', err);
      }
    }
    msg.reply(`${created}件のイベントを作成しました`);
  },
};
