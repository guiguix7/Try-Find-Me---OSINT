import type { RiskCounts, Report } from '../types/api';
import {
    describeEvidenceData,
    formatTimestamp,
    ownershipLabel,
    uniqueRecommendations,
} from '../lib/format';
import { EvidenceCard } from './EvidenceCard';
import { ModuleStatusList } from './ModuleStatusList';
import {
    Alert,
    Badge,
    Button,
    DefinitionList,
    EmptyState,
    InlineConfirm,
    Panel,
} from './ui';

interface ReportViewProps {
    report: Report;
    onDiscard: () => void;
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
    subdomain_certificate_entry: 'Certificate transparency entries',
    dns_record: 'DNS records',
    registration_info: 'Registration information',
};

const MODULE_NAMES: Record<string, string> = {
    ct_subdomains: 'Certificate transparency',
    dns_records: 'Public DNS',
    rdap_registration: 'RDAP registration',
};

function moduleName(moduleId: string): string {
    return MODULE_NAMES[moduleId] ?? moduleId;
}

function sourceStatusLabel(status: string): string {
    switch (status) {
        case 'ok':
            return 'Completed';
        case 'partial':
            return 'Partial results';
        case 'failed':
            return 'Source unavailable';
        case 'skipped':
            return 'Skipped';
        default:
            return status;
    }
}

