import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2, User, Mail, MessageSquare } from 'lucide-react'
import { emailService } from '../utils/emailService'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: 'loading' })

    try {
      const result = await emailService.sendContactMessage({
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'Contact Form Message',
        message: formData.message,
        to_email: 'saifalialjanahi@gmail.com'
      })
      
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: result.message || 'Thank you for your message! I\'ll get back to you soon.' 
        })
        
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus({ 
          type: 'error', 
          message: result.message || 'Failed to send message. Please try again or contact me directly.' 
        })
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or contact me directly.' 
      })
    }
  }

  const isFormValid = formData.name && formData.email && formData.message

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Send me a message
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Have a project in mind? Let's discuss how we can work together.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="What's this about?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="input-field resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="Tell me about your project, ideas, or just say hello..."
          />
        </div>

        {/* Status Messages */}
        {status.type === 'success' && (
          <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-700 dark:text-green-300">{status.message}</p>
          </div>
        )}

        {status.type === 'error' && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{status.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || status.type === 'loading'}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {status.type === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Or reach out directly at{' '}
          <a 
            href="mailto:saifalialjanahi@gmail.com" 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            saifalialjanahi@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}