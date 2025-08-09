import {useEffect, useState} from 'react';

/**
 * Hook to track scroll progress for the page
 * Returns scroll percentage (0-100)
 */
export function useScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPosition = window.scrollY;
            const progress = (scrollPosition / scrollHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, progress)));
        };

        window.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress(); // Initial calculation

        return () => window.removeEventListener('scroll', updateScrollProgress);
    }, []);

    return scrollProgress;
}

/**
 * Hook to detect if an element is visible in viewport
 */
export function useIntersectionObserver(options = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState<Element | null>(null);

    useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '-50px',
                ...options,
            }
        );

        observer.observe(ref);

        return () => {
            if (ref) observer.unobserve(ref);
        };
    }, [ref, options]);

    return [setRef, isVisible] as const;
}

/**
 * Hook for animated counter effect
 */
export function useCountUp(end: number, duration = 2000, start = 0) {
    const [count, setCount] = useState(start);
    const [isAnimating, setIsAnimating] = useState(false);

    const startAnimation = () => {
        setIsAnimating(true);
        const startTime = Date.now();
        const startValue = start;
        const endValue = end;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            const current = startValue + (endValue - startValue) * easeOutQuart;
            setCount(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    };

    return {count, startAnimation, isAnimating};
}
