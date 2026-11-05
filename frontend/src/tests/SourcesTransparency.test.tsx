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

describe('SourcesTransparency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders source list with names and purposes', () => {
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={false}
        onConfirmChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByText(/external services that will be contacted/i)).toBeInTheDocument()
    const crtShHeadings = screen.getAllByText(/crt\.sh/i)
    expect(crtShHeadings.length).toBeGreaterThan(0)
    const publicDnsTexts = screen.getAllByText(/public dns/i)
    expect(publicDnsTexts.length).toBeGreaterThan(0)
  })

  it('shows reliability badge for each source', () => {
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={false}
        onConfirmChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByText(/reliability: medium/i)).toBeInTheDocument()
    expect(screen.getByText(/reliability: high/i)).toBeInTheDocument()
  })

  it('shows transparency notice', () => {
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={false}
        onConfirmChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByText(/transparency notice/i)).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={true}
        onConfirmChange={vi.fn()}
        onConfirm={onConfirm}
        loading={false}
      />
    )

    const button = screen.getByRole('button', { name: /start passive assessment/i })
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables confirm button when not confirmed', () => {
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={false}
        onConfirmChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />
    )

    const button = screen.getByRole('button', { name: /start passive assessment/i })
    expect(button).toBeDisabled()
  })

  it('displays consent checkbox', () => {
    render(
      <SourcesTransparency
        sources={mockSources}
        confirmed={false}
        onConfirmChange={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByLabelText(/i understand and consent/i)).toBeInTheDocument()
  })
})
