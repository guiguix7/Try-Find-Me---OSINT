import type { ReactNode } from 'react';

interface PanelProps {
    title?: ReactNode;
    eyebrow?: string;
    actions?: ReactNode;
    children: ReactNode;
    id?: string;
    className?: string;
    inset?: boolean;
}

export function Panel({
    title,
    eyebrow,
    actions,
    children,
    id,
    className = '',
    inset = false,
}: PanelProps) {
    return (
        <section
            id={id}
            className={`panel${inset ? ' panel--inset' : ''} ${className}`.trim()}
        >
            {title || actions || eyebrow ? (
                <header className="panel__header">
                    <div>
                        {eyebrow ? (
                            <span className="eyebrow">{eyebrow}</span>
                        ) : null}
                        {title ? (
                            <h2 className="panel__title">{title}</h2>
                        ) : null}
                    </div>
                    {actions ? <div className="cluster">{actions}</div> : null}
                </header>
            ) : null}
            <div className="panel__body">{children}</div>
        </section>
    );
}
