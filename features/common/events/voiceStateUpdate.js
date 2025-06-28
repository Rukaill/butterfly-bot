const { ChannelType } = require('discord.js');

const TARGET_VC_ID = '1388445062664421456'; // 対象VCのID
const TEXT_CHANNEL_ID = '1388260604808003645';
const PING_ROLE_ID = '1162829572673388667';
const PING_COOL_TIME = 60_000; // 1分

const lastNotified = new Map();

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const newCh = newState.channel;
    const oldCh = oldState.channel;

    // 対象 VC に入室したときのみ（old が null または他のVC → new が対象VC）
    if (newCh?.id === TARGET_VC_ID && oldCh?.id !== TARGET_VC_ID) {
      // 人数チェック：参加者が1人（自分が最初に入った場合）のみ
      const memberCount = newCh.members.size;
      if (memberCount !== 1) return;

      // クールタイムチェック（スパム防止）
      const last = lastNotified.get(newCh.id) || 0;
      if (Date.now() - last < PING_COOL_TIME) return;

      // 通知チャンネル取得＆送信
      const textCh = client.channels.cache.get(TEXT_CHANNEL_ID);
      if (textCh?.type === ChannelType.GuildText) {
        await textCh.send({
          content: `<@&${PING_ROLE_ID}> 誰かが VC に入りました！`,
        });
      }

      lastNotified.set(newCh.id, Date.now());
    }
  });
};

