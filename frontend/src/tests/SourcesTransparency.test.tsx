import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SourcesTransparency } from '../components/SourcesTransparency'

const mockSources = [
  {
    module_id: 'ct_subdomains',
    source_name: 'crt.sh',
    source_url: 'https://crt.sh/',
    data_sent: 'domain name (for certificate transparency search)',
    purpose: 'Passive subdomain discovery through certificate transparency logs.',
    reliability: 'medium' as const,
    auth_required: false,
  },
  {
    module_id: 'dns_records',
    source_name: 'Public DNS',
    source_url: 'dns://public-resolvers',
    data_sent: 'domain name (for DNS record queries)',
    purpose: 'Retrieve public DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA).',
    reliability: 'high' as const,
    auth_required: false,
  },
]

function renderSources(
  overrides: Partial<Parameters<typeof SourcesTransparency>[0]> = {},
) {
  const props = {
    sources: mockSources,
    consentConfirmed: false,
    onConsentChange: vi.fn(),
    onConfirm: vi.fn(),
    onBack: vi.fn(),
    loading: false,
    error: null,
    onRetry: vi.fn(),
    onRestartVerification: vi.fn(),
    onStartOver: vi.fn(),
    domain: 'example.com',
    ...overrides,
  }
  render(<SourcesTransparency {...props} />)
  return props
}

describe('SourcesTransparency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists every external source with purpose and data sent', () => {
    renderSources()

    expect(
      screen.getByRole('heading', { name: /review who will receive example\.com/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('crt.sh')).toBeInTheDocument()
    expect(screen.getByText('Public DNS')).toBeInTheDocument()
    expect(screen.getByText(/passive subdomain discovery/i)).toBeInTheDocument()
    expect(
      screen.getByText(/domain name \(for dns record queries\)/i),
    ).toBeInTheDocument()
  })

  it('shows reliability and authentication badges', () => {
    renderSources()

    expect(screen.getByText(/medium reliability/i)).toBeInTheDocument()
    expect(screen.getByText(/high reliability/i)).toBeInTheDocument()
    expect(screen.getAllByText(/no authentication/i)).toHaveLength(2)
  })

  it('links to source documentation in a new tab', () => {
    renderSources()

    const [link] = screen.getAllByRole('link', {
      name: /open source documentation/i,
    })
    expect(link).toHaveAttribute('href', 'https://crt.sh/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('requires explicit consent before running the assessment', () => {
    const props = renderSources()

    const consent = screen.getByLabelText(/i understand these third-party services/i)
    const run = screen.getByRole('button', { name: /run passive assessment/i })

    expect(consent).not.toBeChecked()
    expect(run).toBeDisabled()

    fireEvent.click(consent)
    expect(props.onConsentChange).toHaveBeenCalledWith(true)
  })

  it('enables the assessment once consent is confirmed', () => {
    const props = renderSources({ consentConfirmed: true })

    const run = screen.getByRole('button', { name: /run passive assessment/i })
    expect(run).toBeEnabled()

    fireEvent.click(run)
    expect(props.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('can go back to verification', () => {
    const props = renderSources()

    fireEvent.click(screen.getByRole('button', { name: /back to verification/i }))
    expect(props.onBack).toHaveBeenCalledTimes(1)
  })

  it('blocks the assessment when the source registry fails', () => {
    const props = renderSources({
      sources: [],
      error: {
        message: 'The source registry is offline.',
        context: 'sources',
        status: 503,
        retryAfterSeconds: null,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      /external source list unavailable/i,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      /the source registry is offline/i,
    )
    expect(
      screen.getByLabelText(/i understand these third-party services/i),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /run passive assessment/i }),
    ).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(props.onRetry).toHaveBeenCalledTimes(1)
  })

  it('blocks the assessment when the registry returns no sources', () => {
    renderSources({ sources: [] })

    expect(
      screen.getByText(/no external sources were returned/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /run passive assessment/i }),
    ).toBeDisabled()
    expect(
      screen.getByLabelText(/i understand these third-party services/i),
    ).toBeDisabled()
  })

  it('shows an assessment failure with a retry that preserves consent', () => {
    const props = renderSources({
      consentConfirmed: true,
      error: {
        message: 'The assessment backend failed.',
        context: 'assessment',
        status: 500,
        retryAfterSeconds: null,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      /assessment could not be completed/i,
    )
    expect(
      screen.getByLabelText(/i understand these third-party services/i),
    ).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(props.onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not show assessment errors while the registry itself is failing', () => {
    renderSources({
      sources: [],
      error: {
        message: 'Registry failed.',
        context: 'sources',
        status: 503,
        retryAfterSeconds: null,
      },
    })

    expect(
      screen.queryByText(/assessment could not be completed/i),
    ).not.toBeInTheDocument()
  })
})
