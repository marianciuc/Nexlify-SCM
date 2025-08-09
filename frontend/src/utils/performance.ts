/**
 * Performance optimization utilities for the landing page
 */

import {lazy} from 'react';

// Lazy load components that are below the fold
export const LazyPlatformModules = lazy(() =>
    import('@/components/landing/PlatformModules').then(module => ({
        default: module.PlatformModules,
    }))
);

export const LazyTechnology = lazy(() =>
    import('@/components/landing/Technology').then(module => ({default: module.Technology}))
);

export const LazyPricing = lazy(() =>
    import('@/components/landing/Pricing').then(module => ({default: module.Pricing}))
);

export const LazySocialProof = lazy(() =>
    import('@/components/landing/SocialProof').then(module => ({default: module.SocialProof}))
);

export const LazyCallToAction = lazy(() =>
    import('@/components/landing/CallToAction').then(module => ({default: module.CallToAction}))
);

export const LazyLandingFooter = lazy(() =>
    import('@/components/landing/LandingFooter').then(module => ({default: module.LandingFooter}))
);

// Preload critical images
export const preloadImages = () => {
    const imageUrls = [
        // Add any hero images or critical graphics here
        '/logo192.png',
        '/logo512.png',
    ];

    imageUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
    });
};

// Optimize scroll performance
export const optimizeScrolling = () => {
    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                // Scroll event handlers will be called here
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => window.removeEventListener('scroll', handleScroll);
};
