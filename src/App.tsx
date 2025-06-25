import React, { useState, useEffect } from 'react';
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
import useGoogleAuth from '../hooks/useGoogleAuth';
import { requestNotificationPermission, isNotificationGranted } from './utils/notification';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn, user, signIn, signOut, isLoading } = useGoogleAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', String(notificationsEnabled));
    if (notificationsEnabled && !isNotificationGranted()) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Бургер-меню для мобильных */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-[#e5e7eb] shadow hover:bg-[#f5f7fa]"
        onClick={() => setSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect y="4" width="24" height="2" rx="1" fill="#94a3b8"/><rect y="11" width="24" height="2" rx="1" fill="#94a3b8"/><rect y="18" width="24" height="2" rx="1" fill="#94a3b8"/></svg>
      </button>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isSignedIn={isSignedIn}
        user={user}
        signIn={signIn}
        signOut={signOut}
        isLoading={isLoading}
        isOpen={sidebarOpen || window.innerWidth >= 768}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-h-screen p-4 md:p-8 gap-4 md:ml-0 ml-0">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <label htmlFor="notif-toggle">Push-уведомления</label>
          <input
            id="notif-toggle"
            type="checkbox"
            checked={notificationsEnabled}
            onChange={e => setNotificationsEnabled(e.target.checked)}
            style={{ width: 40, height: 20 }}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
