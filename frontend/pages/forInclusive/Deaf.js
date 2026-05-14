/* =========================================================
   KahoSound — quiz app
   ========================================================= */

'use strict';

const TILE_TONES = [300, 400, 500, 600];
const TILE_CLASSES = ['tile-red', 'tile-blue', 'tile-yellow', 'tile-green'];
const TILE_ICONS = ['▲', '◆', '●', '■'];

let TOPICS = [];
let currentTopic = null;
let currentQ = 0;
let score = 0;
let answered = false;

// Темы и вопросы держим рядом с логикой квиза: так их проще менять.
document.addEventListener('DOMContentLoaded', async () => {
  TOPICS = await window.RequestData.getQuizTopics();
  initQuiz();
});

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
    el.id = 'nav-' + (topic.topic_id || topic.id);
    el.type = 'button';
    el.innerHTML = `
      <span class="nav-item-icon">${topic.icon}</span>
      <span class="nav-item-name">${topic.name}</span>
    `;
    el.addEventListener('click', () => startTopic(topic.topic_id || topic.id));
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
    card.addEventListener('click', () => startTopic(topic.topic_id || topic.id));
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
  currentTopic = TOPICS.find(topic => topic.topic_id === id || topic.id === id);
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

  const shouldShowImage = (currentTopic?.topic_id === 'avengers' || currentTopic?.id === 'avengers') && Boolean(question.image);

  if (!shouldShowImage) {
    image.hidden = true;
    image.removeAttribute('src');
    image.alt = '';
    return;
  }

  image.src = question.image;
  image.alt = question.image_alt || question.imageAlt || question.text;
  image.hidden = false;
}

function renderAnswers(question) {
  const grid = document.getElementById('answers-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // answers — массив объектов {id, text, index} от бэкенда
  question.answers.forEach((answer, i) => {
    const answerText = typeof answer === 'object' ? answer.text : answer;
    const answerIndex = typeof answer === 'object' ? answer.index : i;

    const btn = document.createElement('button');
    btn.className = `answer-tile ${TILE_CLASSES[i % TILE_CLASSES.length]}`;
    btn.type = 'button';
    btn.dataset.answerIndex = answerIndex;
    btn.innerHTML = `
      <span class="tile-icon">${TILE_ICONS[i]}</span>
      <span class="tile-text">${answerText}</span>
    `;

    btn.addEventListener('mouseenter', () => playToneHint(i));
    btn.addEventListener('click', () => selectAnswer(answerIndex));
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
