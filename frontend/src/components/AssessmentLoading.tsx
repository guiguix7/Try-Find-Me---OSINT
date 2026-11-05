interface AssessmentLoadingProps {
    moduleStatuses: {
        module_id: string;
        status: string;
        message: string;
        evidence_count: number;
    }[];
}

export function AssessmentLoading({ moduleStatuses }: AssessmentLoadingProps) {
    return (
        <section aria-labelledby="loading-heading" className="card loading-card">
            <h2 id="loading-heading">Running passive assessment</h2>

            <p className="description">
                The platform is querying public sources for your domain. This is
                entirely passive — no active scanning or probing is performed.
            </p>

            <div className="spinner" role="status" aria-label="Loading"></div>

            <ul role="list" className="module-progress">
                {moduleStatuses.map((mod, index) => (
                    <li key={index} className="module-item">
                        <span className="module-name">{escapeHtml(mod.module_id)}</span>
                        <span className={`module-status ${mod.status}`}>
                            {escapeHtml(mod.status)}
                        </span>
                    </li>
                ))}
            </ul>

            <p className="hint">
                This may take up to 30 seconds depending on source availability.
            </p>
        </section>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
