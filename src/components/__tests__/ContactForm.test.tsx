import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '../ContactForm'
import * as emailjs from '@emailjs/browser'

// Mock EmailJS
vi.mock('@emailjs/browser')

describe('ContactForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders contact form with all required fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('submits form successfully with valid data', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message content')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
    })
  })

  it('handles form submission error', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockRejectedValue(new Error('Failed to send'))

    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message content')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })

  it('resets form after successful submission', async () => {
    const mockSend = vi.mocked(emailjs.send)
    mockSend.mockResolvedValue({ status: 200, text: 'OK' })

    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(subjectInput, 'Test Subject')
    await user.type(messageInput, 'Test message content')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
      expect(emailInput).toHaveValue('')
      expect(subjectInput).toHaveValue('')
      expect(messageInput).toHaveValue('')
    })
  })

  it('disables submit button while sending', async () => {
    const mockSend = vi.mocked(emailjs.send)
    // Simulate slow network request
    mockSend.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ status: 200, text: 'OK' }), 100)))

    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message content')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
}) 