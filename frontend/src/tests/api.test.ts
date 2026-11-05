import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '../services/api'

vi.mock('../services/api', () => ({
  createDomainChallenge: vi.fn(),
  verifyDomainOwnership: vi.fn(),
  listSources: vi.fn(),
  runAssessment: vi.fn(),
  ApiError: class extends Error {
    status: number
    requestId?: string
    constructor(message: string, status: number, requestId?: string) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.requestId = requestId
    }
  },
}))

describe('API service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createDomainChallenge posts to the challenge endpoint', async () => {
    const { createDomainChallenge } = await import('../services/api')
    const mockResponse = {
      domain: 'example.com',
      token: 'abc123',
      txt_record_name: '_tryfindme-verification.example.com',
      txt_record_value: 'abc123.signature',
      expires_at: '2026-01-01T00:00:00Z',
      ttl_seconds: 900,
    }
    vi.mocked(createDomainChallenge).mockResolvedValue(mockResponse)

    const result = await createDomainChallenge({ domain: 'example.com' })

    expect(result.domain).toBe('example.com')
    expect(result.token).toBe('abc123')
    expect(vi.mocked(createDomainChallenge)).toHaveBeenCalledWith({
      domain: 'example.com',
    })
  })

  it('verifyDomainOwnership returns verified result', async () => {
    const { verifyDomainOwnership } = await import('../services/api')
    const mockResponse = {
      domain: 'example.com',
      verified: true,
      proof_id: '550e8400-e29b-41d4-a716-446655440000',
      expires_at: '2026-01-01T00:00:00Z',
      message: 'Domain ownership verified successfully.',
    }
    vi.mocked(verifyDomainOwnership).mockResolvedValue(mockResponse)

    const result = await verifyDomainOwnership({
      domain: 'example.com',
      token: 'abc123',
    })

    expect(result.verified).toBe(true)
    expect(result.proof_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('listSources returns source info', async () => {
    const { listSources } = await import('../services/api')
    const mockResponse = [
      {
        module_id: 'ct_subdomains',
        source_name: 'crt.sh',
        data_sent: 'domain name',
        purpose: 'subdomain discovery',
        reliability: 'medium' as const,
        auth_required: false,
      },
    ]
    vi.mocked(listSources).mockResolvedValue(mockResponse)

    const result = await listSources()

    expect(result).toHaveLength(1)
    expect(result[0].source_name).toBe('crt.sh')
  })

  it('runAssessment returns a report', async () => {
    const { runAssessment } = await import('../services/api')
    const mockResponse = {
      asset: 'example.com',
      generated_at: '2026-01-01T00:00:00Z',
      ownership_method: 'dns_txt',
      module_status: [],
      evidence: [],
      risk_counts: { low: 0, medium: 0, high: 0, info: 0 },
      limitations: [],
      sources_consulted: [],
    }
    vi.mocked(runAssessment).mockResolvedValue(mockResponse)

    const result = await runAssessment({
      domain: 'example.com',
      proof_id: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.asset).toBe('example.com')
    expect(result.risk_counts.low).toBe(0)
  })

  it('ApiError carries status and message', () => {
    const err = new ApiError('Not found', 404, 'req-123')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.requestId).toBe('req-123')
    expect(err.name).toBe('ApiError')
  })
})
