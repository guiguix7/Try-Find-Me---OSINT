import type { AssessmentError } from '../hooks/useAssessment';
import type { DomainChallengeResponse } from '../types/api';
import { useCountdown } from '../hooks/useCountdown';
import { formatRemaining, formatTimestamp } from '../lib/format';
import { FlowError } from './FlowError';
import {
    Alert,
    Badge,
    Button,
    CopyField,
    DefinitionList,
    Panel,
    Progress,
} from './ui';

interface OwnershipChallengeProps {
    challenge: DomainChallengeResponse;
    verifying: boolean;
    loading: boolean;
    error: AssessmentError | null;
    onVerify: () => void;
    onStartOver: () => void;
    onRetry: () => void;
    onRestartVerification: () => void;
}

export function OwnershipChallenge({
    challenge,
    verifying,
    loading,
    error,
    onVerify,
    onStartOver,
    onRetry,
    onRestartVerification,
}: OwnershipChallengeProps) {
    const remaining = useCountdown(challenge.expires_at);
    const expired = remaining !== null && remaining <= 0;

    return (
        <div className="stack stack--loose">
            <div className="page-intro">
                <span className="eyebrow">Step 2 · Verify ownership</span>
                <h1>Prove control of {challenge.domain}</h1>
                <p>
                    Publish the temporary TXT record below. The backend will
                    query public DNS for this record. The token is signed,
                    expires automatically and cannot be reused.
                </p>
            </div>

            <Panel
                eyebrow="DNS TXT record"
                title="Publish this record with your DNS provider"
                actions={
                    expired ? (
                        <Badge tone="danger" icon="alert">
                            Expired
                        </Badge>
                    ) : (
                        <Badge tone="info" icon="clock">
                            Expires in{' '}
                            {remaining === null
                                ? '—'
                                : formatRemaining(remaining)}
                        </Badge>
                    )
                }
            >
                <div className="stack">
                    <CopyField
                        label="Record name"
                        value={challenge.txt_record_name}
                    />
                    <CopyField
                        label="Record value"
                        value={challenge.txt_record_value}
                    />

                    <DefinitionList
                        items={[
                            {
                                term: 'Record type',
                                description: 'TXT',
                            },
                            {
                                term: 'Suggested TTL',
                                description:
                                    '300 seconds, or the minimum your provider allows. DNS propagation can take longer than the TTL.',
                            },
                            {
                                term: 'Expires at',
                                description: `${formatTimestamp(
                                    challenge.expires_at,
                                )} (${challenge.ttl_seconds} seconds after creation)`,
                            },
                            {
                                term: 'After verification',
                                description:
                                    'Remove the TXT record. It is only needed to prove control and is not used again.',
                            },
                        ]}
                    />

                    <div className="callout">
                        Publish <strong>only the record value shown above</strong>
                        . Do not add quotes or extra text unless your DNS
                        provider requires them. If verification fails, allow
                        time for DNS propagation and try again while the
                        challenge is still valid.
                    </div>

                    {expired ? (
                        <Alert tone="warning" title="Challenge expired">
                            This challenge can no longer be verified. Start
                            over to request a new signed token.
                        </Alert>
                    ) : null}

                    {verifying ? (
                        <div className="stack stack--tight">
                            <Progress
                                label="Querying public DNS for the TXT record…"
                                detail="Waiting for the backend response"
                            />
                            <p className="muted text-sm" role="status">
                                Do not close this page. Verification usually
                                takes a few seconds.
                            </p>
                        </div>
                    ) : null}

                    <div className="cluster">
                        <Button
                            variant="primary"
                            icon="shield"
                            onClick={onVerify}
                            loading={verifying || loading}
                            disabled={expired}
                        >
                            I&apos;ve published the record — Verify
                        </Button>
                        <Button variant="ghost" onClick={onStartOver}>
                            Start over
                        </Button>
                    </div>
                </div>
            </Panel>

            {error?.context === 'verify' ? (
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
