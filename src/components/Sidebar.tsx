import React from 'react';
import { motion } from 'framer-motion';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onSettingsClick }) => {
  const menuItems = [
    { id: 'calendar', label: 'Календарь', icon: '📅' },
    { id: 'tasks', label: 'Задачи', icon: '✅' },
    { id: 'assistant', label: 'Помощник', icon: '🤖' },
    { id: 'pomodoro', label: 'Помодоро', icon: '⏱️' },
    { id: 'checklist', label: 'Чек-листы', icon: '📋' },
    { id: 'help', label: 'Помощь', icon: '❓' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
          ADHD Workflow
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id as ActiveView)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <motion.button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xl">⚙️</span>
          <span>Настройки</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;