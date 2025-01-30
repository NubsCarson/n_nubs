import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, description: string) => void;
  clearNotifications: () => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  clearNotifications: () => {},
  markAllAsRead: () => {},
  markAsRead: () => {},
  removeNotification: () => {}
});

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to n_nubs Terminal',
      description: 'Get started by exploring the features',
      time: '1m ago',
      isRead: false
    }
  ]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((title: string, description: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      description,
      time: 'just now',
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show themed toast notification with close button
    toast(title, {
      description: description,
      duration: 5000,
      dismissible: true,
      onDismiss: () => removeNotification(newNotification.id),
      className: cn(
        "bg-card border border-border/50 text-foreground",
        "data-[type=success]:bg-emerald-500/10 data-[type=success]:border-emerald-500/30",
        "data-[type=error]:bg-red-500/10 data-[type=error]:border-red-500/30",
        "data-[type=info]:bg-blue-500/10 data-[type=info]:border-blue-500/30",
        "data-[type=warning]:bg-amber-500/10 data-[type=warning]:border-amber-500/30"
      )
    });

    // Update time stamps periodically
    setInterval(() => {
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          time: getTimeAgo(new Date(parseInt(notification.id)))
        }))
      );
    }, 60000); // Update every minute
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        clearNotifications, 
        markAllAsRead,
        markAsRead,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext); 