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

/* =========================================
   TASK DATA
========================================= */
const tasks = {
  1: {
    title: 'Семантическая разметка',
    tags: ['HTML'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Какой тег используется для главной навигации сайта?',
        options: ['<div>', '<nav>', '<menu>', '<ul>'],
        answer: 1
      },
      {
        q: 'Какой тег семантически правильный для шапки страницы?',
        options: ['<div class="header">', '<top>', '<header>', '<head>'],
        answer: 2
      },
      {
        q: 'Какой тег обозначает самостоятельную статью или публикацию?',
        options: ['<section>', '<article>', '<div>', '<aside>'],
        answer: 1
      },
      {
        q: 'Какой тег используется для подвала страницы?',
        options: ['<bottom>', '<footer>', '<div class="footer">', '<end>'],
        answer: 1 
      },
      {
        q: 'Какой тег используется для боковой панели с дополнительным контентом?',
        options: ['<sidebar>', '<panel>', '<aside>', '<section>'],
        answer: 2
      }
    ]
  },
  2: {
    title: 'Flexbox-раскладка',
    tags: ['CSS'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Какое свойство выравнивает элементы по поперечной оси (вертикально) в flex-контейнере?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-self'],
        answer: 1
      },
      {
        q: 'Какое значение flex позволяет элементу занять всё доступное пространство?',
        options: ['flex: auto', 'flex: 0', 'flex: 1', 'flex: stretch'],
        answer: 2
      },
      {
        q: 'Как расположить flex-элементы по центру главной оси?',
        options: ['align-items: center', 'justify-content: center', 'flex-align: center', 'text-align: center'],
        answer: 1
      },
      {
        q: 'Как скрыть элемент на мобильных устройствах через CSS?',
        options: ['display: hidden', 'display: none', 'visibility: hidden', 'opacity: 0'],
        answer: 1
      },
      {
        q: 'Какое свойство задаёт направление главной оси flex-контейнера?',
        options: ['flex-direction', 'flex-flow', 'flex-axis', 'flex-wrap'],
        answer: 0
      }
    ]
  },
  3: {
    title: 'Форма обратной связи',
    tags: ['HTML', 'CSS'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Какой атрибут связывает label с полем ввода?',
        options: ['name', 'for', 'id', 'link'],
        answer: 1
      },
      {
        q: 'Какой атрибут делает поле обязательным для заполнения?',
        options: ['mandatory', 'required', 'validate', 'aria-required'],
        answer: 1
      },
      {
        q: 'Какой ARIA-атрибут связывает поле с блоком ошибки?',
        options: ['aria-label', 'aria-describedby', 'aria-error', 'aria-hint'],
        answer: 1
      },
      {
        q: 'Какой псевдокласс CSS показывает фокус только при навигации клавиатурой?',
        options: [':focus', ':focus-within', ':focus-visible', ':active'],
        answer: 2
      },
      {
        q: 'Какой тип input используется для email-адреса?',
        options: ['type="mail"', 'type="email"', 'type="text"', 'type="address"'],
        answer: 1
      }
    ]
  },
  4: {
    title: 'CSS Grid галерея',
    tags: ['CSS'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Как создать 3 равные колонки в CSS Grid?',
        options: ['grid-columns: 3', 'grid-template-columns: repeat(3, 1fr)', 'columns: 3', 'grid: 3fr'],
        answer: 1
      },
      {
        q: 'Какое свойство позволяет элементу занять 2 строки в Grid?',
        options: ['grid-row: 2', 'grid-row: span 2', 'row-span: 2', 'grid-area: 2'],
        answer: 1
      },
      {
        q: 'Как растянуть элемент на все 3 колонки?',
        options: ['width: 100%', 'grid-column: span 3', 'column-span: 3', 'flex: 3'],
        answer: 1
      },
      {
        q: 'Что означает единица fr в CSS Grid?',
        options: ['фиксированный размер', 'доля свободного пространства', 'процент', 'em-единица'],
        answer: 1
      },
      {
        q: 'Какое свойство задаёт высоту автоматически созданных строк?',
        options: ['grid-row-height', 'grid-auto-rows', 'row-height', 'grid-template-rows'],
        answer: 1
      }
    ]
  },
  5: {
    title: 'Таблицы и доступность',
    tags: ['HTML'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Какое значение scope используется для заголовков столбцов?',
        options: ['row', 'col', 'column', 'header'],
        answer: 1
      },
      {
        q: 'Какой тег добавляет подпись к таблице?',
        options: ['<title>', '<caption>', '<label>', '<summary>'],
        answer: 1
      },
      {
        q: 'Какой атрибут scope используется для заголовков строк?',
        options: ['row', 'rowgroup', 'line', 'tr'],
        answer: 0
      },
      {
        q: 'Какой ARIA-атрибут добавляет скрытое описание для скринридера?',
        options: ['aria-hidden', 'aria-label', 'aria-text', 'aria-role'],
        answer: 1
      },
      {
        q: 'В каком теге находятся заголовки таблицы?',
        options: ['<tbody>', '<thead>', '<header>', '<th-group>'],
        answer: 1
      }
    ]
  },
  6: {
    title: 'Анимация и переходы',
    tags: ['CSS'],
    desc: 'Ответь на все вопросы и нажми «Отправить» для получения результата.',
    quiz: [
      {
        q: 'Какое CSS-свойство задаёт плавный переход между состояниями?',
        options: ['animation', 'transition', 'transform', 'keyframes'],
        answer: 1
      },
      {
        q: 'Как масштабировать элемент в 1.05 раза при наведении?',
        options: ['scale(1.05)', 'transform: scale(1.05)', 'zoom: 1.05', 'resize: 1.05'],
        answer: 1
      },
      {
        q: 'Какой CSS-блок используется для создания кастомных анимаций?',
        options: ['@animation', '@keyframes', '@motion', '@frames'],
        answer: 1
      },
      {
        q: 'Как поднять карточку на 4px вверх при наведении?',
        options: ['top: -4px', 'transform: translateY(-4px)', 'margin-top: -4px', 'position: -4px'],
        answer: 1
      },
      {
        q: 'Какое значение animation-iteration-count делает анимацию бесконечной?',
        options: ['forever', 'loop', 'infinite', 'repeat'],
        answer: 2
      }
    ]
  }
};

