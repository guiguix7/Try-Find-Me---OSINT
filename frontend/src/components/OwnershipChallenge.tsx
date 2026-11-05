interface OwnershipChallengeProps {
    challenge: { domain: string; txt_record_name: string; txt_record_value: string; expires_at: string; ttl_seconds: number } | null;
    onVerify: () => void;
    onBack: () => void;
    token: string;
    onTokenChange: (value: string) => void;
    loading: boolean;
    error: string | null;
}

export function OwnershipChallenge({
    challenge,
    onVerify,
    onBack,
    token,
    onTokenChange,
    loading,
    error,
}: OwnershipChallengeProps) {
    if (!challenge) return null;

    return (
        <section aria-labelledby="challenge-heading" className="card">
            <h2 id="challenge-heading">Prove domain ownership</h2>

            <p className="description">
                To confirm you control <strong>{escapeHtml(challenge.domain)}</strong>,
                publish the following DNS TXT record:
            </p>

            <div className="txt-record">
                <div className="txt-field">
                    <label>Record name</label>
                    <div className="txt-value" title={escapeHtml(challenge.txt_record_name)}>
                        {escapeHtml(challenge.txt_record_name)}
                    </div>
                    <span className="txt-type">TXT</span>
                </div>

                <div className="txt-value-large" title={escapeHtml(challenge.txt_record_value)}>
                    {escapeHtml(challenge.txt_record_value)}
                </div>
                <button
                    type="button"
                    onClick={() => copyToClipboard(challenge.txt_record_value)}
                    className="button button-small copy-button"
                    title="Copy record value"
                >
                    Copy
                </button>
            </div>

            <p className="hint">
                Add this TXT record to your domain's DNS zone. Once published, enter
                the verification token below and click Verify. The token expires in
                {Math.round(challenge.ttl_seconds / 60)} minutes.
            </p>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="form">
                <div className="form-group">
                    <label htmlFor="verify-token">Verification token</label>
                    <input
                        id="verify-token"
                        type="text"
                        placeholder="Paste the token shown above"
                        value={token}
                        onChange={(e) => onTokenChange(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="off"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onBack} className="button button-outline">
                        Back
                    </button>
                    <button type="submit" disabled={loading || !token} className="button button-primary">
                        {loading ? 'Verifying…' : 'Verify ownership'}
                    </button>
                </div>
            </form>
        </section>
    );
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(() => {
        // Clipboard access may fail; the user can still copy manually
    });
}
