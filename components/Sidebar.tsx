import React from 'react';
import { motion } from 'framer-motion';
import { ActiveView } from '../types';
import WeeklyProgressReward from './WeeklyProgressReward'; // Import the refactored component
import useGoogleAuth from '../hooks/useGoogleAuth';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  isSignedIn: boolean;
  user: any;
  signIn: () => void;
  signOut: () => void;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { id: 'calendar', label: 'Календарь', icon: 'fas fa-calendar-days' },
  { id: 'tasks', label: 'Задачи', icon: 'fas fa-list-check' },
  { id: 'checklist', label: 'Чек-лист', icon: 'fas fa-square-check' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'fas fa-clock' },
  { id: 'assistant', label: 'Помощник', icon: 'fas fa-wand-magic-sparkles' },
  { id: 'help', label: 'Помощь', icon: 'fas fa-circle-question' },
];

let touchStartX = 0;
let touchEndX = 0;

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isDarkMode, 
  setIsDarkMode, 
  isSignedIn, 
  user, 
  signIn, 
  signOut, 
  isLoading, 
  isOpen = true, 
  onClose 
}) => {
  // Обработчики свайпа для мобильных
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 60 && onClose) {
      onClose(); // свайп влево закрывает меню
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {onClose && isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose}></div>
      )}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed md:static z-50 md:z-auto top-0 left-0 h-full md:h-auto w-64 bg-[#f5f7fa] p-6 flex flex-col space-y-7 border-r border-[#e5e7eb] transition-colors duration-200 shadow-none
          ${isOpen ? '' : 'pointer-events-none'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-800 px-2">
            ADHD Workflow
          </h1>
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
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors duration-150 group
                    ${
                      activeView === item.id
                        ? 'bg-white text-slate-900 border border-[#e5e7eb]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                    }
                    focus-ring
                  `}
                  aria-current={activeView === item.id ? 'page' : undefined}
                >
                  <i className={`${item.icon} w-5 h-5 text-base ${
                    activeView === item.id 
                      ? 'text-blue-400' 
                      : 'text-slate-400 group-hover:text-blue-400'
                  }`}></i>
                  <span>{item.label}</span>
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-[#e5e7eb] pt-1">
          <WeeklyProgressReward />
          <div className="flex justify-center mt-4">
            {!isSignedIn ? (
              <button
                className="p-2 rounded-full border border-[#e5e7eb] bg-white shadow-none hover:bg-[#f5f7fa] transition-colors"
                onClick={signIn}
                disabled={isLoading}
                title="Войти через Google"
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-6 h-6" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {user?.getImageUrl && (
                  <img src={user.getImageUrl()} alt="avatar" className="w-7 h-7 rounded-full border border-[#e5e7eb]" />
                )}
                <button
                  className="p-2 rounded-full border border-[#e5e7eb] bg-white shadow-none hover:bg-[#f5f7fa] transition-colors"
                  onClick={signOut}
                  title="Выйти из Google"
                >
                  <i className="fas fa-sign-out-alt text-slate-400"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button className="absolute top-4 right-4 md:hidden text-2xl text-slate-400 hover:text-slate-700" onClick={onClose} aria-label="Закрыть меню">
            &times;
          </button>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;