// API service layer for Try Find Me! frontend.
// All calls go to the backend API. Values from the API are treated as
// untrusted and rendered as text by React; never injected as HTML.

import type {
    DomainChallengeRequest,
    DomainChallengeResponse,
    DomainVerifyRequest,
    DomainVerifyResponse,
    AssessmentRequest,
    Report,
    SourceInfo,
    HealthResponse,
    ErrorResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

class ApiError extends Error {
    status: number;
    requestId?: string;
    retryAfterSeconds?: number;

    constructor(
        message: string,
        status: number,
        requestId?: string,
        retryAfterSeconds?: number,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.requestId = requestId;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

function parseRetryAfter(response: Response): number | undefined {
    const raw = response.headers.get('retry-after');
    if (!raw) return undefined;
    const seconds = Number.parseInt(raw, 10);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ErrorResponse | null = null;
        try {
            errorData = (await response.json()) as ErrorResponse;
        } catch {
            // Ignore JSON parse errors on error responses
        }

        const message =
            errorData?.message ??
            errorData?.error ??
            `API request failed: ${response.status}`;

        throw new ApiError(
            message,
            response.status,
            errorData?.request_id,
            parseRetryAfter(response),
        );
    }

    return (await response.json()) as T;
}

export async function getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<HealthResponse>(response);
}

export async function createDomainChallenge(
    data: DomainChallengeRequest,
): Promise<DomainChallengeResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/ownership/domain/challenge`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        },
    );
    return handleResponse<DomainChallengeResponse>(response);
}

export async function verifyDomainOwnership(
    data: DomainVerifyRequest,
): Promise<DomainVerifyResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/ownership/domain/verify`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        },
    );
    return handleResponse<DomainVerifyResponse>(response);
}

export async function listSources(): Promise<SourceInfo[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/sources`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<SourceInfo[]>(response);
}

export async function runAssessment(
    data: AssessmentRequest,
): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/api/v1/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<Report>(response);
}

export { ApiError };
