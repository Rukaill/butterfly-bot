const { EmbedBuilder } = require('discord.js');
const store = require('../services/scheduleStore'); // 今後使う用
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

module.exports = {
  name: 'recruit',

  async execute(msg, args) {
    // 柔軟な引数解釈: !recruit [@here] タイトル [本文] 日付1 日付2 ...
    if (args.length < 2) {
      return msg.reply('入力形式が正しくありません。\n`!recruit タイトル 日付1 日付2 ...` の形式で入力してください');
    }

    let mention = '';
    let title = '';
    let description = '';
    let dateArgs = [];

    // mentionがあれば最初に
    if (args[0].startsWith('<@') || args[0] === '@here' || args[0] === '@everyone') {
      mention = args[0];
      title = args[1];
      // 本文がある場合: !recruit @here タイトル 本文 日付1 日付2 ...
      if (args.length > 3 && !args[2].match(/\d{1,2}\/\d{1,2}/) && !args[2].match(/\d{1,2}:\d{2}/)) {
        description = args[2];
        dateArgs = args.slice(3);
      } else {
        description = '';
        dateArgs = args.slice(2);
      }
    } else {
      title = args[0];
      // 本文がある場合: !recruit タイトル 本文 日付1 日付2 ...
      if (args.length > 2 && !args[1].match(/\d{1,2}\/\d{1,2}/) && !args[1].match(/\d{1,2}:\d{2}/)) {
        description = args[1];
        dateArgs = args.slice(2);
      } else {
        description = '';
        dateArgs = args.slice(1);
      }
    }

    // カンマ区切りも許容、日付・時刻のペアをまとめて抽出
    const rawDates = [];
    let buf = [];
    for (const arg of dateArgs) {
      buf.push(arg);
      // 日付+時刻のペアが揃ったら1つの文字列に
      if (buf.length === 2 && buf[0].match(/\d{1,2}\/\d{1,2}/) && buf[1].match(/\d{1,2}:\d{2}/)) {
        rawDates.push(buf.join(' '));
        buf = [];
      }
    }
    // 余りがあれば単体日付として追加
    if (buf.length === 1 && buf[0].match(/\d{1,2}\/\d{1,2}/)) {
      rawDates.push(buf[0]);
    }

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
