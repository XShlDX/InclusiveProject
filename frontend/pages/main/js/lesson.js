/* ═══════════════════════════════════════════════════════════════
   ТестЛаб · Единый скрипт урока
   Настройка через data-атрибуты на <body>:
     data-total-steps="4"            — кол-во шагов (без финала)
     data-correct-answers="0,1,1,2"  — правильные индексы ответов
     data-ai-topic="CSS"             — тема для системного промпта AI
   ════════════════════════════════════════════════════════════════ */

(() => {

  /* ── CONFIG ── */
  const body          = document.body;
  const TOTAL_STEPS   = parseInt(body.dataset.totalSteps   ?? '4');
  const CORRECT       = (body.dataset.correctAnswers ?? '0').split(',').map(Number);
  const AI_TOPIC      = body.dataset.aiTopic ?? 'этой теме';
  const GEMINI_KEY    = body.dataset.geminiKey ?? 'ТВОЙ_КЛЮЧ_СЮДА';
  const GEMINI_URL    = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  /* ── STATE ── */
  let currentStep   = 0;
  let completedSteps = new Set();
  let quizAnswers   = new Array(CORRECT.length).fill(null);

  /* ═══════ STEP NAVIGATION ═══════ */
  function goStep(n) {
    document.querySelectorAll('.lesson-step').forEach(s => s.classList.remove('visible'));
    document.getElementById('step-' + n).classList.add('visible');

    document.querySelectorAll('.step-item').forEach((el, i) => {
      el.classList.toggle('active', i === n);
      if (completedSteps.has(i) && i !== n) el.classList.add('done');
      else if (i !== n) el.classList.remove('done');
    });

    completedSteps.add(currentStep);
    currentStep = n;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // update sidebar icons
    for (let i = 0; i < TOTAL_STEPS + 1; i++) {
      const el = document.getElementById('si' + i);
      if (!el) continue;
      if (completedSteps.has(i) && i !== n) {
        el.textContent = '✓';
        document.querySelectorAll('.step-item')[i]?.classList.add('done');
      }
    }

    if (n === TOTAL_STEPS) buildFinalScore();
  }

  function updateProgress() {
    const done = completedSteps.size;
    const pct  = Math.round((done / TOTAL_STEPS) * 100);
    const fill = document.getElementById('lpFill');
    const cnt  = document.getElementById('lpCount');
    if (fill) fill.style.width = pct + '%';
    if (cnt)  cnt.textContent  = Math.min(done, TOTAL_STEPS) + ' / ' + TOTAL_STEPS;
  }

  /* ═══════ QUIZ ═══════ */
  function pickAnswer(qIdx, optIdx) {
    if (quizAnswers[qIdx] !== null) return;
    quizAnswers[qIdx] = optIdx;

    const item    = document.getElementById('mq' + qIdx);
    const opts    = item.querySelectorAll('.mq-opt');
    const fb      = document.getElementById('fb' + qIdx);
    const correct = CORRECT[qIdx];

    opts.forEach((o, i) => {
      o.classList.add('disabled');
      if (i === optIdx && i === correct) o.classList.add('picked-correct');
      else if (i === optIdx)             o.classList.add('picked-wrong');
      else if (i === correct)            o.classList.add('reveal-correct');
    });

    if (optIdx === correct) {
      fb.className = 'mq-feedback show c';
      fb.innerHTML = '✅ Верно!';
      item.classList.add('correct');
    } else {
      fb.className = 'mq-feedback show w';
      fb.innerHTML = '❌ Не совсем. Правильный ответ выделен зелёным.';
      item.classList.add('wrong');
    }

    if (quizAnswers.every(a => a !== null)) {
      const btn = document.getElementById('toResultBtn');
      if (btn) btn.disabled = false;
    }
  }

  function buildFinalScore() {
    const score = quizAnswers.filter((a, i) => a === CORRECT[i]).length;
    const el    = document.getElementById('finalScore');
    const msg   = document.getElementById('finalMsg');
    if (el) el.textContent = score;
    const msgs = [
      'Не страшно! Перечитай материал и попробуй снова.',
      'Неплохо! Ещё немного практики — и будет отлично.',
      'Хорошо! Почти всё верно.',
      'Превосходно! Ты отлично освоил тему.',
      'Идеально! Можешь смело идти к заданиям!'
    ];
    if (msg) msg.textContent = msgs[Math.min(score, 4)];
  }

  function restartLesson() {
    quizAnswers.fill(null);
    completedSteps.clear();
    document.querySelectorAll('.mq-opt').forEach(o =>
      o.classList.remove('picked-correct','picked-wrong','reveal-correct','disabled'));
    document.querySelectorAll('.mq-item').forEach(i =>
      i.classList.remove('correct','wrong'));
    document.querySelectorAll('.mq-feedback').forEach(f => {
      f.className = 'mq-feedback'; f.innerHTML = '';
    });
    const btn = document.getElementById('toResultBtn');
    if (btn) btn.disabled = true;

    // reset drag zones (HTML lesson)
    document.querySelectorAll('.drop-zone').forEach(z => {
      z.textContent = ''; z.className = 'drop-zone';
    });
    document.querySelectorAll('.drag-chip').forEach(c =>
      c.classList.remove('placed','correct-chip','wrong-chip'));

    goStep(0);
  }

  /* ═══════ COPY CODE ═══════ */
  function copyCode(btn) {
    const code = btn.closest('.code-example').querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'Скопировано!';
      setTimeout(() => btn.textContent = 'Копировать', 1800);
    });
  }

  /* ═══════ DRAG AND DROP (HTML lesson) ═══════ */
  let dragging = null;

  function dragStart(e) {
    dragging = e.target;
    e.dataTransfer.effectAllowed = 'move';
  }
  function dragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  function dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  function drop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-over');
    if (!dragging || zone.textContent.trim()) return;
    zone.textContent = '<' + dragging.dataset.tag + '>';
    dragging.classList.add('placed');
    dragging = null;
  }
  function checkDrag() {
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const answer = zone.dataset.answer;
      const placed = zone.textContent.replace(/[<>]/g,'').trim();
      if (!placed) return;
      zone.classList.toggle('correct-zone', placed === answer);
      zone.classList.toggle('wrong-zone',   placed !== answer);
    });
    document.querySelectorAll('.drag-chip.placed').forEach(chip => {
      const zone = document.querySelector('[data-answer="' + chip.dataset.tag + '"]');
      chip.classList.toggle('correct-chip', !!zone?.classList.contains('correct-zone'));
      chip.classList.toggle('wrong-chip',   !zone?.classList.contains('correct-zone'));
    });
  }

  /* ═══════ SELECTOR CHALLENGE (CSS lesson) ═══════ */
  function checkSelector(input, correct, resultId) {
    const val = input.value.trim();
    const el  = document.getElementById(resultId);
    if (!el) return;
    if (val === correct) { el.textContent = '✅ Верно!'; el.className = 'sel-result correct'; }
    else if (val)        { el.textContent = '❌ Попробуй ещё'; el.className = 'sel-result wrong'; }
  }

  /* ═══════ AI CHAT ═══════ */
  let aiOpen = false, aiBusy = false, aiHistory = [];

  function toggleAiChat() {
    aiOpen = !aiOpen;
    document.getElementById('aiChatPopup').classList.toggle('open', aiOpen);
    document.getElementById('aiFab').classList.toggle('open', aiOpen);
    if (aiOpen) setTimeout(() => document.getElementById('aiCpInput')?.focus(), 60);
  }

  async function aiChatSend() {
    if (aiBusy) return;
    const input = document.getElementById('aiCpInput');
    const text  = input.value.trim();
    if (!text) return;
    input.value = ''; input.style.height = '';

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
          system_instruction: { parts: [{ text:
            `Ты помощник учебной платформы ТестЛаб. Сейчас студент проходит урок по теме: ${AI_TOPIC}. ` +
            `Отвечай на русском, кратко и понятно. Используй примеры кода когда нужно. ` +
            `Помогай разобраться в теме, но не давай готовые ответы к тестовым вопросам.`
          }] },
          contents: aiHistory,
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });
      const data = await res.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '🤔 Нет ответа.';
    } catch (e) {
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
    el.style.height = ''; el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }
  function aiAppendMsg(role, text) {
    const feed   = document.getElementById('aiCpMessages');
    const row    = document.createElement('div');
    row.className = `ai-cp-row ${role === 'ai' ? 'ai-cp-ai' : 'ai-cp-user'}`;
    const bubble  = document.createElement('div');
    bubble.className = `ai-cp-bubble ${role === 'ai' ? 'ai-cp-bubble-ai' : 'ai-cp-bubble-user'}`;
    bubble.innerHTML =
      text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('') +
      `<span class="ai-cp-time">${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>`;
    row.appendChild(bubble);
    feed.appendChild(row);
  }
  function clearAiChat() {
    aiHistory = [];
    document.getElementById('aiCpMessages').innerHTML =
      `<div class="ai-cp-row ai-cp-ai"><div class="ai-cp-bubble ai-cp-bubble-ai">` +
      `<p>Чат очищен. Задай новый вопрос!</p>` +
      `<span class="ai-cp-time">${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>` +
      `</div></div>`;
  }
  function aiSetBusy(busy) {
    aiBusy = busy;
    document.getElementById('aiCpTyping').style.display = busy ? 'block' : 'none';
    document.querySelector('.ai-cp-send').disabled = busy;
    document.getElementById('aiCpInput').disabled  = busy;
    document.getElementById('aiCpStatus').textContent = busy ? 'Печатает...' : 'Онлайн';
    if (busy) aiScrollBottom();
  }
  function aiScrollBottom() {
    const f = document.getElementById('aiCpMessages');
    f.scrollTop = f.scrollHeight;
  }

  /* ═══════ EXPOSE GLOBALS ═══════ */
  Object.assign(window, {
    goStep, pickAnswer, restartLesson, copyCode,
    dragStart, dragOver, dragLeave, drop, checkDrag,
    checkSelector,
    toggleAiChat, aiChatSend, aiChatKey, aiChatResize, clearAiChat
  });

})();