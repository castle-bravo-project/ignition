/**
 * Notification System - UX Innovation Component
 * 
 * Advanced notification system with toast notifications, real-time updates,
 * activity feeds, and progress indicators using React Hot Toast and Framer Motion.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster, Toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Bell, 
  Activity,
  Clock,
  User,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'activity';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  progress?: number;
  metadata?: {
    user?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface NotificationSystemProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  onMarkAllRead?: () => void;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  onMarkAllRead,
  maxVisible = 5,
  position = 'top-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      case 'activity':
        return <Activity size={20} className="text-brand-primary" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  const showToast = useCallback((notification: NotificationData) => {
    const toastOptions = {
      duration: notification.persistent ? Infinity : 4000,
      position: position as any,
      style: {
        background: '#1f2937',
        color: '#ffffff',
        border: '1px solid #374151',
        borderRadius: '8px',
      },
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast(notification.message, { ...toastOptions, icon: '⚠️' });
        break;
      case 'info':
        toast(notification.message, { ...toastOptions, icon: 'ℹ️' });
        break;
      default:
        toast(notification.message, toastOptions);
    }
  }, [position]);

  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <>
      {/* Toast Container */}
      <Toaster
        position={position as any}
        toastOptions={{
          className: 'bg-gray-900 text-white border border-gray-700',
          style: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid #374151',
          },
        }}
      />

      {/* Notification Bell */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="relative p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-brand-primary transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={20} className="text-gray-300" />
          
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed top-16 right-4 w-96 max-h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {visibleNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${getPriorityColor(notification.metadata?.priority)}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onDismiss(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {notification.metadata && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              {notification.metadata.user && (
                                <div className="flex items-center gap-1">
                                  <User size={12} />
                                  <span>{notification.metadata.user}</span>
                                </div>
                              )}
                              {notification.metadata.category && (
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-brand-primary rounded-full"></span>
                                  <span>{notification.metadata.category}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {notification.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{notification.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <motion.div
                                  className="bg-brand-primary h-1.5 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${notification.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {notification.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action!.onClick();
                              }}
                              className="mt-2 text-xs text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > maxVisible && (
              <div className="p-3 border-t border-gray-700 text-center">
                <span className="text-xs text-gray-500">
                  {notifications.length - maxVisible} more notifications
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Utility functions for creating notifications
export const createNotification = (
  type: NotificationData['type'],
  title: string,
  message: string,
  options?: Partial<NotificationData>
): NotificationData => ({
  id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  message,
  timestamp: new Date(),
  ...options
});

export const showSuccessNotification = (title: string, message: string) => {
  toast.success(message, {
    duration: 4000,
    style: {
      background: '#1f2937',
      color: '#ffffff',
      border: '1px solid #10b981',
    },
  });
};

export const showErrorNotification = (title: string, message: string) => {
  toast.error(message, {
    duration: 6000,
    style: {
      background: '#1f2937',
      color: '#ffffff',
      border: '1px solid #ef4444',
    },
  });
};

export const showInfoNotification = (title: string, message: string) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 4000,
    style: {
      background: '#1f2937',
      color: '#ffffff',
      border: '1px solid #3b82f6',
    },
  });
};

export default NotificationSystem;
