# 科學網站分享

LWCPS 老師用嚟分享同搵自製**小學科學**教學網站。介面係繁體中文。

標籤跟教育局《科學教育學習領域・科學（小一至小六）課程指引》（2025）：

- **4 個學習範疇**
- **15 個主題**
- **39 個課題**（第 3.2.1 節寫明課程涵蓋四個範疇、15 個主題、39 個課題）

年級係指引嘅**小一至小六**。老師可以同時揀多過一個年級、多過一個課題。

- 前端：純 HTML / CSS / JS（無廣告、無追蹤）
- 後端：Google 試算表 + Google Apps Script 網頁應用程式
- 每張卡片同提交成功之後，瀏覽器會產生該網址嘅 QR code（可下載 PNG、可列印）
- 作者帳號：GitHub `ykleung2025`
- 打算發佈：<https://ykleung2025.github.io/science-share/>

課程重點「科學探究」同「工程設計與創新」貫穿各範疇，指引冇把它哋另列做課題。對應可選課題係「科學探究的過程」同「工程、設計循環和應用」。

---

## 課題對照（課程指引原文）

`grades` 係第 2.5.2 節「各級學習重點一覽」出現該課題的年級，只作用提示。提交時年級同課題可以自由多選，系統唔會限制「呢級先可以揀呢個課題」。

試算表入面 `grades`、`topics` 存 id（逗號分隔），唔存中文，方便篩選。

### 範疇一　生命與環境（Life and Environment）

| 主題 | id | 課題 | 指引年級 |
|------|----|------|----------|
| 人體健康 LA | `healthy-living` | 健康的生活方式 | 小一、小三、小六 |
| 人體健康 LA | `disease` | 傳染病與非傳染病 | 小四 |
| 生物的特性 LB | `living-nonliving` | 生物和非生物的分別 | 小一、小二 |
| 生物的特性 LB | `biodiversity` | 生物的多樣性及分類 | 小三 |
| 生物的特性 LB | `body-structure` | 生物的構造 | 小二、小三 |
| 生物的特性 LB | `body-systems` | 人體系統 | 小五、小六 |
| 生命的延續 LC | `life-cycle` | 生物的生命周期 | 小一、小三、小五 |
| 生命的延續 LC | `heredity` | 遺傳與繁殖 | 小三、小四 |
| 生物與自然環境的相互關係 LD | `adaptation` | 生物形態和功能及其對環境的適應力 | 小四 |
| 生物與自然環境的相互關係 LD | `human-environment` | 人類行為對自然環境的影響 | 小二、小五、小六 |
| 生態系統 LE | `ecosystem` | 生態環境 | 小二、小四 |
| 生態系統 LE | `food-chain` | 食物鏈 | 小二、小四、小六 |
| 顯微鏡下的世界 LF | `microbes` | 常見的微生物 | 小五 |
| 顯微鏡下的世界 LF | `cells` | 細胞與顯微鏡 | 小六 |

### 範疇二　物質、能量和變化（Matter, Energy and Changes）

| 主題 | id | 課題 | 指引年級 |
|------|----|------|----------|
| 物質的特性和變化 MA | `states-of-matter` | 物質的不同狀態 | 小三 |
| 物質的特性和變化 MA | `material-properties` | 物質的特性 | 小一至小六 |
| 物質的特性和變化 MA | `physical-chemical` | 物理變化與化學變化 | 小三、小四、小五、小六 |
| 能量的不同形式和傳遞 MB | `energy-sources` | 能量的來源和使用 | 小三、小四、小五 |
| 能量的不同形式和傳遞 MB | `light` | 光的特性與相關現象 | 小一、小四、小六 |
| 能量的不同形式和傳遞 MB | `sound` | 聲音的特性與相關現象 | 小二、小五 |
| 能量的不同形式和傳遞 MB | `electricity` | 電的特性與相關現象 | 小四、小五、小六 |
| 能量的不同形式和傳遞 MB | `heat` | 熱傳遞 | 小三 |
| 力和運動 MC | `force-motion` | 力和與運動相關的現象 | 小一、小二、小四、小五 |
| 力和運動 MC | `simple-machines` | 簡單機械 | 小三、小六 |

