import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from './notification-store';

describe('notification-store', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isConnected: false,
    });
  });

  it('should initialize with default empty state', () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
    expect(state.isConnected).toBe(false);
  });

  it('should add notifications and increment unread count', () => {
    useNotificationStore.getState().addNotification({
      type: 'ORDER',
      title: 'Order Submitted',
      message: 'Order ORD-2026-001 has been placed',
    });

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0]?.title).toBe('Order Submitted');
    expect(state.notifications[0]?.read).toBe(false);
  });

  it('should mark all notifications as read', () => {
    const { addNotification, markAllAsRead } = useNotificationStore.getState();
    addNotification({ type: 'STOCK', title: 'Low Stock', message: 'Pallets low' });
    addNotification({ type: 'PAYMENT', title: 'Payment Confirmed', message: 'Invoice paid' });

    expect(useNotificationStore.getState().unreadCount).toBe(2);

    markAllAsRead();
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it('should update connection status', () => {
    const { setConnected } = useNotificationStore.getState();
    setConnected(true);
    expect(useNotificationStore.getState().isConnected).toBe(true);
    setConnected(false);
    expect(useNotificationStore.getState().isConnected).toBe(false);
  });
});
