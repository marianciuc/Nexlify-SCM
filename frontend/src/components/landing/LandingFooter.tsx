import {
    Truck,
    Mail,
    Phone,
    MapPin,
    Globe,
    LinkedinIcon,
    Twitter,
    Youtube,
    ArrowRight,
    Shield,
    Award,
    Users,
} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

/**
 * Footer component for the landing page
 * Features comprehensive links, contact information, and newsletter signup
 */
export function LandingFooter() {
    const footerLinks = {
        platform: {
            title: 'Platform',
            links: [
                {label: 'Supply Chain Management', href: '/platform/supply-chain'},
                {label: 'Warehouse Operations', href: '/platform/warehouse'},
                {label: 'Logistics & Carriers', href: '/platform/logistics'},
                {label: 'Financial Management', href: '/platform/finance'},
                {label: 'Analytics & Reporting', href: '/platform/analytics'},
            ],
        },
        solutions: {
            title: 'Solutions',
            links: [
                {label: 'Manufacturing', href: '/solutions/manufacturing'},
                {label: 'Retail & E-commerce', href: '/solutions/retail'},
                {label: 'Healthcare & Pharma', href: '/solutions/healthcare'},
                {label: 'Automotive', href: '/solutions/automotive'},
                {label: 'Custom Industries', href: '/solutions/custom'},
            ],
        },
        resources: {
            title: 'Resources',
            links: [
                {label: 'Case Studies', href: '/resources/case-studies'},
                {label: 'Whitepapers', href: '/resources/whitepapers'},
                {label: 'ROI Calculator', href: '/resources/roi-calculator'},
                {label: 'API Documentation', href: '/docs/api'},
                {label: 'Help Center', href: '/help'},
            ],
        },
        company: {
            title: 'Company',
            links: [
                {label: 'About Us', href: '/about'},
                {label: 'Careers', href: '/careers'},
                {label: 'Press Kit', href: '/press'},
                {label: 'Security', href: '/security'},
                {label: 'Compliance', href: '/compliance'},
            ],
        },
        legal: {
            title: 'Legal',
            links: [
                {label: 'Privacy Policy', href: '/privacy'},
                {label: 'Terms of Service', href: '/terms'},
                {label: 'Cookie Policy', href: '/cookies'},
                {label: 'Data Processing', href: '/data-processing'},
                {label: 'SLA Agreement', href: '/sla'},
            ],
        },
    };

    const socialLinks = [
        {
            icon: LinkedinIcon,
            href: 'https://linkedin.com/company/nexlify-scm',
            label: 'LinkedIn',
        },
        {icon: Twitter, href: 'https://twitter.com/nexlify_scm', label: 'Twitter'},
        {icon: Youtube, href: 'https://youtube.com/@nexlify-scm', label: 'YouTube'},
    ];

    const certifications = [
        {name: 'SOC 2 Type II', icon: Shield},
        {name: 'ISO 27001', icon: Award},
        {name: 'GDPR Compliant', icon: Users},
    ];

    const offices = [
        {
            city: 'New York',
            address: '123 Business Ave, Suite 100\nNew York, NY 10001',
            phone: '+1 (555) 123-4567',
        },
        {
            city: 'London',
            address: '456 Enterprise St, Floor 5\nLondon EC1A 1BB, UK',
            phone: '+44 20 1234 5678',
        },
        {
            city: 'Singapore',
            address: '789 Commerce Blvd, Level 12\nSingapore 018989',
            phone: '+65 6789 1234',
        },
    ];

    return (
        <footer className='bg-gray-900 text-white'>
            {/* Newsletter signup section */}
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 py-12'>
                <div className='container mx-auto px-4'>
                    <div className='max-w-4xl mx-auto text-center'>
                        <h3 className='text-3xl font-bold mb-4'>Stay Ahead of Supply Chain Innovation</h3>
                        <p className='text-blue-100 text-lg mb-8'>
                            Get the latest insights, case studies, and industry trends delivered to your inbox
                            monthly.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 max-w-lg mx-auto'>
                            <Input
                                type='email'
                                placeholder='Enter your business email'
                                className='bg-white/10 border-white/20 text-white placeholder:text-white/70 flex-1'
                            />
                            <Button className='bg-white text-blue-600 hover:bg-gray-100 px-8'>
                                Subscribe
                                <ArrowRight className='w-4 h-4 ml-2'/>
                            </Button>
                        </div>

                        <p className='text-blue-200 text-sm mt-4'>
                            Join 5,000+ supply chain professionals. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main footer content */}
            <div className='py-16'>
                <div className='container mx-auto px-4'>
                    <div className='grid lg:grid-cols-6 gap-8'>
                        {/* Company info */}
                        <div className='lg:col-span-2'>
                            <div className='flex items-center space-x-3 mb-6'>
                                <div
                                    className='w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center'>
                                    <Truck className='w-7 h-7 text-white'/>
                                </div>
                                <div>
                                    <h2 className='text-2xl font-bold'>Nexlify-SCM</h2>
                                    <p className='text-gray-400 text-sm'>Enterprise Supply Chain Platform</p>
                                </div>
                            </div>

                            <p className='text-gray-300 mb-6 leading-relaxed'>
                                Transforming global supply chains with AI-powered automation, enterprise-grade
                                security, and seamless integrations. Trusted by Fortune 500 companies worldwide.
                            </p>

                            {/* Certifications */}
                            <div className='space-y-4'>
                                <h4 className='font-semibold text-white'>Security & Compliance</h4>
                                <div className='flex flex-wrap gap-3'>
                                    {certifications.map((cert, index) => (
                                        <Badge key={index} variant='outline' className='border-gray-600 text-gray-300'>
                                            <cert.icon className='w-3 h-3 mr-1'/>
                                            {cert.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Social links */}
                            <div className='mt-8'>
                                <h4 className='font-semibold text-white mb-4'>Follow Us</h4>
                                <div className='flex space-x-4'>
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors'
                                            aria-label={social.label}
                                        >
                                            <social.icon className='w-5 h-5'/>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer links */}
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key}>
                                <h3 className='font-semibold text-white mb-4'>{section.title}</h3>
                                <ul className='space-y-3'>
                                    {section.links.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className='text-gray-400 hover:text-white transition-colors text-sm'
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Office locations */}
            <div className='border-t border-gray-800 py-12'>
                <div className='container mx-auto px-4'>
                    <h3 className='text-2xl font-bold text-center mb-8'>Global Offices</h3>
                    <div className='grid md:grid-cols-3 gap-8'>
                        {offices.map((office, index) => (
                            <div key={index} className='text-center'>
                                <div
                                    className='w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                    <MapPin className='w-8 h-8 text-blue-400'/>
                                </div>
                                <h4 className='font-semibold text-white mb-2'>{office.city}</h4>
                                <p className='text-gray-400 text-sm mb-2 whitespace-pre-line'>{office.address}</p>
                                <a
                                    href={`tel:${office.phone}`}
                                    className='text-blue-400 hover:text-blue-300 text-sm'
                                >
                                    {office.phone}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className='border-t border-gray-800 py-6'>
                <div className='container mx-auto px-4'>
                    <div className='flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0'>
                        <div
                            className='flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-sm text-gray-400'>
                            <p>&copy; 2026 Nexlify-SCM. All rights reserved.</p>
                            <div className='flex items-center space-x-4'>
                <span className='flex items-center space-x-1'>
                  <Globe className='w-4 h-4'/>
                  <span>Available in 25+ countries</span>
                </span>
                                <span className='flex items-center space-x-1'>
                  <Shield className='w-4 h-4'/>
                  <span>Enterprise-grade security</span>
                </span>
                            </div>
                        </div>

                        {/* Contact info */}
                        <div
                            className='flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-sm'>
                            <a
                                href='mailto:contact@nexlify-scm.com'
                                className='flex items-center space-x-1 text-gray-400 hover:text-white transition-colors'
                            >
                                <Mail className='w-4 h-4'/>
                                <span>contact@nexlify-scm.com</span>
                            </a>
                            <a
                                href='tel:+15551234567'
                                className='flex items-center space-x-1 text-gray-400 hover:text-white transition-colors'
                            >
                                <Phone className='w-4 h-4'/>
                                <span>+1 (555) 123-4567</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
