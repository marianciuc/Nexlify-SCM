import {useRouterState} from '@tanstack/react-router';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from '@/components/ui/breadcrumb';

import {useLocale} from '../hooks/useLocale';
import type {TranslationPath} from '../types/generated-locale';

const BreadcrumbComponentItem = ({label, href}: { label: string; href: string }) => {
    const {t} = useLocale();
    return (
        <BreadcrumbItem>
            <BreadcrumbLink href={href}>{t(label as TranslationPath)}</BreadcrumbLink>
        </BreadcrumbItem>
    );
};

export const Breadcrumbs = () => {
    const router = useRouterState();

    const crumbs = router.matches
        .filter(element => {
            return (
                element?.staticData?.crumb &&
                typeof element.staticData.crumb.label === 'string' &&
                element.pathname
            );
        })
        .map(element => {
            return {
                label: element.staticData.crumb?.label,
                href: element.pathname,
            };
        });

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => (
                    <BreadcrumbComponentItem key={index} label={crumb.label ?? ''} href={crumb.href}/>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default Breadcrumbs;
