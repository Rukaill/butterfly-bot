// services/google/calendarService.js
const { google } = require('googleapis');
const auth = require('./authClient');           // 既存
const calendar = google.calendar({ version: 'v3', auth });

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

async function listUpcomingEvents(days = 7, max = 10) { /* 既存 */ }

module.exports = { createEvent, listUpcomingEvents };
