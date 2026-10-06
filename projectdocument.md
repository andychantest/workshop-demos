# 專案文件：Workshop Demo（Demo 資料夾封面頁）

## 專案概述

- **用途**：工作坊現場示範用網站的入口封面頁。頁面上方為 Hero 標題區，下方為 6 張 Demo 卡片按鈕，點擊即開啟對應的 Demo。
- **目標使用者**：工作坊講師／助教（現場操作投影）、參與學員（自行瀏覽）。
- **技術棧**：原生 HTML5 + CSS3 + JavaScript，無框架、無建置步驟、無後端。
- **設計方向**：「Workshop Console」工業控制台風格 — 近黑底、藍圖細格、訊號琥珀與電光青雙主色、工業角標、卡片等高排列。
- **多語系**：繁體中文（預設）／簡體中文／English 三語即時切換，選擇記憶於 `localStorage`。

### 為什麼封面頁與各 Demo 共用同一個 repo

封面頁是靜態檔案，與 6 個 Demo 放在一起部署，才能用相對路徑互相連結，不需要處理跨網域、也不用維護兩份部署。GitHub Pages 與 Vercel 都能直接部署此結構。

## 專案結構

```
Demo/
├── index.html                # 封面頁：Hero 區 + 語言切換 + 卡片容器 + <template> 卡片樣板
├── style.css                 # 封面頁全部樣式（配色變數、卡片、動畫、響應式、三語字型）
├── app.js                    # I18N 三語文案表 + DEMOS 資料 + renderCards() + revealOnScroll()
├── README.md                 # GitHub repo 首頁說明
├── projectdocument.md        # 本文件
├── .gitignore                # 排除 backups/、History/ 等開發過程產物
├── .nojekyll                 # 讓 GitHub Pages 跳過 Jekyll 處理
│
├── DemoCV/                   # Demo 01 個人履歷
│   └── DemoCV.html           #   單檔（內嵌 CSS/JS），入口非 index.html
├── english-vocab-demo/       # Demo 02 英文單字學習圖鑑
│   ├── index.html
│   ├── style.css
│   ├── app.js                # WORDS_DATA 內嵌於 JS（刻意的 file:// 相容設計）
│   └── background.png        # 背景底圖 2.3 MB
├── LA Project/               # Demo 03 學習儀表板
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── vendor/               # xlsx.full.min.js、chart.umd.min.js
│   └── Data/Class 1/         # 3 個 CSV（Moodle logs / forum / grades）
├── LunchWheelDemo/           # Demo 04 午餐轉盤
│   ├── index.html            # 單檔（內嵌 CSS/JS）
│   └── projectdocument.md
├── TripPlannerDemo/          # Demo 05 班級旅行企劃
│   └── index.html            #   單檔（內嵌 CSS/JS）
└── Scratch Method/            # Demo 06 k-NN 分類器視覺化
    ├── index.html            #   單檔（側欄控制台 + SVG 畫布 + 說明框）
    ├── style.css             #   淺色主題、SVG 點/線/動畫樣式、窄螢幕堆疊
    └── script.js             #   30 點隨機資料、歐氏距離、k 近鄰搜尋、投票分類、四步動畫
```

### 檔名與路徑的關鍵限制

| 項目 | 值 | 原因 |
|------|-----|------|
| `LA Project` 資料夾名 | **保留空格** | 使用者決定不更動既有結構；URL 須編碼為 `LA%20Project/` |
| `Scratch Method` 資料夾名 | **保留空格** | 同上；URL 須編碼為 `Scratch%20Method/` |
| `DemoCV` 入口檔 | `DemoCV.html`（非 `index.html`） | 與其他 Demo 不同，連結須直接指到檔名 |
| 卡片 href | **一律相對路徑** | GitHub Pages 部署於 `/workshop-demos/` 子路徑，絕對路徑會失效 |

## 核心功能說明

### 1. 三語介面（繁中 / 簡中 / English）

**文案結構**：`app.js` 中 `I18N` 物件以語言碼為 key（`zh-Hant` / `zh-Hans` / `en`），每個語言包含：

