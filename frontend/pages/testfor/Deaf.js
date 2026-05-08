/* =========================================================
   KahoSound — Deaf.js (FIXED VERSION)
   ========================================================= */


// ╔══════════════════════════════════════════════════════╗
// ║  ТЕМЫ И ВОПРОСЫ                                     ║
// ╚══════════════════════════════════════════════════════╝
const TOPICS = [
  {
    id: 'sound',
    name: 'Физика звука',
    icon: '🔊',
    color: '#e63950',
    winGif: 'examples/sound and images/Папка.gif',
    winSound: null,

    questions: [
      {
        text: 'Какая нота соответствует частоте ~440 Гц?',
        answers: ['До', 'Ля', 'Соль', 'Ми'],
        correct: 1
      },

      {
        text: 'Что такое «тон»?',
        answers: ['Амплитуда', 'Скорость', 'Частота', 'Длина волны'],
        correct: 2
      },

      {
        text: 'Диапазон слуха человека?',
        answers: ['20–20000', '1–100', '100–5000', '500–50000'],
        correct: 0
      },

      {
        text: 'Чем выше частота — звук...',
        answers: ['Тише', 'Громче', 'Ниже', 'Выше'],
        correct: 3
      },

      {
        text: 'Сколько октав у пианино?',
        answers: ['5', '6', '7', '8'],
        correct: 2
      }
    ]
  }
];


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// СТИЛИ ТАБЛИЧЕК
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TILE_TONES = [300, 400, 500, 600];

const TILE_CLASSES = [
  'tile-red',
  'tile-blue',
  'tile-yellow',
  'tile-green'
];

const TILE_ICONS = [
  '▲',
  '◆',
  '●',
  '■'
];


// ╔══════════════════════════════════════════════════════╗
// ║  СОСТОЯНИЕ                                          ║
// ╚══════════════════════════════════════════════════════╝
let audioCtx = null;

let currentTopic = null;
let currentQ = 0;
let score = 0;
let answered = false;


