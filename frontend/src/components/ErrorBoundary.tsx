import {Component} from 'react';
import type {ErrorInfo, ReactNode} from 'react';

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to external service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Log to error reporting service
        } else {
            // eslint-disable-next-line no-console
            console.error('Uncaught error:', error, errorInfo);
        }
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className='min-h-screen flex items-center justify-center p-4'>
                    <div className='max-w-md w-full'>
                        <Alert variant='destructive'>
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </AlertDescription>
                        </Alert>
                        <Button onClick={() => window.location.reload()} className='mt-4 w-full'>
                            Reload page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
