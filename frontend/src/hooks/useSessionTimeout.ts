import {useEffect, useRef, useCallback} from 'react';

import {useAuth} from '@/hooks/useAuthContext';

interface SessionTimeoutProps {
    timeoutMinutes?: number;
    warningMinutes?: number;
    onTimeout?: () => void;
    onWarning?: () => void;
}

export function useSessionTimeout({
                                      timeoutMinutes = 30,
                                      warningMinutes = 5,
                                      onTimeout,
                                      onWarning,
                                  }: SessionTimeoutProps = {}) {
    const {isAuthenticated, logout} = useAuth();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
        }

        if (!isAuthenticated) return;

        // Set warning timer
        const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
        warningRef.current = setTimeout(() => {
            onWarning?.();
        }, warningTime);

        // Set timeout timer
        const timeoutTime = timeoutMinutes * 60 * 1000;
        timeoutRef.current = setTimeout(async () => {
            onTimeout?.();
            await logout();
        }, timeoutTime);
    }, [isAuthenticated, timeoutMinutes, warningMinutes, onTimeout, onWarning, logout]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Activity events to track
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const resetTimerHandler = () => {
            resetTimer();
        };

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimerHandler, true);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimerHandler, true);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningRef.current) {
                clearTimeout(warningRef.current);
            }
        };
    }, [isAuthenticated, timeoutMinutes, warningMinutes, onTimeout, onWarning, logout, resetTimer]);

    return {
        resetTimer,
        lastActivity: lastActivityRef.current,
    };
}
