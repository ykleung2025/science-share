/**
 * 科學網站分享 — Google Apps Script 網頁應用程式
 *
 * 部署步驟見專案 README.md
 * 試算表欄位：timestamp | title | url | grades | topics | note | submitter | status | id
 * 舊表如果只有前 8 欄，第一次執行會在後面加 id，並為有內容但未有 id 的列補上 UUID。
 *
 * 前端以 POST + Content-Type: text/plain 送 JSON（避免 CORS 預檢）。
 * 回應亦係 text/plain，內容為 JSON：
 *   { "action": "list" }
 *   { "action": "submit", "title": "...", "url": "...", "grades": ["P1"], "topics": ["healthy-living"], "note": "", "submitter": "" }
 *   { "action": "update", "id": "...", "managePassword": "...", "title": "...", "url": "...", "grades": ["P1"], "topics": ["healthy-living"], "note": "", "submitter": "" }
 *   { "action": "remove", "id": "...", "managePassword": "..." }
 *
 * managePassword 同 manageToken 都接受，必須等於 MANAGE_PASSWORD。
 * 清單回應唔會包含管理密碼。
 *
 * 亦支援 doGet?action=list。修改同移除只接受 POST。
 *
 * v1：提交即 status=approved，清單只回傳空白／approved／public。
 * 移除係軟刪除：status 改做 hidden。試算表擁有人亦可手動改做 hidden 或 rejected。
 * DEDUPE_BY_URL 為 true 時，同一個正規化網址只保留一列（包含已隱藏列）。
 *
 * 年級／課題 id 要同前端 app.js、README 一致。
 * 改動本檔後必須重新部署（部署 → 管理部署作業 → 編輯 → 新版本）。同一個 /exec 網址。
 *
 * MANAGE_PASSWORD 要同 app.js 示範模式的常數一致。
 */

var SHEET_NAME = '分享';
var HEADERS = ['timestamp', 'title', 'url', 'grades', 'topics', 'note', 'submitter', 'status', 'id'];
var TZ = 'Asia/Hong_Kong';
var DEDUPE_BY_URL = true;
var MANAGE_PASSWORD = '27585767';

var GRADE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
/**
 * 39 個課題 id，對應《科學（小一至小六）課程指引》（2025）2.5.1。
 * 必須同前端 app.js 的課題 id 一致。
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

function badPassword_() {
  return jsonOut_({
    ok: false,
    error: 'bad_password',
    message: '管理密碼不正確。',
  });
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function headerMap_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i] || '').replace(/^\s+|\s+$/g, '');
    if (name && map[name] == null) map[name] = i + 1;
  }
  return map;
}

/**
 * 空表寫完整標題。已有資料的表只補缺少的欄（通常係 id），唔調動原有欄序。
 * 有標題或網址、但 id 空白的列會補上 UUID。
 */
function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var current = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var hasAny = false;
  for (var i = 0; i < current.length; i++) {
    if (String(current[i] || '').replace(/^\s+|\s+$/g, '')) hasAny = true;
  }

  if (!hasAny) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return;
  }

  var map = headerMap_(sheet);
  var nextCol = sheet.getLastColumn() + 1;
  for (var h = 0; h < HEADERS.length; h++) {
    if (!map[HEADERS[h]]) {
      var headerCell = sheet.getRange(1, nextCol);
      headerCell.setValue(HEADERS[h]);
      headerCell.setFontWeight('bold');
      map[HEADERS[h]] = nextCol;
      nextCol++;
    }
  }
  sheet.setFrozenRows(1);
  backfillIds_(sheet, map);
}

