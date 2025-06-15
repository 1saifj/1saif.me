import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Newsletter } from '../Newsletter'
import * as emailjs from '@emailjs/browser'

// Mock EmailJS
vi.mock('@emailjs/browser')

describe('Newsletter', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders newsletter subscription form', () => {
    render(<Newsletter />)
    
    expect(screen.getByText(/stay updated/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('validates email format before submission', async () => {
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
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/subscription successful/i)).toBeInTheDocument()
    })
  })

  it('handles subscription error gracefully', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockRejectedValue(new Error('Network error'))

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText(/subscription failed/i)).toBeInTheDocument()
    })
  })

  it('prevents duplicate subscriptions', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    // First subscription
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText(/subscription successful/i)).toBeInTheDocument()
    })

    // Clear the input and try to subscribe again with same email
    await user.clear(emailInput)
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(screen.getByText(/already subscribed/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while processing', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ status: 200, text: 'OK' }), 100)))

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    expect(subscribeButton).toBeDisabled()
    expect(screen.getByText(/subscribing/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(subscribeButton).not.toBeDisabled()
    })
  })

  it('clears input after successful subscription', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(emailInput).toHaveValue('')
    })
  })

  it('stores subscription in localStorage', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<Newsletter />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(subscribeButton)

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'newsletter_subscribers',
        expect.stringContaining('test@example.com')
      )
    })
  })
}) 