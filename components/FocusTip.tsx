import React, { useState, useCallback, useEffect } from 'react';

const FocusTip: React.FC = () => {
  const [tip, setTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchTip = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setTip('ИИ-советы временно недоступны. Ожидайте обновления.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка при загрузке совета.';
      if (tip) { 
        setError(`Не удалось обновить совет: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
      console.error("FocusTip fetch error (raw):", err);
    } finally {
      setIsLoading(false);
    }
  }, [tip]); 

  useEffect(() => {
    fetchTip();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  return (
    // This component is designed to be embeddable. If it were a main view, it would have an H1 title.
    // For now, it's a self-contained card-like element.
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
        <i className="fas fa-lightbulb mr-3 text-yellow-500"></i>
        Совет по Фокусировке
      </h2>
      
      {isLoading && !tip && (
        <div className="flex items-center justify-center text-slate-500 py-6" aria-live="polite">
          <i className="fas fa-spinner fa-spin text-2xl mr-3"></i>
          <span>Получение совета...</span>
        </div>
      )}

      {error && !isLoading && (
         <p className={`text-rose-600 ${tip ? 'bg-rose-50 p-2 rounded-md text-sm mt-2 border border-rose-200' : 'bg-rose-100 p-3 rounded-lg text-base border border-rose-300'} `} role="alert">
            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
         </p>
      )}
      
      {tip && (
        <blockquote className="border-l-4 border-sky-500 pl-4 py-2 my-3 bg-slate-50 rounded-r-lg">
          <p className="text-slate-600 italic text-base">{tip}</p>
        </blockquote>
      )}

      {!isLoading && !tip && !error && (
         <p className="text-slate-500 text-center py-6">Не удалось загрузить совет. Попробуйте еще раз.</p>
      )}

      <button
        onClick={fetchTip}
        disabled={isLoading}
        className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center focus-ring"
      >
        <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
        {isLoading ? 'Загрузка...' : 'Новый Совет'}
      </button>
    </div>
  );
};

export default FocusTip;