import {TrendingUp, Users, Award, Star} from 'lucide-react';
import {useEffect} from 'react';

import {useIntersectionObserver, useCountUp} from '@/hooks/useScrollEffects';

interface AnimatedMetricProps {
    value: string;
    numericValue: number;
    label: string;
    description: string;
    icon: typeof TrendingUp;
}

export function AnimatedMetric({
                                   value,
                                   numericValue,
                                   label,
                                   description,
                                   icon: Icon,
                               }: AnimatedMetricProps) {
    const [ref, isVisible] = useIntersectionObserver();
    const {count, startAnimation} = useCountUp(numericValue);

    useEffect(() => {
        if (isVisible) {
            startAnimation();
        }
    }, [isVisible, startAnimation]);

    return (
        <div
            ref={ref}
            className='text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200'
        >
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
                <Icon className='w-8 h-8 text-slate-700'/>
            </div>

            <div className='space-y-2'>
                <div className='text-3xl font-bold text-slate-900'>
                    {value.includes('%')
                        ? `${count}%`
                        : value.includes('$')
                            ? `$${count}M+`
                            : value.includes('+')
                                ? `${count}+`
                                : count}
                </div>
                <div className='text-lg font-semibold text-slate-800'>{label}</div>
                <div className='text-sm text-slate-600'>{description}</div>
            </div>
        </div>
    );
}

/**
 * Animated metrics showcase component with sophisticated B2B styling
 */
export function AnimatedMetrics() {
    const keyMetrics = [
        {
            value: '$50M+',
            numericValue: 50,
            label: 'Transactions Processed',
            description: 'Total value of supply chain transactions managed',
            icon: TrendingUp,
        },
        {
            value: '500+',
            numericValue: 500,
            label: 'Verified Suppliers',
            description: 'Global network of certified business partners',
            icon: Users,
        },
        {
            value: '1000+',
            numericValue: 1000,
            label: 'Carrier Partnerships',
            description: 'Logistics providers across all major routes',
            icon: Award,
        },
        {
            value: '99.9%',
            numericValue: 99.9,
            label: 'Platform Uptime',
            description: 'Enterprise-grade reliability and performance',
            icon: Star,
        },
    ];

    return (
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {keyMetrics.map((metric, index) => (
                <AnimatedMetric
                    key={index}
                    value={metric.value}
                    numericValue={metric.numericValue}
                    label={metric.label}
                    description={metric.description}
                    icon={metric.icon}
                />
            ))}
        </div>
    );
}
