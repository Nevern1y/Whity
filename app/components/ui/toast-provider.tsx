import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, ...toast }]);
    // Убираем уведомление через 3 секунды
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Контейнер уведомлений, позиционирован в правом нижнем углу */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            padding: '10px 20px',
            borderRadius: 4,
            backgroundColor: toast.variant === 'destructive' ? '#f56565' : '#48bb78',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            <strong>{toast.title}</strong>
            {toast.description && <div style={{ marginTop: 4, fontSize: '0.9em' }}>{toast.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return { toast: context.addToast };
}; 