/**
 * !win
 *  └ A/B を文字入力せず、Bot が送った Embed に 🅰 / 🅱 を付けてもらい
 *    最初に押されたリアクションで勝敗を登録
 */
const { EmbedBuilder } = require('discord.js');
const store = require('../utils/matchStore');

module.exports = {
  name: 'win',
  description: '勝利チームをリアクションで入力',
  async execute(msg) {
    const data = store.getData();
    if (!data) return msg.reply('まず `!matchstart` してください。');

    // 投票用 Embed
    const vote = await msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor(0xffc107)
        .setTitle(`Round ${data.round} 勝利チームは？`)
        .setDescription('🅰 or 🅱 のリアクションを押してください')
      ]
    });
    // リアクション用絵文字（Unicode：🅰 U+1F170, 🅱 U+1F171）
    await vote.react('🅰');
    await vote.react('🅱');

    // 30 秒以内に押された最初のリアクションを採用
    try {
      const collected = await vote.awaitReactions({
        filter: (r, u) => !u.bot && ['🅰', '🅱'].includes(r.emoji.name),
        max: 1,
        time: 30_000,
        errors: ['time']
      });
      const winnerEmoji = collected.first().emoji.name;
      const teamKey = winnerEmoji === '🅰' ? 'A' : 'B';
      store.addWin(teamKey);
    } catch {
      return msg.channel.send('⌛ 反応がありませんでした。やり直してください。');
    }

    /* 勝者判定 & 次ラウンド */
    const winners = store.getWinners();
    if (winners.length) {
      await msg.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0x00ff88)
          .setTitle('🎉 シリーズ終了！')
          .setDescription(`優勝: **${winners.join(' , ')}**`)
          .addFields({ name: '最終スコア', value: formatScores(store.getData()) })
        ]
      });
      return store.reset();
    }

    // 次ラウンドのチーム分け
    const teams = store.randomTeams();
    await msg.channel.send({
      embeds: [new EmbedBuilder()
        .setColor(0x00bfff)
        .setTitle(`Round ${data.round} - 新チーム`)
        .setDescription(`🅰 ${teams.A.join(' , ')}\n🅱 ${teams.B.join(' , ')}`)
        .addFields({ name: '現在のスコア', value: formatScores(store.getData()) })
      ]
    });
  }
};

function formatScores(data) {
  return Object.entries(data.scores)
    .map(([p, s]) => `• ${p} : **${s}**`)
    .join('\n');
}
