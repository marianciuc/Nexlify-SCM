/**
 * Smooth scrolling utilities for the landing page
 */

export const smoothScrollTo = (elementId: string, offset: number = 80) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
        });
    }
};

export const smoothScrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

// Add IDs to sections for navigation
export const SECTION_IDS = {
    hero: 'hero-section',
    problem: 'problem-section',
    solution: 'solution-section',
    modules: 'modules-section',
    roles: 'roles-section',
    technology: 'technology-section',
    pricing: 'pricing-section',
    testimonials: 'testimonials-section',
    contact: 'contact-section',
} as const;
