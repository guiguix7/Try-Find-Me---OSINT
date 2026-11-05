// Assessment state machine hook.
// Manages the multi-step domain assessment flow:
// idle -> challenge -> verifying -> sources -> assessing -> complete
// with error handling at every step.

import { useState, useCallback } from 'react';
import type {
    DomainChallengeResponse,
    DomainVerifyResponse,
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
    | 'complete'
    | 'error';

interface AssessmentState {
    step: AssessmentStep;
    domain: string;
    authorizationConfirmed: boolean;
    challenge: DomainChallengeResponse | null;
    verifyResult: DomainVerifyResponse | null;
    proofId: string | null;
    sources: SourceInfo[];
    report: Report | null;
    loading: boolean;
    error: string | null;
    errorStatus: number | null;
}

const initialState: AssessmentState = {
    step: 'idle',
    domain: '',
    authorizationConfirmed: false,
    challenge: null,
    verifyResult: null,
    proofId: null,
    sources: [],
    report: null,
    loading: false,
    error: null,
    errorStatus: null,
};

export function useAssessment() {
    const [state, setState] = useState<AssessmentState>(initialState);
    const [token, setToken] = useState('');

    const reset = useCallback(() => {
        setState(initialState);
        setToken('');
    }, []);

    const setDomain = useCallback((domain: string) => {
        setState((prev) => ({
            ...prev,
            domain: domain.trim().toLowerCase(),
            error: null,
        }));
    }, []);

    const setAuthorizationConfirmed = useCallback((checked: boolean) => {
        setState((prev) => ({ ...prev, authorizationConfirmed: checked }));
    }, []);

    const setTokenValue = useCallback((value: string) => {
        setToken(value);
    }, []);

    const startChallenge = useCallback(async () => {
        if (!state.domain) return;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const challenge = await createDomainChallenge({ domain: state.domain });
            setState((prev) => ({
                ...prev,
                step: 'challenge',
                challenge,
                loading: false,
            }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                step: 'error',
                loading: false,
                error: err instanceof ApiError
                    ? err.message
                    : 'Failed to create verification challenge. Please try again.',
                errorStatus: err instanceof ApiError ? err.status : null,
            }));
        }
    }, [state.domain]);

    const verifyOwnership = useCallback(async () => {
        if (!state.domain || !token) return;

        setState((prev) => ({ ...prev, loading: true, error: null, step: 'verifying' }));

        try {
            const result = await verifyDomainOwnership({ domain: state.domain, token });

            if (result.verified && result.proof_id) {
                const sources = await listSources();
                setState((prev) => ({
                    ...prev,
                    verifyResult: result,
                    proofId: result.proof_id ?? null,
                    sources,
                    step: 'sources',
                    loading: false,
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    step: 'error',
                    loading: false,
                    error: result.message || 'Domain verification failed.',
                    errorStatus: null,
                }));
            }
        } catch (err) {
            setState((prev) => ({
                ...prev,
                step: 'error',
                loading: false,
                error: err instanceof ApiError
                    ? err.message
                    : 'Verification failed. Please try again.',
                errorStatus: err instanceof ApiError ? err.status : null,
            }));
        }
    }, [state.domain, token]);

    const goBackToChallenge = useCallback(() => {
        setState((prev) => ({ ...prev, step: 'challenge', error: null }));
    }, []);

    const confirmSources = useCallback(async () => {
        if (!state.proofId || !state.domain) return;

        setState((prev) => ({ ...prev, loading: true, error: null, step: 'assessing' }));

        try {
            const report = await runAssessment({
                domain: state.domain,
                proof_id: state.proofId,
            });
            setState((prev) => ({
                ...prev,
                report,
                step: 'complete',
                loading: false,
            }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                step: 'error',
                loading: false,
                error: err instanceof ApiError
                    ? err.message
                    : 'Assessment failed. Please try again.',
                errorStatus: err instanceof ApiError ? err.status : null,
            }));
        }
    }, [state.domain, state.proofId]);

    return {
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
    } as const;
}
