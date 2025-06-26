// Email service wrapper for Firebase integration
// This maintains compatibility with the existing Newsletter component interface
import { NewsletterService } from '../services/newsletterService'

interface SubscriptionResult {
  success: boolean
  message: string
  subscriberId?: string
}

interface EmailStats {
  confirmedSubscribers: number
  totalSubscribers: number
  pendingSubscribers: number
  confirmationRate: number
}

/**
 * Email service wrapper class
 * Bridges existing Newsletter component interface with Firebase implementation
 */
class EmailService {
  private stats: EmailStats = {
    confirmedSubscribers: 0,
    totalSubscribers: 0,
    pendingSubscribers: 0,
    confirmationRate: 0
  }

  /**
   * Subscribe to newsletter
   * @param email - Email address
   * @param source - Source of subscription (e.g., 'website')
   */
  async subscribe(email: string, source: string = 'website'): Promise<SubscriptionResult> {
    try {
      let ipAddress: string | undefined;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        }
      } catch (ipError) {
        console.warn('Could not fetch IP address:', ipError);
        // Continue without IP address if it fails
      }

      const result = await NewsletterService.subscribeEmail(email, ipAddress, true)
      
      // Update local stats cache
      if (result.success) {
        await this.refreshStats()
      }

      return {
        success: result.success,
        message: result.message,
        subscriberId: result.subscriberId
      }
    } catch (error) {
      console.error('Email service subscription error:', error)
      return {
        success: false,
        message: 'Subscription failed. Please try again later.'
      }
    }
  }

  /**
   * Subscribe to newsletter (alias for backward compatibility)
   */
  async subscribeToNewsletter(email: string): Promise<SubscriptionResult> {
    return this.subscribe(email, 'website')
  }

  /**
   * Unsubscribe from newsletter
   * @param token - Unsubscribe token
   */
  async unsubscribe(token: string): Promise<SubscriptionResult> {
    try {
      const result = await NewsletterService.unsubscribe(token)
      
      // Update local stats cache
      if (result.success) {
        await this.refreshStats()
      }

      return {
        success: result.success,
        message: result.message
      }
    } catch (error) {
      console.error('Email service unsubscribe error:', error)
      return {
        success: false,
        message: 'Unsubscribe failed. Please try again later.'
      }
    }
  }

  /**
   * Get newsletter statistics
   */
  getStats(): EmailStats {
    return this.stats
  }

  /**
   * Refresh statistics from Firebase
   */
  async refreshStats(): Promise<void> {
    try {
      const analytics = await NewsletterService.getAnalytics()
      
      this.stats = {
        confirmedSubscribers: analytics.confirmedSubscribers,
        totalSubscribers: analytics.confirmedSubscribers + analytics.pendingSubscribers,
        pendingSubscribers: analytics.pendingSubscribers,
        confirmationRate: analytics.confirmationRate
      }
    } catch (error) {
      console.error('Error refreshing stats:', error)
      // Keep existing stats on error
    }
  }

  /**
   * Check if email service is configured
   * For Firebase, this always returns true since we have the config
   */
  isEmailServiceConfigured(): boolean {
    // Check if Firebase environment variables are available
    return !!(
      import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    )
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      await this.refreshStats()
    } catch (error) {
      console.error('Email service initialization error:', error)
    }
  }
}

// Create singleton instance
const emailService = new EmailService()

// Initialize on first import
emailService.initialize().catch(console.error)

/**
 * Debug email configuration (development only)
 */
export const debugEmailConfig = (): void => {
  if (import.meta.env.DEV) {
    console.group('🔧 Email Service Configuration')
    console.log('Service Type:', 'Firebase')
    console.log('Configured:', emailService.isEmailServiceConfigured())
    console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing')
    console.log('Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID || '❌ Missing')
    console.log('Current Stats:', emailService.getStats())
    console.groupEnd()
  }
}

export { emailService }
export default emailService 