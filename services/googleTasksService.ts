import { GoogleTask } from '../types';

// Получение списка задач из Google Tasks
export const listTasks = async (accessToken: string | null, taskListId = '@default'): Promise<GoogleTask[]> => {
  if (!accessToken) throw new Error('Нет accessToken для Google Tasks');
  if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
    throw new Error('Google Tasks API client не загружен');
  }
  window.gapi.client.setToken({ access_token: accessToken });
  const response = await window.gapi.client.tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: true,
    maxResults: 1000,
  });
  return (response.result.items || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    notes: task.notes,
    status: task.status,
    due: task.due,
    completed: task.completed,
    updated: task.updated,
  }));
};

// Создание задачи
export const insertTask = async (accessToken: string | null, task: Partial<GoogleTask>, taskListId = '@default') => {
  if (!accessToken) throw new Error('Нет accessToken для Google Tasks');
  if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
    throw new Error('Google Tasks API client не загружен');
  }
  window.gapi.client.setToken({ access_token: accessToken });
  const response = await window.gapi.client.tasks.tasks.insert({
    tasklist: taskListId,
    resource: task,
  });
  return response.result;
};

// Обновление задачи
export const updateTask = async (accessToken: string | null, taskId: string, updates: Partial<GoogleTask>, taskListId = '@default') => {
  if (!accessToken) throw new Error('Нет accessToken для Google Tasks');
  if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
    throw new Error('Google Tasks API client не загружен');
  }
  window.gapi.client.setToken({ access_token: accessToken });
  const response = await window.gapi.client.tasks.tasks.update({
    tasklist: taskListId,
    task: taskId,
    resource: updates,
  });
  return response.result;
};

// Удаление задачи
export const deleteTask = async (accessToken: string | null, taskId: string, taskListId = '@default') => {
  if (!accessToken) throw new Error('Нет accessToken для Google Tasks');
  if (!window.gapi || !window.gapi.client || !window.gapi.client.tasks) {
    throw new Error('Google Tasks API client не загружен');
  }
  window.gapi.client.setToken({ access_token: accessToken });
  await window.gapi.client.tasks.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  });
  return true;
}; 