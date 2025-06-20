import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Task, PriorityLevel } from '../types';
import { fetchUserTasks, createUserTask, updateUserTask, deleteUserTask } from '../src/services/backendApi';
import TodoItem from './TodoItem';
import MiniCalendarDatePicker from './MiniCalendarDatePicker';

const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // 1. Incomplete tasks before completed tasks
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    // For tasks with the same completion status
    if (!a.isCompleted) { // Sort active tasks more granularly
      // 2. Priority: High > Medium > Low > Undefined
      const priorityOrder: Record<PriorityLevel, number> = { high: 1, medium: 2, low: 3 };
      const aPriorityVal = a.priority ? priorityOrder[a.priority] : 4;
      const bPriorityVal = b.priority ? priorityOrder[b.priority] : 4;

      if (aPriorityVal !== bPriorityVal) {
        return aPriorityVal - bPriorityVal;
      }

      // 3. Due Date (earliest first for incomplete tasks with due dates)
      // Tasks without due dates come after tasks with due dates
      const aDueDateMs = a.dueDate ? new Date(a.dueDate + (a.dueTime ? `T${a.dueTime}` : 'T00:00:00')).getTime() : null;
      const bDueDateMs = b.dueDate ? new Date(b.dueDate + (b.dueTime ? `T${b.dueTime}` : 'T00:00:00')).getTime() : null;

      if (aDueDateMs && bDueDateMs) {
        if (aDueDateMs !== bDueDateMs) {
          return aDueDateMs - bDueDateMs;
        }
      } else if (aDueDateMs) {
        return -1; // a has due date, b doesn't (so a comes first)
      } else if (bDueDateMs) {
        return 1;  // b has due date, a doesn't (so b comes first)
      }
    } else { // Sort completed tasks by completion time (newest first)
        if (a.completedAt && b.completedAt) {
            return b.completedAt - a.completedAt;
        } else if (a.completedAt) {
            return -1; // a has completion date, b doesn't
        } else if (b.completedAt) {
            return 1; // b has completion date, a doesn't
        }
    }
    
    // 4. Creation Time (newest first as a final tie-breaker or for completed tasks without completion date)
    return b.createdAt - a.createdAt;
  });
};


