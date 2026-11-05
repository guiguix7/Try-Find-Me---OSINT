import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

// Mock the API module
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

describe('App - full assessment flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial domain input form', () => {
    render(<App />)

    expect(screen.getByLabelText(/domain name/i)).toBeInTheDocument()
    expect(screen.getByText(/try find me/i)).toBeInTheDocument()
  })

  it('transitions to challenge step after domain submission', async () => {
    const { createDomainChallenge } = await import('../services/api')
    vi.mocked(createDomainChallenge).mockResolvedValue({
      domain: 'example.com',
      token: 'tok123',
      txt_record_name: '_tryfindme-verification.example.com',
      txt_record_value: 'tok123.sig',
      expires_at: '2026-01-01T00:00:00Z',
      ttl_seconds: 900,
    })

    render(<App />)

    const input = screen.getByLabelText(/domain name/i)
    fireEvent.input(input, { target: { value: 'example.com' } })

    const checkbox = screen.getByLabelText(/i confirm that i own/i)
    fireEvent.click(checkbox)

    const button = screen.getByRole('button', { name: /start assessment/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/prove domain ownership/i)).toBeInTheDocument()
    })
  })

  it('shows TXT record details in challenge step', async () => {
    const { createDomainChallenge } = await import('../services/api')
    vi.mocked(createDomainChallenge).mockResolvedValue({
      domain: 'example.com',
      token: 'tok123',
      txt_record_name: '_tryfindme-verification.example.com',
      txt_record_value: 'tok123.sig',
      expires_at: '2026-01-01T00:00:00Z',
      ttl_seconds: 900,
    })

    render(<App />)

    const input = screen.getByLabelText(/domain name/i)
    fireEvent.input(input, { target: { value: 'example.com' } })
    fireEvent.click(screen.getByLabelText(/i confirm that i own/i))
    fireEvent.click(screen.getByRole('button', { name: /start assessment/i }))

    await waitFor(() => {
      expect(screen.getByText(/_tryfindme-verification\.example\.com/)).toBeInTheDocument()
      expect(screen.getByText(/tok123\.sig/)).toBeInTheDocument()
    })
  })

  it('shows error state when API fails', async () => {
    const { createDomainChallenge } = await import('../services/api')
    vi.mocked(createDomainChallenge).mockRejectedValue(
      Object.assign(new Error('Failed to connect'), { status: 500 })
    )

    render(<App />)

    const input = screen.getByLabelText(/domain name/i)
    fireEvent.input(input, { target: { value: 'example.com' } })
    fireEvent.click(screen.getByLabelText(/i confirm that i own/i))
    fireEvent.click(screen.getByRole('button', { name: /start assessment/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
