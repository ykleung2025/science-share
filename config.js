/**
 * 科學網站分享 — 設定檔
 *
 * 【如何設定 Google Apps Script】
 * 1. 依照 README.md 建立 Google 試算表，並貼上 apps-script/Code.gs
 * 2. 部署為「網頁應用程式」（執行身分：我；存取權：任何人）
 * 3. 複製部署後以 /exec 結尾的網址，貼到下方 APPS_SCRIPT_URL
 * 4. 將 USE_MOCK 設為 false
 *
 * 【本機預覽／未接上試算表】
 * USE_MOCK 為 true，或 APPS_SCRIPT_URL 仍是預設佔位字串時，
 * 資料只存在這部瀏覽器的 localStorage，可離線試提交同篩選。
 */
window.SCIENCE_SHARE_CONFIG = {
  // 部署後的網頁應用程式網址（請替換）
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',

  // true = 本機示範；false = 呼叫 APPS_SCRIPT_URL
  USE_MOCK: true,
};
