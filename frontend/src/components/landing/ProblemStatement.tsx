import {BarChart3, Truck, Package, DollarSign, MessageSquare} from 'lucide-react';

import {Card, CardContent} from '@/components/ui/card';

import {AnimatedSection} from './AnimatedSection';

/**
 * Problem statement section highlighting pain points in supply chain management
 * Uses professional icons and clean card layout with smooth animations
 */
export function ProblemStatement() {
    const problems = [
        {
            icon: BarChart3,
            title: 'Fragmented Operations',
            description: 'Multiple systems create data silos and operational inefficiencies',
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
        },
        {
            icon: Truck,
            title: 'Logistics Bottlenecks',
            description: 'Manual carrier selection results in suboptimal routing and delays',
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
        },
        {
            icon: Package,
            title: 'Warehouse Inefficiencies',
            description: 'Limited inventory visibility and manual processing workflows',
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
        },
        {
            icon: DollarSign,
            title: 'Cost Transparency Issues',
            description: 'Hidden fees and unexpected charges impact profitability',
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
        },
        {
            icon: MessageSquare,
            title: 'Communication Gaps',
            description: 'Disconnected stakeholders across the supply chain ecosystem',
            color: 'text-slate-600',
            bgColor: 'bg-slate-100',
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
                            Industry Challenge Analysis
                        </div>
                        <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight'>
                            Complex Supply Chains Demand
                            <br/>
                            <span className='text-slate-700'>Smart Solutions</span>
                        </h2>
                        <p className='text-xl text-slate-600 leading-relaxed'>
                            Modern enterprises face unprecedented supply chain complexity. Traditional approaches
                            are inadequate for today's global commerce demands and operational scale.
                        </p>
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={200}>
                    {/* Problems grid */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
                        {problems.map((problem, index) => (
                            <AnimatedSection key={index} direction='up' delay={300 + index * 100}>
                                <Card
                                    className='border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 bg-white group'>
                                    <CardContent className='p-6'>
                                        <div
                                            className={`w-12 h-12 rounded-lg ${problem.bgColor} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105`}
                                        >
                                            <problem.icon className={`w-6 h-6 ${problem.color}`}/>
                                        </div>

                                        <h3 className='text-lg font-semibold text-slate-900 mb-3'>{problem.title}</h3>

                                        <p className='text-slate-600 leading-relaxed text-sm'>{problem.description}</p>
                                    </CardContent>
                                </Card>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={400}>
                    {/* Business impact statistics */}
                    <div className='mt-16 bg-white border border-slate-200 rounded-lg p-8'>
                        <div className='text-center mb-8'>
                            <h3 className='text-2xl font-semibold text-slate-900 mb-3'>
                                Enterprise Impact Assessment
                            </h3>
                            <p className='text-slate-600'>
                                Quantified impact of supply chain inefficiencies on enterprise operations
                            </p>
                        </div>

                        <div className='grid md:grid-cols-4 gap-8'>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-900 mb-2'>15-25%</div>
                                <div className='text-sm text-slate-600'>Higher logistics costs</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-900 mb-2'>30%</div>
                                <div className='text-sm text-slate-600'>Time lost on manual processes</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-900 mb-2'>40%</div>
                                <div className='text-sm text-slate-600'>Inventory carrying costs</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-900 mb-2'>$2M+</div>
                                <div className='text-sm text-slate-600'>Annual revenue impact</div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection direction='up' delay={500}>
                    {/* Executive summary */}
                    <div className='mt-12 bg-slate-800 rounded-lg p-8 text-center'>
                        <h3 className='text-2xl font-semibold text-white mb-4'>
                            Strategic Transformation Required
                        </h3>
                        <p className='text-slate-300 text-lg max-w-3xl mx-auto'>
                            Modern enterprises require unified, technology-driven supply chain solutions that
                            deliver measurable operational improvements and competitive advantages.
                        </p>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
