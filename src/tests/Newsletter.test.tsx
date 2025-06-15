import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Newsletter from '../components/Newsletter'

// Mock the email service
vi.mock('../utils/emailService', () => ({
  emailService: {
    subscribeToNewsletter: vi.fn()
  }
}))

describe('Newsletter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders newsletter subscription form', () => {
    render(<Newsletter />)
    
    expect(screen.getByText(/stay updated/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('shows error for invalid email', async () => {
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(subscribeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('successfully subscribes with valid email', async () => {
    const { emailService } = await import('../utils/emailService')
    vi.mocked(emailService.subscribeToNewsletter).mockResolvedValue({
      success: true,
      message: 'Successfully subscribed!'
    })
    
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument()
    })
    
    expect(emailService.subscribeToNewsletter).toHaveBeenCalledWith('test@example.com')
  })

  it('handles subscription failure', async () => {
    const { emailService } = await import('../utils/emailService')
    vi.mocked(emailService.subscribeToNewsletter).mockResolvedValue({
      success: false,
      message: 'Subscription failed'
    })
    
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/subscription failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during subscription', async () => {
    const { emailService } = await import('../utils/emailService')
    
    // Create a promise that we can control
    let resolvePromise: (value: any) => void
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    vi.mocked(emailService.subscribeToNewsletter).mockReturnValue(controlledPromise)
    
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)
    
    // Check loading state
    expect(screen.getByText(/subscribing/i)).toBeInTheDocument()
    expect(subscribeButton).toBeDisabled()
    
    // Resolve the promise
    resolvePromise!({ success: true, message: 'Success' })
    
    await waitFor(() => {
      expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument()
    })
  })

  it('clears form after successful subscription', async () => {
    const { emailService } = await import('../utils/emailService')
    vi.mocked(emailService.subscribeToNewsletter).mockResolvedValue({
      success: true,
      message: 'Successfully subscribed!'
    })
    
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    expect(emailInput.value).toBe('test@example.com')
    
    await user.click(subscribeButton)
    
    await waitFor(() => {
      expect(emailInput.value).toBe('')
    })
  })

  it('prevents multiple subscriptions while processing', async () => {
    const { emailService } = await import('../utils/emailService')
    
    // Create a slow promise
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, message: 'Success' }), 1000)
    })
    
    vi.mocked(emailService.subscribeToNewsletter).mockReturnValue(slowPromise)
    
    const user = userEvent.setup()
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    
    // Click multiple times
    await user.click(subscribeButton)
    await user.click(subscribeButton)
    await user.click(subscribeButton)
    
    // Should only be called once
    expect(emailService.subscribeToNewsletter).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(subscribeButton).toHaveAttribute('type', 'submit')
  })
}) 