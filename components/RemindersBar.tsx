import React, { useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task } from '../types';

// Helper function to parse dueDate and dueTime into a Date object
const getTaskDateTime = (task: Task): Date | null => {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  let hour = 0;
  let minute = 0;
  if (task.dueTime) {
    [hour, minute] = task.dueTime.split(':').map(Number);
  }
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day, hour, minute);
};

const RemindersBar: React.FC = () => {
  const [tasks] = useLocalStorage<Task[]>('tasks', []);

  const { overdueTasks, upcomingTasks } = useMemo(() => {
    const now = new Date(); // Define 'now' inside useMemo for fresh calculation
    const overdue: Task[] = [];
    const upcoming: Task[] = [];

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    tasks.forEach(task => {
      if (task.isCompleted) return;

      const taskDateTime = getTaskDateTime(task);
      if (!taskDateTime) return; 

      if (taskDateTime < now) {
        overdue.push(task);
      } else {
        const taskDateOnly = new Date(taskDateTime);
        taskDateOnly.setHours(0,0,0,0);

        if (taskDateOnly.getTime() === todayDate.getTime() || taskDateOnly.getTime() === tomorrowDate.getTime()) {
            upcoming.push(task);
        }
      }
    });

    overdue.sort((a, b) => (getTaskDateTime(a)?.getTime() || 0) - (getTaskDateTime(b)?.getTime() || 0));
    upcoming.sort((a, b) => (getTaskDateTime(a)?.getTime() || 0) - (getTaskDateTime(b)?.getTime() || 0));

    return { overdueTasks: overdue, upcomingTasks: upcoming };
  }, [tasks]);

  if (overdueTasks.length === 0 && upcomingTasks.length === 0) {
    return null; 
  }

  const renderTaskItem = (task: Task, type: 'overdue' | 'upcoming') => {
    const taskDateTime = getTaskDateTime(task);
    let displayTime = '';
    if (taskDateTime) {
        displayTime = `${task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('ru-RU', {day:'2-digit', month:'2-digit'}) : ''} ${task.dueTime || ''}`.trim();
    }

    return (
      <li key={task.id} className={`py-1.5 px-2.5 text-sm rounded-md flex items-center gap-2 shadow-xs
        ${type === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}
      `}>
        <i className={`fas ${type === 'overdue' ? 'fa-exclamation-circle' : 'fa-bell'} text-base`}></i>
        <span className="font-medium truncate flex-1" title={task.text}>{task.text}</span>
        {displayTime && <span className="text-xs whitespace-nowrap text-slate-500">({displayTime})</span>}
      </li>
    );
  };

  return (
    <div className="mb-6 p-4 rounded-lg shadow-md border border-slate-200 bg-white animate-fadeInReminders">
      {overdueTasks.length > 0 && (
        <div className="mb-4 last:mb-0">
          <h3 className="text-lg font-semibold text-rose-600 flex items-center mb-2">
            <i className="fas fa-calendar-times mr-2"></i> Просроченные задачи ({overdueTasks.length})
          </h3>
          <ul className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1.5">
            {overdueTasks.map(task => renderTaskItem(task, 'overdue'))}
          </ul>
        </div>
      )}
      {upcomingTasks.length > 0 && (
        <div className="mb-0"> {/* Use last:mb-0 on parent if both can exist */}
          <h3 className="text-lg font-semibold text-amber-600 flex items-center mb-2">
            <i className="fas fa-hourglass-half mr-2"></i> Ближайшие задачи ({upcomingTasks.length})
          </h3>
          <ul className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1.5">
            {upcomingTasks.map(task => renderTaskItem(task, 'upcoming'))}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes fadeInReminders {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInReminders {
          animation: fadeInReminders 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RemindersBar;