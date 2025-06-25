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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-[#e5e7eb] shadow hover:bg-[#f5f7fa] transition-all duration-300"
        onClick={() => setSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        <span className={`block w-7 h-1 bg-slate-400 rounded transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-7 h-1 bg-slate-400 rounded my-1 transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-7 h-1 bg-slate-400 rounded transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
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
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!rounded-xl !shadow-lg !font-semibold !text-base"
        bodyClassName="!py-3 !px-4"
        icon={({type}) => type === 'success' ? '🎉' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️'}
      />
      {/* Overlay для Sidebar на мобильных */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fadeInSidebarOverlay md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      <style>{`
        @keyframes fadeInSidebarOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInSidebarOverlay {
          animation: fadeInSidebarOverlay 0.25s ease;
        }
      `}</style>
    </div>
  );
};

export default App;
