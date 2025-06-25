import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroPhase, PomodoroSettings } from '../types';
import { DEFAULT_POMODORO_SETTINGS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { showNotification } from '../src/utils/notification';
import { toast } from 'react-toastify';

const PomodoroTimer: React.FC = () => {
  const [settings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', DEFAULT_POMODORO_SETTINGS);
  const [phase, setPhase] = useState<PomodoroPhase>(PomodoroPhase.WORK);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
      audioRef.current.volume = 0.3;
    }
  }, []);

  const updateTimerForPhase = useCallback((currentPhase: PomodoroPhase, currentSettings: PomodoroSettings) => {
    let newTime;
    switch (currentPhase) {
      case PomodoroPhase.WORK:
        newTime = currentSettings.workDuration * 60;
        break;
      case PomodoroPhase.SHORT_BREAK:
        newTime = currentSettings.shortBreakDuration * 60;
        break;
      case PomodoroPhase.LONG_BREAK:
        newTime = currentSettings.longBreakDuration * 60;
        break;
      default:
        newTime = currentSettings.workDuration * 60;
    }
    setTimeLeft(newTime);
  }, []);
  
  useEffect(() => {
    if (timerId.current) clearInterval(timerId.current);
    setIsRunning(false);
    updateTimerForPhase(phase, settings);
  }, [phase, settings, updateTimerForPhase]);


  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerId.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) { 
      if (timerId.current) clearInterval(timerId.current);
      audioRef.current?.play().catch(e => console.warn("Audio play failed:", e));
      
      // Показываем уведомление, если разрешено
      const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
      let notifTitle = '';
      if (phase === PomodoroPhase.WORK) notifTitle = 'Время работать завершено!';
      else if (phase === PomodoroPhase.SHORT_BREAK) notifTitle = 'Перерыв окончен!';
      else if (phase === PomodoroPhase.LONG_BREAK) notifTitle = 'Длинный отдых окончен!';
      if (notificationsEnabled) {
        showNotification(notifTitle);
      }
      // Тост всегда
      toast.info(notifTitle);
      
      let nextPhase = PomodoroPhase.WORK;
      if (phase === PomodoroPhase.WORK) {
        const newCyclesCompleted = cyclesCompleted + 1;
        setCyclesCompleted(newCyclesCompleted);
        if (newCyclesCompleted > 0 && newCyclesCompleted % settings.longBreakInterval === 0) {
          nextPhase = PomodoroPhase.LONG_BREAK;
        } else {
          nextPhase = PomodoroPhase.SHORT_BREAK;
        }
      } else { 
        nextPhase = PomodoroPhase.WORK;
      }
      setPhase(nextPhase);
      setIsRunning(false); 
    }
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [isRunning, timeLeft, phase, settings, cyclesCompleted]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetCurrentPhaseTimer = () => {
    if (timerId.current) clearInterval(timerId.current);
    setIsRunning(false);
    updateTimerForPhase(phase, settings);
  };

  const handlePhaseChange = (newPhase: PomodoroPhase) => {
    setPhase(newPhase);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const phaseConfig = {
    [PomodoroPhase.WORK]: { name: 'Работа', baseColor: 'bg-sky-600', textColor: 'text-sky-700', progressColor: 'stroke-sky-500', ringColor: 'stroke-sky-200' },
    [PomodoroPhase.SHORT_BREAK]: { name: 'Перерыв', baseColor: 'bg-emerald-600', textColor: 'text-emerald-700', progressColor: 'stroke-emerald-500', ringColor: 'stroke-emerald-200' },
    [PomodoroPhase.LONG_BREAK]: { name: 'Отдых', baseColor: 'bg-indigo-600', textColor: 'text-indigo-700', progressColor: 'stroke-indigo-500', ringColor: 'stroke-indigo-200' },
  };

  const currentPhaseConfig = phaseConfig[phase];
  const initialDuration = 
    phase === PomodoroPhase.WORK ? settings.workDuration * 60 :
    phase === PomodoroPhase.SHORT_BREAK ? settings.shortBreakDuration * 60 :
    settings.longBreakDuration * 60;
  
  const progressPercentage = initialDuration > 0 ? ((initialDuration - timeLeft) / initialDuration) * 100 : 0;
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-sm border border-slate-200">
      <div className="w-full flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold text-slate-800">Pomodoro</h1>
      </div>
      <p className={`text-center text-lg ${currentPhaseConfig.textColor} mb-6 font-medium`}>{currentPhaseConfig.name}</p>
      
      <div className="relative w-52 h-52 mb-6">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle
            className={`${currentPhaseConfig.ringColor} opacity-70`}
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
          <circle
            className={`${currentPhaseConfig.progressColor} transition-all duration-500 ease-linear`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-5xl font-mono font-bold ${currentPhaseConfig.textColor} tabular-nums`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 ${currentPhaseConfig.baseColor} hover:opacity-80 text-white font-semibold rounded-lg transition-colors w-36 text-lg flex items-center justify-center focus-ring`}
          aria-label={isRunning ? "Приостановить таймер" : "Запустить таймер"}
        >
          {isRunning ? <><i className="fas fa-pause mr-2"></i>Пауза</> : <><i className="fas fa-play mr-2"></i>Старт</>}
        </button>
        <button
          onClick={resetCurrentPhaseTimer}
          className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors w-36 text-lg flex items-center justify-center focus-ring"
          aria-label="Сбросить таймер"
        >
          <i className="fas fa-rotate-right mr-2"></i>Сброс
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-sm">
          {(Object.keys(PomodoroPhase) as Array<keyof typeof PomodoroPhase>).map((pKey) => (
            <button
              key={pKey}
              onClick={() => handlePhaseChange(PomodoroPhase[pKey])}
              className={`px-4 py-2 rounded-md transition-colors duration-200 focus-ring
                ${phase === PomodoroPhase[pKey] 
                  ? `${phaseConfig[PomodoroPhase[pKey]].baseColor} text-white font-bold ring-2 ring-offset-1 ${phaseConfig[PomodoroPhase[pKey]].ringColor} shadow-lg` 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200'
                }`}
              aria-label={`Переключить на фазу: ${phaseConfig[PomodoroPhase[pKey]].name}`}
              aria-pressed={phase === PomodoroPhase[pKey]}
            >
              {phaseConfig[PomodoroPhase[pKey]].name}
            </button>
          ))}
      </div>
      <p className="text-center text-xs text-slate-500 mt-5">Завершено циклов работы: {cyclesCompleted}</p>
    </div>
  );
};

export default PomodoroTimer;