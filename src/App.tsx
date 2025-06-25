import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RemindersBar from '../components/RemindersBar';
import TodoList from '../components/TodoList';
import TaskCalendar from '../components/TaskCalendar';
import FocusTip from '../components/FocusTip';
import WeeklyProgressReward from '../components/WeeklyProgressReward';
import Checklist from '../components/Checklist';
import Assistant from '../components/Assistant';
import PomodoroTimer from '../components/PomodoroTimer';
import HelpSection from '../components/HelpSection';
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('tasks');

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
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
    </div>
  );
};

export default App;
