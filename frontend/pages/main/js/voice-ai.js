// =========================================================
// Единый контроллер AI Ассистента и Голосовых Команд
// =========================================================

(function() {
  // HTML Шаблон AI Ассистента
  const aiTemplate = `
    <div class="voice-toast" id="voiceToast"></div>
    <div class="ai-float" id="aiFloat">
      <div class="ai-chat" id="aiChat">
        <div class="ai-chat-header">
          <div class="ai-avatar">✦</div>
          <div class="ai-info">
            <div class="ai-name">VoiceOS AI</div>
            <div class="ai-status">активен (слушаю)</div>
          </div>
          <button class="ai-close" id="aiCloseBtn">✕</button>
        </div>
        <div class="ai-messages" id="aiMessages">
          <div class="msg msg-bot">Привет! Микрофон включен. Просто скажи команду (например, "курсы", "увеличить шрифт", "прочитать страницу") или напиши мне вопрос 👋</div>
        </div>
        <div class="ai-typing" id="aiTyping">
          <div class="vai-dot"></div><div class="vai-dot"></div><div class="vai-dot"></div>
        </div>
        <div class="ai-suggestions" id="aiSuggestions">
          <button class="ai-suggest-btn">Главная страница</button>
          <button class="ai-suggest-btn">Курсы</button>
          <button class="ai-suggest-btn">Высокий контраст</button>
        </div>
        <div class="ai-input-row">
          <button class="ai-mic" id="aiMicBtn">🎙️</button>
          <input class="ai-input" id="aiInput" placeholder="Напиши или скажи..." />
          <button class="ai-send" id="aiSendBtn">↑</button>
        </div>
      </div>
      <button class="ai-fab" id="aiFab" aria-label="Открыть AI">✦</button>
    </div>
  `;

  // Состояние
  let chatOpen = false;
  let isListening = false;
  let recognition = null;
  let currentFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize) || 16;
  let currentZoom = 1.0;
  
  // Система Undo (отмены)
  let undoStack = [];
  function pushUndo(label, fn) {
    undoStack.push({label, fn});
    if(undoStack.length > 5) undoStack.shift();
  }
  function popUndo() {
    if(undoStack.length > 0) {
      let item = undoStack.pop();
      item.fn();
      showToast(`↩ Отменено: ${item.label}`);
    } else {
      showToast("Нечего отменять", "error");
    }
  }

  // Вспомогательные функции UI
  function showToast(msg, type = "success") {
    const toast = document.getElementById('voiceToast');
    if(!toast) return;
    toast.textContent = msg;
    toast.className = 'voice-toast show' + (type === 'error' ? ' error' : '');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function appendMsg(text, isUser = false) {
    const msgs = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = `msg msg-${isUser ? 'user' : 'bot'}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function simulateBotReply(text) {
    const typing = document.getElementById('aiTyping');
    typing.classList.add('show');
    const msgs = document.getElementById('aiMessages');
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      typing.classList.remove('show');
      appendMsg(text);
    }, 800 + Math.random() * 500);
  }

  // --- Настройка Команд ---
  const COMMANDS = [
    { phrase: 'главная', aliases: ['на главную', 'домой', 'открыть главную', 'главную'], action: () => location.href = '/frontend/pages/main/main.html', desc: 'Переход на главную' },
    { phrase: 'курсы', aliases: ['открыть курсы', 'все курсы', 'курсы'], action: () => location.href = '/frontend/pages/main/courses.html', desc: 'Переход к курсам' },
    { phrase: 'о нас', aliases: ['о системе', 'инфо', 'информация', 'о нас'], action: () => location.href = '/frontend/pages/main/about.html', desc: 'Информация о нас' },
    { phrase: 'задания', aliases: ['открыть задания', 'задание'], action: () => location.href = '/frontend/pages/main/main.html', desc: 'Переход к заданиям' },
    
    // Визуал
    {
      phrase: 'увеличить шрифт', aliases: ['сделай шрифт больше', 'крупный шрифт','увеличить шрифт', 'увеличь текст', 'шрифт больше',],
      action: () => {
        let prev = currentFontSize;
        currentFontSize += 2;
        document.documentElement.style.fontSize = currentFontSize + 'px';
        pushUndo('шрифт', () => { currentFontSize = prev; document.documentElement.style.fontSize = prev + 'px'; });
        showToast(`Шрифт увеличен: ${currentFontSize}px`);
      }
    },
    {
      phrase: 'уменьшить шрифт', aliases: ['сделай шрифт меньше', 'мелкий шрифт', 'уменьши текст', 'шрифт меньше', 'уменьши шрифт'],
      action: () => {
        let prev = currentFontSize;
        currentFontSize = Math.max(10, currentFontSize - 2);
        document.documentElement.style.fontSize = currentFontSize + 'px';
        pushUndo('шрифт', () => { currentFontSize = prev; document.documentElement.style.fontSize = prev + 'px'; });
        showToast(`Шрифт уменьшен: ${currentFontSize}px`);
      }
    },
    {
      phrase: 'высокий контраст', aliases: ['включи контраст', 'режим для слабовидящих', 'контрастная тема'],
      action: () => {
        document.body.classList.add('voice-high-contrast');
        pushUndo('контраст', () => document.body.classList.remove('voice-high-contrast'));
        showToast("Высокий контраст включен");
      }
    },
    {
      phrase: 'обычный контраст', aliases: ['выключи контраст', 'обычная тема','стандартный вид', 'низкий контраст'],
      action: () => {
        document.body.classList.remove('voice-high-contrast');
        showToast("Обычная тема включена");
      }
    },
    
    // Утилиты
    {
      phrase: 'прочитать страницу', aliases: ['озвучить текст', 'прочитай вслух'],
      action: () => {
        window.speechSynthesis.cancel();
        let content = document.querySelector('main') || document.body;
        let u = new SpeechSynthesisUtterance(content.innerText.slice(0, 3000));
        u.lang = 'ru-RU';
        window.speechSynthesis.speak(u);
        pushUndo('чтение', () => window.speechSynthesis.cancel());
        showToast("Читаю страницу...");
      }
    },
    {
      phrase: 'хватит читать', aliases: ['останови чтение', 'стоп чтение'],
      action: () => {
        window.speechSynthesis.cancel();
        showToast("Чтение остановлено");
      }
    },
    {
      phrase: 'открыть чат', aliases: ['показать ассистент', 'открой чат'],
      action: () => {
        if(!chatOpen) document.getElementById('aiFab').click();
        showToast("Чат открыт");
      }
    },
    {
      phrase: 'закрыть чат', aliases: ['скрыть ассистент', 'закрой чат'],
      action: () => {
        if(chatOpen) document.getElementById('aiFab').click();
        showToast("Чат закрыт");
      }
    },
    {
      phrase: 'прокрутить вниз', aliases: ['вниз', 'опусти вниз', 'скролл вниз'],
      action: () => { window.scrollBy({ top: 600, behavior: 'smooth' }); showToast("Прокрутка вниз"); }
    },
    {
      phrase: 'прокрутить вверх', aliases: ['вверх', 'подними вверх', 'скролл вверх'],
      action: () => { window.scrollBy({ top: -600, behavior: 'smooth' }); showToast("Прокрутка вверх"); }
    },
    {
      phrase: 'отмена', aliases: ['отменить', 'undo', 'вернуть', 'назад'],
      action: () => popUndo()
    }
  ];

  // Простой алгоритм нечеткого поиска команд
  function processCommand(text) {
    let bestCmd = null;
    for(let cmd of COMMANDS) {
      let phrases = [cmd.phrase, ...cmd.aliases];
      if(phrases.some(p => text.includes(p))) {
        bestCmd = cmd; break;
      }
    }

    if (bestCmd) {
      bestCmd.action();
      // Отображаем команду в чате если он открыт
      if(chatOpen) {
        appendMsg(`Выполни команду: ${bestCmd.phrase}`, true);
        simulateBotReply(`Команда "${bestCmd.phrase}" выполнена!`);
      }
    } else {
      // Это просто обычный текст, можно отправить в чат
      if(chatOpen) {
        appendMsg(text, true);
        simulateBotReply("Я пока умею выполнять базовые команды навигации и внешнего вида. Попробуй сказать 'курсы' или 'увеличить шрифт'.");
      }
    }
  }

  // Запуск Web Speech API
  function startVoiceRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Ваш браузер не поддерживает голосовое управление", "error");
      return;
    }

    recognition = new SR();
    recognition.lang = 'ru-RU';
    recognition.continuous = false; // Авто-рестарт надёжнее
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) {
        processCommand(finalTranscript.trim().toLowerCase());
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch(e){}
      }
    };

    isListening = true;
    recognition.start();
    showToast("Голосовое управление активно 🎙️");
  }

  // Инициализация при загрузке
  document.addEventListener('DOMContentLoaded', async () => {
    // Внедряем HTML
    document.body.insertAdjacentHTML('beforeend', aiTemplate);

    // Привязываем события AI Чата
    const fab = document.getElementById('aiFab');
    const chat = document.getElementById('aiChat');
    const closeBtn = document.getElementById('aiCloseBtn');
    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSendBtn');

    const toggleChat = () => {
      chatOpen = !chatOpen;
      chat.classList.toggle('open', chatOpen);
      fab.classList.toggle('open', chatOpen);
      if(chatOpen) input.focus();
    };

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    const handleSend = () => {
      const text = input.value.trim();
      if(!text) return;
      input.value = '';
      appendMsg(text, true);
      processCommand(text.toLowerCase()); // Пробуем выполнить как команду
    };
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => { if(e.key === 'Enter') handleSend(); });

    document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent;
        handleSend();
      });
    });

    // Запрос микрофона сразу при входе
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startVoiceRecognition();
    } catch (err) {
      console.warn("Микрофон заблокирован или ожидается клик:", err);
      // Если браузер заблокировал авто-запрос, ждем первый клик по документу
      document.body.addEventListener('click', async () => {
        if(!isListening) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            startVoiceRecognition();
          } catch(e) {}
        }
      }, { once: true });
    }
  });

})();