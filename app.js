/**
 * 科學網站分享 — 前端
 * 示範模式（localStorage）或 Google Apps Script。
 * 年級／課題 id 要同 apps-script/Code.gs、README 一致。
 * 修改／移除要用學校管理密碼。MANAGE_PASSWORD 要同 Code.gs 一致。
 */
(function () {
  'use strict';

  var GRADES = [
    { id: 'P1', label: '小一' },
    { id: 'P2', label: '小二' },
    { id: 'P3', label: '小三' },
    { id: 'P4', label: '小四' },
    { id: 'P5', label: '小五' },
    { id: 'P6', label: '小六' },
  ];

  /**
   * 《科學（小一至小六）課程指引》（2025）第 2.2、2.5.1、2.5.2、3.2.1 節。
   * 四個學習範疇、15 個主題、39 個課題。課題名稱用指引原文。
   * grades 只係 2.5.2「各級學習重點一覽」出現該課題的年級，用作提示，唔限制提交。
   * id 要同 apps-script/Code.gs 的 TOPIC_IDS 一致。
   */
  var STRANDS = [
    {
      id: 'life',
      label: '範疇一　生命與環境',
      themes: [
        {
          id: 'LA',
          label: '人體健康',
          topics: [
            { id: 'healthy-living', label: '健康的生活方式', grades: ['P1', 'P3', 'P6'] },
            { id: 'disease', label: '傳染病與非傳染病', grades: ['P4'] },
          ],
        },
        {
          id: 'LB',
          label: '生物的特性',
          topics: [
            { id: 'living-nonliving', label: '生物和非生物的分別', grades: ['P1', 'P2'] },
            { id: 'biodiversity', label: '生物的多樣性及分類', grades: ['P3'] },
            { id: 'body-structure', label: '生物的構造', grades: ['P2', 'P3'] },
            { id: 'body-systems', label: '人體系統', grades: ['P5', 'P6'] },
          ],
        },
        {
          id: 'LC',
          label: '生命的延續',
          topics: [
            { id: 'life-cycle', label: '生物的生命周期', grades: ['P1', 'P3', 'P5'] },
            { id: 'heredity', label: '遺傳與繁殖', grades: ['P3', 'P4'] },
          ],
        },
        {
          id: 'LD',
          label: '生物與自然環境的相互關係',
          topics: [
            { id: 'adaptation', label: '生物形態和功能及其對環境的適應力', grades: ['P4'] },
            { id: 'human-environment', label: '人類行為對自然環境的影響', grades: ['P2', 'P5', 'P6'] },
          ],
        },
        {
          id: 'LE',
          label: '生態系統',
          topics: [
            { id: 'ecosystem', label: '生態環境', grades: ['P2', 'P4'] },
            { id: 'food-chain', label: '食物鏈', grades: ['P2', 'P4', 'P6'] },
          ],
        },
        {
          id: 'LF',
          label: '顯微鏡下的世界',
          topics: [
            { id: 'microbes', label: '常見的微生物', grades: ['P5'] },
            { id: 'cells', label: '細胞與顯微鏡', grades: ['P6'] },
          ],
        },
      ],
    },
    {
      id: 'matter',
      label: '範疇二　物質、能量和變化',
      themes: [
        {
          id: 'MA',
          label: '物質的特性和變化',
          topics: [
            { id: 'states-of-matter', label: '物質的不同狀態', grades: ['P3'] },
            { id: 'material-properties', label: '物質的特性', grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] },
            { id: 'physical-chemical', label: '物理變化與化學變化', grades: ['P3', 'P4', 'P5', 'P6'] },
          ],
        },
        {
          id: 'MB',
          label: '能量的不同形式和傳遞',
          topics: [
            { id: 'energy-sources', label: '能量的來源和使用', grades: ['P3', 'P4', 'P5'] },
            { id: 'light', label: '光的特性與相關現象', grades: ['P1', 'P4', 'P6'] },
            { id: 'sound', label: '聲音的特性與相關現象', grades: ['P2', 'P5'] },
            { id: 'electricity', label: '電的特性與相關現象', grades: ['P4', 'P5', 'P6'] },
            { id: 'heat', label: '熱傳遞', grades: ['P3'] },
          ],
        },
        {
          id: 'MC',
          label: '力和運動',
          topics: [
            { id: 'force-motion', label: '力和與運動相關的現象', grades: ['P1', 'P2', 'P4', 'P5'] },
            { id: 'simple-machines', label: '簡單機械', grades: ['P3', 'P6'] },
          ],
        },
      ],
    },
    {
      id: 'earth',
      label: '範疇三　地球與太空',
      themes: [
        {
          id: 'EA',
          label: '地球的特徵和資源',
          topics: [
            { id: 'earth-features', label: '地球的特徵', grades: ['P1', 'P4'] },
            { id: 'earth-resources', label: '地球的資源', grades: ['P3'] },
            { id: 'earth-history', label: '地球的歷史', grades: ['P5', 'P6'] },
          ],
        },
        {
          id: 'EB',
          label: '氣候與季節',
          topics: [
            { id: 'daily-weather', label: '日常的天氣現象', grades: ['P2', 'P3', 'P5'] },
            { id: 'climate-seasons', label: '氣候與季節的轉變', grades: ['P4'] },
            { id: 'regional-climate', label: '不同地區的氣候特徵', grades: ['P4', 'P5'] },
          ],
        },
        {
          id: 'EC',
          label: '宇宙中的太陽系',
          topics: [
            { id: 'solar-system', label: '太陽和八大行星', grades: ['P3', 'P5'] },
            { id: 'sun-earth-moon', label: '在地球上可觀察到的一些由太陽、地球和月球運動所引起的現象和規律', grades: ['P1', 'P2', 'P3', 'P4', 'P6'] },
          ],
        },
      ],
    },
    {
      id: 'stes',
      label: '範疇四　科學、科技、工程與社會',
      themes: [
        {
          id: 'SA',
          label: '科學過程和科學精神',
          topics: [
            { id: 'inquiry-process', label: '科學探究的過程', grades: ['P2', 'P3', 'P4'] },
            { id: 'science-value', label: '科學與科技創造價值和改變人類生活', grades: ['P3', 'P5', 'P6'] },
            { id: 'scientists', label: '著名科學家的研究和貢獻', grades: ['P2', 'P5'] },
          ],
        },
        {
          id: 'SB',
          label: '航天與創新科技',
          topics: [
            { id: 'daily-tech', label: '日常生活中的科技', grades: ['P1', 'P3'] },
            { id: 'innovation', label: '創新科技發展', grades: ['P3', 'P5'] },
            { id: 'space-tech', label: '國家和世界的航天科技發展', grades: ['P4', 'P6'] },
          ],
        },
        {
          id: 'SC',
          label: '工程與設計',
          topics: [
            { id: 'engineering-design', label: '工程、設計循環和應用', grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] },
          ],
        },
      ],
    },
  ];

  var GRADE_IDS = GRADES.map(function (g) { return g.id; });
  var TOPICS = [];
  STRANDS.forEach(function (strand) {
    strand.themes.forEach(function (theme) {
      theme.topics.forEach(function (topic) {
        TOPICS.push(topic);
      });
    });
  });
  var TOPIC_IDS = TOPICS.map(function (topic) { return topic.id; });

  var MOCK_KEY = 'science_share_mock_v2';
  var SESSION_KEY = 'science_share_manage_pw';
  var MANAGE_PASSWORD = '27585767';
  var URL_PLACEHOLDER = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

  var DEMO_SITES = [
    {
      id: 'demo-p1animal',
      timestamp: '2026-09-18 10:00:00',
      title: '香港動物大探究',
      url: 'https://ykleung2025.github.io/p1animal/',
      grades: ['P1'],
      topics: ['living-nonliving'],
      note: '現有教學頁例子：小一認識香港常見動物同植物。對應課題「生物和非生物的分別」。',
      submitter: '',
      status: 'approved',
    },
    {
      id: 'demo-p5air',
      timestamp: '2026-09-20 11:30:00',
      title: '小小科學家探究助手：空氣的秘密',
      url: 'https://ykleung2025.github.io/p5science/',
      grades: ['P4', 'P5'],
      topics: ['material-properties', 'inquiry-process'],
      note: '現有教學頁例子：空氣實驗同公平測試。對應「物質的特性」「科學探究的過程」。',
      submitter: '',
      status: 'approved',
    },
    {
      id: 'demo-body-structure',
      timestamp: '2026-09-22 09:00:00',
      title: '示範：生物的構造',
      url: 'samples/demo.html?id=body-structure',
      grades: ['P2'],
      topics: ['body-structure'],
      note: '示範卡片，用來試課題篩選。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-healthy-living',
      timestamp: '2026-09-23 09:20:00',
      title: '示範：健康的生活方式',
      url: 'samples/demo.html?id=healthy-living',
      grades: ['P1'],
      topics: ['healthy-living'],
      note: '示範卡片：身體各部分同健康習慣。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-daily-weather',
      timestamp: '2026-09-24 10:15:00',
      title: '示範：日常的天氣現象',
      url: 'samples/demo.html?id=daily-weather',
      grades: ['P2'],
      topics: ['daily-weather'],
      note: '示範卡片：觀察同記錄天氣。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-light',
      timestamp: '2026-09-25 14:00:00',
      title: '示範：光的特性與相關現象',
      url: 'samples/demo.html?id=light',
      grades: ['P1'],
      topics: ['light'],
      note: '示範卡片：光同影子。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-force-motion',
      timestamp: '2026-09-26 15:10:00',
      title: '示範：力和與運動相關的現象',
      url: 'samples/demo.html?id=force-motion',
      grades: ['P2', 'P4'],
      topics: ['force-motion'],
      note: '示範卡片：推力、拉力同摩擦力。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-electricity',
      timestamp: '2026-09-28 09:40:00',
      title: '示範：電的特性與相關現象',
      url: 'samples/demo.html?id=electricity',
      grades: ['P4'],
      topics: ['electricity'],
      note: '示範卡片：簡單閉合電路。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-solar-system',
      timestamp: '2026-09-30 16:05:00',
      title: '示範：太陽和八大行星',
      url: 'samples/demo.html?id=solar-system',
      grades: ['P3', 'P5'],
      topics: ['solar-system', 'sun-earth-moon'],
      note: '示範卡片：太陽系，以及由太陽、地球和月球運動引起的現象。',
      submitter: '示範',
      status: 'approved',
    },
    {
      id: 'demo-human-environment',
      timestamp: '2026-10-02 11:00:00',
      title: '示範：人類行為對自然環境的影響',
      url: 'samples/demo.html?id=human-environment',
      grades: ['P2', 'P5'],
      topics: ['human-environment', 'earth-resources'],
      note: '示範卡片：污染、惜水同保護環境。',
      submitter: '示範',
      status: 'approved',
    },
  ];


  var cfg = window.SCIENCE_SHARE_CONFIG || {};
  var scriptUrl = String(cfg.APPS_SCRIPT_URL || '').trim();
  var urlMissing = !scriptUrl || scriptUrl === URL_PLACEHOLDER;
  var USE_MOCK = cfg.USE_MOCK === true || urlMissing;

  var state = {
    items: [],
    filterGrades: {},
    filterTopics: {},
    keyword: '',
    formGrades: {},
    formTopics: {},
    submitting: false,
    highlightUrl: '',
    highlightId: '',
    editingId: '',
    pendingRemoveId: '',
  };

  var el = {
    mockBanner: document.getElementById('mock-banner'),
    mockBannerText: document.getElementById('mock-banner-text'),
    resetMockBtn: document.getElementById('reset-mock-btn'),
    filterGrades: document.getElementById('filter-grades'),
    filterTopics: document.getElementById('filter-topics'),
    formGrades: document.getElementById('form-grades'),
    formTopics: document.getElementById('form-topics'),
    keyword: document.getElementById('keyword'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    resultMeta: document.getElementById('result-meta'),
    cardList: document.getElementById('card-list'),
    form: document.getElementById('share-form'),
    urlInput: document.getElementById('site-url'),
    titleInput: document.getElementById('site-title'),
    noteInput: document.getElementById('site-note'),
    submitterInput: document.getElementById('site-submitter'),
    submitBtn: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackMsg: document.getElementById('feedback-msg'),
    feedbackQr: document.getElementById('feedback-qr'),
    listFeedback: document.getElementById('list-feedback'),
    submitTitleText: document.getElementById('submit-title-text'),
    submitLead: document.getElementById('submit-lead'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    manageHint: document.getElementById('manage-hint'),
    redeployNote: document.getElementById('redeploy-note'),
    unlockForm: document.getElementById('unlock-form'),
    unlockPassword: document.getElementById('unlock-password'),
    unlockError: document.getElementById('unlock-error'),
    unlockStatus: document.getElementById('unlock-status'),
    lockBtn: document.getElementById('lock-btn'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmMsg: document.getElementById('confirm-msg'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
    printSheet: document.getElementById('print-sheet'),
    printTitle: document.getElementById('print-title'),
    printUrl: document.getElementById('print-url'),
    printQr: document.getElementById('print-qr'),
  };

  function gradeLabel(id) {
    for (var i = 0; i < GRADES.length; i++) {
      if (GRADES[i].id === id) return GRADES[i].label;
    }
    return id;
  }

  function topicLabel(id) {
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].id === id) return TOPICS[i].label;
    }
    return id;
  }

  function cleanText(value, maxLen) {
    var s = String(value || '').replace(/[\u0000-\u001F]/g, ' ').replace(/\s+/g, ' ').trim();
    if (s.length > maxLen) s = s.substring(0, maxLen);
    return s;
  }

  function ensureScheme(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[\w.-]+\.[a-z]{2,}([\/?#:]|$)/i.test(s)) return 'https://' + s;
    return s;
  }

  function normalizeUrl(raw) {
    var s = ensureScheme(raw);
    if (!s) return '';
    var u;
    try {
      u = new URL(s);
    } catch (err) {
      return '';
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    var path = u.pathname || '';
    if (path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.slice(0, -1);
    }
    if (path === '/') path = '';
    return u.protocol.toLowerCase() + '//' + u.host.toLowerCase() + path + u.search;
  }

  function parseIdList(value, allowed) {
    var raw = [];
    if (Object.prototype.toString.call(value) === '[object Array]') raw = value;
    else raw = String(value || '').split(/[,，、\s]+/);
    var seen = {};
    var ids = [];
    for (var i = 0; i < raw.length; i++) {
      var id = String(raw[i] || '').trim();
      if (!id || seen[id]) continue;
      if (allowed.indexOf(id) === -1) return { error: id, ids: [] };
      seen[id] = true;
      ids.push(id);
    }
    return { ids: sortByCatalog(ids, allowed) };
  }

  function sortByCatalog(ids, catalog) {
    return catalog.filter(function (id) { return ids.indexOf(id) !== -1; });
  }

  function selectedIds(map) {
    return Object.keys(map).filter(function (id) { return map[id]; });
  }

  function isPublicStatus(status) {
    var s = String(status || '').trim().toLowerCase();
    return !s || s === 'approved' || s === 'public';
  }

  function hkNow() {
    try {
      var s = new Date().toLocaleString('sv-SE', {
        timeZone: 'Asia/Hong_Kong',
        hour12: false,
      });
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.replace('T', ' ').slice(0, 19);
    } catch (err) {
      /* 用下面嘅後備格式 */
    }
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  function canonicalUrl(raw) {
    var trimmed = String(raw || '').trim();
    if (USE_MOCK && /^samples\/demo\.html\?id=[a-z0-9-]+$/.test(trimmed)) return trimmed;
    return normalizeUrl(raw);
  }

  function passwordMatches(value) {
    var given = String(value || '').replace(/^\s+|\s+$/g, '');
    if (!given || given.length !== MANAGE_PASSWORD.length) return false;
    var mismatch = 0;
    for (var i = 0; i < given.length; i++) {
      if (given.charCodeAt(i) !== MANAGE_PASSWORD.charCodeAt(i)) mismatch++;
    }
    return mismatch === 0;
  }

  function readSuppliedPassword(body) {
    if (body && body.managePassword != null && String(body.managePassword) !== '') {
      return String(body.managePassword).replace(/^\s+|\s+$/g, '');
    }
    if (body && body.manageToken != null) return String(body.manageToken).replace(/^\s+|\s+$/g, '');
    return '';
  }

  var sessionPasswordMemory = '';

  function getSessionPassword() {
    if (sessionPasswordMemory) return sessionPasswordMemory;
    try {
      return sessionStorage.getItem(SESSION_KEY) || '';
    } catch (err) {
      return '';
    }
  }

  function setSessionPassword(value) {
    sessionPasswordMemory = value;
    try {
      sessionStorage.setItem(SESSION_KEY, value);
    } catch (err) {
      /* 私密模式可能擋 sessionStorage；呢個分頁仍然記住 */
    }
  }

  function clearSessionPassword() {
    sessionPasswordMemory = '';
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* 忽略 */
    }
  }

  function isUnlocked() {
    return passwordMatches(getSessionPassword());
  }

  function createId() {
    var cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      var bytes = new Uint8Array(16);
      cryptoObj.getRandomValues(bytes);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) hex += ('0' + bytes[i].toString(16)).slice(-2);
      return hex;
    }
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  function validateSubmission(body) {
    var title = cleanText(body.title, 80);
    var note = cleanText(body.note, 300);
    var submitter = cleanText(body.submitter, 40);
    var url = canonicalUrl(body.url);
    if (!url) {
      return { ok: false, error: 'invalid_url', message: '請貼上有效嘅網址（http 或 https）。' };
    }
    if (!title) {
      return { ok: false, error: 'invalid_title', message: '請填標題，等同事搵到。' };
    }
    var grades = parseIdList(body.grades, GRADE_IDS);
    if (grades.error || !grades.ids.length) {
      return {
        ok: false,
        error: 'invalid_grade',
        message: grades.error ? '年級要係小一至小六。' : '請揀至少一個年級。',
      };
    }
    var topics = parseIdList(body.topics, TOPIC_IDS);
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

  function cloneDemo() {
    return DEMO_SITES.map(function (item) {
      return {
        id: item.id,
        timestamp: item.timestamp,
        title: item.title,
        url: item.url,
        grades: item.grades.slice(),
        topics: item.topics.slice(),
        note: item.note,
        submitter: item.submitter,
        status: item.status,
      };
    });
  }

  function mockLoad() {
    try {
      var raw = localStorage.getItem(MOCK_KEY);
      if (!raw) {
        var seeded = cloneDemo();
        localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
        return seeded;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.length) return cloneDemo();
      return ensureMockIds(parsed);
    } catch (err) {
      return cloneDemo();
    }
  }

  function mockSave(rows) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  }

  function ensureMockIds(rows) {
    var changed = false;
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].id) {
        rows[i].id = createId();
        changed = true;
      }
    }
    if (changed) mockSave(rows);
    return rows;
  }

  function urlsMatch(stored, target) {
    return canonicalUrl(stored) === target;
  }

  function mockList() {
    return {
      ok: true,
      items: mockLoad().filter(function (item) { return isPublicStatus(item.status); }),
    };
  }

  function mockSubmit(body) {
    var checked = validateSubmission(body);
    if (!checked.ok) return checked;
    var rows = mockLoad();
    var url = checked.item.url;
    for (var i = 0; i < rows.length; i++) {
      if (urlsMatch(rows[i].url, url)) {
        return {
          ok: false,
          error: 'duplicate',
          message: '呢個網址已經係清單入面。如果見唔到，可能被隱藏咗。',
        };
      }
    }
    var item = checked.item;
    item.id = createId();
    item.timestamp = hkNow();
    item.status = 'approved';
    rows.push(item);
    mockSave(rows);
    return {
      ok: true,
      item: item,
      message: '收到！個網站已經出現喺上面嘅清單。',
    };
  }

  function mockFindIndex(rows, id) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) return i;
    }
    return -1;
  }

  function mockUpdate(body) {
    if (!passwordMatches(readSuppliedPassword(body))) {
      return { ok: false, error: 'bad_password', message: '管理密碼不正確。' };
    }
    var id = String((body && body.id) || '').trim();
    if (!id) return { ok: false, error: 'missing_id', message: '搵唔到要修改嘅分享。' };
    var checked = validateSubmission(body);
    if (!checked.ok) return checked;
    var rows = mockLoad();
    var index = mockFindIndex(rows, id);
    if (index === -1) {
      return { ok: false, error: 'not_found', message: '搵唔到呢個分享，可能已經移除。請重新整理。' };
    }
    var url = checked.item.url;
    for (var j = 0; j < rows.length; j++) {
      if (j === index) continue;
      if (urlsMatch(rows[j].url, url)) {
        return {
          ok: false,
          error: 'duplicate',
          message: '呢個網址已經係清單入面。如果見唔到，可能被隱藏咗。',
        };
      }
    }
    var prev = rows[index];
    var item = checked.item;
    item.id = id;
    item.timestamp = prev.timestamp;
    item.status = prev.status || 'approved';
    rows[index] = item;
    mockSave(rows);
    return { ok: true, item: item, message: '已更新。同事會見到新內容。' };
  }

  function mockRemove(body) {
    if (!passwordMatches(readSuppliedPassword(body))) {
      return { ok: false, error: 'bad_password', message: '管理密碼不正確。' };
    }
    var id = String((body && body.id) || '').trim();
    if (!id) return { ok: false, error: 'missing_id', message: '搵唔到要移除嘅分享。' };
    var rows = mockLoad();
    var index = mockFindIndex(rows, id);
    if (index === -1) {
      return { ok: false, error: 'not_found', message: '搵唔到呢個分享，可能已經移除。請重新整理。' };
    }
    rows[index].status = 'hidden';
    mockSave(rows);
    return { ok: true, id: id, message: '已移除。同事唔會再見到呢個網站。' };
  }

  function apiCall(payload) {
    if (USE_MOCK) {
      if (payload.action === 'list') return Promise.resolve(mockList());
      if (payload.action === 'submit') return Promise.resolve(mockSubmit(payload));
      if (payload.action === 'update') return Promise.resolve(mockUpdate(payload));
      if (payload.action === 'remove') return Promise.resolve(mockRemove(payload));
      return Promise.resolve({ ok: false, error: 'unknown_action', message: '未知操作。' });
    }

    return fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    }).then(function (res) {
      return res.text().then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error('伺服器回應唔係 JSON。請檢查 Apps Script 網址。');
        }
        if (!res.ok && (!data || data.ok !== false)) {
          throw new Error('伺服器回應錯誤：' + res.status);
        }
        return data;
      });
    });
  }

  function safeHref(url) {
    var s = String(url || '').trim();
    if (/^samples\/demo\.html\?id=[a-z0-9-]+$/.test(s)) return s;
    if (!/^https?:\/\//i.test(s)) return '';
    try {
      var u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      return u.href;
    } catch (err) {
      return '';
    }
  }

  function hostLabel(url) {
    if (String(url).indexOf('samples/demo.html') === 0) return '示範頁';
    try {
      return new URL(url).host;
    } catch (err) {
      return '';
    }
  }

  function toggleMap(map, id) {
    if (map[id]) delete map[id];
    else map[id] = true;
  }

  function syncChip(btn, on) {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function renderGradeChips(container, selected, onChange) {
    container.innerHTML = '';
    GRADES.forEach(function (grade) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip chip-grade' + (selected[grade.id] ? ' is-on' : '');
      btn.setAttribute('aria-pressed', selected[grade.id] ? 'true' : 'false');
      btn.textContent = grade.label;
      btn.addEventListener('click', function () {
        toggleMap(selected, grade.id);
        syncChip(btn, !!selected[grade.id]);
        onChange();
      });
      container.appendChild(btn);
    });
  }

  function topicHint(topic) {
    var names = (topic.grades || []).map(gradeLabel);
    return names.length ? '課程指引年級：' + names.join('、') : '';
  }

  function renderTopicGroups(container, selected, onChange) {
    container.innerHTML = '';
    STRANDS.forEach(function (strand) {
      var details = document.createElement('details');
      details.className = 'strand';
      var summary = document.createElement('summary');
      summary.textContent = strand.label;
      details.appendChild(summary);
      var strandHasSelection = false;
      strand.themes.forEach(function (theme) {
        var wrap = document.createElement('div');
        wrap.className = 'chip-group';
        var label = document.createElement('p');
        label.className = 'chip-group-label';
        label.textContent = theme.label;
        wrap.appendChild(label);
        var row = document.createElement('div');
        row.className = 'chip-row';
        theme.topics.forEach(function (topic) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chip' + (selected[topic.id] ? ' is-on' : '');
          btn.setAttribute('aria-pressed', selected[topic.id] ? 'true' : 'false');
          btn.textContent = topic.label;
          var hint = topicHint(topic);
          if (hint) btn.title = hint;
          if (selected[topic.id]) strandHasSelection = true;
          btn.addEventListener('click', function () {
            toggleMap(selected, topic.id);
            syncChip(btn, !!selected[topic.id]);
            onChange();
          });
          row.appendChild(btn);
        });
        wrap.appendChild(row);
        details.appendChild(wrap);
      });
      if (strandHasSelection) details.open = true;
      container.appendChild(details);
    });
  }

  function renderFilterChips() {
    renderGradeChips(el.filterGrades, state.filterGrades, function () {
      syncUrl();
      renderCards();
    });
    renderTopicGroups(el.filterTopics, state.filterTopics, function () {
      syncUrl();
      renderCards();
    });
  }

  function renderFormChips() {
    renderGradeChips(el.formGrades, state.formGrades, function () {});
    renderTopicGroups(el.formTopics, state.formTopics, function () {});
  }

  function itemMatches(item) {
    var gradeIds = selectedIds(state.filterGrades);
    if (gradeIds.length) {
      var gradeHit = item.grades.some(function (id) { return gradeIds.indexOf(id) !== -1; });
      if (!gradeHit) return false;
    }
    var topicIds = selectedIds(state.filterTopics);
    if (topicIds.length) {
      var topicHit = item.topics.some(function (id) { return topicIds.indexOf(id) !== -1; });
      if (!topicHit) return false;
    }
    var q = state.keyword.trim().toLowerCase();
    if (!q) return true;
    var hay = [
      item.title,
      item.note,
      item.submitter,
      item.url,
      (item.grades || []).map(gradeLabel).join(' '),
      (item.topics || []).map(topicLabel).join(' '),
    ].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function sortedItems(items) {
    return items.slice().sort(function (a, b) {
      var ta = String(a.timestamp || '');
      var tb = String(b.timestamp || '');
      if (ta === tb) return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant');
      return ta < tb ? 1 : -1;
    });
  }

  function addPills(parent, className, labels) {
    var row = document.createElement('div');
    row.className = className;
    labels.forEach(function (label) {
      var pill = document.createElement('span');
      pill.className = 'pill ' + (className === 'grade-row' ? 'pill-grade' : 'pill-topic');
      pill.textContent = label;
      row.appendChild(pill);
    });
    if (labels.length) parent.appendChild(row);
  }

  function renderCards() {
    var all = sortedItems(state.items.filter(isPublicItem));
    var shown = all.filter(itemMatches);
    if (!state.items.length && el.resultMeta.textContent.indexOf('讀唔到') !== -1) return;

    if (!all.length) {
      el.resultMeta.textContent = '暫時未有網站。';
    } else if (shown.length === all.length) {
      el.resultMeta.textContent = '共 ' + all.length + ' 個網站';
    } else {
      el.resultMeta.textContent = '顯示 ' + shown.length + ' 個，共 ' + all.length + ' 個網站';
    }

    el.cardList.innerHTML = '';
    if (!shown.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = all.length
        ? '冇符合呢啲條件嘅網站。試下清除篩選，或者提交一個。'
        : '做第一個分享嘅人？撳下面「提交網站」。';
      el.cardList.appendChild(empty);
      return;
    }

    shown.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'site-card';
      if (item.id) card.setAttribute('data-id', item.id);
      if ((state.highlightId && item.id === state.highlightId) ||
          (!state.highlightId && state.highlightUrl && item.url === state.highlightUrl)) {
        card.classList.add('is-new');
      }

      var top = document.createElement('div');
      top.className = 'grade-row';
      (item.grades || []).forEach(function (id) {
        var pill = document.createElement('span');
        pill.className = 'pill pill-grade';
        pill.textContent = gradeLabel(id);
        top.appendChild(pill);
      });
      if (String(item.url).indexOf('samples/demo.html') === 0) {
        var demo = document.createElement('span');
        demo.className = 'pill pill-demo';
        demo.textContent = '示範';
        top.appendChild(demo);
      }
      card.appendChild(top);

      var href = safeHref(item.url);
      var titleNode;
      if (href) {
        titleNode = document.createElement('a');
        titleNode.className = 'card-title';
        titleNode.href = href;
        titleNode.target = '_blank';
        titleNode.rel = 'noopener noreferrer';
      } else {
        titleNode = document.createElement('p');
        titleNode.className = 'card-title';
      }
      titleNode.textContent = item.title || '（未有標題）';
      card.appendChild(titleNode);

      var host = document.createElement('p');
      host.className = 'host';
      host.textContent = hostLabel(item.url) || '連結未能開啟';
      card.appendChild(host);

      if (item.note) {
        var note = document.createElement('p');
        note.className = 'note';
        note.textContent = item.note;
        card.appendChild(note);
      }

      addPills(card, 'topic-row', (item.topics || []).map(topicLabel));

      var metaBits = [];
      if (item.submitter) metaBits.push(item.submitter);
      if (item.timestamp) metaBits.push(String(item.timestamp).slice(0, 10));
      if (metaBits.length) {
        var meta = document.createElement('p');
        meta.className = 'meta-line';
        meta.textContent = metaBits.join(' · ');
        card.appendChild(meta);
      }

      var actions = document.createElement('div');
      actions.className = 'card-actions';
      if (href) {
        var open = document.createElement('a');
        open.className = 'btn open-link';
        open.href = href;
        open.target = '_blank';
        open.rel = 'noopener noreferrer';
        open.textContent = '開啟網站';
        actions.appendChild(open);
      }
      if (item.id) {
        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-quiet';
        editBtn.textContent = '修改';
        editBtn.setAttribute('aria-label', '修改「' + (item.title || '網站') + '」');
        editBtn.addEventListener('click', function () { requestManage('edit', item.id); });
        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-quiet-danger';
        removeBtn.textContent = '移除';
        removeBtn.setAttribute('aria-label', '移除「' + (item.title || '網站') + '」');
        removeBtn.addEventListener('click', function () { requestManage('remove', item.id); });
        actions.appendChild(editBtn);
        actions.appendChild(removeBtn);
      }
      if (actions.childNodes.length) card.appendChild(actions);
      if (href) appendQrBlock(card, item.title || '教學網站', absoluteUrl(href));

      el.cardList.appendChild(card);
    });
  }

  function isPublicItem(item) {
    return item && item.title && item.url && isPublicStatus(item.status);
  }

  function showFeedback(kind, title, message) {
    el.feedback.className = 'feedback visible ' + kind;
    el.feedbackTitle.textContent = title;
    el.feedbackMsg.textContent = message;
    if (el.feedbackQr) {
      el.feedbackQr.hidden = true;
      el.feedbackQr.innerHTML = '';
    }
  }

  function clearFeedback() {
    el.feedback.className = 'feedback';
    el.feedbackTitle.textContent = '';
    el.feedbackMsg.textContent = '';
    if (el.feedbackQr) {
      el.feedbackQr.hidden = true;
      el.feedbackQr.innerHTML = '';
    }
  }

  function absoluteUrl(href) {
    try {
      return new URL(href, window.location.href).href;
    } catch (err) {
      return '';
    }
  }

  function makeQrCanvas(text, cellSize) {
    if (typeof qrcode !== 'function') return null;
    if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    }
    var qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var count = qr.getModuleCount();
    var margin = 4;
    var size = (count + margin * 2) * cellSize;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1a2c33';
    for (var row = 0; row < count; row++) {
      for (var col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect((col + margin) * cellSize, (row + margin) * cellSize, cellSize, cellSize);
        }
      }
    }
    canvas.className = 'qr-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '網站 QR code');
    return canvas;
  }

  function fileSafe(name) {
    var s = String(name || 'website').replace(/[\\/:*?"<>|\s]+/g, '-').replace(/-+/g, '-');
    s = s.replace(/^-|-$/g, '');
    if (s.length > 40) s = s.slice(0, 40);
    return s || 'website';
  }

  function downloadQr(title, url) {
    var canvas = makeQrCanvas(url, 8);
    if (!canvas || !canvas.toBlob) return;
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      var objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = fileSafe(title) + '-qr.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1500);
    });
  }

  function printQr(title, url) {
    if (!el.printSheet) return;
    el.printTitle.textContent = title;
    el.printUrl.textContent = url;
    el.printQr.innerHTML = '';
    var canvas = makeQrCanvas(url, 10);
    if (canvas) el.printQr.appendChild(canvas);
    window.print();
  }

  function appendQrBlock(parent, title, url) {
    if (!url) return;
    var block = document.createElement('div');
    block.className = 'qr-block';
    var frame = document.createElement('div');
    frame.className = 'qr-frame';
    var canvas = makeQrCanvas(url, 4);
    if (!canvas) {
      var fail = document.createElement('p');
      fail.className = 'meta-line';
      fail.textContent = 'QR 暫時產生唔到。';
      block.appendChild(fail);
      parent.appendChild(block);
      return;
    }
    frame.appendChild(canvas);
    var cap = document.createElement('p');
    cap.className = 'qr-caption';
    cap.textContent = '掃碼開啟';
    frame.appendChild(cap);
    block.appendChild(frame);

    var actions = document.createElement('div');
    actions.className = 'qr-actions';
    var downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'btn btn-secondary';
    downloadBtn.textContent = '下載 QR';
    downloadBtn.addEventListener('click', function () { downloadQr(title, url); });
    var printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'btn btn-secondary';
    printBtn.textContent = '列印 QR';
    printBtn.addEventListener('click', function () { printQr(title, url); });
    actions.appendChild(downloadBtn);
    actions.appendChild(printBtn);
    block.appendChild(actions);
    parent.appendChild(block);
  }

  function syncUrl() {
    var params = new URLSearchParams();
    var grades = selectedIds(state.filterGrades);
    var topics = selectedIds(state.filterTopics);
    if (grades.length) params.set('grade', grades.join(','));
    if (topics.length) params.set('topic', topics.join(','));
    if (state.keyword.trim()) params.set('q', state.keyword.trim());
    var qs = params.toString();
    var next = location.pathname + (qs ? '?' + qs : '') + location.hash;
    if (next !== location.pathname + location.search + location.hash) {
      history.replaceState(null, '', next);
    }
  }

  function readFiltersFromUrl() {
    var params = new URLSearchParams(location.search);
    String(params.get('grade') || '').split(',').forEach(function (id) {
      if (GRADE_IDS.indexOf(id) !== -1) state.filterGrades[id] = true;
    });
    String(params.get('topic') || '').split(',').forEach(function (id) {
      if (TOPIC_IDS.indexOf(id) !== -1) state.filterTopics[id] = true;
    });
    state.keyword = params.get('q') || '';
    el.keyword.value = state.keyword;
  }

  function loadList() {
    el.resultMeta.textContent = '載入緊…';
    return apiCall({ action: 'list' }).then(function (data) {
      if (!data || data.ok === false) {
        throw new Error((data && data.message) || '讀唔到清單。');
      }
      state.items = data.items || [];
      renderCards();
      updateRedeployNote();
    }).catch(function (err) {
      state.items = [];
      el.cardList.innerHTML = '';
      el.resultMeta.textContent = '而家讀唔到清單。' + (err && err.message ? err.message : '請稍後再試。');
    });
  }

  function updateRedeployNote() {
    if (!el.redeployNote) return;
    var items = state.items.filter(isPublicItem);
    var needs = items.length > 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id) needs = false;
    }
    el.redeployNote.hidden = !needs;
  }

  function findItem(id) {
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) return state.items[i];
    }
    return null;
  }

  function showListFeedback(kind, message) {
    if (!el.listFeedback) return;
    el.listFeedback.className = 'feedback visible ' + kind;
    el.listFeedback.textContent = message;
  }

  function revealListFeedback() {
    if (el.listFeedback && el.listFeedback.className.indexOf('visible') !== -1 && el.listFeedback.scrollIntoView) {
      el.listFeedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearListFeedback() {
    if (!el.listFeedback) return;
    el.listFeedback.className = 'feedback';
    el.listFeedback.textContent = '';
  }

  function showUnlockError(message) {
    el.unlockError.hidden = !message;
    el.unlockError.textContent = message || '';
  }

  function refreshLockUI() {
    var on = isUnlocked();
    el.unlockForm.hidden = on;
    el.unlockStatus.hidden = !on;
    el.lockBtn.hidden = !on;
    if (on) {
      el.manageHint.hidden = true;
      showUnlockError('');
    }
  }

  var pendingManage = null;

  function requestManage(type, id) {
    if (!isUnlocked()) {
      pendingManage = { type: type, id: id };
      var item = findItem(id);
      var name = item && item.title ? '「' + item.title + '」' : '呢個網站';
      el.manageHint.hidden = false;
      el.manageHint.textContent = type === 'remove'
        ? '輸入管理密碼後，就會確認移除' + name + '。'
        : '輸入管理密碼後，就會開啟' + name + '嘅修改。';
      location.hash = 'manage';
      el.unlockPassword.focus();
      return;
    }
    if (type === 'edit') beginEdit(id);
    else openRemoveConfirm(id);
  }

  function runPendingManage() {
    var pending = pendingManage;
    pendingManage = null;
    if (!pending || !isUnlocked()) return;
    if (pending.type === 'edit') beginEdit(pending.id);
    else openRemoveConfirm(pending.id);
  }

  function setFormSelection(item) {
    state.formGrades = {};
    state.formTopics = {};
    (item.grades || []).forEach(function (id) {
      if (GRADE_IDS.indexOf(id) !== -1) state.formGrades[id] = true;
    });
    (item.topics || []).forEach(function (id) {
      if (TOPIC_IDS.indexOf(id) !== -1) state.formTopics[id] = true;
    });
    renderFormChips();
  }

  function exitEditMode() {
    state.editingId = '';
    if (el.submitTitleText) el.submitTitleText.textContent = '分享我嘅網站';
    if (el.submitLead) el.submitLead.textContent = '貼上你整好嘅教學網站，揀年級同課題。同事就可以喺上面搵到。';
    el.cancelEditBtn.hidden = true;
  }

  function beginEdit(id) {
    var item = findItem(id);
    if (!item) {
      showListFeedback('error', '搵唔到呢個分享，請重新整理。');
      return;
    }
    state.editingId = id;
    el.urlInput.value = item.url || '';
    el.titleInput.value = item.title || '';
    el.noteInput.value = item.note || '';
    el.submitterInput.value = item.submitter || '';
    setFormSelection(item);
    el.urlInput.removeAttribute('aria-invalid');
    el.titleInput.removeAttribute('aria-invalid');
    if (el.submitTitleText) el.submitTitleText.textContent = '修改網站';
    if (el.submitLead) el.submitLead.textContent = '改好資料之後儲存。唔想改就撳取消。';
    el.submitBtn.textContent = '儲存修改';
    el.cancelEditBtn.hidden = false;
    clearFeedback();
    location.hash = 'submit';
    if (el.form.scrollIntoView) el.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.titleInput.focus();
  }

  function closeConfirm() {
    state.pendingRemoveId = '';
    el.confirmModal.hidden = true;
  }

  function openRemoveConfirm(id) {
    var item = findItem(id);
    if (!item) {
      showListFeedback('error', '搵唔到呢個分享，請重新整理。');
      return;
    }
    state.pendingRemoveId = id;
    var title = item.title || '呢個網站';
    el.confirmMsg.textContent = '確定要移除「' + title + '」？移除後同事會睇唔到，紀錄會留喺試算表（狀態 hidden）。';
    el.confirmModal.hidden = false;
    el.confirmOk.focus();
  }

  function noteBadPassword(data) {
    if (data && data.error === 'bad_password') {
      clearSessionPassword();
      pendingManage = null;
      refreshLockUI();
    }
  }

  function resetForm() {
    el.form.reset();
    state.formGrades = {};
    state.formTopics = {};
    renderFormChips();
    el.urlInput.removeAttribute('aria-invalid');
    el.titleInput.removeAttribute('aria-invalid');
  }

  function onSubmit(event) {
    event.preventDefault();
    if (state.submitting) return;
    clearFeedback();
    el.urlInput.removeAttribute('aria-invalid');
    el.titleInput.removeAttribute('aria-invalid');

    var editing = !!state.editingId;
    if (editing && !isUnlocked()) {
      pendingManage = null;
      showFeedback('error', '未儲存到', '請先喺「管理分享」輸入管理密碼。');
      location.hash = 'manage';
      el.unlockPassword.focus();
      return;
    }

    var payload = {
      action: editing ? 'update' : 'submit',
      url: el.urlInput.value,
      title: el.titleInput.value,
      note: el.noteInput.value,
      submitter: el.submitterInput.value,
      grades: selectedIds(state.formGrades),
      topics: selectedIds(state.formTopics),
    };
    if (editing) {
      payload.id = state.editingId;
      payload.managePassword = getSessionPassword();
    }

    var checked = validateSubmission(payload);
    if (!checked.ok) {
      showFeedback('error', editing ? '未儲存到' : '未提交到', checked.message);
      if (checked.error === 'invalid_url') el.urlInput.setAttribute('aria-invalid', 'true');
      if (checked.error === 'invalid_title') el.titleInput.setAttribute('aria-invalid', 'true');
      if (checked.error === 'invalid_url') el.urlInput.focus();
      else if (checked.error === 'invalid_title') el.titleInput.focus();
      return;
    }

    state.submitting = true;
    el.submitBtn.disabled = true;
    el.submitBtn.textContent = editing ? '儲存緊…' : '提交緊…';

    apiCall(payload).then(function (data) {
      if (!data || data.ok === false) {
        noteBadPassword(data);
        showFeedback('error', editing ? '未儲存到' : '未提交到', (data && data.message) || '請稍後再試。');
        return;
      }
      var saved = data.item || checked.item;
      state.highlightId = (data.item && data.item.id) || (editing ? payload.id : '');
      state.highlightUrl = saved.url || checked.item.url;
      if (editing) {
        showFeedback('success', '已更新', data.message || '同事會見到新內容。');
        showListFeedback('success', data.message || '已更新。');
        exitEditMode();
      } else {
        showFeedback('success', '已收到', data.message || '同事而家可以搵到呢個網站。');
        clearListFeedback();
        if (el.feedbackQr) {
          el.feedbackQr.hidden = false;
          appendQrBlock(el.feedbackQr, saved.title || checked.item.title, absoluteUrl(state.highlightUrl));
        }
      }
      resetForm();
      return loadList().then(function () {
        var card = el.cardList.querySelector('.is-new');
        if (card && card.scrollIntoView) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          location.hash = 'browse';
        }
      });
    }).catch(function (err) {
      showFeedback('error', editing ? '未儲存到' : '未提交到', err && err.message ? err.message : '網絡有問題，請稍後再試。');
    }).then(function () {
      state.submitting = false;
      el.submitBtn.disabled = false;
      el.submitBtn.textContent = state.editingId ? '儲存修改' : '提交分享';
    });
  }

  function performRemove(id) {
    return apiCall({
      action: 'remove',
      id: id,
      managePassword: getSessionPassword(),
    }).then(function (data) {
      if (!data || data.ok === false) {
        noteBadPassword(data);
        showListFeedback('error', (data && data.message) || '移除唔到，請稍後再試。');
        return;
      }
      if (state.editingId === id) {
        exitEditMode();
        resetForm();
        clearFeedback();
      }
      if (state.highlightId === id) state.highlightId = '';
      showListFeedback('success', data.message || '已移除。同事唔會再見到呢個網站。');
      return loadList().then(revealListFeedback);
    }).catch(function (err) {
      showListFeedback('error', err && err.message ? err.message : '網絡有問題，請稍後再試。');
    });
  }

  function setupBanner() {
    if (!USE_MOCK) {
      el.mockBanner.hidden = true;
      return;
    }
    el.mockBanner.hidden = false;
    if (cfg.USE_MOCK === false && urlMissing) {
      el.mockBannerText.textContent = '未貼上 Apps Script 網址，所以暫時用示範模式。資料只存在呢部電腦。';
    } else {
      el.mockBannerText.textContent = '而家係示範模式：清單同你提交嘅網站只存在呢部電腦。正式共用請按 README 接上 Google 試算表，再將 USE_MOCK 設為 false。';
    }
  }

  el.keyword.addEventListener('input', function () {
    state.keyword = el.keyword.value;
    syncUrl();
    renderCards();
  });

  el.clearFiltersBtn.addEventListener('click', function () {
    state.filterGrades = {};
    state.filterTopics = {};
    state.keyword = '';
    el.keyword.value = '';
    renderFilterChips();
    syncUrl();
    renderCards();
  });

  el.refreshBtn.addEventListener('click', function () {
    el.refreshBtn.disabled = true;
    loadList().then(function () {
      el.refreshBtn.disabled = false;
    });
  });

  el.form.addEventListener('submit', onSubmit);

  el.cancelEditBtn.addEventListener('click', function () {
    exitEditMode();
    resetForm();
    clearFeedback();
    el.submitBtn.textContent = '提交分享';
  });

  el.unlockForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = String(el.unlockPassword.value || '').replace(/^\s+|\s+$/g, '');
    if (!passwordMatches(value)) {
      showUnlockError('管理密碼不正確。');
      el.unlockPassword.focus();
      return;
    }
    setSessionPassword(value);
    el.unlockPassword.value = '';
    showUnlockError('');
    refreshLockUI();
    runPendingManage();
  });

  el.lockBtn.addEventListener('click', function () {
    clearSessionPassword();
    pendingManage = null;
    refreshLockUI();
  });

  el.confirmCancel.addEventListener('click', closeConfirm);

  el.confirmOk.addEventListener('click', function () {
    var id = state.pendingRemoveId;
    closeConfirm();
    if (id) performRemove(id);
  });

  el.confirmModal.addEventListener('click', function (event) {
    if (event.target === el.confirmModal) closeConfirm();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && el.confirmModal && !el.confirmModal.hidden) closeConfirm();
  });

  el.resetMockBtn.addEventListener('click', function () {
    if (!USE_MOCK) return;
    if (!window.confirm('重設之後，呢部電腦嘅示範清單會還原，你喺示範模式提交過嘅網站會唔見。確定？')) return;
    localStorage.removeItem(MOCK_KEY);
    state.highlightUrl = '';
    state.highlightId = '';
    if (state.editingId) {
      exitEditMode();
      resetForm();
    }
    clearListFeedback();
    loadList();
  });

  if (getSessionPassword() && !isUnlocked()) clearSessionPassword();
  refreshLockUI();
  readFiltersFromUrl();
  renderFilterChips();
  renderFormChips();
  setupBanner();
  loadList();
})();
