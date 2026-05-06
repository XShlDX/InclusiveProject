/* =========================================================
   KahoSound — script.js
   =========================================================

   ╔══════════════════════════════════════════════════════╗
   ║  КАК НАСТРОИТЬ ПОД СЕБЯ                             ║
   ╠══════════════════════════════════════════════════════╣
   ║  1. Добавь темы в массив TOPICS                      ║
   ║  2. Каждая тема — объект:                            ║
   ║     {                                                ║
   ║       id:      'unique-id',                          ║
   ║       name:    'Название темы',                      ║
   ║       icon:    '🎵',   // эмодзи                    ║
   ║       color:   '#e63950',  // цвет в меню            ║
   ║       winGif:  'win.gif',  // GIF для финала         ║
   ║       winSound: 220,       // частота победного звука║
   ║       questions: [ ... ]   // вопросы (см. ниже)     ║
   ║     }                                                ║
   ║                                                      ║
   ║  3. Каждый вопрос:                                   ║
   ║     {                                                ║
   ║       text:    'Текст вопроса?',                     ║
   ║       answers: ['A','B','C','D'],                    ║
   ║       correct: 0   // индекс правильного (0-3)       ║
   ║     }                                                ║
   ║                                                      ║
   ║  4. Тона при наведении задаются в TILE_TONES (Hz):   ║
   ║     [верхний-лев, верхний-прав, нижний-лев, нижн-пр] ║
   ║                                                      ║
   ║  5. GIF победы: положи файл рядом с index.html       ║
   ║     и укажи имя в поле winGif у нужной темы          ║
   ║                                                      ║
   ║  6. Звук победы: укажи частоту (Hz) в winSound       ║
   ║     или оставь null для звука по умолчанию           ║
   ╚══════════════════════════════════════════════════════╝
   ========================================================= */


