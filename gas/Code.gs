// =========================================================
//  MindWave Counselling — Google Apps Script Backend
//  Deploy as Web App: Execute as Me | Access: Anyone
// =========================================================

var SHEET_ID    = '10bBWNfWLrlnDbY5s_4Sen6dR0FzflqdtNZNXsAMX848';
var TO_EMAIL    = 'tejalkhedkar@mindwavecounselling.com';
var CALENDAR_ID = 'primary'; // change if Tejal uses a secondary calendar
var SITE_URL    = 'https://www.mindwavecounselling.com';
var LOGO_URL    = 'https://www.mindwavecounselling.com/assets/logo-8.png';

// ─── SHEET MENU ───────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MindWave')
    .addItem('✉️ Send Confirmation to Client', 'sendConfirmationFromSheet')
    .addToUi();
}

// Reads the selected row in the Bookings sheet and sends a confirmation email.
function sendConfirmationFromSheet() {
  var ui    = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getName() !== 'Bookings') {
    ui.alert('Please select a row in the Bookings sheet first.');
    return;
  }

  var row = sheet.getActiveRange().getRow();
  if (row < 2) {
    ui.alert('Please select a data row (not the header).');
    return;
  }

  // Columns: Timestamp(1) FirstName(2) LastName(3) Email(4) Phone(5)
  //          Mode(6) SessionType(7) SlotDate(8) SlotTime(9) Message(10)
  var values      = sheet.getRange(row, 1, 1, 10).getValues()[0];
  var firstName   = values[1] || '';
  var lastName    = values[2] || '';
  var clientEmail = values[3] || '';
  var mode        = values[5] || '';
  var sessionType = values[6] || '';
  var slotDate    = values[7] || '';
  var slotTime    = values[8] || '';
  var message     = values[9] || '';

  if (!clientEmail) {
    ui.alert('No email address found in this row.');
    return;
  }

  var confirm = ui.alert(
    'Send Confirmation',
    'Send appointment confirmation to ' + firstName + ' (' + clientEmail + ')?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  sendConfirmationEmail(firstName, lastName, clientEmail, mode, sessionType, slotDate, slotTime, message);
  ui.alert('✅ Confirmation sent to ' + clientEmail);
}

