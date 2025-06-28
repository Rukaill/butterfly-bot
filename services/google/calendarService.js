// services/google/calendarService.js
const { google } = require('googleapis');
const getOAuth2Client = require('./authClient');

const calendar = google.calendar({ version: 'v3', auth: getOAuth2Client() });

module.exports = {
  async createEvent({ summary, description, startDateTime, endDateTime }) {
    try {
      const event = {
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
      };

      const res = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: event,
      });

      console.log('✅ イベントを作成しました:', res.data.htmlLink);
    } catch (err) {
      console.error('❌ イベント作成エラー:', err.message);
    }
  },
};
