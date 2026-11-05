import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as api from '../services/api'

vi.mock('../services/api', () => {
  class ApiError extends Error {
    status: number
    requestId?: string
    retryAfterSeconds?: number

    constructor(
      message: string,
      status: number,
      requestId?: string,
      retryAfterSeconds?: number,
    ) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.requestId = requestId
      this.retryAfterSeconds = retryAfterSeconds
    }
  }

  return {
    createDomainChallenge: vi.fn(),
    verifyDomainOwnership: vi.fn(),
    listSources: vi.fn(),
    runAssessment: vi.fn(),
    getHealth: vi.fn(),
    ApiError,
  }
})

const challenge = {
  domain: 'example.com',
  token: 'tok123',
  txt_record_name: '_tryfindme-verification.example.com',
  txt_record_value: 'tok123.sig',
  expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  ttl_seconds: 900,
}

const verified = {
  domain: 'example.com',
  verified: true,
  proof_id: 'proof-1',
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  message: 'Domain ownership verified successfully.',
}

const sources = [
  {
    module_id: 'ct_subdomains',
    source_name: 'crt.sh',
    source_url: 'https://crt.sh/',
    data_sent: 'domain name',
    purpose: 'Passive subdomain discovery.',
    reliability: 'medium' as const,
    auth_required: false,
  },
]

const report = {
  asset: 'example.com',
  generated_at: '2026-01-01T00:00:00Z',
  ownership_method: 'dns_txt',
  ownership_expires_at: '2026-01-01T01:00:00Z',
  module_status: [
    {
      module_id: 'ct_subdomains',
      status: 'ok' as const,
      message: 'Certificate transparency query completed.',
      evidence_count: 1,
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      source_id: 'ct_subdomains',
      source_name: 'crt.sh',
      source_url: 'https://crt.sh/',
      retrieved_at: '2026-01-01T00:00:00Z',
      evidence_type: 'subdomain_certificate_entry',
      ownership_verified: false,
      match_type: 'inferred' as const,
      confidence: 'medium' as const,
      risk: 'low' as const,
      risk_rule_id: 'ct.subdomain.default',
      recommendation: 'Review the subdomain.',
      data: { domain: 'sub.example.com' },
      message: 'Subdomain sub.example.com found.',
    },
  ],
  risk_counts: { low: 1, medium: 0, high: 0, info: 0 },
  limitations: ['Public sources only.'],
  sources_consulted: [
    { module_id: 'ct_subdomains', source_name: 'crt.sh', status: 'ok' },
  ],
}

async function submitDomain(domain = 'example.com') {
  fireEvent.change(screen.getByLabelText(/^domain/i), {
    target: { value: domain },
  })
  fireEvent.click(screen.getByLabelText(/i own this domain/i))
  fireEvent.click(
    screen.getByRole('button', { name: /begin ownership verification/i }),
  )
  await screen.findByRole('heading', {
    name: new RegExp(`prove control of ${domain.replace(/\./g, '\\.')}`, 'i'),
  })
}

async function reachSources() {
  vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
  vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
  vi.mocked(api.listSources).mockResolvedValue(sources)
  render(<App />)
  await submitDomain()
  fireEvent.click(
    screen.getByRole('button', { name: /published the record/i }),
  )
  await screen.findByRole('heading', { name: /review who will receive/i })
}

function consentCheckbox() {
  return screen.getByLabelText(/i understand these third-party services/i)
}

