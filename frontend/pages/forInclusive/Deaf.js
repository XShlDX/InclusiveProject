/* =========================================================
   KahoSound — quiz app
   ========================================================= */

'use strict';

// Темы и вопросы держим рядом с логикой квиза: так их проще менять.
const TOPICS = [
  {
    id: 'sound',
    name: 'Физика звука',
    icon: '🔊',
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
    id: 'instruments',
    name: 'Инструменты',
    icon: '🎸',
    questions: [
      {
        text: 'Сколько струн у классической гитары?',
        answers: ['4', '5', '6', '7'],
        correct: 2
      },
      {
        text: 'Какой инструмент самый большой в симфоническом оркестре?',
        answers: ['Виолончель', 'Контрабас', 'Арфа', 'Туба'],
        correct: 1
      },
      {
        text: 'Какой из этих инструментов является ударным?',
        answers: ['Флейта', 'Тромбон', 'Барабан', 'Кларнет'],
        correct: 2
      },
      {
        text: 'Какой инструмент использует смычок?',
        answers: ['Скрипка', 'Гитара', 'Труба', 'Фортепиано'],
        correct: 0
      }
    ]
  },
  {
    id: 'computers',
    name: 'Компьютеры',
    icon: '💻',
    questions: [
      {
        text: 'Первый компьютер Apple?',
        answers: ['IBM 6070', 'Macintosh', 'Apple II', 'Macbook M2'],
        correct: 1
      },
      {
        text: 'Основатель Facebook?',
        answers: ['Марк Цукерберг', 'Элон Маск', 'Билл Гейтс', 'Стив Джобс'],
        correct: 0
      },
      {
        text: 'Какой язык программирования самый популярный в 2024 году?',
        answers: ['Python', 'JavaScript', 'Java', 'C#'],
        correct: 1
      },
      {
        text: 'Какой из этих процессоров самый мощный?',
        answers: ['Intel Core i9-13900K', 'AMD Ryzen 9 7950X', 'Apple M2 Max', 'NVIDIA Grace'],
        correct: 2
      }
    ]
  },
  {
    id: 'space',
    name: 'Космос',
    icon: '🚀',
    questions: [
      {
        text: 'Какая планета самая большая в Солнечной системе?',
        answers: ['Земля', 'Марс', 'Юпитер', 'Сатурн'],
        correct: 2
      },
      {
        text: 'Какая планета самая близкая к Солнцу?',
        answers: ['Венера', 'Меркурий', 'Земля', 'Марс'],
        correct: 1
      },
      {
        text: 'Какой космический аппарат первым достиг поверхности Луны?',
        answers: ['Аполлон-11', 'Луноход-1', 'Спутник-1', 'Восток-1'],
        correct: 0
      },
      {
        text: 'Сколько спутников у планеты Нептун?',
        answers: ['13', '14', '15', '16'],
        correct: 2
      }
    ]
  },
  {
    id: 'avengers',
    name: 'Мстители',
    icon: '🛡️',
    questions: [
      {
        text: 'Кто изображён на фото?',
        image: 'images/iron_man.jpg',
        imageAlt: 'Железный человек',
        answers: ['Тони Старк', 'Стив Роджерс', 'Брюс Бэннер', 'Питер Паркер'],
        correct: 0
      },
      {
        text: 'Как зовут героя на фото?',
        image: 'images/captain_america.jpg',
        imageAlt: 'Капитан Америка',
        answers: ['Тор', 'Стив Роджерс', 'Клинт Бартон', 'Сэм Уилсон'],
        correct: 1
      },
      {
        text: 'Какой герой держит молот Мьёльнир?',
        image: 'images/thor.jpg',
        imageAlt: 'Тор',
        answers: ['Локи', 'Тор', 'Доктор Стрэндж', 'Соколиный глаз'],
        correct: 1
      },
      {
        text: 'Кто превращается в этого героя?',
        image: 'images/hulk.jpg',
        imageAlt: 'Халк',
        answers: ['Питер Квилл', 'Брюс Бэннер', 'Скотт Лэнг', 'Баки Барнс'],
        correct: 1
      },
      {
        text: 'Кто изображён на фото?',
        image: 'images/spider_man.jpg',
        imageAlt: 'Человек-паук',
        answers: ['Питер Паркер', 'Тони Старк', 'Стив Роджерс', 'Т’Чалла'],
        correct: 0
      }
    ]
  }
];

const TILE_TONES = [300, 400, 500, 600];
const TILE_CLASSES = ['tile-red', 'tile-blue', 'tile-yellow', 'tile-green'];
const TILE_ICONS = ['▲', '◆', '●', '■'];

let currentTopic = null;
let currentQ = 0;
let score = 0;
let answered = false;

document.addEventListener('DOMContentLoaded', initQuiz);

function initQuiz() {
  buildSidebar();
  buildStartCards();

  window.KahoA11y?.init({
    goHome
  });
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  nav.innerHTML = '';

  TOPICS.forEach(topic => {
    const el = document.createElement('button');
    el.className = 'nav-item';
    el.id = 'nav-' + topic.id;
    el.type = 'button';
    el.innerHTML = `
      <span class="nav-item-icon">${topic.icon}</span>
      <span class="nav-item-name">${topic.name}</span>
    `;
    el.addEventListener('click', () => startTopic(topic.id));
    nav.appendChild(el);
  });
}

