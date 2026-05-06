/* =========================================================
   KahoSound — script.js
   =========================================================
   КАК ДОБАВИТЬ СВОЙ ВОПРОС:
   Скопируй объект в массив QUESTIONS ниже.
   {
     text:    "Текст вопроса",
     answers: ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
     correct: 0   // индекс правильного ответа (0-3)
   }
   Тона (Hz) назначаются автоматически по позиции:
     0 = верхний-левый  = 300 Hz
     1 = верхний-правый = 400 Hz
     2 = нижний-левый   = 500 Hz
     3 = нижний-правый  = 600 Hz
   ========================================================= */

// ── ВОПРОСЫ ─────────────────────────────────────────────
const QUESTIONS = [
  {
    text: "Какая нота соответствует частоте ~440 Гц?",
    answers: ["До (C)", "Ля (A)", "Соль (G)", "Ми (E)"],
    correct: 1
  },
  {
    text: "Сколько октав охватывает стандартное фортепиано?",
    answers: ["5 октав", "6 октав", "7 октав", "8 октав"],
    correct: 2
  },
  {
    text: "Что такое «тон» в физике звука?",
    answers: [
      "Амплитуда колебаний",
      "Скорость звука в воздухе",
      "Частота звуковых колебаний",
      "Длина звуковой волны"
    ],
    correct: 2
  },
  {
    text: "Какой диапазон звука слышит человек?",
    answers: ["20 Гц — 20 000 Гц", "1 Гц — 100 Гц", "100 — 5 000 Гц", "500 — 50 000 Гц"],
    correct: 0
  },
  {
    text: "Чем выше частота звука — тем он...",
    answers: ["Тише", "Громче", "Ниже по тону", "Выше по тону"],
    correct: 3
  }
];

// ── ТОНА ДЛЯ КАЖДОЙ ПОЗИЦИИ ──────────────────────────────
//   0 = верхний-левый  | 1 = верхний-правый
//   2 = нижний-левый   | 3 = нижний-правый
const TILE_TONES = [300, 400, 500, 600]; // Hz

// ── СТИЛИ ТАЙЛОВ ─────────────────────────────────────────
const TILE_CLASSES = ['tile-red', 'tile-blue', 'tile-yellow', 'tile-green'];
const TILE_ICONS   = ['▲', '◆', '●', '■'];

// ── СОСТОЯНИЕ ────────────────────────────────────────────
let audioCtx   = null;
let currentQ   = 0;
let score      = 0;
let answered   = false;

// ── АУДИО ────────────────────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Воспроизвести тон заданной частоты.
 * @param {number} hz      - частота в герцах
 * @param {number} duration - длительность в секундах
 */
function playTone(hz, duration = 0.5) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Короткий звук «правильно» */
function playCorrectSound() {
  const ctx = getAudioCtx();
  [523, 659, 784].forEach((hz, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.2);
  });
}

/** Короткий звук «неверно» */
function playWrongSound() {
  const ctx = getAudioCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 180;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// ── ЭКРАНЫ ───────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── КВИЗ ─────────────────────────────────────────────────
function startQuiz() {
  currentQ = 0;
  score    = 0;
  renderQuestion();
  showScreen('screen-question');
}

function renderQuestion() {
  answered = false;

  const q       = QUESTIONS[currentQ];
  const total   = QUESTIONS.length;
  const pct     = (currentQ / total) * 100;

  // заголовок
  document.getElementById('q-counter').textContent = `Вопрос ${currentQ + 1} / ${total}`;
  document.getElementById('score-display').textContent = score;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('wrong-msg').classList.remove('show');

  // текст вопроса
  document.getElementById('q-text').textContent = q.text;

  // генерируем тайлы
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

    // тон при наведении
    tile.addEventListener('mouseenter', () => {
      if (!answered) playTone(TILE_TONES[idx], 0.5);
    });
    // тон при тач (мобильные)
    tile.addEventListener('touchstart', (e) => {
      if (!answered) playTone(TILE_TONES[idx], 0.4);
    }, { passive: true });

    tile.addEventListener('click', () => selectAnswer(idx));
    grid.appendChild(tile);
  });
}

function selectAnswer(idx) {
  if (answered) return;

  const q     = QUESTIONS[currentQ];
  const tiles = document.querySelectorAll('.answer-tile');

  if (idx === q.correct) {
    // ── ПРАВИЛЬНО ──
    answered = true;
    tiles[idx].classList.add('correct');
    playCorrectSound();

    // очки: 100 за ответ
    score += 100;
    document.getElementById('score-display').textContent = score;

    // блокируем остальные
    tiles.forEach((t, i) => { if (i !== idx) t.classList.add('disabled'); });

    // переход к следующему
    setTimeout(() => {
      currentQ++;
      if (currentQ < QUESTIONS.length) {
        renderQuestion();
      } else {
        showResult();
      }
    }, 1200);

  } else {
    // ── НЕВЕРНО ──
    tiles[idx].classList.add('wrong');
    playWrongSound();

    const wrongMsg = document.getElementById('wrong-msg');
    wrongMsg.classList.add('show');

    // сбрасываем анимацию через 600ms чтобы можно было кликнуть снова
    setTimeout(() => {
      tiles[idx].classList.remove('wrong');
      wrongMsg.classList.remove('show');
    }, 700);
  }
}

// ── РЕЗУЛЬТАТ ────────────────────────────────────────────
function showResult() {
  const maxScore = QUESTIONS.length * 100;
  const pct      = score / maxScore;

  let emoji, sub;
  if (pct === 1)      { emoji = '🏆'; sub = 'Идеальный результат!'; }
  else if (pct >= .8) { emoji = '🎉'; sub = 'Отличная работа!'; }
  else if (pct >= .5) { emoji = '👍'; sub = 'Хороший результат!'; }
  else                { emoji = '📚'; sub = 'Стоит повторить материал.'; }

  document.getElementById('result-emoji').textContent  = emoji;
  document.getElementById('final-score').textContent   = score;
  document.getElementById('result-sub').textContent    = sub;

  showScreen('screen-result');
  spawnConfetti();
}

function restartQuiz() {
  document.getElementById('confetti-layer').innerHTML = '';
  showScreen('screen-start');
}

// ── КОНФЕТТИ ─────────────────────────────────────────────
function spawnConfetti() {
  const layer  = document.getElementById('confetti-layer');
  const colors = ['#ffcc02','#ff5858','#2196f3','#46ad28','#ff8c00','#e040fb'];
  layer.innerHTML = '';

  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left            = Math.random() * 100 + 'vw';
    el.style.background      = colors[Math.floor(Math.random() * colors.length)];
    el.style.width           = (6 + Math.random() * 10) + 'px';
    el.style.height          = (6 + Math.random() * 10) + 'px';
    el.style.borderRadius    = Math.random() > .5 ? '50%' : '2px';
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay    = (Math.random() * 1.2) + 's';
    layer.appendChild(el);
  }
}