function RiskGrid({ counts }: { counts: RiskCounts }) {
    const cards = [
        {
            key: 'low',
            label: 'Low',
            count: counts.low,
            description: 'Limited-sensitivity public information.',
        },
        {
            key: 'medium',
            label: 'Medium',
            count: counts.medium,
            description: 'Exposure that increases privacy risk.',
        },
        {
            key: 'high',
            label: 'High',
            count: counts.high,
            description: 'Sensitive exposure with a credible security implication.',
        },
        {
            key: 'info',
            label: 'Informational',
            count: counts.info,
            description: 'Contextual information without a risk category.',
        },
    ];

    return (
        <div className="risk-grid">
            {cards.map((card) => (
                <div
                    className={`risk-card risk-card--${card.key}`}
                    key={card.key}
                >
                    <span className="risk-card__count">{card.count}</span>
                    <span className="risk-card__label">{card.label}</span>
                    <span className="risk-card__desc">
                        {card.description}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function ReportView({ report, onDiscard }: ReportViewProps) {
    const evidenceGroups = new Map<string, typeof report.evidence>();
    for (const item of report.evidence) {
        const current = evidenceGroups.get(item.evidence_type) ?? [];
        current.push(item);
        evidenceGroups.set(item.evidence_type, current);
    }

    const recommendations = uniqueRecommendations(report.evidence);
    const failedModules = report.module_status.filter(
        (status) => status.status === 'failed' || status.status === 'partial',
    );
    const completedModules = report.module_status.filter(
        (status) => status.status === 'ok',
    ).length;

    return (
        <article className="report" aria-labelledby="report-title">
            <header className="report-header">
                <div>
                    <span className="eyebrow">Assessment report</span>
                    <h1 className="report-title" id="report-title">
                        {report.asset}
                    </h1>
                    <div className="report-meta">
                        <span className="report-meta__item">
                            Generated {formatTimestamp(report.generated_at)}
                        </span>
                        <span className="report-meta__item">
                            Ownership verified via{' '}
                            {ownershipLabel(report.ownership_method)}
                        </span>
                        {report.ownership_expires_at ? (
                            <span className="report-meta__item">
                                Proof valid until{' '}
                                {formatTimestamp(report.ownership_expires_at)}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="report-actions">
                    <Button
                        variant="secondary"
                        icon="print"
                        onClick={() => window.print()}
                    >
                        Print / Save as PDF
                    </Button>
                    <InlineConfirm
                        triggerLabel="Discard report"
                        prompt="Discard this report and clear the session?"
                        confirmLabel="Discard"
                        onConfirm={onDiscard}
                    />
                </div>
            </header>

            <nav className="report-nav" aria-label="Report sections">
                <a href="#report-overview">Overview</a>
                <a href="#report-risk">Risk summary</a>
                <a href="#report-discovery">Discovery</a>
                <a href="#report-evidence">Evidence</a>
                <a href="#report-intelligence">Intelligence</a>
                <a href="#report-protection">Protection</a>
                <a href="#report-sources">Sources &amp; limitations</a>
            </nav>

            <section
                className="report-section"
                id="report-overview"
                aria-labelledby="report-overview-title"
            >
                <div className="report-section__header">
                    <h2 id="report-overview-title">Overview</h2>
                </div>
                <Panel>
                    <DefinitionList
                        items={[
                            {
                                term: 'Asset',
                                description: (
                                    <span className="mono">{report.asset}</span>
                                ),
                            },
                            {
                                term: 'Ownership',
                                description: (
                                    <span className="cluster">
                                        <Badge tone="success" icon="check">
                                            Verified
                                        </Badge>
                                        <span>
                                            {ownershipLabel(
                                                report.ownership_method,
                                            )}
                                        </span>
                                    </span>
                                ),
                            },
                            {
                                term: 'Evidence items',
                                description: `${report.evidence.length}`,
                            },
                            {
                                term: 'Sources consulted',
                                description: `${report.sources_consulted.length}`,
                            },
                            {
                                term: 'Modules completed',
                                description: `${completedModules} of ${report.module_status.length}`,
                            },
                        ]}
                    />

                    <div className="callout">
                        <strong>Point-in-time assessment.</strong> Findings
                        reflect what the listed public sources returned at the
                        retrieval times shown below. An empty result does not
                        prove that no exposure exists.
                    </div>

                    {report.limitations.length > 0 ? (
                        <Alert tone="warning" title="Reported limitations">
                            <ul>
                                {report.limitations.map((limitation) => (
                                    <li key={limitation}>{limitation}</li>
                                ))}
                            </ul>
                        </Alert>
                    ) : (
                        <p className="muted text-sm">
                            No limitations were reported by the backend for this
                            assessment.
                        </p>
                    )}
                </Panel>
            </section>

            <section
                className="report-section"
                id="report-risk"
                aria-labelledby="report-risk-title"
            >
                <div className="report-section__header">
                    <h2 id="report-risk-title">Risk summary</h2>
                    <span className="report-section__count">
                        deterministic categories
                    </span>
                </div>
                <RiskGrid counts={report.risk_counts} />
                <p className="muted text-sm mt-3">
                    Risk categories are assigned by documented deterministic
                    rules. The rule ID and explanation for each finding are
                    shown in the evidence section. No numeric score is
                    calculated.
                </p>
            </section>

            <section
                className="report-section"
                id="report-discovery"
                aria-labelledby="report-discovery-title"
            >
                <div className="report-section__header">
                    <h2 id="report-discovery-title">Discovery</h2>
                    <span className="report-section__count">
                        {report.evidence.length} finding
                        {report.evidence.length === 1 ? '' : 's'}
                    </span>
                </div>

                {report.evidence.length === 0 ? (
                    <div className="stack">
                        {failedModules.length > 0 ? (
                            <Alert
                                tone="warning"
                                title="Some sources were unavailable"
                            >
                                No findings were returned by the sources that
                                completed. Treat missing results as unknown, not
                                as proof of absence.
                            </Alert>
                        ) : null}
                        <EmptyState icon="search" title="No results were returned">
                            The consulted sources returned no findings for this
                            assessment. This does not prove that no exposure
                            exists.
                        </EmptyState>
                    </div>
                ) : (
                    <div className="stack">
                        {Array.from(evidenceGroups.entries()).map(
                            ([type, items]) => {
                                const lines = Array.from(
                                    new Set(items.flatMap(describeEvidenceData)),
                                );
                                return (
                                    <Panel
                                        key={type}
                                        title={
                                            EVIDENCE_TYPE_LABELS[type] ?? type
                                        }
                                        actions={
                                            <span className="report-section__count">
                                                {items.length}
                                            </span>
                                        }
                                    >
                                        <ul className="stack stack--tight">
                                            {lines.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    </Panel>
                                );
                            },
                        )}
                    </div>
                )}
            </section>

            <section
                className="report-section"
                id="report-evidence"
                aria-labelledby="report-evidence-title"
            >
                <div className="report-section__header">
                    <h2 id="report-evidence-title">Evidence</h2>
                    <span className="report-section__count">
                        full evidence contract
                    </span>
                </div>

                {report.evidence.length === 0 ? (
                    <EmptyState title="No evidence items were returned">
                        There is nothing to display in this section for this
                        assessment.
                    </EmptyState>
                ) : (
                    <div>
                        {report.evidence.map((item, index) => (
                            <EvidenceCard
                                key={`${item.source_id}-${index}`}
                                evidence={item}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section
                className="report-section"
                id="report-intelligence"
                aria-labelledby="report-intelligence-title"
            >
                <div className="report-section__header">
                    <h2 id="report-intelligence-title">Intelligence</h2>
                    <span className="report-section__count">
                        how findings are interpreted
                    </span>
                </div>

                <Panel title="Classification methodology">
                    <DefinitionList
                        items={[
                            {
                                term: 'Exact',
                                description:
                                    'The evidence directly matches the verified asset or a published record.',
                            },
                            {
                                term: 'Partial',
                                description:
                                    'The evidence matches part of the asset or a related record.',
                            },
                            {
                                term: 'Inferred',
                                description:
                                    'The evidence suggests a relationship but does not directly prove it.',
                            },
                            {
                                term: 'Unverified candidate',
                                description:
                                    'A name or username match without independent proof of control. Never treated as confirmed ownership.',
                            },
                            {
                                term: 'Confidence',
                                description:
                                    'Confidence reflects source reliability, match strength and data freshness. It is not a statistical probability.',
                            },
                            {
                                term: 'Risk',
                                description:
                                    'Low, medium and high categories come from documented deterministic rules. Rule IDs are shown per finding. No numeric score is calculated.',
                            },
                        ]}
                    />
                </Panel>

                {report.evidence.length === 0 ? (
                    <EmptyState title="No findings to interpret">
                        Intelligence rules apply only to returned evidence.
                    </EmptyState>
                ) : (
                    <Panel title="Per-finding interpretation">
                        <div className="table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Source</th>
                                        <th scope="col">Match</th>
                                        <th scope="col">Confidence</th>
                                        <th scope="col">Ownership</th>
                                        <th scope="col">Rule</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.evidence.map((item, index) => (
                                        <tr
                                            key={`${item.source_id}-interpretation-${index}`}
                                        >
                                            <td>{item.source_name}</td>
                                            <td>{item.match_type}</td>
                                            <td>{item.confidence}</td>
                                            <td>
                                                {item.ownership_verified
                                                    ? 'Verified'
                                                    : 'Not verified'}
                                            </td>
                                            <td className="mono">
                                                {item.risk_rule_id ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                )}
            </section>

            <section
                className="report-section"
                id="report-protection"
                aria-labelledby="report-protection-title"
            >
                <div className="report-section__header">
                    <h2 id="report-protection-title">Protection</h2>
                    <span className="report-section__count">
                        {recommendations.length} recommendation
                        {recommendations.length === 1 ? '' : 's'}
                    </span>
                </div>

                {recommendations.length === 0 ? (
                    <EmptyState title="No recommendations were returned">
                        The sources did not return a recommended action for this
                        assessment.
                    </EmptyState>
                ) : (
                    <Panel>
                        <ol className="stack">
                            {recommendations.map((item) => (
                                <li key={item.recommendation}>
                                    <span>{item.recommendation}</span>
                                    <span className="muted text-xs">
                                        {' '}
                                        — {item.source}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        <div className="callout">
                            Recommendations are tied to specific findings. No
                            action is claimed to have been completed or
                            verified.
                        </div>
                    </Panel>
                )}
            </section>

            <section
                className="report-section"
                id="report-sources"
                aria-labelledby="report-sources-title"
            >
                <div className="report-section__header">
                    <h2 id="report-sources-title">
                        Sources &amp; limitations
                    </h2>
                </div>

                <Panel title="Sources consulted">
                    {report.sources_consulted.length === 0 ? (
                        <EmptyState title="No sources were recorded">
                            The backend did not report which sources were
                            consulted.
                        </EmptyState>
                    ) : (
                        <div className="table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Module</th>
                                        <th scope="col">Result note</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.sources_consulted.map(
                                        (source, index) => (
                                            <tr
                                                key={`${source.module_id}-${index}`}
                                            >
                                                <td>
                                                    {moduleName(
                                                        source.module_id,
                                                    )}
                                                </td>
                                                <td>{source.source_name}</td>
                                                <td>
                                                    {sourceStatusLabel(
                                                        source.status,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>

                <Panel title="Module status">
                    <ModuleStatusList statuses={report.module_status} />
                </Panel>

                <Panel title="Limitations">
                    {report.limitations.length === 0 ? (
                        <p className="muted text-sm">
                            No limitations were reported by the backend for this
                            assessment.
                        </p>
                    ) : (
                        <ul className="stack stack--tight">
                            {report.limitations.map((limitation) => (
                                <li key={limitation}>{limitation}</li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <div className="callout">
                    This report reflects a point-in-time passive assessment of
                    public sources. It never connects to the assessed domain.
                    Absence of findings does not prove absence of exposure.
                </div>
            </section>
        </article>
    );
}
