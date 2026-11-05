interface ReportViewProps {
    report: {
        asset: string;
        generated_at: string;
        ownership_method: string;
        ownership_expires_at?: string;
        module_status: {
            module_id: string;
            status: string;
            message: string;
            evidence_count: number;
        }[];
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
        risk_counts: { low: number; medium: number; high: number; info: number };
        limitations: string[];
        sources_consulted: {
            module_id: string;
            source_name: string;
            status: string;
        }[];
    };
    onDiscard: () => void;
}

export function ReportView({ report, onDiscard }: ReportViewProps) {
    const { risk_counts, evidence, module_status, limitations } = report;

    return (
        <section aria-labelledby="report-heading" className="card report-card">
            <h2 id="report-heading">Assessment report</h2>

            <div className="report-summary">
                <div className="summary-item">
                    <strong>Asset:</strong> {escapeHtml(report.asset)}
                </div>
                <div className="summary-item">
                    <strong>Generated:</strong> {escapeHtml(report.generated_at)}
                </div>
                <div className="summary-item">
                    <strong>Ownership method:</strong>
                    {escapeHtml(report.ownership_method)}
                </div>
                {report.ownership_expires_at && (
                    <div className="summary-item">
                        <strong>Ownership expires:</strong>
                        {escapeHtml(report.ownership_expires_at)}
                    </div>
                )}
            </div>

            <h3>Risk summary</h3>
            <div className="risk-summary">
                <div className="risk-count risk-low">
                    <span className="label">Low</span>
                    <span className="value">{risk_counts.low}</span>
                </div>
                <div className="risk-count risk-medium">
                    <span className="label">Medium</span>
                    <span className="value">{risk_counts.medium}</span>
                </div>
                <div className="risk-count risk-high">
                    <span className="label">High</span>
                    <span className="value">{risk_counts.high}</span>
                </div>
            </div>

            <h3>Sources consulted</h3>
            <ul className="source-consulted-list" role="list">
                {module_status.map((mod, index) => (
                    <li key={index} className="source-item">
                        <span className="source-name">{escapeHtml(mod.module_id)}</span>
                        <span className={`source-status status-${mod.status}`}>
                            {escapeHtml(mod.status)}
                        </span>
                        <span className="source-count">
                            {mod.evidence_count} evidence
                        </span>
                        <p className="source-note">{escapeHtml(mod.message)}</p>
                    </li>
                ))}
            </ul>

            <h3>Findings (Evidence)</h3>
            <EvidenceList evidence={evidence} />

            {limitations.length > 0 && (
                <div className="limitations">
                    <h3>Limitations of this assessment</h3>
                    <ul role="list">
                        {limitations.map((limit, index) => (
                            <li key={index}>{escapeHtml(limit)}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="report-actions">
                <button type="button" onClick={onDiscard} className="button button-outline">
                    Discard report
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="button button-outline"
                >
                    Print / Export to PDF
                </button>
            </div>
        </section>
    );
}

function EvidenceList({ evidence }: { evidence: ReportViewProps['report']['evidence'] }) {
    if (evidence.length === 0) {
        return (
            <div className="empty-state" role="status">
                <p>No findings were returned from any source.</p>
            </div>
        );
    }

    return (
        <div className="evidence-list">
            {evidence.map((item, index) => (
                <article key={index} className="evidence-item">
                    <div className="evidence-header">
                        <h4>{escapeHtml(item.source_name)}</h4>
                        <span className={`badge risk-${item.risk ?? 'none'}`}>
                            {escapeHtml(item.risk ?? '—')}
                        </span>
                    </div>
                    <p className="evidence-message">{escapeHtml(item.message)}</p>
                    <div className="evidence-meta">
                        <span className="meta-item">
                            <strong>Match:</strong> {escapeHtml(item.match_type)}
                        </span>
                        <span className="meta-item">
                            <strong>Confidence:</strong> {escapeHtml(item.confidence)}
                        </span>
                    </div>
                    {item.recommendation && (
                        <p className="evidence-rec">
                            <strong>Recommendation:</strong> {escapeHtml(item.recommendation)}
                        </p>
                    )}
                </article>
            ))}
        </div>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
