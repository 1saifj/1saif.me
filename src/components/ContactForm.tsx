import React, { useState, useRef } from 'react'
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAnalytics } from './Analytics'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  contactMethod: 'email' | 'phone' | 'video'
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export const ContactForm: React.FC = () => {
  const { trackContact, trackEvent } = useAnalytics()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'medium',
    contactMethod: 'email'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    else if (formData.message.length < 10) newErrors.message = 'Message should be at least 10 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    trackEvent({
      action: 'contact_form_submit',
      category: 'conversion',
      label: formData.contactMethod
    })

    try {
      // Simulate form submission - replace with your actual endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        trackContact(`form_${formData.contactMethod}`)
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            urgency: 'medium',
            contactMethod: 'email'
          })
        }, 5000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      // Handle error - show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Thank you for reaching out. I'll get back to you within 24 hours.
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Expected response time: 2-24 hours
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-slate-200 dark:border-slate-700">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.subject 
                ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
            placeholder="Project inquiry, collaboration, consultation..."
          />
          {errors.subject && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* Priority and Contact Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Project discussion</option>
              <option value="high">High - Urgent matter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Response
            </label>
            <select
              value={formData.contactMethod}
              onChange={(e) => handleInputChange('contactMethod', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="email">Email response</option>
              <option value="phone">Phone call</option>
              <option value="video">Video call</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={5}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.message 
                ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500`}
            placeholder="Tell me about your project, requirements, timeline, and any specific technologies you'd like to discuss..."
          />
          {errors.message && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.message}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {formData.message.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your information is secure and will never be shared with third parties. 
            I typically respond within 24 hours during business days.
          </p>
        </div>
      </form>
    </div>
  )
}

export default ContactForm