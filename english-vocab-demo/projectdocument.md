# 專案文件：英文單字學習圖鑑（english-vocab-demo）

## 專案概述

- **用途**：將原本的遊戲「彩虹島物語怪物圖鑑」改造成「教與學」示範，做為工作坊／課堂的學習案例。核心特色是**卡片 + 篩選 + 詳細彈窗 + 已學會打勾與進度記憶**。
- **目標使用者**：想要示範「資料驅動 UI / 卡片式學習介面」的老師與學習者；實作為純前端，無需後端即可運作。
- **技術棧**：原生 HTML5 + CSS3 + JavaScript（無任何框架、無建置步驟），字型使用 Google Fonts（Mochiy Pop One / Noto Sans TC），背景為可愛彩虹風格。
- **字型設計決策（粗細分層提升中文可讀性）**：Mochiy Pop One 無中文字形，故**中文正文一律以 Noto Sans TC 優先**並用 `font-weight:400`；粗體 700 僅保留給**強調元素**（英文單字、標題、側欄標題、徽章、進度、按鈕、相關詞 chips）。`body` 同時設 `font-synthesis-weight:none` 防止 fallback 時瀏覽器仿真粗體導致中文毛邊。

## 專案結構

```
english-vocab-demo\
├── index.html        # 頁面骨架：裝飾層、Header、側欄篩選、單字卡片網格、詳細彈窗
├── style.css         # 全部樣式：彩虹風裝飾、卡片、打勾、進度條、彈窗
├── app.js            # 資料陣列 + 渲染 + 篩選 + 打勾/進度/localStorage + 彈窗邏輯
├── background.png    # 背景底圖（承襲原遊戲版的可愛粉紫風）
└── projectdocument.md # 本文件
```

## 核心功能說明

### 1. 資料驅動卡片渲染（renderWords）
- 單字資料放在 `app.js` 的 `WORDS_DATA` 陣列中，每筆：
  `id / word / nameZh / level(難度1-9) / topic(主題) / unit(單元) / type+typeKey(詞性) / description(英文定義) / emoji / stats.importance(重要度1-5) / example(例句) / related[](相關詞)`
- **設計決策**：資料內嵌於 JS 而非 `fetch(monsters.json)`。原因：直接以 `file://` 開啟網頁時，`fetch()` 會因瀏覽器 CORS 限制而失敗；內嵌可確保工作坊/離線環境直接開啟即可運作。此為刻意保留的教學重點。

### 2. 篩選（applyFilters）
四個維度可任意組合，皆即時重渲染：
- **關鍵字搜尋**：比對英文單字、中文意思、例句（皆轉小寫）。
- **難度區間**：初級 Lv.1~3 / 中級 Lv.4~6 / 高級 Lv.7~9（依 `level`）。
- **詞性**：名詞 / 動詞 / 形容詞（依 `type`）。
- **學習狀態**：全部 / 未學會 / 已學會（依 `doneSet`）。
- 邊界情況：無符合結果時顯示空狀態「沒有符合條件的單字」。

### 3. 卡片打勾與進度（核心新功能）
- 每張卡片右上角有圓形 **✓ 按鈕**，點擊切換「已學會」狀態（`toggleDone`）：
  - 以 `event.stopPropagation()` 避免誤觸發詳情彈窗。
  - 已學會卡片進入 `done` 樣式（綠框 + emoji 淡化 + ✓ 亮起）。
- 已學會 id 集合以 `localStorage`（key：`vocab-done`）儲存，重新整理後仍保留。
- **進度條**：側欄頂部顯示「已學會 N / M 個單字」+ 百分比彩色進度列（以全部單字計算）。
- **重置進度**：`resetBtn` 一鍵清空，方便示範或學生反覆練習。

### 4. 詳細彈窗（showDetail）
點卡片開啟，內容包含：emoji 大圖、單字、中文、詞性徽章，以及難度／詞性／主題／單元／重要度（★）、英文定義、例句框、相關詞 chips。
- 點背景（`e.target === modal`）或按 `ESC` 皆可關閉。

## 資料結構（對應欄位演進）

| 原遊戲欄位 | 學習版欄位 | 說明 |
|---|---|---|
| name | word | 英文單字 |
| nameZh | nameZh | 中文意思 |
| level (1-25) | level (1-9) | 難度 |
| region | topic | 主題分類（食物/動物/學校/自然/身體/情緒/動作/特性） |
| area | unit | 單元（子分類） |
| type (一般/BOSS/突變) | type / typeKey | 詞性（名詞n/動詞v/形容詞adj），配色沿用三色徽章 |
| stats (hp/atk/def) | stats.importance | 重要度 ★1~5 |
| drops | related[] | 相關詞 chips |
| image (gif) | emoji | emoji 大圖（避免版權、零圖片依賴；**一律選用單一編碼 emoji**，ZWJ 組合如 🧑🏫/🧑🚀 在部分字形下會被拆開、寬度暴增造成溢位，故以 🎓/🔭 代替） |

## 設定與部署方式

- 不需安裝，直接以瀏覽器開啟 `index.html` 即可（`file://` 完全可用）。
- 上傳 GitHub + Vercel：資料夾為純靜態，push 後自動部署，網址即為 `https://<repo>.vercel.app`。
- 變更前端後若不熟悉版本：本專案無打包步驟，改完直接重新上傳即可。