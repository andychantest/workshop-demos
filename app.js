/* ============================================================
   Workshop Demo — 封面頁
   · 三語介面：繁中 / 簡中 / English
   · 卡片由 DEMOS 資料驅動渲染；新增 Demo 只需在 DEMOS 加一筆
   ============================================================ */

/** 與語言無關的資料：路徑、圖示、主題色 */
const DEMOS = [
  { href: 'DemoCV/DemoCV.html', icon: '📇', accent: '#ff7a18' },
  { href: 'english-vocab-demo/index.html', icon: '📚', accent: '#3de0d0' },
  { href: 'LA%20Project/index.html', icon: '📊', accent: '#e8ff59' },
  { href: 'LunchWheelDemo/index.html', icon: '🍱', accent: '#ff4d6d' },
  { href: 'TripPlannerDemo/index.html', icon: '🧭', accent: '#7fb2ff' }
];

const LANGS = ['zh-Hant', 'zh-Hans', 'en'];
const DEFAULT_LANG = 'zh-Hant';
const LS_KEY = 'workshop-lang';

/** 繁中介面文案 */
const ZH_HANT = {
  meta: {
    title: 'Workshop Demo｜工作坊示範集',
    desc: '五個純前端、可現場直接操作的教學 Demo：履歷頁、單字學習圖鑑、學習儀表板、午餐轉盤、班級旅行企劃。'
  },
  eyebrow: '工作坊現場可操作 · 無後端 · 資料存於瀏覽器',
  lede: '五個純前端 Demo，全部用原生 HTML、CSS、JavaScript 寫成。點擊任何一張卡片即可在<strong>新分頁</strong>開啟，直接動手操作。',
  stat1L: '示範數量', stat2L: '後端服務', stat3L: '建置步驟',
  sectionTitle: '選擇一個開始示範',
  sectionHint: '點擊卡片 → 新分頁開啟 Demo，關閉分頁即回到此頁',
  cta: '開啟 Demo',
  footer1: '所有 Demo 皆以<strong>相對路徑</strong>載入，離線、內網、投影機皆可運作。',
  footerSig: 'Workshop Demo · 純前端教學示範集',
  demos: [
    { label: '履歷', title: '個人履歷 Demo CV', subtitle: '互動式履歷', tags: ['單一 HTML', '中英雙語', '滾動動畫'],
      desc: '單一 HTML 檔的現代履歷頁。中英即時切換，時間軸與作品集滾動動畫，示範純前端的排版與動畫功力。' },
    { label: '學習', title: '英文單字學習圖鑑', subtitle: 'Vocabulary Codex', tags: ['原生 JS', '四維篩選', '進度記憶'],
      desc: '資料驅動的卡片式單字庫。可依關鍵字、難度、詞性與學習狀態四維篩選，逐字打勾並自動記憶學習進度。' },
    { label: '分析', title: '學習儀表板 LA Project', subtitle: 'Moodle 學習分析', tags: ['CSV + XLSX', 'Chart.js', '三種視圖'],
      desc: '讀入 Moodle 學習歷程資料，產出教師總覽、學生自習與個人三種視圖報告，自動算出學習指標並繪製圖表。' },
    { label: '決策', title: 'LUNCH·O·MATIC 午餐轉盤', subtitle: '今天午餐吃什麼', tags: ['Canvas 動畫', 'WebAudio 音效', '三語介面'],
      desc: 'Canvas 抽籤轉盤解決午餐選擇困難。可依分類與價格篩選，並永久刪除不喜歡的店，繁中／簡中／英文三語切換。' },
    { label: '規劃', title: 'Trip Planner 班級旅行企劃', subtitle: '班級去哪裡玩', tags: ['拖曳看板', '預算統計', '自動儲存'],
      desc: '拖曳式行程看板，自動依偏好分配隊伍與統計預算。所有調整即時存入瀏覽器，重新整理計畫仍在。' }
  ]
};

