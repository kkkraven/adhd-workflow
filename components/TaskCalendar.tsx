
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Task, GoogleCalendarEvent } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import useGoogleAuth from '../hooks/useGoogleAuth'; // Uses the new GIS-based hook
import { listUpcomingEvents, doesEventOccurOnDate } from '../services/googleCalendarService';
import { GOOGLE_CLIENT_ID } from '../constants';

const DAYS_OF_WEEK_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

interface CombinedEventItem extends Partial<Task>, Partial<GoogleCalendarEvent> {
  isGoogleEvent?: boolean;
  eventTime?: string; 
  eventDateObject?: Date;
}

interface CalendarDayPopoverProps {
  items: CombinedEventItem[];
  date: Date;
  onClose: () => void;
  positionRef: React.RefObject<HTMLDivElement>;
}

const CalendarDayPopover: React.FC<CalendarDayPopoverProps> = ({ items, date, onClose, positionRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && 
          positionRef.current && !positionRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, positionRef]);
  
  if (!items.length) return null;

  const sortedItems = [...items].sort((a, b) => {
    const timeA = a.isGoogleEvent ? a.start?.dateTime || a.start?.date : (a.dueDate + "T" + (a.dueTime || "00:00"));
    const timeB = b.isGoogleEvent ? b.start?.dateTime || b.start?.date : (b.dueDate + "T" + (b.dueTime || "00:00"));
    
    const dateA = new Date(timeA || 0);
    const dateB = new Date(timeB || 0);

    if (a.isGoogleEvent && a.start?.date && !a.start?.dateTime) dateA.setHours(0,0,0,1);
    if (b.isGoogleEvent && b.start?.date && !b.start?.dateTime) dateB.setHours(0,0,0,1);
    
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div 
      ref={popoverRef}
      className="absolute z-20 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-sm"
      style={{ top: '100%', left: '50%', transform: 'translateX(-50%)' }} 
    >
      <h4 className="font-semibold text-sky-600 mb-2">
        События на {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}:
      </h4>
      <ul className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {sortedItems.map(item => (
          <li key={item.id || item.summary} className="text-slate-600" title={item.text || item.summary}>
            {item.isGoogleEvent ? (
              <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 group flex items-start">
                <i className={`far fa-calendar-check mr-2 mt-0.5 text-xs text-indigo-500 group-hover:text-indigo-400`}></i>
                <span className="truncate flex-1">{item.summary} {item.start?.dateTime ? `(${new Date(item.start.dateTime).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})})` : '(Весь день)'}</span>
                <i className="fas fa-external-link-alt text-xs opacity-50 group-hover:opacity-100 ml-1 self-center"></i>
              </a>
            ) : (
              <div className="flex items-start">
                <i className={`fas fa-circle mr-2 mt-1 text-xs ${item.isCompleted ? 'text-slate-400' : 'text-emerald-500'}`}></i>
                <span className="truncate flex-1">{item.text} {item.dueTime && `(${item.dueTime})`}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-600 p-1 rounded-full focus-ring">
          <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  tasks: Task[];
  googleEvents: GoogleCalendarEvent[];
  onDayClick: (day: Date, localTasks: Task[], googleEvents: GoogleCalendarEvent[], ref: React.RefObject<HTMLDivElement>) => void;
  selectedDayDate: Date | null;
  dayRefs: React.MutableRefObject<Map<string, React.RefObject<HTMLDivElement>>>;
}

const MonthView: React.FC<MonthViewProps> = ({ year, month, tasks, googleEvents, onDayClick, selectedDayDate, dayRefs }) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay(); 

  const daysInMonthGrid = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysInMonthGrid.push(null);
  }
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysInMonthGrid.push(new Date(year, month, day));
  }

  const todayFull = new Date();
  const today = new Date(todayFull.getFullYear(), todayFull.getMonth(), todayFull.getDate());


  return (
    <div className="flex-1 min-w-[280px]">
      <h3 className="text-xl font-semibold text-slate-700 text-center mb-3">
        {MONTH_NAMES_RU[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
        {DAYS_OF_WEEK_LABELS.map(dayLabel => <div key={`${month}-${dayLabel}`}>{dayLabel}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonthGrid.map((dayObject, index) => {
          if (!dayObject) {
            return <div key={`empty-${month}-${index}`} className="h-10 sm:h-12 rounded-md"></div>;
          }
          const day = dayObject as Date;
          const dayStr = day.toISOString().split('T')[0];
          
          const getDayRef = (dStr: string) => {
            if (!dayRefs.current.has(dStr)) {
                dayRefs.current.set(dStr, React.createRef<HTMLDivElement>());
            }
            return dayRefs.current.get(dStr)!;
          };
          const dayRef = getDayRef(dayStr);
          
          let localTasksOnThisDay = tasks.filter(task => task.dueDate === dayStr && !task.isCompleted);
          if (day.getTime() === today.getTime()) {
            const overdueTasks = tasks.filter(task => !task.isCompleted && task.dueDate && new Date(task.dueDate + 'T23:59:59') < today);
            localTasksOnThisDay = [...localTasksOnThisDay, ...overdueTasks.filter(ot => !localTasksOnThisDay.find(lt => lt.id === ot.id))];
          }


          const googleEventsOnThisDay = googleEvents.filter(event => doesEventOccurOnDate(event, dayStr));
          
          const isToday = day.getTime() === today.getTime();
          const isSelected = selectedDayDate?.getTime() === day.getTime();
          const hasActiveLocalTasks = localTasksOnThisDay.some(t => !t.isCompleted);
          const hasGoogleEvents = googleEventsOnThisDay.length > 0;

          return (
            <div 
              key={dayStr} 
              ref={dayRef}
              className={`relative h-10 sm:h-12 p-1 border border-transparent rounded-md flex flex-col items-center justify-center text-xs sm:text-sm transition-all duration-150 cursor-pointer
                ${isToday ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}
                ${isSelected ? 'ring-2 ring-sky-500 bg-slate-100' : ''}
              `}
              onClick={() => onDayClick(day, localTasksOnThisDay, googleEventsOnThisDay, dayRef)}
              role="button" tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDayClick(day, localTasksOnThisDay, googleEventsOnThisDay, dayRef)}
              aria-pressed={isSelected}
              aria-label={`Дата ${day.getDate()} ${MONTH_NAMES_RU[month]}`}
            >
              <span>{day.getDate()}</span>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                {hasActiveLocalTasks && <span className="block w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Есть активные задачи"></span>}
                {hasGoogleEvents && <span className="block w-1.5 h-1.5 bg-indigo-500 rounded-full" title="Есть события Google Calendar"></span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const TaskCalendar: React.FC = () => {
  const [tasks] = useLocalStorage<Task[]>('tasks', []);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: Date; items: CombinedEventItem[]; ref: React.RefObject<HTMLDivElement> } | null>(null);
  const dayRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  
  const { isSignedIn, user, signIn, signOut, isLoading: authIsLoading, error: authError, accessToken } = useGoogleAuth();
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const isGoogleApiConfigured = (GOOGLE_CLIENT_ID as string) !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  const fetchGoogleEventsCb = useCallback(async () => {
    if (!isSignedIn || !isGoogleApiConfigured || !accessToken) {
        setGoogleEvents([]);
        return;
    }
    setEventsLoading(true);
    setEventsError(null);
    try {
      // Pass the access token obtained from GIS to the service function
      const events = await listUpcomingEvents(accessToken); 
      setGoogleEvents(events);
    } catch (err: any) {
      console.error("Error fetching Google events in component:", err);
      setEventsError(err.message || "Не удалось загрузить события из Google Calendar.");
    } finally {
      setEventsLoading(false);
    }
  }, [isSignedIn, isGoogleApiConfigured, accessToken]);

  useEffect(() => {
    if (isSignedIn && accessToken) { 
      fetchGoogleEventsCb();
    } else {
      setGoogleEvents([]);
    }
  }, [isSignedIn, accessToken, fetchGoogleEventsCb]);

  const changeMonth = useCallback((offset: number) => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1); 
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
    setSelectedDay(null);
  }, []);

  const handleDayClick = (day: Date, dayLocalTasks: Task[], dayGoogleEvents: GoogleCalendarEvent[], ref: React.RefObject<HTMLDivElement>) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let relevantLocalTasks = dayLocalTasks;
    if (day.getTime() === today.getTime()) {
        const overdueTasks = tasks.filter(task => !task.isCompleted && task.dueDate && new Date(task.dueDate + 'T23:59:59') < today);
        overdueTasks.forEach(ot => {
            if(!relevantLocalTasks.find(rlt => rlt.id === ot.id)) {
                relevantLocalTasks.push(ot);
            }
        });
    }

    const combinedItems: CombinedEventItem[] = [
      ...relevantLocalTasks.map(task => ({
        ...task, 
        eventTime: task.dueTime,
        eventDateObject: task.dueDate ? new Date(task.dueDate + "T" + (task.dueTime || "00:00:00")) : new Date()
      })), 
      ...dayGoogleEvents.map(e => {
        const start = e.start?.dateTime || e.start?.date;
        let eventDateObject = start ? new Date(start) : new Date();
        let eventTime = '';
        if (e.start?.dateTime) {
          eventTime = eventDateObject.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        return { ...e, isGoogleEvent: true, eventTime, eventDateObject };
      })
    ];

    if (selectedDay && selectedDay.date.getTime() === day.getTime() && selectedDay.ref === ref) {
      setSelectedDay(null); 
    } else if (combinedItems.length > 0) {
      setSelectedDay({ date: day, items: combinedItems, ref });
    } else {
      setSelectedDay(null); 
    }
  };
  
  const year1 = currentDisplayDate.getFullYear();
  const month1 = currentDisplayDate.getMonth();
  
  const nextMonthDate = new Date(currentDisplayDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const year2 = nextMonthDate.getFullYear();
  const month2 = nextMonthDate.getMonth();

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split('T')[0];

  const overdueTasksForTodaySection = tasks.filter(task => !task.isCompleted && task.dueDate && new Date(task.dueDate + 'T23:59:59') < today);
  const localTasksDueToday = tasks.filter(task => task.dueDate === todayStr);
  const uniqueLocalTasksForTodaySection = [...new Map([...overdueTasksForTodaySection, ...localTasksDueToday].map(item => [item.id, item])).values()];

  const googleEventsToday = googleEvents.filter(event => doesEventOccurOnDate(event, todayStr));
  
  const combinedTodayItems: CombinedEventItem[] = [
    ...uniqueLocalTasksForTodaySection.map(task => {
        let eventDateObject = task.dueDate ? new Date(task.dueDate + "T"+ (task.dueTime || "00:00:00")) : new Date();
        return {...task, eventTime: task.dueTime, eventDateObject};
    }),
    ...googleEventsToday.map(event => {
      const start = event.start?.dateTime || event.start?.date;
      let eventDateObject = start ? new Date(start) : new Date();
      let eventTime = '';
      if (event.start?.dateTime) {
        eventTime = eventDateObject.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      } else { 
        eventDateObject.setHours(0,0,0,1); 
      }
      return { ...event, isGoogleEvent: true, eventTime, eventDateObject };
    })
  ].sort((a, b) => (a.eventDateObject?.getTime() || 0) - (b.eventDateObject?.getTime() || 0));


  const renderGoogleAuthButton = () => {
    if (!isGoogleApiConfigured) {
      return (
        <div className="flex flex-col items-start sm:items-end gap-1" 
             title="Google Calendar API не настроен. Заполните Client ID в constants.ts.">
          <button
            className="text-sm bg-slate-400 text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center focus-ring cursor-not-allowed"
            disabled
          >
            <i className="fab fa-google mr-1.5"></i> Подключить Google Calendar
          </button>
          <p className="text-xs text-amber-600 text-center sm:text-right">
            (Client ID не настроен)
          </p>
        </div>
      );
    }
    if (authIsLoading) {
      return <button className="text-sm bg-slate-100 text-slate-500 p-2 rounded-lg transition-colors font-medium flex items-center justify-center focus-ring" disabled>
               <i className="fas fa-spinner fa-spin mr-2"></i> Загрузка Google Auth...
             </button>;
    }
    if (authError) { 
         return <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-200 max-w-xs text-right"><i className="fas fa-exclamation-circle mr-1"></i>Ошибка Google Auth: {authError.message}</p>
    }
    if (isSignedIn) {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-xs" title={user?.getEmail ? user.getEmail() : 'Google User'}>
            <i className="fab fa-google mr-1.5 text-sky-600"></i> {user?.getName ? user.getName() : 'Google User'}
          </span>
          <button
            onClick={signOut}
            className="bg-rose-500 hover:bg-rose-600 text-white py-1.5 px-3 rounded-md transition-colors font-medium flex items-center justify-center focus-ring text-xs"
          >
            <i className="fas fa-sign-out-alt mr-1.5"></i>Отключить
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={signIn} 
        className="text-sm bg-sky-600 hover:bg-sky-500 text-white py-1.5 px-3 rounded-md transition-colors font-medium flex items-center justify-center focus-ring"
      >
        <i className="fab fa-google mr-1.5"></i> Подключить Google Calendar
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-3">
        <h1 className="text-3xl font-bold text-slate-800">Календарь</h1>
        {renderGoogleAuthButton()}
      </div>

      {eventsLoading && isSignedIn && <p className="text-sm text-slate-500 my-2"><i className="fas fa-spinner fa-spin mr-2"></i>Загрузка событий Google Calendar...</p>}
      {eventsError && isSignedIn && <p className="text-sm text-rose-500 my-2"><i className="fas fa-exclamation-circle mr-1"></i>{eventsError}</p>}

      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => changeMonth(-1)} 
          className="p-2 rounded-md hover:bg-slate-100 transition-colors focus-ring text-slate-500 hover:text-slate-700"
          aria-label="Предыдущий месяц"
        >
          <i className="fas fa-chevron-left text-lg"></i>
        </button>
        <button 
          onClick={() => changeMonth(1)} 
          className="p-2 rounded-md hover:bg-slate-100 transition-colors focus-ring text-slate-500 hover:text-slate-700"
          aria-label="Следующий месяц"
        >
          <i className="fas fa-chevron-right text-lg"></i>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-x-8 gap-y-6 mb-8">
        <MonthView 
            year={year1} month={month1} 
            tasks={tasks} googleEvents={googleEvents} 
            onDayClick={handleDayClick} selectedDayDate={selectedDay?.date || null} 
            dayRefs={dayRefs} 
        />
        <MonthView 
            year={year2} month={month2} 
            tasks={tasks} googleEvents={googleEvents} 
            onDayClick={handleDayClick} selectedDayDate={selectedDay?.date || null} 
            dayRefs={dayRefs}
        />
      </div>
      
      {selectedDay && selectedDay.items.length > 0 && (
        <CalendarDayPopover 
            items={selectedDay.items} 
            date={selectedDay.date} 
            onClose={() => setSelectedDay(null)}
            positionRef={selectedDay.ref}
        />
      )}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Сегодня, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</h2>
        {combinedTodayItems.length > 0 ? (
          <ul className="space-y-2">
            {combinedTodayItems.map((item, index) => (
              <li key={`${item.id || item.summary}-${index}`} className={`p-3 rounded-md text-sm flex items-start
                ${item.isGoogleEvent ? 'bg-indigo-50 border-indigo-200' : (item.isCompleted ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-emerald-50 border-emerald-200')}
                border`}>
                 {item.isGoogleEvent ? (
                    <i className="far fa-calendar-check w-4 mr-3 mt-0.5 text-indigo-500"></i>
                  ) : (
                    <i className={`fas fa-circle w-4 mr-3 mt-1 text-xs ${item.isCompleted ? 'text-slate-400' : 'text-emerald-500'}`}></i>
                 )}
                <div className="flex-grow min-w-0">
                  <span className={`font-medium break-words ${item.isGoogleEvent ? 'text-indigo-700' : (item.isCompleted ? 'text-slate-500 line-through' : 'text-emerald-700')}`}>
                    {item.summary || item.text}
                  </span>
                  {item.eventTime && <span className="ml-2 text-xs text-slate-500">({item.eventTime})</span>}
                </div>
                {item.isGoogleEvent && item.htmlLink && (
                   <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-sky-600 hover:text-sky-700 text-xs self-center">
                     <i className="fas fa-external-link-alt"></i>
                   </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">На сегодня событий нет.</p>
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
