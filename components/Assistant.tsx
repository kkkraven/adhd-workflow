import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ProposedTask, Task } from '../types';
import { getGoalBreakdown } from '../services/geminiService';
import { createUserTask } from '../src/services/backendApi';
import useLocalStorage from '../hooks/useLocalStorage';

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

    try {
      const { conversationalResponse, proposedTasks } = await getGoalBreakdown(trimmedInput, chatMessages);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: conversationalResponse,
        timestamp: Date.now(),
        proposedTasks: proposedTasks.length > 0 ? proposedTasks : undefined,
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