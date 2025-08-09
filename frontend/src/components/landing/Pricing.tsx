import {
    CheckCircle,
    ArrowRight,
    Star,
    Users,
    Zap,
    Shield,
    Phone,
    Crown,
    Building,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

import {AnimatedSection} from './AnimatedSection';

/**
 * Pricing and enterprise plans section with tiered pricing structure
 * Professional design focused on enterprise requirements with smooth animations
 */
export function Pricing() {
    const pricingTiers = [
        {
            name: 'Starter',
            description: 'Perfect for small businesses getting started',
            price: 'Custom',
            priceDescription: 'Based on usage',
            orderLimit: 'Up to 100 orders/month',
            popular: false,
            icon: Building,
            features: [
                'Basic order management',
                'Single warehouse support',
                'Standard carrier integration',
                'Email support',
                'Basic reporting',
                'Mobile app access',
            ],
        },
        {
            name: 'Professional',
            description: 'Ideal for growing companies with expanding needs',
            price: 'Custom',
            priceDescription: 'Volume discounts available',
            orderLimit: 'Up to 1,000 orders/month',
            popular: true,
            icon: Zap,
            features: [
                'Advanced order workflows',
                'Multi-warehouse management',
                'AI-powered carrier selection',
                'Priority email & chat support',
                'Advanced analytics',
                'API integrations',
                'Custom reporting',
                'Mobile apps for all roles',
            ],
        },
        {
            name: 'Enterprise',
            description: 'Comprehensive solution for large corporations',
            price: 'Custom',
            priceDescription: 'Tailored to your needs',
            orderLimit: 'Unlimited orders',
            popular: false,
            icon: Crown,
            features: [
                'Everything in Professional',
                'Unlimited warehouses',
                'Custom AI algorithms',
                'Dedicated account manager',
                '24/7 phone support',
                'Custom integrations',
                'White-label options',
                'On-premise deployment',
                'Advanced security features',
                'Compliance certifications',
            ],
        },
    ];

    const enterpriseFeatures = [
        {
            title: 'Dedicated Account Manager',
            description: 'Personal support from our enterprise specialists',
            icon: Users,
        },
        {
            title: '24/7 Priority Support',
            description: 'Round-the-clock assistance with 1-hour response SLA',
            icon: Phone,
        },
        {
            title: 'Custom Integrations',
            description: 'Bespoke API connections to your existing systems',
            icon: Zap,
        },
        {
            title: 'On-premise Deployment',
            description: 'Deploy on your infrastructure for maximum control',
            icon: Shield,
        },
        {
            title: 'Advanced Analytics',
            description: 'Custom dashboards and predictive insights',
            icon: Star,
        },
        {
            title: 'Training & Onboarding',
            description: 'Comprehensive team training and change management',
            icon: Users,
        },
    ];

    const addOnServices = [
        {
            service: 'Implementation Services',
            description: 'Dedicated implementation team and project management',
            pricing: 'Starting from $25,000',
        },
        {
            service: 'Custom Development',
            description: 'Bespoke features and integrations for your business',
            pricing: 'Quote on request',
        },
        {
            service: 'Training Programs',
            description: 'Comprehensive training for your team members',
            pricing: 'Starting from $5,000',
        },
        {
            service: 'Premium Support',
            description: 'Dedicated support team with 30-minute response SLA',
            pricing: 'Starting from $10,000/year',
        },
    ];

    return (
        <section className='py-20 bg-slate-50'>
            <div className='container mx-auto px-4'>
                <AnimatedSection direction='up'>
                    {/* Section header */}
                    <div className='text-center max-w-4xl mx-auto mb-16'>
                        <div
                            className='inline-flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700 mb-6 transition-all duration-200 hover:bg-slate-200'>
                            Enterprise Pricing
                        </div>
                        <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6'>
                            Enterprise Plans Designed to Scale
                            <br/>
                            <span className='text-slate-700'>with Your Business</span>
                        </h2>
                        <p className='text-xl text-slate-600 leading-relaxed'>
                            From startups to Fortune 500 companies, we have the right plan to support your supply
                            chain transformation journey.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Pricing tiers */}
                <div className='grid lg:grid-cols-3 gap-8 mb-20'>
                    {pricingTiers.map((tier, index) => (
                        <AnimatedSection key={index} direction='up' delay={200 + index * 150}>
                            <Card
                                className={`relative border transition-all duration-300 h-full ${
                                    tier.popular
                                        ? 'border-slate-300 ring-2 ring-slate-200 transform scale-105 z-10 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                }`}
                            >
                                {tier.popular && (
                                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                                        <div
                                            className='inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium'>
                                            <Star className='w-4 h-4 mr-1'/>
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <CardHeader className='bg-slate-50 border-b border-slate-200 rounded-t-lg p-8'>
                                    <div className='flex items-center space-x-4 mb-4'>
                                        <div
                                            className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center'>
                                            <tier.icon className='w-6 h-6 text-slate-700'/>
                                        </div>
                                        <div>
                                            <CardTitle className='text-2xl text-slate-900'>{tier.name}</CardTitle>
                                            <p className='text-slate-600 text-sm'>{tier.description}</p>
                                        </div>
                                    </div>

                                    <div className='text-center'>
                                        <div className='text-4xl font-bold text-slate-900 mb-2'>{tier.price}</div>
                                        <p className='text-slate-600 text-sm mb-2'>{tier.priceDescription}</p>
                                        <p className='text-slate-500 text-xs'>{tier.orderLimit}</p>
                                    </div>
                                </CardHeader>

                                <CardContent className='p-8'>
                                    <ul className='space-y-4 mb-8'>
                                        {tier.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className='flex items-start space-x-3'>
                                                <CheckCircle className='w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5'/>
                                                <span className='text-slate-700 text-sm'>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full transition-all duration-200 ${
                                            tier.popular
                                                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                                        }`}
                                        size='lg'
                                    >
                                        {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                                        <ArrowRight className='w-4 h-4 ml-2'/>
                                    </Button>
                                </CardContent>
                            </Card>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection direction='up' delay={600}>
                    {/* Enterprise features highlight */}
                    <div className='bg-white rounded-3xl p-12 shadow-sm mb-16 border border-slate-200'>
                        <div className='text-center mb-12'>
                            <h3 className='text-3xl font-bold text-slate-900 mb-4'>
                                Enterprise-Exclusive Features
                            </h3>
                            <p className='text-slate-600 text-lg'>
                                Advanced capabilities designed for large-scale operations
                            </p>
                        </div>

                        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                            {enterpriseFeatures.map((feature, index) => (
                                <div key={index} className='text-center'>
                                    <div
                                        className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                        <feature.icon className='w-8 h-8 text-slate-700'/>
                                    </div>
                                    <h4 className='font-semibold text-slate-900 mb-2'>{feature.title}</h4>
                                    <p className='text-sm text-slate-600'>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={700}>
                    {/* Add-on services */}
                    <div className='mb-16'>
                        <div className='text-center mb-12'>
                            <h3 className='text-3xl font-bold text-slate-900 mb-4'>
                                Professional Services & Add-ons
                            </h3>
                            <p className='text-slate-600 text-lg'>
                                Additional services to accelerate your success
                            </p>
                        </div>

                        <div className='grid md:grid-cols-2 gap-6'>
                            {addOnServices.map((addon, index) => (
                                <Card
                                    key={index}
                                    className='border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200'
                                >
                                    <CardContent className='p-6'>
                                        <h4 className='font-semibold text-slate-900 mb-2'>{addon.service}</h4>
                                        <p className='text-slate-600 text-sm mb-4'>{addon.description}</p>
                                        <div className='text-lg font-bold text-slate-900'>{addon.pricing}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={800}>
                    {/* ROI Calculator CTA */}
                    <div className='bg-slate-800 rounded-3xl p-12 text-center text-white'>
                        <h3 className='text-3xl font-bold mb-4'>Calculate Your ROI</h3>
                        <p className='text-slate-300 text-lg mb-8 max-w-3xl mx-auto'>
                            See how much you could save with our supply chain optimization platform. Most
                            enterprises see 20-30% cost reduction in the first year.
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button
                                size='lg'
                                className='bg-white text-slate-900 hover:bg-slate-100 transition-all duration-200'
                            >
                                Get ROI Analysis
                                <ArrowRight className='w-4 h-4 ml-2'/>
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='border-slate-300 text-white hover:bg-slate-700 transition-all duration-200'
                            >
                                Schedule Demo
                            </Button>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={900}>
                    {/* Contact sales */}
                    <div className='mt-12 text-center'>
                        <h3 className='text-2xl font-bold text-slate-900 mb-4'>
                            Ready to Transform Your Supply Chain?
                        </h3>
                        <p className='text-slate-600 text-lg mb-8'>
                            Our enterprise team is ready to design a solution that fits your unique requirements.
                        </p>
                        <Button
                            size='lg'
                            className='bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200'
                        >
                            Contact Enterprise Sales
                            <ArrowRight className='w-4 h-4 ml-2'/>
                        </Button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
