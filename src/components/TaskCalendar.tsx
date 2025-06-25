import Modal from '../../components/Modal';
import { createCalendarEvent } from '../services/backendApi';
import { toast } from 'react-toastify';

const TaskCalendar: React.FC = () => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    date: '',
    time: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);

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
      // Обновить события (fetchGoogleEventsCb)
      if (typeof fetchGoogleEventsCb === 'function') fetchGoogleEventsCb();
    } catch (err: any) {
      toast.error('Ошибка создания события');
    } finally {
      setCreating(false);
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
      {showEventModal && (
        <Modal title="Новое событие" onClose={() => setShowEventModal(false)}>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input type="text" required className="w-full border rounded p-2" value={eventForm.summary} onChange={e => setEventForm(f => ({ ...f, summary: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Дата</label>
              <input type="date" required className="w-full border rounded p-2" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Время</label>
              <input type="time" className="w-full border rounded p-2" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea className="w-full border rounded p-2" value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" disabled={creating} className="w-full py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors">
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TaskCalendar; 