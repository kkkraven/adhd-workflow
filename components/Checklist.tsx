import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Task, PriorityLevel } from '../types';
import { fetchUserTasks, createUserTask, updateUserTask, deleteUserTask } from '../src/services/backendApi';
import TodoItem from './TodoItem';

const sortChecklistTasks = (tasks: Task[], todayDateString: string): Task[] => {
  return tasks
    .filter(task => task.dueDate === todayDateString || !task.dueDate) // Show tasks for today or undated tasks
    .sort((a, b) => {
      // 1. Incomplete tasks before completed tasks
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      if (!a.isCompleted) { // Sort active tasks more granularly
        // 2. Priority: High > Medium > Low > Undefined
        const priorityOrder: Record<PriorityLevel, number> = { high: 1, medium: 2, low: 3 };
        const aPriorityVal = a.priority ? priorityOrder[a.priority] : 4;
        const bPriorityVal = b.priority ? priorityOrder[b.priority] : 4;

        if (aPriorityVal !== bPriorityVal) {
          return aPriorityVal - bPriorityVal;
        }
        
        // 3. Due Time for today's tasks (earliest first)
        // Tasks without due time come after tasks with due time
        const aDueTime = a.dueTime || "23:59:59"; // Treat no time as end of day
        const bDueTime = b.dueTime || "23:59:59";
        if (aDueTime.localeCompare(bDueTime) !== 0) {
           return aDueTime.localeCompare(bDueTime);
        }
      } else { // Sort completed tasks by completion time (newest first)
        if (a.completedAt && b.completedAt) {
            return b.completedAt - a.completedAt;
        } else if (a.completedAt) {
            return -1; 
        } else if (b.completedAt) {
            return 1;  
        }
      }
      
      // 4. Creation Time (newest first as a final tie-breaker)
      return b.createdAt - a.createdAt;
    });
};

const Checklist: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel | undefined>(undefined);

  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setLoading(true);
    fetchUserTasks()
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const todaysTasks = useMemo(() => {
    return sortChecklistTasks(tasks, todayDateString);
  }, [tasks, todayDateString]);

  const addTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      isCompleted: false,
      createdAt: Date.now(),
      dueDate: todayDateString, 
      dueTime: undefined, 
      priority: newPriority,
    };
    try {
      setLoading(true);
      const created = await createUserTask(newTask);
      setTasks(prev => sortChecklistTasks([created, ...prev], todayDateString));
      setNewTaskText('');
      setNewPriority(undefined);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [newTaskText, todayDateString, newPriority]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      setLoading(true);
      const updated = await updateUserTask(id, { isCompleted: !task.isCompleted, completedAt: !task.isCompleted ? Date.now() : undefined });
      setTasks(prev => sortChecklistTasks(prev.map(t => t.id === id ? updated : t), todayDateString));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tasks, todayDateString]);

  const deleteTaskHandler = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteUserTask(id);
      setTasks(prev => sortChecklistTasks(prev.filter(t => t.id !== id), todayDateString));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [todayDateString]);

  const priorityButtonClass = (level: PriorityLevel, current?: PriorityLevel) => 
    `px-3 py-1.5 text-xs rounded-md focus-ring transition-colors font-medium flex items-center gap-1.5
     ${current === level 
       ? (level === 'high' ? 'bg-rose-500 text-white' : level === 'medium' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white')
       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
     }`;

  return (
    <div className="bg-white rounded-lg">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Чек-лист (Сегодня)
      </h1>
      <form onSubmit={addTask} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="relative mb-3">
          <i className="fas fa-pencil-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Добавить задачу на сегодня..."
            className="w-full p-3 pl-10 bg-white border border-slate-300 rounded-lg focus-ring placeholder-slate-400 text-slate-700 transition-colors"
            aria-label="Текст новой задачи для контрольного списка"
            disabled={loading}
          />
        </div>
        
        <div className="mb-3">
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
                disabled={loading}
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
                disabled={loading}
              >
                <i className="fas fa-times-circle text-lg"></i>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-lg transition-colors font-semibold flex items-center justify-center focus-ring"
          disabled={loading}
        >
          <i className="fas fa-plus mr-2"></i> Добавить
        </button>
      </form>
      {loading && <div className="text-center text-slate-500 py-4"><i className="fas fa-spinner fa-spin mr-2"></i>Загрузка...</div>}
      {error && <div className="text-center text-rose-600 py-2">{error}</div>}
      {todaysTasks.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <i className="fas fa-calendar-check text-5xl mb-4 text-slate-400"></i>
            <p className="text-xl">На сегодня задач нет.</p>
            <p className="text-sm">Добавьте новые или запланируйте их в разделе "Задачи".</p>
        </div>
      )}
      <ul className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjusted max-h */}
        {todaysTasks.map(task => (
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

export default Checklist;