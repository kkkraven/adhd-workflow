import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import log from './logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  React.useEffect(() => {
    log.error('Ошибка в компоненте:', {
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Что-то пошло не так
      </h2>
      <p className="mt-2 text-red-700 dark:text-red-300">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback = ErrorFallback 
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onReset={() => {
        // Сбрасываем состояние приложения при необходимости
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}; 