const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchUserTasks()
      .then(setTasks)
      .catch(e => console.error(e.message));
  }, []);

  const addTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      isCompleted: false,
      createdAt: Date.now(),
      dueDate: newDueDate || undefined,
      dueTime: newDueTime || undefined,
      priority: newPriority,
    };
    try {
      const created = await createUserTask(newTask);
      setTasks(prev => sortTasks([created, ...prev]));
      setNewTaskText('');
      setNewDueDate('');
      setNewDueTime('');
      setNewPriority(undefined);
      setShowDatePicker(false);
    } catch (e: any) {
      console.error(e.message);
    }
  }, [newTaskText, newDueDate, newDueTime, newPriority]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const updated = await updateUserTask(id, { isCompleted: !task.isCompleted, completedAt: !task.isCompleted ? Date.now() : undefined });
      setTasks(prev => sortTasks(prev.map(t => t.id === id ? updated : t)));
    } catch (e: any) {
      console.error(e.message);
    }
  }, [tasks]);

  const deleteTaskHandler = useCallback(async (id: string) => {
    try {
      await deleteUserTask(id);
      setTasks(prev => sortTasks(prev.filter(t => t.id !== id)));
    } catch (e: any) {
      console.error(e.message);
    }
  }, []);

  const handleDateSelect = (date: string) => {
    setNewDueDate(date);
    setShowDatePicker(false);
  };

  const formatDateForButton = (dateString: string): string => {
    if (!dateString) return "Выберите дату";
    try {
        const date = new Date(dateString + "T00:00:00");
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return "Выберите дату";
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && datePickerButtonRef.current && !datePickerButtonRef.current.contains(event.target as Node)) {
        // Simple close on outside click of button. MiniCalendarDatePicker handles its own closure.
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const priorityButtonClass = (level: PriorityLevel, current?: PriorityLevel) => 
    `px-3 py-1.5 text-xs rounded-md focus-ring transition-colors font-medium flex items-center gap-1.5
     ${current === level 
       ? (level === 'high' ? 'bg-rose-500 text-white' : level === 'medium' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white')
       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
     }`;
  

  return (
    <div className="bg-white rounded-lg">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Задачи
      </h1>
      <form onSubmit={addTask} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="sm:col-span-2 mb-3">
            <label htmlFor="newTaskText" className="sr-only">Текст новой задачи</label>
            <div className="relative">
                <i className="fas fa-pencil-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                type="text"
                id="newTaskText"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Добавить новую задачу..."
                className="w-full p-3 pl-10 bg-white border border-slate-300 rounded-lg focus-ring placeholder-slate-400 text-slate-700 transition-colors"
                />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="relative">
            <button
              type="button"
              ref={datePickerButtonRef}
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full text-left p-3 bg-white border border-slate-300 rounded-lg focus-ring text-slate-700 flex justify-between items-center"
              aria-label="Выбрать срок выполнения задачи (дата)"
              aria-expanded={showDatePicker}
            >
              <span>{newDueDate ? formatDateForButton(newDueDate) : "Выберите дату"}</span>
              <i className={`fas fa-calendar-alt text-slate-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`}></i>
            </button>
            {showDatePicker && (
              <MiniCalendarDatePicker
                selectedDate={newDueDate}
                onDateSelect={handleDateSelect}
                onClose={() => setShowDatePicker(false)}
                minDate={new Date().toISOString().split("T")[0]}
              />
            )}
          </div>
          <input
            type="time"
            value={newDueTime}
            onChange={(e) => setNewDueTime(e.target.value)}
            className="p-3 bg-white border border-slate-300 rounded-lg focus-ring text-slate-700"
            aria-label="Срок выполнения задачи (время)"
          />
        </div>

        <div className="mb-4">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Приоритет:</span>
          <div className="flex flex-wrap gap-2 items-center">
            {(['high', 'medium', 'low'] as PriorityLevel[]).map(level => (
              <button 
                key={level}
                type="button" 
                className={priorityButtonClass(level, newPriority)} 
                onClick={() => setNewPriority(level)}
                aria-pressed={newPriority === level}
                title = {level === 'high' ? 'Высокий приоритет' : level === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
              >
                <i className={`fas fa-flag ${
                    level === 'high' ? (newPriority === 'high' ? 'text-white': 'text-rose-500') :
                    level === 'medium' ? (newPriority === 'medium' ? 'text-white': 'text-amber-500') :
                    (newPriority === 'low' ? 'text-white': 'text-sky-500')
                }`}></i>
                {level === 'high' ? 'Высокий' : level === 'medium' ? 'Средний' : 'Низкий'}
              </button>
            ))}
            {newPriority && (
              <button 
                type="button" 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full focus-ring" 
                onClick={() => setNewPriority(undefined)}
                title="Очистить приоритет"
                aria-label="Очистить приоритет"
              >
                <i className="fas fa-times-circle text-lg"></i>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-lg transition-colors font-semibold flex items-center justify-center focus-ring"
        >
          <i className="fas fa-plus mr-2"></i> Добавить Задачу
        </button>
      </form>
      {tasks.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <i className="fas fa-clipboard-list text-5xl mb-4 text-slate-400"></i>
            <p className="text-xl">Задач пока нет.</p>
            <p className="text-sm">Добавьте первую, чтобы начать планировать!</p>
        </div>
      )}
      <ul className="space-y-3 max-h-[calc(100vh-30rem)] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjusted max-h for new fields */}
        {tasks.map(task => (
          <TodoItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onDelete={deleteTaskHandler}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;