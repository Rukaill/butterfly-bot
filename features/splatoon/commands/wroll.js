/********************************************************************
 * !wroll 〈VC_ID〉 [--type=◯◯] [--tier=S]
 *
 * ・VC_ID を省略すると「コマンド実行者が今いる VC」が自動対象
 * ・VC_ID を書けば、そのボイスチャンネルを強制対象
 * ・--type=シューター  や  --tier=A  などの絞り込みも併用可
 *
 * weapons.json は   features/splatoon/data/weapons.json
 * pickRandom は     features/splatoon/utils/weaponPicker.js
 *******************************************************************/
const { EmbedBuilder, ChannelType } = require('discord.js');
const { pickRandom } = require('../utils/weaponPicker');

module.exports = {
  name: 'wroll',
  description: 'ボイスチャンネル参加者で武器ガチャ',

  /** @param {import('discord.js').Message} msg */
  async execute(msg, args) {
    /* ─────────────────────────────
     *  ① 対象 VC の決定
     * ───────────────────────────── */
    let vcId = null;

    // 先頭引数が 17〜19桁の数字なら VC_ID と判定
    if (args[0] && /^\d{17,19}$/.test(args[0])) {
      vcId = args.shift();
    }

    // 指定が無ければ「実行者の VC」を採用
    if (!vcId) {
      const meVC = msg.member?.voice?.channel;
      if (!meVC) {
        return msg.reply(
          '🔇 VC に参加していないか、VC_ID が見つかりません。\n' +
          '`!wroll 123456789012345678`  または  VC に入ってから `!wroll` を実行してください。'
        );
      }
      vcId = meVC.id;
    }

    // VC オブジェクト取得
    const vc = await msg.guild.channels.fetch(vcId).catch(() => null);
    if (!vc || vc.type !== ChannelType.GuildVoice) {
      return msg.reply('❌ その ID は存在しないか、ボイスチャンネルではありません。');
    }

    /* ─────────────────────────────
     *  ② オプション解析
     * ───────────────────────────── */
    const opts = {};
    args.forEach(arg => {
      if (arg.startsWith('--type=')) opts.type = arg.split('=')[1];
      if (arg.startsWith('--tier=')) opts.tier = arg.split('=')[1];
    });

    /* ─────────────────────────────
     *  ③ プレイヤー一覧取得
     * ───────────────────────────── */
    const players = vc.members
      .filter(m => !m.user.bot)
      .map(m => m.displayName);

    if (players.length === 0) {
      return msg.reply('🎙 その VC に Bot 以外の参加者がいません。');
    }

    /* ─────────────────────────────
     *  ④ 武器抽選
     * ───────────────────────────── */
    const weapons = pickRandom({ ...opts, count: players.length });
    if (weapons.length < players.length) {
      return msg.reply('⚠️ 指定カテゴリ・tier の武器数が不足しています。');
    }

    /* ─────────────────────────────
     *  ⑤ Embed 生成 & 送信
     * ───────────────────────────── */
    const desc = players.map((p, i) => `• **${p}** → ${weapons[i].name}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle('🎲 武器ガチャ結果')
      .setDescription(desc)
      .addFields(
        { name: 'カテゴリ', value: opts.type || 'ALL', inline: true },
        { name: '人数',     value: String(players.length), inline: true }
      )
      .setTimestamp();

    await msg.reply({ embeds: [embed] });
  }
};
