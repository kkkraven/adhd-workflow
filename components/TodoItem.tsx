import React from 'react';
import { Task, PriorityLevel } from '../types';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString?: string): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone interpretation for date part
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return dateString; // fallback to original if parsing fails
  }
};

const formatTime = (timeString?: string): string | null => {
  if (!timeString) return null;
  return timeString;
};

const priorityMap: Record<PriorityLevel, { icon: string; color: string; label: string; ringColor: string }> = {
  high: { icon: 'fas fa-flag', color: 'text-rose-600', label: 'Высокий приоритет', ringColor: 'ring-rose-500' },
  medium: { icon: 'fas fa-flag', color: 'text-amber-600', label: 'Средний приоритет', ringColor: 'ring-amber-500' },
  low: { icon: 'fas fa-flag', color: 'text-sky-600', label: 'Низкий приоритет', ringColor: 'ring-sky-500' },
};

const TodoItem: React.FC<TodoItemProps> = React.memo(({ task, onToggle, onDelete }) => {
  const formattedDueDate = formatDate(task.dueDate);
  const formattedDueTime = formatTime(task.dueTime);
  
  const isPastDue = task.dueDate && !task.isCompleted && 
                    new Date(task.dueDate + `T${task.dueTime || '23:59:59'}`) < new Date();

  const priorityInfo = task.priority ? priorityMap[task.priority] : null;

  return (
    <li
      className={`group flex items-start justify-between p-3.5 rounded-lg transition-all duration-300 ease-in-out border
        ${
          task.isCompleted 
            ? 'bg-slate-100 border-slate-200 opacity-70' 
            : `bg-white border-slate-200 hover:bg-slate-50 ${isPastDue ? 'border-l-4 border-rose-500' : (priorityInfo ? `border-l-4 ${priorityInfo.ringColor.replace('ring-','border-')}` : 'border-l-4 border-slate-400')}`
        }
      `}
    >
      <div className="flex items-start flex-grow min-w-0">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggle(task.id)}
          className="form-checkbox h-5 w-5 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 cursor-pointer mr-3 mt-0.5 shrink-0 focus-ring"
          aria-label={`Отметить задачу '${task.text}' как ${task.isCompleted ? 'незавершенную' : 'завершенную'}`}
        />
        <div className="flex-grow min-w-0">
          <div className="flex items-center">
            {priorityInfo && !task.isCompleted && (
              <i 
                className={`${priorityInfo.icon} ${priorityInfo.color} mr-2 text-xs`} 
                title={priorityInfo.label}
              ></i>
            )}
             {priorityInfo && task.isCompleted && ( // Dimmed priority icon for completed tasks
              <i 
                className={`${priorityInfo.icon} text-slate-400 mr-2 text-xs`} 
                title={`${priorityInfo.label} (Завершено)`}
              ></i>
            )}
            <span className={`block break-words ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-700'}`}>
              {task.text}
            </span>
          </div>
          {(formattedDueDate || formattedDueTime) && (
            <p className={`text-xs mt-1 flex items-center flex-wrap ${task.isCompleted ? 'text-slate-400' : (isPastDue ? 'text-rose-500' : 'text-sky-600')}`}>
              <i className="fas fa-calendar-alt mr-1.5"></i>
              {formattedDueDate && <span>Срок: {formattedDueDate}</span>}
              {formattedDueDate && formattedDueTime && <span className="mx-1">-</span>}
              {formattedDueTime && <span>{formattedDueTime}</span>}
              {isPastDue && <span className="ml-1.5 font-semibold">(Просрочено)</span>}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-slate-400 hover:text-rose-500 transition-colors ml-3 px-2 py-1 self-center shrink-0 opacity-60 group-hover:opacity-100 focus-ring rounded-md"
        aria-label={`Удалить задачу '${task.text}'`}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </li>
  );
});

export default TodoItem;