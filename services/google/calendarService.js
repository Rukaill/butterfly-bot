// services/google/calendarService.js
const { google } = require('googleapis');
const getAuth = require('./authClient');
const dayjs = require('dayjs');

const auth = require('./authClient');
const calendar = google.calendar({ version: 'v3', auth });

module.exports = {
  /** 予定追加はすでに実装済み ↓ */
  async createEvent({ summary, description, startDateTime, endDateTime }) { /* ... */ },

  /** 🔽 新規: 今後 n 日分の予定を取得 */
  async listUpcomingEvents(days = 7, max = 10) {
    const now = dayjs();
    const timeMax = now.add(days, 'day');

    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: max,
    });

    return res.data.items; // 配列を返す
  },
};
