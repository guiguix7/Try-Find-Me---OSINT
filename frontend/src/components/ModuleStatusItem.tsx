interface ModuleStatusItemProps {
    module: {
        module_id: string;
        status: string;
        message: string;
        evidence_count: number;
    };
}

export function ModuleStatusItem({ module }: ModuleStatusItemProps) {
    const statusClass = `module-badge status-${module.status}`;

    return (
        <div className="module-status-item">
            <div className="module-header">
                <span className="module-name">{escapeHtml(module.module_id)}</span>
                <span className={statusClass}>{escapeHtml(module.status)}</span>
            </div>
            <p className="module-message">{escapeHtml(module.message)}</p>
            <span className="module-count">
                {module.evidence_count} finding(s)
            </span>
        </div>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
