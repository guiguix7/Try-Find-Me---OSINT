import { useEffect, useState } from 'react';
import type { AssessmentError } from '../hooks/useAssessment';
import type { SourceInfo } from '../types/api';
import { formatRemaining } from '../lib/format';
import { FlowError } from './FlowError';
import { Panel, Progress } from './ui';

interface AssessmentLoadingProps {
    domain: string;
    sources: SourceInfo[];
    error: AssessmentError | null;
    onRetry: () => void;
    onRestartVerification: () => void;
    onStartOver: () => void;
}

export function AssessmentLoading({
    domain,
    sources,
    error,
    onRetry,
    onRestartVerification,
    onStartOver,
}: AssessmentLoadingProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setElapsed((value) => value + 1);
        }, 1000);
        return () => window.clearInterval(interval);
    }, []);

    return (
        <div className="stack stack--loose">
            <div className="page-intro">
                <span className="eyebrow">Step 4 · Assessment</span>
                <h1>Running a passive assessment for {domain}</h1>
                <p>
                    The request was submitted. The backend is querying the
                    approved sources sequentially and will return a single
                    report when finished.
                </p>
            </div>

            <Panel eyebrow="In progress" title="Processing">
                <div className="stack">
                    <Progress
                        label="Running passive assessment…"
                        detail={`Elapsed ${formatRemaining(elapsed)}`}
                    />
                    <p className="muted text-sm" role="status" aria-live="polite">
                        The assessment endpoint returns one response after all
                        approved sources finish. Per-source progress is not
                        inferred or displayed.
                    </p>
                    <p className="muted text-sm">
                        This can take several seconds depending on the
                        responsiveness of the public sources.
                    </p>
                </div>
            </Panel>

            <Panel
                eyebrow="Transparency"
                title="Sources that will be consulted"
            >
                {sources.length > 0 ? (
                    <ul className="stack stack--tight">
                        {sources.map((source) => (
                            <li key={source.module_id}>
                                <strong>{source.source_name}</strong>{' '}
                                <span className="muted">
                                    — {source.purpose}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="muted text-sm">
                        The source list is not available in this state. The
                        report will list the sources that were actually
                        consulted and any that failed.
                    </p>
                )}
            </Panel>

            {error?.context === 'assessment' ? (
                <FlowError
                    error={error}
                    onRetry={onRetry}
                    onRestartVerification={onRestartVerification}
                    onStartOver={onStartOver}
                />
            ) : null}
        </div>
    );
}
