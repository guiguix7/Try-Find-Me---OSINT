// Formatting and label helpers. No third-party dependencies.
import type {
    ConfidenceLevel,
    Evidence,
    MatchType,
    ModuleStatusValue,
    RiskCategory,
} from '../types/api';
import type { BadgeTone, StatusTone } from '../components/ui';

export function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    }).format(date);
}

export function formatRemaining(totalSeconds: number): string {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function safeHttpUrl(value: string | undefined): string | undefined {
    if (!value) return undefined;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
            ? parsed.href
            : undefined;
    } catch {
        return undefined;
    }
}

export function riskTone(risk: RiskCategory | undefined): BadgeTone {
    if (risk === 'high') return 'high';
    if (risk === 'medium') return 'medium';
    if (risk === 'low') return 'low';
    return 'info';
}

export function riskLabel(risk: RiskCategory | undefined): string {
    if (!risk) return 'Informational';
    return `${risk.charAt(0).toUpperCase()}${risk.slice(1)} risk`;
}

export function matchLabel(match: MatchType): string {
    switch (match) {
        case 'exact':
            return 'Exact match';
        case 'partial':
            return 'Partial match';
        case 'inferred':
            return 'Inferred';
        case 'unverified_candidate':
            return 'Unverified candidate';
    }
}

export function matchTone(match: MatchType): BadgeTone {
    if (match === 'exact') return 'success';
    if (match === 'partial') return 'warning';
    if (match === 'inferred') return 'info';
    return 'neutral';
}

export function confidenceLabel(confidence: ConfidenceLevel): string {
    return `${confidence.charAt(0).toUpperCase()}${confidence.slice(1)} confidence`;
}

export function confidenceTone(confidence: ConfidenceLevel): BadgeTone {
    if (confidence === 'high') return 'success';
    if (confidence === 'medium') return 'warning';
    return 'neutral';
}

export function moduleStatusLabel(status: ModuleStatusValue): string {
    switch (status) {
        case 'ok':
            return 'Completed';
        case 'partial':
            return 'Partial results';
        case 'failed':
            return 'Source unavailable';
        case 'skipped':
            return 'Skipped';
        case 'running':
            return 'Running';
    }
}

export function moduleStatusTone(status: ModuleStatusValue): StatusTone {
    switch (status) {
        case 'ok':
            return 'success';
        case 'partial':
            return 'warning';
        case 'failed':
            return 'danger';
        case 'skipped':
            return 'neutral';
        case 'running':
            return 'info';
    }
}

export function ownershipLabel(method: string): string {
    if (method === 'dns_txt') return 'DNS TXT record';
    return method;
}

/**
 * Produce short, human-readable discovery lines from an evidence item.
 * Handles the known Phase 1 module payload shapes defensively; unknown
 * shapes fall back to the evidence message.
 */
export function describeEvidenceData(evidence: Evidence): string[] {
    const data = evidence.data ?? {};

    if (evidence.evidence_type === 'dns_record') {
        const recordType = typeof data.record_type === 'string' ? data.record_type : null;
        const records = Array.isArray(data.records)
            ? data.records.filter((value): value is string => typeof value === 'string')
            : [];
        if (recordType && records.length > 0) {
            return [`${recordType}: ${records.join(', ')}`];
        }
    }

    if (evidence.evidence_type === 'subdomain_certificate_entry') {
        if (typeof data.domain === 'string') {
            return [data.domain];
        }
    }

    if (evidence.evidence_type === 'registration_info') {
        const lines: string[] = [];
        if (Array.isArray(data.nameservers) && data.nameservers.length > 0) {
            lines.push(`Nameservers: ${data.nameservers.join(', ')}`);
        }
        if (Array.isArray(data.status) && data.status.length > 0) {
            lines.push(`Status: ${data.status.join(', ')}`);
        }
        if (typeof data.registrationDate === 'string') {
            lines.push(`Registered: ${formatTimestamp(data.registrationDate)}`);
        }
        if (typeof data.expirationDate === 'string') {
            lines.push(`Expires: ${formatTimestamp(data.expirationDate)}`);
        }
        if (lines.length > 0) return lines;
    }

    return [evidence.message];
}

export function uniqueRecommendations(evidence: Evidence[]): Array<{
    recommendation: string;
    source: string;
}> {
    const seen = new Set<string>();
    const result: Array<{ recommendation: string; source: string }> = [];
    for (const item of evidence) {
        if (!item.recommendation) continue;
        const key = item.recommendation.trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        result.push({ recommendation: key, source: item.source_name });
    }
    return result;
}
