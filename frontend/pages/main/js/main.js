import { RequestData } from '/modules/script.js';

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
async function submitForm(taskId) {
  const t = tasks[taskId];
  const box = document.querySelector('.modal__box');

  // Проверяем что все отвечены
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

  // Собираем ответы
  const answers = t.quiz.map((q, qi) => {
    const selected = box.querySelector(`input[name="q${qi}"]:checked`);
    const chosenPosition = parseInt(selected.value);
    return q.originalIndexes[chosenPosition];
  });

  // Блокируем кнопку
  document.getElementById('formSubmitBtn').disabled = true;
  document.getElementById('formSubmitBtn').textContent = 'Проверяем...';

  let result;
  try {
    result = await RequestData.submitTask(taskId, answers);
    console.log('Ответ сервера:', JSON.stringify(result));
  } catch (err) {
    console.error('Ошибка отправки:', err);
    document.getElementById('formSubmitBtn').disabled = false;
    document.getElementById('formSubmitBtn').textContent = 'Отправить';
    return;
  }

  // Подсвечиваем
  t.quiz.forEach((q, qi) => {
    const selected = box.querySelector(`input[name="q${qi}"]:checked`);
    const chosenPosition = parseInt(selected.value);
    const isCorrect = result.correct[qi];

    const fq = document.getElementById(`fq-${qi}`);
    fq.classList.add(isCorrect ? 'form-question--correct' : 'form-question--wrong');

    fq.querySelectorAll('.form-option').forEach((optEl, oi) => {
      optEl.querySelector('input').disabled = true;
      if (oi === chosenPosition && isCorrect) {
        optEl.classList.add('form-option--correct');
      } else if (oi === chosenPosition && !isCorrect) {
        optEl.classList.add('form-option--wrong');
      }
    });
  });

  const score = result.score;
  const total = result.total;
  const pct = Math.round((score / total) * 100);
  const isGood = score >= Math.ceil(total * 0.6);

  const clearBtn = document.getElementById('formClearBtn');
  clearBtn.textContent = '↺ Пройти снова';
  clearBtn.onclick = () => renderFormQuiz(taskId);

  const resultEl = document.createElement('div');
  resultEl.className = 'form-quiz__result';
  resultEl.innerHTML = `
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
    <button class="form-result__exit-btn" id="exitToCardsBtn">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Вернуться к заданиям
    </button>
  `;

  box.querySelector('.form-quiz__footer').before(resultEl);
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    resultEl.querySelector('.form-result__bar-fill').style.width = pct + '%';
    document.getElementById('exitToCardsBtn')?.addEventListener('click', closeModal);
  }, 100);
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
      quiz: data.questions.map(q => {
        const options = q.options.map((o) => ({ text: o.text, originalIndex: o.index }));
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        return {
          q: q.text,
          options: options.map(o => o.text),
          originalIndexes: options.map(o => o.originalIndex),
          answer: null
        };
      })
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



(function() {
        const btn = document.getElementById('burgerBtn');
        const nav = document.getElementById('mobileNav');
        const backdrop = document.getElementById('mobileNavBackdrop');
        function open() { btn.classList.add('is-open'); nav.classList.add('is-open'); nav.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
        function close() { btn.classList.remove('is-open'); nav.classList.remove('is-open'); nav.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
        btn.addEventListener('click', () => nav.classList.contains('is-open') ? close() : open());
        backdrop.addEventListener('click', close);
        document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
      })();