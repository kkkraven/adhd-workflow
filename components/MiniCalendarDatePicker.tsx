import React, { useState, useEffect, useRef } from 'react';

interface MiniCalendarDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  onClose: () => void;
  minDate?: string; // YYYY-MM-DD
}

const DAYS_OF_WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MiniCalendarDatePicker: React.FC<MiniCalendarDatePickerProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  minDate,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = selectedDate ? new Date(selectedDate + "T00:00:00") : today;
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const pickerRef = useRef<HTMLDivElement>(null);

  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined;


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const changeMonth = (offset: number) => {
    setCurrentMonthDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handleDayClick = (day: Date) => {
    if (minDateObj && day < minDateObj) {
      return; // Don't select if before minDate
    }
    onDateSelect(day.toISOString().split('T')[0]);
    onClose();
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Adjust to Monday start of week
  let startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // 0 (Mon) - 6 (Sun)


  const daysInMonthGrid = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysInMonthGrid.push(null);
  }
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysInMonthGrid.push(new Date(year, month, day));
  }

  return (
    <div 
        ref={pickerRef} 
        className="absolute z-30 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-lg p-3 text-sm"
        style={{ top: '100%', left: 0 }} // Position it below the button
    >
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-1 rounded-md hover:bg-slate-100 focus-ring text-slate-500 hover:text-slate-700"
          aria-label="Предыдущий месяц"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="font-semibold text-slate-700">
          {MONTH_NAMES_RU[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-1 rounded-md hover:bg-slate-100 focus-ring text-slate-500 hover:text-slate-700"
          aria-label="Следующий месяц"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-1">
        {DAYS_OF_WEEK_LABELS.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonthGrid.map((dayObject, index) => {
          if (!dayObject) {
            return <div key={`empty-${index}`} className="h-7 rounded-md"></div>;
          }
          const day = dayObject as Date;
          const dayStr = day.toISOString().split('T')[0];
          const isSelected = dayStr === selectedDate;
          const isToday = day.getTime() === today.getTime();
          const isDisabled = minDateObj && day < minDateObj;

          return (
            <button
              type="button"
              key={dayStr}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={`h-7 w-full p-1 rounded-md flex items-center justify-center text-xs transition-colors
                ${isDisabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}
                ${isToday && !isSelected && !isDisabled ? 'font-semibold text-sky-600 bg-sky-50' : ''}
                ${isSelected && !isDisabled ? 'bg-sky-600 text-white font-bold' : ''}
              `}
              aria-pressed={isSelected}
              aria-label={`Выбрать дату ${day.getDate()} ${MONTH_NAMES_RU[month]}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendarDatePicker;