function backfillIds_(sheet, map) {
  var idCol = map.id;
  var titleCol = map.title;
  var urlCol = map.url;
  if (!idCol) return;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var width = Math.max(sheet.getLastColumn(), idCol);
  var data = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var idValues = [];
  var changed = false;
  for (var r = 0; r < data.length; r++) {
    var id = String(data[r][idCol - 1] || '').replace(/^\s+|\s+$/g, '');
    var title = titleCol ? String(data[r][titleCol - 1] || '').replace(/^\s+|\s+$/g, '') : '';
    var url = urlCol ? String(data[r][urlCol - 1] || '').replace(/^\s+|\s+$/g, '') : '';
    if (!id && (title || url)) {
      id = Utilities.getUuid();
      changed = true;
    }
    idValues.push([id]);
  }
  if (changed) sheet.getRange(2, idCol, idValues.length, 1).setValues(idValues);
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

function readSuppliedPassword_(body) {
  var raw = '';
  if (body && body.managePassword != null && String(body.managePassword) !== '') {
    raw = String(body.managePassword);
  } else if (body && body.manageToken != null) {
    raw = String(body.manageToken);
  }
  return raw.replace(/^\s+|\s+$/g, '');
}

function passwordOk_(body) {
  var given = readSuppliedPassword_(body);
  if (!given || given.length !== MANAGE_PASSWORD.length) return false;
  var mismatch = 0;
  for (var i = 0; i < MANAGE_PASSWORD.length; i++) {
    if (given.charCodeAt(i) !== MANAGE_PASSWORD.charCodeAt(i)) mismatch++;
  }
  return mismatch === 0;
}

function readRows_(sheet) {
  var map = headerMap_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var width = Math.max(sheet.getLastColumn(), 1);
  var data = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var title = cleanText_(cell_(data[i], map, 'title'), 80);
    var url = normalizeUrl_(cell_(data[i], map, 'url'));
    if (!title || !url) continue;
    var grades = parseIdList_(cell_(data[i], map, 'grades'), GRADE_IDS);
    var topics = parseIdList_(cell_(data[i], map, 'topics'), TOPIC_IDS);
    var id = String(cell_(data[i], map, 'id') || '').replace(/^\s+|\s+$/g, '');
    rows.push({
      id: id,
      timestamp: timestampToString_(cell_(data[i], map, 'timestamp')),
      title: title,
      url: url,
      grades: grades.ids,
      topics: topics.ids,
      note: cleanText_(cell_(data[i], map, 'note'), 300),
      submitter: cleanText_(cell_(data[i], map, 'submitter'), 40),
      status: cleanText_(cell_(data[i], map, 'status'), 20).toLowerCase(),
      _row: i + 2,
    });
  }
  return rows;
}

function cell_(row, map, name) {
  var col = map[name];
  if (!col) return '';
  return row[col - 1];
}

function publicItem_(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    title: row.title,
    url: row.url,
    grades: row.grades,
    topics: row.topics,
    note: row.note,
    submitter: row.submitter,
    status: row.status,
  };
}

