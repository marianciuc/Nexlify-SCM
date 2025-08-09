import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {RouterProvider, createRouter} from '@tanstack/react-router';
import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';

import {ErrorBoundary} from './components/ErrorBoundary';
import {Toaster} from './components/ui/sonner';
import {initI18n} from './lib/i18n';
import {queryClient} from './lib/query-client';
import reportWebVitals from './reportWebVitals.ts';
// Import the generated route tree
import {routeTree} from './routeTree.gen';

import './styles.css';

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
    // Initialize i18n before rendering the app
    initI18n()
        .then(() => {
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <StrictMode>
                    <ErrorBoundary>
                        <QueryClientProvider client={queryClient}>
                            <RouterProvider router={router}/>
                            <ReactQueryDevtools initialIsOpen={false}/>
                            <Toaster/>
                        </QueryClientProvider>
                    </ErrorBoundary>
                </StrictMode>
            );
        })
        .catch(() => {
            // Render app even if i18n fails to initialize
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <StrictMode>
                    <ErrorBoundary>
                        <QueryClientProvider client={queryClient}>
                            <RouterProvider router={router}/>
                            <Toaster/>
                        </QueryClientProvider>
                    </ErrorBoundary>
                </StrictMode>
            );
        });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
