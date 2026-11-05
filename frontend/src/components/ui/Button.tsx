import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconName;
    iconAfter?: IconName;
    loading?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    icon,
    iconAfter,
    loading = false,
    disabled,
    children,
    className = '',
    type = 'button',
    ...rest
}: ButtonProps) {
    const classes = [
        'btn',
        `btn--${variant}`,
        size === 'sm' ? 'btn--sm' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? (
                <span className="btn__spinner" aria-hidden="true" />
            ) : icon ? (
                <Icon name={icon} size={16} />
            ) : null}
            <span>{children}</span>
            {!loading && iconAfter ? (
                <Icon name={iconAfter} size={16} />
            ) : null}
        </button>
    );
}
