import {CheckCircle} from 'lucide-react';

interface FeatureListProps {
    features: string[];
    iconColor?: string;
}

/**
 * Reusable feature list component with consistent styling
 */
export function FeatureList({features, iconColor = 'text-slate-600'}: FeatureListProps) {
    return (
        <ul className='space-y-3'>
            {features.map((feature, index) => (
                <li key={index} className='flex items-start space-x-3'>
                    <CheckCircle className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`}/>
                    <span className='text-slate-700 text-sm'>{feature}</span>
                </li>
            ))}
        </ul>
    );
}
