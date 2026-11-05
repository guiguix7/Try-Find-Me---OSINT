interface EvidenceItemProps {
    evidence: {
        source_name: string;
        evidence_type: string;
        match_type: string;
        confidence: string;
        risk?: string;
        recommendation?: string;
        message: string;
        retrieved_at: string;
        source_url?: string;
        data: Record<string, unknown>;
    };
}

export function EvidenceItem({ evidence }: EvidenceItemProps) {
    const riskColor = evidence.risk ? `risk-${evidence.risk}` : 'risk-none';

    return (
        <article className="evidence-item">
            <div className="evidence-header">
                <h4>{escapeHtml(evidence.source_name)}</h4>
                <span className={`badge ${riskColor}`}>
                    {escapeHtml(evidence.risk ?? '—')}
                </span>
            </div>

            <div className="evidence-meta">
                <span className="meta-item">
                    <strong>Type:</strong> {escapeHtml(evidence.evidence_type)}
                </span>
                <span className="meta-item">
                    <strong>Match:</strong> {escapeHtml(evidence.match_type)}
                </span>
                <span className="meta-item">
                    <strong>Confidence:</strong> {escapeHtml(evidence.confidence)}
                </span>
                <span className="meta-item">
                    <strong>Retrieved:</strong> {escapeHtml(evidence.retrieved_at)}
                </span>
            </div>

            <p className="evidence-message">{escapeHtml(evidence.message)}</p>

            {evidence.source_url && (
                <p className="evidence-source">
                    <strong>Source:</strong>
                    <a
                        href={evidence.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {escapeHtml(evidence.source_url)}
                    </a>
                </p>
            )}

            {evidence.recommendation && (
                <div className="evidence-recommendation">
                    <strong>Recommendation:</strong>
                    <p>{escapeHtml(evidence.recommendation)}</p>
                </div>
            )}

            {Object.keys(evidence.data).length > 0 && (
                <details className="evidence-data">
                    <summary>Raw data</summary>
                    <pre>{JSON.stringify(evidence.data, null, 2)}</pre>
                </details>
            )}
        </article>
    );
}

interface EvidenceListProps {
    evidence: {
        source_name: string;
        evidence_type: string;
        match_type: string;
        confidence: string;
        risk?: string;
        recommendation?: string;
        message: string;
        retrieved_at: string;
        source_url?: string;
        data: Record<string, unknown>;
    }[];
}

export function EvidenceList({ evidence }: EvidenceListProps) {
    if (evidence.length === 0) {
        return (
            <div className="empty-state" role="status">
                <p>No findings were returned from any source.</p>
            </div>
        );
    }

    return (
        <section className="evidence-list" aria-label="Assessment findings">
            {evidence.map((item, index) => (
                <EvidenceItem key={index} evidence={item} />
            ))}
        </section>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