| 欄位 | 說明 |
|------|------|
| `meta.title` / `meta.desc` | `<title>` 與 `<meta name="description">`，逐語言更動以利 SEO 與分享預覽 |
| `eyebrow` / `lede` | Hero 區兩行文字 |
| `stat1L` ~ `stat3L` | 三個統計數字的上標籤 |
| `sectionTitle` / `sectionHint` | 卡片區標題與操作說明 |
| `cta` | 卡片按鈕文字 |
| `footer1` / `footerSig` | 頁尾兩行 |
| `demos[]` | **6 張卡片各自的** `label` / `title` / `subtitle` / `tags[]` / `desc` |

**套用流程**（`setLang()` → `applyText()`）：

1. 更新 `document.documentElement.lang`（影響字型選擇與瀏覽器輔助功能）
2. 更新 `<title>` 與 meta description
3. `querySelectorAll('[data-i18n]')` → `textContent`（純文字）
4. `querySelectorAll('[data-i18n-html]')` → `innerHTML`（僅用於 `lede` 與 `footer1`，兩者內含 `<strong>` 強調；文案為程式內固定常數，非使用者輸入，無注入風險）
5. 更新三顆語言按鈕的 `aria-pressed`
6. 更新 `<template>` 內的 `cta`（**`<template>` 的內容不在 `document` 中，`querySelector` 抓不到，必須從 `tpl.content` 取**）
7. `renderCards()` 重新渲染卡片

**設計決策：切換語言只換文字、不重建靜態節點。** 只有卡片（`replaceChildren`）會重建，因為卡片文案全在語言包裡。

**邊界情況與降級**：
- `localStorage` 不可用（隱私模式）時，`readLang()` / `saveLang()` 以 try-catch 包住，語言切換仍可正常使用，只是不會被記住。
- 首次進入（無紀錄）時依瀏覽器語言判斷：`zh-Hans` / `zh-CN` / `zh-SG` → 簡中；其他 `zh-*` → 繁中；其餘 → 繁中預設。
- 簡體中文會自動改用 `Noto Sans SC` 字型（`html[lang="zh-Hans"] body { --font-body: ... }`），避免部分简体字形回退到 TC 字型。

### 2. 資料驅動的卡片渲染（renderCards）

卡片不寫死在 HTML 裡，而是由 `app.js` 的 `DEMOS` 陣列經 `<template id="card-tpl">` 複製產生。

`DEMOS` 只放**與語言無關**的資料：

| 欄位 | 型別 | 用途 |
|------|------|------|
| `href` | string | 卡片連結目標（相對路徑） |
| `icon` | string | emoji 圖示 |
| `accent` | string | CSS 色值，注入為卡片 `--accent` 變數 |

文案則由 `I18N[lang].demos[i]` 依索引對應取出。

流程：`DEMOS.forEach()` → 複製 template → 逐欄位填入（全部走 `textContent`，不使用 `innerHTML`）→ 注入 `--accent` → 附加到 DocumentFragment → `grid.replaceChildren(frag)`。

- **邊界情況**：`demos[]` 項目數若與 `DEMOS` 不符會取到 `undefined` 並拋錯；新增 Demo 時**兩個地方都要加**（`DEMOS` 加路徑／圖示／色碼，`I18N` 的三個語言包各加一筆文案）。
- **新增 Demo**：建好資料夾後，於 `DEMOS` 加一筆，並在三個語言包各加一筆文案，封面頁自動多卡。

### 3. 卡片等高排列

需求為「每個 Demo 的方塊大小一致」，實作重點：

| 手段 | 說明 |
|------|------|
| `.grid { grid-auto-rows: 1fr; }` | 卡片數決定分列方式（6 張在桌面為 3 欄 × 2 列整齊排列）；`1fr` 讓**各列等高**，否則後面的列會依內容另算高度 |
| `.card { height: 100%; min-height: 452px; }` | 撐滿列高，並設定下限避免單欄（手機）時過扁 |
| `.card__tags { margin: auto 0 22px; }` | 標籤列的 `margin-top: auto` 吸收剩餘空間，**所有卡片的下半部（技術標籤 + 開啟按鈕）都對齊在同一水平線** |
| 移除 `.card:nth-child(even) { margin-top: 38px }` | 原本的交錯斜向排列會讓偶數卡片的實際高度少 38px，是「大小不一致」的主因 |