function buildStartCards() {
  const wrap = document.getElementById('start-topics-preview');
  if (!wrap) return;

  wrap.innerHTML = '';

  TOPICS.forEach(topic => {
    const card = document.createElement('button');
    card.className = 'topic-card';
    card.type = 'button';
    card.innerHTML = `
      <div class="topic-card-icon">${topic.icon}</div>
      <div class="topic-card-title">${topic.name}</div>
    `;
    card.addEventListener('click', () => startTopic(topic.id));
    wrap.appendChild(card);
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
  });

  document.getElementById(id)?.classList.add('active');
}

function startTopic(id) {
  currentTopic = TOPICS.find(topic => topic.id === id);
  if (!currentTopic) return;

  currentQ = 0;
  score = 0;
  answered = false;

  setText('score-display', score);
  setText('q-topic-badge', currentTopic.name);
  setActiveTopic(id);

  showScreen('screen-question');
  renderQuestion();
}

function renderQuestion() {
  const question = currentTopic.questions[currentQ];

  renderQuestionImage(question);
  setText('q-text', question.text);
  setText('q-counter', `${currentQ + 1} / ${currentTopic.questions.length}`);

  const progress = ((currentQ + 1) / currentTopic.questions.length) * 100;
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) progressFill.style.width = progress + '%';

  renderAnswers(question);
  answered = false;
}

function renderQuestionImage(question) {
  const image = document.getElementById('q-image');
  if (!image) return;

  const shouldShowImage = currentTopic?.id === 'avengers' && Boolean(question.image);

  if (!shouldShowImage) {
    image.hidden = true;
    image.removeAttribute('src');
    image.alt = '';
    return;
  }

  image.src = question.image;
  image.alt = question.imageAlt || question.text;
  image.hidden = false;
}

function renderAnswers(question) {
  const grid = document.getElementById('answers-grid');
  if (!grid) return;

  grid.innerHTML = '';

  question.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = `answer-tile ${TILE_CLASSES[index % TILE_CLASSES.length]}`;
    btn.type = 'button';
    btn.innerHTML = `
      <span class="tile-icon">${TILE_ICONS[index]}</span>
      <span class="tile-text">${answer}</span>
    `;

    btn.addEventListener('mouseenter', () => playToneHint(index));
    btn.addEventListener('click', () => selectAnswer(index));
    grid.appendChild(btn);
  });
}

function playToneHint(index) {
  if (window.KahoA11y?.areToneHintsMuted()) return;
  window.KahoAudio?.playTone(TILE_TONES[index], 0.15);
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;

  const question = currentTopic.questions[currentQ];
  const buttons = document.querySelectorAll('.answer-tile');

  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if (idx === question.correct) {
    handleCorrectAnswer(buttons[idx]);
  } else {
    handleWrongAnswer(buttons[idx], buttons[question.correct]);
  }
}

function handleCorrectAnswer(button) {
  score += 100;
  setText('score-display', score);
  button?.classList.add('correct');
  window.KahoAudio?.playCorrectSound();

  setTimeout(nextQuestion, 800);
}

function handleWrongAnswer(selectedButton, correctButton) {
  selectedButton?.classList.add('wrong');
  correctButton?.classList.add('correct');
  window.KahoAudio?.playWrongSound();

  const msg = document.getElementById('wrong-msg');
  if (msg) {
    msg.style.display = 'block';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 1200);
  }

  setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
  currentQ++;

  if (currentQ >= currentTopic.questions.length) {
    showResult();
    return;
  }

  renderQuestion();
}

function showResult() {
  showScreen('screen-result');
  setText('final-score', score);

  const maxScore = currentTopic.questions.length * 100;
  const result = getResultCopy(score, maxScore);

  setText('result-title', result.title);
  setText('result-sub', result.subtitle);
  setText('result-emoji', result.emoji);

  spawnConfetti();
}

function getResultCopy(currentScore, maxScore) {
  if (currentScore === maxScore) {
    return {
      title: 'Идеально!',
      subtitle: 'Ты отлично справился с темой 🎵',
      emoji: '🏆'
    };
  }

  if (currentScore >= maxScore * 0.75) {
    return {
      title: 'Очень хорошо!',
      subtitle: 'Почти идеальный результат ✨',
      emoji: '🎉'
    };
  }

  return {
    title: 'Квиз завершён!',
    subtitle: 'Попробуй пройти ещё раз 🚀',
    emoji: '🎵'
  };
}

function goHome() {
  showScreen('screen-start');
  setActiveTopic(null);
}

function restartCurrentTopic() {
  if (!currentTopic) return;
  startTopic(currentTopic.id);
}

function setActiveTopic(id) {
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.id === 'nav-' + id);
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function spawnConfetti() {
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;

  layer.innerHTML = '';

  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDelay = Math.random() * 2 + 's';
    layer.appendChild(el);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('open');
}

window.goHome = goHome;
window.restartCurrentTopic = restartCurrentTopic;
window.toggleSidebar = toggleSidebar;
