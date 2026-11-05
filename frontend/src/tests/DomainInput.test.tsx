import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DomainInput } from '../components/DomainInput'

function renderDomainInput(overrides: Partial<Parameters<typeof DomainInput>[0]> = {}) {
  const props = {
    domain: '',
    onDomainChange: vi.fn(),
    authorizationConfirmed: false,
    onAuthorizationChange: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
    error: null,
    onRetry: vi.fn(),
    onRestartVerification: vi.fn(),
    onStartOver: vi.fn(),
    ...overrides,
  }
  render(<DomainInput {...props} />)
  return props
}

describe('DomainInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the domain field and the verification CTA', () => {
    renderDomainInput()

    expect(screen.getByLabelText(/^domain/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    ).toBeInTheDocument()
  })

  it('states the passive scope without promising active scanning', () => {
    renderDomainInput()

    expect(screen.getByText(/it discovers/i)).toBeInTheDocument()
    expect(screen.getByText(/it never scans/i)).toBeInTheDocument()
  })

  it('reports the typed value without mutating it', () => {
    const props = renderDomainInput()

    fireEvent.input(screen.getByLabelText(/^domain/i), {
      target: { value: 'Example.COM' },
    })

    expect(props.onDomainChange).toHaveBeenCalledWith('Example.COM')
  })

  it('requires a domain before submitting', () => {
    const props = renderDomainInput({ authorizationConfirmed: true })

    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    expect(screen.getByText(/enter a domain to begin/i)).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a protocol or path in the domain field', () => {
    const props = renderDomainInput({
      domain: 'https://example.com/path',
      authorizationConfirmed: true,
    })

    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    expect(
      screen.getByText(/without a protocol or path/i),
    ).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('requires a dot in the domain field', () => {
    renderDomainInput({ domain: 'localhost', authorizationConfirmed: true })

    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    expect(screen.getByText(/at least one dot/i)).toBeInTheDocument()
  })

  it('requires the authorization confirmation', () => {
    const props = renderDomainInput({ domain: 'example.com' })

    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    expect(
      screen.getByText(/confirm that you own or are authorized/i),
    ).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('submits when the domain and confirmation are valid', () => {
    const props = renderDomainInput({
      domain: 'example.com',
      authorizationConfirmed: true,
    })

    fireEvent.click(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    )

    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables the CTA while the challenge request is in flight', () => {
    renderDomainInput({
      domain: 'example.com',
      authorizationConfirmed: true,
      loading: true,
    })

    expect(
      screen.getByRole('button', { name: /begin ownership verification/i }),
    ).toBeDisabled()
  })

  it('shows a challenge error with a retry action', () => {
    const props = renderDomainInput({
      error: {
        message: 'The backend is unavailable.',
        context: 'challenge',
        status: 503,
        retryAfterSeconds: null,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      /verification challenge could not be created/i,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      /the backend is unavailable/i,
    )

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(props.onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not show unrelated error contexts on this screen', () => {
    renderDomainInput({
      error: {
        message: 'Assessment failed.',
        context: 'assessment',
        status: 500,
        retryAfterSeconds: null,
      },
    })

    expect(
      screen.queryByText(/assessment failed/i),
    ).not.toBeInTheDocument()
  })
})
