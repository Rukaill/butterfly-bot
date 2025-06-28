const calendarService = require('../../../services/google/calendarService');
const dayjs = require('dayjs');

module.exports = {
  name: 'gadd',
  description: 'Googleカレンダーに予定を追加',

  async execute(msg, args) {
    const title = args.join(' ') || '無題イベント';
    const start = dayjs().add(1, 'hour');
    const end   = start.add(1, 'hour');

    await calendarService.createEvent({
      summary: title,
      description: `登録者: ${msg.author.username}`,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });

    msg.reply(`📅 Googleカレンダーに「${title}」を登録しました！（${start.format('MM/DD HH:mm')}〜）`);
  },
};
