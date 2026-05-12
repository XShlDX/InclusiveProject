// ── GEMINI CONFIG ──────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyCBEF0CVLMq5_kgFx08tcaxiHfn90WQudk';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── СОСТОЯНИЕ ──────────────────────────────────────────
let chatOpen    = false;
let chatBusy    = false;
let chatHistory = [];

// ── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
function initChat() {
  document.getElementById('cp-provider').textContent = 'Gemini AI';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

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

  chatHistory.push({ role: 'user', parts: [{ text }] });
  appendMessage('user', text);
  scrollToBottom();

  setBusy(true);
  showTyping(true);

  let reply = '';
  try {
    reply = await callGemini(text);
  } catch (err) {
    console.error('Gemini error:', err);
    reply = '⚠️ Ошибка при обращении к Gemini. Проверь API ключ.';
  }

  chatHistory.push({ role: 'model', parts: [{ text: reply }] });

  showTyping(false);
  appendMessage('ai', reply);
  scrollToBottom();
  setBusy(false);

  if (!chatOpen) {
    document.getElementById('chat-fab-badge').style.display = 'flex';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ВЫЗОВ GEMINI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callGemini(userText) {
  const body = {
    system_instruction: {
      parts: [{
        text: `Ты умный помощник приложения KahoSound — музыкального квиза.
        Отвечай на русском языке, кратко и понятно.

        Структура сайта:
        - Главная страница с выбором режима (Обычный / Инклюзивный)
        - Квиз с темами: Физика звука, Инструменты, Компьютеры, Космос, Мстители
        - На главном экране квиза есть карточки тем — можно кликнуть прямо на них
        - Боковое меню слева — там тоже можно выбрать тему
        - Тема "Мстители" есть и в боковом меню, и в карточках на главном экране (нужно прокрутить вправо или вниз)
        - Кнопка "На главную" возвращает на стартовый экран
        - Настройки доступности: контраст, отступы, размер шрифта, озвучка, голосовой ввод

        Помогай пользователю ориентироваться в сайте и отвечай на вопросы о музыке, звуке, инструментах и квизе.
        Если не знаешь — честно скажи об этом.`
      }]
    },
    contents: [
      ...chatHistory.slice(0, -1),
      { role: 'user', parts: [{ text: userText }] }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'HTTP ' + res.status);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '🤔 Нет ответа от Gemini.';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ВСПОМОГАТЕЛЬНЫЕ
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
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

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

window.toggleChat     = toggleChat;
window.chatSend       = chatSend;
window.chatHandleKey  = chatHandleKey;
window.chatAutoResize = chatAutoResize;
window.clearChat      = clearChat;