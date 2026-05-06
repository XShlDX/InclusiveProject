/* =========================================================
   KahoSound — chat.js
   Плавающий AI-чат

   ╔══════════════════════════════════════════════════════╗
   ║  КАК ПОДКЛЮЧИТЬ СВОЕГО AI                            ║
   ╠══════════════════════════════════════════════════════╣
   ║  Найди функцию callAI() ниже и замени тело           ║
   ║  на вызов своего API.                                ║
   ║                                                      ║
   ║  Функция получает:                                   ║
   ║    messages — массив истории чата:                   ║
   ║    [ { role: 'user'|'assistant', content: '...' } ] ║
   ║                                                      ║
   ║  Функция должна вернуть строку — ответ AI.           ║
   ║                                                      ║
   ║  Примеры подключения:                                ║
   ║    OpenAI    → смотри блок // OPENAI                 ║
   ║    Anthropic → смотри блок // ANTHROPIC              ║
   ║    Кастомный → смотри блок // CUSTOM                 ║
   ╚══════════════════════════════════════════════════════╝
   ========================================================= */


// ── НАСТРОЙКИ ──────────────────────────────────────────
const CHAT_CONFIG = {
  providerName: 'Your AI',          // отображается в подписи
  systemPrompt:                     // роль AI (можно менять)
    'Ты умный и дружелюбный помощник образовательной платформы KahoSound. ' +
    'Помогаешь ученикам разобраться в теме музыки и звука. ' +
    'Отвечай кратко, по-русски, с эмодзи где уместно.',
};


// ── СОСТОЯНИЕ ──────────────────────────────────────────
let chatOpen    = false;
let chatBusy    = false;
let chatHistory = [];   // { role, content }[]


// ── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cp-provider').textContent = CHAT_CONFIG.providerName;
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

  // добавить сообщение пользователя
  input.value = '';
  input.style.height = '';
  chatHistory.push({ role: 'user', content: text });
  appendMessage('user', text);
  scrollToBottom();

  // заблокировать UI
  setBusy(true);
  showTyping(true);

  // вызов AI
  let reply = '';
  try {
    reply = await callAI(chatHistory);
  } catch (err) {
    console.error('Chat AI error:', err);
    reply = '⚠️ Произошла ошибка при обращении к AI. Проверь настройки подключения в chat.js.';
  }

  // показать ответ
  showTyping(false);
  chatHistory.push({ role: 'assistant', content: reply });
  appendMessage('ai', reply);
  scrollToBottom();
  setBusy(false);

  // значок если чат закрыт
  if (!chatOpen) {
    const badge = document.getElementById('chat-fab-badge');
    badge.style.display = 'flex';
  }
}

function chatHandleKey(e) {
  // Enter без Shift — отправить
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
//  РЕНДЕР СООБЩЕНИЯ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function appendMessage(role, text) {
  const feed = document.getElementById('cp-messages');

  const row    = document.createElement('div');
  row.className = `cp-msg-row ${role === 'ai' ? 'cp-ai' : 'cp-user'}`;

  const bubble = document.createElement('div');
  bubble.className = `cp-bubble ${role === 'ai' ? 'cp-bubble-ai' : 'cp-bubble-user'}`;

  // простая обработка переносов строк → <p>
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
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function getTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ОЧИСТИТЬ ЧАТ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function clearChat() {
  chatHistory = [];
  const feed  = document.getElementById('cp-messages');
  feed.innerHTML = `
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


/* =========================================================
   callAI — ПОДКЛЮЧИ СВОЕГО AI СЮДА
   =========================================================
   messages: [ { role: 'user'|'assistant', content: string } ]
   Верни: строку с ответом AI
   ========================================================= */
async function callAI(messages) {

  // ── ЗАГЛУШКА (работает без API) ────────────────────────
  // Удали этот блок когда подключишь реальный AI
  await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
  const last = messages[messages.length - 1].content.toLowerCase();
  if (last.includes('привет') || last.includes('hello'))
    return 'Привет! 👋 Чем могу помочь?';
  if (last.includes('звук'))
    return 'Звук — это механические волны, которые распространяются через среду. Частота звука измеряется в герцах (Гц) 🎵';
  if (last.includes('нот') || last.includes('музык'))
    return 'В западной музыке используют 12 нот в октаве: до, до#, ре, ре#, ми, фа, фа#, соль, соль#, ля, ля#, си 🎼';
  return 'Интересный вопрос! Я пока в режиме заглушки. Подключи реального AI в функции callAI() в файле chat.js 🤖';
  // ── КОНЕЦ ЗАГЛУШКИ ─────────────────────────────────────


  /* ══════════════════════════════════════════════════════
     // OPENAI — раскомментируй и вставь свой API ключ

  const API_KEY = 'sk-...';   // ← твой ключ

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CHAT_CONFIG.systemPrompt },
        ...messages
      ],
      max_tokens: 600,
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices[0].message.content.trim();

  ══════════════════════════════════════════════════════ */


  /* ══════════════════════════════════════════════════════
     // ANTHROPIC (Claude) — раскомментируй и вставь ключ

  const API_KEY = 'sk-ant-...';   // ← твой ключ

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: CHAT_CONFIG.systemPrompt,
      messages: messages
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.content[0].text.trim();

  ══════════════════════════════════════════════════════ */


  /* ══════════════════════════════════════════════════════
     // CUSTOM — свой backend/прокси

  const res = await fetch('https://твой-сервер.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: CHAT_CONFIG.systemPrompt,
      messages: messages
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.reply;   // или data.text, data.answer — как у тебя

  ══════════════════════════════════════════════════════ */
} 