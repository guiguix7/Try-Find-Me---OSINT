interface OwnershipVerifyProps {
    verified: boolean;
    message: string;
    onBack: () => void;
}

export function OwnershipVerify({ verified, message, onBack }: OwnershipVerifyProps) {
    return (
        <section aria-labelledby="verify-heading" className="card">
            <h2 id="verify-heading">
                {verified ? 'Ownership verified' : 'Verification failed'}
            </h2>

            <div className={verified ? 'status success' : 'status failure'}>
                {verified ? '✓' : '✗'}
                <span>{message}</span>
            </div>

            {verified ? (
                <p className="hint">
                    Domain ownership has been confirmed via DNS TXT. You can now
                    proceed with the passive assessment.
                </p>
            ) : (
                <p className="hint">
                    If you believe the TXT record is published correctly, DNS
                    propagation may take time. Wait a moment and try again.
                </p>
            )}

            <div className="actions">
                <button type="button" onClick={onBack} className="button">
                    {verified ? 'Continue to sources' : 'Try again'}
                </button>
            </div>
        </section>
    );
}
