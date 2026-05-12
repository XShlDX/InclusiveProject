import { RequestData } from '/frontend/modules/script.js';

/* =========================================
   HTML ESCAPE HELPER
========================================= */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const tasks = {};
const tagMap = {
  1: ['HTML'], 2: ['CSS'], 3: ['HTML', 'CSS'],
  4: ['CSS'],  5: ['HTML'], 6: ['CSS']
};

let currentTaskId = null;

/* =========================================
   ЭКРАН 1 — ОПИСАНИЕ ЗАДАНИЯ
========================================= */
function renderTaskIntro(taskId) {
  const t = tasks[taskId];
  if (!t) return;

  const box = document.querySelector('.modal__box');

  box.innerHTML = `
    <button class="modal__close" id="modalCloseIntro" aria-label="Закрыть">✕</button>

    <div class="task-intro">
      <div class="task-intro__tags">
        ${t.tags.map(tag => `<span class="tag tag--${tag.toLowerCase()}">${tag}</span>`).join('')}
      </div>

      <div class="task-intro__num">Задание ${String(taskId).padStart(2, '0')}</div>
      <h2 class="task-intro__title">${escapeHtml(t.title)}</h2>
      <p class="task-intro__desc">${escapeHtml(t.desc)}</p>

      <div class="task-intro__meta">
        <div class="task-intro__meta-item">
          <span class="task-intro__meta-icon">❓</span>
          <span>${t.quiz.length} вопросов</span>
        </div>
        <div class="task-intro__meta-item">
          <span class="task-intro__meta-icon">⏱</span>
          <span>~${t.quiz.length * 2} минут</span>
        </div>
        <div class="task-intro__meta-item">
          <span class="task-intro__meta-icon">🎯</span>
          <span>60% для зачёта</span>
        </div>
      </div>

      <div class="task-intro__divider"></div>

      <div class="task-intro__tips">
        <div class="task-intro__tip">
          <span class="task-intro__tip-icon">💡</span>
          <span>Все вопросы обязательны для ответа</span>
        </div>
        <div class="task-intro__tip">
          <span class="task-intro__tip-icon">✅</span>
          <span>После отправки увидишь правильные ответы</span>
        </div>
        <div class="task-intro__tip">
          <span class="task-intro__tip-icon">🔄</span>
          <span>Можно пройти повторно любое количество раз</span>
        </div>
      </div>

      <button class="task-intro__start-btn" id="startQuizBtn">
        Пройти тест
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  document.getElementById('modalCloseIntro').addEventListener('click', closeModal);
  document.getElementById('startQuizBtn').addEventListener('click', () => renderFormQuiz(taskId));
}

/* =========================================
   ЭКРАН 2 — КВИЗ
========================================= */
function renderFormQuiz(taskId) {
  const t = tasks[taskId];
  if (!t) return;

  const box = document.querySelector('.modal__box');

  const questionsHTML = t.quiz.map((q, qi) => `
    <div class="form-question" id="fq-${qi}">
      <div class="form-question__header">
        <p class="form-question__text">
          <span class="form-question__num">${qi + 1}.</span>
          ${escapeHtml(q.q)}
          <span class="form-question__required">*</span>
        </p>
      </div>
      <div class="form-question__options">
        ${q.options.map((opt, oi) => `
          <label class="form-option" for="q${qi}_o${oi}">
            <input class="form-option__radio" type="radio" name="q${qi}" id="q${qi}_o${oi}" value="${oi}"/>
            <span class="form-option__circle"></span>
            <span class="form-option__label">${escapeHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  box.innerHTML = `
    <button class="modal__close" id="modalCloseForm" aria-label="Закрыть">✕</button>

    <div class="form-quiz">
      <div class="form-quiz__header">
        <div class="form-quiz__header-top">
          <button class="form-quiz__back" id="backToIntroBtn">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Назад
          </button>
          <div class="form-quiz__tags">
            ${t.tags.map(tag => `<span class="tag tag--${tag.toLowerCase()}">${tag}</span>`).join('')}
          </div>
        </div>
        <h2 class="form-quiz__title">${escapeHtml(t.title)}</h2>
        <p class="form-quiz__desc">${escapeHtml(t.desc)}</p>
        <p class="form-quiz__required-note">
          <span class="form-question__required">*</span> — обязательный вопрос
        </p>
      </div>

      <div class="form-quiz__questions">${questionsHTML}</div>

      <div class="form-quiz__footer">
        <button class="btn-primary" id="formSubmitBtn">Отправить</button>
        <button class="btn-secondary" id="formClearBtn">Очистить форму</button>
      </div>
    </div>
  `;

  document.getElementById('modalCloseForm').addEventListener('click', closeModal);
  document.getElementById('backToIntroBtn').addEventListener('click', () => renderTaskIntro(taskId));

  document.getElementById('formClearBtn').addEventListener('click', () => {
    box.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; r.disabled = false; });
    box.querySelectorAll('.form-question').forEach(fq => {
      fq.classList.remove('form-question--correct', 'form-question--wrong', 'form-question--unanswered');
    });
    box.querySelectorAll('.form-option').forEach(opt => {
      opt.classList.remove('form-option--correct', 'form-option--wrong');
    });
    const existing = box.querySelector('.form-quiz__result');
    if (existing) existing.remove();
    document.getElementById('formSubmitBtn').disabled = false;
    document.getElementById('formClearBtn').textContent = 'Очистить форму';
  });

  document.getElementById('formSubmitBtn').addEventListener('click', () => submitForm(taskId));
}

/* =========================================
   SUBMIT & SCORE
========================================= */
function submitForm(taskId) {
  const t = tasks[taskId];
  const box = document.querySelector('.modal__box');

  let allAnswered = true;
  let firstUnanswered = null;
  t.quiz.forEach((q, qi) => {
    const selected = box.querySelector(`input[name="q${qi}"]:checked`);
    const fq = document.getElementById(`fq-${qi}`);
    if (!selected) {
      allAnswered = false;
      fq.classList.add('form-question--unanswered');
      if (!firstUnanswered) firstUnanswered = fq;
    } else {
      fq.classList.remove('form-question--unanswered');
    }
  });

  if (!allAnswered) {
    firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  let score = 0;
  t.quiz.forEach((q, qi) => {
    const selected = box.querySelector(`input[name="q${qi}"]:checked`);
    const chosen = parseInt(selected.value);
    const isCorrect = chosen === q.answer;
    if (isCorrect) score++;

    const fq = document.getElementById(`fq-${qi}`);
    fq.classList.add(isCorrect ? 'form-question--correct' : 'form-question--wrong');

    fq.querySelectorAll('.form-option').forEach((optEl, oi) => {
      optEl.querySelector('input').disabled = true;
      if (oi === q.answer) optEl.classList.add('form-option--correct');
      else if (oi === chosen && !isCorrect) optEl.classList.add('form-option--wrong');
    });
  });

  document.getElementById('formSubmitBtn').disabled = true;
  const clearBtn = document.getElementById('formClearBtn');
  clearBtn.textContent = '↺ Пройти снова';
  clearBtn.onclick = () => renderFormQuiz(taskId);

  const total = t.quiz.length;
  const pct = Math.round((score / total) * 100);
  const isGood = score >= Math.ceil(total * 0.6);

  const result = document.createElement('div');
  result.className = 'form-quiz__result';
  result.innerHTML = `
    <div class="form-result__icon">${isGood ? '🏆' : '📚'}</div>
    <div class="form-result__title">${isGood ? 'Отличная работа!' : 'Нужно повторить'}</div>
    <div class="form-result__score">
      <span class="form-result__num">${score}</span>
      <span class="form-result__denom">/ ${total}</span>
    </div>
    <div class="form-result__pct">${pct}% правильных ответов</div>
    <div class="form-result__bar">
      <div class="form-result__bar-fill" style="width:0%;background:${isGood ? 'var(--main-accent)' : '#ff6b6b'}"></div>
    </div>
  `;

  box.querySelector('.form-quiz__footer').before(result);
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { result.querySelector('.form-result__bar-fill').style.width = pct + '%'; }, 100);
}

/* =========================================
   MODAL LOGIC
========================================= */
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

async function openModal(id) {
  currentTaskId = id;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.querySelector('.modal__box').innerHTML = `
    <button class="modal__close" id="modalCloseTemp" aria-label="Закрыть">✕</button>
    <div class="modal-loading">
      <div class="modal-loading__spinner"></div>
      <span>Загрузка задания...</span>
    </div>
  `;
  document.getElementById('modalCloseTemp').addEventListener('click', closeModal);

  try {
    const data = await RequestData.getTask(id);
    tasks[id] = {
      title: data.title,
      tags: tagMap[id] ?? ['HTML'],
      desc: data.description ?? 'Ответь на все вопросы и нажми «Отправить».',
      quiz: data.questions.map(q => ({
        q: q.text,
        options: q.options.map(o => o.text),
        answer: q.correct_index ?? q.correct_answer ?? q.answer ?? 0
      }))
    };
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    document.querySelector('.modal__box').innerHTML = `
      <button class="modal__close" id="modalCloseErr" aria-label="Закрыть">✕</button>
      <div class="modal-error">
        <div class="modal-error__icon">⚠️</div>
        <p class="modal-error__text">Не удалось загрузить задание.<br/>Проверь, запущен ли бэкенд.</p>
        <button class="btn-primary" onclick="location.reload()">Обновить</button>
      </div>
    `;
    document.getElementById('modalCloseErr').addEventListener('click', closeModal);
    return;
  }

  renderTaskIntro(id);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.id));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.id); }
  });
});

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* =========================================
   ACCESSIBILITY DROPDOWN
========================================= */
const a11yBtn = document.getElementById('a11yBtn');
const a11yDropdown = document.getElementById('a11yDropdown');

a11yBtn.addEventListener('click', () => {
  const isOpen = a11yDropdown.classList.toggle('open');
  a11yBtn.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', e => {
  if (!e.target.closest('.header__accessibility')) {
    a11yDropdown.classList.remove('open');
    a11yBtn.setAttribute('aria-expanded', false);
  }
});