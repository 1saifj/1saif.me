import emailjs from '@emailjs/browser'

// EmailJS Configuration using environment variables
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  NEWSLETTER_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID || '',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
}

// Site configuration
const SITE_CONFIG = {
  URL: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
  NAME: import.meta.env.VITE_SITE_NAME || 'Saif Aljanahi Portfolio'
}

// Newsletter configuration
const NEWSLETTER_CONFIG = {
  FROM_NAME: import.meta.env.VITE_NEWSLETTER_FROM_NAME || 'Saif Aljanahi',
  FROM_EMAIL: import.meta.env.VITE_NEWSLETTER_FROM_EMAIL || 'saifalialjanahi@gmail.com'
}

export interface SubscriberData {
  email: string
  timestamp: string
  source: string
  confirmed: boolean
  id: string
}

export interface NewsletterStats {
  totalSubscribers: number
  confirmedSubscribers: number
  pendingConfirmations: number
  unsubscribed: number
}

class EmailService {
  private subscribers: SubscriberData[] = []
  private unsubscribed: string[] = []
  private isConfigured: boolean = false

  constructor() {
    this.loadData()
    this.initEmailJS()
  }

  private initEmailJS(): void {
    // Check if all required environment variables are set
    this.isConfigured = !!(
      EMAILJS_CONFIG.SERVICE_ID &&
      EMAILJS_CONFIG.TEMPLATE_ID &&
      EMAILJS_CONFIG.PUBLIC_KEY
    )

    if (this.isConfigured) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)
      console.log('✅ EmailJS initialized successfully')
    } else {
      console.warn('⚠️ EmailJS not configured. Please set environment variables.')
      console.warn('Missing variables:', {
        SERVICE_ID: !EMAILJS_CONFIG.SERVICE_ID,
        TEMPLATE_ID: !EMAILJS_CONFIG.TEMPLATE_ID,
        PUBLIC_KEY: !EMAILJS_CONFIG.PUBLIC_KEY
      })
    }
  }

  private loadData(): void {
    try {
      // Load subscribers
      const stored = localStorage.getItem('newsletter_subscribers_v2')
      if (stored) {
        this.subscribers = JSON.parse(stored)
      }

      // Load unsubscribed list
      const unsubscribed = localStorage.getItem('newsletter_unsubscribed')
      if (unsubscribed) {
        this.unsubscribed = JSON.parse(unsubscribed)
      }
    } catch (error) {
      console.error('Failed to load newsletter data:', error)
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('newsletter_subscribers_v2', JSON.stringify(this.subscribers))
      localStorage.setItem('newsletter_unsubscribed', JSON.stringify(this.unsubscribed))
    } catch (error) {
      console.error('Failed to save newsletter data:', error)
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  isEmailServiceConfigured(): boolean {
    return this.isConfigured
  }

  async subscribe(email: string, source: string = 'website'): Promise<{ success: boolean; message: string }> {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' }
    }

    // Check if email service is configured
    if (!this.isConfigured) {
      // Still save locally for when service is configured
      const newSubscriber: SubscriberData = {
        email,
        timestamp: new Date().toISOString(),
        source,
        confirmed: false,
        id: this.generateId()
      }

      this.subscribers.push(newSubscriber)
      this.saveData()

      return { 
        success: true, 
        message: 'Subscription saved! Email service is not configured yet, but you\'ll be notified when it\'s ready.' 
      }
    }

    // Check if email is in unsubscribed list
    if (this.unsubscribed.includes(email)) {
      return { success: false, message: 'This email has been unsubscribed. Please contact us to resubscribe.' }
    }

    // Check if already subscribed
    const existingSubscriber = this.subscribers.find(sub => sub.email === email)
    if (existingSubscriber) {
      if (existingSubscriber.confirmed) {
        return { success: false, message: 'This email is already subscribed to our newsletter.' }
      } else {
        // Resend confirmation
        try {
          await this.sendConfirmationEmail(email, existingSubscriber.id)
          return { success: true, message: 'Confirmation email resent! Please check your inbox.' }
        } catch (error) {
          return { success: false, message: 'Failed to resend confirmation email. Please try again.' }
        }
      }
    }

    // Add new subscriber
    const newSubscriber: SubscriberData = {
      email,
      timestamp: new Date().toISOString(),
      source,
      confirmed: false,
      id: this.generateId()
    }

    this.subscribers.push(newSubscriber)
    this.saveData()

    // Send confirmation email
    try {
      await this.sendConfirmationEmail(email, newSubscriber.id)
      return { success: true, message: 'Welcome! Please check your email to confirm your subscription.' }
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      return { success: false, message: 'Subscription saved, but confirmation email failed. Please try again.' }
    }
  }

  async sendConfirmationEmail(email: string, subscriberId: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured')
    }

    const confirmationUrl = `${SITE_CONFIG.URL}/confirm-subscription?id=${subscriberId}`
    const unsubscribeUrl = `${SITE_CONFIG.URL}/unsubscribe?id=${subscriberId}`
    
    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0], // Use email prefix as name
      from_name: NEWSLETTER_CONFIG.FROM_NAME,
      site_name: SITE_CONFIG.NAME,
      confirmation_url: confirmationUrl,
      unsubscribe_url: unsubscribeUrl,
      current_year: new Date().getFullYear(),
      site_url: SITE_CONFIG.URL
    }

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    )
  }

  confirmSubscription(subscriberId: string): boolean {
    const subscriber = this.subscribers.find(sub => sub.id === subscriberId)
    if (subscriber && !subscriber.confirmed) {
      subscriber.confirmed = true
      this.saveData()
      return true
    }
    return false
  }

  unsubscribe(subscriberId: string): boolean {
    const subscriberIndex = this.subscribers.findIndex(sub => sub.id === subscriberId)
    if (subscriberIndex !== -1) {
      const subscriber = this.subscribers[subscriberIndex]
      
      // Add to unsubscribed list
      if (!this.unsubscribed.includes(subscriber.email)) {
        this.unsubscribed.push(subscriber.email)
      }
      
      // Remove from subscribers
      this.subscribers.splice(subscriberIndex, 1)
      this.saveData()
      return true
    }
    return false
  }

  getStats(): NewsletterStats {
    const confirmed = this.subscribers.filter(sub => sub.confirmed)
    const pending = this.subscribers.filter(sub => !sub.confirmed)
    
    return {
      totalSubscribers: this.subscribers.length,
      confirmedSubscribers: confirmed.length,
      pendingConfirmations: pending.length,
      unsubscribed: this.unsubscribed.length
    }
  }

  getSubscribers(): SubscriberData[] {
    return this.subscribers.filter(sub => sub.confirmed)
  }

  getAllSubscribers(): SubscriberData[] {
    return this.subscribers
  }

  // Newsletter sending functionality
  async sendNewsletter(subject: string, content: string, htmlContent?: string): Promise<{ success: boolean; sent: number; failed: number }> {
    if (!this.isConfigured) {
      throw new Error('Email service not configured')
    }

    const confirmedSubscribers = this.getSubscribers()
    let sent = 0
    let failed = 0

    console.log(`Sending newsletter to ${confirmedSubscribers.length} subscribers`)

    for (const subscriber of confirmedSubscribers) {
      try {
        const templateParams = {
          to_email: subscriber.email,
          to_name: subscriber.email.split('@')[0],
          from_name: NEWSLETTER_CONFIG.FROM_NAME,
          site_name: SITE_CONFIG.NAME,
          subject: subject,
          content: content,
          html_content: htmlContent || content,
          unsubscribe_url: `${SITE_CONFIG.URL}/unsubscribe?id=${subscriber.id}`,
          current_year: new Date().getFullYear(),
          site_url: SITE_CONFIG.URL
        }

        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.NEWSLETTER_TEMPLATE_ID || EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        )

        sent++
        
        // Add delay to avoid rate limiting (EmailJS free tier: 200 emails/month)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, error)
        failed++
      }
    }

    return { success: sent > 0, sent, failed }
  }

  // Send contact form message
  async sendContactMessage(data: {
    from_name: string
    from_email: string
    subject: string
    message: string
    to_email: string
  }): Promise<{ success: boolean; message: string }> {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.from_email)) {
      return { success: false, message: 'Please enter a valid email address.' }
    }

    if (!this.isConfigured) {
      // Store locally in development
      const contactMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      contactMessages.push({
        ...data,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('contact_messages', JSON.stringify(contactMessages))
      
      return {
        success: true,
        message: 'Message saved locally (development mode). Configure EmailJS for production.'
      }
    }

    try {
      const templateParams = {
        from_name: data.from_name,
        from_email: data.from_email,
        subject: data.subject,
        message: data.message,
        to_email: data.to_email,
        reply_to: data.from_email,
        current_year: new Date().getFullYear(),
        site_name: SITE_CONFIG.NAME,
        site_url: SITE_CONFIG.URL
      }

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID, // Main template for contact messages
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      )

      if (result.status === 200) {
        return {
          success: true,
          message: 'Thank you for your message! I\'ll get back to you soon.'
        }
      } else {
        throw new Error(`EmailJS returned status: ${result.status}`)
      }
    } catch (error) {
      console.error('Contact message error:', error)
      return { 
        success: false, 
        message: 'Failed to send message. Please try again later or contact me directly.' 
      }
    }
  }

  // Export subscribers for external use
  exportSubscribers(): string {
    const csvHeader = 'Email,Confirmed,Source,Subscription Date\n'
    const csvData = this.subscribers.map(sub => 
      `${sub.email},${sub.confirmed},${sub.source},${sub.timestamp}`
    ).join('\n')
    
    return csvHeader + csvData
  }

  // Import subscribers (for migration)
  importSubscribers(csvData: string): { imported: number; skipped: number } {
    const lines = csvData.split('\n').slice(1) // Skip header
    let imported = 0
    let skipped = 0

    for (const line of lines) {
      const [email, confirmed, source, timestamp] = line.split(',')
      
      if (email && !this.subscribers.find(sub => sub.email === email)) {
        this.subscribers.push({
          email: email.trim(),
          confirmed: confirmed === 'true',
          source: source || 'import',
          timestamp: timestamp || new Date().toISOString(),
          id: this.generateId()
        })
        imported++
      } else {
        skipped++
      }
    }

    this.saveData()
    return { imported, skipped }
  }

  // Get configuration status for debugging
  getConfigStatus() {
    return {
      isConfigured: this.isConfigured,
      hasServiceId: !!EMAILJS_CONFIG.SERVICE_ID,
      hasTemplateId: !!EMAILJS_CONFIG.TEMPLATE_ID,
      hasPublicKey: !!EMAILJS_CONFIG.PUBLIC_KEY,
      hasNewsletterTemplate: !!EMAILJS_CONFIG.NEWSLETTER_TEMPLATE_ID,
      siteUrl: SITE_CONFIG.URL,
      siteName: SITE_CONFIG.NAME,
      fromName: NEWSLETTER_CONFIG.FROM_NAME,
      fromEmail: NEWSLETTER_CONFIG.FROM_EMAIL
    }
  }
}

export const emailService = new EmailService()

// Utility functions for React components
export const useNewsletterStats = () => {
  return emailService.getStats()
}

export const downloadSubscribersCsv = () => {
  const csvContent = emailService.exportSubscribers()
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Debug function to check configuration
export const debugEmailConfig = () => {
  console.log('📧 Email Service Configuration:', emailService.getConfigStatus())
}