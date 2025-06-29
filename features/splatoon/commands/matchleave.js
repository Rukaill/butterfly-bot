/**
 * !matchleave <プレイヤー表示名>
 * 進行中のマッチから離脱
 */
const store = require('../utils/matchStore');
module.exports = {
  name: 'matchleave',
  description: '途中退出 (現在のマッチから除外)',
  execute(msg, args) {
    const name = args.join(' ') || msg.member.displayName;
    const ok   = store.removePlayer(name);
    if (!ok) return msg.reply('除外できませんでした。（未参加？）');
    msg.reply(`🚪 退出: **${name}**`);
  }
};
