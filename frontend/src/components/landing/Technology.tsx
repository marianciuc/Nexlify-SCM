import {
    Cloud,
    Shield,
    Zap,
    Globe,
    Smartphone,
    Database,
    Code2,
    Cpu,
    ArrowRight,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

import {FeatureList} from './FeatureList';

/**
 * Technology and integration section showcasing technical capabilities
 * Professional enterprise-focused design
 */
export function Technology() {
    const technicalFeatures = [
        {
            title: 'API-First Architecture',
            description: 'RESTful and GraphQL APIs for seamless integration',
            icon: Code2,
            features: ['REST & GraphQL APIs', 'Webhook support', 'SDK libraries', 'Real-time events'],
        },
        {
            title: 'Real-time Operations',
            description: 'WebSocket connections for live data synchronization',
            icon: Zap,
            features: [
                'Live tracking',
                'Instant notifications',
                'Real-time dashboards',
                'Event streaming',
            ],
        },
        {
            title: 'Enterprise Security',
            description: 'Bank-grade security with compliance certifications',
            icon: Shield,
            features: ['SOC 2 Type II', 'ISO 27001', 'GDPR compliant', 'Enterprise SSO'],
        },
        {
            title: 'Cloud Infrastructure',
            description: 'Scalable architecture with auto-scaling capabilities',
            icon: Cloud,
            features: ['Auto-scaling', 'Load balancing', 'Global CDN', '99.9% uptime SLA'],
        },
        {
            title: 'Mobile-Ready Platform',
            description: 'Responsive design with dedicated mobile applications',
            icon: Smartphone,
            features: [
                'Mobile applications',
                'Responsive web',
                'Offline capabilities',
                'Push notifications',
            ],
        },
        {
            title: 'AI & Machine Learning',
            description: 'Advanced algorithms for optimization and predictions',
            icon: Cpu,
            features: [
                'Predictive analytics',
                'Route optimization',
                'Demand forecasting',
                'Smart matching',
            ],
        },
    ];

    const integrationCategories = [
        {
            category: 'ERP Systems',
            description: 'Connect with your existing enterprise systems',
            integrations: ['SAP', 'Oracle NetSuite', 'Microsoft Dynamics', 'Sage', 'Epicor'],
            icon: Database,
        },
        {
            category: 'Accounting & Finance',
            description: 'Streamline financial processes and reporting',
            integrations: ['QuickBooks', 'Xero', 'FreshBooks', 'Sage Intacct', 'NetSuite'],
            icon: Globe,
        },
        {
            category: 'Carrier Networks',
            description: 'Access to global shipping and logistics providers',
            integrations: ['DHL', 'FedEx', 'UPS', 'Maersk', 'Regional carriers'],
            icon: Globe,
        },
        {
            category: 'Payment Gateways',
            description: 'Secure payment processing worldwide',
            integrations: ['Stripe', 'PayPal', 'Square', 'Adyen', 'Bank transfers'],
            icon: Shield,
        },
    ];

    const technicalSpecs = [
        {spec: 'Uptime SLA', value: '99.9%'},
        {spec: 'Response Time', value: '< 200ms'},
        {spec: 'Data Processing', value: '1M+ transactions/day'},
        {spec: 'API Rate Limit', value: '10K requests/min'},
        {spec: 'Data Retention', value: '7+ years'},
        {spec: 'Backup Frequency', value: 'Real-time'},
    ];

    return (
        <section className='py-20 bg-white'>
            <div className='container mx-auto px-4'>
                {/* Section header */}
                <div className='text-center max-w-4xl mx-auto mb-16'>
                    <div
                        className='inline-flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700 mb-6'>
                        Technology Foundation
                    </div>
                    <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6'>
                        Built with Cutting-Edge
                        <br/>
                        <span className='text-slate-700'>Technology</span>
                    </h2>
                    <p className='text-xl text-slate-600 leading-relaxed'>
                        Enterprise-grade infrastructure designed for scale, security, and performance. Our
                        platform leverages proven technologies to deliver unmatched reliability.
                    </p>
                </div>

                {/* Technical features grid */}
                <div className='grid lg:grid-cols-3 gap-8 mb-20'>
                    {technicalFeatures.map((feature, index) => (
                        <Card
                            key={index}
                            className='border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200'
                        >
                            <CardHeader className='bg-slate-50 border-b border-slate-200 p-6'>
                                <div className='flex items-center space-x-4'>
                                    <div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center'>
                                        <feature.icon className='w-6 h-6 text-slate-700'/>
                                    </div>
                                    <div>
                                        <CardTitle className='text-lg text-slate-900'>{feature.title}</CardTitle>
                                        <p className='text-slate-600 text-sm mt-1'>{feature.description}</p>
                                    </div>
                                </div>
                            </CardHeader>{' '}
                            <CardContent className='p-6'>
                                <FeatureList features={feature.features} iconColor='text-slate-600'/>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Integration ecosystem */}
                <div className='mb-20'>
                    <h3 className='text-3xl font-bold text-slate-900 text-center mb-12'>
                        Enterprise Integration Ecosystem
                    </h3>

                    <div className='grid lg:grid-cols-2 gap-8'>
                        {integrationCategories.map((category, index) => (
                            <Card
                                key={index}
                                className='border border-slate-200 hover:shadow-md transition-shadow'
                            >
                                <CardContent className='p-8'>
                                    <div className='flex items-start space-x-4 mb-6'>
                                        <div
                                            className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                                            <category.icon className='w-6 h-6 text-slate-700'/>
                                        </div>
                                        <div>
                                            <h4 className='text-xl font-bold text-slate-900 mb-2'>{category.category}</h4>
                                            <p className='text-slate-600 text-sm'>{category.description}</p>
                                        </div>
                                    </div>

                                    <div className='flex flex-wrap gap-2'>
                                        {category.integrations.map((integration, integrationIndex) => (
                                            <span
                                                key={integrationIndex}
                                                className='inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-md'
                                            >
                        {integration}
                      </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Technical specifications */}
                <div className='bg-slate-50 rounded-3xl p-12 mb-16 border border-slate-200'>
                    <h3 className='text-2xl font-bold text-slate-900 text-center mb-8'>
                        Enterprise Performance Specifications
                    </h3>

                    <div className='grid md:grid-cols-3 lg:grid-cols-6 gap-6'>
                        {technicalSpecs.map((spec, index) => (
                            <div key={index} className='text-center'>
                                <div className='text-2xl font-bold text-slate-900 mb-2'>{spec.value}</div>
                                <div className='text-slate-600 text-sm'>{spec.spec}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security and compliance */}
                <div className='bg-slate-900 rounded-3xl p-12 text-white'>
                    <div className='text-center mb-12'>
                        <h3 className='text-3xl font-bold mb-4'>Enterprise Security & Compliance</h3>
                        <p className='text-slate-300 text-lg max-w-3xl mx-auto'>
                            Your data security is our top priority. We maintain the highest standards of security
                            and compliance to protect your business-critical information.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-8 mb-12'>
                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Shield className='w-8 h-8 text-slate-300'/>
                            </div>
                            <h4 className='font-semibold mb-2 text-white'>Data Encryption</h4>
                            <p className='text-slate-400 text-sm'>AES-256 encryption at rest and in transit</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Database className='w-8 h-8 text-slate-300'/>
                            </div>
                            <h4 className='font-semibold mb-2 text-white'>Data Backup</h4>
                            <p className='text-slate-400 text-sm'>Automated backups with 99.9% recovery SLA</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Globe className='w-8 h-8 text-slate-300'/>
                            </div>
                            <h4 className='font-semibold mb-2 text-white'>Global Infrastructure</h4>
                            <p className='text-slate-400 text-sm'>Multi-region deployment with failover</p>
                        </div>

                        <div className='text-center'>
                            <div
                                className='w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                <Cpu className='w-8 h-8 text-slate-300'/>
                            </div>
                            <h4 className='font-semibold mb-2 text-white'>24/7 Monitoring</h4>
                            <p className='text-slate-400 text-sm'>Proactive monitoring and incident response</p>
                        </div>
                    </div>

                    <div className='text-center'>
                        <Button
                            size='lg'
                            className='bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 border border-slate-600'
                        >
                            View Security Documentation
                            <ArrowRight className='w-5 h-5 ml-2'/>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
