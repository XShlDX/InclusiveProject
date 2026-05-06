// БҰЛ ФАЙЛДІҢ ІШІНДЕ ЗАПРОСТАРДЫ ҚАБЫЛДАУҒА АРНАЛҒАН ФУНКЦИЯЛАР БОЛАДЫ

async function getData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("Ошибка при получении данных:", error);
  }
}

const TestURL = ""

console.log()