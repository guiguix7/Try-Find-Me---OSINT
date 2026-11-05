interface SourceItemProps {
    source: {
        module_id: string;
        source_name: string;
        source_url?: string;
        data_sent: string;
        purpose: string;
        reliability: 'low' | 'medium' | 'high';
        auth_required: boolean;
    };
}

export function SourceItem({ source }: SourceItemProps) {
    return (
        <div className="source-item" role="listitem">
            <div className="source-header">
                <h4>{escapeHtml(source.source_name)}</h4>
                <span className={`reliability reliability-${source.reliability}`}>
                    Reliability: {source.reliability}
                </span>
            </div>
            <p className="source-purpose">{escapeHtml(source.purpose)}</p>
            <p className="source-data">
                <strong>Data sent:</strong> {escapeHtml(source.data_sent)}
            </p>
            {source.source_url && (
                <p className="source-url">
                    <strong>Source:</strong>
                    <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                        {escapeHtml(source.source_url)}
                    </a>
                </p>
            )}
        </div>
    );
}

interface SourcesTransparencyProps {
    sources: {
        module_id: string;
        source_name: string;
        source_url?: string;
        data_sent: string;
        purpose: string;
        reliability: 'low' | 'medium' | 'high';
        auth_required: boolean;
    }[];
    confirmed: boolean;
    onConfirmChange: (checked: boolean) => void;
    onConfirm: () => void;
    loading: boolean;
}

export function SourcesTransparency({
    sources,
    confirmed,
    onConfirmChange,
    onConfirm,
    loading,
}: SourcesTransparencyProps) {
    return (
        <section aria-labelledby="sources-heading" className="card">
            <h2 id="sources-heading">External services that will be contacted</h2>

            <p className="description">
                Before starting the assessment, you should know which external
                public services will receive your domain information, what data
                is sent, and why. These services operate under their own privacy
                policies and may independently log requests.
            </p>

            <ul role="list" className="source-list">
                {sources.map((source, index) => (
                    <SourceItem key={index} source={source} />
                ))}
            </ul>

            <p className="notice">
                <strong>Transparency notice:</strong> Running this assessment
                sends your domain name to the public services listed above. The
                application does not store your domain or results, but external
                services may log requests under their own policies.
            </p>

            <div className="form-group authorization">
                <label>
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => onConfirmChange(e.target.checked)}
                        required
                        disabled={loading}
                    />
                    <span>
                        I understand and consent to my domain being sent to the
                        external services listed above.
                    </span>
                </label>
            </div>

            <button
                type="button"
                onClick={onConfirm}
                disabled={loading || !confirmed}
                className="button button-primary"
            >
                {loading ? 'Starting assessment…' : 'Start passive assessment'}
            </button>
        </section>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