describe('App - full assessment flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial domain form inside the app shell', () => {
    render(<App />)

    expect(screen.getByLabelText(/^domain/i)).toBeInTheDocument()
    expect(screen.getAllByText(/try find me/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/local environment/i)).toBeInTheDocument()
    expect(screen.getByText(/passive mode/i)).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: /assessment progress/i }),
    ).toBeInTheDocument()
  })

  it('creates a challenge and keeps the token out of user input', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    render(<App />)

    await submitDomain()

    expect(screen.getByText(challenge.txt_record_name)).toBeInTheDocument()
    expect(screen.getByText(challenge.txt_record_value)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('verifies with the challenge token automatically', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
    vi.mocked(api.listSources).mockResolvedValue(sources)
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )

    await screen.findByRole('heading', { name: /review who will receive/i })
    expect(api.verifyDomainOwnership).toHaveBeenCalledWith({
      domain: 'example.com',
      token: 'tok123',
    })
  })

  it('requires consent before running the assessment', async () => {
    await reachSources()

    expect(consentCheckbox()).not.toBeChecked()
    expect(
      screen.getByRole('button', { name: /run passive assessment/i }),
    ).toBeDisabled()

    fireEvent.click(consentCheckbox())
    expect(consentCheckbox()).toBeChecked()
    expect(
      screen.getByRole('button', { name: /run passive assessment/i }),
    ).toBeEnabled()
  })

  it('runs the assessment and renders the report, then discards it', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
    vi.mocked(api.listSources).mockResolvedValue(sources)
    vi.mocked(api.runAssessment).mockResolvedValue(report)
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )
    await screen.findByRole('heading', { name: /review who will receive/i })
    fireEvent.click(consentCheckbox())
    fireEvent.click(
      screen.getByRole('button', { name: /run passive assessment/i }),
    )

    await screen.findByRole('heading', { name: 'example.com', level: 1 })
    expect(api.runAssessment).toHaveBeenCalledWith({
      domain: 'example.com',
      proof_id: 'proof-1',
    })
    expect(screen.getByText(/assessment report/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /discard report/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))

    expect(screen.getByLabelText(/^domain/i)).toHaveValue('')
    expect(
      screen.queryByText(/assessment report/i),
    ).not.toBeInTheDocument()
  })

  it('keeps the challenge intact when verification fails and retries it', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue({
      domain: 'example.com',
      verified: false,
      message: 'TXT record not found.',
    })
    vi.mocked(api.listSources).mockResolvedValue(sources)
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/ownership verification failed/i)
    expect(alert).toHaveTextContent(/txt record not found/i)
    expect(screen.getByText(challenge.txt_record_value)).toBeInTheDocument()
    expect(api.listSources).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(() =>
      expect(api.verifyDomainOwnership).toHaveBeenCalledTimes(2),
    )
    expect(vi.mocked(api.verifyDomainOwnership).mock.calls[1][0]).toEqual({
      domain: 'example.com',
      token: 'tok123',
    })
  })

  it('blocks the assessment when the source registry fails, then recovers', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
    vi.mocked(api.listSources).mockRejectedValueOnce(
      new api.ApiError('The source registry is offline.', 503),
    )
    vi.mocked(api.listSources).mockResolvedValue(sources)
    vi.mocked(api.runAssessment).mockResolvedValue(report)
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/external source list unavailable/i)
    expect(consentCheckbox()).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /run passive assessment/i }),
    ).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByText('crt.sh')).toBeInTheDocument()
    expect(consentCheckbox()).toBeEnabled()
    expect(api.runAssessment).not.toHaveBeenCalled()
  })

  it('retries a failed assessment with the same ownership proof', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
    vi.mocked(api.listSources).mockResolvedValue(sources)
    vi.mocked(api.runAssessment).mockRejectedValueOnce(
      new api.ApiError('The assessment backend failed.', 500),
    )
    vi.mocked(api.runAssessment).mockResolvedValue(report)
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )
    await screen.findByRole('heading', { name: /review who will receive/i })
    fireEvent.click(consentCheckbox())
    fireEvent.click(
      screen.getByRole('button', { name: /run passive assessment/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/assessment could not be completed/i)
    expect(consentCheckbox()).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    await screen.findByRole('heading', { name: 'example.com', level: 1 })
    expect(api.runAssessment).toHaveBeenCalledTimes(2)
    expect(vi.mocked(api.runAssessment).mock.calls[0][0]).toEqual({
      domain: 'example.com',
      proof_id: 'proof-1',
    })
    expect(vi.mocked(api.runAssessment).mock.calls[1][0]).toEqual({
      domain: 'example.com',
      proof_id: 'proof-1',
    })
  })

  it('shows a rate-limit countdown and disables immediate retry', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockRejectedValue(
      new api.ApiError('Too many requests.', 429, undefined, 30),
    )
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/too many requests/i)
    expect(alert).toHaveTextContent(/try again in 00:30/i)
    expect(
      screen.getByRole('button', { name: /retry in 00:30/i }),
    ).toBeDisabled()
  })

  it('retries a failed challenge request without losing the domain', async () => {
    vi.mocked(api.createDomainChallenge).mockRejectedValueOnce(
      new api.ApiError('The backend is unavailable.', 503),
    )
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    render(<App />)

    fireEvent.change(screen.getByLabelText(/^domain/i), {
      target: { value: 'example.com' },
    })
    fireEvent.click(screen.getByLabelText(/i own this domain/i))
    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/verification challenge could not be created/i)
    expect(screen.getByLabelText(/^domain/i)).toHaveValue('example.com')

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    await screen.findByRole('heading', { name: /prove control of example\.com/i })
    expect(api.createDomainChallenge).toHaveBeenCalledTimes(2)
  })

  it('offers re-verification when the ownership proof is rejected', async () => {
    vi.mocked(api.createDomainChallenge).mockResolvedValue(challenge)
    vi.mocked(api.verifyDomainOwnership).mockResolvedValue(verified)
    vi.mocked(api.listSources).mockResolvedValue(sources)
    vi.mocked(api.runAssessment).mockRejectedValue(
      new api.ApiError('Ownership proof has expired.', 403),
    )
    render(<App />)

    await submitDomain()
    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )
    await screen.findByRole('heading', { name: /review who will receive/i })
    fireEvent.click(consentCheckbox())
    fireEvent.click(
      screen.getByRole('button', { name: /run passive assessment/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/ownership proof has expired/i)
    fireEvent.click(
      screen.getByRole('button', { name: /verify ownership again/i }),
    )

    await waitFor(() =>
      expect(api.createDomainChallenge).toHaveBeenCalledTimes(2),
    )
    expect(
      await screen.findByRole('heading', { name: /prove control of example\.com/i }),
    ).toBeInTheDocument()
  })
})
