import React, { useState, useRef } from 'react'
import { ArrowRight, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { useAnalytics } from './Analytics'
import { addContact } from '../services/contactService'

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
      await addContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        urgency: formData.urgency,
        contactMethod: formData.contactMethod
      })

      setIsSubmitted(true)
      trackContact(`form_${formData.contactMethod}`)
      
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
    } catch (error) {
      console.error('Contact form error:', error)
      alert('Failed to send message. Please try again.')
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

  const inputClasses = (error?: string) => `w-full bg-transparent border-b-2 py-4 px-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors text-lg rounded-none ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-zinc-800 focus:border-slate-900 dark:focus:border-white'}`;
  const labelClasses = "block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 mb-0";

  if (isSubmitted) {
    return (
      <div className="border border-slate-200 dark:border-zinc-800 p-12 text-center">
        <CheckCircle weight="fill" className="w-12 h-12 text-slate-900 dark:text-white mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Message Sent Successfully
        </h3>
        <p className="text-slate-500 dark:text-zinc-500">
          Thank you for reaching out. I'll get back to you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label className={labelClasses}>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={inputClasses(errors.name)}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-2 text-xs font-bold tracking-widest uppercase text-red-500 flex items-center gap-2">
              <WarningCircle weight="fill" className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className={labelClasses}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={inputClasses(errors.email)}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-xs font-bold tracking-widest uppercase text-red-500 flex items-center gap-2">
              <WarningCircle weight="fill" className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          className={inputClasses(errors.subject)}
          placeholder="Project inquiry, collaboration..."
        />
        {errors.subject && (
          <p className="mt-2 text-xs font-bold tracking-widest uppercase text-red-500 flex items-center gap-2">
            <WarningCircle weight="fill" className="w-4 h-4" />
            {errors.subject}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label className={labelClasses}>Priority</label>
          <select
            value={formData.urgency}
            onChange={(e) => handleInputChange('urgency', e.target.value)}
            className={`${inputClasses()} appearance-none`}
          >
            <option value="low">General inquiry</option>
            <option value="medium">Project discussion</option>
            <option value="high">Urgent matter</option>
          </select>
        </div>

        <div>
           <label className={labelClasses}>Preferred Response</label>
          <select
            value={formData.contactMethod}
            onChange={(e) => handleInputChange('contactMethod', e.target.value)}
            className={`${inputClasses()} appearance-none`}
          >
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="video">Video call</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          rows={5}
          className={`${inputClasses(errors.message)} resize-none`}
          placeholder="Tell me about your project requirements..."
        />
        {errors.message && (
          <p className="mt-2 text-xs font-bold tracking-widest uppercase text-red-500 flex items-center gap-2">
            <WarningCircle weight="fill" className="w-4 h-4" />
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-5 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between shadow-sm mt-8"
      >
        <span className="text-xs tracking-[0.2em] uppercase">Send Message</span>
        {isSubmitting ? (
          <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowRight weight="bold" className="w-5 h-5" />
        )}
      </button>

    </form>
  )
}
