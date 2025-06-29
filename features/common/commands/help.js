// features/common/commands/help.js
module.exports = {
  name: 'bhelp',
  description: 'すべてのコマンドと使い方を表示します',
  execute(msg) {
    const helpMessage = `
🦋 **butterfly-bot コマンド一覧**

__スプラ関連__
• \`!wroll <チャンネルID>\` - 武器をランダムに抽選します（VCから参加者取得）未指定の場合は自分が参加しているVCチャンネル
• \`!matchstart <勝利数>\` - 先取プラベを開始します（VCから人数取得）
• \`!win\` - プラベの勝敗を記録します
• \`!matchjoin <名前>\` - 途中参加
• \`!matchleave <名前>\` - 途中退出

__募集機能__
• \`!recruit <タイトル> <候補日...>\` - リアクション投票形式で募集
• \`!fix <メッセージID> <番号(1〜5)>\` - 募集日時を確定しGoogleカレンダーに登録
• \`!glist [日数]\` - 直近予定一覧を表示
• \`!gcleanup\` - 期限切れイベントを削除

__その他__
• \`!ping\` - 応答確認用コマンド
• \`!bhelp\` - このヘルプを表示
    `.trim();

    msg.channel.send(helpMessage);
  }
};
