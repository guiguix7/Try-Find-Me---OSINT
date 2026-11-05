import type { ReactNode, SVGProps } from 'react';

export type IconName =
    | 'shield'
    | 'search'
    | 'link'
    | 'check'
    | 'alert'
    | 'copy'
    | 'chevron'
    | 'arrow-left'
    | 'arrow-right'
    | 'print'
    | 'trash'
    | 'external'
    | 'clock'
    | 'info'
    | 'lock'
    | 'globe'
    | 'nodes';

const PATHS: Record<IconName, ReactNode> = {
    shield: (
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
        </>
    ),
    link: (
        <>
            <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
            <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
        </>
    ),
    check: <path d="M4 12l5 5L20 6" />,
    alert: (
        <>
            <path d="M12 3l9 16H3L12 3z" />
            <path d="M12 9v5" />
            <path d="M12 17h.01" />
        </>
    ),
    copy: (
        <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 012-2h10" />
        </>
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    'arrow-left': (
        <>
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
        </>
    ),
    'arrow-right': (
        <>
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
        </>
    ),
    print: (
        <>
            <path d="M6 9V3h12v6" />
            <rect x="6" y="14" width="12" height="7" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        </>
    ),
    trash: (
        <>
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </>
    ),
    external: (
        <>
            <path d="M14 3h7v7" />
            <path d="M21 3l-9 9" />
            <path d="M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
        </>
    ),
    globe: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 010 18" />
            <path d="M12 3a15 15 0 000 18" />
        </>
    ),
    nodes: (
        <>
            <circle cx="12" cy="12" r="2.5" />
            <circle cx="5" cy="5" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
            <path d="M6.6 6.6L10 10" />
            <path d="M17.4 6.6L14 10" />
            <path d="M6.6 17.4L10 14" />
            <path d="M17.4 17.4L14 14" />
        </>
    ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
    name: IconName;
    size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            {PATHS[name]}
        </svg>
    );
}