/** 簡中介面文案 */
const ZH_HANS = {
  meta: {
    title: 'Workshop Demo｜工作坊示范集',
    desc: '五个纯前端、可现场直接操作的教学 Demo：简历页、单词学习图鉴、学习仪表板、午餐转盘、班级旅行企划。'
  },
  eyebrow: '工作坊现场可操作 · 无后端 · 资料存在浏览器',
  lede: '五个纯前端 Demo，全部用原生 HTML、CSS、JavaScript 写成。点击任何一张卡片即可在<strong>新标签页</strong>打开，直接动手操作。',
  stat1L: '示范数量', stat2L: '后端服务', stat3L: '构建步骤',
  sectionTitle: '选择一个开始示范',
  sectionHint: '点击卡片 → 新标签页打开 Demo，关闭标签页即回到本页',
  cta: '打开 Demo',
  footer1: '所有 Demo 皆以<strong>相对路径</strong>载入，离线、内网、投影机皆可运作。',
  footerSig: 'Workshop Demo · 纯前端教学示范集',
  demos: [
    { label: '简历', title: '个人简历 Demo CV', subtitle: '互动式简历', tags: ['单一 HTML', '中英双语', '滚动动画'],
      desc: '单一 HTML 档的现代简历页。中英即时切换，时间轴与作品集滚动动画，示范纯前端的排版与动画功力。' },
    { label: '学习', title: '英文单词学习图鉴', subtitle: 'Vocabulary Codex', tags: ['原生 JS', '四维筛选', '进度记忆'],
      desc: '数据驱动的卡片式单词库。可依关键字、难度、词性与学习状态四维筛选，逐字打勾并自动记住学习进度。' },
    { label: '分析', title: '学习仪表板 LA Project', subtitle: 'Moodle 学习分析', tags: ['CSV + XLSX', 'Chart.js', '三种视图'],
      desc: '读入 Moodle 学习历程资料，产出教师总览、学生自习与个人三种视图报告，自动算出学习指标并绘制图表。' },
    { label: '决策', title: 'LUNCH·O·MATIC 午餐转盘', subtitle: '今天午饭吃什么', tags: ['Canvas 动画', 'WebAudio 音效', '三语界面'],
      desc: 'Canvas 抽奖转盘解决午饭选择困难。可依分类与价格筛选，并永久删除不喜欢的店，繁中／简中／英文三语切换。' },
    { label: '规划', title: 'Trip Planner 班级旅行企划', subtitle: '班级去哪里玩', tags: ['拖曳看板', '预算统计', '自动保存'],
      desc: '拖曳式行程看板，自动依偏好分配队伍与统计预算。所有调整即时存入浏览器，重新整理计划仍在。' }
  ]
};

/** 英文介面文案 */
const EN = {
  meta: {
    title: 'Workshop Demo · Live Showcase',
    desc: 'Five live-runnable pure-frontend demos: résumé page, vocabulary codex, learning analytics dashboard, lunch spinner and class trip planner.'
  },
  eyebrow: 'Live at the workshop · No backend · Data stays in your browser',
  lede: 'Five demos built entirely with plain HTML, CSS and JavaScript. Click any card to open it in a <strong>new tab</strong> and try it yourself.',
  stat1L: 'Demos', stat2L: 'Backend', stat3L: 'Build Step',
  sectionTitle: 'Pick one to start',
  sectionHint: 'Click a card → opens in a new tab · close it to come back here',
  cta: 'Launch Demo',
  footer1: 'Every demo loads from <strong>relative paths</strong>, so it works offline, on an intranet, or straight from a projector.',
  footerSig: 'Workshop Demo · A pure-frontend teaching showcase',
  demos: [
    { label: 'Resume', title: 'Personal Résumé Demo', subtitle: 'Interactive CV', tags: ['Single HTML', 'Bilingual', 'Scroll FX'],
      desc: 'A modern résumé page in one single HTML file. Instant Chinese/English switching, animated timeline and portfolio reveal on scroll.' },
    { label: 'Learning', title: 'English Vocabulary Codex', subtitle: 'Study Cards', tags: ['Vanilla JS', 'Filters', 'Auto-save'],
      desc: 'A data-driven card library of English words. Filter by keyword, level, part of speech and study status; tick words off and your progress is remembered.' },
    { label: 'Analytics', title: 'Learning Analytics Dashboard', subtitle: 'Moodle Insights', tags: ['CSV + XLSX', 'Chart.js', '3 Views'],
      desc: 'Reads Moodle activity data and builds three report views — teacher overview, student self-study and individual — with learning metrics and charts.' },
    { label: 'Decision', title: 'LUNCH·O·MATIC Spinner', subtitle: 'What Should I Eat?', tags: ['Canvas', 'WebAudio', 'Trilingual'],
      desc: 'A canvas spinning wheel that settles the lunch dilemma. Filter by category and price, drop the places you dislike, in three languages.' },
    { label: 'Planning', title: 'Class Trip Planner', subtitle: 'Where To Go?', tags: ['Drag & Drop', 'Budget', 'Auto-save'],
      desc: 'A drag-and-drop itinerary board that assigns groups and tallies the budget automatically. Every change is saved to your browser instantly.' }
  ]
};

