/* ============================================================
   Workshop Demo — 封面頁
   卡片由 DEMOS 資料陣列驅動渲染；新增 Demo 只需在此加一筆
   ============================================================ */

/**
 * 每個 Demo 的欄位：
 *   href      相對路徑（不可用「/」開頭的絕對路徑，
 *             否則 GitHub Pages 的 /repo/ 子路徑部署會失效）
 *   label     卡片左上角分類標籤
 *   title     中文主標
 *   subtitle  英文副標
 *   icon      emoji
 *   accent    主題色（CSS 色值）
 *   tags      技術標籤
 */
const DEMOS = [
  {
    href: 'DemoCV/DemoCV.html',
    label: 'Resume',
    title: '個人履歷 Demo CV',
    subtitle: 'Interactive CV',
    icon: '📇',
    accent: '#ff7a18',
    tags: ['Single HTML', 'Bilingual', 'Scroll FX'],
    desc: '單一 HTML 檔的現代履歷頁。中英即時切換、時間軸與作品集滾動動畫，示範純前端的排版與動畫功力。'
  },
  {
    href: 'english-vocab-demo/index.html',
    label: 'Learning',
    title: '英文單字學習圖鑑',
    subtitle: 'Vocabulary Codex',
    icon: '📚',
    accent: '#3de0d0',
    tags: ['Vanilla JS', 'Filters', 'localStorage'],
    desc: '資料驅動的卡片式單字庫。關鍵字、難度、詞性、學習狀態四維篩選，可逐字打勾並記憶學習進度。'
  },
  {
    href: 'LA%20Project/index.html',
    label: 'Analytics',
    title: '學習儀表板 LA Project',
    subtitle: 'Learning Analytics',
    icon: '📊',
    accent: '#e8ff59',
    tags: ['CSV + XLSX', 'Chart.js', '3 Views'],
    desc: '讀入 Moodle 學習歷程資料，產出教師總覽、學生自習與個人三種視圖報告，自動算出學習指標並繪製圖表。'
  },
  {
    href: 'LunchWheelDemo/index.html',
    label: 'Decision',
    title: 'LUNCH·O·MATIC 午餐轉盤',
    subtitle: 'Lunch Spinner',
    icon: '🍱',
    accent: '#ff4d6d',
    tags: ['Canvas', 'WebAudio', 'Trilingual'],
    desc: 'Canvas 抽籤轉盤解決午餐選擇困難。分類與價格篩選、可永久刪除不喜歡的店，繁中／簡中／英文三語切換。'
  },
  {
    href: 'TripPlannerDemo/index.html',
    label: 'Planning',
    title: 'Trip Planner 班級旅行企劃',
    subtitle: 'Class Trip Planner',
    icon: '🧭',
    accent: '#7fb2ff',
    tags: ['Drag & Drop', 'Budget', 'localStorage'],
    desc: '拖曳式行程看板，自動依偏好分配隊伍與預算統計。內容即時存入瀏覽器，重新整理計畫仍在。'
  }
];

const grid = document.getElementById('grid');
const tpl = document.getElementById('card-tpl');

function renderDemos(demos) {
  const frag = document.createDocumentFragment();

  demos.forEach((demo, i) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.card');

    card.href = demo.href;
    card.style.setProperty('--accent', demo.accent);
    card.setAttribute('aria-label', `${demo.title}（${demo.subtitle}）— 開啟 Demo`);

    node.querySelector('.card__index').textContent = String(i + 1).padStart(2, '0');
    node.querySelector('.card__icon').textContent = demo.icon;
    node.querySelector('.card__kicker').textContent = `${demo.label} / ${String(i + 1).padStart(2, '0')}`;
    node.querySelector('.card__title').textContent = demo.title;
    node.querySelector('.card__subtitle').textContent = demo.subtitle;
    node.querySelector('.card__desc').textContent = demo.desc;

    const tags = node.querySelector('.card__tags');
    demo.tags.forEach(tag => {
      const li = document.createElement('li');
      li.textContent = tag;
      tags.appendChild(li);
    });

    card.classList.add('reveal');
    frag.appendChild(node);
  });

  grid.appendChild(frag);
}

function revealOnScroll() {
  const cards = grid.querySelectorAll('.reveal');

  // 無 IntersectionObserver 時（舊瀏覽器）直接全部顯示
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-in'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px 120px 0px' });

  cards.forEach((card, i) => {
    card.dataset.delay = String(i * 85);
    io.observe(card);
  });
}

renderDemos(DEMOS);
revealOnScroll();