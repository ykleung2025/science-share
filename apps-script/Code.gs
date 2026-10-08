/**
 * 科學網站分享 — Google Apps Script 網頁應用程式
 *
 * 部署步驟見專案 README.md
 * 試算表欄位：timestamp | title | url | grades | topics | note | submitter | status
 *
 * 前端以 POST + Content-Type: text/plain 送 JSON（避免 CORS 預檢）。
 * 回應亦係 text/plain，內容為 JSON：
 *   { "action": "list" }
 *   { "action": "submit", "title": "...", "url": "...", "grades": ["P1"], "topics": ["plants"], "note": "", "submitter": "" }
 *
 * 亦支援 doGet?action=list。
 *
 * v1：提交即 status=approved，清單只回傳空白／approved／public。
 * 試算表擁有人可將 status 改為 hidden 或 rejected，該列就唔再出現。
 * DEDUPE_BY_URL 為 true 時，同一個正規化網址只保留一列。
 *
 * 年級／課題 id 要同前端 app.js、README 一致。
 * 改動本檔後必須重新部署（部署 → 管理部署作業 → 編輯 → 新版本）。
 */

var SHEET_NAME = '分享';
var HEADERS = ['timestamp', 'title', 'url', 'grades', 'topics', 'note', 'submitter', 'status'];
var TZ = 'Asia/Hong_Kong';
var DEDUPE_BY_URL = true;

var GRADE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
/**
 * 39 個課題 id，對應《科學（小一至小六）課程指引》（2025）2.5.1。
 * 必須同前端 app.js 的 TAXONOMY id 一致。
 */