function publicItems_(rows) {
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    if (isPublicStatus_(rows[i].status)) items.push(publicItem_(rows[i]));
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

function validateItem_(body) {
  var title = cleanText_(body.title, 80);
  var note = cleanText_(body.note, 300);
  var submitter = cleanText_(body.submitter, 40);
  var url = normalizeUrl_(body.url);

  if (!url) {
    return {
      ok: false,
      error: 'invalid_url',
      message: '請貼上有效嘅網址（http 或 https）。',
    };
  }
  if (!title) {
    return {
      ok: false,
      error: 'invalid_title',
      message: '請填標題，等同事搵到。',
    };
  }

  var grades = parseIdList_(body.grades, GRADE_IDS);
  if (grades.error || !grades.ids.length) {
    return {
      ok: false,
      error: 'invalid_grade',
      message: grades.error ? '年級要係小一至小六。' : '請揀至少一個年級。',
    };
  }
  var topics = parseIdList_(body.topics, TOPIC_IDS);
  if (topics.error || !topics.ids.length) {
    return {
      ok: false,
      error: 'invalid_topic',
      message: topics.error ? '有課題標籤唔正確，請再揀過。' : '請揀至少一個課題。',
    };
  }

  return {
    ok: true,
    item: {
      title: title,
      url: url,
      grades: grades.ids,
      topics: topics.ids,
      note: note,
      submitter: submitter,
    },
  };
}

function setCell_(sheet, row, map, name, value) {
  if (!map[name]) return;
  sheet.getRange(row, map[name]).setValue(value);
}

function writeMutable_(sheet, rowNumber, map, item) {
  setCell_(sheet, rowNumber, map, 'title', item.title);
  setCell_(sheet, rowNumber, map, 'url', item.url);
  setCell_(sheet, rowNumber, map, 'grades', item.grades.join(','));
  setCell_(sheet, rowNumber, map, 'topics', item.topics.join(','));
  setCell_(sheet, rowNumber, map, 'note', item.note);
  setCell_(sheet, rowNumber, map, 'submitter', item.submitter);
}

function findSheetRowById_(sheet, id) {
  var map = headerMap_(sheet);
  if (!map.id || !id) return 0;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var values = sheet.getRange(2, map.id, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').replace(/^\s+|\s+$/g, '') === id) return i + 2;
  }
  return 0;
}

function duplicateUrl_(rows, url, exceptId) {
  if (!DEDUPE_BY_URL) return false;
  for (var i = 0; i < rows.length; i++) {
    if (exceptId && rows[i].id === exceptId) continue;
    if (rows[i].url === url) return true;
  }
  return false;
}

function handleList_() {
  return withScriptLock_(function () {
    var sheet = getOrCreateSheet_();
    return jsonOut_({
      ok: true,
      items: publicItems_(readRows_(sheet)),
    });
  });
}

function handleSubmit_(body) {
  var checked = validateItem_(body || {});
  if (!checked.ok) return jsonOut_(checked);

  return withScriptLock_(function () {
    var sheet = getOrCreateSheet_();
    var rows = readRows_(sheet);
    if (duplicateUrl_(rows, checked.item.url, '')) {
      return jsonOut_({
        ok: false,
        error: 'duplicate',
        message: '呢個網址已經提交過。如果清單見唔到，可能被隱藏咗，請聯絡管理試算表嘅同事。',
      });
    }

    var map = headerMap_(sheet);
    var timestamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
    var status = 'approved';
    var id = Utilities.getUuid();
    var rowNumber = Math.max(sheet.getLastRow(), 1) + 1;
    setCell_(sheet, rowNumber, map, 'timestamp', timestamp);
    writeMutable_(sheet, rowNumber, map, checked.item);
    setCell_(sheet, rowNumber, map, 'status', status);
    setCell_(sheet, rowNumber, map, 'id', id);

    return jsonOut_({
      ok: true,
      message: '收到！個網站已經出現喺清單。',
      item: {
        id: id,
        timestamp: timestamp,
        title: checked.item.title,
        url: checked.item.url,
        grades: checked.item.grades,
        topics: checked.item.topics,
        note: checked.item.note,
        submitter: checked.item.submitter,
        status: status,
      },
    });
  });
}

function handleUpdate_(body) {
  if (!passwordOk_(body)) return badPassword_();
  var id = String((body && body.id) || '').replace(/^\s+|\s+$/g, '');
  if (!id) {
    return jsonOut_({
      ok: false,
      error: 'missing_id',
      message: '搵唔到要修改嘅分享。',
    });
  }
  var checked = validateItem_(body || {});
  if (!checked.ok) return jsonOut_(checked);

  return withScriptLock_(function () {
    var sheet = getOrCreateSheet_();
    var rowNumber = findSheetRowById_(sheet, id);
    if (!rowNumber) {
      return jsonOut_({
        ok: false,
        error: 'not_found',
        message: '搵唔到呢個分享，可能已經移除。請重新整理。',
      });
    }

    var rows = readRows_(sheet);
    if (duplicateUrl_(rows, checked.item.url, id)) {
      return jsonOut_({
        ok: false,
        error: 'duplicate',
        message: '呢個網址已經提交過。如果清單見唔到，可能被隱藏咗，請聯絡管理試算表嘅同事。',
      });
    }

    var current = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) current = rows[i];
    }
    var map = headerMap_(sheet);
    var timestamp = current
      ? current.timestamp
      : timestampToString_(map.timestamp ? sheet.getRange(rowNumber, map.timestamp).getValue() : '');
    var status = current ? current.status : '';
    if (!current && map.status) {
      status = cleanText_(sheet.getRange(rowNumber, map.status).getValue(), 20).toLowerCase();
    }

    writeMutable_(sheet, rowNumber, map, checked.item);

    return jsonOut_({
      ok: true,
      message: '已更新。同事會見到新內容。',
      item: {
        id: id,
        timestamp: timestamp,
        title: checked.item.title,
        url: checked.item.url,
        grades: checked.item.grades,
        topics: checked.item.topics,
        note: checked.item.note,
        submitter: checked.item.submitter,
        status: status,
      },
    });
  });
}

function handleRemove_(body) {
  if (!passwordOk_(body)) return badPassword_();
  var id = String((body && body.id) || '').replace(/^\s+|\s+$/g, '');
  if (!id) {
    return jsonOut_({
      ok: false,
      error: 'missing_id',
      message: '搵唔到要移除嘅分享。',
    });
  }

  return withScriptLock_(function () {
    var sheet = getOrCreateSheet_();
    var rowNumber = findSheetRowById_(sheet, id);
    if (!rowNumber) {
      return jsonOut_({
        ok: false,
        error: 'not_found',
        message: '搵唔到呢個分享，可能已經移除。請重新整理。',
      });
    }
    var map = headerMap_(sheet);
    if (!map.status) {
      return jsonOut_({
        ok: false,
        error: 'server',
        message: '試算表未有 status 欄。',
      });
    }
    sheet.getRange(rowNumber, map.status).setValue('hidden');
    return jsonOut_({
      ok: true,
      message: '已移除。同事唔會再見到呢個網站。',
      id: id,
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
  if (action === 'update') return handleUpdate_(body || {});
  if (action === 'remove') return handleRemove_(body || {});
  return jsonOut_({
    ok: false,
    error: 'unknown_action',
    message: '未知操作。請用 action=list、submit、update 或 remove。',
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
        message: '科學網站分享 API 運作中。請用 action=list，或 POST submit、update、remove。',
      });
    }
    if (action === 'update' || action === 'remove') {
      return jsonOut_({
        ok: false,
        error: 'use_post',
        message: '修改同移除請用 POST。',
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
