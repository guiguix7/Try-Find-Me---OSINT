import type { ReactNode } from 'react';
import { Icon } from './Icon';

type AlertTone = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
    tone?: AlertTone;
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
}

const ICONS: Record<AlertTone, 'alert' | 'info' | 'check'> = {
    error: 'alert',
    warning: 'alert',
    success: 'check',
    info: 'info',
};

export function Alert({ tone = 'error', title, children, actions }: AlertProps) {
    return (
        <div
            className={`alert alert--${tone}`}
            role={tone === 'error' ? 'alert' : 'status'}
        >
            <span className="alert__icon">
                <Icon name={ICONS[tone]} size={18} />
            </span>
            <div className="alert__body">
                {title ? <span className="alert__title">{title}</span> : null}
                <div className="alert__message">{children}</div>
                {actions ? <div className="alert__actions">{actions}</div> : null}
            </div>
        </div>
    );
}
