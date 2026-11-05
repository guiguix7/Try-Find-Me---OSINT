export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusDotProps {
    tone?: StatusTone;
    label: string;
}

export function StatusDot({ tone = 'neutral', label }: StatusDotProps) {
    return (
        <span className="status">
            <span
                className={`status__dot status__dot--${tone}`}
                aria-hidden="true"
            />
            <span>{label}</span>
        </span>
    );
}
