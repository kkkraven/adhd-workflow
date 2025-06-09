import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  let portalRoot = document.getElementById('modal-portal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'modal-portal-root');
    document.body.appendChild(portalRoot);
  }
  
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInScaleUp"
        onClick={(e) => e.stopPropagation()} 
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-700">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full focus-ring -mr-1 -mt-1"
            aria-label="Закрыть модальное окно"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modalFadeInScaleUp {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalFadeInScaleUp {
          animation: modalFadeInScaleUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>,
    portalRoot
  );
};

export default Modal;