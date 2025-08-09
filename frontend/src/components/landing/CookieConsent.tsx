import {CheckCircle, X, Settings} from 'lucide-react';
import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';

/**
 * GDPR-compliant cookie consent banner
 * Professional corporate design
 */
export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const hasConsent = localStorage.getItem('cookieConsent');
        if (!hasConsent) {
            // Show banner after a short delay
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('cookieConsent', 'all');
        setIsVisible(false);
    };

    const handleAcceptEssential = () => {
        localStorage.setItem('cookieConsent', 'essential');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className='fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto lg:max-w-lg lg:left-auto lg:right-4'>
            <Card className='border border-slate-200 shadow-lg bg-white'>
                <CardContent className='p-6'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center space-x-2'>
                            <div
                                className='inline-flex items-center px-3 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700'>
                                🍪 Cookie Policy
                            </div>
                        </div>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsVisible(false)}
                            className='h-8 w-8 p-0 hover:bg-slate-100'
                        >
                            <X className='h-4 w-4'/>
                        </Button>
                    </div>

                    {/* Content */}
                    <div className='space-y-4'>
                        <h3 className='font-semibold text-slate-900'>We value your privacy</h3>

                        <p className='text-sm text-slate-600 leading-relaxed'>
                            LogisticCommerce uses cookies to enhance your experience, provide analytics, and
                            improve our services. By continuing, you agree to our use of cookies.
                        </p>

                        {showDetails && (
                            <div
                                className='bg-slate-50 rounded-lg p-4 text-xs text-slate-600 space-y-2 border border-slate-200'>
                                <div>
                                    <strong>Essential:</strong> Required for basic site functionality
                                </div>
                                <div>
                                    <strong>Analytics:</strong> Help us understand how visitors interact with our site
                                </div>
                                <div>
                                    <strong>Marketing:</strong> Allow us to show relevant content and ads
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className='flex flex-col space-y-2'>
                            <div className='flex space-x-2'>
                                <Button
                                    onClick={handleAcceptAll}
                                    className='flex-1 bg-slate-900 hover:bg-slate-800'
                                    size='sm'
                                >
                                    <CheckCircle className='w-4 h-4 mr-1'/>
                                    Accept All
                                </Button>

                                <Button
                                    onClick={handleAcceptEssential}
                                    variant='outline'
                                    className='flex-1 border-slate-300 text-slate-700 hover:bg-slate-100'
                                    size='sm'
                                >
                                    Essential Only
                                </Button>
                            </div>

                            <div className='flex justify-between items-center'>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className='text-xs text-slate-600 hover:text-slate-700 flex items-center'
                                >
                                    <Settings className='w-3 h-3 mr-1'/>
                                    {showDetails ? 'Hide Details' : 'Cookie Details'}
                                </button>

                                <button
                                    onClick={handleReject}
                                    className='text-xs text-slate-500 hover:text-slate-700'
                                >
                                    Reject All
                                </button>
                            </div>
                        </div>

                        {/* Privacy policy link */}
                        <p className='text-xs text-slate-500'>
                            Learn more in our{' '}
                            <a href='/privacy' className='text-slate-700 hover:text-slate-900 underline'>
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