// ╔══════════════════════════════════════════════════════╗
// ║  ТЕМЫ И ВОПРОСЫ — РЕДАКТИРУЙ ЗДЕСЬ                  ║
// ╚══════════════════════════════════════════════════════╝
const TOPICS = [
  {
    id:       'sound',
    name:     'Физика звука',
    icon:     '🔊',
    color:    '#e63950',
    winGif:   'examples/sound and images/Папка.gif',
    winSound: null,                // ← null = дефолтный звук | число Hz = свой тон
    questions: [
      {
        text:    'Какая нота соответствует частоте ~440 Гц?',
        answers: ['До (C)', 'Ля (A)', 'Соль (G)', 'Ми (E)'],
        correct: 1
      },
      {
        text:    'Что такое «тон» в физике звука?',
        answers: [
          'Амплитуда колебаний',
          'Скорость звука в воздухе',
          'Частота звуковых колебаний',
          'Длина звуковой волны'
        ],
        correct: 2
      },
      {
        text:    'Какой диапазон звука слышит человек?',
        answers: ['20 Гц — 20 000 Гц','1 Гц — 100 Гц','100 — 5 000 Гц','500 — 50 000 Гц'],
        correct: 0
      },
      {
        text:    'Чем выше частота — тем звук...',
        answers: ['Тише','Громче','Ниже по тону','Выше по тону'],
        correct: 3
      },
      {
        text:    'Сколько октав охватывает стандартное фортепиано?',
        answers: ['5','6','7','8'],
        correct: 2
      }
    ]
  },
  {
    id:       'music',
    name:     'Музыкальная теория',
    icon:     '🎼',
    color:    '#1368ce',
    winGif:   'examples/sound and images/Папка.gif',
    winSound: null,
    questions: [
      {
        text:    'Сколько нот в октаве?',
        answers: ['5','7','12','8'],
        correct: 2
      },
      {
        text:    'Что такое темп в музыке?',
        answers: [
          'Высота звука',
          'Скорость исполнения',
          'Громкость произведения',
          'Тональность'
        ],
        correct: 1
      },
      {
        text:    'Что означает «forte» (f) в нотах?',
        answers: ['Тихо','Быстро','Громко','Медленно'],
        correct: 2
      },
      {
        text:    'Из скольких полутонов состоит октава?',
        answers: ['7','10','12','8'],
        correct: 2
      },
      {
        text:    'Какой размер означает 3/4?',
        answers: [
          'Четыре четверти в такте',
          'Три четверти в такте',
          'Три восьмых в такте',
          'Шесть восьмых в такте'
        ],
        correct: 1
      }
    ]
  },
  {
    id:       'instruments',
    name:     'Инструменты',
    icon:     '🎸',
    color:    '#218c21',
    winGif:   'examples/sound and images/Папка.gif',
    winSound: null,
    questions: [
      {
        text:    'Какой инструмент является струнно-смычковым?',
        answers: ['Труба','Скрипка','Флейта','Барабан'],
        correct: 1
      },
      {
        text:    'Сколько струн у классической гитары?',
        answers: ['4','5','6','7'],
        correct: 2
      },
      {
        text:    'Какой инструмент относится к ударным?',
        answers: ['Виолончель','Кларнет','Литавра','Арфа'],
        correct: 2
      },
      {
        text:    'Что такое мундштук?',
        answers: [
          'Часть струнного инструмента',
          'Деталь духового инструмента',
          'Тип ударной палочки',
          'Тип смычка'
        ],
        correct: 1
      },
      {
        text:    'Пианино относится к какой группе?',
        answers: ['Струнные','Ударные','Духовые','Ударно-клавишные'],
        correct: 3
      }
    ]
  },
  {
    id:       'history',
    name:     'История музыки',
    icon:     '📜',
    color:    '#d89e00',
    winGif:   'examples/sound and images/Папка.gif',
    winSound: null,
    questions: [
      {
        text:    'В каком веке жил Иоганн Себастьян Бах?',
        answers: ['XVI','XVII','XVIII','XIX'],
        correct: 2
      },
      {
        text:    'В какой стране родился Моцарт?',
        answers: ['Германия','Австрия','Италия','Франция'],
        correct: 1
      },
      {
        text:    'Как называется форма музыкального произведения Бетховена op. 27 №2?',
        answers: ['Лунная соната','Патетическая соната','Апассионата','К Элизе'],
        correct: 0
      },
      {
        text:    'Кто написал оперу «Кармен»?',
        answers: ['Верди','Пуччини','Бизе','Вагнер'],
        correct: 2
      },
      {
        text:    'Что такое «Эпоха барокко» в музыке?',
        answers: [
          'XVII — середина XVIII века',
          'XV — XVI век',
          'XIX век',
          'XX век'
        ],
        correct: 0
      }
    ]
  }
];


// ╔══════════════════════════════════════════════════════╗
// ║  ТОНА ПРИ НАВЕДЕНИИ (Hz) — по позиции тайла         ║
// ║  [верхний-лев, верхний-прав, нижний-лев, нижн-прав] ║
// ╚══════════════════════════════════════════════════════╝
const TILE_TONES = [300, 400, 500, 600];

// Стили тайлов (по порядку: 0,1,2,3)
const TILE_CLASSES = ['tile-red','tile-blue','tile-yellow','tile-green'];
const TILE_ICONS   = ['▲','◆','●','■'];


// ╔══════════════════════════════════════════════════════╗
// ║  ВНУТРЕННЕЕ СОСТОЯНИЕ                               ║
// ╚══════════════════════════════════════════════════════╝
let audioCtx      = null;
let currentTopic  = null;
let currentQ      = 0;
let score         = 0;
let answered      = false;
let donTopics     = new Set();


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildStartCards();
});

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  TOPICS.forEach(topic => {
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.id = 'nav-' + topic.id;
    el.innerHTML = `
      <span class="nav-item-icon">${topic.icon}</span>
      <span class="nav-item-info">
        <span class="nav-item-name">${topic.name}</span>
        <span class="nav-item-count">${topic.questions.length} вопросов</span>
      </span>
      <span class="nav-item-check">✅</span>
    `;
    el.style.setProperty('--topic-color', topic.color);
    el.addEventListener('click', () => {
      closeSidebar();
      startTopic(topic.id);
    });
    nav.appendChild(el);
  });
}

