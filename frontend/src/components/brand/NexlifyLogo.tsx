import React from 'react';

import { cn } from '@/lib/utils';

export interface NexlifyLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * 'icon': Rounded container with the geometric N mark
   * 'mark': Just the standalone N vector paths
   * 'full': Complete brand logo with 'Nexlify' wordmark & 'SCM' enterprise tag
   */
  variant?: 'icon' | 'mark' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

const SIZE_MAP = {
  sm: { icon: 24, fullWidth: 120, fullHeight: 28 },
  md: { icon: 32, fullWidth: 150, fullHeight: 36 },
  lg: { icon: 40, fullWidth: 180, fullHeight: 44 },
  xl: { icon: 48, fullWidth: 210, fullHeight: 52 },
};

export const NexlifyIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 32,
}) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('shrink-0 select-none', className)}
    aria-hidden="true"
  >
    {/* Dark/Light Adaptive Squircle Container */}
    <rect width="32" height="32" rx="7" className="fill-primary" />

    {/* Left Logistics Pillar (Origin Hub) */}
    <rect
      x="6"
      y="6"
      width="5.5"
      height="20"
      rx="1.5"
      className="fill-primary-foreground"
    />

    {/* Right Logistics Pillar (Destination Hub) */}
    <rect
      x="20.5"
      y="6"
      width="5.5"
      height="20"
      rx="1.5"
      className="fill-primary-foreground"
    />

    {/* Dynamic Diagonal Logistics Transfer Beam */}
    <path
      d="M10 6.5C10.5 5.8 11.4 5.8 12 6.5L21.5 21.5C22 22.2 21.6 23 20.7 23H17.8C17.2 23 16.6 22.6 16.3 22L9.2 10.5C8.7 9.7 9.1 8.8 10 8.8L10 6.5Z"
      className="fill-primary-foreground/50"
    />

    {/* Real-time Telemetry Pulse Status Node */}
    <circle cx="23.25" cy="8.75" r="1.75" fill="#10b981" />
  </svg>
);

export const NexlifyLogo: React.FC<NexlifyLogoProps> = ({
  variant = 'icon',
  size = 'md',
  showSubtitle = false,
  className,
  ...props
}) => {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'icon') {
    return <NexlifyIcon size={currentSize.icon} className={className} />;
  }

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={currentSize.icon}
        height={currentSize.icon}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0 select-none', className)}
        {...props}
      >
        <rect x="2" y="2" width="4.5" height="20" rx="1.5" fill="currentColor" />
        <rect x="17.5" y="2" width="4.5" height="20" rx="1.5" fill="currentColor" />
        <path
          d="M5.5 2.5C6 1.8 6.9 1.8 7.5 2.5L18.5 18.5C19 19.2 18.6 20 17.7 20H15.2C14.6 20 14 19.6 13.7 19L5 5.5C4.5 4.7 4.9 3.8 5.8 3.8L5.5 2.5Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
        <circle cx="19.75" cy="4.75" r="1.5" fill="#10b981" />
      </svg>
    );
  }

  // variant === 'full'
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <NexlifyIcon size={currentSize.icon} />
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base tracking-tight text-foreground">
            Nexlify
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-muted text-muted-foreground border border-border">
            SCM
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5 tracking-tight">
            Supply Chain Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default NexlifyLogo;
