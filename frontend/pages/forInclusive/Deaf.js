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
        text: 'Какой орган человека отвечает за восприятие звука?',
        answers: ['Глаз', 'Ухо', 'Нос', 'Язык'],
        correct: 1
      },

      {
        text: 'Что такое «тон»?',
        answers: ['Амплитуда', 'Скорость', 'Частота', 'Длина волны'],
        correct: 2
      },

      {
        text: 'Сколько октав у пианино?',
        answers: ['5', '6', '7', '8'],
        correct: 2
      }
    ]
  },
  {
    id: 'instruments', // Уникальный ID темы (на английском, без пробелов)
    name: 'Инструменты', // Название, которое будет в меню
    icon: '🎸',          // Эмодзи для карточки
    color: '#4caf50',    // Цвет (опционально, если используется в стилях)
    winGif: null,
    winSound: null,

    questions: [
      {
        text: 'Сколько струн у классической гитары?',
        answers: ['4', '5', '6', '7'],
        correct: 2 // Ответ "6"
      },
      {
        text: 'Какой инструмент самый большой в симфоническом оркестре?',
        answers: ['Виолончель', 'Контрабас', 'Арфа', 'Туба'],
        correct: 1 // Ответ "Контрабас"
      },
      {
        text: 'Какой из этих инструментов является ударным?',
        answers: ['Флейта', 'Тромбон', 'Барабан', 'Кларнет'],
        correct: 2 // Ответ "Барабан"
      },
      {
        text: 'Какой инструмент использует смычок?',
        answers: ['Скрипка', 'Гитара', 'Труба', 'Фортепиано'],
        correct: 0 // Ответ "Скрипка"
      }
    ]
  },
  {
    id: 'computers',
    name: 'Компьютеры', 
    icon: '💻',          
    color: '#5e087a',   
    winGif: null,
    winSound: null,

    questions: [
      {
        text: 'Первый компьютер Apple?',
        answers: ['IBM 6070', 'Macintosh', 'Apple II', 'Macbook M2'],
        correct: 1
      },
      {
        text: 'Основатель Facebook?',
        answers: ['Марк Цукерберг', 'Элон Маск', 'Билл Гейтс', 'Стив Джобс'],
        correct: 0 // Ответ "Марк Цукерберг"
      },
      {
        text: 'Какой язык программирования самый популярный в 2024 году?',
        answers: ['Python', 'JavaScript', 'Java', 'C#'],
        correct: 1 // Ответ "JavaScript"
      },
      {
        text: 'Какой из этих процессоров самый мощный?',
        answers: ['Intel Core i9-13900K', 'AMD Ryzen 9 7950X', 'Apple M2 Max', 'NVIDIA Grace'], 
        correct: 2 // Ответ "Apple M2 Max"
      }
    ]
  },
  {
    id: 'space',
    name: 'Космос',
    icon: '🚀',
    color: '#1d3557',
    winGif: null,
    winSound: null,

    questions: [
      {
        text: 'Какая планета самая большая в Солнечной системе?',
        answers: ['Земля', 'Марс', 'Юпитер', 'Сатурн'],
        correct: 2 // Ответ "Юпитер"
      },
      {
        text: 'Какая планета самая близкая к Солнцу?',
        answers: ['Венера', 'Меркурий', 'Земля', 'Марс'],
        correct: 1 // Ответ "Меркурий"
      },
      {
        text: 'Какой космический аппарат первым достиг поверхности Луны?',
        answers: ['Аполлон-11', 'Луноход-1', 'Спутник-1', 'Восток-1'],
        correct: 0 // Ответ "Аполлон-11"
      },
      {
        text: 'Сколько спутников у планеты Нептун?',
        answers: ['13', '14', '15', '16'],
        correct: 2 // Ответ "15"
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
  fontStep: 2,
  highContrast: false,
  wideSpacing: false,
  hoverSpeak: false,
  voiceRead: false,
  micActive: false
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
  loadA11yState();
  applyFontSize();
  applyContrast();
  applySpacing();

  bindClick('btn-font-up', increaseFontSize);
  bindClick('btn-font-down', decreaseFontSize);
  bindClick('btn-contrast', toggleContrast);
  bindClick('btn-spacing', toggleSpacing);
  bindClick('btn-hover-speak', toggleHoverSpeak);
  bindClick('btn-voice', toggleSpeech);
  bindClick('btn-mic', toggleMic);

  document.addEventListener('keydown', handleA11yShortcut);
  announce('Инклюзивный режим загружен. Используйте Tab для навигации.');
}

function bindClick(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

function saveA11yState() {
  sessionStorage.setItem('kahosound-a11y', JSON.stringify({
    fontSize: a11yState.fontSize,
    highContrast: a11yState.highContrast,
    wideSpacing: a11yState.wideSpacing
  }));
}

function loadA11yState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('kahosound-a11y') || '{}');
    if (saved.fontSize) a11yState.fontSize = saved.fontSize;
    if (saved.highContrast) a11yState.highContrast = saved.highContrast;
    if (saved.wideSpacing) a11yState.wideSpacing = saved.wideSpacing;
  } catch (_) {}
}