### 範疇三　地球與太空（Earth and Space）

| 主題 | id | 課題 | 指引年級 |
|------|----|------|----------|
| 地球的特徵和資源 EA | `earth-features` | 地球的特徵 | 小一、小四 |
| 地球的特徵和資源 EA | `earth-resources` | 地球的資源 | 小三 |
| 地球的特徵和資源 EA | `earth-history` | 地球的歷史 | 小五、小六 |
| 氣候與季節 EB | `daily-weather` | 日常的天氣現象 | 小二、小三、小五 |
| 氣候與季節 EB | `climate-seasons` | 氣候與季節的轉變 | 小四 |
| 氣候與季節 EB | `regional-climate` | 不同地區的氣候特徵 | 小四、小五 |
| 宇宙中的太陽系 EC | `solar-system` | 太陽和八大行星 | 小三、小五 |
| 宇宙中的太陽系 EC | `sun-earth-moon` | 在地球上可觀察到的一些由太陽、地球和月球運動所引起的現象和規律 | 小一、小二、小三、小四、小六 |

### 範疇四　科學、科技、工程與社會（Science, Technology, Engineering and Society）

| 主題 | id | 課題 | 指引年級 |
|------|----|------|----------|
| 科學過程和科學精神 SA | `inquiry-process` | 科學探究的過程 | 小二、小三、小四 |
| 科學過程和科學精神 SA | `science-value` | 科學與科技創造價值和改變人類生活 | 小三、小五、小六 |
| 科學過程和科學精神 SA | `scientists` | 著名科學家的研究和貢獻 | 小二、小五 |
| 航天與創新科技 SB | `daily-tech` | 日常生活中的科技 | 小一、小三 |
| 航天與創新科技 SB | `innovation` | 創新科技發展 | 小三、小五 |
| 航天與創新科技 SB | `space-tech` | 國家和世界的航天科技發展 | 小四、小六 |
| 工程與設計 SC | `engineering-design` | 工程、設計循環和應用 | 小一至小六 |

年級 id：`P1` 小一、`P2` 小二、`P3` 小三、`P4` 小四、`P5` 小五、`P6` 小六。

---

## 檔案

| 檔案 | 說明 |
|------|------|
| `index.html` | 搵網站同提交網站 |
| `styles.css` | 手機友善樣式 |
| `app.js` | 篩選、提交、示範模式、QR |
| `config.js` | `APPS_SCRIPT_URL` 同 `USE_MOCK` |
| `apps-script/Code.gs` | 試算表網頁應用程式 |
| `vendor/qrcode-generator.js` | Kazuhiko Arase 嘅 QR Code Generator（MIT） |
| `vendor/qrcode-utf8.js` | 同上，將字串按 UTF-8 編碼 |
| `samples/demo.html` | 示範模式入面標明「示範」嘅課題頁 |
| `favicon.svg` | 網站圖示 |

---

## 快速體驗（示範模式，無需 Google）

1. 確認 `config.js`：

   ```js
   USE_MOCK: true
   ```

2. 喺專案資料夾開靜態伺服器：

   ```bash
   python3 -m http.server 8080
   ```

   然後開 <http://localhost:8080>

3. 用年級或課題篩選。卡片有標題、連結、年級、課題，同埋 QR code。
4. 撳「下載 QR」會下載 PNG；「列印 QR」會開列印版（大 QR、標題、網址）。
5. 去「提交網站」貼上網址、標題，揀至少一個年級同一個課題。成功之後，回覆區都會出 QR。
6. 同一個網址再交一次，會話已經係清單入面。
7. 示範資料存在瀏覽器 `localStorage`。橫額上「重設示範資料」可以還原。

示範清單有兩頁現有教學頁（香港動物大探究、小小科學家探究助手：空氣的秘密），其餘標明「示範」嘅卡片只係用來試篩選。

---

## QR code

QR 喺瀏覽器產生，唔經付費 API。編碼嘅係該網站嘅完整網址（相對路徑會轉成而家頁面嘅絕對網址），同事用電話相機掃就開到。

