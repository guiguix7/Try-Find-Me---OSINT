import type { ReactNode } from 'react';

export interface DefinitionItem {
    term: string;
    description: ReactNode;
}

export function DefinitionList({ items }: { items: DefinitionItem[] }) {
    return (
        <dl className="definition-list">
            {items.map((item) => (
                <div className="definition-list__row" key={item.term}>
                    <dt className="definition-list__term">{item.term}</dt>
                    <dd className="definition-list__desc">{item.description}</dd>
                </div>
            ))}
        </dl>
    );
}
