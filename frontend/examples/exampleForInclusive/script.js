/* ─────────────────────────────────────────────────────────────
   script.js  —  Inclusive Mode accessibility engine
   ───────────────────────────────────────────────────────────── */

'use strict';

// ─── State ──────────────────────────────────────────────────────
const state = {
  fontSize:     16,   // px
  fontMin:      14,
  fontMax:      28,
  fontStep:     2,
  highContrast: false,
  wideSpacing:  false,
  voiceRead:    false,
  micActive:    false,
  hoverSpeak:   false,  // озвучивание при наведении
};

// ─── Helpers ─────────────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const qs = sel => document.querySelector(sel);

/** Announce a message to screen readers via aria-live region */
function announce(msg) {
  const el = $('sr-announcer');
  if (!el) return;
  el.textContent = '';
  // tiny delay so the live region fires reliably
  requestAnimationFrame(() => { el.textContent = msg; });
}

/** Persist settings to sessionStorage */
function saveState() {
  sessionStorage.setItem('a11y', JSON.stringify({
    fontSize:     state.fontSize,
    highContrast: state.highContrast,
    wideSpacing:  state.wideSpacing,
  }));
}

/** Restore settings from sessionStorage */
function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('a11y') || '{}');
    if (saved.fontSize)     state.fontSize     = saved.fontSize;
    if (saved.highContrast) state.highContrast = saved.highContrast;
    if (saved.wideSpacing)  state.wideSpacing  = saved.wideSpacing;
  } catch (_) { /* ignore */ }
}

// ─── Font Size ────────────────────────────────────────────────────
function applyFontSize() {
  document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');
  document.documentElement.style.fontSize = state.fontSize + 'px';
}

function increaseFontSize() {
  if (state.fontSize >= state.fontMax) {
    announce('Максимальный размер текста достигнут');
    return;
  }
  state.fontSize = Math.min(state.fontMax, state.fontSize + state.fontStep);
  applyFontSize();
  saveState();
  announce(`Размер текста увеличен до ${state.fontSize} пикселей`);
}

function decreaseFontSize() {
  if (state.fontSize <= state.fontMin) {
    announce('Минимальный размер текста достигнут');
    return;
  }
  state.fontSize = Math.max(state.fontMin, state.fontSize - state.fontStep);
  applyFontSize();
  saveState();
  announce(`Размер текста уменьшен до ${state.fontSize} пикселей`);
}

// ─── High Contrast ────────────────────────────────────────────────
function applyContrast() {
  document.body.classList.toggle('high-contrast', state.highContrast);
  const btn = $('btn-contrast');
  if (btn) btn.setAttribute('aria-pressed', String(state.highContrast));
}

function toggleContrast() {
  state.highContrast = !state.highContrast;
  applyContrast();
  saveState();
  announce(state.highContrast
    ? 'Высокий контраст включён'
    : 'Высокий контраст выключен');
}

// ─── Wide Spacing ─────────────────────────────────────────────────
function applySpacing() {
  document.body.classList.toggle('wide-spacing', state.wideSpacing);
  const btn = $('btn-spacing');
  if (btn) btn.setAttribute('aria-pressed', String(state.wideSpacing));
}

function toggleSpacing() {
  state.wideSpacing = !state.wideSpacing;
  applySpacing();
  saveState();
  announce(state.wideSpacing
    ? 'Увеличенные отступы включены'
    : 'Увеличенные отступы выключены');
}

// ─── Text-to-Speech ───────────────────────────────────────────────
let speechUtterance = null;

function getPageText() {
  const main = qs('#main-content');
  if (!main) return document.body.innerText;
  // collect text from visible elements, skip aria-hidden
  return Array.from(main.querySelectorAll(
    'h1, h2, h3, p, li, .shortcut-desc, .feature-title, .feature-text, .voice-commands'
  ))
    .filter(el => el.getAttribute('aria-hidden') !== 'true')
    .map(el => el.innerText.trim())
    .filter(Boolean)
    .join('. ');
}

function startSpeech() {
  if (!window.speechSynthesis) {
    announce('Синтез речи не поддерживается вашим браузером');
    return;
  }
  stopSpeech();
  const text = getPageText();
  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.lang = 'ru-RU';
  speechUtterance.rate = 0.9;
  speechUtterance.pitch = 1;

  speechUtterance.onstart = () => {
    state.voiceRead = true;
    const btn = $('btn-voice');
    if (btn) btn.setAttribute('aria-pressed', 'true');
  };
  speechUtterance.onend = speechUtterance.onerror = () => {
    state.voiceRead = false;
    const btn = $('btn-voice');
    if (btn) btn.setAttribute('aria-pressed', 'false');
  };

  window.speechSynthesis.speak(speechUtterance);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  state.voiceRead = false;
  const btn = $('btn-voice');
  if (btn) btn.setAttribute('aria-pressed', 'false');
}

