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
    notifications: [
        {
            id: 'init-1',
            title: 'Saga Order Reserved',
            message: 'Order ORD-2026-0891 passed multi-warehouse inventory reservation.',
            type: 'ORDER',
            timestamp: new Date().toLocaleTimeString(),
            read: false,
            referenceId: 'ORD-2026-0891',
        },
        {
            id: 'init-2',
            title: 'GraphHopper Route Generated',
            message: 'Optimal heavy-truck corridor calculated for Warszawa ➔ Wrocław (342 km).',
            type: 'LOGISTICS',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
            read: false,
        },
    ],
    unreadCount: 2,
    isConnected: false,

    addNotification: (notification) =>
        set((state) => {
            const newNotif: AppNotification = {
                ...notification,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                timestamp: new Date().toLocaleTimeString(),
                read: false,
            };
            return {
                notifications: [newNotif, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            };
        }),

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),

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
