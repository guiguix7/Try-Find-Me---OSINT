import { useEffect, useState } from 'react'
import { getHealth } from './services/api'
import type { HealthResponse } from './services/api'
import './App.css'

type ConnectionState = 'checking' | 'connected' | 'error'

function App() {
  const [connection, setConnection] = useState<ConnectionState>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHealth()
      .then((data) => {
        setHealth(data)
        setConnection('connected')
      })
      .catch((error: unknown) => {
        setError(
          error instanceof Error ? error.message : 'Unknown connection error',
        )
        setConnection('error')
      })
  }, [])

  return (
    <main>
      <h1>Try Find Me! — OSINT</h1>

      <h2>Backend connection</h2>

      {connection === 'checking' && <p>Checking API connection...</p>}

      {connection === 'connected' && (
        <p>API connected — Status: {health?.status}</p>
      )}

      {connection === 'error' && <p>Connection failed: {error}</p>}
    </main>
  )
}

export default App