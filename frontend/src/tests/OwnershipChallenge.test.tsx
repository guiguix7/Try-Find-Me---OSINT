import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OwnershipChallenge } from '../components/OwnershipChallenge'

const mockChallenge = {
  domain: 'example.com',
  token: 'abc123def456',
  txt_record_name: '_tryfindme-verification.example.com',
  txt_record_value: 'abc123def456.signature',
  expires_at: '2026-01-01T00:00:00Z',
  ttl_seconds: 900,
}

describe('OwnershipChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders TXT record name and value', () => {
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token=""
        onTokenChange={vi.fn()}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText(/prove domain ownership/i)).toBeInTheDocument()
    expect(screen.getByText(/_tryfindme-verification\.example\.com/)).toBeInTheDocument()
    expect(screen.getByText(/abc123def456\.signature/)).toBeInTheDocument()
  })

  it('displays the domain being verified', () => {
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token=""
        onTokenChange={vi.fn()}
        loading={false}
        error={null}
      />
    )

    const domainTexts = screen.getAllByText(/example\.com/)
    expect(domainTexts.length).toBeGreaterThan(0)
  })

  it('updates token on input change', () => {
    const onTokenChange = vi.fn()
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token=""
        onTokenChange={onTokenChange}
        loading={false}
        error={null}
      />
    )

    const input = screen.getByLabelText(/verification token/i)
    fireEvent.input(input, { target: { value: 'newtoken' } })
    expect(onTokenChange).toHaveBeenCalledWith('newtoken')
  })

  it('calls onVerify when submit is clicked', () => {
    const onVerify = vi.fn()
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={onVerify}
        onBack={vi.fn()}
        token="sometoken"
        onTokenChange={vi.fn()}
        loading={false}
        error={null}
      />
    )

    const button = screen.getByRole('button', { name: /verify ownership/i })
    fireEvent.click(button)
    expect(onVerify).toHaveBeenCalledTimes(1)
  })

  it('disables verify button when loading', () => {
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token="sometoken"
        onTokenChange={vi.fn()}
        loading={true}
        error={null}
      />
    )

    const button = screen.getByRole('button', { name: /verifying/i })
    expect(button).toBeDisabled()
  })

  it('displays error message when provided', () => {
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token=""
        onTokenChange={vi.fn()}
        loading={false}
        error="DNS TXT verification failed"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('DNS TXT verification failed')
  })

  it('has a copy button for the TXT value', () => {
    render(
      <OwnershipChallenge
        challenge={mockChallenge}
        onVerify={vi.fn()}
        onBack={vi.fn()}
        token=""
        onTokenChange={vi.fn()}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })
})
