import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { ThemeSettings } from './components/ThemeSettings';
import RemindersBar from '../components/RemindersBar';
import TodoList from '../components/TodoList';
import TaskCalendar from '../components/TaskCalendar';
import FocusTip from '../components/FocusTip';
import WeeklyProgressReward from '../components/WeeklyProgressReward';
import Checklist from '../components/Checklist';
import Assistant from '../components/Assistant';
import PomodoroTimer from '../components/PomodoroTimer';
import HelpSection from '../components/HelpSection';
import { ThemeProvider } from './contexts/ThemeContext';
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('tasks');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onSettingsClick={() => setShowSettings(true)}
        />
        <main className="flex-1 flex flex-col min-h-screen p-4 md:p-8 gap-4">
          <RemindersBar />
          <div className="mb-4">
            <FocusTip />
          </div>
          <div className="flex-1">
            {activeView === 'tasks' && <TodoList />}
            {activeView === 'calendar' && <TaskCalendar />}
            {activeView === 'checklist' && <Checklist />}
            {activeView === 'assistant' && <Assistant />}
            {activeView === 'pomodoro' && <PomodoroTimer />}
            {activeView === 'help' && <HelpSection />}
          </div>
          <div className="mt-8 flex justify-center">
            <WeeklyProgressReward />
          </div>
        </main>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl focus-ring"
                onClick={() => setShowSettings(false)}
                aria-label="Закрыть настройки"
              >
                &times;
              </button>
              <ThemeSettings />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
