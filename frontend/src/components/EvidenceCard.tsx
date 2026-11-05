import type { Evidence } from '../types/api';
import {
    confidenceLabel,
    confidenceTone,
    formatTimestamp,
    matchLabel,
    matchTone,
    riskLabel,
    riskTone,
    safeHttpUrl,
} from '../lib/format';
import { Badge, DefinitionList, Icon } from './ui';
import type { IconName } from './ui';

interface EvidenceCardProps {
    evidence: Evidence;
    index: number;
}

function riskIcon(risk: Evidence['risk']): IconName {
    if (risk === 'high' || risk === 'medium') return 'alert';
    return 'info';
}

export function EvidenceCard({ evidence, index }: EvidenceCardProps) {
    const titleId = `evidence-title-${index}`;
    const sourceUrl = safeHttpUrl(evidence.source_url);

    return (
        <article className="evidence-card" aria-labelledby={titleId}>
            <header className="evidence-card__header">
                <div className="evidence-card__title">
                    <span className="evidence-card__source" id={titleId}>
                        {evidence.source_name}
                    </span>
                    <span className="evidence-card__type">
                        {evidence.evidence_type}
                    </span>
                    {sourceUrl ? (
                        <a
                            className="source-card__link"
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Source reference
                            <Icon name="external" size={12} />
                            <span className="sr-only">
                                {' '}
                                (opens in a new tab)
                            </span>
                        </a>
                    ) : null}
                </div>
                <div className="evidence-card__badges">
                    <Badge tone={riskTone(evidence.risk)} icon={riskIcon(evidence.risk)}>
                        {riskLabel(evidence.risk)}
                    </Badge>
                    <Badge tone={matchTone(evidence.match_type)}>
                        {matchLabel(evidence.match_type)}
                    </Badge>
                    <Badge tone={confidenceTone(evidence.confidence)}>
                        {confidenceLabel(evidence.confidence)}
                    </Badge>
                    <Badge
                        tone={
                            evidence.ownership_verified ? 'success' : 'neutral'
                        }
                        icon={evidence.ownership_verified ? 'check' : 'alert'}
                    >
                        {evidence.ownership_verified
                            ? 'Ownership verified'
                            : 'Ownership not verified'}
                    </Badge>
                </div>
            </header>

            <div className="evidence-card__body">
                <p className="evidence-card__message">{evidence.message}</p>

                <DefinitionList
                    items={[
                        {
                            term: 'Retrieved at',
                            description: formatTimestamp(
                                evidence.retrieved_at,
                            ),
                        },
                        {
                            term: 'Rule ID',
                            description: evidence.risk_rule_id ? (
                                <span className="mono">
                                    {evidence.risk_rule_id}
                                </span>
                            ) : (
                                'No rule ID reported'
                            ),
                        },
                    ]}
                />

                {evidence.recommendation ? (
                    <div className="evidence-card__recommendation">
                        <strong>Recommended action.</strong>{' '}
                        {evidence.recommendation}
                    </div>
                ) : null}
            </div>

            <details className="evidence-card__details">
                <summary>Raw evidence data (JSON)</summary>
                <pre className="code-block">
                    {JSON.stringify(evidence.data, null, 2)}
                </pre>
            </details>
        </article>
    );
}
