import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../services/backendApi';
import { listUpcomingEvents } from '../../services/googleCalendarService';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { toast } from 'react-toastify';

const AUTO_REFRESH_INTERVAL = 60000; // 60 секунд

const TaskCalendar: React.FC = () => {
  const { accessToken } = useGoogleAuth();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    date: '',
    time: '',
    description: '',
  });
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Получение событий
  const fetchEvents = useCallback(async () => {
    if (!accessToken) return;
    setLoadingEvents(true);
    try {
      const data = await listUpcomingEvents(accessToken);
      setEvents(data);
    } catch (err: any) {
      toast.error('Ошибка загрузки событий');
    } finally {
      setLoadingEvents(false);
    }
  }, [accessToken]);

  // Автообновление событий
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Создание события
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const eventData = {
        summary: eventForm.summary,
        description: eventForm.description,
        start: { dateTime: `${eventForm.date}T${eventForm.time || '00:00'}` },
        end: { dateTime: `${eventForm.date}T${eventForm.time || '00:00'}` },
      };
      await createCalendarEvent(eventData, 'primary');
      toast.success('Событие создано!');
      setShowEventModal(false);
      setEventForm({ summary: '', date: '', time: '', description: '' });
      fetchEvents();
    } catch (err: any) {
      toast.error('Ошибка создания события');
    } finally {
      setCreating(false);
    }
  };

  // Открыть модалку редактирования
  const openEditModal = (event: any) => {
    setEditEventId(event.id);
    setEventForm({
      summary: event.summary || '',
      date: event.start?.dateTime ? event.start.dateTime.slice(0, 10) : '',
      time: event.start?.dateTime ? event.start.dateTime.slice(11, 16) : '',
      description: event.description || '',
    });
    setShowEditModal(true);
  };

  // Сохранить изменения
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventId) return;
    setCreating(true);
    try {
      const updates = {
        summary: eventForm.summary,
        description: eventForm.description,
        start: { dateTime: `${eventForm.date}T${eventForm.time || '00:00'}` },
        end: { dateTime: `${eventForm.date}T${eventForm.time || '00:00'}` },
      };
      await updateCalendarEvent(editEventId, updates);
      toast.success('Событие обновлено!');
      setShowEditModal(false);
      setEditEventId(null);
      setEventForm({ summary: '', date: '', time: '', description: '' });
      fetchEvents();
    } catch (err: any) {
      toast.error('Ошибка обновления события');
    } finally {
      setCreating(false);
    }
  };

  // Удалить событие
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Удалить это событие?')) return;
    try {
      await deleteCalendarEvent(eventId);
      toast.success('Событие удалено!');
      fetchEvents();
    } catch (err: any) {
      toast.error('Ошибка удаления события');
    }
  };

  return (
    <div className="relative">
      <button
        className="mb-4 px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold shadow hover:bg-sky-700 transition-colors"
        onClick={() => setShowEventModal(true)}
      >
        <i className="fas fa-plus mr-2"></i>Добавить событие
      </button>
      {loadingEvents ? (
        <div className="text-center text-gray-500 py-4">Загрузка событий...</div>
      ) : (
        <ul className="space-y-2 mb-6">
          {events.map(event => (
            <li key={event.id} className="flex items-center justify-between bg-white rounded shadow p-3">
              <div>
                <div className="font-semibold">{event.summary}</div>
                <div className="text-xs text-gray-500">
                  {event.start?.dateTime ? event.start.dateTime.replace('T', ' ').slice(0, 16) : 'Без даты'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-sky-600 hover:text-sky-800"
                  onClick={() => openEditModal(event)}
                  title="Редактировать"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteEvent(event.id)}
                  title="Удалить"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showEventModal && (
        <Modal title="Новое событие" onClose={() => setShowEventModal(false)}>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input type="text" required className="w-full border rounded p-2" value={eventForm.summary} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Дата</label>
              <input type="date" required className="w-full border rounded p-2" value={eventForm.date} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Время</label>
              <input type="time" className="w-full border rounded p-2" value={eventForm.time} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea className="w-full border rounded p-2" value={eventForm.description} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" disabled={creating} className="w-full py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors">
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </form>
        </Modal>
      )}
      {showEditModal && (
        <Modal title="Редактировать событие" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input type="text" required className="w-full border rounded p-2" value={eventForm.summary} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Дата</label>
              <input type="date" required className="w-full border rounded p-2" value={eventForm.date} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Время</label>
              <input type="time" className="w-full border rounded p-2" value={eventForm.time} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea className="w-full border rounded p-2" value={eventForm.description} onChange={e => setEventForm((f: typeof eventForm) => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" disabled={creating} className="w-full py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors">
              {creating ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TaskCalendar; 