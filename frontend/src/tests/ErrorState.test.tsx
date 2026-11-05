import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from '../components/ErrorState'
import type { AssessmentStep } from '../hooks/useAssessment'

describe('ErrorState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error message', () => {
    render(
      <ErrorState
        step={'error' as AssessmentStep}
        error="Something went wrong"
        errorStatus={null}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('shows rate limit message when status is 429', () => {
    render(
      <ErrorState
        step={'error' as AssessmentStep}
        error="Too many requests"
        errorStatus={429}
        onRetry={vi.fn()}
      />
    )

    const rateLimitMessages = screen.getAllByText(/too many requests/i)
    expect(rateLimitMessages.length).toBeGreaterThan(0)
    expect(screen.getByText(/wait a moment/i)).toBeInTheDocument()
  })

  it('calls onRetry when try again is clicked', () => {
    const onRetry = vi.fn()
    render(
      <ErrorState
        step={'error' as AssessmentStep}
        error="Failed"
        errorStatus={null}
        onRetry={onRetry}
      />
    )

    const button = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows verification hint when step is verifying', () => {
    render(
      <ErrorState
        step={'verifying' as AssessmentStep}
        error="DNS TXT verification failed"
        errorStatus={null}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText(/propagate/i)).toBeInTheDocument()
  })
})
