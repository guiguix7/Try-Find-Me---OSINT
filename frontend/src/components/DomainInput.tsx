import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AssessmentError } from '../hooks/useAssessment';
import { FlowError } from './FlowError';
import {
    Button,
    Checkbox,
    DefinitionList,
    Panel,
    TextField,
} from './ui';

interface DomainInputProps {
    domain: string;
    onDomainChange: (value: string) => void;
    authorizationConfirmed: boolean;
    onAuthorizationChange: (value: boolean) => void;
    onSubmit: () => void;
    loading: boolean;
    error: AssessmentError | null;
    onRetry: () => void;
    onRestartVerification: () => void;
    onStartOver: () => void;
}

function validateDomain(value: string): string | null {
    const domain = value.trim();
    if (!domain) return 'Enter a domain to begin.';
    if (domain.includes('://') || domain.includes('/')) {
        return 'Enter the domain only, without a protocol or path.';
    }
    if (/\s/.test(domain)) return 'The domain cannot contain spaces.';
    if (!domain.includes('.')) {
        return 'Enter a valid domain with at least one dot, for example example.com.';
    }
    return null;
}

export function DomainInput({
    domain,
    onDomainChange,
    authorizationConfirmed,
    onAuthorizationChange,
    onSubmit,
    loading,
    error,
    onRetry,
    onRestartVerification,
    onStartOver,
}: DomainInputProps) {
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [authorizationError, setAuthorizationError] = useState<string | null>(
        null,
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const domainError = validateDomain(domain);
        const authorizationMissing = !authorizationConfirmed;

        setFieldError(domainError);
        setAuthorizationError(
            authorizationMissing
                ? 'Confirm that you own or are authorized to assess this domain.'
                : null,
        );

        if (domainError || authorizationMissing) return;
        onSubmit();
    };

    return (
        <div className="stack stack--loose">
            <div className="page-intro">
                <span className="eyebrow">Step 1 · Identify</span>
                <h1>Assess the public exposure of a domain you control</h1>
                <p>
                    Try Find Me! maps publicly available information about a
                    domain you own or are authorized to assess. Findings are
                    documented with their source, retrieval time and a
                    deterministic risk classification.
                </p>
            </div>

            <Panel
                eyebrow="Scope"
                title="What this does — and does not do"
            >
                <div className="grid-2">
                    <div className="callout">
                        <strong>It discovers.</strong> Public certificate
                        transparency entries, public DNS records and public
                        registration data for the verified domain.
                    </div>
                    <div className="callout">
                        <strong>It never scans.</strong> No active connections
                        to the assessed domain, no people search, no photographs
                        and no credential guessing. Only allowlisted passive
                        sources are queried.
                    </div>
                </div>
            </Panel>

            <Panel eyebrow="Step 1" title="Domain">
                <form className="stack" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Domain"
                        requiredIndicator
                        mono
                        value={domain}
                        onChange={(event) => {
                            onDomainChange(event.target.value);
                            if (fieldError) setFieldError(null);
                        }}
                        placeholder="example.com"
                        autoComplete="off"
                        spellCheck={false}
                        hint="Enter the domain only — no protocol, path or port. The assessment covers this domain and names discovered passively."
                        error={fieldError ?? undefined}
                        disabled={loading}
                    />

                    <Checkbox
                        checked={authorizationConfirmed}
                        onChange={(checked) => {
                            onAuthorizationChange(checked);
                            if (authorizationError && checked) {
                                setAuthorizationError(null);
                            }
                        }}
                        label="I own this domain or have explicit authorization to assess it."
                        description="Ownership is confirmed in the next step by publishing a temporary DNS TXT record. This confirmation is required."
                    />
                    {authorizationError ? (
                        <span className="field__error" role="alert">
                            {authorizationError}
                        </span>
                    ) : null}

                    <div className="cluster">
                        <Button
                            type="submit"
                            variant="primary"
                            icon="arrow-right"
                            loading={loading}
                        >
                            Begin ownership verification
                        </Button>
                    </div>
                </form>
            </Panel>

            {error?.context === 'challenge' ? (
                <FlowError
                    error={error}
                    onRetry={onRetry}
                    onRestartVerification={onRestartVerification}
                    onStartOver={onStartOver}
                />
            ) : null}

            <Panel eyebrow="How it works" title="Three verified steps">
                <DefinitionList
                    items={[
                        {
                            term: '1 · Challenge',
                            description:
                                'The backend issues a temporary, signed token. You publish it as a DNS TXT record.',
                        },
                        {
                            term: '2 · Verify',
                            description:
                                'The backend queries public DNS and confirms the published value. No token is stored permanently.',
                        },
                        {
                            term: '3 · Assess',
                            description:
                                'You review exactly which external services will receive the domain, then run the passive assessment.',
                        },
                    ]}
                />
            </Panel>
        </div>
    );
}
