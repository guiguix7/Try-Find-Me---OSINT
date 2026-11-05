interface DomainInputProps {
    domain: string;
    onDomainChange: (value: string) => void;
    authorizationConfirmed: boolean;
    onAuthorizationChange: (checked: boolean) => void;
    onSubmit: () => void;
    loading: boolean;
    error: string | null;
}

export function DomainInput({
    domain,
    onDomainChange,
    authorizationConfirmed,
    onAuthorizationChange,
    onSubmit,
    loading,
    error,
}: DomainInputProps) {
    return (
        <section aria-labelledby="domain-heading" className="card">
            <h2 id="domain-heading">Enter a domain to assess</h2>

            <p className="description">
                This platform performs authorized, passive digital exposure
                assessments for domains you own or are explicitly authorized to
                assess. All lookups use public sources only — no active scanning,
                no people search, no invasive collection.
            </p>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="form">
                <div className="form-group">
                    <label htmlFor="domain-input">Domain name</label>
                    <input
                        id="domain-input"
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => onDomainChange(e.target.value)}
                        required
                        minLength={4}
                        maxLength={253}
                        autoComplete="off"
                        spellCheck="false"
                        disabled={loading}
                    />
                    <p className="hint">
                        Enter only the domain (e.g., example.com), not a full URL.
                    </p>
                </div>

                <div className="form-group authorization">
                    <label>
                        <input
                            type="checkbox"
                            checked={authorizationConfirmed}
                            onChange={(e) => onAuthorizationChange(e.target.checked)}
                            required
                            disabled={loading}
                        />
                        <span>
                            I confirm that I own this domain or have explicit
                            authorization to assess it.
                        </span>
                    </label>
                </div>

                <button type="submit" disabled={loading || !authorizationConfirmed} className="button button-primary">
                    {loading ? 'Starting assessment…' : 'Start assessment'}
                </button>
            </form>
        </section>
    );
}
