import { useAssessment } from './hooks/useAssessment';
import { DomainInput } from './components/DomainInput';
import { OwnershipChallenge } from './components/OwnershipChallenge';
import { SourcesTransparency } from './components/SourcesTransparency';
import { AssessmentLoading } from './components/AssessmentLoading';
import { ReportView } from './components/ReportView';
import { ErrorState } from './components/ErrorState';
import './App.css';

function App() {
    const {
        state,
        token,
        setDomain,
        setAuthorizationConfirmed,
        setTokenValue,
        startChallenge,
        verifyOwnership,
        goBackToChallenge,
        confirmSources,
        reset,
    } = useAssessment();

    return (
        <main>
            <h1>Try Find Me! — OSINT</h1>

            {state.step === 'idle' && (
                <DomainInput
                    domain={state.domain}
                    onDomainChange={setDomain}
                    authorizationConfirmed={state.authorizationConfirmed}
                    onAuthorizationChange={setAuthorizationConfirmed}
                    onSubmit={startChallenge}
                    loading={state.loading}
                    error={state.error}
                />
            )}

            {state.step === 'challenge' && state.challenge && (
                <OwnershipChallenge
                    challenge={state.challenge}
                    onVerify={verifyOwnership}
                    onBack={goBackToChallenge}
                    token={token}
                    onTokenChange={setTokenValue}
                    loading={state.loading}
                    error={state.error}
                />
            )}

            {state.step === 'sources' && (
                <SourcesTransparency
                    sources={state.sources}
                    confirmed={false}
                    onConfirmChange={() => {}}
                    onConfirm={confirmSources}
                    loading={state.loading}
                />
            )}

            {state.step === 'assessing' && (
                <AssessmentLoading moduleStatuses={[]} />
            )}

            {state.step === 'complete' && state.report && (
                <ReportView report={state.report} onDiscard={reset} />
            )}

            {state.step === 'error' && (
                <ErrorState
                    step={state.step}
                    error={state.error}
                    errorStatus={state.errorStatus}
                    onRetry={reset}
                />
            )}
        </main>
    );
}

export default App;
