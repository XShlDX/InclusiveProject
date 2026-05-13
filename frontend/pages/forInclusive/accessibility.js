/* =========================================================
   KahoSound — accessibility controls
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'kahosound-a11y';

  const state = {
    fontSize: 18,
    fontMin: 14,
    fontMax: 32,
    fontStep: 2,
    highContrast: false,
    wideSpacing: false,
    hoverSpeak: false,
    toneHintsMuted: false,
    voiceRead: false,
    micActive: false
  };

  let speechUtterance = null;
  let recognition = null;
  let hoverTimer = null;
  let lastHovered = null;
  let tooltip = null;
  let actions = {};

  const HOVER_SELECTOR = [
    'h1',
    'h2',
    'h3',
    'p',
    'button',
    '.nav-item',
    '.topic-card',
    '.answer-tile',
    '.cp-bubble'
  ].join(',');

  function init(options = {}) {
    actions = options;

    loadState();
    applyFontSize();
    applyContrast();
    applySpacing();
    applyToneHints();

    bindClick('btn-font-up', increaseFontSize);
    bindClick('btn-font-down', decreaseFontSize);
    bindClick('btn-contrast', toggleContrast);
    bindClick('btn-spacing', toggleSpacing);
    bindClick('btn-hover-speak', toggleHoverSpeak);
    bindClick('btn-tone-hints', toggleToneHints);
    bindClick('btn-voice', toggleSpeech);
    bindClick('btn-mic', toggleMic);

    document.addEventListener('keydown', handleShortcut);
    announce('Инклюзивный режим загружен. Используйте Tab для навигации.');
  }

  function bindClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  function saveState() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      fontSize: state.fontSize,
      highContrast: state.highContrast,
      wideSpacing: state.wideSpacing,
      toneHintsMuted: state.toneHintsMuted
    }));
  }

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.fontSize) state.fontSize = saved.fontSize;
      if (saved.highContrast) state.highContrast = saved.highContrast;
      if (saved.wideSpacing) state.wideSpacing = saved.wideSpacing;
      if (saved.toneHintsMuted) state.toneHintsMuted = saved.toneHintsMuted;
    } catch (_) {
      // Broken saved data should not block the page.
    }
  }

  function applyFontSize() {
    const value = state.fontSize + 'px';
    document.documentElement.style.setProperty('--font-base', value);
    document.documentElement.style.fontSize = value;
    document.body.style.fontSize = value;
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

  function applyContrast() {
    document.body.classList.toggle('high-contrast', state.highContrast);
    setPressed('btn-contrast', state.highContrast);
  }

  function toggleContrast() {
    state.highContrast = !state.highContrast;
    applyContrast();
    saveState();
    announce(state.highContrast ? 'Высокий контраст включён' : 'Высокий контраст выключен');
  }

  function applySpacing() {
    document.body.classList.toggle('wide-spacing', state.wideSpacing);
    setPressed('btn-spacing', state.wideSpacing);
  }

  function toggleSpacing() {
    state.wideSpacing = !state.wideSpacing;
    applySpacing();
    saveState();
    announce(state.wideSpacing ? 'Увеличенные отступы включены' : 'Увеличенные отступы выключены');
  }

  function applyToneHints() {
    setPressed('btn-tone-hints', state.toneHintsMuted);
  }

  function toggleToneHints() {
    state.toneHintsMuted = !state.toneHintsMuted;
    applyToneHints();
    saveState();
    announce(state.toneHintsMuted
      ? 'Тоновые подсказки при наведении выключены'
      : 'Тоновые подсказки при наведении включены');
  }

  function areToneHintsMuted() {
    return state.toneHintsMuted;
  }

  function setPressed(id, value) {
    const btn = document.getElementById(id);
    if (btn) btn.setAttribute('aria-pressed', String(value));
  }

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
      state.voiceRead = true;
      setPressed('btn-voice', true);
    };

    speechUtterance.onend = speechUtterance.onerror = () => {
      state.voiceRead = false;
      setPressed('btn-voice', false);
    };

    window.speechSynthesis.speak(speechUtterance);
  }

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.voiceRead = false;
    setPressed('btn-voice', false);
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

  function buildRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.lang = 'ru-RU';
    instance.continuous = true;
    instance.interimResults = false;
    return instance;
  }

  function handleVoiceResult(transcript) {
    const phrase = transcript.toLowerCase().trim();
    const voiceCommands = [
      { patterns: ['увеличить', 'больше', 'крупнее'], action: increaseFontSize },
      { patterns: ['уменьшить', 'меньше', 'мельче'], action: decreaseFontSize },
      { patterns: ['контраст'], action: toggleContrast },
      { patterns: ['отступ', 'интервал', 'пробел'], action: toggleSpacing },
      { patterns: ['тон', 'звуки', 'подсказки'], action: toggleToneHints },
      { patterns: ['прочитать', 'читать', 'озвучить'], action: startSpeech },
      { patterns: ['стоп', 'хватит', 'замолчи'], action: stopSpeech },
      { patterns: ['меню', 'домой'], action: actions.goHome }
    ];

    for (const command of voiceCommands) {
      if (command.action && command.patterns.some(pattern => phrase.includes(pattern))) {
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
        if (state.micActive) recognition.start();
      };
    }

    state.micActive = true;
    document.body.classList.add('voice-active');
    recognition.start();
    setPressed('btn-mic', true);

    const label = document.getElementById('mic-label');
    if (label) label.textContent = 'Слушаю';
    announce('Голосовое управление активировано. Говорите команду.');
  }

  function stopMic() {
    state.micActive = false;
    document.body.classList.remove('voice-active');

    if (recognition) {
      try {
        recognition.stop();
      } catch (_) {
        // Recognition can already be stopped.
      }
    }

    setPressed('btn-mic', false);

    const label = document.getElementById('mic-label');
    if (label) label.textContent = 'Голос';
    announce('Голосовое управление остановлено');
  }

  function toggleMic() {
    state.micActive ? stopMic() : startMic();
  }

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
    if (!state.hoverSpeak) return;

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
    state.hoverSpeak = !state.hoverSpeak;
    setPressed('btn-hover-speak', state.hoverSpeak);

    if (state.hoverSpeak) {
      enableHoverSpeak();
      announce('Озвучивание при наведении включено');
    } else {
      disableHoverSpeak();
      announce('Озвучивание при наведении выключено');
    }
  }

  function handleShortcut(event) {
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
    const el = document.getElementById('sr-announcer');
    if (!el) return;

    el.textContent = '';
    setTimeout(() => {
      el.textContent = msg;
    }, 50);
  }

  window.KahoA11y = {
    init,
    areToneHintsMuted,
    announce
  };

  // Экспортируем функции управления глобально —
  // чтобы script.js мог вызывать их через window.toggleContrast() и т.д.
  window.toggleContrast   = toggleContrast;
  window.toggleSpacing    = toggleSpacing;
  window.increaseFontSize = increaseFontSize;
  window.decreaseFontSize = decreaseFontSize;
  window.toggleHoverSpeak = toggleHoverSpeak;
  window.toggleSpeech     = toggleSpeech;
  window.toggleMic        = toggleMic;
})();