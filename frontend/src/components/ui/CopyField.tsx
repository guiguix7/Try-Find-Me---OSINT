import { useState } from 'react';
import { Button } from './Button';

interface CopyFieldProps {
    label: string;
    value: string;
}

export function CopyField({ label, value }: CopyFieldProps) {
    const [status, setStatus] = useState<string | null>(null);

    const handleCopy = async () => {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard unavailable');
            }
            await navigator.clipboard.writeText(value);
            setStatus('Copied');
        } catch {
            setStatus('Copy failed — select the value and copy manually.');
        }
    };

    return (
        <div className="copy-field">
            <span className="copy-field__label">{label}</span>
            <div className="copy-field__control">
                <code className="copy-field__value">{value}</code>
                <Button
                    variant="secondary"
                    size="sm"
                    icon="copy"
                    onClick={handleCopy}
                    aria-label={`Copy ${label.toLowerCase()}`}
                >
                    Copy
                </Button>
            </div>
            <span className="copy-field__status" role="status" aria-live="polite">
                {status ?? ''}
            </span>
        </div>
    );
}
