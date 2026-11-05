import { useAssessment } from './hooks/useAssessment';
import type { AssessmentStep } from './hooks/useAssessment';
import { BrandMark } from './components/BrandMark';
import { DomainInput } from './components/DomainInput';
import { OwnershipChallenge } from './components/OwnershipChallenge';
import { SourcesTransparency } from './components/SourcesTransparency';
import { AssessmentLoading } from './components/AssessmentLoading';
import { ReportView } from './components/ReportView';
import { StepIndicator } from './components/ui';

const STEPS = ['Identify', 'Verify ownership', 'Sources & consent', 'Report'];

function stepIndex(step: AssessmentStep): number {
    switch (step) {
        case 'idle':
            return 0;
        case 'challenge':
        case 'verifying':
            return 1;
        case 'sources':
            return 2;
        case 'assessing':
        case 'complete':
            return 3;
    }
}

function App() {
    const {
        state,
        setDomain,
        setAuthorizationConfirmed,
        setConsentConfirmed,
        startChallenge,
        verifyOwnership,
        backToChallenge,
        confirmSources,
        reset,
        retry,
        restartVerification,
    } = useAssessment();

    const activeDomain = state.challenge?.domain ?? state.domain;

    return (
        <div className="app-shell">
            <a className="skip-link" href="#main-content">
                Skip to content
            </a>

            <header className="app-header">
                <div className="app-header__inner">
                    <div className="brand">
                        <BrandMark title="Try Find Me! mark" />
                        <div className="brand__text">
                            <span className="brand__name">TRY FIND ME!</span>
                            <span className="brand__tag">OSINT</span>
                        </div>
                    </div>
                    <div
                        className="header-status"
                        aria-label="Environment status"
                    >
                        <span className="chip">
                            <span className="chip__dot" aria-hidden="true" />
                            Local environment
                        </span>
                        <span className="chip">Passive mode</span>
                    </div>
                </div>
            </header>

            <main className="workspace" id="main-content">
                <StepIndicator
                    steps={STEPS}
                    current={stepIndex(state.step)}
                />

                {state.step === 'idle' ? (
                    <DomainInput
                        domain={state.domain}
                        onDomainChange={setDomain}
                        authorizationConfirmed={state.authorizationConfirmed}
                        onAuthorizationChange={setAuthorizationConfirmed}
                        onSubmit={startChallenge}
                        loading={state.loading}
                        error={state.error}
                        onRetry={retry}
                        onRestartVerification={restartVerification}
                        onStartOver={reset}
                    />
                ) : null}

                {(state.step === 'challenge' || state.step === 'verifying') &&
                state.challenge ? (
                    <OwnershipChallenge
                        challenge={state.challenge}
                        verifying={state.step === 'verifying'}
                        loading={state.loading}
                        error={state.error}
                        onVerify={verifyOwnership}
                        onStartOver={reset}
                        onRetry={retry}
                        onRestartVerification={restartVerification}
                    />
                ) : null}

                {state.step === 'sources' ? (
                    <SourcesTransparency
                        sources={state.sources}
                        consentConfirmed={state.consentConfirmed}
                        onConsentChange={setConsentConfirmed}
                        onConfirm={confirmSources}
                        onBack={backToChallenge}
                        loading={state.loading}
                        error={state.error}
                        onRetry={retry}
                        onRestartVerification={restartVerification}
                        onStartOver={reset}
                        domain={activeDomain}
                    />
                ) : null}

                {state.step === 'assessing' ? (
                    <AssessmentLoading
                        domain={activeDomain}
                        sources={state.sources}
                        error={state.error}
                        onRetry={retry}
                        onRestartVerification={restartVerification}
                        onStartOver={reset}
                    />
                ) : null}

                {state.step === 'complete' && state.report ? (
                    <ReportView report={state.report} onDiscard={reset} />
                ) : null}
            </main>

            <footer className="app-footer">
                <div className="app-footer__inner">
                    <span>
                        Investigation data stays in this browser session. No
                        account, no history.
                    </span>
                    <span>
                        Rate limits apply to verification and assessment
                        requests.
                    </span>
                    <nav className="footer-links" aria-label="Project links">
                        <a
                            href="https://github.com/guiguix7/Try-Find-Me---OSINT/blob/main/PRIVACY.md"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy
                        </a>
                        <a
                            href="https://github.com/guiguix7/Try-Find-Me---OSINT/blob/main/SECURITY.md"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Security
                        </a>
                        <a
                            href="https://github.com/guiguix7/Try-Find-Me---OSINT"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Source code
                        </a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

export default App;
