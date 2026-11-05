import { useId } from 'react';
import type { ReactNode } from 'react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
    description?: ReactNode;
    id?: string;
    disabled?: boolean;
    required?: boolean;
}

export function Checkbox({
    checked,
    onChange,
    label,
    description,
    id,
    disabled = false,
    required = false,
}: CheckboxProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;

    return (
        <label className="checkbox" htmlFor={inputId}>
            <input
                id={inputId}
                className="checkbox__input"
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                disabled={disabled}
                required={required}
                aria-describedby={descriptionId}
            />
            <span className="checkbox__content">
                <span className="checkbox__label">{label}</span>
                {description ? (
                    <span className="checkbox__description" id={descriptionId}>
                        {description}
                    </span>
                ) : null}
            </span>
        </label>
    );
}
