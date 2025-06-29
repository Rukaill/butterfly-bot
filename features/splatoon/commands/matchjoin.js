/**
 * !matchjoin <プレイヤー表示名>
 * 進行中のマッチに途中参加
 */
const store = require('../utils/matchStore');

module.exports = {
  name: 'matchjoin',
  description: '途中参加 (現在のマッチに追加)',
  execute(msg, args) {
    const name = args.join(' ') || msg.member.displayName;
    const ok   = store.addPlayer(name);
    if (!ok) return msg.reply('追加できませんでした。（既に参加済み？）');
    msg.reply(`✅ 途中参加: **${name}**`);
  }
};