- 卡片：細 QR、下載、列印
- 提交成功：同一組 QR

程式庫版權見 `vendor/qrcode-generator.js` 檔頭（MIT，Kazuhiko Arase）。「QR Code」係 DENSO WAVE INCORPORATED 嘅註冊商標。

---

## 正式部署：Google 試算表 + Apps Script

### 1. 建立試算表

1. 開 [Google 試算表](https://sheets.google.com) → 新增空白試算表。
2. 工作表可以留空。腳本會建立名為 `分享` 嘅工作表，並寫第 1 列標題。
3. 欄位：

| A timestamp | B title | C url | D grades | E topics | F note | G submitter | H status |
|-------------|---------|-------|----------|----------|--------|------------|----------|
| 2026-10-08 09:30:00 | 小一健康的生活方式 | https://example.com/health | P1 | healthy-living | 選填 | 選填 | approved |

`grades`、`topics` 用英文 id，多個以英文逗號分隔，例如 `P1,P2`、`light,inquiry-process`。

### 2. 貼上 Apps Script

1. 試算表選單：**擴充功能 → Apps Script**。
2. 刪除預設程式碼，將 `apps-script/Code.gs` **全部**貼上 → 儲存。
3. 專案名稱可改做「科學網站分享」。

### 3. 部署為網頁應用程式

1. 右上角 **部署 → 新增部署作業**。
2. 類型選 **網頁應用程式**。
3. 設定：
   - **說明**：例如 `v1`
   - **執行身分**：**我**（你的 Google 帳號）
   - **具有存取權的使用者**：**任何人**（Anyone）
4. 按 **部署**。首次要授權：選帳號 →「進階」→「前往……（不安全）」→ 允許。
5. 複製網頁應用程式網址，形如 `https://script.google.com/macros/s/xxxxx/exec`。

之後如果改 `Code.gs`，要再 **部署 → 管理部署作業 → 編輯 → 版本 → 新版本**，否則線上仍係舊程式。

### 4. 填入前端設定

編輯 `config.js`：

```js
window.SCIENCE_SHARE_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/你的部署ID/exec',
  USE_MOCK: false,
};
```

將檔案推上 GitHub 之後重新整理網站。`APPS_SCRIPT_URL` 仍然係 `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` 時，就算 `USE_MOCK` 設為 `false`，頁面都會留喺示範模式。

### 5. 清單同審核

v1 提交即 `status = approved`，清單會顯示狀態空白、`approved` 或 `public` 嘅列。

想暫時收起一條，喺試算表將 `status` 改做 `hidden` 或 `rejected`，唔使刪列。

`Code.gs` 頂部 `DEDUPE_BY_URL = true`：同一個正規化網址（小寫網域、去掉 `#` 同尾端 `/`）只收一次。想允許重複就改做 `false`，再部署新版本。

### 6. API

前端用 `POST`，`Content-Type: text/plain;charset=utf-8`，body 係 JSON，避免 CORS 預檢。回應亦係 `text/plain`，內容係 JSON。

| action | 說明 |
|--------|------|
| `list` | 回傳公開列（空白 / `approved` / `public`），新嘅排前面 |
| `submit` | 寫入一列。必填：`title`、`url`、至少一個 `grades`、至少一個 `topics` |

`note`、`submitter` 可留空。`doGet?action=list` 都可以拎清單。開 `/exec` 而唔帶 action，只會回一句運作中，唔會倒出成張表。

---

## GitHub Pages

網站係靜態檔，由 `main` 分支根目錄提供。

1. 將呢個改動合併入 `main`。
2. 開 repository **Settings → Pages**。
3. **Build and deployment → Source** 選 **Deploy from a branch**。
4. **Branch** 選 `main`，資料夾選 **`/ (root)`** → Save。
5. 幾分鐘後開 <https://ykleung2025.github.io/science-share/>。

未接上試算表之前，線上網站都係示範模式，每人瀏覽器各自一份資料。接上之後先會大家睇到同一張清單。

CSS / JS 連結帶 `?v=4`。改完前端記得加大版本號，否則同事可能仍然睇到舊檔。課題篩選按四個學習範疇摺起，撳開先揀。
