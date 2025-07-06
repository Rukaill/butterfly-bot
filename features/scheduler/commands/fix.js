// features/scheduler/commands/fix.js
const { CronJob } = require('cron');
const { EmbedBuilder } = require('discord.js');
const calendarService = require('../../../services/google/calendarService');
const ms = require('ms');
const store = require('../services/scheduleStore');
const dayjs = require('dayjs');
const emojis = ['🇦','🇧','🇨','🇩','🇪'];

module.exports = {
  name: 'fix',
  description: '!fix <メッセージID> <番号(1〜5)>',
  async execute(msg, args) {
    if (args.length < 2) return msg.reply('`!fix <messageId> <1-5>` で指定してください');

    // --- 1️⃣ 受け取った引数を取得（最初の行を修正） ---
    const [rawMessageId, numStr, ...restArgs] = args;   // rawMessageId を先に取る

    // --- 2️⃣ メッセージリンクなら ID 部分だけを抜き出す関数 ---
    const extractMessageId = (input) => {
      const linkRegex = /discord\.com\/channels\/\d+\/\d+\/(\d+)/;
      const match = input.match(linkRegex);
      return match ? match[1] : input;  // リンクなら ID、違えばそのまま
    };

    // --- 3️⃣ 抽出した結果を messageId として確定 ---
    const messageId = extractMessageId(rawMessageId);

    const idx = Number(numStr) - 1;
    if (idx < 0 || idx > 4) return msg.reply('番号は 1〜5 で指定してください');

    const schedule = store.getSchedule(messageId);
    if (!schedule) return msg.reply('募集メッセージが見つかりません');

    const dateStr = schedule.dates[idx];
    if (!dateStr) return msg.reply('その番号の日付は存在しません');

    const emoji = emojis[idx];
    const participants = store.getVotes(messageId, emoji);
    if (!participants.size) return msg.reply('参加者がいません');

    // 通知予約 (dayjs で 1h 前を計算)
    const target = dayjs(dateStr, ['M/D H:mm', 'YYYY/MM/DD HH:mm'], true);
    if (!target.isValid()) return msg.reply('日付解析に失敗しました');

    const { EmbedBuilder } = require('discord.js');

    const remindAt = target.subtract(1, 'hour').toDate();
    const remindFn = () => {
      // 参加者 Set → 配列に変換
      const mentionArr = [...participants];
      const mentionList = mentionArr.length
        ? mentionArr.map(id => `<@${id}>`).join(' ')  // 半角スペース区切りで表示
        : '（参加者未定）';
      const messageUrl = `https://discord.com/channels/${msg.guildId}/${msg.channelId}/${messageId}`;
      

      // メッセージ定義
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🧿　1時間後にこれ開催するよ　🧿')
        .addFields(
          {
            name: '💙 タイトル!!',
            value: `**${schedule.title}**`,
            inline: false
          },
          {
            name: '🟦 内容!!',
            value: `${schedule.description}`,
            inline: false
          },
          {
            name: '🔷 開始時刻!!',
            value: `**${dateStr}** にゲーム開始！`,
            inline: false
          },
          {
            name: '🪼 参加者する方!!',
            value: mentionList,
            inline: false
          }
        )
        .setDescription(`[📎 元の募集メッセージに移動](${messageUrl})`)
        .setFooter({
          text: `時間になったら通話きてね・${dayjs().format('MM/DD HH:mm')}`
        });

      msg.channel.send({ embeds: [embed] });

      };
    
    const isTestMode = args.includes('--test');
    if (isTestMode) {
      remindFn(); // すぐ実行
    } else {
      new CronJob(remindAt, remindFn).start();
    }
    
    // 🗓 Google カレンダーに予定を登録 & Discordイベント作成
    try {
      // 日付文字列を ISO へ（スラッシュ & 時刻付き→ YYYY-MM-DDTHH:mm）
      const parsed = dayjs(dateStr, ['M/D H:mm', 'YYYY/MM/DD HH:mm']).set('year', dayjs().year());
      const startIso = parsed.toISOString();
      const endIso   = parsed.add(1, 'hour').toISOString();   
      const event = await calendarService.createEvent({
        summary      : schedule.title,
        description  : `${schedule.description}   (Discord募集: ${msg.author.tag})`,
        startDateTime: startIso,
        endDateTime  : endIso,
      });   

      // Discordイベントも作成
      try {
        await msg.guild.scheduledEvents.create({
          name: schedule.title || '予定',
          scheduledStartTime: startIso,
          scheduledEndTime: endIso,
          privacyLevel: 2, // GUILD_ONLY
          entityType: 3,   // EXTERNAL
          description: schedule.description || '',
          entityMetadata: { location: '未定' },
        });
      } catch (err) {
        console.error('Discordイベント作成失敗:', err);
      }

      msg.channel.send(
        `🪬 **${dateStr}** で開催決定！ 1 時間前にリマインドします 🪬\n` +
        `📅 <${event.htmlLink}>`
      );
    } catch (err) {
      console.error('Google カレンダー登録失敗:', err);
      msg.channel.send(`🪬 **${dateStr}** で開催決定！（カレンダー登録は失敗しました）`);
    }
  }
};

