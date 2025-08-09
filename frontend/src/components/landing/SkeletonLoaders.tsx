/**
 * Loading skeleton components for lazy-loaded sections
 */

export function SectionSkeleton() {
    return (
        <div className='py-20'>
            <div className='container mx-auto px-4'>
                {/* Title skeleton */}
                <div className='text-center mb-16'>
                    <div className='h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse'></div>
                    <div className='h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse'></div>
                </div>

                {/* Content skeleton */}
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className='bg-white rounded-xl p-6 shadow-lg'>
                            <div className='w-12 h-12 bg-gray-200 rounded-lg mb-4 animate-pulse'></div>
                            <div className='h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse'></div>
                            <div className='h-4 bg-gray-200 rounded w-full mb-2 animate-pulse'></div>
                            <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function PricingSkeleton() {
    return (
        <div className='py-20 bg-gray-50'>
            <div className='container mx-auto px-4'>
                <div className='text-center mb-16'>
                    <div className='h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-4 animate-pulse'></div>
                    <div className='h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse'></div>
                </div>

                <div className='grid md:grid-cols-3 gap-8'>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className='bg-white rounded-xl p-8 shadow-lg'>
                            <div className='h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse'></div>
                            <div className='h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse'></div>
                            <div className='space-y-3 mb-8'>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                                ))}
                            </div>
                            <div className='h-12 bg-gray-200 rounded w-full animate-pulse'></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
