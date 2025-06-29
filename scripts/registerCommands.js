/********************************************************************
 * scripts/registerCommands.js
 * すべての Bot コマンドを Discord のスラッシュコマンドとして登録
 * ------------------------------------------------------------------
 * 使い方:
 *   1) .env に DISCORD_TOKEN, CLIENT_ID[, GUILD_ID] を用意
 *   2) node scripts/registerCommands.js
 *
 *   GUILD_ID が存在すれば開発用ギルド限定登録（即時反映）
 *   無ければグローバル登録（最大1hで反映）
 *******************************************************************/
require('dotenv').config();

const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [

  /* ────────── 汎用 ────────── */
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bot 応答テスト (pong!)'),

  /* ────────── Google カレンダー関連 ────────── */
  new SlashCommandBuilder()
    .setName('gadd')
    .setDescription('予定を Google カレンダーに 1h 枠で追加')
    .addStringOption(o => o.setName('タイトル').setDescription('予定タイトル').setRequired(true))
    .addStringOption(o => o.setName('日付').setDescription('YYYY-MM-DD').setRequired(true))
    .addStringOption(o => o.setName('時刻').setDescription('HH:mm').setRequired(true)),

  new SlashCommandBuilder()
    .setName('glist')
    .setDescription('直近 n 日の予定を取得')
    .addIntegerOption(o => o.setName('日数').setDescription('省略時 7 日').setRequired(false)),

  /* ────────── 募集・リマインド ────────── */
  new SlashCommandBuilder()
    .setName('recruit')
    .setDescription('ゲーム募集メッセージを作成し、リアクション投票を開始'),

  new SlashCommandBuilder()
    .setName('fix')
    .setDescription('募集日程を確定し、リマインドを登録'),

  /* ────────── スプラトゥーン：武器ガチャ ────────── */
  new SlashCommandBuilder()
    .setName('weapongacha')
    .setDescription('VC 参加者に武器をランダム配布')
    .addStringOption(o => o.setName('vc_id')
      .setDescription('ボイスチャンネルID（省略で自動検出）')
      .setRequired(false)),

  /* ────────── プラべ勝敗管理 ────────── */
  new SlashCommandBuilder()
    .setName('matchstart')
    .setDescription('プラべシリーズ開始')
    .addIntegerOption(o => o.setName('勝利条件').setDescription('先取勝利数').setRequired(true)),

  new SlashCommandBuilder()
    .setName('matchjoin')
    .setDescription('途中参加（プレイヤー追加）')
    .addStringOption(o => o.setName('名前').setDescription('未入力なら自分の表示名').setRequired(false)),

  new SlashCommandBuilder()
    .setName('matchleave')
    .setDescription('途中退出（プレイヤー除外）')
    .addStringOption(o => o.setName('名前').setDescription('未入力なら自分の表示名').setRequired(false)),

  new SlashCommandBuilder()
    .setName('matchkick')
    .setDescription('管理者：プレイヤーを強制除外')
    .addStringOption(o => o.setName('名前').setDescription('除外するプレイヤー').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('matchscore')
    .setDescription('管理者：個別スコアを変更')
    .addStringOption(o => o.setName('名前').setDescription('プレイヤー').setRequired(true))
    .addIntegerOption(o => o.setName('点数').setDescription('新しいスコア').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('matchwin')
    .setDescription('勝利チーム登録 (リアクション投票用 Embed を送信)'),

  new SlashCommandBuilder()
    .setName('matchstatus')
    .setDescription('現在のシリーズ状況を表示'),

  new SlashCommandBuilder()
    .setName('matchcancel')
    .setDescription('シリーズを即時終了 (データ初期化)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

].map(c => c.toJSON());

/* ────────── 登録処理 ────────── */
(async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const target = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    console.log(`⏳ コマンドを Discord に登録 (${process.env.GUILD_ID ? 'Guild' : 'Global'}) ...`);
    await rest.put(target, { body: commands });
    console.log('✅ すべてのスラッシュコマンドを登録しました！');
  } catch (err) {
    console.error('❌ コマンド登録に失敗：', err);
  }
})();
