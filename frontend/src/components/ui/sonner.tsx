import {Toaster as Sonner} from 'sonner';
import type {ToasterProps} from 'sonner';

const Toaster = ({...props}: ToasterProps) => {
    // Since we're not using Next.js theme provider, we'll use system theme
    const theme = 'system';

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className='toaster group'
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export {Toaster};
