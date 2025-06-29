import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ProposedTask, Task } from '../types';
import { createUserTask, fetchUserTasks } from '../src/services/backendApi';
import useLocalStorage from '../hooks/useLocalStorage';
import { getGoalBreakdown } from '../services/geminiService';
import { listUpcomingEvents } from '../services/googleCalendarService';
import useGoogleAuth from '../hooks/useGoogleAuth';
import { differenceInCalendarDays, subDays } from 'date-fns';

const Assistant: React.FC = () => {
  const initialBotMessage: ChatMessage = {
    id: crypto.randomUUID(),
    sender: 'assistant',
    text: "Привет! Я ваш ИИ-помощник. Опишите свои цели, и я помогу разбить их на задачи и распланировать.",
    timestamp: Date.now(),
  };

  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('assistantChatMessages', [initialBotMessage]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const { accessToken } = useGoogleAuth();

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmedInput,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoadingAI(true);

    const lower = trimmedInput.toLowerCase();
    try {
      if (lower.includes('анализ') || lower.includes('отчёт') || lower.includes('статист')) {
        const allTasks: Task[] = await fetchUserTasks();
        const now = new Date();
        const weekAgo = subDays(now, 7);
        const completed = allTasks.filter(t => t.isCompleted && t.completedAt && t.completedAt >= weekAgo.getTime());
        const overdue = allTasks.filter(t => t.dueDate && !t.isCompleted && new Date(t.dueDate) < now);
        let answer = `Отчёт за неделю:\n`;
        answer += `Выполнено задач: ${completed.length}\n`;
        answer += `Просрочено задач: ${overdue.length}\n`;
        if (completed.length) answer += `\nВыполненные задачи:\n${completed.map(t => '• ' + t.text).join('\n')}`;
        if (overdue.length) answer += `\nПросроченные задачи:\n${overdue.map(t => '• ' + t.text + (t.dueDate ? ' (до ' + t.dueDate + ')' : '')).join('\n')}`;
        if (accessToken) {
          const events = await listUpcomingEvents(accessToken, 50);
          const pastWeekEvents = events.filter(e => {
            const start = e.start?.dateTime ? new Date(e.start.dateTime) : null;
            return start && start >= weekAgo && start <= now;
          });
          answer += `\n\nСобытий в календаре за неделю: ${pastWeekEvents.length}`;
          if (pastWeekEvents.length) answer += `\n${pastWeekEvents.map(e => '• ' + e.summary + (e.start?.dateTime ? ' (' + e.start.dateTime.replace('T', ' ').slice(0, 16) + ')' : '')).join('\n')}`;
        }
        setChatMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: answer,
          timestamp: Date.now(),
        }]);
        return setIsLoadingAI(false);
      }
      if (lower.includes('задач') || lower.includes('дела') || lower.includes('todo')) {
        const allTasks: Task[] = await fetchUserTasks();
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const tasksToday = allTasks.filter(t => t.dueDate === todayStr && !t.isCompleted);
        const overdue = allTasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.isCompleted);
        let answer = '';
        if (lower.includes('сегодня')) {
          answer = tasksToday.length
            ? `Ваши задачи на сегодня:\n${tasksToday.map(t => '• ' + t.text).join('\n')}`
            : 'На сегодня задач нет!';
        } else if (lower.includes('просроч')) {
          answer = overdue.length
            ? `Просроченные задачи:\n${overdue.map(t => '• ' + t.text + (t.dueDate ? ' (до ' + t.dueDate + ')' : '')).join('\n')}`
            : 'Просроченных задач нет!';
        } else {
          const active = allTasks.filter(t => !t.isCompleted);
          answer = active.length
            ? `Ваши текущие задачи:\n${active.map(t => '• ' + t.text + (t.dueDate ? ' (до ' + t.dueDate + ')' : '')).join('\n')}`
            : 'У вас нет активных задач!';
        }
        setChatMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: answer,
          timestamp: Date.now(),
        }]);
        return setIsLoadingAI(false);
      }
      if ((lower.includes('встреч') || lower.includes('событ') || lower.includes('calendar') || lower.includes('календар')) && accessToken) {
        const events = await listUpcomingEvents(accessToken, 10);
        if (lower.includes('ближайш')) {
          const next = events[0];
          const answer = next
            ? `Ближайшее событие: ${next.summary} (${next.start?.dateTime ? next.start.dateTime.replace('T', ' ').slice(0, 16) : 'дата неизвестна'})`
            : 'Ближайших событий не найдено.';
          setChatMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'assistant',
            text: answer,
            timestamp: Date.now(),
          }]);
          return setIsLoadingAI(false);
        } else {
          const answer = events.length
            ? `Ваши ближайшие события:\n${events.map(e => '• ' + e.summary + (e.start?.dateTime ? ' (' + e.start.dateTime.replace('T', ' ').slice(0, 16) + ')' : '')).join('\n')}`
            : 'Событий в календаре не найдено.';
          setChatMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'assistant',
            text: answer,
            timestamp: Date.now(),
          }]);
          return setIsLoadingAI(false);
        }
      }
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: 'Ошибка при анализе задач или событий.',
        timestamp: Date.now(),
      }]);
      return setIsLoadingAI(false);
    }

    try {
      const aiResponse = await getGoalBreakdown(trimmedInput);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: aiResponse,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Assistant send message error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: "К сожалению, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.",
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApproveTasks = useCallback(async (messageId: string, tasksToApprove: ProposedTask[]) => {
    try {
      const newTasks: Task[] = [];
      for (const pt of tasksToApprove) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          text: pt.text,
          isCompleted: false,
          createdAt: Date.now(),
          dueDate: pt.suggestedDueDate,
          dueTime: pt.suggestedDueTime,
        };
        const created = await createUserTask(newTask);
        newTasks.push(created);
      }
      setChatMessages((prev: ChatMessage[]) => prev.map((msg: ChatMessage) => 
        msg.id === messageId ? { ...msg, proposedTasks: undefined, tasksApproved: true } : msg
      ));
      const confirmationMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Отлично! ${newTasks.length} задач(и) добавлены в ваш список и календарь.`,
        timestamp: Date.now(),
      };
      setChatMessages((prev: ChatMessage[]) => [...prev, confirmationMessage]);
    } catch (e: any) {
      setChatMessages((prev: ChatMessage[]) => [...prev, {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Ошибка при добавлении задач: ${e.message}`,
        timestamp: Date.now(),
      }]);
    }
  }, [setChatMessages]);

  const handleRejectTasks = useCallback((messageId: string) => {
     setChatMessages((prev: ChatMessage[]) => prev.map((msg: ChatMessage) => 
      msg.id === messageId ? { ...msg, proposedTasks: undefined, tasksApproved: false } : msg
    ));
    const rejectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'assistant',
      text: "Понятно. Если хотите попробовать разбить цель по-другому, просто напишите мне.",
      timestamp: Date.now(),
    };
    setChatMessages((prev: ChatMessage[]) => [...prev, rejectionMessage]);
  }, [setChatMessages]);


  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 px-1 pt-1">
        <i className="fas fa-wand-magic-sparkles mr-3 text-sky-600"></i>ИИ-Помощник
      </h1>
      
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50 custom-scrollbar">
        {chatMessages.map((msg: ChatMessage) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-sky-500 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              {msg.sender === 'assistant' && msg.proposedTasks && !msg.tasksApproved && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-600 mb-1.5">Предложенные задачи:</h4>
                  <ul className="space-y-1 text-xs list-disc list-inside mb-2">
                    {msg.proposedTasks && msg.proposedTasks.map((pt: ProposedTask) => (
                      <li key={pt.id}>
                        {pt.text}
                        {(pt.suggestedDueDate || pt.suggestedDueTime) && (
                          <span className="text-slate-500 text-[11px] ml-1">
                            ({pt.suggestedDueDate}{pt.suggestedDueDate && pt.suggestedDueTime ? ', ' : ''}{pt.suggestedDueTime})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleApproveTasks(msg.id, msg.proposedTasks || [])}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-md transition-colors focus-ring"
                    >
                      <i className="fas fa-check mr-1"></i> Утвердить и добавить
                    </button>
                    <button
                      onClick={() => handleRejectTasks(msg.id)}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded-md transition-colors focus-ring"
                    >
                      <i className="fas fa-times mr-1"></i> Отклонить
                    </button>
                  </div>
                </div>
              )}
               {msg.sender === 'assistant' && msg.tasksApproved === true && (
                <p className="text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200"><i className="fas fa-check-circle mr-1"></i>Задачи добавлены в план.</p>
              )}
              {msg.sender === 'assistant' && msg.tasksApproved === false && (
                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200"><i className="fas fa-info-circle mr-1"></i>Предложения отклонены.</p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-1 border-t border-slate-200">
        <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-lg p-1.5">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isLoadingAI ? "Помощник думает..." : "Опишите вашу цель или задачу..."}
            className="flex-grow p-2.5 bg-white border border-slate-300 rounded-lg focus-ring placeholder-slate-400 text-slate-700 transition-colors"
            aria-label="Сообщение для ИИ-помощника"
            disabled={isLoadingAI}
          />
          <button
            type="submit"
            disabled={isLoadingAI || userInput.trim() === ''}
            className="bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-ring"
            aria-label="Отправить сообщение"
          >
            {isLoadingAI ? 
                <i className="fas fa-spinner fa-spin text-lg"></i> : 
                <i className="fas fa-paper-plane text-lg"></i>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default Assistant;