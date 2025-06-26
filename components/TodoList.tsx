import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Task, PriorityLevel } from '../types';
import { fetchUserTasks, createUserTask, updateUserTask, deleteUserTask } from '../src/services/backendApi';
import TodoItem from './TodoItem';
import MiniCalendarDatePicker from './MiniCalendarDatePicker';
import useGoogleAuth from '../hooks/useGoogleAuth';
import { listTasks, insertTask } from '../services/googleTasksService';
import { toast } from 'react-toastify';
import useLocalStorage from '../hooks/useLocalStorage';
// @ts-ignore
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

const AUTO_TASKS_REFRESH_INTERVAL = 60000; // 60 секунд

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);
  const { accessToken } = useGoogleAuth();
  const [showQuickInput, setShowQuickInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
  
  // Импорт задач из Google Tasks
  const importFromGoogleTasks = async () => {
    if (!accessToken) {
      toast.error('Нет доступа к Google Tasks');
      return;
    }
    try {
      const googleTasks = await listTasks(accessToken);
      if (!googleTasks.length) {
        toast.info('В Google Tasks нет задач для импорта.');
        return;
      }
      // Маппинг GoogleTask -> Task
      const mapped = googleTasks.map(gt => ({
        id: gt.id,
        text: gt.title || '',
        isCompleted: gt.status === 'completed',
        createdAt: gt.updated ? new Date(gt.updated).getTime() : Date.now(),
        dueDate: gt.due ? gt.due.slice(0, 10) : undefined,
        dueTime: gt.due ? gt.due.slice(11, 16) : undefined,
        priority: undefined,
      }));
      // Добавляем только новые задачи (по id)
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const toAdd = mapped.filter(t => !existingIds.has(t.id));
        if (toAdd.length) toast.success(`Импортировано задач: ${toAdd.length}`);
        else toast.info('Все задачи уже импортированы.');
        return sortTasks([...prev, ...toAdd]);
      });
    } catch (e: any) {
      toast.error('Ошибка импорта из Google Tasks');
    }
  };

  // Экспорт задач в Google Tasks
  const exportToGoogleTasks = async () => {
    if (!accessToken) {
      toast.error('Нет доступа к Google Tasks');
      return;
    }
    try {
      let count = 0;
      for (const t of tasks) {
        await insertTask(accessToken, {
          title: t.text,
          status: t.isCompleted ? 'completed' : 'needsAction',
          due: t.dueDate ? `${t.dueDate}T${t.dueTime || '00:00:00'}.000Z` : undefined,
        });
        count++;
      }
      toast.success(`Экспортировано задач: ${count}`);
    } catch (e: any) {
      toast.error('Ошибка экспорта в Google Tasks');
    }
  };

  // Автообновление задач из Google Tasks
  useEffect(() => {
    if (!accessToken) return;
    let stopped = false;
    const poll = async () => {
      try {
        const googleTasks = await listTasks(accessToken);
        setTasks(prev => {
          const byId: Record<string, Task> = Object.fromEntries(prev.map(t => [t.id, t]));
          let updated = [...prev];
          for (const gt of googleTasks) {
            const local = byId[gt.id];
            const gtUpdated = gt.updated ? new Date(gt.updated).getTime() : 0;
            if (!local) {
              // Новая задача из Google
              updated.push({
                id: gt.id,
                text: gt.title || '',
                isCompleted: gt.status === 'completed',
                createdAt: gtUpdated || Date.now(),
                dueDate: gt.due ? gt.due.slice(0, 10) : undefined,
                dueTime: gt.due ? gt.due.slice(11, 16) : undefined,
                priority: undefined,
              });
            } else {
              // Конфликт: обновляем, если Google версия свежее
              if (gtUpdated > (local.updated || local.createdAt)) {
                updated = updated.map(t => t.id === gt.id ? {
                  ...t,
                  text: gt.title || '',
                  isCompleted: gt.status === 'completed',
                  dueDate: gt.due ? gt.due.slice(0, 10) : undefined,
                  dueTime: gt.due ? gt.due.slice(11, 16) : undefined,
                } : t);
              }
            }
          }
          return sortTasks(updated);
        });
      } catch {}
      if (!stopped) setTimeout(poll, AUTO_TASKS_REFRESH_INTERVAL);
    };
    poll();
    return () => { stopped = true; };
  }, [accessToken]);

  // Генерация подзадач через Assistant
  const handleGenerateSubtasks = (task: Task) => {
    const userMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: `Разбей задачу на подзадачи: ${task.text}`,
      timestamp: Date.now(),
    };
    // Можно добавить уведомление/toast
  };

  // Drag & Drop обработчик
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  };

  return (
    <div className="bg-white rounded-lg">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Задачи
      </h1>
      <div className="flex gap-2 mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
          onClick={importFromGoogleTasks}
        >
          <i className="fab fa-google mr-2"></i>Импорт из Google Tasks
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={exportToGoogleTasks}
        >
          <i className="fab fa-google mr-2"></i>Экспорт в Google Tasks
        </button>
      </div>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todo-list-droppable">
          {(provided: any) => (
            <ul
              className="space-y-3 max-h-[calc(100vh-30rem)] overflow-y-auto pr-2 custom-scrollbar"
              ref={provided.innerRef}
              {...provided.droppableProps}
              onClick={() => setShowQuickInput(true)}
              style={{ cursor: 'pointer' }}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided: any, snapshot: any) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between py-2 border-b bg-white transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <TodoItem task={task} onToggle={toggleTask} onDelete={deleteTaskHandler} />
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200"
                        onClick={() => handleGenerateSubtasks(task)}
                        title="Сгенерировать подзадачи"
                      >
                        <i className="fas fa-sitemap mr-1"></i>Подзадачи
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {showQuickInput && (
                <li className="flex items-center py-2 border-b bg-slate-50">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onBlur={() => setShowQuickInput(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addTask(e as any);
                        setShowQuickInput(false);
                      }
                    }}
                    placeholder="Быстрое добавление задачи..."
                    className="w-full p-2 border rounded focus-ring"
                  />
                </li>
              )}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TodoList;