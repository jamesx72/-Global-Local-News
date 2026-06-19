import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (title: string, message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    // Check user preferences from local storage
    try {
      const saved = window.localStorage.getItem('app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications && parsed.notifications.push === false) {
          return; // Do not show in-app notification if push (acting as in-app preference for now) is disabled
        }
      }
    } catch (e) {
      // ignore
    }

    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start gap-3 bg-white border border-brand-outline-variant p-4 rounded-xl shadow-lg relative overflow-hidden group"
            >
              <div className={`p-1 mt-0.5 rounded-full flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-500 bg-green-50' : 
                notification.type === 'error' ? 'text-red-500 bg-red-50' : 
                'text-brand-primary bg-brand-surface'
              }`}>
                {notification.type === 'success' && <CheckCircle size={18} />}
                {notification.type === 'error' && <AlertCircle size={18} />}
                {notification.type === 'info' && <Info size={18} />}
              </div>
              
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-sm font-bold text-brand-primary truncate">{notification.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
              </div>

              <button 
                onClick={() => removeNotification(notification.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
