interface BrandMarkProps {
    className?: string;
    title?: string;
}

/**
 * Converging-nodes aperture mark:
 * discovery (outer nodes), evidence (connecting lines),
 * intelligence (centre), protection (outer arc).
 */
export function BrandMark({ className = 'brand__mark', title }: BrandMarkProps) {
    const decorative = !title;

    return (
        <svg
            viewBox="0 0 40 40"
            className={className}
            role={decorative ? undefined : 'img'}
            aria-hidden={decorative ? 'true' : undefined}
            aria-label={title}
            fill="none"
            focusable="false"
        >
            {title ? <title>{title}</title> : null}
            <path
                d="M5 27c1.6 4.4 5.9 7.5 11 7.5S25.4 31.4 27 27"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.55"
            />
            <path
                d="M20 7L9 29M20 7l11 22M9 29h22"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.35"
            />
            <circle cx="20" cy="7" r="2.4" fill="currentColor" />
            <circle cx="9" cy="29" r="2.4" fill="currentColor" />
            <circle cx="31" cy="29" r="2.4" fill="currentColor" />
            <circle
                cx="20"
                cy="21"
                r="4"
                fill="var(--bg-base)"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <circle cx="20" cy="21" r="1.5" fill="currentColor" />
        </svg>
    );
}
