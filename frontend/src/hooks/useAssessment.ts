// Assessment state machine.
// idle -> challenge -> verifying -> sources -> assessing -> complete
// Errors are attached to the current context so retries preserve progress.
// No investigation data is persisted anywhere.

import { useCallback, useState } from 'react';
import type {
    DomainChallengeResponse,
    Report,
    SourceInfo,
} from '../types/api';
import {
    createDomainChallenge,
    verifyDomainOwnership,
    listSources,
    runAssessment,
    ApiError,
} from '../services/api';

export type AssessmentStep =
    | 'idle'
    | 'challenge'
    | 'verifying'
    | 'sources'
    | 'assessing'
    | 'complete';

export type ErrorContext = 'challenge' | 'verify' | 'sources' | 'assessment';

export interface AssessmentError {
    message: string;
    context: ErrorContext;
    status: number | null;
    retryAfterSeconds: number | null;
}

interface AssessmentState {
    step: AssessmentStep;
    domain: string;
    authorizationConfirmed: boolean;
    challenge: DomainChallengeResponse | null;
    proofId: string | null;
    sources: SourceInfo[];
    consentConfirmed: boolean;
    report: Report | null;
    loading: boolean;
    error: AssessmentError | null;
}

const initialState: AssessmentState = {
    step: 'idle',
    domain: '',
    authorizationConfirmed: false,
    challenge: null,
    proofId: null,
    sources: [],
    consentConfirmed: false,
    report: null,
    loading: false,
    error: null,
};

function toAssessmentError(
    error: unknown,
    context: ErrorContext,
    fallback: string,
): AssessmentError {
    if (error instanceof ApiError) {
        return {
            message: error.message,
            context,
            status: error.status,
            retryAfterSeconds: error.retryAfterSeconds ?? null,
        };
    }
    return {
        message: fallback,
        context,
        status: null,
        retryAfterSeconds: null,
    };
}

export function useAssessment() {
    const [state, setState] = useState<AssessmentState>(initialState);

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    const setDomain = useCallback((domain: string) => {
        setState((prev) => ({ ...prev, domain, error: null }));
    }, []);

    const setAuthorizationConfirmed = useCallback((checked: boolean) => {
        setState((prev) => ({ ...prev, authorizationConfirmed: checked }));
    }, []);

    const setConsentConfirmed = useCallback((checked: boolean) => {
        setState((prev) => ({ ...prev, consentConfirmed: checked }));
    }, []);

    const loadSources = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const sources = await listSources();
            setState((prev) => ({
                ...prev,
                sources,
                step: 'sources',
                loading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                sources: [],
                step: 'sources',
                loading: false,
                error: toAssessmentError(
                    error,
                    'sources',
                    'Failed to load the external source list. The assessment is blocked until the list can be shown.',
                ),
            }));
        }
    }, []);

    const startChallenge = useCallback(async () => {
        const domain = state.domain.trim().toLowerCase();

        if (!domain) {
            setState((prev) => ({
                ...prev,
                error: {
                    message: 'Enter a domain to begin.',
                    context: 'challenge',
                    status: null,
                    retryAfterSeconds: null,
                },
            }));
            return;
        }

        if (!state.authorizationConfirmed) {
            setState((prev) => ({
                ...prev,
                error: {
                    message:
                        'Confirm that you own or are authorized to assess this domain.',
                    context: 'challenge',
                    status: null,
                    retryAfterSeconds: null,
                },
            }));
            return;
        }

        setState((prev) => ({
            ...prev,
            domain,
            step: 'idle',
            loading: true,
            error: null,
            challenge: null,
            proofId: null,
            sources: [],
            consentConfirmed: false,
            report: null,
        }));

        try {
            const challenge = await createDomainChallenge({ domain });
            setState((prev) => ({
                ...prev,
                step: 'challenge',
                challenge,
                loading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                step: 'idle',
                loading: false,
                error: toAssessmentError(
                    error,
                    'challenge',
                    'Failed to create the verification challenge. Please try again.',
                ),
            }));
        }
    }, [state.domain, state.authorizationConfirmed]);

    const verifyOwnership = useCallback(async () => {
        const challenge = state.challenge;

        if (!challenge) {
            setState((prev) => ({
                ...prev,
                error: {
                    message: 'No ownership challenge is active. Start again.',
                    context: 'verify',
                    status: null,
                    retryAfterSeconds: null,
                },
            }));
            return;
        }

        setState((prev) => ({
            ...prev,
            step: 'verifying',
            loading: true,
            error: null,
        }));

        try {
            const result = await verifyDomainOwnership({
                domain: challenge.domain,
                token: challenge.token,
            });

            if (!result.verified || !result.proof_id) {
                setState((prev) => ({
                    ...prev,
                    step: 'challenge',
                    loading: false,
                    error: {
                        message:
                            result.message ||
                            'Ownership could not be verified. Confirm the TXT record is published and try again.',
                        context: 'verify',
                        status: null,
                        retryAfterSeconds: null,
                    },
                }));
                return;
            }

            setState((prev) => ({
                ...prev,
                proofId: result.proof_id ?? null,
            }));
            await loadSources();
        } catch (error) {
            setState((prev) => ({
                ...prev,
                step: 'challenge',
                loading: false,
                error: toAssessmentError(
                    error,
                    'verify',
                    'Verification failed. Confirm the TXT record is published and try again.',
                ),
            }));
        }
    }, [state.challenge, loadSources]);

    const backToChallenge = useCallback(() => {
        setState((prev) => ({
            ...prev,
            step: 'challenge',
            loading: false,
            error: null,
        }));
    }, []);

    const confirmSources = useCallback(async () => {
        if (!state.proofId) {
            setState((prev) => ({
                ...prev,
                error: {
                    message:
                        'Ownership proof is missing or expired. Verify ownership again.',
                    context: 'assessment',
                    status: 403,
                    retryAfterSeconds: null,
                },
            }));
            return;
        }

        if (!state.consentConfirmed) {
            setState((prev) => ({
                ...prev,
                error: {
                    message:
                        'Confirm that you understand which external services will receive the domain.',
                    context: 'assessment',
                    status: null,
                    retryAfterSeconds: null,
                },
            }));
            return;
        }

        setState((prev) => ({
            ...prev,
            step: 'assessing',
            loading: true,
            error: null,
        }));

        try {
            const report = await runAssessment({
                domain: state.challenge?.domain ?? state.domain,
                proof_id: state.proofId,
            });
            setState((prev) => ({
                ...prev,
                report,
                step: 'complete',
                loading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                step: 'sources',
                loading: false,
                error: toAssessmentError(
                    error,
                    'assessment',
                    'The assessment failed. You can retry without repeating ownership verification.',
                ),
            }));
        }
    }, [state.proofId, state.consentConfirmed, state.challenge, state.domain]);

    const retry = useCallback(() => {
        const context = state.error?.context;
        if (context === 'challenge') {
            void startChallenge();
        } else if (context === 'verify') {
            void verifyOwnership();
        } else if (context === 'sources') {
            void loadSources();
        } else if (context === 'assessment') {
            void confirmSources();
        }
    }, [state.error, startChallenge, verifyOwnership, loadSources, confirmSources]);

    const restartVerification = useCallback(() => {
        void startChallenge();
    }, [startChallenge]);

    return {
        state,
        setDomain,
        setAuthorizationConfirmed,
        setConsentConfirmed,
        startChallenge,
        verifyOwnership,
        loadSources,
        backToChallenge,
        confirmSources,
        reset,
        retry,
        restartVerification,
    } as const;
}