function sendConfirmationEmail(firstName, lastName, clientEmail, mode, sessionType, slotDate, slotTime, message) {
  var clientName = (firstName + ' ' + lastName).trim();
  var modeLabel  = mode === 'Online' ? 'Online (Video Call)' : mode === 'In-Person' ? 'In-Person' : '—';

  var slotBlock = '';
  if (slotDate && slotDate !== '-') {
    var dateObj     = new Date(slotDate);
    var formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'EEEE, MMMM d, yyyy');
    slotBlock = '<tr>'
      + '<td style="padding:12px 16px;border-bottom:1px solid #f0ebe5;color:#888;font-size:14px;width:40%">Date &amp; Time</td>'
      + '<td style="padding:12px 16px;border-bottom:1px solid #f0ebe5;font-size:14px;font-weight:600;color:#333">'
      + formattedDate + ' at ' + slotTime + '</td></tr>';
  }

  var messageBlock = '';
  if (message) {
    messageBlock = '<div style="margin-top:24px;background:#fdfaf7;border-left:3px solid #c4844a;padding:14px 18px;border-radius:0 6px 6px 0">'
      + '<div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#c4844a;text-transform:uppercase;margin-bottom:6px">Your Message</div>'
      + '<div style="font-size:14px;color:#555;line-height:1.6">' + message + '</div>'
      + '</div>';
  }

  var html = ''
    + '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fdfaf7;border:1px solid #ede8e3;border-radius:10px;overflow:hidden">'

    // ── Header
    + '<div style="background:#fdf8f3;padding:16px 24px;text-align:center;border-bottom:1px solid #ede8e3">'
    + '<img src="' + LOGO_URL + '" alt="MindWave Counselling" style="height:36px;width:auto;display:block;margin:0 auto 6px"/>'
    + '<div style="color:#c4846a;font-size:12px;letter-spacing:0.5px">mindwavecounselling.com</div>'
    + '</div>'

    // ── Green confirmed banner
    + '<div style="background:#e8f5e9;padding:18px 32px;text-align:center;border-bottom:1px solid #c8e6c9">'
    + '<div style="display:inline-block;background:#4caf50;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;color:white;font-size:18px;margin-bottom:8px">✓</div>'
    + '<div style="font-size:18px;font-weight:bold;color:#2e7d32;font-family:Georgia,serif">Appointment Confirmed!</div>'
    + '</div>'

    // ── Body
    + '<div style="background:white;padding:32px 32px 24px">'
    + '<p style="font-size:16px;color:#333;margin:0 0 24px;line-height:1.7">Dear <strong>' + firstName + '</strong>,</p>'
    + '<p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.7">'
    + 'I\'m looking forward to our session together. Your appointment has been confirmed — here\'s a summary of the details below.'
    + '</p>'

    // ── Session details table
    + '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#c4844a;text-transform:uppercase;margin-bottom:12px">Session Details</div>'
    + '<table style="width:100%;border-collapse:collapse;background:#fdfaf7;border-radius:8px;overflow:hidden">'
    + slotBlock
    + '<tr><td style="padding:12px 16px;border-bottom:1px solid #f0ebe5;color:#888;font-size:14px">Mode</td>'
    + '<td style="padding:12px 16px;border-bottom:1px solid #f0ebe5;font-size:14px;font-weight:600;color:#333">' + modeLabel + '</td></tr>'
    + '<tr><td style="padding:12px 16px;color:#888;font-size:14px">Session Type</td>'
    + '<td style="padding:12px 16px;font-size:14px;font-weight:600;color:#333">' + (sessionType || '—') + '</td></tr>'
    + '</table>'

    + messageBlock

    // ── What to expect
    + '<div style="margin-top:28px;background:#fdf6ef;border-radius:8px;padding:20px 22px">'
    + '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#c4844a;text-transform:uppercase;margin-bottom:12px">What to Expect</div>'
    + '<ul style="margin:0;padding-left:18px;color:#555;font-size:14px;line-height:2">'
    + '<li>I\'ll reach out with a meeting link / address details closer to the date</li>'
    + '<li>Sessions are 50 minutes unless discussed otherwise</li>'
    + '<li>Feel free to reply to this email if you have any questions</li>'
    + '</ul>'
    + '</div>'

    // ── Quote
    + '<div style="margin-top:28px;text-align:center;padding:20px 24px;border-top:1px solid #f0ebe5">'
    + '<div style="font-size:15px;font-style:italic;color:#7a6a5a;line-height:1.7">'
    + '&ldquo;You don\'t have to see the whole staircase, just take the first step.&rdquo;'
    + '</div>'
    + '<div style="font-size:12px;color:#aaa;margin-top:6px">— Martin Luther King Jr.</div>'
    + '</div>'

    + '</div>'

    // ── Footer
    + '<div style="background:#f5f0eb;padding:18px 32px;text-align:center;border-top:1px solid #ede8e3">'
    + '<p style="margin:0 0 6px;font-size:13px;color:#888">Questions? Reply to this email or reach out via WhatsApp.</p>'
    + '<p style="margin:0;font-size:12px;color:#bbb">'
    + '<a href="' + SITE_URL + '" style="color:#c4844a;text-decoration:none">mindwavecounselling.com</a>'
    + ' &nbsp;|&nbsp; ' + TO_EMAIL
    + '</p>'
    + '</div>'

    + '</div>';

  var subject = 'Your Appointment is Confirmed — MindWave Counselling';

  GmailApp.sendEmail(clientEmail, subject, '', {
    htmlBody:  html,
    replyTo:   TO_EMAIL,
    name:      'Tejal Khedkar — MindWave Counselling',
    bcc:       TO_EMAIL
  });
}

// ─── ROUTING ─────────────────────────────────────────────

