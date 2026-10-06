// ============================================================
//   英文單字學習圖鑑 — English Vocabulary Learning Cards
//   保留遊戲圖鑑的「卡片 + 篩選 + 彈窗」格式，
//   內容改為英文單字，新增「已學會」打勾、進度條與記憶。
//
//   小知識：資料直接內嵌在這裡，而不是用 fetch() 讀 JSON。
//   因為若直接用瀏覽器開啟檔案（file://），fetch 會因
//   CORS 被擋住而失敗，內嵌是保護你 demo 能正常運作的做法。
// ============================================================

const WORDS_DATA = [
  {
    "id": "apple",
    "word": "apple",
    "nameZh": "蘋果",
    "level": 1,
    "topic": "食物",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A round fruit with red or green skin.",
    "emoji": "🍎",
    "stats": { "importance": 4 },
    "example": "I eat an apple every day.",
    "related": ["fruit", "red", "juice"]
  },
  {
    "id": "banana",
    "word": "banana",
    "nameZh": "香蕉",
    "level": 1,
    "topic": "食物",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A long yellow fruit that monkeys love.",
    "emoji": "🍌",
    "stats": { "importance": 3 },
    "example": "Monkeys love bananas.",
    "related": ["fruit", "yellow", "peel"]
  },
  {
    "id": "dog",
    "word": "dog",
    "nameZh": "狗",
    "level": 1,
    "topic": "動物",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A friendly animal that many people keep as a pet.",
    "emoji": "🐶",
    "stats": { "importance": 5 },
    "example": "The dog is barking.",
    "related": ["pet", "puppy", "bark"]
  },
  {
    "id": "cat",
    "word": "cat",
    "nameZh": "貓",
    "level": 1,
    "topic": "動物",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A small animal with soft fur and whiskers.",
    "emoji": "🐱",
    "stats": { "importance": 5 },
    "example": "The cat sleeps on the sofa.",
    "related": ["pet", "kitten", "meow"]
  },
  {
    "id": "book",
    "word": "book",
    "nameZh": "書",
    "level": 1,
    "topic": "學校",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A set of printed pages for reading.",
    "emoji": "📚",
    "stats": { "importance": 5 },
    "example": "I read a book before bed.",
    "related": ["novel", "read", "library"]
  },
  {
    "id": "pencil",
    "word": "pencil",
    "nameZh": "鉛筆",
    "level": 1,
    "topic": "學校",
    "unit": "常見名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A tool for writing or drawing.",
    "emoji": "✏️",
    "stats": { "importance": 4 },
    "example": "Write with a pencil.",
    "related": ["pen", "eraser", "stationery"]
  },
  {
    "id": "hand",
    "word": "hand",
    "nameZh": "手",
    "level": 1,
    "topic": "身體",
    "unit": "常用名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "The body part at the end of your arm.",
    "emoji": "✋",
    "stats": { "importance": 5 },
    "example": "Please raise your hand.",
    "related": ["finger", "palm", "hold"]
  },
  {
    "id": "eye",
    "word": "eye",
    "nameZh": "眼睛",
    "level": 1,
    "topic": "身體",
    "unit": "常用名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "The part of your body you see with.",
    "emoji": "👀",
    "stats": { "importance": 5 },
    "example": "Close your eyes and sleep.",
    "related": ["see", "look", "blink"]
  },
  {
    "id": "sun",
    "word": "sun",
    "nameZh": "太陽",
    "level": 2,
    "topic": "自然",
    "unit": "自然現象",
    "type": "名詞",
    "typeKey": "n",
    "description": "The bright star that gives us light and heat.",
    "emoji": "☀️",
    "stats": { "importance": 4 },
    "example": "The sun is bright today.",
    "related": ["sunshine", "light", "warm"]
  },
  {
    "id": "rain",
    "word": "rain",
    "nameZh": "雨",
    "level": 2,
    "topic": "自然",
    "unit": "自然現象",
    "type": "名詞",
    "typeKey": "n",
    "description": "Water that falls from the sky.",
    "emoji": "🌧️",
    "stats": { "importance": 4 },
    "example": "It rains a lot in spring.",
    "related": ["rainy", "shower", "umbrella"]
  },
  {
    "id": "run",
    "word": "run",
    "nameZh": "跑步",
    "level": 2,
    "topic": "動作",
    "unit": "常用動詞",
    "type": "動詞",
    "typeKey": "v",
    "description": "To move quickly on your feet.",
    "emoji": "🏃",
    "stats": { "importance": 5 },
    "example": "I run in the park every morning.",
    "related": ["jog", "sprint", "race"]
  },
  {
    "id": "eat",
    "word": "eat",
    "nameZh": "吃",
    "level": 2,
    "topic": "動作",
    "unit": "常用動詞",
    "type": "動詞",
    "typeKey": "v",
    "description": "To put food in your mouth and swallow it.",
    "emoji": "🍽️",
    "stats": { "importance": 5 },
    "example": "We eat dinner at seven.",
    "related": ["have", "taste", "meal"]
  },
  {
    "id": "jump",
    "word": "jump",
    "nameZh": "跳",
    "level": 3,
    "topic": "動作",
    "unit": "動作動詞",
    "type": "動詞",
    "typeKey": "v",
    "description": "To push yourself off the ground into the air.",
    "emoji": "🦘",
    "stats": { "importance": 4 },
    "example": "The frog can jump very high.",
    "related": ["leap", "hop", "bounce"]
  },
  {
    "id": "sing",
    "word": "sing",
    "nameZh": "唱歌",
    "level": 3,
    "topic": "動作",
    "unit": "動作動詞",
    "type": "動詞",
    "typeKey": "v",
    "description": "To make music with your voice.",
    "emoji": "🎤",
    "stats": { "importance": 4 },
    "example": "She sings beautifully.",
    "related": ["song", "music", "perform"]
  },
  {
    "id": "happy",
    "word": "happy",
    "nameZh": "快樂的",
    "level": 3,
    "topic": "情緒",
    "unit": "情緒形容詞",
    "type": "形容詞",
    "typeKey": "adj",
    "description": "Feeling good and full of joy.",
    "emoji": "😊",
    "stats": { "importance": 5 },
    "example": "I feel happy today.",
    "related": ["glad", "joyful", "cheerful"]
  },
  {
    "id": "fast",
    "word": "fast",
    "nameZh": "快的",
    "level": 3,
    "topic": "特性",
    "unit": "形容詞",
    "type": "形容詞",
    "typeKey": "adj",
    "description": "Moving or happening quickly.",
    "emoji": "🚀",
    "stats": { "importance": 5 },
    "example": "The train is very fast.",
    "related": ["quick", "rapid", "speed"]
  },
  {
    "id": "big",
    "word": "big",
    "nameZh": "大的",
    "level": 4,
    "topic": "特性",
    "unit": "形容詞",
    "type": "形容詞",
    "typeKey": "adj",
    "description": "Large in size or amount.",
    "emoji": "🐘",
    "stats": { "importance": 5 },
    "example": "The elephant is big.",
    "related": ["large", "huge", "giant"]
  },
  {
    "id": "slow",
    "word": "slow",
    "nameZh": "慢的",
    "level": 4,
    "topic": "特性",
    "unit": "形容詞",
    "type": "形容詞",
    "typeKey": "adj",
    "description": "Not moving or happening quickly.",
    "emoji": "🐢",
    "stats": { "importance": 4 },
    "example": "The turtle is slow.",
    "related": ["gentle", "leisurely", "steady"]
  },
  {
    "id": "beautiful",
    "word": "beautiful",
    "nameZh": "漂亮的",
    "level": 5,
    "topic": "特性",
    "unit": "形容詞",
    "type": "形容詞",
    "typeKey": "adj",
    "description": "Very pleasing to look at.",
    "emoji": "🌸",
    "stats": { "importance": 5 },
    "example": "What a beautiful flower!",
    "related": ["pretty", "lovely", "gorgeous"]
  },
  {
    "id": "teacher",
    "word": "teacher",
    "nameZh": "老師",
    "level": 5,
    "topic": "學校",
    "unit": "職業名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A person who helps students learn.",
    "emoji": "🎓",
    "stats": { "importance": 5 },
    "example": "Our teacher is very kind.",
    "related": ["mentor", "instructor", "class"]
  },
  {
    "id": "dinosaur",
    "word": "dinosaur",
    "nameZh": "恐龍",
    "level": 6,
    "topic": "動物",
    "unit": "史前動物",
    "type": "名詞",
    "typeKey": "n",
    "description": "A huge animal that lived millions of years ago.",
    "emoji": "🦖",
    "stats": { "importance": 3 },
    "example": "Children love dinosaurs.",
    "related": ["reptile", "fossil", "prehistoric"]
  },
  {
    "id": "computer",
    "word": "computer",
    "nameZh": "電腦",
    "level": 6,
    "topic": "學校",
    "unit": "科技名詞",
    "type": "名詞",
    "typeKey": "n",
    "description": "A machine that helps you work and play online.",
    "emoji": "💻",
    "stats": { "importance": 5 },
    "example": "I study with my computer.",
    "related": ["laptop", "desktop", "screen"]
  },
  {
    "id": "astronaut",
    "word": "astronaut",
    "nameZh": "太空人",
    "level": 7,
    "topic": "自然",
    "unit": "太空",
    "type": "名詞",
    "typeKey": "n",
    "description": "A person who travels into space.",
    "emoji": "🔭",
    "stats": { "importance": 3 },
    "example": "The astronaut walks on the moon.",
    "related": ["space", "rocket", "planet"]
  },
  {
    "id": "dragon",
    "word": "dragon",
    "nameZh": "龍",
    "level": 8,
    "topic": "動物",
    "unit": "傳說生物",
    "type": "名詞",
    "typeKey": "n",
    "description": "A big magical animal in stories that can fly.",
    "emoji": "🐉",
    "stats": { "importance": 3 },
    "example": "The dragon breathes fire.",
    "related": ["myth", "fire", "wing"]
  }
];

