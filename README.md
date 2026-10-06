# Workshop Demo

工作坊現場示範用網站。五個純前端（原生 HTML / CSS / JavaScript，零框架、零後端、零建置步驟）Demo 的入口封面頁。

**線上版本：** <https://andychantest.github.io/workshop-demos/>

## 一覽

| # | Demo | 進入點 | 技術重點 |
|---|------|--------|----------|
| 01 | 個人履歷 Demo CV | `DemoCV/DemoCV.html` | 單檔 HTML、中英雙語、滾動動畫 |
| 02 | 英文單字學習圖鑑 | `english-vocab-demo/index.html` | 資料驅動卡片、四維篩選、學習進度持久化 |
| 03 | 學習儀表板 LA Project | `LA Project/index.html` | CSV/XLSX 解析、Chart.js 圖表、三種報告視圖 |
| 04 | LUNCH·O·MATIC 午餐轉盤 | `LunchWheelDemo/index.html` | Canvas 動畫、WebAudio 音效、三語系 |
| 05 | Trip Planner 班級旅行企劃 | `TripPlannerDemo/index.html` | 拖曳看板、預算統計、localStorage |

## 結構

```
Demo/
├── index.html      # 封面頁（本頁）
├── style.css       # 封面頁樣式
├── app.js          # 封面頁卡片資料 DEMOS[] 與渲染邏輯
├── DemoCV/         # 01 個人履歷
├── english-vocab-demo/  # 02 單字學習圖鑑
├── LA Project/     # 03 學習儀表板
├── LunchWheelDemo/ # 04 午餐轉盤
└── TripPlannerDemo/ # 05 班級旅行企劃
```

## 本機執行

封面頁與各 Demo 皆可直接用瀏覽器開啟 `index.html`。

**但 Demo 03（LA Project）需要經過 HTTP 伺服器**，因為它以 `fetch()` 讀取 `LA Project/Data/Class 1/` 底下的 CSV 檔，用 `file://` 直接開啟會被瀏覽器 CORS 政策擋下。

```powershell
cd Demo
python -m http.server 8000
# 開啟 http://localhost:8000
```

## 新增 Demo 到封面頁

在 `app.js` 的 `DEMOS` 陣列加一筆即可，封面頁會自動渲染卡片：

```js
{
  href: 'my-new-demo/index.html',  // 必須用相對路徑
  label: 'Category',
  title: '中文主標',
  subtitle: 'English Subtitle',
  icon: '🚀',
  accent: '#ff7a18',               // 卡片主題色
  tags: ['Tag1', 'Tag2'],
  desc: '一句話說明這個 Demo 解決什麼問題。'
}
```

> `href` 必須使用**相對路徑**。若改成 `/my-demo/index.html`，在 GitHub Pages 的
> `https://andychantest.github.io/workshop-demos/` 子路徑部署下會導向錯誤位置。

修改 `style.css` / `app.js` 後，記得同步更新 `index.html` 內的 `?v=` 版本號以清除瀏覽器快取。

## 設計說明

封面頁採「Workshop Console」工業控制台風格：近黑底 `#08090B` 配上藍圖細格與 SVG 雜訊底片，主色為訊號琥珀 `#FF7A18` 與電光青 `#3DE0D0`，標題用 Syne、標籤用 Chivo Mono、中文內文用 Noto Sans TC。格線採交錯位移形成斜向節奏，卡片 hover 時頂部光掃、邊框發光並微微上浮。

## 授權

教學示範用途，資料為虛構內容。