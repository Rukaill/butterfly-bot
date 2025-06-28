const { EmbedBuilder } = require('discord.js');
const store = require('../services/scheduleStore'); // 今後使う用
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

module.exports = {
  name: 'recruit',

  async execute(msg, args) {
    // 入力チェック
    if (args.length < 4) {
      return msg.reply('入力形式が正しくありません。\n`!recruit @here タイトル 本文 日付,日付` の形式で入力してください');
    }

    // 入力値の分解
    const mention = args[0];
    const title = args[1];
    const description = args[2];
    const rawDateStr = args.slice(3).join(' ');
    const rawDates = rawDateStr.split(',').map(d => d.trim());

    const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪'];

    // 日付のバリデーションと整形（最大5つ）
    const dates = rawDates
      .filter(d => dayjs(d, ['M/D H:mm', 'YYYY/MM/DD HH:mm'], true).isValid())
      .slice(0, 5);

    if (!dates.length) {
      return msg.reply('日付形式が不正です。 例: `7/1 21:00`');
    }

    // 候補日程と絵文字の紐付け
    const formattedDates = dates.map((d, i) => `${emojis[i]}  ${d}`).join('\n');

    // Embedメッセージ作成
    const embed = new EmbedBuilder()
      .setColor(0x3399ff) // 青系カラー
      .setTitle(`🐳 ${title}`)
      .setDescription(
        `🌊 ${description}\n\n🌊 **候補日程（リアクションで参加表明！）**\n${formattedDates}\n\n❌ 不参加の方は ❌ を押してください`
      )
      .setFooter({ text: '参加できる日を選んでリアクションしてください！' });

    // メッセージ送信
    const sentMessage = await msg.channel.send({
      content: `📣 ${mention}`,
      embeds: [embed]
    });

    // リアクション追加
    for (let i = 0; i < dates.length; i++) {
      if (emojis[i]) {
        await sentMessage.react(emojis[i]);
      }
    }
    await sentMessage.react('❌'); // 不参加リアクション
    // リアクション付与が終わった直後
    store.create(sentMessage.id, {
      title,
      description,
      dates,
      emojis: [...emojis.slice(0, dates.length), '❌']
    });
  }
};
