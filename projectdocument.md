# 專案文件：Workshop Demo（Demo 資料夾封面頁）

## 專案概述

- **用途**：工作坊現場示範用網站的入口封面頁。頁面上方為 Hero 標題區，下方為 5 張 Demo 卡片按鈕，點擊即開啟對應的 Demo。
- **目標使用者**：工作坊講師／助教（現場操作投影）、參與學員（自行瀏覽）。
- **技術棧**：原生 HTML5 + CSS3 + JavaScript，無框架、無建置步驟、無後端。
- **設計方向**：「Workshop Console」工業控制台風格 — 近黑底、藍圖細格、訊號琥珀與電光青雙主色、工業角標、卡片交錯斜向排列。

### 為什麼封面頁與各 Demo 共用同一個 repo

封面頁是靜態檔案，與 5 個 Demo 放在一起部署，才能用相對路徑互相連結，不需要處理跨網域、也不用維護兩份部署。GitHub Pages 與 Vercel 都能直接部署此結構。

## 專案結構

```
Demo/
├── index.html                # 封面頁：Hero 區 + 卡片容器 + <template> 卡片樣板
├── style.css                 # 封面頁全部樣式（配色變數、卡片、動畫、響應式）
├── app.js                    # DEMOS[] 資料陣列 + renderDemos() + revealOnScroll()
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
└── TripPlannerDemo/          # Demo 05 班級旅行企劃
    └── index.html            # 單檔（內嵌 CSS/JS）
```

### 檔名與路徑的關鍵限制

| 項目 | 值 | 原因 |
|------|-----|------|
| `LA Project` 資料夾名 | **保留空格** | 使用者決定不更動既有結構；URL 須編碼為 `LA%20Project/` |
| `DemoCV` 入口檔 | `DemoCV.html`（非 `index.html`） | 與其他 Demo 不同，連結須直接指到檔名 |
| 卡片 href | **一律相對路徑** | GitHub Pages 部署於 `/workshop-demos/` 子路徑，絕對路徑會失效 |

## 核心功能說明

### 1. 資料驅動的卡片渲染（renderDemos）

卡片不寫死在 HTML 裡，而是由 `app.js` 的 `DEMOS` 陣列經 `<template id="card-tpl">` 複製產生。

每筆 Demo 的欄位：

| 欄位 | 型別 | 用途 |
|------|------|------|
| `href` | string | 卡片連結目標（相對路徑） |
| `label` | string | 左上角英文分類標籤（Resume / Learning / …） |
| `title` | string | 中文主標 |
| `subtitle` | string | 英文副標（等寬字、大寫） |
| `icon` | string | emoji 圖示 |
| `accent` | string | CSS 色值，注入為卡片 `--accent` 變數 |
| `tags` | string[] | 技術標籤清單 |
| `desc` | string | 一句話說明此 Demo 解決什麼問題 |

流程：`DEMOS.forEach()` → 複製 template → 逐欄位填入（全部走 `textContent`，不使用 `innerHTML`，杜絕資料注入）→ 注入 `--accent` → 加入 `.reveal` class → 附加到 DocumentFragment → 一次 `appendChild`。

- **邊界情況**：`DEMOS` 為空陣列時容器保持空白，不報錯。
- **新增 Demo**：只需在 `DEMOS` 加一筆並建好資料夾，封面頁自動多一張卡，無需改 HTML 或 CSS。

### 2. 進場動畫（revealOnScroll）

- 以 `IntersectionObserver`（`threshold: 0.15`、`rootMargin: 0px 0px -8% 0px`）偵測卡片進入視窗。
- 每張卡以 `data-delay = index × 85ms` 錯開，形成由上而下的連續浮現。
- 進入後立即 `observer.unobserve()`，確保只播一次。
- **降級處理**：瀏覽器不支援 `IntersectionObserver` 時，直接全部加上 `.is-in`，內容照常可見（不會卡在 `opacity: 0`）。
- `prefers-reduced-motion: reduce` 時，CSS 將所有動畫與 transition 壓到 0.01ms。

### 3. 互動與版面

- **開啟方式**：`target="_blank"` + `rel="noopener"`。現場示範時切到新分頁，關閉分頁即回到封面，不會迷失。
- **鍵盤可及性**：卡片是 `<a>` 元素，原生可 Tab 聚焦；`:focus-visible` 與 `:hover` 共用視覺回饋。
- **交錯排列**：≥900px 視窗時偶數卡片加 `margin-top: 38px`，形成斜向節奏。用 margin 而非 transform，把 transform 完整留給 hover 上浮與進場動畫，避免動畫互相覆蓋。
- **響應式**：`repeat(auto-fit, minmax(292px, 1fr))`；640px 以下卡片改為單欄、masthead 選單縮排。

### 4. 視覺細節

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

本機示範建議：`cd Demo` 後執行 `python -m http.server 8000`。

## 設定與部署方式

無環境變數、無建置設定、無後端服務。純靜態網站。

**已部署：** <https://andychantest.github.io/workshop-demos/>（GitHub Pages，來源為 `main` 分支根目錄）

`.nojekyll` 空檔案讓 GitHub Pages 跳過 Jekyll 建置，避免含空格的 `LA Project` 路徑與 `<template>` 等內容被 Liquid 處理而失敗。

**現場操作要點**：建議現場使用已發佈的 GitHub Pages 網址而非本機檔案，才能確保 Demo 03 的 CSV 能正常載入。

## Git 與快取維護

- `?v=` 版本號格式 `{YYYYMMDD}{序號}`，目前為 `20261006a`。修改 `style.css` 或 `app.js` 後必須同步更新 `index.html` 內兩個 `?v=` 值。
- `.gitignore` 排除 `backups/` 與 `History/`（LunchWheelDemo 的 4 個舊版本備份、LA Project 的開發對話紀錄），本機檔案保留不刪，但不會進公開 repo。