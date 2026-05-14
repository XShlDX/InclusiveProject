/* =========================================================
   KahoSound — Voice Control System
   Web Speech API · SpeechRecognition
   ========================================================= */

'use strict';

const VoiceControl = (() => {

  // ── STATE ──────────────────────────────────────────────
  let recognition = null;
  let isListening = false;
  let waveInterval = null;
  let feedbackTimeout = null;

  // ── COMMAND MAP ────────────────────────────────────────
  // Each entry: { patterns: [regex...], action: fn, label: string }
  const COMMANDS = [
    {
      label: 'На главную',
      hint: 'Скажи «главная» или «домой»',
      patterns: [/главн/i, /домой/i, /меню/i, /home/i],
      action: () => {
        if (window.goHome) window.goHome();
        announce('Переход на главную');
      }
    },
    {
      label: 'Открыть меню',
      hint: 'Скажи «открыть меню» или «боковая панель»',
      patterns: [/открыть меню/i, /открой меню/i, /боков/i, /sidebar/i],
      action: () => {
        if (window.toggleSidebar) window.toggleSidebar();
        announce('Боковое меню открыто');
      }
    },
    {
      label: 'Повторить квиз',
      hint: 'Скажи «ещё раз» или «заново»',
      patterns: [/ещ.? раз/i, /заново/i, /повтор/i, /restart/i],
      action: () => {
        if (window.restartCurrentTopic) window.restartCurrentTopic();
        announce('Квиз начат заново');
      }
    },
    {
      label: 'Увеличить шрифт',
      hint: 'Скажи «шрифт больше» или «крупнее»',
      patterns: [/шрифт больш/i, /крупн/i, /увеличь/i, /font up/i],
      action: () => {
        if (window.KahoA11y?.increaseFontSize) window.KahoA11y.increaseFontSize();
        announce('Шрифт увеличен');
      }
    },
    {
      label: 'Уменьшить шрифт',
      hint: 'Скажи «шрифт меньше» или «мельче»',
      patterns: [/шрифт меньш/i, /мельч/i, /уменьш/i, /font down/i],
      action: () => {
        if (window.KahoA11y?.decreaseFontSize) window.KahoA11y.decreaseFontSize();
        announce('Шрифт уменьшен');
      }
    },
    {
      label: 'Контраст',
      hint: 'Скажи «контраст» для переключения',
      patterns: [/контраст/i, /contrast/i],
      action: () => {
        if (window.KahoA11y?.toggleContrast) window.KahoA11y.toggleContrast();
        announce('Контраст переключён');
      }
    },
    {
      label: 'Озвучить',
      hint: 'Скажи «прочитай» или «озвучь»',
      patterns: [/прочит/i, /озвуч/i, /читай/i, /speak/i],
      action: () => {
        if (window.KahoA11y?.toggleSpeech) window.KahoA11y.toggleSpeech();
        announce('Озвучивание страницы');
      }
    },
    {
      label: 'Тема: Звук',
      hint: 'Скажи «тема звук»',
      patterns: [/тем.* звук/i, /quiz.*sound/i, /звук/i],
      action: () => {
        if (window.startTopic) window.startTopic('sound');
        announce('Тема: Физика звука');
      }
    },
    {
      label: 'Тема: Инструменты',
      hint: 'Скажи «тема инструменты»',
      patterns: [/инструмент/i, /instrument/i],
      action: () => {
        if (window.startTopic) window.startTopic('instruments');
        announce('Тема: Инструменты');
      }
    },
    {
      label: 'Тема: Компьютеры',
      hint: 'Скажи «тема компьютеры»',
      patterns: [/компьютер/i, /computer/i],
      action: () => {
        if (window.startTopic) window.startTopic('computers');
        announce('Тема: Компьютеры');
      }
    },
    {
      label: 'Тема: Космос',
      hint: 'Скажи «тема космос»',
      patterns: [/космос/i, /space/i],
      action: () => {
        if (window.startTopic) window.startTopic('space');
        announce('Тема: Космос');
      }
    },
    {
      label: 'Тема: Мстители',
      hint: 'Скажи «тема мстители»',
      patterns: [/мститель/i, /avenger/i],
      action: () => {
        if (window.startTopic) window.startTopic('avengers');
        announce('Тема: Мстители');
      }
    },
    {
      label: 'Список команд',
      hint: 'Скажи «команды» или «помощь»',
      patterns: [/команд/i, /помощ/i, /help/i, /что умееш/i],
      action: () => {
        showCommandPanel();
        announce('Список команд открыт');
      }
    }
  ];

  // ── INIT ───────────────────────────────────────────────
  function init() {
    injectStyles();
    injectUI();
    bindMicButton();
  }

  // ── STYLES ─────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('vc-styles')) return;
    const style = document.createElement('style');
    style.id = 'vc-styles';
    style.textContent = `
      /* ── MIC FAB ── */
      #vc-mic-btn {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: none;
        background: #1a1a2e;
        color: #fff;
        font-size: 22px;
        cursor: pointer;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        transition: transform 0.15s ease, background 0.2s ease;
      }
      #vc-mic-btn:hover { transform: scale(1.08); }
      #vc-mic-btn.active {
        background: #c0392b;
        animation: vc-pulse-ring 1.4s ease-out infinite;
      }

      /* ── PULSE RING ── */
      @keyframes vc-pulse-ring {
        0%   { box-shadow: 0 0 0 0 rgba(192,57,43,0.55); }
        70%  { box-shadow: 0 0 0 18px rgba(192,57,43,0); }
        100% { box-shadow: 0 0 0 0 rgba(192,57,43,0); }
      }

      /* ── WAVEFORM OVERLAY ── */
      #vc-wave-overlay {
        position: fixed;
        bottom: 156px;
        right: 16px;
        width: 68px;
        height: 40px;
        display: none;
        align-items: center;
        justify-content: center;
        gap: 4px;
        z-index: 999;
      }
      #vc-wave-overlay.visible { display: flex; }
      .vc-bar {
        width: 4px;
        border-radius: 2px;
        background: #c0392b;
        animation: vc-wave 0.7s ease-in-out infinite alternate;
      }
      .vc-bar:nth-child(1) { animation-delay: 0s;    height: 12px; }
      .vc-bar:nth-child(2) { animation-delay: 0.1s;  height: 20px; }
      .vc-bar:nth-child(3) { animation-delay: 0.2s;  height: 28px; }
      .vc-bar:nth-child(4) { animation-delay: 0.15s; height: 22px; }
      .vc-bar:nth-child(5) { animation-delay: 0.05s; height: 14px; }
      @keyframes vc-wave {
        from { transform: scaleY(0.4); opacity: 0.6; }
        to   { transform: scaleY(1.0); opacity: 1.0; }
      }

      /* ── FEEDBACK TOAST ── */
      #vc-feedback {
        position: fixed;
        bottom: 160px;
        right: 24px;
        max-width: 260px;
        background: #1a1a2e;
        color: #fff;
        font-size: 13px;
        line-height: 1.4;
        padding: 10px 14px;
        border-radius: 10px;
        z-index: 1001;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
      }
      #vc-feedback.show {
        opacity: 1;
        transform: translateY(0);
      }
      #vc-feedback .vc-fb-label {
        font-size: 11px;
        opacity: 0.6;
        margin-bottom: 3px;
      }
      #vc-feedback .vc-fb-heard {
        font-weight: 600;
        font-size: 14px;
      }
      #vc-feedback .vc-fb-action {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
      }
      #vc-feedback.error { background: #7b2d2d; }
      #vc-feedback.success { background: #1a4a2e; }

      /* ── COMMAND PANEL ── */
      #vc-cmd-panel {
        position: fixed;
        bottom: 88px;
        right: 86px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: #fff;
        border: 0.5px solid rgba(0,0,0,0.12);
        border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 1000;
        display: none;
        flex-direction: column;
      }
      #vc-cmd-panel.visible { display: flex; }
      .vc-cp-header {
        padding: 14px 16px 10px;
        font-size: 13px;
        font-weight: 700;
        color: #1a1a2e;
        border-bottom: 0.5px solid rgba(0,0,0,0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .vc-cp-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        line-height: 1;
        padding: 0;
      }
      .vc-cmd-item {
        padding: 10px 16px;
        border-bottom: 0.5px solid rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .vc-cmd-item:last-child { border-bottom: none; }
      .vc-cmd-label {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .vc-cmd-hint {
        font-size: 11px;
        color: #888;
      }

      /* ── SUPPORT FALLBACK ── */
      #vc-unsupported {
        display: none;
        position: fixed;
        bottom: 96px;
        right: 24px;
        background: #7b2d2d;
        color: #fff;
        font-size: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 200px;
        z-index: 1000;
      }
    `;
    document.head.appendChild(style);
  }

  // ── UI INJECTION ────────────────────────────────────────
  function injectUI() {
    // Mic button
    const btn = document.createElement('button');
    btn.id = 'vc-mic-btn';
    btn.title = 'Голосовое управление';
    btn.setAttribute('aria-label', 'Включить голосовое управление');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '🎙';
    document.body.appendChild(btn);

    // Waveform overlay
    const wave = document.createElement('div');
    wave.id = 'vc-wave-overlay';
    wave.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'vc-bar';
      wave.appendChild(bar);
    }
    document.body.appendChild(wave);

    // Feedback toast
    const fb = document.createElement('div');
    fb.id = 'vc-feedback';
    fb.setAttribute('role', 'status');
    fb.setAttribute('aria-live', 'polite');
    document.body.appendChild(fb);

    // Command panel
    const panel = document.createElement('div');
    panel.id = 'vc-cmd-panel';
    panel.setAttribute('aria-label', 'Список голосовых команд');
    panel.innerHTML = `
      <div class="vc-cp-header">
        🎙 Голосовые команды
        <button class="vc-cp-close" onclick="VoiceControl.hideCommandPanel()" aria-label="Закрыть">✕</button>
      </div>
      ${COMMANDS.map(c => `
        <div class="vc-cmd-item">
          <span class="vc-cmd-label">${c.label}</span>
          <span class="vc-cmd-hint">${c.hint}</span>
        </div>
      `).join('')}
    `;
    document.body.appendChild(panel);

    // Unsupported notice (hidden by default)
    const unsup = document.createElement('div');
    unsup.id = 'vc-unsupported';
    unsup.textContent = 'Голосовой ввод не поддерживается в этом браузере.';
    document.body.appendChild(unsup);
  }

  // ── MIC BUTTON BINDING ─────────────────────────────────
  function bindMicButton() {
    const btn = document.getElementById('vc-mic-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!isSupported()) {
        showUnsupported();
        return;
      }
      isListening ? stopListening() : startListening();
    });
  }

  // ── SPEECH RECOGNITION ─────────────────────────────────
  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function startListening() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      updateMicUI(true);
      showToast({ label: 'Слушаю...', heard: '', action: 'Говорите команду' }, 'normal');
    };

    recognition.onresult = (event) => {
      const results = Array.from(event.results[0]).map(r => r.transcript.trim());
      handleTranscript(results);
    };

    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Нет доступа к микрофону',
        'no-speech':   'Речь не распознана',
        'network':     'Нет соединения'
      };
      showToast({
        label: 'Ошибка',
        heard: messages[event.error] || event.error,
        action: ''
      }, 'error');
      stopListening();
    };

    recognition.onend = () => {
      if (isListening) {
        // restart for continuous feel if still toggled on
        stopListening();
      }
    };

    recognition.start();
  }

  function stopListening() {
    isListening = false;
    updateMicUI(false);
    try { recognition?.abort(); } catch (_) {}
  }

  // ── TRANSCRIPT → COMMAND ────────────────────────────────
  function handleTranscript(transcripts) {
    const heard = transcripts[0];

    for (const cmd of COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (transcripts.some(t => pattern.test(t))) {
          showToast({
            label: 'Услышано',
            heard: `"${heard}"`,
            action: `→ ${cmd.label}`
          }, 'success');
          cmd.action();
          stopListening();
          return;
        }
      }
    }

    // No match
    showToast({
      label: 'Не понял',
      heard: `"${heard}"`,
      action: 'Скажи «команды» для списка'
    }, 'error');
    stopListening();
  }

  // ── UI HELPERS ──────────────────────────────────────────
  function updateMicUI(active) {
    const btn  = document.getElementById('vc-mic-btn');
    const wave = document.getElementById('vc-wave-overlay');
    if (!btn || !wave) return;

    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
    btn.innerHTML = active ? '⏹' : '🎙';
    wave.classList.toggle('visible', active);

    // Also sync the sidebar mic button if it exists
    const sidebarMic = document.getElementById('btn-mic');
    if (sidebarMic) {
      sidebarMic.setAttribute('aria-pressed', String(active));
      const label = sidebarMic.querySelector('#mic-label');
      if (label) label.textContent = active ? 'Стоп' : 'Голос';
    }
  }

  function showToast({ label, heard, action }, type = 'normal') {
    const fb = document.getElementById('vc-feedback');
    if (!fb) return;

    fb.className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    fb.innerHTML = `
      <div class="vc-fb-label">${label}</div>
      ${heard ? `<div class="vc-fb-heard">${heard}</div>` : ''}
      ${action ? `<div class="vc-fb-action">${action}</div>` : ''}
    `;

    fb.classList.add('show');
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => fb.classList.remove('show'), 3000);
  }

  function announce(text) {
    const el = document.getElementById('sr-announcer');
    if (el) el.textContent = text;
  }

  function showCommandPanel() {
    document.getElementById('vc-cmd-panel')?.classList.add('visible');
  }

  function hideCommandPanel() {
    document.getElementById('vc-cmd-panel')?.classList.remove('visible');
  }

  function showUnsupported() {
    const el = document.getElementById('vc-unsupported');
    if (!el) return;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  // ── PUBLIC API ──────────────────────────────────────────
  return {
    init,
    startListening,
    stopListening,
    showCommandPanel,
    hideCommandPanel,
    isListening: () => isListening
  };

})();

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => VoiceControl.init());

// Expose globally
window.VoiceControl = VoiceControl;
