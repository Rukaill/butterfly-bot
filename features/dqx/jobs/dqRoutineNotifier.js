/******************************************************************
 * DQX 週課 / 月課 通知 BOT ジョブ
 *  1. 広場の「日課チェック表」ページをスクレイピング
 *  2. 週課・月課のみを抽出し、カテゴリ別に整形
 *  3. Discord にかわいく Embed で投稿
 ******************************************************************/
const fetch   = require('node-fetch');          // v2
const cheerio = require('cheerio');
const cron    = require('node-cron');
const moment  = require('moment-timezone');
const { EmbedBuilder, ChannelType } = require('discord.js');

const URL = 'https://xn--10-yg4a1a3kyh.jp/dq10_routine.html';

/** ===================== 抽出キーワード ===================== */
const WEEK_KEYS = ['週課', 'ピラミッド', '試練', '達人', '魔塔', '学園'];
const MONTH_KEYS = ['邪神', '心層', '聖守護者', '源世庫', 'フェスタ'];

/** カテゴリーマップ: キーワード→カテゴリー名 + アイコン */
const CATEGORY_DEFS = [
  { icon: '🗡', name: '討伐系',    match: /討伐|邪神|聖守護者|心層/ },
  { icon: '🎓', name: '育成系',    match: /学園|修練|経験値/ },
  { icon: '💰', name: '報酬系',    match: /ゴールド|宝珠|アクセ|コイン/ },
  { icon: '🎲', name: 'コンテンツ', match: /フェスタ|試練|ピラミッド|魔塔/ },
];

/** ===================== HTML スクレイピング ===================== */
async function scrapeList() {
  const html = await fetch(URL).then(r => r.text());
  const $ = cheerio.load(html);
  return $('tr')
    .map((_, tr) => $(tr).text().trim().replace(/\s+/g, ' '))
    .get();
}

/** ===================== 期間の文字列 ===================== */
function getWeekRangeJST() {
  const start = moment.tz('Asia/Tokyo').startOf('isoWeek'); // 月曜始まり
  const end   = moment(start).add(6, 'days');
  return `${start.format('M/D')}〜${end.format('M/D')}`;
}

function getMonthStrJST() {
  return moment.tz('Asia/Tokyo').format('M月');
}

/** ===================== カテゴリ分け ===================== */
function categorize(items) {
  const buckets = {};

  // 該当しないものは「その他」に入れる
  items.forEach(line => {
    const def = CATEGORY_DEFS.find(d => d.match.test(line)) || { icon: '📌', name: 'その他' };
    const key = `${def.icon} ${def.name}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(line);
  });

  return buckets; // { '🗡 討伐系': [ ... ], ... }
}

/** ===================== Discord 送信 ===================== */
async function sendRoutine(client, channelId, kind = 'weekly') {
  const all  = await scrapeList();
  const keys = kind === 'weekly' ? WEEK_KEYS : MONTH_KEYS;
  const list = all.filter(r => keys.some(k => r.includes(k)));
  if (!list.length) return;

  const buckets = categorize(list);
  const desc = Object.entries(buckets)
    .map(([cat, lines]) => `**${cat}**\n${lines.map(l => `・${l}`).join('\n')}`)
    .join('\n\n');

  const title = kind === 'weekly'
    ? `🏰 今週の週課（${getWeekRangeJST()}）`
    : `🏰 ${getMonthStrJST()}の月課`;

  const embed = new EmbedBuilder()
    .setColor(kind === 'weekly' ? 0x89CFF0 : 0xFFD700)        // パステルブルー / ゴールド
    .setTitle(title)
    .setAuthor({ name: 'butterfly-bot', iconURL: client.user.displayAvatarURL() })
    .setDescription(desc)
    .setFooter({ text: '出典: dq10 日課チェック表' })
    .setTimestamp();

  const ch = await client.channels.fetch(channelId).catch(() => null);
  if (!ch || ch.type !== ChannelType.GuildText) return;
  await ch.send({ embeds: [embed] });
}

/** ===================== ジョブ登録 ===================== */
module.exports = (client) => {
  const chId = process.env.DQ_ROUTINE_CHANNEL_ID;
  if (!chId) return;

  // 毎週 月曜 6:00 JST
  cron.schedule('0 6 * * 1', () => sendRoutine(client, chId, 'weekly'),
    { timezone: 'Asia/Tokyo' });

  // 毎月 1日 6:00 JST
  cron.schedule('0 6 1 * *', () => sendRoutine(client, chId, 'monthly'),
    { timezone: 'Asia/Tokyo' });

  // テストモード
  if (process.env.DQ_ROUTINE_TEST === 'true') {
    sendRoutine(client, chId, 'weekly');
    sendRoutine(client, chId, 'monthly');
  }
};

/* ============================================================
 * 依存:
 *   npm i node-fetch@2 cheerio node-cron moment-timezone
 * ============================================================ */
