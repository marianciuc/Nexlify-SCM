import {ReactNode} from 'react';

import {useIntersectionObserver} from '@/hooks/useScrollEffects';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

/**
 * Animated section component for smooth scroll-triggered animations
 * Professional and subtle animations for B2B experience
 */
export function AnimatedSection({
                                    children,
                                    className = '',
                                    delay = 0,
                                    direction = 'up',
                                }: AnimatedSectionProps) {
    const [ref, isVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '-50px',
    });

    const getAnimationClasses = () => {
        const baseClasses = 'transition-all duration-700 ease-out';

        if (!isVisible) {
            switch (direction) {
                case 'up':
                    return `${baseClasses} opacity-0 transform translate-y-8`;
                case 'down':
                    return `${baseClasses} opacity-0 transform -translate-y-8`;
                case 'left':
                    return `${baseClasses} opacity-0 transform translate-x-8`;
                case 'right':
                    return `${baseClasses} opacity-0 transform -translate-x-8`;
                case 'fade':
                    return `${baseClasses} opacity-0`;
                default:
                    return `${baseClasses} opacity-0 transform translate-y-8`;
            }
        }

        return `${baseClasses} opacity-100 transform translate-x-0 translate-y-0`;
    };

    return (
        <div
            ref={ref}
            className={`${getAnimationClasses()} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
