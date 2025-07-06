// features/common/commands/help.js
module.exports = {
  name: 'bhelp',
  description: 'すべてのコマンドと使い方を表示します',
  execute(msg) {
    const helpMessage = `
**コマンド一覧**


__スプラ関連__
• \`!wroll <チャンネルID>\` - 武器をランダムに抽選します（VCから参加者取得）未指定の場合は自分が参加しているVCチャンネル
　例: \`!wroll\` / \`!wroll 123456789012345678\`
• \`!matchstart <勝利数>\` - 先取プラベを開始します（VCから人数取得）
　例: \`!matchstart 3\`
• \`!win\` - プラベの勝敗を記録します
　例: \`!win\`
• \`!matchjoin <名前>\` - 途中参加
　例: \`!matchjoin たろう\`
• \`!matchleave <名前>\` - 途中退出
　例: \`!matchleave たろう\`


__募集機能__
• \`!recruit <タイトル> <日付1> <日付2> ...\` - リアクション投票形式で募集
　例: \`!recruit テスト 7/8 21:00 7/9 21:00\`
• \`!recruit <タイトル> <本文> <日付1> <日付2> ...\` - 本文付き募集もOK
　例: \`!recruit テスト あ 7/8 21:00 7/9 21:00\`
• \`!fix <メッセージID> <番号(1〜5)>\` - 募集日時を確定しGoogleカレンダー・Discordイベントに登録
　例: \`!fix 123456789012345678 1\`
• \`!glist [日数]\` - 直近予定一覧を表示
　例: \`!glist 7\`
• \`!gcleanup\` - 期限切れイベントを削除
　例: \`!gcleanup\`
• \`!gcal2event\` - 今月のGoogleカレンダー予定をDiscordイベントに一括登録
　例: \`!gcal2event\`

__その他__
• \`!ping\` - 応答確認用コマンド
　例: \`!ping\`
• \`!bhelp\` - このヘルプを表示
　例: \`!bhelp\`
    `.trim();

    msg.channel.send(helpMessage);
  }
};
