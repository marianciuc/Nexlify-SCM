import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {RouterProvider, createRouter} from '@tanstack/react-router';
import {ThemeProvider} from 'next-themes';
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
    const renderApp = () => {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <QueryClientProvider client={queryClient}>
                            <RouterProvider router={router}/>
                            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false}/>}
                            <Toaster/>
                        </QueryClientProvider>
                    </ThemeProvider>
                </ErrorBoundary>
            </StrictMode>
        );
    };

    // Initialize i18n before rendering the app, falling back cleanly
    initI18n()
        .then(renderApp)
        .catch(renderApp);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
