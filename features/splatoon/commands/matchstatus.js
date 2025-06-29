/**
 * !matchstatus
 */
const { EmbedBuilder } = require('discord.js');
const store = require('../utils/matchStore');

module.exports = {
  name: 'matchstatus',
  description: '現在の勝敗状況を表示',
  execute(msg) {
    const data = store.getData();
    if (!data) return msg.reply('進行中のプラべはありません。');

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle(`現在のスコア (目標: ${data.winTarget})`)
      .setDescription(
        Object.entries(data.scores)
          .map(([p, s]) => `• ${p} : **${s}**`)
          .join('\n')
      )
      .setFooter({ text: `Round ${data.round} 進行中` });
    msg.reply({ embeds: [embed] });
  }
};
