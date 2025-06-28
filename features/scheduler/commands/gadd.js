// features/scheduler/commands/gadd.js
const { EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const calendarService = require('../../../services/google/calendarService');

module.exports = {
  name: 'gadd',
  description: '!gadd <タイトル> <日付> <時刻> 例) !gadd テスト 2025-07-01 10:00',

  async execute(msg, args) {
    if (args.length < 3) {
      return msg.reply('使い方: `!gadd タイトル 2025-07-01 10:00`');
    }

    // 末尾 2 要素 = 日付・時刻、残り = タイトル
    const time = args.pop();            // '10:00'
    const date = args.pop();            // '2025-07-01'
    const summary = args.join(' ');     // 'テスト'
    const dateTimeStr = `${date}T${time}`; // '2025-07-01T10:00'

    const start = dayjs(dateTimeStr);
    if (!start.isValid()) {
      return msg.reply('日時は `YYYY-MM-DD HH:mm` で入力してください。');
    }
    const end = start.add(1, 'hour');

    try {
      const event = await calendarService.createEvent({
        summary,
        description: `Discord 追加: ${msg.author.tag}`,
        startDateTime: start.toISOString(),
        endDateTime  : end.toISOString(),
      });

      const link = event.htmlLink || '(リンク取得失敗)';
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('📅 予定を追加しました')
        .setDescription(
          `**${summary}**\n` +
          `${start.format('MM/DD HH:mm')} 〜 ${end.format('HH:mm')}\n` +
          `[カレンダーを開く](${link})`
        );

      await msg.reply({ embeds: [embed] });
    } catch (e) {
      console.error('gadd error', e);
      await msg.reply('❌ Google カレンダーへの登録に失敗しました。');
    }
  },
};
