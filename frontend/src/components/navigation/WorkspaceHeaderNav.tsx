import {useRouterState, Link} from '@tanstack/react-router';
import {
    WORKSPACES,
    getActiveWorkspace,
    WorkspaceViewSwitcher,
} from './WorkspaceViewSwitcher';

export function WorkspaceHeaderNav() {
    const router = useRouterState();
    const currentPath = router.location.pathname;
    const activeWorkspace = getActiveWorkspace(currentPath);

    return (
        <div className='flex items-center gap-1.5'>
            {/* Desktop Segmented Navigation Pills */}
            <nav
                aria-label='Быстрое переключение рабочего пространства'
                className='hidden lg:flex items-center p-1 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs'
            >
                {WORKSPACES.map(ws => {
                    const isActive = activeWorkspace.id === ws.id;
                    const Icon = ws.icon;

                    return (
                        <Link
                            key={ws.id}
                            to={ws.primaryUrl}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                isActive
                                    ? ws.colorClasses.pillActive
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon className='h-3.5 w-3.5' />
                            <span>{ws.shortTitle}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile / Tablet Compact Switcher */}
            <div className='lg:hidden'>
                <WorkspaceViewSwitcher variant='compact' />
            </div>
        </div>
    );
}

export default WorkspaceHeaderNav;
