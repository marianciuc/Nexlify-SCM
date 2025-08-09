import {Bot, Factory, ShoppingCart, Smartphone, Briefcase} from 'lucide-react';

import {Card, CardContent} from '@/components/ui/card';

import {FeatureList} from './FeatureList';

/**
 * Solution overview section showcasing platform capabilities
 * Professional design focused on enterprise requirements
 */
export function SolutionOverview() {
    const solutions = [
        {
            icon: Bot,
            title: 'AI-Powered Intelligence',
            description: 'Advanced algorithms for optimal decision-making across operations',
            features: ['Machine learning optimization', 'Predictive analytics', 'Automated routing'],
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
        },
        {
            icon: Factory,
            title: 'Warehouse Operations',
            description: 'Centralized management for multi-location inventory control',
            features: ['Real-time visibility', 'Automated workflows', 'Performance tracking'],
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
        },
        {
            icon: ShoppingCart,
            title: 'Supplier Network',
            description: 'Verified supplier ecosystem with integrated procurement tools',
            features: ['Verified partnerships', 'Procurement automation', 'Contract management'],
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
        },
        {
            icon: Smartphone,
            title: 'Operational Visibility',
            description: 'Comprehensive tracking and monitoring across supply chain',
            features: ['Real-time monitoring', 'Status reporting', 'Mobile accessibility'],
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
        },
        {
            icon: Briefcase,
            title: 'Enterprise Integration',
            description: 'Scalable architecture designed for enterprise requirements',
            features: ['API-first design', 'Custom dashboards', 'Security compliance'],
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
        },
    ];

    const benefits = [
        'Reduce operational costs by 30%',
        'Improve delivery times by 40%',
        'Increase inventory accuracy to 99%+',
        'Automate 80% of manual processes',
        'Scale operations globally',
        'Ensure 99.9% platform uptime',
    ];

    return (
        <section className='py-20 bg-white'>
            <div className='container mx-auto px-4'>
                {/* Section header */}
                <div className='text-center max-w-4xl mx-auto mb-16'>
                    <div
                        className='inline-flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700 mb-6'>
                        Platform Overview
                    </div>
                    <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight'>
                        Unified Platform for Complete
                        <br/>
                        <span className='text-blue-900'>Supply Chain Control</span>
                    </h2>
                    <p className='text-xl text-slate-600 leading-relaxed'>
                        Comprehensive supply chain management platform delivering operational excellence through
                        integrated technology solutions and enterprise-grade capabilities.
                    </p>
                </div>

                {/* Solutions grid */}
                <div className='grid lg:grid-cols-3 gap-6 mb-16'>
                    {solutions.map((solution, index) => (
                        <Card
                            key={index}
                            className='border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-white'
                        >
                            <CardContent className='p-6'>
                                <div
                                    className={`w-12 h-12 ${solution.bgColor} rounded-lg flex items-center justify-center mb-4`}
                                >
                                    <solution.icon className={`w-6 h-6 ${solution.color}`}/>
                                </div>
                                <h3 className='text-lg font-semibold text-slate-900 mb-3'>{solution.title}</h3>{' '}
                                <p className='text-slate-600 text-sm mb-4 leading-relaxed'>
                                    {solution.description}
                                </p>
                                <FeatureList features={solution.features} iconColor='text-green-600'/>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Benefits showcase */}
                <div className='bg-slate-50 rounded-lg p-8'>
                    <div className='text-center mb-8'>
                        <h3 className='text-2xl font-semibold text-slate-900 mb-3'>
                            Measurable Business Impact
                        </h3>
                        <p className='text-slate-600'>
                            Demonstrated performance improvements across key operational metrics
                        </p>
                    </div>
                    {' '}
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className='flex items-center space-x-3 bg-white rounded-lg p-4 border border-slate-200'
                            >
                                <div className='w-5 h-5 rounded-full bg-green-100 flex items-center justify-center'>
                                    <div className='w-2 h-2 bg-green-600 rounded-full'></div>
                                </div>
                                <span className='text-slate-700 text-sm font-medium'>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technology foundation */}
                <div className='mt-16 text-center'>
                    <h3 className='text-xl font-semibold text-slate-900 mb-6'>
                        Enterprise-Grade Technology Foundation
                    </h3>

                    <div className='flex flex-wrap justify-center items-center gap-6'>
                        {[
                            'Cloud Infrastructure',
                            'API-First Architecture',
                            'Real-time Analytics',
                            'Security Compliance',
                            'Scalable Design',
                            'Integration Ready',
                        ].map((tech, index) => (
                            <div
                                key={index}
                                className='flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-md'
                            >
                                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                                <span className='text-slate-600 text-sm font-medium'>{tech}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
