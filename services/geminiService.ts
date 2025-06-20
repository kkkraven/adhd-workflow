// Исправление: не импортировать @google/genai на фронте, если это не SSR/Node
// Удалить или закомментировать весь импорт и использование GoogleGenAI, если файл не нужен на фронте

import { GEMINI_MODEL_TEXT } from '../constants';
import { ChatMessage, ProposedTask } from "../types";

// const API_KEY = process.env.API_KEY;

// if (!API_KEY) {
//   console.error("API_KEY for Gemini is not set in environment variables. Functionality will be limited.");
// }

// const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getFocusTip = async (): Promise<string> => {
  // if (!ai) {
  //   console.warn("Gemini AI service not initialized: API_KEY is missing.");
  //   return "Сервис советов временно недоступен. Пожалуйста, убедитесь, что ключ API настроен (для разработчиков).";
  // }

  try {
    // const response: GenerateContentResponse = await ai.models.generateContent({
    //   model: GEMINI_MODEL_TEXT,
    //   contents: "Предоставь короткий, действенный совет по фокусировке (1-2 предложения), подходящий для человека с СДВГ. Сделай его ободряющим и практичным. Ответ должен быть на русском языке.",
    //   config: {
    //     temperature: 0.7,
    //     topP: 0.95,
    //     topK: 64,
    //   }
    // });
    
    return "Сервис советов временно недоступен.";
  } catch (error) {
    console.error("Error fetching focus tip from Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return "Не удалось получить совет: недействительный ключ API. Проверьте настройки.";
        }
        return `Не удалось получить совет по фокусировке: ${error.message}. Попробуйте позже.`;
    }
    return "Не удалось получить совет по фокусировке из-за неизвестной ошибки. Попробуйте позже.";
  }
};

const normalizeDateString = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 2);


  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const lowerDateStr = dateStr.toLowerCase();
  if (lowerDateStr === "сегодня") return formatDate(today);
  if (lowerDateStr === "завтра") return formatDate(tomorrow);
  if (lowerDateStr === "послезавтра") return formatDate(afterTomorrow);
  if (lowerDateStr === "каждый день" || lowerDateStr === "ежедневно") return "everyday"; // Special keyword

  // Basic YYYY-MM-DD check
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  return undefined; 
};

const normalizeTimeString = (timeStr: string | undefined): string | undefined => {
  if (!timeStr) return undefined;
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const lowerTimeStr = timeStr.toLowerCase();
  if (lowerTimeStr === "утро") return "09:00";
  if (lowerTimeStr === "день" || lowerTimeStr === "днем") return "14:00";
  if (lowerTimeStr === "вечер" || lowerTimeStr === "вечером") return "19:00";
  
  return undefined;
};


