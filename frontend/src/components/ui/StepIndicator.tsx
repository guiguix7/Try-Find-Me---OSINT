interface StepIndicatorProps {
    steps: string[];
    current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
    return (
        <ol className="steps" aria-label="Assessment progress">
            {steps.map((label, index) => {
                const state =
                    index === current
                        ? 'step--current'
                        : index < current
                          ? 'step--complete'
                          : '';
                return (
                    <li
                        key={label}
                        className={`step ${state}`.trim()}
                        aria-current={index === current ? 'step' : undefined}
                    >
                        <span className="step__marker" aria-hidden="true">
                            {index < current ? '✓' : index + 1}
                        </span>
                        <span className="step__label">{label}</span>
                    </li>
                );
            })}
        </ol>
    );
}