/* =========================================
   RENDER FORM-STYLE QUIZ
========================================= */
let currentTaskId = null;

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
            <input
              class="form-option__radio"
              type="radio"
              name="q${qi}"
              id="q${qi}_o${oi}"
              value="${oi}"
            />
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
        <div class="form-quiz__tags">
          ${t.tags.map(tag => `<span class="tag tag--${tag.toLowerCase()}">${tag}</span>`).join('')}
        </div>
        <h2 class="form-quiz__title">${escapeHtml(t.title)}</h2>
        <p class="form-quiz__desc">${escapeHtml(t.desc)}</p>
        <p class="form-quiz__required-note">
          <span class="form-question__required">*</span> — обязательный вопрос
        </p>
      </div>

      <div class="form-quiz__questions">
        ${questionsHTML}
      </div>

      <div class="form-quiz__footer">
        <button class="btn-primary" id="formSubmitBtn">Отправить</button>
        <button class="btn-secondary" id="formClearBtn">Очистить форму</button>
      </div>

    </div>
  `;

  document.getElementById('modalCloseForm').addEventListener('click', closeModal);

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

  // Check all answered
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

  // Score & highlight
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

  // Disable submit, change clear to retry
  document.getElementById('formSubmitBtn').disabled = true;
  const clearBtn = document.getElementById('formClearBtn');
  clearBtn.textContent = '↺ Пройти снова';
  clearBtn.onclick = () => renderFormQuiz(taskId);

  // Result block
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
      <div class="form-result__bar-fill" style="width:0%; background:${isGood ? 'var(--main-accent)' : '#ff6b6b'}"></div>
    </div>
  `;

  const footer = box.querySelector('.form-quiz__footer');
  footer.before(result);
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Animate bar
  setTimeout(() => {
    result.querySelector('.form-result__bar-fill').style.width = pct + '%';
  }, 100);
}

/* =========================================
   MODAL LOGIC
========================================= */
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

function openModal(id) {
  const t = tasks[id];
  if (!t) return;
  currentTaskId = id;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderFormQuiz(id);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.id));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card.dataset.id);
    }
  });
});

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

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