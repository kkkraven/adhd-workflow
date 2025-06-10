import React from 'react';
import { motion } from 'framer-motion';
import { ActiveView } from '../types';
import WeeklyProgressReward from './WeeklyProgressReward'; // Import the refactored component

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const navigationItems = [
  { id: 'calendar', label: 'Календарь', icon: 'fas fa-calendar-days' },
  { id: 'tasks', label: 'Задачи', icon: 'fas fa-list-check' },
  { id: 'checklist', label: 'Чек-лист', icon: 'fas fa-square-check' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'fas fa-clock' },
  { id: 'assistant', label: 'Помощник', icon: 'fas fa-wand-magic-sparkles' },
  { id: 'help', label: 'Помощь', icon: 'fas fa-circle-question' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isDarkMode, 
  setIsDarkMode 
}) => {
  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-slate-100 dark:bg-slate-800 p-6 flex flex-col space-y-7 border-r border-slate-200 dark:border-slate-700 transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 px-2">
          ADHD Workflow
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          aria-label={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-slate-600'}`}></i>
        </button>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {navigationItems.map((item) => (
            <motion.li 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group
                  ${
                    activeView === item.id
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-700 dark:hover:text-slate-100'
                  }
                  focus-ring
                `}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <i className={`${item.icon} w-5 h-5 text-base ${
                  activeView === item.id 
                    ? 'text-sky-600 dark:text-sky-400' 
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}></i>
                <span>{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
      {/* Weekly Reward Visual below Help */}
      <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-1">
        <WeeklyProgressReward />
      </div>
    </motion.aside>
  );
};

export default Sidebar;