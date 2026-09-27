// Performance optimization utilities

// Scroll and image performance utilities

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
