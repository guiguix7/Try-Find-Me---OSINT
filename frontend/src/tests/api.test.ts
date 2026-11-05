// Tests for the API service layer. `fetch` is stubbed so the real request
// construction, response parsing and error mapping are exercised.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ApiError,
  createDomainChallenge,
  verifyDomainOwnership,
  listSources,
  runAssessment,
  getHealth,
} from '../services/api'

interface MockResponseInit {
  status?: number
  body?: unknown
  headers?: Record<string, string>
  bodyFails?: boolean
}

function mockResponse({
  status = 200,
  body = {},
  headers = {},
  bodyFails = false,
}: MockResponseInit = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => {
      if (bodyFails) throw new SyntaxError('Unexpected token')
      return body
    },
  } as unknown as Response
}

function getFetchMock() {
  return vi.mocked(fetch)
}

describe('API service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the domain to the challenge endpoint', async () => {
    const challenge = {
      domain: 'example.com',
      token: 'abc123',
      txt_record_name: '_tryfindme-verification.example.com',
      txt_record_value: 'abc123.signature',
      expires_at: '2026-01-01T00:00:00Z',
      ttl_seconds: 900,
    }
    getFetchMock().mockResolvedValue(mockResponse({ body: challenge }))

    const result = await createDomainChallenge({ domain: 'example.com' })

    expect(result).toEqual(challenge)
    const [url, init] = getFetchMock().mock.calls[0]
    expect(String(url)).toContain('/api/v1/ownership/domain/challenge')
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' }),
    })
  })

  it('posts the challenge token to the verify endpoint', async () => {
    const verification = {
      domain: 'example.com',
      verified: true,
      proof_id: '550e8400-e29b-41d4-a716-446655440000',
      expires_at: '2026-01-01T00:00:00Z',
      message: 'Domain ownership verified successfully.',
    }
    getFetchMock().mockResolvedValue(mockResponse({ body: verification }))

    const result = await verifyDomainOwnership({
      domain: 'example.com',
      token: 'abc123',
    })

    expect(result).toEqual(verification)
    const [url, init] = getFetchMock().mock.calls[0]
    expect(String(url)).toContain('/api/v1/ownership/domain/verify')
    expect(init).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ domain: 'example.com', token: 'abc123' }),
    })
  })

  it('loads the source registry with a GET request', async () => {
    const sources = [
      {
        module_id: 'ct_subdomains',
        source_name: 'crt.sh',
        data_sent: 'domain name',
        purpose: 'subdomain discovery',
        reliability: 'medium',
        auth_required: false,
      },
    ]
    getFetchMock().mockResolvedValue(mockResponse({ body: sources }))

    const result = await listSources()

    expect(result).toEqual(sources)
    const [url, init] = getFetchMock().mock.calls[0]
    expect(String(url)).toContain('/api/v1/sources')
    expect(init).toMatchObject({ headers: { 'Content-Type': 'application/json' } })
    expect(init).not.toHaveProperty('method')
  })

  it('posts the domain and proof to the assessment endpoint', async () => {
    const report = {
      asset: 'example.com',
      generated_at: '2026-01-01T00:00:00Z',
      ownership_method: 'dns_txt',
      module_status: [],
      evidence: [],
      risk_counts: { low: 0, medium: 0, high: 0, info: 0 },
      limitations: [],
      sources_consulted: [],
    }
    getFetchMock().mockResolvedValue(mockResponse({ body: report }))

    const result = await runAssessment({
      domain: 'example.com',
      proof_id: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result).toEqual(report)
    const [url, init] = getFetchMock().mock.calls[0]
    expect(String(url)).toContain('/api/v1/assessments')
    expect(init).toMatchObject({
      method: 'POST',
      body: JSON.stringify({
        domain: 'example.com',
        proof_id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
  })

  it('checks the health endpoint', async () => {
    getFetchMock().mockResolvedValue(mockResponse({ body: { status: 'ok' } }))

    await expect(getHealth()).resolves.toEqual({ status: 'ok' })
    expect(String(getFetchMock().mock.calls[0][0])).toContain('/health')
  })

  it('maps an error response to ApiError with request id and Retry-After', async () => {
    getFetchMock().mockResolvedValue(
      mockResponse({
        status: 429,
        body: {
          error: 'rate_limited',
          message: 'Too many requests.',
          request_id: 'req-123',
        },
        headers: { 'retry-after': '42' },
      }),
    )

    const error = await runAssessment({
      domain: 'example.com',
      proof_id: 'proof',
    }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.status).toBe(429)
    expect(apiError.message).toBe('Too many requests.')
    expect(apiError.requestId).toBe('req-123')
    expect(apiError.retryAfterSeconds).toBe(42)
  })

  it('falls back to the error code when no message is present', async () => {
    getFetchMock().mockResolvedValue(
      mockResponse({
        status: 404,
        body: { error: 'not_found' },
      }),
    )

    await expect(listSources()).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'not_found',
    })
  })

  it('uses a status-based message when the error body is not JSON', async () => {
    getFetchMock().mockResolvedValue(
      mockResponse({ status: 502, bodyFails: true }),
    )

    const error = (await listSources().catch((caught: unknown) => caught)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.message).toBe('API request failed: 502')
    expect(error.retryAfterSeconds).toBeUndefined()
  })

  it('ignores an invalid Retry-After header', async () => {
    getFetchMock().mockResolvedValue(
      mockResponse({
        status: 429,
        body: { error: 'rate_limited', message: 'Too many requests.' },
        headers: { 'retry-after': 'later' },
      }),
    )

    const error = (await listSources().catch((caught: unknown) => caught)) as ApiError

    expect(error.retryAfterSeconds).toBeUndefined()
  })

  it('ignores a non-positive Retry-After header', async () => {
    getFetchMock().mockResolvedValue(
      mockResponse({
        status: 429,
        body: { error: 'rate_limited', message: 'Too many requests.' },
        headers: { 'retry-after': '0' },
      }),
    )

    const error = (await listSources().catch((caught: unknown) => caught)) as ApiError

    expect(error.retryAfterSeconds).toBeUndefined()
  })
})
