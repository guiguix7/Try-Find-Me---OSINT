import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DomainInput } from '../components/DomainInput'

describe('DomainInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the domain form with label and input', () => {
    render(
      <DomainInput
        domain=""
        onDomainChange={vi.fn()}
        authorizationConfirmed={false}
        onAuthorizationChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByLabelText(/domain name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start assessment/i })).toBeInTheDocument()
  })

  it('updates domain value on input change', () => {
    const onDomainChange = vi.fn()
    render(
      <DomainInput
        domain=""
        onDomainChange={onDomainChange}
        authorizationConfirmed={false}
        onAuthorizationChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />
    )

    const input = screen.getByLabelText(/domain name/i)
    fireEvent.input(input, { target: { value: 'example.com' } })
    expect(onDomainChange).toHaveBeenCalledWith('example.com')
  })

  it('displays error message when provided', () => {
    render(
      <DomainInput
        domain=""
        onDomainChange={vi.fn()}
        authorizationConfirmed={false}
        onAuthorizationChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error="Invalid domain"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid domain')
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn()
    render(
      <DomainInput
        domain="example.com"
        onDomainChange={vi.fn()}
        authorizationConfirmed={true}
        onAuthorizationChange={vi.fn()}
        onSubmit={onSubmit}
        loading={false}
        error={null}
      />
    )

    const button = screen.getByRole('button', { name: /start assessment/i })
    fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables submit when loading', () => {
    render(
      <DomainInput
        domain="example.com"
        onDomainChange={vi.fn()}
        authorizationConfirmed={true}
        onAuthorizationChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={true}
        error={null}
      />
    )

    const button = screen.getByRole('button', { name: /starting assessment/i })
    expect(button).toBeDisabled()
  })

  it('displays purpose description', () => {
    render(
      <DomainInput
        domain=""
        onDomainChange={vi.fn()}
        authorizationConfirmed={false}
        onAuthorizationChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText(/passive digital exposure assessments/i)).toBeInTheDocument()
  })
})