function applyFontSize() {
  document.documentElement.style.setProperty('--font-base', a11yState.fontSize + 'px');
  document.documentElement.style.fontSize = a11yState.fontSize + 'px';
  document.body.style.fontSize = a11yState.fontSize + 'px';
}

function increaseFontSize() {
  if (a11yState.fontSize >= a11yState.fontMax) {
    announce('Максимальный размер текста достигнут');
    return;
  }

  a11yState.fontSize = Math.min(a11yState.fontMax, a11yState.fontSize + a11yState.fontStep);
  applyFontSize();
  saveA11yState();
  announce(`Размер текста увеличен до ${a11yState.fontSize} пикселей`);
}

function decreaseFontSize() {
  if (a11yState.fontSize <= a11yState.fontMin) {
    announce('Минимальный размер текста достигнут');
    return;
  }

  a11yState.fontSize = Math.max(a11yState.fontMin, a11yState.fontSize - a11yState.fontStep);
  applyFontSize();
  saveA11yState();
  announce(`Размер текста уменьшен до ${a11yState.fontSize} пикселей`);
}

function applyContrast() {
  document.body.classList.toggle('high-contrast', a11yState.highContrast);
  setPressed('btn-contrast', a11yState.highContrast);
}

function toggleContrast() {
  a11yState.highContrast = !a11yState.highContrast;
  applyContrast();
  saveA11yState();
  announce(a11yState.highContrast ? 'Высокий контраст включён' : 'Высокий контраст выключен');
}

function applySpacing() {
  document.body.classList.toggle('wide-spacing', a11yState.wideSpacing);
  setPressed('btn-spacing', a11yState.wideSpacing);
}

function toggleSpacing() {
  a11yState.wideSpacing = !a11yState.wideSpacing;
  applySpacing();
  saveA11yState();
  announce(a11yState.wideSpacing ? 'Увеличенные отступы включены' : 'Увеличенные отступы выключены');
}

function setPressed(id, value) {
  const btn = document.getElementById(id);
  if (btn) btn.setAttribute('aria-pressed', String(value));
}

let speechUtterance = null;

function getPageText() {
  const main = document.getElementById('main');
  const root = main || document.body;

  return Array.from(root.querySelectorAll(
    'h1, h2, h3, p, button, .nav-item-name, .topic-card-title, .tile-text, .q-text, .result-title, .result-sub'
  ))
    .filter(el => el.offsetParent !== null && el.getAttribute('aria-hidden') !== 'true')
    .map(el => (el.getAttribute('aria-label') || el.innerText || el.textContent || '').trim())
    .filter(Boolean)
    .join('. ');
}

function startSpeech() {
  if (!window.speechSynthesis) {
    announce('Синтез речи не поддерживается вашим браузером');
    return;
  }

  stopSpeech();
  speechUtterance = new SpeechSynthesisUtterance(getPageText());
  speechUtterance.lang = 'ru-RU';
  speechUtterance.rate = 0.9;
  speechUtterance.pitch = 1;

  speechUtterance.onstart = () => {
    a11yState.voiceRead = true;
    setPressed('btn-voice', true);
  };
  speechUtterance.onend = speechUtterance.onerror = () => {
    a11yState.voiceRead = false;
    setPressed('btn-voice', false);
  };

  window.speechSynthesis.speak(speechUtterance);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  a11yState.voiceRead = false;
  setPressed('btn-voice', false);
}

function toggleSpeech() {
  if (a11yState.voiceRead) {
    stopSpeech();
    announce('Озвучивание остановлено');
  } else {
    announce('Начинаю озвучивание страницы');
    startSpeech();
  }
}

let recognition = null;

function buildRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const instance = new SpeechRecognition();
  instance.lang = 'ru-RU';
  instance.continuous = true;
  instance.interimResults = false;
  return instance;
}

const voiceCommands = [
  { patterns: ['увеличить', 'больше', 'крупнее'], action: increaseFontSize },
  { patterns: ['уменьшить', 'меньше', 'мельче'], action: decreaseFontSize },
  { patterns: ['контраст'], action: toggleContrast },
  { patterns: ['отступ', 'интервал', 'пробел'], action: toggleSpacing },
  { patterns: ['прочитать', 'читать', 'озвучить'], action: startSpeech },
  { patterns: ['стоп', 'хватит', 'замолчи'], action: stopSpeech },
  { patterns: ['меню', 'домой'], action: goHome }
];