function toggleSpeech() {
  if (state.voiceRead) {
    stopSpeech();
    announce('Озвучивание остановлено');
  } else {
    announce('Начинаю озвучивание страницы');
    startSpeech();
  }
}

// ─── Microphone / Voice Commands ──────────────────────────────────
let recognition = null;

function buildRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = 'ru-RU';
  r.continuous = true;
  r.interimResults = false;
  return r;
}

const voiceCommands = [
  { patterns: ['увеличить', 'больше', 'крупнее'],  action: increaseFontSize },
  { patterns: ['уменьшить', 'меньше', 'мельче'],   action: decreaseFontSize },
  { patterns: ['контраст'],                          action: toggleContrast   },
  { patterns: ['отступ', 'пробел'],                  action: toggleSpacing    },
  { patterns: ['прочитать', 'читать', 'озвучить'],   action: startSpeech      },
  { patterns: ['стоп', 'хватит', 'замолчи'],         action: stopSpeech       },
];

function handleVoiceResult(transcript) {
  const t = transcript.toLowerCase().trim();
  const statusEl = $('voice-status');
  if (statusEl) statusEl.textContent = `Услышано: «${t}»`;

  for (const cmd of voiceCommands) {
    if (cmd.patterns.some(p => t.includes(p))) {
      cmd.action();
      return;
    }
  }
  announce(`Команда не распознана: ${t}`);
}

function startMic() {
  if (!recognition) {
    recognition = buildRecognition();
    if (!recognition) {
      announce('Голосовой ввод не поддерживается вашим браузером');
      return;
    }
    recognition.onresult = e => {
      const last = e.results[e.results.length - 1];
      if (last.isFinal) handleVoiceResult(last[0].transcript);
    };
    recognition.onerror = err => {
      const msg = err.error === 'not-allowed'
        ? 'Доступ к микрофону запрещён. Разрешите в настройках браузера.'
        : `Ошибка: ${err.error}`;
      announce(msg);
      stopMic();
    };
    recognition.onend = () => {
      if (state.micActive) recognition.start(); // keep alive
    };
  }
  state.micActive = true;
  document.body.classList.add('voice-active');
  recognition.start();

  const btn = $('btn-mic');
  const lbl = $('mic-label');
  const sts = $('voice-status');
  if (btn) btn.setAttribute('aria-pressed', 'true');
  if (lbl) lbl.textContent = 'Остановить запись';
  if (sts) sts.textContent = 'Слушаю команду…';
  announce('Голосовое управление активировано. Говорите команду.');
}

function stopMic() {
  state.micActive = false;
  document.body.classList.remove('voice-active');
  if (recognition) { try { recognition.stop(); } catch (_) {} }

  const btn = $('btn-mic');
  const lbl = $('mic-label');
  const sts = $('voice-status');
  if (btn) btn.setAttribute('aria-pressed', 'false');
  if (lbl) lbl.textContent = 'Начать запись';
  if (sts) sts.textContent = 'Голосовое управление не активно';
  announce('Голосовое управление остановлено');
}

function toggleMic() {
  state.micActive ? stopMic() : startMic();
}

// ─── Hover-to-Speak ───────────────────────────────────────────────
// Selectors: all readable text elements on the page
const HOVER_SELECTOR = [
  'h1', 'h2', 'h3', 'h4',
  'p', 'li', 'a', 'button',
  'kbd', 'label',
  '.feature-title', '.feature-text',
  '.shortcut-desc', '.hero__eyebrow',
  '.hero__desc', '.voice-commands',
  '.section-desc', '.section-title',
  '.brand-label', '.a11y-btn',
  '.footer-hint',
].join(',');

let hoverTimer   = null;   // debounce delay before speaking
let lastHovered  = null;   // last element spoken
const HOVER_DELAY = 400;   // ms pause before speaking

/** Extract readable text from an element */
function getElementText(el) {
  // prefer aria-label, then innerText
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.innerText ||
    ''
  ).trim().replace(/\s+/g, ' ');
}