// A11y
const a11yState = {
  fontSize: 18,
  fontMin: 14,
  fontMax: 32,
  highContrast: false,
  wideSpacing: false,
  hoverSpeak: false
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  buildStartCards();
  initA11y();
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildSidebar() {

  const nav = document.getElementById('sidebar-nav');

  if (!nav) return;

  nav.innerHTML = '';

  TOPICS.forEach(topic => {

    const el = document.createElement('div');

    el.className = 'nav-item';
    el.id = 'nav-' + topic.id;

    el.innerHTML = `
      <span>${topic.icon}</span>
      <span>${topic.name}</span>
    `;

    el.onclick = () => startTopic(topic.id);

    nav.appendChild(el);
  });
}


function buildStartCards() {

  const wrap = document.getElementById('start-topics-preview');

  if (!wrap) return;

  wrap.innerHTML = '';

  TOPICS.forEach(topic => {

    const card = document.createElement('div');

    card.className = 'topic-card';

    card.innerHTML = `
      <div class="topic-card-icon">${topic.icon}</div>
      <div class="topic-card-title">${topic.name}</div>
    `;

    card.onclick = () => startTopic(topic.id);

    wrap.appendChild(card);
  });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ЭКРАНЫ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showScreen(id) {

  document.querySelectorAll('.screen')
    .forEach(el => el.classList.remove('active'));

  document.getElementById(id)
    .classList.add('active');
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUIZ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function startTopic(id) {

  currentTopic = TOPICS.find(t => t.id === id);

  if (!currentTopic) return;

  currentQ = 0;
  score = 0;
  answered = false;

  document.getElementById('score-display').textContent = score;
  document.getElementById('q-topic-badge').textContent = currentTopic.name;

  showScreen('screen-question');

  renderQuestion();
}


function renderQuestion() {

  const q = currentTopic.questions[currentQ];

  // вопрос
  const qText = document.getElementById('q-text');

  if (qText) {
    qText.textContent = q.text;
  }

  // счетчик
  document.getElementById('q-counter').textContent =
    `${currentQ + 1} / ${currentTopic.questions.length}`;

  // прогресс
  const progress =
    ((currentQ + 1) / currentTopic.questions.length) * 100;

  document.getElementById('progress-fill').style.width =
    progress + '%';

  // ответы
  const grid = document.getElementById('answers-grid');

  grid.innerHTML = '';

  q.answers.forEach((answer, index) => {

    const btn = document.createElement('button');

    btn.className =
      `answer-tile ${TILE_CLASSES[index % TILE_CLASSES.length]}`;

    btn.innerHTML = `
      <span class="tile-icon">
        ${TILE_ICONS[index]}
      </span>

      <span class="tile-text">
        ${answer}
      </span>
    `;

    // звук при наведении
    btn.addEventListener('mouseenter', () => {
      playTone(TILE_TONES[index], 0.15);
    });

    // выбор
    btn.onclick = () => selectAnswer(index);

    grid.appendChild(btn);
  });

  answered = false;
}


function selectAnswer(idx) {

  if (answered) return;

  answered = true;

  const q = currentTopic.questions[currentQ];

  const buttons =
    document.querySelectorAll('.answer-tile');

  buttons.forEach(btn => btn.disabled = true);

  // ПРАВИЛЬНО
  if (idx === q.correct) {

    score += 100;

    document.getElementById('score-display')
      .textContent = score;

    buttons[idx].classList.add('correct');

    playCorrectSound();

    setTimeout(() => {

      currentQ++;

      if (currentQ >= currentTopic.questions.length) {

        showResult();

      } else {

        renderQuestion();
      }

    }, 800);

  }

  // НЕПРАВИЛЬНО
  else {

    buttons[idx].classList.add('wrong');

    buttons[q.correct].classList.add('correct');

    playWrongSound();

    const msg =
      document.getElementById('wrong-msg');

    msg.style.display = 'block';

    setTimeout(() => {
      msg.style.display = 'none';
    }, 1200);

    setTimeout(() => {

      currentQ++;

      if (currentQ >= currentTopic.questions.length) {

        showResult();

      } else {

        renderQuestion();
      }

    }, 1200);
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESULT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showResult() {

  showScreen('screen-result');

  document.getElementById('final-score')
    .textContent = score;

  const resultTitle =
    document.getElementById('result-title');

  const resultSub =
    document.getElementById('result-sub');

  const resultEmoji =
    document.getElementById('result-emoji');

  if (score >= 400) {

    resultTitle.textContent = 'Идеально!';
    resultSub.textContent =
      'Ты отлично разбираешься в звуке 🎵';

    resultEmoji.textContent = '🏆';

  } else if (score >= 300) {

    resultTitle.textContent = 'Очень хорошо!';
    resultSub.textContent =
      'Почти идеальный результат ✨';

    resultEmoji.textContent = '🎉';

  } else {

    resultTitle.textContent = 'Квиз завершён!';
    resultSub.textContent =
      'Попробуй пройти ещё раз 🚀';

    resultEmoji.textContent = '🎵';
  }

  spawnConfetti();
}


function goHome() {

  showScreen('screen-start');
}


function restartCurrentTopic() {

  if (!currentTopic) return;

  startTopic(currentTopic.id);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getAudioCtx() {

  if (!audioCtx) {

    audioCtx =
      new (window.AudioContext ||
      window.webkitAudioContext)();
  }

  return audioCtx;
}


function playTone(hz, duration = 0.5) {

  const ctx = getAudioCtx();

  const osc =
    ctx.createOscillator();

  const gain =
    ctx.createGain();

  osc.type = 'sine';

  osc.frequency.value = hz;

  gain.gain.value = 0.18;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  osc.stop(ctx.currentTime + duration);
}


function playCorrectSound() {

  playTone(700, 0.12);

  setTimeout(() => {
    playTone(900, 0.12);
  }, 120);
}


function playWrongSound() {

  playTone(220, 0.25);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// A11Y
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initA11y() {

  const up =
    document.getElementById('btn-font-up');

  const down =
    document.getElementById('btn-font-down');

  if (up)
    up.onclick = () => changeFontSize(2);

  if (down)
    down.onclick = () => changeFontSize(-2);

  setupToggle(
    'btn-contrast',
    'highContrast',
    'high-contrast'
  );

  setupToggle(
    'btn-spacing',
    'wideSpacing',
    'wide-spacing'
  );

  setupToggle(
    'btn-hover-speak',
    'hoverSpeak',
    'hover-speak-mode'
  );
}


function changeFontSize(delta) {

  const newSize = Math.max(
    a11yState.fontMin,
    Math.min(
      a11yState.fontMax,
      a11yState.fontSize + delta
    )
  );

  a11yState.fontSize = newSize;

  document.documentElement.style.fontSize =
    newSize + 'px';

  announce(`Размер текста ${newSize}`);
}


function setupToggle(btnId, stateKey, className) {

  const btn = document.getElementById(btnId);

  if (!btn) return;

  btn.onclick = () => {

    a11yState[stateKey] =
      !a11yState[stateKey];

    document.body.classList.toggle(
      className,
      a11yState[stateKey]
    );

    btn.setAttribute(
      'aria-pressed',
      a11yState[stateKey]
    );

    announce(
      a11yState[stateKey]
        ? 'Включено'
        : 'Выключено'
    );
  };
}


function announce(msg) {

  const el =
    document.getElementById('sr-announcer');

  if (!el) return;

  el.textContent = '';

  setTimeout(() => {
    el.textContent = msg;
  }, 50);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFETTI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function spawnConfetti() {

  const layer =
    document.getElementById('confetti-layer');

  if (!layer) return;

  layer.innerHTML = '';

  for (let i = 0; i < 60; i++) {

    const el =
      document.createElement('div');

    el.className = 'confetti-piece';

    el.style.left =
      Math.random() * 100 + 'vw';

    el.style.animationDelay =
      Math.random() * 2 + 's';

    layer.appendChild(el);
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDEBAR MOBILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function toggleSidebar() {

  document.getElementById('sidebar')
    .classList.toggle('open');

  document.getElementById('sidebar-overlay')
    .classList.toggle('show');
}