const I18N = { 'zh-Hant': ZH_HANT, 'zh-Hans': ZH_HANS, en: EN };

const grid = document.getElementById('grid');
const tpl = document.getElementById('card-tpl');
let currentLang = DEFAULT_LANG;

/* ---------- 語言儲存與套用 ---------- */

function readLang() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (LANGS.indexOf(saved) !== -1) return saved;
  } catch (e) { /* localStorage 不可用時靜默降級為預設語言 */ }

  const nav = (navigator.language || '').toLowerCase();
  if (nav.indexOf('zh-hans') === 0 || nav.indexOf('zh-cn') === 0 || nav.indexOf('zh-sg') === 0) return 'zh-Hans';
  if (nav.indexOf('zh') === 0) return 'zh-Hant';
  return DEFAULT_LANG;
}

function saveLang(lang) {
  try { localStorage.setItem(LS_KEY, lang); } catch (e) { /* 無法持久化時不影響切換 */ }
}

/** 只替換文字，不重建節點 —— 避免切換語言時動畫重播、畫面閃爍 */
function applyText() {
  const t = I18N[currentLang];

  document.documentElement.lang = currentLang;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]').setAttribute('content', t.meta.desc);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t[el.dataset.i18n];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t[el.dataset.i18nHtml];
  });

  document.querySelectorAll('#langSwitch .langbtn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === currentLang));
  });

  // 卡片內容（<template> 內的元素不在 document 中，須從 tpl.content 取）
  tpl.content.querySelector('[data-i18n="cta"]').textContent = t.cta;

  renderCards();
}

function setLang(lang) {
  if (I18N[lang] === undefined) return;
  currentLang = lang;
  saveLang(lang);
  applyText();
}

/* ---------- 卡片渲染 ---------- */

function renderCards() {
  const t = I18N[currentLang];
  const frag = document.createDocumentFragment();

  DEMOS.forEach((demo, i) => {
    const copy = t.demos[i];
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.card');

    card.href = demo.href;
    card.style.setProperty('--accent', demo.accent);
    card.setAttribute('aria-label', `${copy.title} — ${t.cta}`);

    node.querySelector('.card__index').textContent = String(i + 1).padStart(2, '0');
    node.querySelector('.card__icon').textContent = demo.icon;
    node.querySelector('.card__kicker').textContent = `${copy.label} / ${String(i + 1).padStart(2, '0')}`;
    node.querySelector('.card__title').textContent = copy.title;
    node.querySelector('.card__subtitle').textContent = copy.subtitle;
    node.querySelector('.card__desc').textContent = copy.desc;

    const tags = node.querySelector('.card__tags');
    copy.tags.forEach(tag => {
      const li = document.createElement('li');
      li.textContent = tag;
      tags.appendChild(li);
    });

    frag.appendChild(node);
  });

  grid.replaceChildren(frag);
  revealOnScroll();
}

/* ---------- 進場動畫 ---------- */

function revealOnScroll() {
  const cards = grid.querySelectorAll('.card');

  // 無 IntersectionObserver 時（舊瀏覽器）直接全部顯示，內容不會卡在透明
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-in'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 120px 0px' });

  cards.forEach((card, i) => {
    // 只有位於摺線以下的卡片才需要進場動畫。
    // 否則切換語言重建卡片時，已捲過的卡片不會再進入視窗，會永遠停在 opacity 0。
    if (card.getBoundingClientRect().top > window.innerHeight - 40) {
      card.classList.add('reveal');
      card.dataset.delay = String(i * 85);
      io.observe(card);
    }
  });
}

/* ---------- 啟動 ---------- */

document.getElementById('langSwitch').addEventListener('click', e => {
  const btn = e.target.closest('.langbtn');
  if (btn) setLang(btn.dataset.lang);
});

currentLang = readLang();
applyText();