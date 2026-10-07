import { Bell, Check, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/useLocale';
import { useNotificationStore } from '@/service/websocket/notification-store';
import { stompService } from '@/service/websocket/stomp-client';

export function NotificationBell() {
    const { t } = useLocale();
    const { notifications, unreadCount, isConnected, markAllAsRead, markAsRead, clearAll } =
        useNotificationStore();

    useEffect(() => {
        stompService.connect();
        return () => {
            // Keep connection alive across navigation
        };
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={`${t('header.notifications')}: ${t('header.unreadCount', { count: unreadCount })}`}
                    aria-haspopup="menu"
                >
                    <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[min(24rem,calc(100vw-1rem))] p-0 rounded-lg shadow-lg"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t('header.notifications')}
                        </span>
                        <span
                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                            role="status"
                        >
                            <span
                                className={`size-1.5 rounded-full ${
                                    isConnected ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                                }`}
                            />
                            {isConnected ? t('header.connected') : t('header.disconnected')}
                        </span>
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    aria-label={t('header.markAllRead')}
                                    title={t('header.markAllRead')}
                                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={clearAll}
                                aria-label={t('header.clearAll')}
                                title={t('header.clearAll')}
                                className="text-xs text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground" role="status">
                            {t('header.noNotifications')}
                        </div>
                    ) : (
                        notifications.slice(0, 15).map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                onSelect={() => markAsRead(notif.id)}
                                className={`block whitespace-normal p-3 text-xs ${
                                    !notif.read ? 'bg-muted/50' : ''
                                }`}
                            >
                                <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="min-w-0 font-semibold text-foreground flex items-center gap-1.5">
                                            {!notif.read && (
                                                <span
                                                    className="size-1.5 shrink-0 rounded-full bg-primary"
                                                    aria-label="Unread"
                                                />
                                            )}
                                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                                                {notif.type}
                                            </Badge>
                                            <span className="truncate">{notif.title}</span>
                                        </span>
                                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                            {notif.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;