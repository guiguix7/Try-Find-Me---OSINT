import { useEffect, useState } from 'react';

/**
 * Countdown to an ISO timestamp. Returns remaining whole seconds,
 * or null when no timestamp is available. Updates every second.
 */
export function useCountdown(expiresAt: string | undefined): number | null {
    const calculate = (): number | null => {
        if (!expiresAt) return null;
        const target = new Date(expiresAt).getTime();
        if (Number.isNaN(target)) return null;
        return Math.max(0, Math.floor((target - Date.now()) / 1000));
    };

    const [remaining, setRemaining] = useState<number | null>(calculate);

    useEffect(() => {
        setRemaining(calculate());
        if (!expiresAt) return;
        const interval = window.setInterval(() => {
            setRemaining(calculate());
        }, 1000);
        return () => window.clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiresAt]);

    return remaining;
}