let words = [];

// ===== 已學會（打勾）記憶 =====
const DONE_KEY = 'vocab-done';

function loadDoneSet() {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
}

let doneSet = loadDoneSet();

function saveDoneSet() {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(doneSet)));
  } catch (e) {}
}

// ===== 資料載入 =====
function loadWords() {
  words = WORDS_DATA;
  renderWords(words);
}

function typeClass(m) {
  return m.typeKey || '';
}

// ===== 渲染卡片 =====
function renderWords(list) {
  const grid = document.getElementById('wordGrid');

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>沒有符合條件的單字</p></div>';
    return;
  }

  grid.innerHTML = list.map(m => {
    const done = doneSet.has(m.id);
    return `
      <div class="word-card ${done ? 'done' : ''}" data-id="${m.id}" onclick="showDetail('${m.id}')">
        <button type="button" class="check-btn ${done ? 'checked' : ''}"
                onclick="toggleDone('${m.id}', event)"
                aria-pressed="${done}"
                aria-label="標記已學會">✓</button>
        <div class="image-wrapper">
          <span class="word-emoji">${m.emoji}</span>
        </div>
        <div class="info">
          <div class="word">${m.word}</div>
          <div class="word-zh">${m.nameZh}</div>
          <div class="meta">
            <span class="badge level">Lv.${m.level}</span>
            <span class="badge type ${typeClass(m)}">${m.type}</span>
            <span class="badge">${m.topic}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateProgress();
}

// ===== 打勾 / 取消打勾 =====
function toggleDone(id, event) {
  if (event) event.stopPropagation();
  if (doneSet.has(id)) {
    doneSet.delete(id);
  } else {
    doneSet.add(id);
  }
  saveDoneSet();
  applyFilters();
}

// ===== 進度條 =====
function updateProgress() {
  const total = words.length;
  const done = words.filter(m => doneSet.has(m.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `已學會 ${done} / ${total} 個單字`;

  const today = document.getElementById('todayCount');
  if (today) today.textContent = `${done}`;
}

// ===== 重設進度 =====
function resetProgress() {
  doneSet = new Set();
  saveDoneSet();
  applyFilters();
}

// ===== 詳情彈窗 =====
function showDetail(id) {
  const m = words.find(x => x.id === id);
  if (!m) return;

  const modal = document.getElementById('detailModal');
  const stars = '★'.repeat(m.stats.importance) + '☆'.repeat(5 - m.stats.importance);

  document.getElementById('detailBody').innerHTML = `
    <div class="modal-image">
      <span class="word-emoji modal-emoji">${m.emoji}</span>
    </div>
    <div class="modal-word">${m.word}</div>
    <div class="modal-word-zh">${m.nameZh} <span class="badge type ${typeClass(m)}" style="margin-left:6px">${m.type}</span></div>
    <div class="detail-row"><span class="label">難度</span><span class="value">Lv.${m.level}</span></div>
    <div class="detail-row"><span class="label">詞性</span><span class="value">${m.type}</span></div>
    <div class="detail-row"><span class="label">主題</span><span class="value">${m.topic}</span></div>
    <div class="detail-row"><span class="label">單元</span><span class="value">${m.unit}</span></div>
    <div class="detail-row"><span class="label">重要度</span><span class="value">${stars}</span></div>
    ${m.description ? `<div class="detail-row"><span class="label">英文定義</span><span class="value">${m.description}</span></div>` : ''}
    ${m.example ? `
      <div class="example-box">
        <h4>📖 例句</h4>
        <p>${m.example}</p>
      </div>
    ` : ''}
    ${m.related && m.related.length ? `
      <div class="related-box">
        <h4>🔗 相關詞</h4>
        <ul>${m.related.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    ` : ''}
  `;

  modal.classList.add('active');
}

function closeDetail() {
  document.getElementById('detailModal').classList.remove('active');
}

// ===== 篩選 =====
function applyFilters() {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const levelVal = document.getElementById('levelFilter').value;
  const typeVal = document.getElementById('typeFilter').value;
  const statusVal = document.getElementById('statusFilter').value;

  let filtered = words;

  if (keyword) {
    filtered = filtered.filter(m =>
      m.word.toLowerCase().includes(keyword) ||
      m.nameZh.includes(keyword) ||
      m.example.toLowerCase().includes(keyword)
    );
  }

  if (levelVal !== 'all') {
    const [min, max] = levelVal.split('-').map(Number);
    filtered = filtered.filter(m => m.level >= min && m.level <= max);
  }

  if (typeVal !== 'all') {
    filtered = filtered.filter(m => m.type === typeVal);
  }

  if (statusVal === 'done') {
    filtered = filtered.filter(m => doneSet.has(m.id));
  } else if (statusVal === 'undone') {
    filtered = filtered.filter(m => !doneSet.has(m.id));
  }

  renderWords(filtered);
}

// ===== 事件綁定 =====
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('levelFilter').addEventListener('change', applyFilters);
document.getElementById('typeFilter').addEventListener('change', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('resetBtn').addEventListener('click', resetProgress);

// 點擊 modal 背景關閉
document.addEventListener('click', (e) => {
  const modal = document.getElementById('detailModal');
  if (e.target === modal) closeDetail();
});

// ESC 關閉
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

// 初始載入
loadWords();