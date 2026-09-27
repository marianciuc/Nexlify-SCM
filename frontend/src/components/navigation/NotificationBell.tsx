import { Bell, Check, Trash2, Radio } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/service/websocket/notification-store';
import { stompService } from '@/service/websocket/stomp-client';

export function NotificationBell() {
    const { notifications, unreadCount, isConnected, markAllAsRead, markAsRead, clearAll } =
        useNotificationStore();

    useEffect(() => {
        stompService.connect();
        return () => {
            // Keep connection alive across navigation
        };
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ORDER':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'STOCK':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'LOGISTICS':
                return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
            case 'PAYMENT':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'ALERT':
            default:
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={`Powiadomienia (${unreadCount} nieprzeczytanych)`}
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
                className="w-80 sm:w-96 p-0 rounded-xl shadow-lg border-slate-200 dark:border-slate-800"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Powiadomienia SCM
                        </span>
                        <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 flex items-center gap-1 font-mono ${
                                isConnected
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                }`}
                            />
                            {isConnected ? 'LIVE WS' : 'POLLING'}
                        </Badge>
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                title="Oznacz wszystkie jako przeczytane"
                                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={clearAll}
                                title="Wyczyść powiadomienia"
                                className="text-xs text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            Brak nowych powiadomień
                        </div>
                    ) : (
                        notifications.slice(0, 15).map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex flex-col gap-1 ${
                                    !notif.read ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] px-1 py-0 border ${getTypeColor(notif.type)}`}
                                        >
                                            {notif.type}
                                        </Badge>
                                        <span className="truncate">{notif.title}</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                        {notif.timestamp}
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                                    {notif.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;