function doGet(e) {
  try {
    var slots = getAvailableSlots();
    return jsonResponse({ status: 'ok', slots: slots });
  } catch (err) {
    Logger.log('doGet error: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var bdi  = data.assessments && data.assessments.bdi ? data.assessments.bdi : null;
    var bai  = data.assessments && data.assessments.bai ? data.assessments.bai : null;
    var ts   = new Date();
    var clientName = data.first_name + ' ' + (data.last_name || '');

    var ss = SpreadsheetApp.openById(SHEET_ID);

    // 1. Save to Bookings sheet
    saveBooking(ss, ts, data, bdi, bai);

    // 2. Save full Q&A to Assessment Responses sheet
    saveAssessments(ss, ts, clientName, bdi, bai);

    // 3. Mark the specific calendar instance as booked (for Tejal's visibility)
    if (data.slot_date && data.slot_time) {
      markSlotBooked(data.slot_date, data.slot_time, clientName);
    }

    // 4. Send notification email
    sendEmail(ts, data, bdi, bai, clientName);

    return jsonResponse({ status: 'ok' });

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ─── AVAILABLE SLOTS ─────────────────────────────────────
// Fetches calendar events titled "Available", then subtracts any slots
// already recorded in the Bookings sheet — no calendar modifications needed.

function getAvailableSlots() {
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  var events   = calendar.getEvents(start, end);
  var tz       = Session.getScriptTimeZone();
  var slots    = [];

  events.forEach(function (ev) {
    if (ev.getTitle().trim().toLowerCase() !== 'available') return;
    if (ev.isAllDayEvent()) return;

    var desc      = ev.getDescription() || '';
    var typeMatch = desc.match(/type\s*:\s*(online|in-person)/i);
    if (!typeMatch) return;

    slots.push({
      id:        ev.getId(),
      date:      Utilities.formatDate(ev.getStartTime(), tz, 'yyyy-MM-dd'),
      timeStart: Utilities.formatDate(ev.getStartTime(), tz, 'h:mm a'),
      timeEnd:   Utilities.formatDate(ev.getEndTime(),   tz, 'h:mm a'),
      type:      typeMatch[1].toLowerCase()
    });
  });

  slots.sort(function (a, b) {
    return new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00')
        || a.timeStart.localeCompare(b.timeStart);
  });

  // Remove slots already booked (tracked in the sheet)
  var booked = getBookedSlotKeys();
  slots = slots.filter(function (s) {
    return booked.indexOf(s.date + '|' + s.timeStart) === -1;
  });

  return slots;
}

// Returns an array of "date|time" strings for all confirmed bookings in the sheet.
function getBookedSlotKeys() {
  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('Bookings');
    if (!sheet || sheet.getLastRow() < 2) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
    var keys = [];
    data.forEach(function (row) {
      var slotDate = row[7]; // column H — Slot Date
      var slotTime = row[8]; // column I — Slot Time
      if (slotDate && slotDate !== '-' && slotTime && slotTime !== '-') {
        keys.push(slotDate + '|' + slotTime);
      }
    });
    return keys;
  } catch (err) {
    Logger.log('getBookedSlotKeys error: ' + err.message);
    return [];
  }
}

// ─── MARK SLOT BOOKED ────────────────────────────────────
// Uses the Calendar Advanced Service (Calendar.Events.patch) to rename
// only the specific recurring instance — never touches the whole series.

function markSlotBooked(slotDate, slotTime, clientName) {
  try {
    var tz     = Session.getScriptTimeZone();
    var parts  = slotDate.split('-');
    var dayStart = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dayStart.setHours(0, 0, 0, 0);
    var dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // singleEvents:true expands recurring events into individual instances,
    // each with its own unique ID — patching it only affects that occurrence.
    var response = Calendar.Events.list(CALENDAR_ID, {
      timeMin:       dayStart.toISOString(),
      timeMax:       dayEnd.toISOString(),
      singleEvents:  true,
      q:             'Available'
    });

    var items  = (response.items || []);
    var target = null;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if ((item.summary || '').trim().toLowerCase() !== 'available') continue;
      var evStart = new Date(item.start.dateTime || item.start.date);
      var evTime  = Utilities.formatDate(evStart, tz, 'h:mm a');
      if (evTime === slotTime) { target = item; break; }
    }

    if (!target) return;

    var safeName = (clientName || 'Client').replace(/[<>"'&]/g, '').trim();
    Calendar.Events.patch(
      { summary: 'Booked \u2014 ' + safeName, colorId: '11' },
      CALENDAR_ID,
      target.id
    );
  } catch (err) {
    // Non-fatal — sheet already recorded the booking
    Logger.log('markSlotBooked error: ' + err.message);
  }
}

// ─── SHEET: BOOKINGS ─────────────────────────────────────

function saveBooking(ss, ts, data, bdi, bai) {
  var sheet = getOrCreateSheet(ss, 'Bookings', [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Mode', 'Session Type', 'Slot Date', 'Slot Time',
    'Message',
    'BDI Score', 'BDI Level',
    'BAI Score', 'BAI Level'
  ]);

  var modeLabel = data.mode === 'online'
    ? 'Online'
    : data.mode === 'in-person'
    ? 'In-Person'
    : '-';

  sheet.appendRow([
    ts,
    data.first_name || '', data.last_name || '',
    data.email      || '', data.phone     || '',
    modeLabel,
    data.session_type || '',
    data.slot_date    || '-',
    data.slot_time    || '-',
    data.message      || '',
    bdi ? bdi.score + ' / ' + bdi.max : '-', bdi ? bdi.level : '-',
    bai ? bai.score + ' / ' + bai.max : '-', bai ? bai.level : '-'
  ]);
}

// ─── SHEET: ASSESSMENT RESPONSES ─────────────────────────

function saveAssessments(ss, ts, clientName, bdi, bai) {
  if (!bdi && !bai) return;

  var sheet = getOrCreateSheet(ss, 'Assessment Responses', [
    'Timestamp', 'Client Name', 'Assessment', 'Q#', 'Question', 'Score', 'Answer'
  ]);

  if (bdi && bdi.qa) {
    for (var i = 0; i < bdi.qa.length; i++) {
      var q = bdi.qa[i];
      sheet.appendRow([ts, clientName, 'BDI-II', q.num, q.question, q.score, q.answer]);
    }
  }
  if (bai && bai.qa) {
    for (var j = 0; j < bai.qa.length; j++) {
      var r = bai.qa[j];
      sheet.appendRow([ts, clientName, 'BAI', r.num, r.question, r.score, r.answer]);
    }
  }
}

// ─── EMAIL ───────────────────────────────────────────────

function sendEmail(ts, data, bdi, bai, clientName) {
  var modeLabel = data.mode === 'online'
    ? 'Online'
    : data.mode === 'in-person'
    ? 'In-Person'
    : null;

  var slotRow = '';
  if (modeLabel) {
    slotRow += '<tr><td style="padding:8px 0;color:#888888;font-size:14px;width:35%">Mode</td>'
      + '<td style="padding:8px 0;font-size:14px;color:#333333">' + modeLabel + '</td></tr>';
  }
  if (data.slot_date && data.slot_date !== '-') {
    slotRow += '<tr><td style="padding:8px 0;color:#888888;font-size:14px">Requested Slot</td>'
      + '<td style="padding:8px 0;font-size:14px;color:#333333">' + data.slot_date + ' at ' + data.slot_time + '</td></tr>';
  }

  var messageRow = '';
  if (data.message) {
    messageRow = '<tr><td style="padding:8px 0;color:#888888;font-size:14px;vertical-align:top">Message</td>'
      + '<td style="padding:8px 0;font-size:14px;color:#333333">' + data.message + '</td></tr>';
  }

  var assessSection = '';
  if (bdi || bai) {
    assessSection += '<table style="width:100%;border-collapse:collapse;background:#fdfaf7;border-radius:8px">';
    assessSection += '<tr style="background:#f5f0eb">';
    assessSection += '<th style="padding:10px 16px;text-align:left;font-size:12px;color:#888888;font-weight:600">Assessment</th>';
    assessSection += '<th style="padding:10px 16px;text-align:left;font-size:12px;color:#888888;font-weight:600">Score</th>';
    assessSection += '<th style="padding:10px 16px;text-align:left;font-size:12px;color:#888888;font-weight:600">Level</th>';
    assessSection += '</tr>';
    assessSection += assessRow(bdi);
    assessSection += assessRow(bai);
    assessSection += '</table>';
    assessSection += '<p style="font-size:12px;color:#aaaaaa;margin-top:10px">Full Q and A is in the Assessment Responses tab of the Google Sheet.</p>';
  } else {
    assessSection = '<div style="background:#f5f0eb;border-radius:8px;padding:14px 18px;font-size:14px;color:#888888">No assessment completed before booking.</div>';
  }

  var tsStr = ts.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  var html = '';
  html += '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fdfaf7">';
  html += '<div style="background:#4a3728;padding:28px 32px;border-radius:8px 8px 0 0">';
  html += '<div style="color:white;font-size:22px;font-weight:bold">MindWave Counselling</div>';
  html += '<div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px">New Appointment Request</div>';
  html += '</div>';
  html += '<div style="background:white;padding:28px 32px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3">';
  html += '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#c4844a;text-transform:uppercase;margin-bottom:16px">Contact Details</div>';
  html += '<table style="width:100%;border-collapse:collapse">';
  html += '<tr><td style="padding:8px 0;color:#888888;font-size:14px;width:35%">Name</td><td style="padding:8px 0;font-size:15px;font-weight:600;color:#333333">' + clientName + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#888888;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px"><a href="mailto:' + data.email + '" style="color:#c4844a">' + data.email + '</a></td></tr>';
  html += '<tr><td style="padding:8px 0;color:#888888;font-size:14px">Phone</td><td style="padding:8px 0;font-size:14px;color:#333333">' + data.phone + '</td></tr>';
  html += '<tr><td style="padding:8px 0;color:#888888;font-size:14px">Session Type</td><td style="padding:8px 0;font-size:14px;color:#333333">' + (data.session_type || '-') + '</td></tr>';
  html += slotRow;
  html += messageRow;
  html += '</table>';
  html += '</div>';
  html += '<div style="background:white;padding:0 32px 28px;border-left:1px solid #ede8e3;border-right:1px solid #ede8e3">';
  html += '<div style="border-top:1px solid #f0ebe5;padding-top:24px">';
  html += '<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#c4844a;text-transform:uppercase;margin-bottom:16px">Self-Assessment</div>';
  html += assessSection;
  html += '</div></div>';
  html += '<div style="background:#f5f0eb;padding:16px 32px;border-radius:0 0 8px 8px;border:1px solid #ede8e3;border-top:none">';
  html += '<span style="font-size:12px;color:#aaaaaa">mindwavecounselling.com \u2014 ' + tsStr + ' IST</span>';
  html += '</div>';
  html += '</div>';

  var subject = 'New Booking \u2014 ' + clientName;
  if (modeLabel) subject += ' (' + modeLabel + ')';
  if (bdi || bai) subject += ' \u2014 Assessment done';

  GmailApp.sendEmail(TO_EMAIL, subject, '', { htmlBody: html, replyTo: data.email });
}

// ─── HELPERS ─────────────────────────────────────────────

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f5f0eb');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function levelColor(level) {
  if (!level) return '#888888';
  var l = level.toLowerCase();
  if (l.indexOf('minimal') > -1) return '#4caf50';
  if (l.indexOf('mild')    > -1) return '#ff9800';
  if (l.indexOf('moderate')> -1) return '#f44336';
  if (l.indexOf('severe')  > -1) return '#b71c1c';
  return '#888888';
}

function assessRow(a) {
  if (!a) return '';
  var row = '<tr>';
  row += '<td style="padding:10px 16px;border-bottom:1px solid #f0ebe5;color:#666;font-size:14px;width:40%">' + a.name + '</td>';
  row += '<td style="padding:10px 16px;border-bottom:1px solid #f0ebe5;font-size:14px;font-weight:600;color:#333">' + a.score + ' / ' + a.max + '</td>';
  row += '<td style="padding:10px 16px;border-bottom:1px solid #f0ebe5">';
  row += '<span style="background:' + levelColor(a.level) + ';color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">' + a.level + '</span>';
  row += '</td></tr>';
  return row;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
