import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ReportView } from '../components/ReportView'
import type { Report } from '../types/api'

function buildReport(overrides: Partial<Report> = {}): Report {
  return {
    asset: 'example.com',
    generated_at: '2026-01-01T00:00:00Z',
    ownership_method: 'dns_txt',
    ownership_expires_at: '2026-01-01T01:00:00Z',
    module_status: [
      {
        module_id: 'ct_subdomains',
        status: 'ok',
        message: 'Found 3 subdomains in certificate transparency logs.',
        evidence_count: 3,
      },
      {
        module_id: 'dns_records',
        status: 'ok',
        message: 'DNS records retrieved for 2 record type(s).',
        evidence_count: 2,
      },
      {
        module_id: 'rdap_registration',
        status: 'failed',
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
        match_type: 'inferred',
        confidence: 'medium',
        risk: 'low',
        risk_rule_id: 'ct.subdomain.default',
        recommendation:
          'Review whether sub.example.com should be publicly exposed.',
        data: { domain: 'sub.example.com', asset: 'example.com' },
        message:
          "Subdomain 'sub.example.com' found in a certificate transparency log entry.",
      },
      {
        id: 'ev-2',
        source_id: 'dns_records',
        source_name: 'Public DNS',
        source_url: 'dns://example.com/A',
        retrieved_at: '2026-01-01T00:00:00Z',
        evidence_type: 'dns_record',
        ownership_verified: true,
        match_type: 'exact',
        confidence: 'high',
        risk: 'low',
        risk_rule_id: 'dns.record.default',
        recommendation: 'Review A records for example.com.',
        data: {
          domain: 'example.com',
          record_type: 'A',
          records: ['93.184.216.34'],
        },
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
    ...overrides,
  }
}

describe('ReportView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the report header with the asset and ownership context', () => {
    render(<ReportView report={buildReport()} onDiscard={vi.fn()} />)

    expect(screen.getByText(/assessment report/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'example.com', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/generated/i)).toBeInTheDocument()
    expect(screen.getByText(/ownership verified via dns txt record/i)).toBeInTheDocument()
    expect(screen.getByText(/proof valid until/i)).toBeInTheDocument()
  })

  it('summarises every risk category with its count', () => {
    render(<ReportView report={buildReport()} onDiscard={vi.fn()} />)

    const riskSection = document.getElementById('report-risk') as HTMLElement
    const low = within(riskSection).getByText('Low').closest('.risk-card') as HTMLElement
    const info = within(riskSection)
      .getByText('Informational')
      .closest('.risk-card') as HTMLElement

    expect(within(low).getByText('2')).toBeInTheDocument()
    expect(within(info).getByText('0')).toBeInTheDocument()
  })

  it('renders the full evidence contract, not just messages', () => {
    const { container } = render(
      <ReportView report={buildReport()} onDiscard={vi.fn()} />,
    )

    expect(screen.getAllByText('crt.sh').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/medium confidence/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/exact match/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/low risk/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('ct.subdomain.default').length).toBeGreaterThan(0)
    expect(screen.getAllByText('dns.record.default').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText(/ownership verified/i).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(/ownership not verified/i)).toBeInTheDocument()
    expect(
      screen.getAllByText(
        /review whether sub\.example\.com should be publicly exposed/i,
      ).length,
    ).toBeGreaterThan(0)

    const raw = container.querySelector('pre.code-block')
    expect(raw?.textContent).toContain('"domain": "sub.example.com"')
  })

  it('never double-escapes or interprets API values as HTML', () => {
    const message = '<img src=x onerror="alert(1)"> & "quoted" text'
    const report = buildReport({
      evidence: [
        {
          id: 'ev-x',
          source_id: 'ct_subdomains',
          source_name: 'crt.sh <untrusted>',
          retrieved_at: '2026-01-01T00:00:00Z',
          evidence_type: 'subdomain_certificate_entry',
          ownership_verified: false,
          match_type: 'inferred',
          confidence: 'low',
          data: { domain: 'sub.example.com' },
          message,
        },
      ],
    })

    const { container } = render(
      <ReportView report={report} onDiscard={vi.fn()} />,
    )

    const evidenceMessage = container.querySelector(
      '.evidence-card__message',
    ) as HTMLElement
    expect(evidenceMessage.textContent).toBe(message)
    expect(evidenceMessage.innerHTML).toContain('&lt;img')
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getAllByText(/crt\.sh <untrusted>/).length).toBeGreaterThan(0)
  })

  it('groups discovery output by evidence type', () => {
    render(<ReportView report={buildReport()} onDiscard={vi.fn()} />)

    const discovery = document.getElementById('report-discovery') as HTMLElement
    expect(
      within(discovery).getByText('Certificate transparency entries'),
    ).toBeInTheDocument()
    expect(within(discovery).getByText('DNS records')).toBeInTheDocument()
    expect(within(discovery).getByText('sub.example.com')).toBeInTheDocument()
    expect(within(discovery).getByText('A: 93.184.216.34')).toBeInTheDocument()
  })

  it('deduplicates recommendations across evidence items', () => {
    const report = buildReport({
      evidence: buildReport().evidence.map((item) => ({
        ...item,
        recommendation: 'Apply the documented mitigation.',
      })),
    })

    render(<ReportView report={report} onDiscard={vi.fn()} />)

    const protection = document.getElementById('report-protection') as HTMLElement
    expect(
      within(protection).getAllByText('Apply the documented mitigation.'),
    ).toHaveLength(1)
  })

  it('renders limitations and module status', () => {
    render(<ReportView report={buildReport()} onDiscard={vi.fn()} />)

    expect(
      screen.getAllByText(/rdap registration information unavailable/i).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(/3 evidence items/i)).toBeInTheDocument()
    expect(screen.getAllByText(/source unavailable/i).length).toBeGreaterThan(0)
    expect(screen.getByText('ct_subdomains')).toBeInTheDocument()
  })

  it('shows an empty state and warns when sources were unavailable', () => {
    render(
      <ReportView
        report={buildReport({ evidence: [] })}
        onDiscard={vi.fn()}
      />,
    )

    expect(screen.getByText(/no results were returned/i)).toBeInTheDocument()
    expect(screen.getByText(/some sources were unavailable/i)).toBeInTheDocument()
  })

  it('distinguishes a genuinely empty result from a source outage', () => {
    render(
      <ReportView
        report={buildReport({
          evidence: [],
          module_status: [
            {
              module_id: 'ct_subdomains',
              status: 'ok',
              message: 'No subdomains found.',
              evidence_count: 0,
            },
          ],
          sources_consulted: [
            {
              module_id: 'ct_subdomains',
              source_name: 'crt.sh',
              status: 'ok',
            },
          ],
        })}
        onDiscard={vi.fn()}
      />,
    )

    expect(screen.getByText(/no results were returned/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/some sources were unavailable/i),
    ).not.toBeInTheDocument()
  })

  it('reports missing module status instead of inventing progress', () => {
    render(
      <ReportView
        report={buildReport({ module_status: [], sources_consulted: [] })}
        onDiscard={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/no module status was reported/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/no sources were recorded/i)).toBeInTheDocument()
  })

  it('prints through the browser print dialog', () => {
    const print = vi.fn()
    Object.defineProperty(window, 'print', {
      value: print,
      configurable: true,
      writable: true,
    })
    render(<ReportView report={buildReport()} onDiscard={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /print \/ save as pdf/i }))
    expect(print).toHaveBeenCalledTimes(1)
  })

  it('requires confirmation before discarding a report', () => {
    const onDiscard = vi.fn()
    render(<ReportView report={buildReport()} onDiscard={onDiscard} />)

    fireEvent.click(screen.getByRole('button', { name: /discard report/i }))
    expect(onDiscard).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onDiscard).toHaveBeenCalledTimes(1)
  })

  it('can cancel discarding a report', () => {
    const onDiscard = vi.fn()
    render(<ReportView report={buildReport()} onDiscard={onDiscard} />)

    fireEvent.click(screen.getByRole('button', { name: /discard report/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onDiscard).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: /discard report/i }),
    ).toBeInTheDocument()
  })
})
