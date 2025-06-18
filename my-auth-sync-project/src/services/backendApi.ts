const API_URL = import.meta.env.VITE_API_URL;

export async function fetchUserTasks() {
  const res = await fetch(`${API_URL}/api/tasks`, { credentials: 'include' });
  if (!res.ok) throw new Error('Ошибка загрузки задач');
  return res.json();
}

export async function createUserTask(task: Record<string, any>) {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Ошибка создания задачи');
  return res.json();
}

export async function updateUserTask(id: string, updates: Record<string, any>) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Ошибка обновления задачи');
  return res.json();
}

export async function deleteUserTask(id: string) {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка удаления задачи');
  return true;
}

export async function fetchUserCalendars() {
  const res = await fetch(`${API_URL}/api/calendars`, { credentials: 'include' });
  if (!res.ok) throw new Error('Ошибка загрузки календарей');
  return res.json();
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_URL}/api/user`, { credentials: 'include' });
  if (!res.ok) throw new Error('Ошибка загрузки профиля');
  return res.json();
}

export async function createCalendarEvent(eventData: Record<string, any>, calendarId: string) {
  const res = await fetch(`${API_URL}/api/calendars/${calendarId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Ошибка создания события');
  return res.json();
}

export async function updateCalendarEvent(eventId: string, updates: Record<string, any>) {
  const res = await fetch(`${API_URL}/api/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Ошибка обновления события');
  return res.json();
}

export async function deleteCalendarEvent(eventId: string) {
  const res = await fetch(`${API_URL}/api/events/${eventId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Ошибка удаления события');
  return true;
}
