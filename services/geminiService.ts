// Этот файл не используется на фронте и не должен попадать в сборку Cloudflare Pages.
// Оставлен пустым для предотвращения ошибок сборки.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function callGeminiAPI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not настроен.');
  }
  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Ошибка Gemini API: ' + err);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Нет ответа от Gemini.';
}

export async function getGoalBreakdown(goal: string): Promise<string> {
  const prompt = `Разбей цель на задачи и предложи план действий. Цель: ${goal}`;
  return callGeminiAPI(prompt);
}
