interface SectionHeaderProps {
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    className?: string;
}

/**
 * Reusable section header component for consistent styling across landing page
 */
export function SectionHeader({
                                  badge,
                                  title,
                                  subtitle,
                                  description,
                                  className = '',
                              }: SectionHeaderProps) {
    return (
        <div className={`text-center max-w-4xl mx-auto mb-16 ${className}`}>
            {badge && (
                <div
                    className='inline-flex items-center px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700 mb-6 transition-all duration-200 hover:bg-slate-200'>
                    {badge}
                </div>
            )}

            <h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight'>
                {title}
                {subtitle && (
                    <>
                        <br/>
                        <span className='text-slate-600'>{subtitle}</span>
                    </>
                )}
            </h2>

            {description && <p className='text-xl text-slate-600 leading-relaxed'>{description}</p>}
        </div>
    );
}