**實測結果**（5 種視窗 × 3 種語言 = 15 組，每組 6 張卡片）：

| 視窗 | 欄數 | 繁中 | 簡中 | English |
|------|------|------|------|---------|
| 1920×1080 | 3 | 497.5px | 495.5px | 587.1px |
| 1440×900 | 3 | 497.5px | 495.5px | 587.1px |
| 1180×820 | 3 | 497.5px | 495.5px | 556.6px |
| 820×1000 | 2 | 464.5px | 462.5px | 521.1px |
| 390×844 | 1 | 497.5px | 462.5px | 556.6px |

每一組內的 6 張卡片高度與寬度皆完全相同。英文版較高，因英文字串較長、可容納行數較多。同一語言切換視窗時高度會微調（欄寬改變導致行數變化），這是內容自適應的正常結果。

### 4. 進場動畫（revealOnScroll）

- 以 `IntersectionObserver`（`threshold: 0.08`、`rootMargin: 0px 0px 120px 0px`）偵測卡片進入視窗。
- 每張卡以 `data-delay = index × 85ms` 錯開，形成由上而下的連續浮現。
- 進入後立即 `observer.unobserve()`，確保只播一次。
- **只有位於摺線以下的卡片才會加上 `.reveal`**（`getBoundingClientRect().top > innerHeight - 40`）。這是必要的：切換語言會重建卡片，若所有卡片都帶 `.reveal`，使用者已捲過、不會再進入視窗的卡片會永遠停在 `opacity: 0`。
- **降級處理**：瀏覽器不支援 `IntersectionObserver` 時，完全不加 `.reveal`，內容直接可見。
- `prefers-reduced-motion: reduce` 時，CSS 將所有動畫與 transition 壓到 0.01ms。

### 5. 互動與版面

- **開啟方式**：`target="_blank"` + `rel="noopener"`。現場示範時切到新分頁，關閉分頁即回到封面，不會迷失。
- **鍵盤可及性**：語言按鈕與卡片皆為原生 `<button>` / `<a>`，Tab 順序為「三顆語言按鈕 → 六張卡片 → 回到頁首」，Enter 皆可操作。語言按鈕 `:focus-visible` 為青色外框。
- **語言按鈕**：`.langbtn[aria-pressed="true"]` 以琥珀色實底反白，使用 `aria-pressed` 而非 class 切換，螢幕閱讀器可正確播報目前語言。
- **kicker 長度**：英文版第 6 張的 kicker 為 `MACHINE LEARNING / 06`，實測寬 289–309px，在各視窗的卡片內容寬度（290–311px）內皆不會溢出。
- **響應式**：`repeat(auto-fit, minmax(292px, 1fr))`；≤640px 時語言按鈕縮小為 11.5px 以免撐出橫向捲動。

### 6. 字體與字級

字型分工：

| 用途 | 字型 |
|------|------|
| 標題（WORKSHOP DEMO、區段標題、卡片編號、統計數字） | Syne 700/800 |
| 標籤、kicker、按鈕、頁尾署名 | Chivo Mono |
| 中文內文 | Noto Sans TC（繁中）／Noto Sans SC（簡中） |
| Hero 大標 | Syne 800 + `-webkit-text-stroke` 空心字 |

**Hero 大標字級的硬性上限**：`Syne 800` 為極寬字體，「Workshop」單字寬度約 **10.15em**（實測 128px 時為 1299px），必須滿足 `10.15 × 字級 ≤ 內容區寬度`，否則會產生橫向捲動。因此使用 `font-size: min(8.2vw, 100px)`：桌面 100px = 1015px < 內容區 1068px ✓；390px 手機 32px = 325px ✓。