function buildStartCards() {
  const wrap = document.getElementById('start-topics-preview');
  wrap.innerHTML = '';
  TOPICS.forEach(topic => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.id = 'card-' + topic.id;
    card.style.borderColor = topic.color + '55';
    card.style.background = `linear-gradient(135deg, ${topic.color}18, ${topic.color}08)`;
    card.innerHTML = `
      <span class="topic-card-icon">${topic.icon}</span>
      <span class="topic-card-name">${topic.name}</span>
      <span class="topic-card-count">${topic.questions.length} вопр.</span>
    `;
    card.addEventListener('click', () => startTopic(topic.id));
    wrap.appendChild(card);
  });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SIDEBAR TOGGLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  QUIZ FLOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function startTopic(id) {
  currentTopic = TOPICS.find(t => t.id === id);
  if (!currentTopic) return;
  currentQ = 0;
  score    = 0;
  answered = false;

  // mark active in sidebar
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');

  renderQuestion();
  showScreen('screen-question');
}

function renderQuestion() {
  answered = false;
  const q     = currentTopic.questions[currentQ];
  const total = currentTopic.questions.length;
  const pct   = (currentQ / total) * 100;

  document.getElementById('q-topic-badge').textContent    = currentTopic.name;
  document.getElementById('q-counter').textContent        = `${currentQ + 1} / ${total}`;
  document.getElementById('score-display').textContent    = score;
  document.getElementById('progress-fill').style.width   = pct + '%';
  document.getElementById('q-text').textContent           = q.text;
  document.getElementById('wrong-msg').classList.remove('show');

  const grid = document.getElementById('answers-grid');
  grid.innerHTML = '';
  q.answers.forEach((text, idx) => {
    const tile = document.createElement('div');
    tile.className = `answer-tile ${TILE_CLASSES[idx]}`;
    tile.dataset.idx = idx;
    tile.innerHTML = `
      <span class="tile-icon">${TILE_ICONS[idx]}</span>
      <span class="tile-text">${text}</span>
    `;
    tile.addEventListener('mouseenter', () => { if (!answered) playTone(TILE_TONES[idx], .5); });
    tile.addEventListener('touchstart', ()  => { if (!answered) playTone(TILE_TONES[idx], .4); }, { passive: true });
    tile.addEventListener('click', () => selectAnswer(idx));
    grid.appendChild(tile);
  });
}

