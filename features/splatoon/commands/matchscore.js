/********************************************************************
 *  !matchscore <プレイヤー名> <点数>
 *    └ 管理者専用：個別プレイヤーのスコアを手動で変更
 *
 *  例) !matchscore Alice 2
 *******************************************************************/
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const store = require('../utils/matchStore'); // ← パスはプロジェクト構成に合わせて調整

module.exports = {
  name: 'matchscore',
  description: '管理者用：プレイヤーのスコアを変更',
  async execute(msg, args) {
    /* ── 1. 権限チェック ── */
    if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return msg.reply('❌ このコマンドは **管理者専用** です。');
    }

    /* ── 2. 引数バリデーション ── */
    if (args.length < 2) {
      return msg.reply('使い方: `!matchscore <プレイヤー名> <点数>`');
    }
    const playerName = args.slice(0, -1).join(' ');
    const newScore   = Number(args.at(-1));
    if (Number.isNaN(newScore) || newScore < 0) {
      return msg.reply('⚠️ 点数は 0 以上の数値で指定してください。');
    }

    /* ── 3. 進行中マッチ確認 ── */
    const data = store.getData();
    if (!data) return msg.reply('🚫 現在進行中のプラべはありません。');

    if (!(playerName in data.scores)) {
      return msg.reply(`⚠️ **${playerName}** は現在の参加者に含まれていません。`);
    }

    /* ── 4. スコアを更新 ── */
    data.scores[playerName] = newScore;

    /* ── 5. 確認用 Embed 返信 ── */
    const embed = new EmbedBuilder()
      .setColor(0xffc107)
      .setTitle('✏️ スコアを手動変更')
      .setDescription(`**${playerName}** のスコアを **${newScore}** に更新しました。`)
      .addFields({
        name: '現在のスコア一覧',
        value: Object.entries(data.scores)
          .map(([p, s]) => `• ${p} : **${s}**`).join('\n')
      })
      .setTimestamp();

    await msg.channel.send({ embeds: [embed] });
  }
};
