// БҰЛ ФАЙЛДІҢ ІШІНДЕ ЗАПРОСТАРДЫ ҚАБЫЛДАУҒА АРНАЛҒАН ФУНКЦИЯЛАР БОЛАДЫ
// type="module" болу керек
// import {RequestData} from "/frontend/modules/script.js" арқылы импорттау керек
// ПРИМЕР const resp = await RequestData.sendPrompt("Сенің промптың");


const API_URL = 'http://127.0.0.1:8000';

export const RequestData = {
  async sendPrompt(content) {
    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content })
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    }
  },

  async getHistory() {
    try {
      const response = await fetch(`${API_URL}/requests`);
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении:", error);
    }
  }
};