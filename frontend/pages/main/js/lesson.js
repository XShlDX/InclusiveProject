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

  /* ═══════ EXPOSE GLOBALS ═══════ */
  Object.assign(window, {
    goStep, pickAnswer, restartLesson, copyCode,
    dragStart, dragOver, dragLeave, drop, checkDrag,
    checkSelector,
    
  });

})();