import { create } from 'zustand';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'ORDER' | 'STOCK' | 'LOGISTICS' | 'PAYMENT' | 'RFQ' | 'ALERT';
    timestamp: string;
    read: boolean;
    referenceId?: string;
}

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    isConnected: boolean;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    setConnected: (connected: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,

    addNotification: (notification) =>
        set((state) => {
            const newNotif: AppNotification = {
                ...notification,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                timestamp: new Date().toLocaleTimeString(),
                read: false,
            };
            const notifications = [newNotif, ...state.notifications].slice(0, 100);
            return {
                notifications,
                unreadCount: notifications.filter((item) => !item.read).length,
            };
        }),

    markAsRead: (id) =>
        set((state) => {
            const notification = state.notifications.find((item) => item.id === id);
            if (!notification || notification.read) return state;

            return {
                notifications: state.notifications.map((item) =>
                    item.id === id ? { ...item, read: true } : item
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),

    clearAll: () =>
        set({
            notifications: [],
            unreadCount: 0,
        }),

    setConnected: (connected) => set({ isConnected: connected }),
}));

export default useNotificationStore;
