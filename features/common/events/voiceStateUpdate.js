// features/common/events/voiceStateUpdate.js
module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    console.log('VoiceStateUpdate Event Triggered');
    const joined = !oldState.channel && newState.channel;
    if (!joined) return;

    // 対象のボイスチャンネルIDを指定
    const targetVoiceChannelId = '1388445062664421456'; // ←オープン募集VCのID
    const targetRoleId = '1162829572673388667';         // ←スプラトゥーンロールID
    const notifyChannelId = '1388260604808003645';      // ←通知用テキストチャンネルID

    if (newState.channelId === targetVoiceChannelId) {
      const notifyChannel = await client.channels.fetch(notifyChannelId);
      if (!notifyChannel) return;

      notifyChannel.send(`<@&${targetRoleId}> さん、誰かがオープン募集VCに入りました！`);
    }
  });
};
// このコードは、ユーザーが特定のボイスチャンネルに参加したときに、指定されたロールに通知を送信します。