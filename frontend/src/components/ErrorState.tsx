import type { AssessmentStep } from '../hooks/useAssessment';

interface ErrorStateProps {
    step: AssessmentStep;
    error: string | null;
    errorStatus: number | null;
    onRetry: () => void;
}

export function ErrorState({
    step,
    error,
    errorStatus,
    onRetry,
}: ErrorStateProps) {
    const isRateLimited = errorStatus === 429;

    return (
        <section
            aria-labelledby="error-heading"
            className="card error-card"
        >
            <h2 id="error-heading">Error</h2>

            {isRateLimited && (
                <div className="alert alert-warn" role="status">
                    <p>
                        Too many requests. Please wait a moment before trying again.
                    </p>
                </div>
            )}

            <p role="alert">{error ?? 'An unexpected error occurred.'}</p>

            {step === 'verifying' && (
                <p className="hint">
                    If you just published the DNS TXT record, it may take some time
                    to propagate. Try again in a minute.
                </p>
            )}

            <button type="button" onClick={onRetry} className="button">
                Try again
            </button>
        </section>
    );
}
