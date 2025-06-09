import React, { useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task, WeeklyRewardState } from '../types';
import { getWeekId, getStartOfWeek, getEndOfWeek } from '../utils/dateUtils';

const MAX_TASKS_FOR_REWARD = 10;
const MUG_INNER_HEIGHT = 18; // Max height for the liquid in SVG units
const LIQUID_BOTTOM_Y = 22; // Y-coordinate for the bottom of the liquid area

const WeeklyProgressReward: React.FC = () => {
  const [tasks] = useLocalStorage<Task[]>('tasks', []);
  const initialRewardState: WeeklyRewardState = { weekId: getWeekId(new Date()), claimed: false };
  const [rewardStatus, setRewardStatus] = useLocalStorage<WeeklyRewardState>('weeklyBeerReward', initialRewardState);

  const currentWeekId = useMemo(() => getWeekId(new Date()), []);
  const startOfCurrentWeek = useMemo(() => getStartOfWeek(new Date(), 1), []);
  const endOfCurrentWeek = useMemo(() => getEndOfWeek(new Date(), 1), []);

  useEffect(() => {
    if (rewardStatus.weekId !== currentWeekId) {
      setRewardStatus({ weekId: currentWeekId, claimed: false });
    }
  }, [currentWeekId, rewardStatus.weekId, setRewardStatus]);

  const completedTasksThisWeekCount = useMemo(() => {
    return tasks.filter(task => {
      if (!task.isCompleted || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfCurrentWeek && completedDate <= endOfCurrentWeek;
    }).length;
  }, [tasks, startOfCurrentWeek, endOfCurrentWeek]);

  useEffect(() => {
    if (
      rewardStatus.weekId === currentWeekId &&
      !rewardStatus.claimed &&
      completedTasksThisWeekCount >= MAX_TASKS_FOR_REWARD
    ) {
      setRewardStatus(prev => ({ ...prev, claimed: true }));
    }
  }, [completedTasksThisWeekCount, currentWeekId, rewardStatus.claimed, rewardStatus.weekId, setRewardStatus]);
  
  const isRewardClaimedForCurrentWeek = rewardStatus.weekId === currentWeekId && rewardStatus.claimed;

  const progressToDisplay = isRewardClaimedForCurrentWeek
    ? MAX_TASKS_FOR_REWARD
    : Math.min(completedTasksThisWeekCount, MAX_TASKS_FOR_REWARD);

  const liquidCurrentHeight = (progressToDisplay / MAX_TASKS_FOR_REWARD) * MUG_INNER_HEIGHT;
  const liquidY = LIQUID_BOTTOM_Y - liquidCurrentHeight;
  const foamY = liquidY - 1.5; // Position foam just above the liquid
  const foamOpacity = progressToDisplay > 0 ? 1 : 0;

  const titleText = isRewardClaimedForCurrentWeek
    ? `Награда за неделю получена! (${MAX_TASKS_FOR_REWARD}/${MAX_TASKS_FOR_REWARD} задач)`
    : `Выполнено ${progressToDisplay} из ${MAX_TASKS_FOR_REWARD} задач на этой неделе`;

  return (
    <div className="mt-3 py-2 px-1 flex flex-col items-center group" title={titleText}>
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="text-slate-400 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-slate-500" 
           aria-hidden="true">
        {/* Mug Base */}
        <path d="M8 28H24C25.1046 28 26 28.8954 26 30V32C26 33.1046 25.1046 34 24 34H8C6.89543 34 6 33.1046 6 32V30C6 28.8954 6.89543 28 8 28Z" 
              fill="#E5E7EB" stroke="currentColor" strokeWidth="1.5"/>
        
        {/* Mug Body */}
        <path d="M6 4H26C27.1046 4 28 4.89543 28 6V26C28 27.1046 27.1046 28 26 28H6C4.89543 28 4 27.1046 4 26V6C4 4.89543 4.89543 4 6 4Z" 
              stroke="currentColor" strokeWidth="1.5" fill={progressToDisplay > 0 ? "#E5E7EB" : "#F3F4F6"} />
        
        {/* Mug Handle */}
        <path d="M26 8H30C31.1046 8 32 8.89543 32 10V20C32 21.1046 31.1046 22 30 22H26" 
              stroke="currentColor" strokeWidth="1.5" fill={progressToDisplay > 0 ? "#E5E7EB" : "#F3F4F6"}/>
        
        {/* Liquid with gradient */}
        {progressToDisplay > 0 && (
          <>
            <defs>
              <linearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect 
              x="7" 
              y={liquidY} 
              width="18" 
              height={liquidCurrentHeight} 
              fill="url(#beerGradient)" 
              className="transition-all duration-500 ease-out"
              rx="1"
            />
          </>
        )}
        
        {/* Foam with bubbles */}
        {progressToDisplay > 0 && (
          <>
            <ellipse 
              cx="16" 
              cy={foamY} 
              rx="10" 
              ry="3" 
              fill="rgba(255, 255, 255, 0.95)"
              className="transition-all duration-300 ease-out" 
              style={{ opacity: foamOpacity }}
            />
            {/* Bubbles */}
            <circle cx="12" cy={foamY - 1} r="1" fill="rgba(255, 255, 255, 0.8)" className="animate-bubble" />
            <circle cx="18" cy={foamY - 0.5} r="0.8" fill="rgba(255, 255, 255, 0.8)" className="animate-bubble" style={{ animationDelay: '0.2s' }} />
            <circle cx="15" cy={foamY - 1.5} r="0.6" fill="rgba(255, 255, 255, 0.8)" className="animate-bubble" style={{ animationDelay: '0.4s' }} />
          </>
        )}
      </svg>
      <div className="text-xs text-slate-500 mt-1 font-medium">
        {progressToDisplay}/{MAX_TASKS_FOR_REWARD}
      </div>
      <style jsx>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-2px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0.8; }
        }
        .animate-bubble {
          animation: bubble 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WeeklyProgressReward;