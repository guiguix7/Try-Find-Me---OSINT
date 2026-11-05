import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OwnershipChallenge } from '../components/OwnershipChallenge'

const futureExpiry = () => new Date(Date.now() + 15 * 60 * 1000).toISOString()

const mockChallenge = {
  domain: 'example.com',
  token: 'abc123def456',
  txt_record_name: '_tryfindme-verification.example.com',
  txt_record_value: 'abc123def456.signature',
  expires_at: futureExpiry(),
  ttl_seconds: 900,
}

function renderChallenge(
  overrides: Partial<Parameters<typeof OwnershipChallenge>[0]> = {},
) {
  const props = {
    challenge: mockChallenge,
    verifying: false,
    loading: false,
    error: null,
    onVerify: vi.fn(),
    onStartOver: vi.fn(),
    onRetry: vi.fn(),
    onRestartVerification: vi.fn(),
    ...overrides,
  }
  render(<OwnershipChallenge {...props} />)
  return props
}

describe('OwnershipChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the domain, TXT record name and value', () => {
    renderChallenge()

    expect(
      screen.getByRole('heading', { name: /prove control of example\.com/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/_tryfindme-verification\.example\.com/),
    ).toBeInTheDocument()
    expect(screen.getByText(/abc123def456\.signature/)).toBeInTheDocument()
  })

  it('never asks the user to paste a token manually', () => {
    renderChallenge()

    expect(
      screen.queryByLabelText(/verification token/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox'),
    ).not.toBeInTheDocument()
  })

  it('calls verify using the challenge held in state', () => {
    const props = renderChallenge()

    fireEvent.click(
      screen.getByRole('button', { name: /published the record/i }),
    )

    expect(props.onVerify).toHaveBeenCalledTimes(1)
  })

  it('offers copy controls for the record name and value', () => {
    renderChallenge()

    expect(
      screen.getByRole('button', { name: /copy record name/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /copy record value/i }),
    ).toBeInTheDocument()
  })

  it('copies the value to the clipboard and announces it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    renderChallenge()

    fireEvent.click(
      screen.getByRole('button', { name: /copy record value/i }),
    )

    expect(await screen.findByText('Copied')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('abc123def456.signature')
  })

  it('disables verification while verifying and shows indeterminate progress', () => {
    renderChallenge({ verifying: true, loading: true })

    const button = screen.getByRole('button', { name: /published the record/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.getByRole('progressbar', {
        name: /querying public dns/i,
      }),
    ).toBeInTheDocument()
  })

  it('shows expiry status and blocks verification when expired', () => {
    renderChallenge({
      challenge: {
        ...mockChallenge,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      },
    })

    expect(screen.getAllByText(/expired/i).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /published the record/i }),
    ).toBeDisabled()
    expect(screen.getByText(/challenge expired/i)).toBeInTheDocument()
  })

  it('keeps the challenge visible when verification fails', () => {
    const props = renderChallenge({
      error: {
        message: 'TXT record not found.',
        context: 'verify',
        status: null,
        retryAfterSeconds: null,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      /ownership verification failed/i,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/txt record not found/i)
    expect(
      screen.getByText(/_tryfindme-verification\.example\.com/),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(props.onRetry).toHaveBeenCalledTimes(1)
  })

  it('lets the user start over from the challenge screen', () => {
    const props = renderChallenge()

    fireEvent.click(screen.getByRole('button', { name: /start over/i }))

    expect(props.onStartOver).toHaveBeenCalledTimes(1)
  })
})
