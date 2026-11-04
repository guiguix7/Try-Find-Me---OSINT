
import { useState, type FormEvent } from 'react'
import {
  createAudit,
  getAudit,
} from './services/api'
import type { AuditResponse } from './services/api'
import './App.css'

function App() {
  const [target, setTarget] = useState('')
  const [authorizationConfirmed, setAuthorizationConfirmed] =
    useState(false)

  const [audit, setAudit] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreateAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)
    setAudit(null)

    try {
      const result = await createAudit({
        target: target.trim(),
        asset_type: 'domain',
        authorization_confirmed: authorizationConfirmed,
      })

      setAudit(result)
      setMessage('Audit created successfully.')
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGetAudit() {
    if (!audit) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await getAudit(audit.id)

      setAudit(result)
      setMessage('Audit retrieved successfully.')
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Unknown error occurred.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Try Find Me! — OSINT</h1>

      <section>
        <h2>Create an audit</h2>

        <form onSubmit={handleCreateAudit}>
          <div>
            <label htmlFor="target">Domain</label>

            <input
              id="target"
              type="text"
              placeholder="example.com"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              required
              minLength={4}
              maxLength={253}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={authorizationConfirmed}
                onChange={(event) =>
                  setAuthorizationConfirmed(event.target.checked)
                }
                required
              />
              I confirm that I own this domain or have explicit authorization
              to audit it.
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Start audit'}
          </button>
        </form>
      </section>

      {message && <p role="status">{message}</p>}

      {error && <p role="alert">Error: {error}</p>}

      {audit && (
        <section>
          <h2>Audit details</h2>

          <p><strong>ID:</strong> {audit.id}</p>
          <p><strong>Target:</strong> {audit.target}</p>
          <p><strong>Asset type:</strong> {audit.asset_type}</p>
          <p><strong>Status:</strong> {audit.status}</p>
          <p><strong>Mode:</strong> {audit.mode}</p>
          <p><strong>Created at:</strong> {audit.created_at}</p>

          <button
            type="button"
            onClick={handleGetAudit}
            disabled={loading}
          >
            Refresh audit
          </button>
        </section>
      )}
    </main>
  )
}

export default App
