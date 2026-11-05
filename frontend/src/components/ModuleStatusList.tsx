import type { ModuleStatus } from '../types/api';
import { moduleStatusLabel, moduleStatusTone } from '../lib/format';
import { EmptyState, StatusDot } from './ui';

const MODULE_NAMES: Record<string, string> = {
    ct_subdomains: 'Certificate transparency',
    dns_records: 'Public DNS',
    rdap_registration: 'RDAP registration',
};

function moduleName(moduleId: string): string {
    return MODULE_NAMES[moduleId] ?? moduleId;
}

export function ModuleStatusList({ statuses }: { statuses: ModuleStatus[] }) {
    if (statuses.length === 0) {
        return (
            <EmptyState title="No module status was reported">
                The backend did not return per-module status information.
            </EmptyState>
        );
    }

    return (
        <div>
            {statuses.map((status) => (
                <div className="module-row" key={status.module_id}>
                    <div className="module-row__name">
                        <span className="section-heading">
                            {moduleName(status.module_id)}
                        </span>
                        <span className="module-row__id">
                            {status.module_id}
                        </span>
                        <span className="module-row__message">
                            {status.message}
                        </span>
                    </div>
                    <div className="cluster">
                        <StatusDot
                            tone={moduleStatusTone(status.status)}
                            label={moduleStatusLabel(status.status)}
                        />
                        <span className="text-xs muted">
                            {status.evidence_count} evidence item
                            {status.evidence_count === 1 ? '' : 's'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
