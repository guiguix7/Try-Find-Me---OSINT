import { useEffect, useState } from 'react';
import { Alert, Button } from './ui';
import type { AssessmentError } from '../hooks/useAssessment';
import { formatRemaining } from '../lib/format';

interface FlowErrorProps {
    error: AssessmentError;
    onRetry: () => void;
    onRestartVerification: () => void;
    onStartOver: () => void;
}

const TITLES: Record<AssessmentError['context'], string> = {
    challenge: 'Verification challenge could not be created',
    verify: 'Ownership verification failed',
    sources: 'External source list unavailable',
    assessment: 'Assessment could not be completed',
};

function useRateLimitCountdown(initial: number | null): number {
    const [remaining, setRemaining] = useState(initial ?? 0);

    useEffect(() => {
        if (!initial || initial <= 0) return;
        const interval = window.setInterval(() => {
            setRemaining((value) => Math.max(0, value - 1));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [initial]);

    return remaining;
}

export function FlowError({
    error,
    onRetry,
    onRestartVerification,
    onStartOver,
}: FlowErrorProps) {
    const rateLimited = error.status === 429;
    const remaining = useRateLimitCountdown(
        rateLimited ? error.retryAfterSeconds : null,
    );
    const proofProblem =
        error.context === 'assessment' &&
        (error.status === 403 || error.status === 404);

    const message = rateLimited
        ? `Too many requests. ${
              remaining > 0
                  ? `Try again in ${formatRemaining(remaining)}.`
                  : 'You can try again now.'
          }`
        : error.message;

    return (
        <Alert
            tone="error"
            title={TITLES[error.context]}
            actions={
                proofProblem ? (
                    <>
                        <Button variant="primary" onClick={onRestartVerification}>
                            Verify ownership again
                        </Button>
                        <Button variant="ghost" onClick={onStartOver}>
                            Start over
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="primary"
                            onClick={onRetry}
                            disabled={rateLimited && remaining > 0}
                        >
                            {rateLimited && remaining > 0
                                ? `Retry in ${formatRemaining(remaining)}`
                                : 'Try again'}
                        </Button>
                        {error.context !== 'challenge' ? (
                            <Button variant="ghost" onClick={onStartOver}>
                                Start over
                            </Button>
                        ) : null}
                    </>
                )
            }
        >
            {message}
        </Alert>
    );
}
