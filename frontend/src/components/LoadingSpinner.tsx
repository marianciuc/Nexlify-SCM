import {Loader2} from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({size = 'md', className = ''}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`}/>;
}

interface LoadingPageProps {
    message?: string;
}

export function LoadingPage({message = 'Loading...'}: LoadingPageProps) {
    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <LoadingSpinner size='lg' className='mx-auto mb-4'/>
                <p className='text-gray-600'>{message}</p>
            </div>
        </div>
    );
}
