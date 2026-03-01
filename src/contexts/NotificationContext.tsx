import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'order' | 'kitchen' | 'waiter' | 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  tableNumber?: number;
  orderId?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order',
      message: 'Order ORD-006 received from James K. (Delivery)',
      timestamp: new Date(Date.now() - 120000),
      read: false,
      orderId: 'ORD-006',
    },
    {
      id: '2',
      type: 'kitchen',
      title: 'Order Ready',
      message: 'Order ORD-003 for Table 3 is ready for pickup',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      tableNumber: 3,
      orderId: 'ORD-003',
    },
    {
      id: '3',
      type: 'waiter',
      title: 'Waiter Call',
      message: 'Table 5 is requesting assistance',
      timestamp: new Date(Date.now() - 60000),
      read: false,
      tableNumber: 5,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newN: AppNotification = {
      ...n,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};