主要字級（v2 已放大）：卡片標題 25px、卡片說明 16.5px（行高 1.85）、Hero 內文 clamp(17.5px, 1.85vw, 21px)、統計數字 42px、區段標題 clamp(23px, 2.9vw, 32px)、頁尾 15px。

- 背景：深色底 + 兩團 radial 光暈（左上琥珀、右上電光青）+ 56px 藍圖細格，`background-attachment: fixed`。
- 底片雜訊：`.grain` 層以 SVG `feTurbulence` 產生，`mix-blend-mode: overlay` 疊在整頁上方，避免大面積純色死板。
- 卡片頂部光掃：`.card::before` 為漸層橫條，`scaleX(0)` → `scaleX(1)`。
- 工業角標：`.card__bracket` 畫出左上角 L 形線，hover 時放大並轉亮。
- 主題色以 `color-mix(in srgb, …)` 動態混色；不支援的舊瀏覽器會忽略該宣告並退回 `border: 1px solid var(--line)`，版面不受影響。

## 各 Demo 的執行環境需求

| Demo | 能否直接 `file://` 開啟 | 說明 |
|------|----------------------|------|
| 01 DemoCV | 可以 | 單檔，僅用 Google Fonts |
| 02 單字圖鑑 | 可以 | 資料刻意內嵌於 `app.js` 以避開 `file://` 的 fetch CORS 限制 |
| 03 LA Project | **不行，需 HTTP** | `app.js` 以 `fetch('./Data/Class 1/…csv')` 讀資料，`file://` 下會被 CORS 擋下並顯示「無法載入數據」 |
| 04 午餐轉盤 | 可以 | 單檔 + localStorage |
| 05 旅行企劃 | 可以 | 單檔 + localStorage |
| 06 k-NN 視覺化 | 可以 | 純 SVG + JS，無任何外部依賴 |

本機示範建議：`cd Demo` 後執行 `python -m http.server 8000`。

## 設定與部署方式

無環境變數、無建置設定、無後端服務。純靜態網站。

**已部署：** <https://andychantest.github.io/workshop-demos/>（GitHub Pages，來源為 `main` 分支根目錄）

`.nojekyll` 空檔案讓 GitHub Pages 跳過 Jekyll 建置，避免含空格的 `LA Project` 路徑與 `<template>` 等內容被 Liquid 處理而失敗。

**現場操作要點**：建議現場使用已發佈的 GitHub Pages 網址而非本機檔案，才能確保 Demo 03 的 CSV 能正常載入。

## Git 與快取維護

- `?v=` 版本號格式 `{YYYYMMDD}{序號}`，目前為 `20261006c`。修改 `style.css` 或 `app.js` 後必須同步更新 `index.html` 內兩個 `?v=` 值。
- `.gitignore` 排除 `backups/` 與 `History/`（LunchWheelDemo 的 4 個舊版本備份、LA Project 的開發對話紀錄），本機檔案保留不刪，但不會進公開 repo。

## 變更紀錄

| 版本 | 內容 |
|------|------|
| `20261006a` | 初版封面頁：Hero + 5 張交錯排列卡片 |
| `20261006b` | 修正 `Syne 800` 大標造成的橫向捲動（字級改為 `min(8.2vw, 100px)`）、縮小 Hero 高度 |
| `20261006c` | 新增繁中／簡中／English 三語介面（`localStorage` 記憶）；全面放大字級；卡片改為等高排列（`grid-auto-rows: 1fr`、移除交錯位移、標籤列 `margin-top: auto` 對齊） |
| `20261006d` | 新增 Demo 06「k-NN 分類器視覺化」（`Scratch Method/`，連結 `Scratch%20Method/index.html`）；同步補上三個語言包文案。修正該 Demo 在 ≤760px 視窗的橫向溢出（`#main-container` 改為垂直堆疊、SVG 改 `width:100%`） |
| `20261006e` | 移除文案中寫死的 Demo 數量（原「五個／Five」），改為不帶數量的敘述；`meta.desc` 補上 k-NN。Hero 的「示範數量」改為由 `DEMOS.length` 推導（`#statDemos`），卡片增減不再需手動改 |