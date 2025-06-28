/********************************************************************
 *  DQX 運営イベント通知  ─ スクレイピング + 投票 + カウントダウン強調版
 *******************************************************************/
const fetch   = require('node-fetch'); // v2
const cheerio = require('cheerio');
const cron    = require('node-cron');
const { EmbedBuilder, ChannelType } = require('discord.js');

const PAGE_URL = 'https://hiroba.dqx.jp/sc/news/information/';
const KEYWORDS = ['イベント', 'コラボ', 'グランプリ', '大富豪', '記念', 'フェス', '報酬'];

let latestURL = null;

/* ───────── HTML 解析 ───────── */
async function scrapeNews() {
  const html = await fetch(PAGE_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                     .then(r => r.text());

  const $ = cheerio.load(html);

  return $('a.newsListLnk').map((_, a) => {
    const $a = $(a);
    const $tr = $a.closest('tr');
    const date = $tr.find('td.date div').text().trim();

    return {
      url: 'https://hiroba.dqx.jp' + $a.attr('href'),
      date,
      title: $a.text().trim()
    };
  }).get();
}

/* ───────── フィルタ ───────── */
function pickLatestEvent(items) {
  return items.find(item =>
    KEYWORDS.some(k => item.title.includes(k)) &&
    item.url !== latestURL
  );
}

/* ───────── イベントジャンル → アイコン ───────── */
function getEventIcon(title) {
  if (title.includes('コラボ')) return '🤝';
  if (title.includes('フェス')) return '🎊';
  if (title.includes('グランプリ')) return '🏆';
  if (title.includes('写真')) return '📸';
  if (title.includes('記念')) return '🎂';
  return '📢';
}

/* ───────── 通知処理 ───────── */
async function notifyEvent(client, channelId) {
  const items = await scrapeNews();
  const target = pickLatestEvent(items);

  const ch = await client.channels.fetch(channelId).catch(() => null);
  if (!ch || ch.type !== ChannelType.GuildText) return;

  const mentionRoleId = process.env.MENTION_ROLE_ID;
  const mention = mentionRoleId ? `<@&${mentionRoleId}>` : '';

  if (!target) {
    await ch.send(`${mention}\n📭 現在、該当する運営イベント情報は見つかりませんでした。`);
    return;
  }

  const eventIcon = getEventIcon(target.title);

  const remainDays = (() => {
    const diff = new Date(target.date) - Date.now();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  })();

  const embed = new EmbedBuilder()
    .setColor(0xf48fb1)
    .setTitle(`${eventIcon} 【イベント】${target.title}`)
    .setURL(target.url)
    .setDescription(`🎉 **ワクワク！新しい公式イベント情報が登場！**\nさっそくチェックしてみよう！`)
    .addFields(
      { name: '📅 公開日', value: target.date, inline: true },
      { name: '🏷 カテゴリ', value: '運営イベント', inline: true }
    )
    .addFields({ name: '⏳ カウントダウン', value: `✨ あと **${remainDays}日**！！ ✨` })
    .setFooter({ text: '目覚めし冒険者の広場', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  if (mention) await ch.send(mention);
  const msg = await ch.send({ embeds: [embed] });

  // リアクション投票
  await msg.react('🙌'); // 参加する！
  await msg.react('👀'); // 様子見
  await msg.react('😶'); // スルー

  latestURL = target.url;
}

/* ───────── cron 登録 ───────── */
module.exports = (client) => {
  const chId = process.env.DQ_EVENT_CHANNEL_ID;
  if (!chId) {
    console.warn('❗ DQ_EVENT_CHANNEL_ID が .env に設定されていません');
    return;
  }

  // 毎朝6時に通知
  cron.schedule('0 6 * * *', () => notifyEvent(client, chId), {
    timezone: 'Asia/Tokyo',
  });

  // 起動時テストモード
  if (process.env.DQ_EVENT_TEST === 'true') {
    notifyEvent(client, chId);
  }
};

module.exports.notifyEvent = notifyEvent;

/* ============================================================
 * 依存: npm i node-fetch@2 cheerio node-cron
 * ============================================================ */
