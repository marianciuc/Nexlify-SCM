import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                // Don't retry on authentication errors
                if (error?.status === 401 || error?.status === 403) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        },
        mutations: {
            retry: (failureCount, error: any) => {
                // Don't retry mutations on authentication errors
                if (error?.status === 401 || error?.status === 403) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});
