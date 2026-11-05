import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportView } from '../components/ReportView'

const mockReport = {
  asset: 'example.com',
  generated_at: '2026-01-01T00:00:00Z',
  ownership_method: 'dns_txt',
  ownership_expires_at: '2026-01-01T01:00:00Z',
  module_status: [
    {
      module_id: 'ct_subdomains',
      status: 'ok' as const,
      message: 'Found 3 subdomains in certificate transparency logs.',
      evidence_count: 3,
    },
    {
      module_id: 'dns_records',
      status: 'ok' as const,
      message: 'DNS records retrieved for 2 record type(s).',
      evidence_count: 2,
    },
    {
      module_id: 'rdap_registration',
      status: 'failed' as const,
      message: 'RDAP registration information unavailable.',
      evidence_count: 0,
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      source_id: 'ct_subdomains',
      source_name: 'crt.sh',
      source_url: 'https://crt.sh/?q=%.example.com&output=json',
      retrieved_at: '2026-01-01T00:00:00Z',
      evidence_type: 'subdomain_certificate_entry',
      ownership_verified: false,
      match_type: 'inferred' as const,
      confidence: 'medium' as const,
      risk: 'low' as const,
      risk_rule_id: 'default',
      recommendation: 'Review whether sub.example.com should be publicly exposed.',
      data: { domain: 'sub.example.com', asset: 'example.com' },
      message: "Subdomain 'sub.example.com' found in a certificate transparency log entry.",
    },
    {
      id: 'ev-2',
      source_id: 'dns_records',
      source_name: 'Public DNS',
      source_url: 'dns://example.com/A',
      retrieved_at: '2026-01-01T00:00:00Z',
      evidence_type: 'dns_record',
      ownership_verified: true,
      match_type: 'exact' as const,
      confidence: 'high' as const,
      risk: 'low' as const,
      risk_rule_id: 'default',
      recommendation: 'Review A records for example.com.',
      data: { domain: 'example.com', record_type: 'A', records: ['93.184.216.34'] },
      message: 'A record(s) found for example.com.',
    },
  ],
  risk_counts: { low: 2, medium: 0, high: 0, info: 0 },
  limitations: ['RDAP registration information unavailable.'],
  sources_consulted: [
    { module_id: 'ct_subdomains', source_name: 'crt.sh', status: 'ok' },
    { module_id: 'dns_records', source_name: 'Public DNS', status: 'ok' },
    { module_id: 'rdap_registration', source_name: 'RDAP', status: 'failed' },
  ],
}

describe('ReportView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders report header with asset and generated date', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/assessment report/i)).toBeInTheDocument()
    const assetTexts = screen.getAllByText(/example\.com/)
    expect(assetTexts.length).toBeGreaterThan(0)
    expect(screen.getByText(/2026-01-01T00:00:00Z/)).toBeInTheDocument()
  })

  it('displays risk summary counts', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    const lowLabels = screen.getAllByText(/low/i)
    expect(lowLabels.length).toBeGreaterThan(0)
    const riskValues = screen.getAllByText(/^2$/)
    expect(riskValues.length).toBeGreaterThan(0)
  })

  it('displays evidence items', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/crt\.sh/i)).toBeInTheDocument()
    expect(screen.getByText(/public dns/i)).toBeInTheDocument()
    expect(screen.getByText(/inferred/i)).toBeInTheDocument()
    expect(screen.getByText(/exact/i)).toBeInTheDocument()
  })

  it('displays recommendations for evidence', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/review whether sub\.example\.com should be publicly exposed/i)).toBeInTheDocument()
  })

  it('displays limitations', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/limitations of this assessment/i)).toBeInTheDocument()
    const limitationItems = screen.getAllByText(/rdap registration information unavailable/i)
    expect(limitationItems.length).toBeGreaterThan(0)
  })

  it('shows module status with evidence counts', () => {
    render(<ReportView report={mockReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/ct_subdomains/i)).toBeInTheDocument()
    expect(screen.getByText(/3 evidence/i)).toBeInTheDocument()
  })

  it('calls onDiscard when discard button is clicked', () => {
    const onDiscard = vi.fn()
    render(<ReportView report={mockReport} onDiscard={onDiscard} />)

    const button = screen.getByRole('button', { name: /discard report/i })
    fireEvent.click(button)
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no evidence', () => {
    const emptyReport = { ...mockReport, evidence: [] }
    render(<ReportView report={emptyReport} onDiscard={vi.fn()} />)

    expect(screen.getByText(/no findings were returned from any source/i)).toBeInTheDocument()
  })
})
