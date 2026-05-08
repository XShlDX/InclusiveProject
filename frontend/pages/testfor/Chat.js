import { RequestData } from '/frontend/modules/script.js';

// ── НАСТРОЙКИ ──────────────────────────────────────────
const CHAT_CONFIG = {
  providerName: 'KahoSound AI',
};

// ── СОСТОЯНИЕ ──────────────────────────────────────────
let chatOpen    = false;
let chatBusy    = false;
let chatHistory = [];

// ── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('cp-provider').textContent = CHAT_CONFIG.providerName;

  try {
    const history = await RequestData.getHistory();
    if (Array.isArray(history) && history.length > 0) {
      chatHistory = history;
      history.forEach(msg => {
        appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
      });
      scrollToBottom();
    }
  } catch (err) {
    console.warn('Не удалось загрузить историю:', err);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ОТКРЫТЬ / ЗАКРЫТЬ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function toggleChat() {
  chatOpen = !chatOpen;
  const popup = document.getElementById('chat-popup');
  const fab   = document.getElementById('chat-fab');
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
//  ОТПРАВИТЬ СООБЩЕНИЕ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function chatSend() {
  if (chatBusy) return;

  const input = document.getElementById('cp-input');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = '';
  chatHistory.push({ role: 'user', content: text });
  appendMessage('user', text);
  scrollToBottom();

  setBusy(true);
  showTyping(true);

  let reply = '';
  try {
    reply = await callAI(chatHistory);
  } catch (err) {
    console.error('Chat AI error:', err);
    reply = '⚠️ Ошибка при обращении к AI.';
  }

  showTyping(false);
  chatHistory.push({ role: 'assistant', content: reply });
  appendMessage('ai', reply);
  scrollToBottom();
  setBusy(false);

  if (!chatOpen) {
    document.getElementById('chat-fab-badge').style.display = 'flex';
  }
}

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ВЫЗОВ AI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callAI(messages) {
  const lastMessage = messages[messages.length - 1].content;
  const response = await RequestData.sendPrompt(lastMessage);

  if (typeof response === 'string') return response;
  if (response?.reply)              return response.reply;
  if (response?.content)            return response.content;
  if (response?.text)               return response.text;
  if (response?.message)            return response.message;

  throw new Error('Неизвестный формат ответа: ' + JSON.stringify(response));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  РЕНДЕР СООБЩЕНИЯ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function appendMessage(role, text) {
  const feed = document.getElementById('cp-messages');
  const row  = document.createElement('div');
  row.className = `cp-msg-row ${role === 'ai' ? 'cp-ai' : 'cp-user'}`;

  const bubble = document.createElement('div');
  bubble.className = `cp-bubble ${role === 'ai' ? 'cp-bubble-ai' : 'cp-bubble-user'}`;
  bubble.innerHTML = text
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(l => `<p>${escapeHtml(l)}</p>`)
    .join('') +
    `<span class="cp-time">${getTime()}</span>`;

  row.appendChild(bubble);
  feed.appendChild(row);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ОЧИСТИТЬ ЧАТ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ВСПОМОГАТЕЛЬНЫЕ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showTyping(show) {
  document.getElementById('cp-typing').style.display = show ? 'block' : 'none';
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ЭКСПОРТ В WINDOW — чтобы onclick в HTML работал
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.toggleChat    = toggleChat;
window.chatSend      = chatSend;
window.chatHandleKey = chatHandleKey;
window.chatAutoResize = chatAutoResize;
window.clearChat     = clearChat;