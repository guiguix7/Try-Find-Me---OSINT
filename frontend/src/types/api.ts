// TypeScript types mirroring backend/app/schemas
// These must stay in sync with the backend Pydantic schemas.

export type MatchType = 'exact' | 'partial' | 'inferred' | 'unverified_candidate';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type RiskCategory = 'low' | 'medium' | 'high';
export type ModuleStatusValue = 'running' | 'ok' | 'partial' | 'failed' | 'skipped';
export interface DomainChallengeRequest {
    domain: string;
}
export interface DomainChallengeResponse {
    domain: string;
    token: string;
    txt_record_name: string;
    txt_record_value: string;
    expires_at: string;
    ttl_seconds: number;
}
export interface DomainVerifyRequest {
    domain: string;
    token: string;
}
export interface DomainVerifyResponse {
    domain: string;
    verified: boolean;
    proof_id?: string;
    expires_at?: string;
    message: string;
}
export interface AssessmentRequest {
    domain: string;
    proof_id: string;
}
export interface Evidence {
    id: string;
    source_id: string;
    source_name: string;
    source_url?: string;
    retrieved_at: string;
    evidence_type: string;
    ownership_verified: boolean;
    match_type: MatchType;
    confidence: ConfidenceLevel;
    risk?: RiskCategory;
    risk_rule_id?: string;
    recommendation?: string;
    data: Record<string, unknown>;
    message: string;
}
export interface ModuleStatus {
    module_id: string;
    status: ModuleStatusValue;
    message: string;
    evidence_count: number;
}
export interface RiskCounts {
    low: number;
    medium: number;
    high: number;
    info: number;
}
export interface Report {
    asset: string;
    generated_at: string;
    ownership_method: string;
    ownership_expires_at?: string;
    module_status: ModuleStatus[];
    evidence: Evidence[];
    risk_counts: RiskCounts;
    limitations: string[];
    sources_consulted: Array<{
        module_id: string;
        source_name: string;
        status: string;
    }>;
}
export interface SourceInfo {
    module_id: string;
    source_name: string;
    source_url?: string;
    data_sent: string;
    purpose: string;
    reliability: 'low' | 'medium' | 'high';
    auth_required: boolean;
}
export interface ErrorResponse {
    error: string;
    message: string;
    request_id?: string;
}
export interface HealthResponse {
    status: string;
}
