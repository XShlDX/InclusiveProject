// ── Chat.js — без import, RequestData берётся из window ──

// ── СОСТОЯНИЕ ──────────────────────────────────────────
let chatOpen = false;
let chatBusy = false;
let chatHistory = [];

// ── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
function initChat() {
  document.getElementById('cp-provider').textContent = 'AI Assistant';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ОТКРЫТЬ / ЗАКРЫТЬ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function toggleChat() {

  chatOpen = !chatOpen;

  const popup = document.getElementById('chat-popup');
  const fab = document.getElementById('chat-fab');
  const badge = document.getElementById('chat-fab-badge');

  popup.classList.toggle('open', chatOpen);
  fab.classList.toggle('open', chatOpen);

  if (chatOpen) {

    badge.style.display = 'none';

    setTimeout(() => {
      document.getElementById('cp-input').focus();
      scrollToBottom();
    }, 60);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ОТПРАВИТЬ СООБЩЕНИЕ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function chatSend() {

  if (chatBusy) return;

  const input = document.getElementById('cp-input');
  const text = input.value.trim();

  if (!text) return;

  input.value = '';
  input.style.height = '';

  chatHistory.push({
    role: 'user',
    parts: [{ text }]
  });

  appendMessage('user', text);

  scrollToBottom();

  setBusy(true);
  showTyping(true);

  let reply = '';

  try {

    // Получаем ПОЛНЫЙ ответ от сервера
    const data = await window.RequestData.sendPrompt(text, 'incl');

    reply = data.reply || 'Нет ответа';

    // Выполняем action если сервер вернул его
    if (data.action) {
      executeAction(data.action);
    }

  } catch (err) {

    console.error('Chat error:', err);

    reply = '⚠️ Ошибка при обращении к серверу. Попробуй позже.';
  }

  chatHistory.push({
    role: 'model',
    parts: [{ text: reply }]
  });

  showTyping(false);

  appendMessage('ai', reply);

  scrollToBottom();

  setBusy(false);

  if (!chatOpen) {
    document.getElementById('chat-fab-badge').style.display = 'flex';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ВСПОМОГАТЕЛЬНЫЕ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function chatHandleKey(e) {

  if (e.key === 'Enter' && !e.shiftKey) {

    e.preventDefault();

    chatSend();
  }
}

function chatAutoResize(el) {

  el.style.height = '';

  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function appendMessage(role, text) {

  const feed = document.getElementById('cp-messages');

  const row = document.createElement('div');

  row.className = `cp-msg-row ${role === 'ai' ? 'cp-ai' : 'cp-user'}`;

  const bubble = document.createElement('div');

  bubble.className =
    `cp-bubble ${role === 'ai'
      ? 'cp-bubble-ai'
      : 'cp-bubble-user'
    }`;

  bubble.innerHTML =
    text
      .split('\n')
      .filter(l => l.trim() !== '')
      .map(l => `<p>${escapeHtml(l)}</p>`)
      .join('')
    +
    `<span class="cp-time">${getTime()}</span>`;

  row.appendChild(bubble);

  feed.appendChild(row);
}

function clearChat() {

  chatHistory = [];

  document.getElementById('cp-messages').innerHTML = `
    <div class="cp-msg-row cp-ai">
      <div class="cp-bubble cp-bubble-ai">
        <p>Чат очищен. Задай новый вопрос! 🎵</p>
        <span class="cp-time">${getTime()}</span>
      </div>
    </div>
  `;
}

function escapeHtml(str) {

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTime() {

  return new Date().toLocaleTimeString(
    'ru-RU',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}

function showTyping(show) {

  document.getElementById('cp-typing').style.display =
    show ? 'block' : 'none';

  if (show) scrollToBottom();
}

function setBusy(busy) {

  chatBusy = busy;

  document.getElementById('cp-send').disabled = busy;
  document.getElementById('cp-input').disabled = busy;

  const status = document.getElementById('cp-status');

  if (busy) {

    status.textContent = 'Печатает...';

    status.classList.add('thinking');

  } else {

    status.textContent = 'Онлайн';

    status.classList.remove('thinking');
  }
}

function scrollToBottom() {

  const feed = document.getElementById('cp-messages');

  feed.scrollTop = feed.scrollHeight;
}

window.toggleChat = toggleChat;
window.chatSend = chatSend;
window.chatHandleKey = chatHandleKey;
window.chatAutoResize = chatAutoResize;
window.clearChat = clearChat;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ВЫПОЛНЕНИЕ ДЕЙСТВИЙ ДОСТУПНОСТИ
// Вызывает функции из accessibility.js (экспортированы в window)
// script.js также вызывает их через AI_FUNCTIONS — дублирования нет,
// т.к. script.js проверяет window[fnName]?.() что то же самое
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function executeAction(action) {
  const ACTIONS = {
    toggleContrast:   () => window.toggleContrast?.(),
    toggleSpacing:    () => window.toggleSpacing?.(),
    increaseFontSize: () => window.increaseFontSize?.(),
    decreaseFontSize: () => window.decreaseFontSize?.(),
    toggleHoverSpeak: () => window.toggleHoverSpeak?.(),
    toggleSpeech:     () => window.toggleSpeech?.(),
    toggleMic:        () => window.toggleMic?.(),
    goHome:           () => window.goHome?.(),
    restartQuiz:      () => window.restartCurrentTopic?.(),
  };

  const fn = ACTIONS[action];
  if (fn) {
    console.log('[Chat.js] executeAction:', action);
    fn();
  } else {
    console.warn('[Chat.js] Неизвестный action:', action);
  }
}
