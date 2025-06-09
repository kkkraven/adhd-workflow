import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TaskCalendar from './components/TaskCalendar';
import TodoList from './components/TodoList';
import Assistant from './components/Assistant';
import PomodoroTimer from './components/PomodoroTimer';
import Checklist from './components/Checklist';
import FocusTip from './components/FocusTip';
import RemindersBar from './components/RemindersBar';
import HelpSection from './components/HelpSection'; 
// import WeeklyProgressReward from './components/WeeklyProgressReward'; // Removed import
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('calendar');

  const renderView = () => {
    switch (activeView) {
      case 'calendar':
        return <TaskCalendar />;
      case 'tasks':
        return <TodoList />;
      case 'assistant':
        return <Assistant />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'checklist':
        return <Checklist />;
      case 'help': 
        return <HelpSection />;
      default:
        return <TaskCalendar />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-white">
        <RemindersBar />
        {/* <WeeklyProgressReward /> Removed WeeklyProgressReward from here */}
        {renderView()}
        {/* Conditionally render FocusTip, avoid rendering it in assistant and help views */}
        {(activeView !== 'assistant' && activeView !== 'help' && (activeView === 'tasks' || activeView === 'checklist' || activeView === 'pomodoro')) && (
            <div className="mt-8">
                 <FocusTip />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;