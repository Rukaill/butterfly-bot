/**
 * !matchstart <勝利数> [VC_ID]
 * VC_ID を省略 → 実行者の VC 参加者を取得
 */
const { ChannelType, EmbedBuilder } = require('discord.js');
const store = require('../utils/matchStore');

module.exports = {
  name: 'matchstart',
  description: 'プラべ勝敗管理を開始',
  async execute(msg, args) {
    const winTarget = Number(args.shift());
    if (!winTarget || winTarget <= 0) {
      return msg.reply('使い方: `!matchstart 3 [VC_ID]` (3勝先取例)');
    }
    let vcId = args[0];
    if (!vcId || !/^\d{17,19}$/.test(vcId)) {
      vcId = msg.member?.voice?.channelId;
    }
    if (!vcId) return msg.reply('VC に参加していないか、VC_ID が無効です。');

    const vc = await msg.guild.channels.fetch(vcId).catch(() => null);
    if (!vc || vc.type !== ChannelType.GuildVoice) {
      return msg.reply('その ID はボイスチャンネルではありません。');
    }

    const players = vc.members.filter(m => !m.user.bot).map(m => m.displayName);
    if (players.length < 2) return msg.reply('参加者が2人未満です。');

    store.init(players, winTarget);
    const teams = store.randomTeams();

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle(`🏁 プラべ開始 - ${winTarget}勝先取`)
      .setDescription(
        `**Round 1 のチーム分け**\n` +
        `🅰 A: ${teams.A.join(' , ')}\n` +
        `🅱 B: ${teams.B.join(' , ')}`
      );
    msg.channel.send({ embeds: [embed] });
  }
};
