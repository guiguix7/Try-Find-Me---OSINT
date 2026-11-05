import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
    error?: string;
    mono?: boolean;
    requiredIndicator?: boolean;
}

export function TextField({
    label,
    hint,
    error,
    mono = false,
    requiredIndicator = false,
    id,
    className = '',
    ...rest
}: TextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`field ${className}`.trim()}>
            <label className="field__label" htmlFor={inputId}>
                {label}
                {requiredIndicator ? (
                    <span className="field__required" aria-hidden="true">
                        {' '}
                        *
                    </span>
                ) : null}
            </label>
            <div className="field__control">
                <input
                    id={inputId}
                    className={`field__input${mono ? ' mono' : ''}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    {...rest}
                />
            </div>
            {hint ? (
                <span className="field__hint" id={hintId}>
                    {hint}
                </span>
            ) : null}
            {error ? (
                <span className="field__error" id={errorId}>
                    {error}
                </span>
            ) : null}
        </div>
    );
}
