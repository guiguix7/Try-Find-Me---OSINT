import type { AssessmentError } from '../hooks/useAssessment';
import type { SourceInfo } from '../types/api';
import { safeHttpUrl } from '../lib/format';
import { FlowError } from './FlowError';
import {
    Badge,
    Button,
    Checkbox,
    EmptyState,
    Panel,
} from './ui';
import type { BadgeTone } from './ui';

interface SourcesTransparencyProps {
    sources: SourceInfo[];
    consentConfirmed: boolean;
    onConsentChange: (checked: boolean) => void;
    onConfirm: () => void;
    onBack: () => void;
    loading: boolean;
    error: AssessmentError | null;
    onRetry: () => void;
    onRestartVerification: () => void;
    onStartOver: () => void;
    domain: string;
}

function reliabilityTone(
    reliability: SourceInfo['reliability'],
): BadgeTone {
    if (reliability === 'high') return 'success';
    if (reliability === 'medium') return 'warning';
    return 'neutral';
}

export function SourcesTransparency({
    sources,
    consentConfirmed,
    onConsentChange,
    onConfirm,
    onBack,
    loading,
    error,
    onRetry,
    onRestartVerification,
    onStartOver,
    domain,
}: SourcesTransparencyProps) {
    const sourcesUnavailable = error?.context === 'sources';
    const blocked = sources.length === 0 || sourcesUnavailable;

    return (
        <div className="stack stack--loose">
            <div className="page-intro">
                <span className="eyebrow">Step 3 · Sources &amp; consent</span>
                <h1>Review who will receive {domain}</h1>
                <p>
                    The assessment uses only allowlisted passive sources. The
                    domain you verified is transmitted to each service below.
                    These services may log requests independently under their
                    own policies.
                </p>
            </div>

            {sourcesUnavailable ? (
                <FlowError
                    error={error}
                    onRetry={onRetry}
                    onRestartVerification={onRestartVerification}
                    onStartOver={onStartOver}
                />
            ) : null}

            {sources.length === 0 && !sourcesUnavailable ? (
                <Panel>
                    <EmptyState
                        icon="globe"
                        title="No external sources were returned"
                    >
                        The backend did not return a source list. The assessment
                        cannot start without a transparent list of the services
                        that will receive the domain.
                    </EmptyState>
                </Panel>
            ) : null}

            {sources.length > 0 ? (
                <div className="stack">
                    {sources.map((source) => {
                        const docsUrl = safeHttpUrl(source.source_url);
                        return (
                        <section className="source-card" key={source.module_id}>
                            <div className="source-card__header">
                                <span className="source-card__name">
                                    {source.source_name}
                                </span>
                                <div className="cluster">
                                    <Badge
                                        tone={reliabilityTone(
                                            source.reliability,
                                        )}
                                    >
                                        {source.reliability} reliability
                                    </Badge>
                                    <Badge tone="neutral">
                                        {source.auth_required
                                            ? 'Authentication required'
                                            : 'No authentication'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="source-card__body">
                                <span className="source-card__term">
                                    Purpose
                                </span>
                                <span className="source-card__desc">
                                    {source.purpose}
                                </span>
                                <span className="source-card__term">
                                    Data sent
                                </span>
                                <span className="source-card__desc">
                                    {source.data_sent}
                                </span>
                            </div>
                            {docsUrl ? (
                                <a
                                    className="source-card__link"
                                    href={docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open source documentation
                                    <span className="sr-only">
                                        {' '}
                                        (opens in a new tab)
                                    </span>
                                </a>
                            ) : null}
                        </section>
                        );
                    })}
                </div>
            ) : null}

            <Panel eyebrow="Consent" title="Confirm before running">
                <div className="stack">
                    <div role="group" aria-label="Consent confirmation">
                        <Checkbox
                            checked={consentConfirmed}
                            onChange={onConsentChange}
                            label="I understand these third-party services will receive my domain and may log requests under their own policies."
                            description="This consent is required before the assessment starts. The platform does not send the domain anywhere until you confirm."
                            disabled={blocked || loading}
                        />
                    </div>

                    <div className="cluster">
                        <Button
                            variant="primary"
                            icon="search"
                            onClick={onConfirm}
                            loading={loading}
                            disabled={!consentConfirmed || blocked || loading}
                        >
                            Run passive assessment
                        </Button>
                        <Button variant="ghost" onClick={onBack}>
                            Back to verification
                        </Button>
                    </div>
                </div>
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
