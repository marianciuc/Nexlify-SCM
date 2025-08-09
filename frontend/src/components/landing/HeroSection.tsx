import {ArrowRight, Shield, Zap, Globe, TrendingUp} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';

/**
 * Hero section component for the landing page
 * Professional B2B design with sophisticated animations
 */
export function HeroSection() {
    return (
        <section
            className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 min-h-screen flex items-center'>
            {/* Subtle animated background elements */}
            <div className='absolute inset-0 opacity-5'>
                <div className='absolute top-20 left-20 w-64 h-64 bg-slate-300 rounded-full animate-pulse'></div>
                <div className='absolute bottom-20 right-20 w-48 h-48 bg-slate-400 rounded-full'></div>
                <div
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500 rounded-full opacity-20'></div>
            </div>

            <div className='container mx-auto px-4 py-20 relative z-10'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Left column - Content */}
                    <div className='text-white space-y-8'>
                        {' '}
                        {/* Trust indicators badges */}
                        <div className='flex flex-wrap gap-3'>
                            <Badge
                                variant='secondary'
                                className='bg-slate-100/20 text-slate-100 border-slate-300/30 hover:bg-slate-100/30 transition-all duration-200'
                            >
                                <Shield className='w-3 h-3 mr-1'/>
                                Enterprise Security
                            </Badge>
                            <Badge
                                variant='secondary'
                                className='bg-slate-100/20 text-slate-100 border-slate-300/30 hover:bg-slate-100/30 transition-all duration-200'
                            >
                                <Zap className='w-3 h-3 mr-1'/>
                                99.9% Uptime
                            </Badge>
                            <Badge
                                variant='secondary'
                                className='bg-slate-100/20 text-slate-100 border-slate-300/30 hover:bg-slate-100/30 transition-all duration-200'
                            >
                                <Globe className='w-3 h-3 mr-1'/>
                                Global Scale
                            </Badge>
                        </div>
                        {' '}
                        {/* Main headline */}
                        <div className='space-y-4'>
                            <h1 className='text-5xl lg:text-7xl font-bold leading-tight text-white'>
                                Enterprise
                                <span
                                    className='bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent'>
                  {' '}
                                    Supply Chain{' '}
                </span>
                                Platform
                            </h1>
                            <p className='text-xl lg:text-2xl text-slate-300 font-light leading-relaxed'>
                                AI-Powered B2B Solution for Complete Logistics Management
                            </p>
                        </div>
                        {' '}
                        {/* Value proposition */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-3'>
                                <TrendingUp className='w-6 h-6 text-slate-400'/>
                                <span className='text-lg text-slate-200'>Reduce logistics costs by up to 30%</span>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <Zap className='w-6 h-6 text-slate-400'/>
                                <span className='text-lg text-slate-200'>
                  AI-powered carrier selection and route optimization
                </span>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <Globe className='w-6 h-6 text-slate-400'/>
                                <span className='text-lg text-slate-200'>
                  Unified platform for global supply chain operations
                </span>
                            </div>
                        </div>
                        {' '}
                        {/* CTA Buttons */}{' '}
                        <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                            <Button
                                size='lg'
                                className='bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 text-lg transition-all duration-200 border border-slate-600'
                            >
                                Start Registration
                                <ArrowRight className='w-5 h-5 ml-2'/>
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='border-slate-400/30 text-slate-200 hover:bg-slate-700/30 px-8 py-4 text-lg transition-all duration-200'
                            >
                                View Platform Tour
                            </Button>
                        </div>
                        {' '}
                        {/* Stats row */}
                        <div className='grid grid-cols-3 gap-6 pt-8 border-t border-slate-600/30'>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-300'>$50M+</div>
                                <div className='text-sm text-slate-400'>Transactions Processed</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-300'>1000+</div>
                                <div className='text-sm text-slate-400'>Carrier Partners</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-slate-300'>99.9%</div>
                                <div className='text-sm text-slate-400'>Platform Uptime</div>
                            </div>
                        </div>
                    </div>
                    {' '}
                    {/* Right column - Hero visual */}
                    <div className='relative'>
                        <div
                            className='relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30 transition-all duration-300 hover:border-slate-500/50'>
                            {/* Mock platform interface */}
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='text-slate-200 font-semibold'>Supply Chain Dashboard</h3>
                                    <Badge className='bg-slate-600 text-slate-200 border-slate-500'>Live</Badge>
                                </div>

                                {/* Mock data visualization */}
                                <div className='grid grid-cols-2 gap-4'>
                                    <div
                                        className='bg-slate-700/50 rounded-lg p-4 transition-all duration-200 hover:bg-slate-700/70'>
                                        <div className='text-slate-300 font-bold text-2xl'>847</div>
                                        <div className='text-slate-400 text-sm'>Active Orders</div>
                                    </div>
                                    <div
                                        className='bg-slate-700/50 rounded-lg p-4 transition-all duration-200 hover:bg-slate-700/70'>
                                        <div className='text-slate-300 font-bold text-2xl'>23</div>
                                        <div className='text-slate-400 text-sm'>Warehouses</div>
                                    </div>
                                </div>

                                {/* Mock chart area */}
                                <div className='bg-slate-700/50 rounded-lg p-4 h-32 flex items-end justify-between'>
                                    {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                                        <div
                                            key={i}
                                            className='bg-gradient-to-t from-slate-500 to-slate-400 rounded-t w-8 transition-all duration-500 hover:scale-105'
                                            style={{height: `${height}%`}}
                                        ></div>
                                    ))}
                                </div>

                                {/* Mock recent activity */}
                                <div className='space-y-2'>
                                    <div className='flex items-center space-x-3 text-slate-300 text-sm'>
                                        <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse'></div>
                                        <span>Shipment #8847 delivered to Munich</span>
                                    </div>
                                    <div className='flex items-center space-x-3 text-slate-300 text-sm'>
                                        <div className='w-2 h-2 bg-slate-500 rounded-full animate-pulse'></div>
                                        <span>New carrier quote received from DHL</span>
                                    </div>
                                    <div className='flex items-center space-x-3 text-slate-300 text-sm'>
                                        <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse'></div>
                                        <span>Inventory alert: Reorder point reached</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div
                            className='absolute -top-4 -right-4 bg-slate-600 rounded-full p-3 transition-all duration-300 hover:bg-slate-500'>
                            <Zap className='w-6 h-6 text-slate-200'/>
                        </div>
                        <div
                            className='absolute -bottom-4 -left-4 bg-slate-600 rounded-full p-3 transition-all duration-300 hover:bg-slate-500'>
                            <TrendingUp className='w-6 h-6 text-slate-200'/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent'></div>
        </section>
    );
}