function selectAnswer(idx) {
  if (answered) return;
  const q     = currentTopic.questions[currentQ];
  const tiles = document.querySelectorAll('.answer-tile');

  if (idx === q.correct) {
    answered = true;
    tiles[idx].classList.add('correct');
    playCorrectSound();
    score += 100;
    document.getElementById('score-display').textContent = score;
    tiles.forEach((t, i) => { if (i !== idx) t.classList.add('disabled'); });

    setTimeout(() => {
      currentQ++;
      if (currentQ < currentTopic.questions.length) {
        renderQuestion();
      } else {
        showResult();
      }
    }, 1100);

  } else {
    tiles[idx].classList.add('wrong');
    playWrongSound();
    const msg = document.getElementById('wrong-msg');
    msg.classList.add('show');
    setTimeout(() => {
      tiles[idx].classList.remove('wrong');
      msg.classList.remove('show');
    }, 700);
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RESULT SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showResult() {
  const maxScore = currentTopic.questions.length * 100;
  const pct      = score / maxScore;

  let emoji, sub;
  if (pct === 1)       { emoji = '🏆'; sub = 'Идеальный результат!'; }
  else if (pct >= .8)  { emoji = '🎉'; sub = 'Отличная работа!'; }
  else if (pct >= .5)  { emoji = '👍'; sub = 'Хороший результат!'; }
  else                 { emoji = '📚'; sub = 'Стоит повторить материал.'; }

  document.getElementById('result-emoji').textContent   = emoji;
  document.getElementById('final-score').textContent    = score;
  document.getElementById('result-sub').textContent     = sub;
  document.getElementById('result-title').textContent   = `«${currentTopic.name}» пройдена!`;

  // ── GIF победы ──
  const gifEl = document.getElementById('result-gif');
  if (currentTopic.winGif) {
    // перезапускаем GIF (добавляем timestamp чтобы браузер не кэшировал)
    gifEl.src = currentTopic.winGif + '?t=' + Date.now();
    gifEl.style.display = 'block';
    document.getElementById('result-gif-wrap').style.display = 'block';
  } else {
    gifEl.style.display = 'none';
    document.getElementById('result-gif-wrap').style.display = 'none';
  }

  // ── Звук победы ──
  if (currentTopic.winSound !== null && currentTopic.winSound !== undefined) {
    playWinTone(currentTopic.winSound);
  } else {
    playVictoryFanfare();
  }

  // пометить тему как пройденную
  donTopics.add(currentTopic.id);
  markDone(currentTopic.id);

  showScreen('screen-result');
  spawnConfetti();
}

function markDone(id) {
  const navEl  = document.getElementById('nav-' + id);
  const cardEl = document.getElementById('card-' + id);
  if (navEl)  navEl.classList.add('done');
  if (cardEl) cardEl.classList.add('done');
}

function restartCurrentTopic() {
  if (currentTopic) startTopic(currentTopic.id);
}

function goHome() {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  currentTopic = null;
  showScreen('screen-start');
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ЭКРАНЫ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  АУДИО
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/** Базовый синусоидальный тон */
function playTone(hz, duration = 0.5) {
  const ctx  = getAudioCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
}

/** Правильный ответ — восходящие три ноты */
function playCorrectSound() {
  const ctx = getAudioCtx();
  [523, 659, 784].forEach((hz, i) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.18, ctx.currentTime + i * .12);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * .12 + .18);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * .12); osc.stop(ctx.currentTime + i * .12 + .22);
  });
}

/** Неверный ответ */
function playWrongSound() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = 180;
  gain.gain.setValueAtTime(0.14, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + .3);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .3);
}

/**
 * Победный тон из настройки темы (winSound = число Hz).
 * Играет долгий нарастающий тон.
 */
function playWinTone(hz) {
  const ctx = getAudioCtx();
  [hz, hz * 1.25, hz * 1.5, hz * 2].forEach((f, i) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = f;
    const t = ctx.currentTime + i * .2;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + .05);
    gain.gain.linearRampToValueAtTime(0, t + .5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + .6);
  });
}

/** Дефолтный фанфар победы (когда winSound = null) */
function playVictoryFanfare() {
  const ctx = getAudioCtx();
  const melody = [
    { hz: 523, t: 0.0  },
    { hz: 659, t: 0.15 },
    { hz: 784, t: 0.30 },
    { hz: 1047,t: 0.45 },
    { hz: 784, t: 0.65 },
    { hz: 1047,t: 0.80 }
  ];
  melody.forEach(({ hz, t }) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = hz;
    const start = ctx.currentTime + t;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + .04);
    gain.gain.linearRampToValueAtTime(0, start + .18);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + .22);
  });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  КОНФЕТТИ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function spawnConfetti() {
  const layer  = document.getElementById('confetti-layer');
  const colors = ['#ffcc02','#ff5c75','#2196f3','#3dc93d','#ff8c00','#e040fb','#00e5ff'];
  layer.innerHTML = '';
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 7 + Math.random() * 10;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      animation-duration: ${1.4 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 1.4}s;
    `;
    layer.appendChild(el);
  }
}