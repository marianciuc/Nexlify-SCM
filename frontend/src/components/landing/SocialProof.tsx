import {Star, ArrowRight} from 'lucide-react';

import {Card, CardContent} from '@/components/ui/card';

import {AnimatedMetrics} from './AnimatedMetrics';

/**
 * Social proof section with testimonials, metrics, and customer logos
 * Professional design focused on enterprise credibility
 */
export function SocialProof() {
    const customerTestimonials = [
        {
            quote:
                "LogisticCommerce transformed our supply chain operations. We've seen a 32% reduction in logistics costs and 40% improvement in delivery times within the first quarter.",
            author: 'Sarah Chen',
            position: 'VP Supply Chain Operations',
            company: 'TechCorp Industries',
            companySize: 'Fortune 500',
            industry: 'Manufacturing',
            rating: 5,
            results: ['32% cost reduction', '40% faster delivery', '99% inventory accuracy'],
        },
        {
            quote:
                'The AI-powered carrier selection has been a game-changer. Our logistics team now focuses on strategy instead of manual coordination, and our customers are happier than ever.',
            author: 'Marcus Rodriguez',
            position: 'Operations Director',
            company: 'Global Retail Co.',
            companySize: 'Enterprise',
            industry: 'Retail',
            rating: 5,
            results: ['50% time savings', '25% cost optimization', '95% customer satisfaction'],
        },
        {
            quote:
                'Finally, a single platform that handles our entire supply chain workflow. The integration with our existing ERP was seamless, and the ROI was immediate.',
            author: 'Anna Kowalski',
            position: 'Logistics Manager',
            company: 'Manufacturing Plus',
            companySize: 'Mid-market',
            industry: 'Industrial',
            rating: 5,
            results: ['Seamless ERP integration', 'Immediate ROI', 'Unified workflow'],
        },
    ];

    const industryStats = [
        {
            industry: 'Manufacturing',
            companies: '150+',
            avgSavings: '28%',
        },
        {
            industry: 'Retail & E-commerce',
            companies: '200+',
            avgSavings: '35%',
        },
        {
            industry: 'Healthcare',
            companies: '75+',
            avgSavings: '30%',
        },
        {
            industry: 'Automotive',
            companies: '100+',
            avgSavings: '25%',
        },
    ];

    const certifications = [
        'SOC 2 Type II',
        'ISO 27001',
        'GDPR Compliant',
        'PCI DSS',
        'Enterprise SSO',
        '99.9% SLA',
    ];

    return (
        <section className='py-20 bg-slate-50'>
            <div className='container mx-auto px-4'>
                {/* Section header */}
                <div className='text-center max-w-4xl mx-auto mb-16'>
                    <div
                        className='inline-flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700 mb-6'>
                        Industry Recognition
                    </div>
                    <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6'>
                        Trusted Across Industries
                        <br/>
                        <span className='text-slate-700'>by Global Enterprises</span>
                    </h2>
                    <p className='text-xl text-slate-600 leading-relaxed'>
                        Join hundreds of companies who have already transformed their supply chain operations
                        and achieved measurable business results.
                    </p>
                </div>

                {/* Key metrics */}
                <div className='mb-20'>
                    <AnimatedMetrics/>
                </div>

                {/* Customer testimonials */}
                <div className='mb-20'>
                    <h3 className='text-3xl font-bold text-slate-900 text-center mb-12'>
                        What Our Enterprise Clients Say
                    </h3>

                    <div className='grid lg:grid-cols-3 gap-8'>
                        {customerTestimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className='h-full border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200'
                            >
                                <CardContent className='p-8 h-full flex flex-col'>
                                    {/* Rating */}
                                    <div className='flex items-center mb-6'>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className='w-5 h-5 text-slate-600 fill-current'/>
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <blockquote className='text-slate-700 leading-relaxed mb-6 flex-grow italic'>
                                        "{testimonial.quote}"
                                    </blockquote>

                                    {/* Results */}
                                    <div className='mb-6'>
                                        <h5 className='font-semibold text-slate-900 mb-3'>Key Results:</h5>
                                        <div className='space-y-2'>
                                            {testimonial.results.map((result, resultIndex) => (
                                                <div key={resultIndex} className='flex items-center space-x-2'>
                                                    <div className='w-2 h-2 bg-slate-600 rounded-full'></div>
                                                    <span className='text-sm text-slate-700'>{result}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Author info */}
                                    <div className='border-t border-slate-200 pt-6'>
                                        <div className='font-semibold text-slate-900'>{testimonial.author}</div>
                                        <div className='text-slate-600 text-sm'>{testimonial.position}</div>
                                        <div className='text-slate-800 font-medium'>{testimonial.company}</div>
                                        <div className='flex items-center space-x-4 mt-2'>
                      <span className='px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded'>
                        {testimonial.companySize}
                      </span>
                                            <span
                                                className='px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200'>
                        {testimonial.industry}
                      </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Industry breakdown */}
                <div className='bg-white rounded-3xl p-12 shadow-lg mb-16 border border-slate-200'>
                    <h3 className='text-2xl font-bold text-slate-900 text-center mb-8'>
                        Trusted Across Industries
                    </h3>

                    <div className='grid md:grid-cols-4 gap-8'>
                        {industryStats.map((stat, index) => (
                            <div key={index} className='text-center'>
                                <div className='text-3xl font-bold text-slate-900 mb-2'>{stat.companies}</div>
                                <h4 className='font-semibold text-slate-900 mb-1'>{stat.industry}</h4>
                                <p className='text-slate-600 text-sm mb-2'>Companies served</p>
                                <div className='bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm font-medium'>
                                    {stat.avgSavings} avg savings
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications and compliance */}
                <div className='text-center'>
                    <h3 className='text-2xl font-bold text-slate-900 mb-8'>
                        Enterprise Security & Compliance
                    </h3>

                    <div className='flex flex-wrap justify-center gap-4 mb-8'>
                        {certifications.map((cert, index) => (
                            <span
                                key={index}
                                className='inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded border border-slate-200'
                            >
                {cert}
              </span>
                        ))}
                    </div>

                    <p className='text-slate-600 max-w-2xl mx-auto'>
                        LogisticCommerce meets the highest standards for enterprise security, compliance, and
                        data protection. Your business-critical supply chain data is always secure and
                        accessible.
                    </p>
                </div>

                {/* CTA section */}
                <div className='mt-16 bg-slate-900 rounded-3xl p-12 text-center text-white'>
                    <h3 className='text-3xl font-bold mb-4'>Join the Supply Chain Revolution</h3>
                    <p className='text-slate-300 text-lg mb-8 max-w-2xl mx-auto'>
                        See why enterprise leaders choose LogisticCommerce to optimize their supply chain
                        operations and drive measurable business results.
                    </p>

                    <div className='flex justify-center space-x-4'>
                        <button
                            className='bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center'>
                            View Case Studies
                            <ArrowRight className='w-5 h-5 ml-2'/>
                        </button>
                        {' '}
                        <button
                            className='border border-slate-600 text-white hover:bg-slate-800 px-8 py-4 rounded-lg font-semibold transition-colors'>
                            Start Registration
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
