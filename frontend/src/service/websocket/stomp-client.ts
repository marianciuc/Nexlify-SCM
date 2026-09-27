import { Client, type IMessage } from '@stomp/stompjs';
import { toast } from 'sonner';
import { useNotificationStore } from './notification-store';
import useEnvironmentStore from '@/service/env/environment-store';

class StompWebSocketService {
    private client: Client | null = null;
    private reconnectTimeout: any = null;

    public connect() {
        if (typeof window === 'undefined') return;
        if (this.client && this.client.active) return;

        const { getBaseUrl } = useEnvironmentStore.getState();
        // Extract host/port from baseUrl or default to 8080/8086
        let wsUrl = 'ws://localhost:8080/ws/connect';
        try {
            const parsed = new URL(getBaseUrl());
            wsUrl = `ws://${parsed.host}/ws/connect`;
        } catch {
            wsUrl = 'ws://localhost:8080/ws/connect';
        }

        const token = localStorage.getItem('access_token');

        this.client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            debug: (str) => {
                if (import.meta.env.DEV) {
                    // console.debug('[STOMP]', str);
                }
            },
            reconnectDelay: 10000,
            heartbeatIncoming: 15000,
            heartbeatOutgoing: 15000,

            onConnect: () => {
                useNotificationStore.getState().setConnected(true);
                // toast.success('Connected to real-time SCM event bus (STOMP)');

                // Subscribe to broadcast topics
                this.client?.subscribe('/topic/notifications', (message: IMessage) => {
                    this.handleIncomingNotification(message);
                });

                this.client?.subscribe('/topic/orders', (message: IMessage) => {
                    this.handleIncomingNotification(message, 'ORDER');
                });

                this.client?.subscribe('/topic/alerts', (message: IMessage) => {
                    this.handleIncomingNotification(message, 'ALERT');
                });
            },

            onDisconnect: () => {
                useNotificationStore.getState().setConnected(false);
            },

            onStompError: (frame) => {
                console.warn('[STOMP Error]', frame.headers['message']);
                useNotificationStore.getState().setConnected(false);
            },

            onWebSocketClose: () => {
                useNotificationStore.getState().setConnected(false);
            },
        });

        try {
            this.client.activate();
        } catch (e) {
            console.warn('[STOMP] Activation deferred:', e);
        }
    }

    private handleIncomingNotification(message: IMessage, defaultType: any = 'ALERT') {
        try {
            const data = JSON.parse(message.body);
            const title = data.title || data.eventName || 'SCM Event';
            const body = data.message || data.description || JSON.stringify(data);
            const type = data.type || defaultType;

            useNotificationStore.getState().addNotification({
                title,
                message: body,
                type,
                referenceId: data.orderId || data.shipmentId || data.rfqId,
            });

            toast.info(title, {
                description: body,
            });
        } catch {
            useNotificationStore.getState().addNotification({
                title: 'System Notice',
                message: message.body,
                type: defaultType,
            });
        }
    }

    public disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        useNotificationStore.getState().setConnected(false);
    }
}

export const stompService = new StompWebSocketService();
export default stompService;
