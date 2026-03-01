import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Trash2, UtensilsCrossed, ChefHat, HandHelping, Info } from 'lucide-react';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  order: { icon: UtensilsCrossed, color: 'text-info bg-info/10' },
  kitchen: { icon: ChefHat, color: 'text-warning bg-warning/10' },
  waiter: { icon: HandHelping, color: 'text-primary bg-primary/10' },
  info: { icon: Info, color: 'text-muted-foreground bg-muted' },
  success: { icon: CheckCheck, color: 'text-success bg-success/10' },
  warning: { icon: Bell, color: 'text-warning bg-warning/10' },
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
  const { notifications, markRead, markAllRead, clearAll } = useNotifications();

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 bg-card rounded-xl border border-border shadow-elevated z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-foreground text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">Mark all read</button>
                <button onClick={clearAll} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">No notifications</div>
              ) : (
                notifications.map(n => {
                  const config = typeConfig[n.type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(n.timestamp)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
