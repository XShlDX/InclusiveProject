function showTrack(track) {
    document.querySelectorAll('.track-section').forEach(s => s.classList.remove('visible'));
    document.getElementById('track-' + track).classList.add('visible');
    document.querySelectorAll('.track-tab').forEach(t => {
      t.className = 'track-tab';
    });
    const idx = ['html','css','js'].indexOf(track);
    document.querySelectorAll('.track-tab')[idx].className = 'track-tab active-' + track;

    // handle hash
    const hash = {'html':'#html','css':'#css','js':'#js'}[track];
    history.replaceState(null, '', hash);
  }

  // open from hash
  const h = location.hash.replace('#','');
  if(['html','css','js'].includes(h)) showTrack(h);











  const GEMINI_KEY = 'ТВОЙ_КЛЮЧ_СЮДА';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

let aiOpen = false;
let aiBusy = false;
let aiHistory = [];

function toggleAiChat() {
  aiOpen = !aiOpen;
  document.getElementById('aiChatPopup').classList.toggle('open', aiOpen);
  document.getElementById('aiFab').classList.toggle('open', aiOpen);
  if (aiOpen) {
    document.getElementById('aiFabBadge').style.display = 'none';
    setTimeout(() => document.getElementById('aiCpInput').focus(), 60);
  }
}

async function aiChatSend() {
  if (aiBusy) return;
  const input = document.getElementById('aiCpInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = '';

  aiHistory.push({ role: 'user', parts: [{ text }] });
  aiAppendMsg('user', text);
  aiScrollBottom();
  aiSetBusy(true);

  let reply = '';
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: `Ты помощник учебной платформы ТестЛаб — тесты по HTML и CSS.
Отвечай на русском, кратко и понятно.
Помогай с вопросами о HTML тегах, CSS свойствах, семантике, flexbox, grid, формах, таблицах, анимациях.
Если пользователь решает задание — подсказывай, но не давай готовый ответ сразу.` }] },
        contents: aiHistory,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });
    const data = await res.json();
    reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '🤔 Нет ответа.';
  } catch(e) {
    reply = '⚠️ Ошибка соединения с AI.';
  }

  aiHistory.push({ role: 'model', parts: [{ text: reply }] });
  aiSetBusy(false);
  aiAppendMsg('ai', reply);
  aiScrollBottom();
}

function aiChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiChatSend(); }
}
function aiChatResize(el) {
  el.style.height = '';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
function aiAppendMsg(role, text) {
  const feed = document.getElementById('aiCpMessages');
  const row = document.createElement('div');
  row.className = `ai-cp-row ${role === 'ai' ? 'ai-cp-ai' : 'ai-cp-user'}`;
  const bubble = document.createElement('div');
  bubble.className = `ai-cp-bubble ${role === 'ai' ? 'ai-cp-bubble-ai' : 'ai-cp-bubble-user'}`;
  bubble.innerHTML = text.split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('') +
    `<span class="ai-cp-time">${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>`;
  row.appendChild(bubble);
  feed.appendChild(row);
}
function clearAiChat() {
  aiHistory = [];
  document.getElementById('aiCpMessages').innerHTML = `
    <div class="ai-cp-row ai-cp-ai">
      <div class="ai-cp-bubble ai-cp-bubble-ai">
        <p>Чат очищен. Задай новый вопрос!</p>
        <span class="ai-cp-time">${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>
      </div>
    </div>`;
}
function aiSetBusy(busy) {
  aiBusy = busy;
  document.getElementById('aiCpTyping').style.display = busy ? 'block' : 'none';
  document.querySelector('.ai-cp-send').disabled = busy;
  document.getElementById('aiCpInput').disabled = busy;
  document.getElementById('aiCpStatus').textContent = busy ? 'Печатает...' : 'Онлайн';
  if (busy) aiScrollBottom();
}
function aiScrollBottom() {
  const f = document.getElementById('aiCpMessages');
  f.scrollTop = f.scrollHeight;
}
