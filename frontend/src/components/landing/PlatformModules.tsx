import {
    Package,
    Truck,
    Users,
    DollarSign,
    ArrowRight,
    Workflow,
    BarChart3,
    Shield,
    Zap,
    Globe,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

import {SectionHeader} from './SectionHeader';

/**
 * Platform modules section showcasing detailed functionality
 * Professional enterprise-focused design
 */
export function PlatformModules() {
    const modules = [
        {
            id: 'supply-chain',
            title: 'Supply Chain Management',
            icon: Package,
            description: 'Complete order and inventory control',
            features: [
                {
                    name: 'Order Management',
                    description: 'Multi-step workflows, bulk processing, approval systems',
                    icon: Workflow,
                },
                {
                    name: 'Inventory Control',
                    description: 'Real-time tracking, automatic reorder alerts, forecasting',
                    icon: BarChart3,
                },
                {
                    name: 'Warehouse Operations',
                    description: 'Multi-location management, staff coordination',
                    icon: Users,
                },
            ],
            stats: [
                {label: 'Processing Speed', value: '10x faster'},
                {label: 'Accuracy', value: '99.9%'},
                {label: 'Cost Reduction', value: '25%'},
            ],
        },
        {
            id: 'logistics',
            title: 'Logistics & Carrier Network',
            icon: Truck,
            description: 'AI-powered delivery optimization',
            features: [
                {
                    name: 'Smart Carrier Selection',
                    description: 'AI algorithms analyze weight, dimensions, destination',
                    icon: Zap,
                },
                {
                    name: 'Quote Comparison',
                    description: 'Automated quotes from multiple carriers via API',
                    icon: DollarSign,
                },
                {
                    name: 'Delivery Optimization',
                    description: 'Cost and time optimization suggestions',
                    icon: BarChart3,
                },
            ],
            stats: [
                {label: 'Cost Savings', value: '30%'},
                {label: 'Delivery Speed', value: '40% faster'},
                {label: 'Carrier Network', value: '1000+'},
            ],
        },
        {
            id: 'supplier',
            title: 'Supplier Ecosystem',
            icon: Users,
            description: 'Verified supplier marketplace',
            features: [
                {
                    name: 'Verified Supplier Network',
                    description: 'Tax ID validation, document verification',
                    icon: Shield,
                },
                {
                    name: 'Product Catalog',
                    description: 'Rich product information with images and specifications',
                    icon: Package,
                },
                {
                    name: 'Bidding System',
                    description: 'Open procurement with competitive pricing',
                    icon: DollarSign,
                },
            ],
            stats: [
                {label: 'Verified Suppliers', value: '500+'},
                {label: 'Price Reduction', value: '20%'},
                {label: 'Procurement Speed', value: '3x faster'},
            ],
        },
        {
            id: 'financial',
            title: 'Financial Management',
            icon: DollarSign,
            description: 'Automated invoicing and payments',
            features: [
                {
                    name: 'Automated Invoicing',
                    description: 'Generate invoices from orders automatically',
                    icon: Workflow,
                },
                {
                    name: 'Payment Processing',
                    description: 'Multiple payment methods, credit management',
                    icon: DollarSign,
                },
                {
                    name: 'Financial Analytics',
                    description: 'Revenue, expenses, profit analysis',
                    icon: BarChart3,
                },
            ],
            stats: [
                {label: 'Payment Speed', value: '50% faster'},
                {label: 'Accuracy', value: '99.99%'},
                {label: 'Multi-currency', value: '150+ currencies'},
            ],
        },
    ];
    return (
        <section className='py-20 bg-slate-50'>
            <div className='container mx-auto px-4'>
                <SectionHeader
                    badge='Platform Overview'
                    title='Comprehensive Business Solutions'
                    subtitle='in One Platform'
                    description='Integrated modules designed for enterprise scalability, delivering unified operations management across your entire supply chain.'
                    className='mb-16'
                />

                {/* Modules grid */}
                <div className='grid lg:grid-cols-2 gap-8'>
                    {modules.map(module => (
                        <Card
                            key={module.id}
                            className='border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-white'
                        >
                            <CardHeader className='bg-slate-50 border-b border-slate-200 p-6'>
                                <div className='flex items-center space-x-4'>
                                    <div className='w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center'>
                                        <module.icon className='w-6 h-6 text-slate-700'/>
                                    </div>
                                    <div>
                                        <CardTitle className='text-lg text-slate-900 mb-1'>{module.title}</CardTitle>
                                        <p className='text-sm text-slate-600'>{module.description}</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className='p-6'>
                                {/* Features list */}
                                <div className='space-y-4 mb-6'>
                                    {module.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className='flex items-start space-x-3'>
                                            <div
                                                className='w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5'>
                                                <feature.icon className='w-4 h-4 text-slate-600'/>
                                            </div>
                                            <div>
                                                <h4 className='font-semibold text-slate-900 mb-1'>{feature.name}</h4>
                                                <p className='text-slate-600 text-sm leading-relaxed'>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className='bg-slate-50 rounded-xl p-6 mb-6 border-l-4 border-slate-300'>
                                    <h5 className='font-semibold text-slate-900 mb-4 text-center'>
                                        Performance Metrics
                                    </h5>
                                    <div className='grid grid-cols-3 gap-4'>
                                        {module.stats.map((stat, statIndex) => (
                                            <div key={statIndex} className='text-center'>
                                                <div className='text-lg font-bold text-slate-900'>{stat.value}</div>
                                                <div className='text-xs text-slate-600'>{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <Button
                                    variant='outline'
                                    className='w-full text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                                >
                                    Explore {module.title}
                                    <ArrowRight className='w-4 h-4 ml-2'/>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Integration showcase */}
                <div className='mt-16 bg-white rounded-3xl p-12 shadow-lg border border-slate-200'>
                    <div className='text-center mb-12'>
                        <h3 className='text-3xl font-bold text-slate-900 mb-4'>
                            Enterprise Integration Ecosystem
                        </h3>
                        <p className='text-slate-600 text-lg max-w-3xl mx-auto'>
                            Connect with your existing systems through our robust API-first architecture designed
                            for enterprise-grade reliability and scalability
                        </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-8'>
                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Globe className='w-8 h-8 text-slate-700'/>
                            </div>
                            <h4 className='font-semibold text-slate-900 mb-2'>ERP Systems</h4>
                            <p className='text-sm text-slate-600'>SAP, Oracle, Microsoft Dynamics</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <DollarSign className='w-8 h-8 text-slate-700'/>
                            </div>
                            <h4 className='font-semibold text-slate-900 mb-2'>Payment Gateways</h4>
                            <p className='text-sm text-slate-600'>Stripe, PayPal, Bank transfers</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Truck className='w-8 h-8 text-slate-700'/>
                            </div>
                            <h4 className='font-semibold text-slate-900 mb-2'>Carrier APIs</h4>
                            <p className='text-sm text-slate-600'>DHL, FedEx, UPS, Regional</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Package className='w-8 h-8 text-slate-700'/>
                            </div>
                            <h4 className='font-semibold text-slate-900 mb-2'>WMS Systems</h4>
                            <p className='text-sm text-slate-600'>Warehouse management integration</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
