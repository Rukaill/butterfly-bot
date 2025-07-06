
const { google } = require('googleapis');
const auth = require('./authClient');
const dayjs = require('dayjs');
const calendar = google.calendar({ version: 'v3', auth });

/**
 * 指定期間のGoogleカレンダーイベントを取得
 * @param {Object} options - Google Calendar API list params
 * @returns {Promise<Array>} イベント配列
 */
async function listEvents(options = {}) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const res = await calendar.events.list({
    calendarId,
    ...options,
  });
  return res.data.items || [];
}

async function createEvent({ summary, description, startDateTime, endDateTime }) {
  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone: 'Asia/Tokyo' },
      end:   { dateTime: endDateTime,   timeZone: 'Asia/Tokyo' },
    },
  });

  return res.data;         // ★ res.data を返す（htmlLink が入る）
}

async function listUpcomingEvents(days = 7, max = 10) {
  const now = dayjs();
  const timeMax = now.add(days, 'day').toISOString();

  const res = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,   // ← ID が正しいか？
    timeMin: now.toISOString(),
    timeMax,                                      // 予定の上限日時
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: max,
  });

  /* ★ デバッグ用ログ */
  console.log('events.list result items =', res.data.items?.length);

  return res.data.items || [];                    // ← 必ず配列を返す
}

module.exports = { createEvent, listUpcomingEvents, listEvents };
