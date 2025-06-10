import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TaskCalendar from './components/TaskCalendar';
import TodoList from './components/TodoList';
import Assistant from './components/Assistant';
import PomodoroTimer from './components/PomodoroTimer';
import Checklist from './components/Checklist';
import FocusTip from './components/FocusTip';
import RemindersBar from './components/RemindersBar';
import HelpSection from './components/HelpSection';
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('calendar');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Проверяем системные настройки темной темы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // Применяем класс темной темы к body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderView = () => {
    const views = {
      calendar: <TaskCalendar />,
      tasks: <TodoList />,
      assistant: <Assistant />,
      pomodoro: <PomodoroTimer />,
      checklist: <Checklist />,
      help: <HelpSection />,
    };

    return views[activeView] || views.calendar;
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors duration-200">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-white dark:bg-slate-800 transition-colors duration-200">
        <RemindersBar />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
        {(activeView !== 'assistant' && activeView !== 'help' && 
          (activeView === 'tasks' || activeView === 'checklist' || activeView === 'pomodoro')) && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FocusTip />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default App;