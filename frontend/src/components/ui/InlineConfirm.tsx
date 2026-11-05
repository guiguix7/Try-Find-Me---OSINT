import { useState } from 'react';
import { Button } from './Button';

interface InlineConfirmProps {
    triggerLabel: string;
    prompt: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
}

export function InlineConfirm({
    triggerLabel,
    prompt,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
}: InlineConfirmProps) {
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <Button
                variant="danger"
                size="sm"
                icon="trash"
                onClick={() => setOpen(true)}
            >
                {triggerLabel}
            </Button>
        );
    }

    return (
        <span className="inline-confirm" role="group" aria-label={prompt}>
            <span className="inline-confirm__prompt">{prompt}</span>
            <Button
                variant="danger"
                size="sm"
                onClick={() => {
                    setOpen(false);
                    onConfirm();
                }}
            >
                {confirmLabel}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                {cancelLabel}
            </Button>
        </span>
    );
}
