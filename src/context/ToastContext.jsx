import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'success') => {
      const id = ++nextId;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const Icon = isError ? AlertCircle : CheckCircle;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border bg-white p-3 shadow-lg ${
                isError ? 'border-red-200 border-l-4' : 'border-navy-200 border-l-4 border-l-green-500'
              }`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${isError ? 'text-red-500' : 'text-green-600'}`} />
              <p className="flex-1 text-sm text-navy-700">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-navy-400 transition-colors hover:text-navy-700"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}