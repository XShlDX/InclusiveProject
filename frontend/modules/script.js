// БҰЛ ФАЙЛДІҢ ІШІНДЕ ЗАПРОСТАРДЫ ҚАБЫЛДАУҒА АРНАЛҒАН ФУНКЦИЯЛАР БОЛАДЫ
// type="module" болу керек

const API_URL = 'http://127.0.0.1:8000';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI FUNCTIONS — вызов actions делегирован в Chat.js
// script.js только передаёт запрос на сервер и возвращает
// полный объект { reply, action } — Chat.js сам вызывает action
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RequestData = {

  async sendPrompt(content, page = "main") {

    try {

      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, page })
      });

      const data = await response.json();

      console.log('SERVER RESPONSE:', data);

      // ВАЖНО: возвращаем ВЕСЬ объект { reply, action }
      // Chat.js читает data.action и вызывает нужную функцию
      // из accessibility.js (экспортированы в window)
      return data;

    } catch (error) {

      console.error("Ошибка при отправке:", error);

      return {
        reply: "Ошибка соединения с сервером."
      };
    }
  },

  async getHistory() {

    try {

      const response = await fetch(`${API_URL}/requests`);

      return await response.json();

    } catch (error) {

      console.error("Ошибка при получении:", error);
    }
  },

  async getQuizTopics() {

    try {

      const response = await fetch(`${API_URL}/tasks/quiz/topics`);

      return await response.json();

    } catch (error) {

      console.error("Ошибка при получении топиков:", error);
    }
  },

  async getTask(task_id) {

    try {

      const response = await fetch(`${API_URL}/tasks/${task_id}`);

      return await response.json();

    } catch (error) {

      console.error("Ошибка при получении:", error);
    }
  },

  async submitTask(task_id, answers) {

    try {

      const response = await fetch(`${API_URL}/tasks/${task_id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answers
        })
      });

      return await response.json();

    } catch (error) {

      console.error("Ошибка при отправке ответов:", error);
    }
  }
};

// Делаем доступным глобально
window.RequestData = RequestData;