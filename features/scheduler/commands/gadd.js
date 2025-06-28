// features/scheduler/commands/gadd.js
const calendarService = require('../../../services/google/calendarService');
const dayjs = require('dayjs');

module.exports = {
  name       : 'gadd',
  description: '!gadd <タイトル>  1時間枠で Google カレンダーに追加',

  async execute(msg, args) {
    if (!args.length) {
      return msg.reply('使い方: `!gadd <タイトル>`');
    }

    const title = args.join(' ');
    const start = dayjs().add(1, 'minute'); // 1分後
    const end   = start.add(1, 'hour');     // +1時間

    try {
      const link = await calendarService.createEvent({
        summary      : title,
        description  : `登録者: ${msg.author.tag}`,
        startDateTime: start.toISOString(),
        endDateTime  : end.toISOString(),
      });

      msg.reply(`📅 Google カレンダーに予定を追加しました!\n${link}`);
    } catch (err) {
      console.error(err);
      msg.reply('❌ 予定の追加に失敗しました。');
    }
  },
};