export const getGoalBreakdown = async (
  userGoal: string, 
  chatHistory: ChatMessage[]
): Promise<{ conversationalResponse: string; proposedTasks: ProposedTask[] }> => {
  // if (!ai) {
  //   console.warn("Gemini AI service not initialized: API_KEY is missing.");
  //   return { 
  //     conversationalResponse: "Сервис ИИ-помощника временно недоступен. API ключ не настроен.", 
  //     proposedTasks: [] 
  //   };
  // }

  const systemInstruction = `Ты — ИИ-помощник в приложении для повышения продуктивности пользователей с СДВГ. Твоя задача — помочь пользователю разбить его цели на конкретные, выполнимые подзадачи, используя стратегии, эффективные для СДВГ.
1.  **Стиль общения:** Будь предельно дружелюбным, позитивным, терпеливым и поддерживающим. Избегай осуждения. Подчеркивай маленькие победы.
2.  **Анализ цели:**
    *   Определи, является ли цель пользователя "большой" (требующей значительных усилий, например, "написать диплом", "запустить новый продукт", "провести исследование") или "малой/средней" (например, "подготовить отчет к пятнице", "организовать встречу", "разобрать почту за неделю").
    *   Если цель неясна, задай один уточняющий вопрос, прежде чем приступить к планированию.
3.  **Разбивка на подзадачи (ADHD-friendly):**
    *   **Большие цели:** Разбей на управляемый план на **две недели**.
    *   **Малые/средние цели:** Разбей на управляемый план на **одну неделю**.
    *   **Ясность и действенность:** Каждая подзадача должна быть максимально четкой, конкретной и начинаться с глагола действия (например, "Написать введение", "Позвонить Х", "Найти информацию о Y"). Избегай расплывчатых формулировок.
    *   **Управляемый объем:** Предлагай не более 3-4 основных подзадач на каждый день, связанных с основной целью.
    *   **Обязательные ежедневные элементы (включи их в общий план):**
        *   **Одна небольшая ежедневная задача (5-10 минут):** Это может быть что-то ритуальное или подготовительное, связанное с общей целью или самоорганизацией (например, "Ежедневная 5-минутная проверка: что сегодня важно по этой цели?", "Краткий обзор вчерашних заметок по проекту"). Сделай ее повторяющейся на каждый день указанного периода (неделя или две).
        *   **Одна короткая, сфокусированная задача (не более 15 минут):** Это должна быть конкретная, легко достижимая микро-задача, дающая быстрое чувство выполненного дела (например, "Быстрая задача (15 мин): Набросать 3 ключевых пункта для раздела X", "Быстрая задача (15 мин): Найти один референс для Y"). Предлагай такую задачу на каждый рабочий день периода.
    *   **Приоритизация (неявно):** Структурируй задачи так, чтобы более важные или сложные задачи (если это возможно определить) планировались на время, когда у пользователя обычно больше энергии (например, утро, если не указано иное).
4.  **Предложение дат и времени:**
    *   Для каждой основной подзадачи (кроме ежедневных ритуалов, где это очевидно) предложи дату (в формате ГГГГ-ММ-ДД, или используй слова "сегодня", "завтра", "послезавтра") и, если уместно, время (в формате ЧЧ:ММ, или "утро", "день", "вечер").
    *   Для ежедневных задач используй указание "каждый день" или "ежедневно".
5.  **Формат ответа (JSON ОБЯЗАТЕЛЕН):**
    *   Твой ответ ДОЛЖЕН быть валидным JSON.
    *   JSON должен содержать два ключа:
        *   \`"conversationResponse"\`: Строка с твоим текстовым ответом пользователю. В этом ответе ты должен позитивно представить план, перечислить предложенные задачи (включая ежедневные и 15-минутные) и **ОБЯЗАТЕЛЬНО СПРОСИТЬ У ПОЛЬЗОВАТЕЛЯ ПОДТВЕРЖДЕНИЕ**, хочет ли он добавить эти задачи. Не добавляй задачи автоматически. Объясни, что план включает ежедневные небольшие задачи для поддержания ритма.
        *   \`"potentialTasks"\`: Массив объектов. Каждый объект представляет подзадачу и должен содержать ключи:
            *   \`"taskDescription"\`: Строка с описанием подзадачи (включая упоминание длительности, если это 15-минутная задача, например, "Быстрая задача (15 мин): ...").
            *   \`"suggestedDate"\`: (Опционально) Строка с предлагаемой датой (ГГГГ-ММ-ДД, "сегодня", "завтра", "каждый день").
            *   \`"suggestedTime"\`: (Опционально) Строка с предлагаемым временем (ЧЧ:ММ, "утро", "день", "вечер").

Пример цели пользователя: "Мне нужно организовать свои цифровые фотографии, их тысячи."
Пример твоего JSON ответа (для большой цели, на 2 недели):
{
  "conversationResponse": "Отличная цель – привести в порядок цифровые воспоминания! Это может показаться большим делом, поэтому я разбил(а) это на двухнедельный план с небольшими шагами, чтобы было легче начать и поддерживать темп. План включает маленькую ежедневную задачу и одну 15-минутную задачу каждый день:\n\n**Неделя 1:**\n*   **Каждый день:** 5-минутная задача: Удалить 10 ненужных фото или скриншотов.\n*   **Понедельник:** Быстрая задача (15 мин): Создать основные папки (Год/Событие) на компьютере. Основная задача: Собрать все фото с телефона в одну временную папку на ПК (сегодня, вечер).\n*   **Вторник:** Быстрая задача (15 мин): Загрузить фото с фотоаппарата (если есть). Основная задача: Начать сортировку фото за первый год (завтра, утро).\n*   ... и так далее на 2 недели ...\n\nТакой подход поможет? Хотите добавить эти задачи в ваш план?",
  "potentialTasks": [
    { "taskDescription": "Ежедневная 5-минутная задача: Удалить 10 ненужных фото или скриншотов.", "suggestedDate": "каждый день" },
    { "taskDescription": "Быстрая задача (15 мин): Создать основные папки (Год/Событие) на компьютере.", "suggestedDate": "сегодня", "suggestedTime": "день"},
    { "taskDescription": "Собрать все фото с телефона в одну временную папку на ПК.", "suggestedDate": "сегодня", "suggestedTime": "вечер" },
    { "taskDescription": "Быстрая задача (15 мин): Загрузить фото с фотоаппарата (если есть).", "suggestedDate": "завтра", "suggestedTime": "утро"},
    { "taskDescription": "Начать сортировку фото за первый год.", "suggestedDate": "завтра", "suggestedTime": "утро" }
  ]
}
Помни: твоя цель – не просто дать список, а помочь пользователю почувствовать себя способным выполнить задачу. Используй позитивное подкрепление. Убедись, что JSON валиден.`;

  const contents = userGoal;

  try {
    // const response: GenerateContentResponse = await ai.models.generateContent({
    //   model: GEMINI_MODEL_TEXT,
    //   contents: contents,
    //   config: {
    //     systemInstruction: systemInstruction,
    //     responseMimeType: "application/json",
    //     temperature: 0.6, // Adjusted temperature for a balance of creativity and adherence
    //     topP: 0.9,
    //     topK: 50,
    //   }
    // });

    // let jsonStr = response.text.trim();
    // const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    // const match = jsonStr.match(fenceRegex);
    // if (match && match[2]) {
    //   jsonStr = match[2].trim();
    // }

    // const parsedData = JSON.parse(jsonStr) as GeminiTaskBreakdownResponse;

    // if (!parsedData.conversationResponse || !Array.isArray(parsedData.potentialTasks)) {
    //   console.error("Invalid JSON structure from Gemini:", parsedData);
    //   throw new Error("ИИ вернул ответ в неожиданном формате.");
    // }

    // const proposedTasks: ProposedTask[] = parsedData.potentialTasks.map(pt => ({
    //   id: crypto.randomUUID(),
    //   text: pt.taskDescription,
    //   suggestedDueDate: normalizeDateString(pt.suggestedDate),
    //   suggestedDueTime: normalizeTimeString(pt.suggestedTime),
    // }));

    return {
      conversationalResponse: "Сервис разбивки задач временно недоступен.",
      proposedTasks: []
    };

  } catch (error) {
    console.error("Error getting goal breakdown from Gemini:", error);
    let errorMessage = "Произошла ошибка при обращении к ИИ-помощнику.";
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        errorMessage = "Ключ API для ИИ-помощника недействителен.";
      } else if (error.message.toLowerCase().includes('json')) {
        errorMessage = "ИИ-помощник вернул ответ в некорректном формате. Попробуйте переформулировать запрос.";
      } else {
        errorMessage = `Ошибка ИИ-помощника: ${error.message}`;
      }
    }
    return { conversationalResponse: errorMessage, proposedTasks: [] };
  }
};
