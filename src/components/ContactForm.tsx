import React, { useState, useRef } from 'react'
import { Send, CheckCircle, AlertCircle, Loader, Mail, Phone, MessageSquare, Calendar, Github, Linkedin, MapPin, Clock } from 'lucide-react'
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
  const [showCalendar, setShowCalendar] = useState(false)
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
        
        // Reset form after 3 seconds
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
        }, 3000)
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

  const quickContactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'saif.alijanahi@gmail.com',
      action: () => {
        window.open('mailto:saif.alijanahi@gmail.com')
        trackContact('direct_email')
      }
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+964 771 5002 700',
      action: () => {
        window.open('tel:+9647715002700')
        trackContact('direct_phone')
      }
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: 'Quick Message',
      action: () => {
        window.open('https://wa.me/9647715002700?text=Hi%20Saif,%20I%20found%20your%20portfolio%20and%20would%20like%20to%20connect!')
        trackContact('whatsapp')
      }
    },
    {
      icon: Calendar,
      label: 'Schedule Call',
      value: 'Book Meeting',
      action: () => {
        setShowCalendar(!showCalendar)
        trackContact('schedule_call')
      }
    }
  ]

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Thank you for reaching out. I'll get back to you within 24 hours.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Expected response time: 2-24 hours</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Contact Methods */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickContactMethods.map((method, index) => (
          <button
            key={index}
            onClick={method.action}
            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group hover:shadow-lg"
          >
            <method.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-slate-900 dark:text-white text-sm">{method.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{method.value}</p>
          </button>
        ))}
      </div>

      {/* Calendar Integration */}
      {showCalendar && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Schedule a Meeting</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
            Let's schedule a call to discuss your project. I'm available for video calls, phone calls, or in-person meetings in Najaf, Iraq.
          </p>
          <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Availability: Sunday - Thursday, 9 AM - 6 PM (GMT+3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location: Najaf, Iraq (or Remote)</span>
            </div>
          </div>
          <a
            href="mailto:saif.alijanahi@gmail.com?subject=Meeting Request&body=Hi Saif,%0A%0AI would like to schedule a meeting to discuss:%0A%0A[Please describe your project/inquiry]%0A%0APreferred time and date:%0A[Please suggest 2-3 time slots]%0A%0APreferred method:%0A[ ] Video Call (Zoom/Google Meet)%0A[ ] Phone Call%0A[ ] In-person (if in Najaf)%0A%0ABest regards"
            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Send Meeting Request</span>
          </a>
        </div>
      )}

      {/* Contact Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Send me a message</h3>
          <p className="text-slate-600 dark:text-slate-400">I'd love to hear about your project and how I can help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.subject 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Project Inquiry / Collaboration Opportunity"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.subject}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority Level
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Project discussion</option>
              <option value="high">High - Urgent matter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preferred Contact Method
            </label>
            <select
              value={formData.contactMethod}
              onChange={(e) => handleInputChange('contactMethod', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="email">Email response</option>
              <option value="phone">Phone call</option>
              <option value="video">Video call</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.message 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
            placeholder="Tell me about your project, requirements, timeline, and any specific technologies you'd like to discuss..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.message}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formData.message.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>

        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Your information is secure and will never be shared with third parties.</p>
        </div>
      </form>

      {/* Social Links */}
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Or connect with me on social media:</p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/saifali-ch"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact('github')}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Github className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </a>
          <a
            href="https://linkedin.com/in/saif-alijanahi"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact('linkedin')}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Linkedin className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default ContactForm