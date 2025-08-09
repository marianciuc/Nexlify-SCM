import {useScrollProgress} from '@/hooks/useScrollEffects';

/**
 * Scroll progress indicator that shows reading progress at the top of the page
 */
export function ScrollProgressIndicator() {
    const scrollProgress = useScrollProgress();

    return (
        <div className='fixed top-0 left-0 right-0 z-50'>
            <div
                className='h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out'
                style={{width: `${scrollProgress}%`}}
            />
        </div>
    );
}
