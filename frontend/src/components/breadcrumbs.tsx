import { Link, useRouterState } from '@tanstack/react-router';
import { Fragment } from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocale } from '@/hooks/useLocale';

const FALLBACK_LABELS: Record<string, string> = {
    buyer: 'workspace.buyer.title',
    supplier: 'workspace.supplier.title',
    logistics: 'workspace.logistics.title',
    admin: 'workspace.admin.title',
};

const BreadcrumbComponentItem = ({
    label,
    href,
    current,
}: {
    label: string;
    href: string;
    current: boolean;
}) => {
    const { t } = useLocale();
    // If label looks like a translation key (contains a dot and lowercase letters), use it directly.
    // Otherwise treat it as legacy raw text and try fallback map first, then fallback to itself.
    const looksLikeKey = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(label);
    const resolvedKey = looksLikeKey
        ? label
        : (FALLBACK_LABELS[label] ?? label);
    const visibleLabel = t(resolvedKey as Parameters<typeof t>[0]);

    return (
        <BreadcrumbItem>
            {current ? (
                <BreadcrumbPage>{visibleLabel}</BreadcrumbPage>
            ) : (
                <BreadcrumbLink asChild>
                    <Link to={href as never}>{visibleLabel}</Link>
                </BreadcrumbLink>
            )}
        </BreadcrumbItem>
    );
};

export const Breadcrumbs = () => {
    const router = useRouterState();

    const crumbs = router.matches
        .filter(
            (element) =>
                element?.staticData?.crumb &&
                typeof element.staticData.crumb.label === 'string' &&
                element.pathname
        )
        .map((element) => ({
            label: element.staticData.crumb?.label as string,
            href: element.pathname as string,
        }));

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => (
                    <Fragment key={crumb.href}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbComponentItem
                            label={crumb.label}
                            href={crumb.href}
                            current={index === crumbs.length - 1}
                        />
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default Breadcrumbs;