function handleVoiceResult(transcript) {
  const phrase = transcript.toLowerCase().trim();

  for (const command of voiceCommands) {
    if (command.patterns.some(pattern => phrase.includes(pattern))) {
      command.action();
      announce(`Команда выполнена: ${phrase}`);
      return;
    }
  }

  announce(`Команда не распознана: ${phrase}`);
}

function startMic() {
  if (!recognition) {
    recognition = buildRecognition();

    if (!recognition) {
      announce('Голосовой ввод не поддерживается вашим браузером');
      return;
    }

    recognition.onresult = event => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) handleVoiceResult(last[0].transcript);
    };

    recognition.onerror = event => {
      announce(event.error === 'not-allowed'
        ? 'Доступ к микрофону запрещён. Разрешите микрофон в настройках браузера.'
        : `Ошибка голосового ввода: ${event.error}`);
      stopMic();
    };

    recognition.onend = () => {
      if (a11yState.micActive) recognition.start();
    };
  }

  a11yState.micActive = true;
  document.body.classList.add('voice-active');
  recognition.start();
  setPressed('btn-mic', true);

  const label = document.getElementById('mic-label');
  if (label) label.textContent = 'Слушаю';
  announce('Голосовое управление активировано. Говорите команду.');
}

function stopMic() {
  a11yState.micActive = false;
  document.body.classList.remove('voice-active');
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
  }
  setPressed('btn-mic', false);

  const label = document.getElementById('mic-label');
  if (label) label.textContent = 'Голос';
  announce('Голосовое управление остановлено');
}

function toggleMic() {
  a11yState.micActive ? stopMic() : startMic();
}

const HOVER_SELECTOR = [
  'h1', 'h2', 'h3', 'p', 'button',
  '.nav-item', '.topic-card', '.answer-tile', '.cp-bubble'
].join(',');

let hoverTimer = null;
let lastHovered = null;
let tooltip = null;

function getElementText(el) {
  return (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function speakHover(text) {
  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function showTooltip(text, x, y) {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'hover-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
  }

  tooltip.textContent = text.length > 80 ? text.slice(0, 80) + '...' : text;
  tooltip.style.left = x + 'px';
  tooltip.style.top = (y - 48) + 'px';
  tooltip.classList.add('visible');
}

function hideTooltip() {
  if (tooltip) tooltip.classList.remove('visible');
}

function onHoverSpeak(event) {
  if (!a11yState.hoverSpeak) return;

  const target = event.target.closest(HOVER_SELECTOR);
  if (!target || target === lastHovered || target.getAttribute('aria-hidden') === 'true') return;

  lastHovered = target;
  clearTimeout(hoverTimer);

  hoverTimer = setTimeout(() => {
    const text = getElementText(target);
    if (!text) return;
    speakHover(text);
    showTooltip(text, event.clientX, event.clientY);
  }, 400);
}

function onMouseMove(event) {
  if (!tooltip || !tooltip.classList.contains('visible')) return;
  tooltip.style.left = event.clientX + 'px';
  tooltip.style.top = (event.clientY - 48) + 'px';
}

function enableHoverSpeak() {
  document.addEventListener('mouseover', onHoverSpeak);
  document.addEventListener('mousemove', onMouseMove);
  document.body.classList.add('hover-speak-mode');
}

function disableHoverSpeak() {
  document.removeEventListener('mouseover', onHoverSpeak);
  document.removeEventListener('mousemove', onMouseMove);
  document.body.classList.remove('hover-speak-mode');
  clearTimeout(hoverTimer);
  lastHovered = null;
  hideTooltip();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function toggleHoverSpeak() {
  a11yState.hoverSpeak = !a11yState.hoverSpeak;
  setPressed('btn-hover-speak', a11yState.hoverSpeak);

  if (a11yState.hoverSpeak) {
    enableHoverSpeak();
    announce('Озвучивание при наведении включено');
  } else {
    disableHoverSpeak();
    announce('Озвучивание при наведении выключено');
  }
}

function handleA11yShortcut(event) {
  if (!event.altKey) return;

  switch (event.key) {
    case '+':
    case '=':
      event.preventDefault();
      increaseFontSize();
      break;
    case '-':
    case '_':
      event.preventDefault();
      decreaseFontSize();
      break;
    case 'c':
    case 'C':
      event.preventDefault();
      toggleContrast();
      break;
    case 's':
    case 'S':
      event.preventDefault();
      toggleSpacing();
      break;
    case 'h':
    case 'H':
      event.preventDefault();
      toggleHoverSpeak();
      break;
    case 'v':
    case 'V':
      event.preventDefault();
      toggleSpeech();
      break;
    case 'm':
    case 'M':
      event.preventDefault();
      toggleMic();
      break;
  }
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
    .classList.toggle('open');
}
