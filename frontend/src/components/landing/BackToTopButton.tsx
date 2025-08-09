import {ArrowUp} from 'lucide-react';
import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {smoothScrollToTop} from '@/utils/smoothScroll';

/**
 * Back to top button that appears when user scrolls down
 */
export function BackToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div
            className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <Button
                onClick={smoothScrollToTop}
                size='lg'
                className='rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 group'
            >
                <ArrowUp className='w-6 h-6 group-hover:scale-110 transition-transform'/>
            </Button>
        </div>
    );
}
