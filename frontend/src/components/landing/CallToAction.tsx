import {
    ArrowRight,
    CheckCircle,
    Star,
    Clock,
    Play,
    FileText,
    TrendingUp,
    MessageCircle,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';

import {ContactForm} from './ContactForm';

/**
 * Call to action section with multiple CTAs and enterprise focus
 * Professional design emphasizing business value
 */
export function CallToAction() {
    const ctaPrimary = [
        {
            title: 'Start Registration',
            description: 'Begin your enterprise registration with our solution architects',
            buttonText: 'Register Now',
            buttonVariant: 'default' as const,
            features: ['1-on-1 consultation', 'Custom use cases', 'ROI analysis'],
            popular: true,
        },
        {
            title: 'Learn More',
            description: "Explore our platform capabilities and see if we're the right fit",
            buttonText: 'Explore Platform',
            buttonVariant: 'outline' as const,
            features: ['Platform overview', 'Feature comparison', 'Case studies'],
            popular: false,
        },
    ];
    const ctaSecondary = [
        {
            title: 'View Platform Tour',
            description: 'Interactive product overview',
            icon: Play,
        },
        {
            title: 'Download Whitepaper',
            description: 'Supply chain optimization guide',
            icon: FileText,
        },
        {
            title: 'Case Studies',
            description: 'Success stories from clients',
            icon: TrendingUp,
        },
        {
            title: 'Contact Sales',
            description: 'Speak with enterprise specialists',
            icon: MessageCircle,
        },
    ];

    const businessBenefits = [
        'Join 500+ companies already optimizing their supply chain',
        'Proven ROI within 90 days of implementation',
        'Dedicated enterprise support and onboarding',
        'Custom integration with your existing systems',
    ];

    const testimonialQuotes = [
        {
            quote: 'Nexlify-SCM reduced our logistics costs by 32% in the first quarter.',
            author: 'Sarah Chen',
            position: 'VP Supply Chain, TechCorp Industries',
            rating: 5,
        },
        {
            quote: 'The AI-powered carrier selection has transformed our delivery operations.',
            author: 'Marcus Rodriguez',
            position: 'Operations Director, Global Retail Co.',
            rating: 5,
        },
        {
            quote: 'Finally, a single platform that handles our entire supply chain workflow.',
            author: 'Anna Kowalski',
            position: 'Logistics Manager, Manufacturing Plus',
            rating: 5,
        },
    ];

    return (
        <section className='py-20 bg-slate-900'>
            <div className='container mx-auto px-4'>
                {/* Main CTA header */}
                <div className='text-center max-w-4xl mx-auto mb-16'>
                    <div
                        className='inline-flex items-center px-4 py-2 bg-slate-800 rounded-md text-sm font-medium text-slate-300 mb-6'>
                        <Clock className='w-4 h-4 mr-2'/>
                        Enterprise Solution Available
                    </div>

                    <h2 className='text-4xl lg:text-6xl font-bold text-white mb-6'>
                        Ready to Transform
                        <br/>
                        <span className='text-slate-300'>Your Supply Chain?</span>
                    </h2>

                    <p className='text-xl text-slate-300 leading-relaxed mb-8'>
                        Join the supply chain revolution. Get started today and see measurable results in your
                        first month of operation.
                    </p>

                    {/* Business benefits */}
                    <div className='grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12'>
                        {businessBenefits.map((benefit, index) => (
                            <div key={index} className='flex items-center space-x-3 text-slate-300'>
                                <CheckCircle className='w-5 h-5 text-slate-400 flex-shrink-0'/>
                                <span className='text-sm'>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Primary CTAs */}
                <div className='grid lg:grid-cols-2 gap-8 mb-16'>
                    {ctaPrimary.map((cta, index) => (
                        <Card
                            key={index}
                            className={`bg-white border-0 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                                cta.popular ? 'ring-2 ring-slate-300 shadow-xl' : 'shadow-md'
                            }`}
                        >
                            <CardContent className='p-8'>
                                {cta.popular && (
                                    <div
                                        className='inline-flex items-center px-3 py-1 bg-slate-900 text-white text-sm rounded-md mb-4'>
                                        Most Popular
                                    </div>
                                )}

                                <h3 className='text-2xl font-bold text-slate-900 mb-3'>{cta.title}</h3>

                                <p className='text-slate-600 mb-6'>{cta.description}</p>

                                <ul className='space-y-3 mb-8'>
                                    {cta.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className='flex items-center space-x-3'>
                                            <CheckCircle className='w-4 h-4 text-slate-600 flex-shrink-0'/>
                                            <span className='text-slate-700 text-sm'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full text-lg py-6 ${
                                        cta.buttonVariant === 'default'
                                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                            : 'border-slate-300 text-slate-900 hover:bg-slate-100'
                                    }`}
                                    variant={cta.buttonVariant}
                                    size='lg'
                                >
                                    {cta.buttonText}
                                    <ArrowRight className='w-5 h-5 ml-2'/>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {/* Secondary CTAs */}
                <div className='bg-slate-800 rounded-3xl p-8 mb-16'>
                    <h3 className='text-2xl font-bold text-white text-center mb-8'>Explore More Resources</h3>{' '}
                    <div className='grid md:grid-cols-4 gap-6'>
                        {ctaSecondary.map((cta, index) => (
                            <button
                                key={index}
                                className='group bg-slate-700 hover:bg-slate-600 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-md'
                            >
                                <div className='mb-3 flex justify-center'>
                                    <cta.icon className='w-8 h-8 text-slate-300'/>
                                </div>
                                <h4 className='text-white font-semibold mb-2'>{cta.title}</h4>
                                <p className='text-slate-300 text-sm'>{cta.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Social proof testimonials */}
                <div className='mb-16'>
                    <h3 className='text-2xl font-bold text-white text-center mb-8'>
                        Trusted by Industry Leaders
                    </h3>

                    <div className='grid lg:grid-cols-3 gap-8'>
                        {testimonialQuotes.map((testimonial, index) => (
                            <Card key={index} className='bg-slate-800 border border-slate-700'>
                                <CardContent className='p-6'>
                                    <div className='flex items-center mb-4'>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className='w-4 h-4 text-slate-400 fill-current'/>
                                        ))}
                                    </div>

                                    <blockquote className='text-slate-300 mb-4 italic'>
                                        "{testimonial.quote}"
                                    </blockquote>

                                    <div className='text-white'>
                                        <div className='font-semibold'>{testimonial.author}</div>
                                        <div className='text-slate-400 text-sm'>{testimonial.position}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                {' '}
                {/* Interactive Contact Form */}
                <div className='mb-16'>
                    <h3 className='text-3xl font-bold text-white text-center mb-4'>
                        Start Your Registration
                    </h3>
                    <p className='text-slate-300 text-center mb-12 text-lg'>
                        Begin your registration process and see how Nexlify-SCM can revolutionize your
                        operations
                    </p>
                    <ContactForm/>
                </div>
                {/* Final business message */}
                <div className='text-center bg-slate-800 rounded-2xl p-8 border border-slate-700'>
                    <h3 className='text-2xl font-bold text-white mb-4'>Transform Your Operations Today</h3>
                    <p className='text-slate-300 mb-6'>
                        Every day you delay is efficiency left on the table. Start your transformation with
                        enterprise-grade solutions.
                    </p>
                    <Button
                        size='lg'
                        className='bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg'
                    >
                        Get Started Now
                        <ArrowRight className='w-5 h-5 ml-2'/>
                    </Button>
                </div>
                {' '}
                {/* Contact information */}
                <div className='mt-12 text-center text-slate-400'>
                    <p className='mb-2'>Need to speak with our team?</p>
                    <div className='flex justify-center space-x-8 text-sm'>
            <span className='flex items-center space-x-1'>
              <MessageCircle className='w-4 h-4'/>
              <span>contact@nexlify-scm.com</span>
            </span>
                        <span className='flex items-center space-x-1'>
              <Clock className='w-4 h-4'/>
              <span>+1 (555) 123-4567</span>
            </span>
                        <span className='flex items-center space-x-1'>
              <MessageCircle className='w-4 h-4'/>
              <span>24/7 Live Chat Available</span>
            </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
