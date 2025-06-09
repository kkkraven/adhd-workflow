import React from 'react';
import { ActiveView } from '../types';
import WeeklyProgressReward from './WeeklyProgressReward'; // Import the refactored component

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const navigationItems = [
  { id: 'calendar', label: 'Календарь', icon: 'fas fa-calendar-days' },
  { id: 'tasks', label: 'Задачи', icon: 'fas fa-list-check' },
  { id: 'checklist', label: 'Чек-лист', icon: 'fas fa-square-check' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'fas fa-clock' },
  { id: 'assistant', label: 'Помощник', icon: 'fas fa-wand-magic-sparkles' },
  { id: 'help', label: 'Помощь', icon: 'fas fa-circle-question' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-slate-100 p-6 flex flex-col space-y-7 border-r border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 px-2">
        ADHD Workflow
      </h1>
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group
                  ${
                    activeView === item.id
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-700'
                  }
                  focus-ring
                `}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <i className={`${item.icon} w-5 h-5 text-base ${activeView === item.id ? 'text-sky-600' : 'text-slate-500 group-hover:text-slate-600'}`}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Weekly Reward Visual below Help */}
      <div className="mt-auto border-t border-slate-200 pt-1">
        <WeeklyProgressReward />
      </div>
    </aside>
  );
};

export default Sidebar;