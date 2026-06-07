import React from 'react';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const icons = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error: <AlertCircle size={18} className="text-red-400" />,
  warning: <AlertCircle size={18} className="text-yellow-400" />,
  info: <Info size={18} className="text-blue-400" />,
};

const bgColors = {
  success: 'bg-green-900/30 border-green-500/30',
  error: 'bg-red-900/30 border-red-500/30',
  warning: 'bg-yellow-900/30 border-yellow-500/30',
  info: 'bg-blue-900/30 border-blue-500/30',
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => removeToast(toast.id), 200);
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${bgColors[toast.type]} ${
        exiting ? 'animate-out fade-out slide-out-to-right' : 'animate-in fade-in slide-in-from-right'
      }`}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{toast.message}</p>
        {toast.action && (() => {
          const action = toast.action!;
          return (
            <button
              onClick={() => {
                action.onClick();
                removeToast(toast.id);
              }}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              {action.label}
            </button>
          );
        })()}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-80">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

export const toast = {
  success: (message: string, options?: { duration?: number; action?: Toast['action'] }) =>
    useToastStore.getState().addToast({ type: 'success', message, ...options }),
  error: (message: string, options?: { duration?: number; action?: Toast['action'] }) =>
    useToastStore.getState().addToast({ type: 'error', message, ...options }),
  warning: (message: string, options?: { duration?: number; action?: Toast['action'] }) =>
    useToastStore.getState().addToast({ type: 'warning', message, ...options }),
  info: (message: string, options?: { duration?: number; action?: Toast['action'] }) =>
    useToastStore.getState().addToast({ type: 'info', message, ...options }),
};