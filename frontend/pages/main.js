const tasks = {
  1: {
    title: 'Семантическая разметка',
    tags: ['HTML'],
    desc: 'Перепиши данный HTML-фрагмент, заменив все <div> на подходящие семантические теги: header, main, article, section, footer, nav, aside. Убедись, что структура документа логична и доступна для скринридеров.',
    lang: 'html',
    code: `<!-- ❌ До: несемантично -->
<div class="header">
  <div class="nav">
    <div class="nav-item">Главная</div>
    <div class="nav-item">Блог</div>
  </div>
</div>
<div class="main">
  <div class="post">
    <div class="post-title">Заголовок</div>
    <div class="post-body">Текст статьи...</div>
  </div>
</div>
<div class="footer">© 2025</div>

<!-- ✅ После: твоя задача -->
<!-- Перепиши с семантическими тегами -->`
  },
  2: {
    title: 'Flexbox-раскладка',
    tags: ['CSS'],
    desc: 'Создай адаптивный навбар с логотипом слева, ссылками по центру и кнопкой справа. Используй только display: flex и его свойства. На мобильных устройствах (<600px) ссылки должны прятаться.',
    lang: 'css',
    code: `/* Задание: заполни недостающие свойства */
.navbar {
  display: flex;
  /* как выровнять по вертикали? */
  align-items: ____;
  /* отступы */
  padding: 0 32px;
  height: 64px;
}

.navbar__links {
  /* занять всё доступное пространство */
  flex: ____;
  display: flex;
  /* расположить ссылки по центру */
  justify-content: ____;
  gap: 24px;
}

@media (max-width: 600px) {
  .navbar__links {
    /* скрыть на мобильных */
    display: ____;
  }
}`
  },
  3: {
    title: 'Форма обратной связи',
    tags: ['HTML', 'CSS'],
    desc: 'Свёрстай форму с полями: имя, email, сообщение и кнопка отправки. Добавь корректные label, атрибуты required, aria-describedby для ошибок. Стилизуй состояние :focus-visible без outline: none.',
    lang: 'html',
    code: `<form class="contact-form" novalidate>
  <!-- Поле имени с label -->
  <div class="field">
    <label for="name">Имя *</label>
    <input
      type="text"
      id="name"
      name="name"
      required
      autocomplete="name"
      aria-describedby="name-error"
    />
    <span id="name-error" class="error" role="alert"></span>
  </div>

  <!-- Твоя задача: добавь поля email и textarea -->
  <!-- + стилизуй :focus-visible в CSS -->
</form>

<style>
.field input:focus-visible {
  /* НЕ писать outline: none! */
  outline: 2px solid #e8ff57;
  outline-offset: 2px;
}
</style>`
  },
  4: {
    title: 'CSS Grid галерея',
    tags: ['CSS'],
    desc: 'Построй фотогалерею с масонри-эффектом: 3 колонки, разные высоты карточек. Первая карточка должна занимать 2 строки. Используй только CSS Grid (grid-template-rows, grid-row, и т.д.).',
    lang: 'css',
    code: `/* Галерея: масонри через CSS Grid */
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* задай строки фиксированной высоты */
  grid-auto-rows: 200px;
  gap: 16px;
}

/* Первая карточка — большая */
.gallery__item:first-child {
  /* растянуть на 2 строки */
  grid-row: span ____;
}

/* Последняя — на всю ширину */
.gallery__item:last-child {
  grid-column: span ____;
}

.gallery__item {
  background: #1e1e24;
  border-radius: 12px;
  overflow: hidden;
}`
  },
  5: {
    title: 'Таблицы и доступность',
    tags: ['HTML'],
    desc: 'Создай таблицу с данными о студентах (имя, оценка, статус). Добавь caption, scope для заголовков, aria-label. Таблица должна быть читабельна скринридером без визуального контекста.',
    lang: 'html',
    code: `<table aria-label="Список студентов группы">
  <caption>Успеваемость за семестр</caption>
  <thead>
    <tr>
      <!-- добавь scope="col" к каждому th -->
      <th scope="____">Студент</th>
      <th scope="____">Оценка</th>
      <th scope="____">Статус</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <!-- для строк используй scope="row" -->
      <th scope="____">Алия Нурова</th>
      <td>95</td>
      <td>
        <!-- скрытый текст для скринридеров -->
        <span aria-label="Отлично">⭐</span>
      </td>
    </tr>
    <!-- добавь ещё 2-3 строки -->
  </tbody>
</table>`
  },
  6: {
    title: 'Анимация и переходы',
    tags: ['CSS'],
    desc: 'Добавь CSS-анимации: кнопка при ховере плавно масштабируется, карточка "поднимается" при наведении, появляется shimmer-эффект загрузки. Используй только CSS (transition, @keyframes, animation).',
    lang: 'css',
    code: `/* 1. Кнопка: масштаб + свечение */
.btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn:hover {
  transform: scale(____);
  box-shadow: 0 8px 24px rgba(232,255,87, 0.___);
}

/* 2. Карточка: подъём */
.card {
  transition: transform ____ ease;
}
.card:hover {
  transform: translateY(____px);
}

/* 3. Shimmer-скелетон */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #1e1e24 25%,
    #2a2a32 50%,
    #1e1e24 75%
  );
  background-size: 200% 100%;
  animation: shimmer ____ linear infinite;
}`
  }
};

/* =========================================
   MODAL LOGIC
========================================= */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalCode = document.getElementById('modalCode');
const modalTags = document.getElementById('modalTags');
const modalCodeLang = document.getElementById('modalCodeLang');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
const copyBtn = document.getElementById('copyBtn');

function openModal(id) {
  const t = tasks[id];
  if (!t) return;

  modalTitle.textContent = t.title;
  modalDesc.textContent = t.desc;
  modalCode.textContent = t.code;
  modalCodeLang.textContent = t.lang.toUpperCase();

  modalTags.innerHTML = t.tags.map(tag =>
    `<span class="tag tag--${tag.toLowerCase()}">${tag}</span>`
  ).join('');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Open on card click / keyboard
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

// Copy code
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(modalCode.textContent).then(() => {
    copyBtn.textContent = 'Скопировано ✓';
    copyBtn.style.color = 'var(--accent)';
    setTimeout(() => {
      copyBtn.textContent = 'Копировать';
      copyBtn.style.color = '';
    }, 2000);
  });
});

document.getElementById('modalStart').addEventListener('click', () => {
  alert('Функция редактора в разработке — удачи с заданием! 🚀');
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