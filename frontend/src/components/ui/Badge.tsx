import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type BadgeTone =
    | 'low'
    | 'medium'
    | 'high'
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

interface BadgeProps {
    tone?: BadgeTone;
    icon?: IconName;
    children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
    return (
        <span className={`badge badge--${tone}`}>
            {icon ? <Icon name={icon} size={12} /> : null}
            {children}
        </span>
    );
}
