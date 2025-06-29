const { ChannelType } = require('discord.js');

/** ─ メンションを送信するテキストチャンネル（固定） ─ */
const TEXT_CHANNEL_ID = '1194529180096933918'; // メンションチャンネル

/** ─ 各 VC に対応するロールとメッセージ設定 ─ */
const VC_CONFIG = {
  // オープン募集 VC
  '1388492257060978760': {
    roleId: '1388493576912244868',
    message: '🔷 オープン始めるよ！これる人は参加してね！',
  },
  // ドラクエ VC
  '1388492902409179216': {
    roleId: '1388493509195075724',
    message: '🔷 ドラクエ始めるよ！これる人は参加してね！',
  },
  // マイクラ VC
  '1388492795118878871': {
    roleId: '1388493167749496945',
    message: '🔷 マイクラ始めるよ！これる人は参加してね！',
  },
  // 作業通話 VC
  '1177893495101472858': {
    roleId: '1319001677180829717',
    message: '🔷 まったり作業通話募集中！聞き専でもOK！',
  },
  // 雑談通話 VC
  '1162824281852497923': {
    roleId: '1388493289669267516',
    message: '🔷 雑談募集中！誰でも来てね！',
  },
};

/** ─ スパム防止：同じVCで通知する間隔（ミリ秒） ─ */
const PING_COOL_TIME = 60_000;
const lastNotified = new Map();

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const newCh = newState.channel;
    const oldCh = oldState.channel;

    // 対象外VC・移動無しは無視
    if (!newCh || !VC_CONFIG[newCh.id]) return;
    if (oldCh?.id === newCh.id) return;

    // 参加者が1人（最初の入室者）のみ通知
    if (newCh.members.size !== 1) return;

    // クールタイムチェック
    const last = lastNotified.get(newCh.id) || 0;
    if (Date.now() - last < PING_COOL_TIME) return;

    // メンション送信
    const { roleId, message } = VC_CONFIG[newCh.id];
    const textCh = client.channels.cache.get(TEXT_CHANNEL_ID);
    if (textCh?.type === ChannelType.GuildText) {
      await textCh.send({
        content: `<@&${roleId}> ${message}`,
        allowedMentions: { roles: [roleId] },
      });
      lastNotified.set(newCh.id, Date.now());
    }
  });
};
