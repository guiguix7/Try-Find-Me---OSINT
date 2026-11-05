interface ProgressProps {
    label: string;
    detail?: string;
}

export function Progress({ label, detail }: ProgressProps) {
    return (
        <div className="progress">
            <div
                className="progress__track"
                role="progressbar"
                aria-valuetext={label}
                aria-label={label}
            >
                <span className="progress__bar" />
            </div>
            <div className="progress__meta">
                <span>{label}</span>
                {detail ? <span>{detail}</span> : null}
            </div>
        </div>
    );
}