/** Speak a short string immediately (interrupts current hover speech) */
function speakHover(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'ru-RU';
  utt.rate  = 1.0;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

/** Show a floating tooltip above the cursor */
let tooltip = null;
function showTooltip(text, x, y) {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'hover-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
  }
  tooltip.textContent = text.length > 80 ? text.slice(0, 80) + '…' : text;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = (y - 48) + 'px';
  tooltip.classList.add('visible');
}
function hideTooltip() {
  if (tooltip) tooltip.classList.remove('visible');
}

/** Main mouseover handler */
function onHoverSpeak(e) {
  if (!state.hoverSpeak) return;

  // Find closest readable ancestor
  const target = e.target.closest(HOVER_SELECTOR);
  if (!target || target === lastHovered) return;
  if (target.getAttribute('aria-hidden') === 'true') return;

  lastHovered = target;
  clearTimeout(hoverTimer);

  hoverTimer = setTimeout(() => {
    const text = getElementText(target);
    if (!text) return;
    speakHover(text);
    showTooltip(text, e.clientX, e.clientY);
  }, HOVER_DELAY);
}

function onMouseOut(e) {
  if (!state.hoverSpeak) return;
  clearTimeout(hoverTimer);
  // only hide tooltip when leaving to a non-child element
  if (!e.currentTarget.contains(e.relatedTarget)) {
    hideTooltip();
  }
}

function onMouseMove(e) {
  if (tooltip && tooltip.classList.contains('visible')) {
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top  = (e.clientY - 48) + 'px';
  }
}

/** Wire / unwire hover listeners */
function enableHoverSpeak() {
  document.addEventListener('mouseover', onHoverSpeak);
  document.addEventListener('mouseleave', onMouseOut, true);
  document.addEventListener('mousemove', onMouseMove);
  document.body.classList.add('hover-speak-active');
}
function disableHoverSpeak() {
  document.removeEventListener('mouseover', onHoverSpeak);
  document.removeEventListener('mouseleave', onMouseOut, true);
  document.removeEventListener('mousemove', onMouseMove);
  document.body.classList.remove('hover-speak-active');
  clearTimeout(hoverTimer);
  hideTooltip();
  lastHovered = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function toggleHoverSpeak() {
  state.hoverSpeak = !state.hoverSpeak;
  const btn = $('btn-hover');
  if (btn) btn.setAttribute('aria-pressed', String(state.hoverSpeak));
  if (state.hoverSpeak) {
    enableHoverSpeak();
    announce('Озвучивание при наведении включено. Наводите курсор на текст.');
  } else {
    disableHoverSpeak();
    announce('Озвучивание при наведении выключено');
  }
}

// ─── Keyboard Shortcuts ───────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!e.altKey) return;
  switch (e.key) {
    case '+':
    case '=': e.preventDefault(); increaseFontSize(); break;
    case '-':
    case '_': e.preventDefault(); decreaseFontSize(); break;
    case 'c':
    case 'C': e.preventDefault(); toggleContrast();   break;
    case 'v':
    case 'V': e.preventDefault(); toggleSpeech();     break;
    case 's':
    case 'S': e.preventDefault(); toggleSpacing();    break;
    case 'h':
    case 'H': e.preventDefault(); toggleHoverSpeak(); break;
    case '1': e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); break;
    case '2': {
      const feat = $('features');
      if (feat) feat.scrollIntoView({ behavior: 'smooth' });
      break;
    }
  }
});

// ─── Button Wiring ────────────────────────────────────────────────
function wireButtons() {
  const map = {
    'btn-font-up':   increaseFontSize,
    'btn-font-down': decreaseFontSize,
    'btn-contrast':  toggleContrast,
    'btn-spacing':   toggleSpacing,
    'btn-voice':     toggleSpeech,
    'btn-mic':       toggleMic,
    'btn-hover':     toggleHoverSpeak,
  };
  for (const [id, fn] of Object.entries(map)) {
    const el = $(id);
    if (el) el.addEventListener('click', fn);
  }
}

// ─── Init ─────────────────────────────────────────────────────────
function init() {
  loadState();
  applyFontSize();
  applyContrast();
  applySpacing();
  wireButtons();

  // Trap focus hint for skip link
  const skip = qs('.skip-link');
  if (skip) {
    skip.addEventListener('click', () => {
      const main = $('main-content');
      if (main) { main.focus(); }
    });
  }

  announce('Инклюзивный режим загружен. Используйте Tab для навигации.');
}

document.addEventListener('DOMContentLoaded', init);
