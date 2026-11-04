
const API_BASE_URL = 'http://127.0.0.1:8000'

export interface HealthResponse {
    status: string
}

export interface AuditCreate {
    target: string
    asset_type: 'domain'
    authorization_confirmed: boolean
}

export interface AuditResponse {
    id: string
    target: string
    asset_type: string
    status: string
    created_at: string
    mode: string
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message =
            typeof errorData?.detail === 'string'
                ? errorData.detail
                : `API request failed: ${response.status}`

        throw new Error(message)
    }

    return response.json() as Promise<T>
}

export async function getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`)
    return handleResponse<HealthResponse>(response)
}

export async function createAudit(
    data: AuditCreate,
): Promise<AuditResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/audits/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    return handleResponse<AuditResponse>(response)
}

export async function getAudit(
    auditId: string,
): Promise<AuditResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/audits/${encodeURIComponent(auditId)}`,
    )

    return handleResponse<AuditResponse>(response)
}