var TOPIC_IDS = [
  'healthy-living', 'disease',
  'living-nonliving', 'biodiversity', 'body-structure', 'body-systems',
  'life-cycle', 'heredity',
  'adaptation', 'human-environment',
  'ecosystem', 'food-chain',
  'microbes', 'cells',
  'states-of-matter', 'material-properties', 'physical-chemical',
  'energy-sources', 'light', 'sound', 'electricity', 'heat',
  'force-motion', 'simple-machines',
  'earth-features', 'earth-resources', 'earth-history',
  'daily-weather', 'climate-seasons', 'regional-climate',
  'solar-system', 'sun-earth-moon',
  'inquiry-process', 'science-value', 'scientists',
  'daily-tech', 'innovation', 'space-tech',
  'engineering-design'
];

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  var values = range.getValues()[0];
  var blank = true;
  var mismatch = false;
  for (var i = 0; i < HEADERS.length; i++) {
    var cell = String(values[i] || '');
    if (cell) blank = false;
    if (cell !== HEADERS[i]) mismatch = true;
  }
  if (blank || (mismatch && sheet.getLastRow() <= 1)) {
    range.setValues([HEADERS]);
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function cleanText_(value, maxLen) {
  var s = String(value || '').replace(/[\u0000-\u001F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.substring(0, maxLen);
  return s;
}

function ensureScheme_(raw) {
  var s = String(raw || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[\w.-]+\.[a-z]{2,}([\/?#:]|$)/i.test(s)) return 'https://' + s;
  return s;
}

/**
 * 正規化網址：小寫協定同主機、去掉 hash 同尾端斜線。路徑大小寫保留。
 * 無效則回傳空字串。
 */
function normalizeUrl_(raw) {
  var s = ensureScheme_(raw);
  if (!s || /\s/.test(s)) return '';
  var match = s.match(/^(https?):\/\/([^\/?#]+)([^?#]*)(\?[^#]*)?/i);
  if (!match) return '';
  var proto = match[1].toLowerCase();
  var host = match[2].toLowerCase();
  if (proto === 'http') host = host.replace(/:80$/, '');
  if (proto === 'https') host = host.replace(/:443$/, '');
  var path = match[3] || '';
  var query = match[4] || '';
  if (path.length > 1 && path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1);
  }
  if (path === '/') path = '';
  return proto + '://' + host + path + query;
}

function parseIdList_(value, allowed) {
  var raw = [];
  if (Object.prototype.toString.call(value) === '[object Array]') {
    raw = value;
  } else {
    raw = String(value || '').split(/[,，、\s]+/);
  }
  var seen = {};
  var ids = [];
  for (var i = 0; i < raw.length; i++) {
    var id = String(raw[i] || '').trim();
    if (!id || seen[id]) continue;
    if (allowed.indexOf(id) === -1) return { error: id, ids: [] };
    seen[id] = true;
    ids.push(id);
  }
  var ordered = [];
  for (var j = 0; j < allowed.length; j++) {
    if (ids.indexOf(allowed[j]) !== -1) ordered.push(allowed[j]);
  }
  return { ids: ordered };
}

function isPublicStatus_(status) {
  var s = String(status || '').trim().toLowerCase();
  return !s || s === 'approved' || s === 'public';
}

function timestampToString_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, TZ, 'yyyy-MM-dd HH:mm:ss');
  }
  return String(value || '').trim();
}

function readRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var title = cleanText_(data[i][1], 80);
    var url = normalizeUrl_(data[i][2]);
    if (!title || !url) continue;
    var grades = parseIdList_(data[i][3], GRADE_IDS);
    var topics = parseIdList_(data[i][4], TOPIC_IDS);
    rows.push({
      timestamp: timestampToString_(data[i][0]),
      title: title,
      url: url,
      grades: grades.ids,
      topics: topics.ids,
      note: cleanText_(data[i][5], 300),
      submitter: cleanText_(data[i][6], 40),
      status: cleanText_(data[i][7], 20).toLowerCase(),
    });
  }
  return rows;
}

function publicItems_(rows) {
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    if (isPublicStatus_(rows[i].status)) items.push(rows[i]);
  }
  items.sort(function (a, b) {
    if (a.timestamp === b.timestamp) return a.title < b.title ? -1 : 1;
    return a.timestamp < b.timestamp ? 1 : -1;
  });
  return items;
}

function withScriptLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    return jsonOut_({
      ok: false,
      error: 'busy',
      message: '系統忙碌中，請稍後再試。',
    });
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function handleList_() {
  var sheet = getOrCreateSheet_();
  return jsonOut_({
    ok: true,
    items: publicItems_(readRows_(sheet)),
  });
}

function handleSubmit_(body) {
  var title = cleanText_(body.title, 80);
  var note = cleanText_(body.note, 300);
  var submitter = cleanText_(body.submitter, 40);
  var url = normalizeUrl_(body.url);

  if (!url) {
    return jsonOut_({
      ok: false,
      error: 'invalid_url',
      message: '請貼上有效嘅網址（http 或 https）。',
    });
  }
  if (!title) {
    return jsonOut_({
      ok: false,
      error: 'invalid_title',
      message: '請填標題，等同事搵到。',
    });
  }

  var grades = parseIdList_(body.grades, GRADE_IDS);
  if (grades.error || !grades.ids.length) {
    return jsonOut_({
      ok: false,
      error: 'invalid_grade',
      message: grades.error ? '年級要係小一至小六。' : '請揀至少一個年級。',
    });
  }
  var topics = parseIdList_(body.topics, TOPIC_IDS);
  if (topics.error || !topics.ids.length) {
    return jsonOut_({
      ok: false,
      error: 'invalid_topic',
      message: topics.error ? '有課題標籤唔正確，請再揀過。' : '請揀至少一個課題。',
    });
  }

  return withScriptLock_(function () {
    var sheet = getOrCreateSheet_();
    var rows = readRows_(sheet);
    if (DEDUPE_BY_URL) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].url === url) {
          return jsonOut_({
            ok: false,
            error: 'duplicate',
            message: '呢個網址已經提交過。如果清單見唔到，可能被隱藏咗，請聯絡管理試算表嘅同事。',
          });
        }
      }
    }

    var timestamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
    var status = 'approved';
    sheet.appendRow([
      timestamp,
      title,
      url,
      grades.ids.join(','),
      topics.ids.join(','),
      note,
      submitter,
      status,
    ]);

    return jsonOut_({
      ok: true,
      message: '收到！個網站已經出現喺清單。',
      item: {
        timestamp: timestamp,
        title: title,
        url: url,
        grades: grades.ids,
        topics: topics.ids,
        note: note,
        submitter: submitter,
        status: status,
      },
    });
  });
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents;
  if (!raw && e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function dispatch_(body) {
  var action = String((body && body.action) || '').toLowerCase();
  if (action === 'list') return handleList_();
  if (action === 'submit') return handleSubmit_(body || {});
  return jsonOut_({
    ok: false,
    error: 'unknown_action',
    message: '未知操作。請用 action=list 或 action=submit。',
  });
}

function doPost(e) {
  try {
    return dispatch_(parseBody_(e));
  } catch (err) {
    return jsonOut_({
      ok: false,
      error: 'server',
      message: '伺服器錯誤：' + err.message,
    });
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || '').toLowerCase();
    if (!action) {
      return jsonOut_({
        ok: true,
        message: '科學網站分享 API 運作中。請用 action=list 或 POST action=submit。',
      });
    }
    if (action === 'list') return handleList_();
    if (action === 'submit') {
      return handleSubmit_({
        title: params.title || '',
        url: params.url || '',
        grades: params.grades || '',
        topics: params.topics || '',
        note: params.note || '',
        submitter: params.submitter || '',
      });
    }
    return dispatch_({ action: action });
  } catch (err) {
    return jsonOut_({
      ok: false,
      error: 'server',
      message: '伺服器錯誤：' + err.message,
    });
  }
}
