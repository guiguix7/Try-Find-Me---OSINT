import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
    icon?: IconName;
    title: string;
    children?: ReactNode;
}

export function EmptyState({ icon = 'info', title, children }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <span className="empty-state__icon">
                <Icon name={icon} size={20} />
            </span>
            <span className="empty-state__title">{title}</span>
            {children ? <div>{children}</div> : null}
        </div>
    );
}
