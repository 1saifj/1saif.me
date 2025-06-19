// Newsletter service for Firebase Firestore integration
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  increment,
  serverTimestamp,
  runTransaction,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch
} from 'firebase/firestore'
import { app, firestore } from '../firebase'
import type { 
  Subscriber, 
  SubscriptionStatus, 
  AnalyticsEvent, 
  NewsletterSettings,
  SubscriptionResult,
  AnalyticsMetrics,
  PaginatedResult
} from '../firebase'
// Firebase Functions removed - using direct client-side approach

// Collection references
const SUBSCRIBERS_COLLECTION = 'subscribers'
const ANALYTICS_COLLECTION = 'analytics'
const SETTINGS_COLLECTION = 'settings'

// Firebase Functions removed - email handling will be done via Cloudflare Workers

/**
 * Newsletter Service Class
 * Handles all newsletter-related operations with Firestore
 */
export class NewsletterService {
  
  /**
   * Subscribe a new email to the newsletter
   * @param email - The email address to subscribe
   * @param sourceIP - Optional IP address for tracking
   * @param consentGiven - GDPR consent status
   * @returns Promise with subscription result
   */
  static async subscribeEmail(
    email: string, 
    sourceIP?: string, 
    consentGiven: boolean = true
  ): Promise<SubscriptionResult> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format')
      }

      // Check if email already exists
      const existingSubscriber = await this.getSubscriberByEmail(email)
      if (existingSubscriber) {
        if (existingSubscriber.status === 'confirmed') {
          return {
            success: false,
            message: 'Email is already subscribed',
            subscriberId: existingSubscriber.id
          }
        } else if (existingSubscriber.status === 'pending') {
          return {
            success: false,
            message: 'Confirmation email already sent. Please check your inbox.',
            subscriberId: existingSubscriber.id
          }
        }
      }

      // Create new subscriber document
      const subscriberData: Omit<Subscriber, 'id'> = {
        email: email.toLowerCase().trim(),
        status: 'pending',
        subscribedAt: serverTimestamp() as Timestamp,
        confirmedAt: null,
        unsubscribedAt: null,
        sourceIP: sourceIP || null,
        consentGiven,
        confirmationToken: this.generateConfirmationToken(),
        unsubscribeToken: this.generateUnsubscribeToken(),
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
          source: 'website'
        }
      }

      // Add subscriber to Firestore
      const subscriberRef = await addDoc(
        collection(firestore, SUBSCRIBERS_COLLECTION), 
        subscriberData
      )

      // Log analytics event
      await this.logAnalyticsEvent({
        type: 'subscription_started',
        email,
        subscriberId: subscriberRef.id,
        metadata: {
          sourceIP,
          consentGiven
        }
      })

      // Update global subscription counts
      await this.updateSubscriptionCounts('pending', 1)

      return {
        success: true,
        message: 'Subscription successful! Please check your email to confirm.',
        subscriberId: subscriberRef.id,
        confirmationToken: subscriberData.confirmationToken || undefined
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error)
      
      // Log error analytics event
      await this.logAnalyticsEvent({
        type: 'subscription_error',
        email,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          sourceIP
        }
      })

      return {
        success: false,
        message: 'Subscription failed. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Confirm email subscription
   * @param token - Confirmation token from email
   * @returns Promise with confirmation result
   */
  static async confirmSubscription(token: string): Promise<SubscriptionResult> {
    try {
      // Find subscriber by confirmation token
      const q = query(
        collection(firestore, SUBSCRIBERS_COLLECTION),
        where('confirmationToken', '==', token),
        where('status', '==', 'pending')
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return {
          success: false,
          message: 'Invalid or expired confirmation link'
        }
      }

      const subscriberDoc = querySnapshot.docs[0]
      const subscriberData = subscriberDoc.data() as Subscriber

      // Update subscriber status to confirmed
      await updateDoc(doc(firestore, SUBSCRIBERS_COLLECTION, subscriberDoc.id), {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmationToken: null // Clear token after confirmation
      })

      // Log analytics event
      await this.logAnalyticsEvent({
        type: 'subscription_confirmed',
        email: subscriberData.email,
        subscriberId: subscriberDoc.id
      })

      // Update subscription counts
      await this.updateSubscriptionCounts('confirmed', 1)
      await this.updateSubscriptionCounts('pending', -1)

      return {
        success: true,
        message: 'Email confirmed successfully! Welcome to our newsletter.',
        subscriberId: subscriberDoc.id
      }

    } catch (error) {
      console.error('Confirmation error:', error)
      return {
        success: false,
        message: 'Confirmation failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Unsubscribe email from newsletter
   * @param token - Unsubscribe token from email
   * @returns Promise with unsubscribe result
   */
  static async unsubscribe(token: string): Promise<SubscriptionResult> {
    try {
      // Find subscriber by unsubscribe token
      const q = query(
        collection(firestore, SUBSCRIBERS_COLLECTION),
        where('unsubscribeToken', '==', token)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return {
          success: false,
          message: 'Invalid unsubscribe link'
        }
      }

      const subscriberDoc = querySnapshot.docs[0]
      const subscriberData = subscriberDoc.data() as Subscriber

      // Update subscriber status to unsubscribed
      await updateDoc(doc(firestore, SUBSCRIBERS_COLLECTION, subscriberDoc.id), {
        status: 'unsubscribed',
        unsubscribedAt: serverTimestamp()
      })

      // Log analytics event
      await this.logAnalyticsEvent({
        type: 'unsubscribed',
        email: subscriberData.email,
        subscriberId: subscriberDoc.id
      })

      // Update subscription counts
      if (subscriberData.status === 'confirmed') {
        await this.updateSubscriptionCounts('confirmed', -1)
      }
      await this.updateSubscriptionCounts('unsubscribed', 1)

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter.',
        subscriberId: subscriberDoc.id
      }

    } catch (error) {
      console.error('Unsubscribe error:', error)
      return {
        success: false,
        message: 'Unsubscribe failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get subscriber by email
   * @param email - Email address to search for
   * @returns Promise with subscriber data or null
   */
  static async getSubscriberByEmail(email: string): Promise<(Subscriber & { id: string }) | null> {
    try {
      const q = query(
        collection(firestore, SUBSCRIBERS_COLLECTION),
        where('email', '==', email.toLowerCase().trim())
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data() as Subscriber
      }

    } catch (error) {
      console.error('Error fetching subscriber:', error)
      return null
    }
  }

  /**
   * Get newsletter analytics and metrics
   * @returns Promise with analytics data
   */
  static async getAnalytics(): Promise<AnalyticsMetrics> {
    try {
      // Get subscription counts from settings
      const settingsDoc = await getDoc(doc(firestore, SETTINGS_COLLECTION, 'global'))
      const settings = settingsDoc.exists() ? settingsDoc.data() as NewsletterSettings : null

      // Get recent analytics events
      const recentEventsQuery = query(
        collection(firestore, ANALYTICS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
      
      const eventsSnapshot = await getDocs(recentEventsQuery)
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as AnalyticsEvent
      }))

      // Calculate metrics
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEvents = events.filter(event => 
        event.timestamp && event.timestamp.toDate() >= today
      )

      return {
        totalSubscribers: settings?.subscriberCounts?.confirmed || 0,
        pendingConfirmations: settings?.subscriberCounts?.pending || 0,
        totalUnsubscribed: settings?.subscriberCounts?.unsubscribed || 0,
        todaySubscriptions: todayEvents.filter(e => e.type === 'subscription_confirmed').length,
        todayUnsubscribes: todayEvents.filter(e => e.type === 'unsubscribed').length,
        conversionRate: this.calculateConversionRate(events),
        recentEvents: events.slice(0, 10) // Last 10 events
      }

    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        totalSubscribers: 0,
        pendingConfirmations: 0,
        totalUnsubscribed: 0,
        todaySubscriptions: 0,
        todayUnsubscribes: 0,
        conversionRate: 0,
        recentEvents: []
      }
    }
  }

  /**
   * Get paginated list of subscribers (admin use)
   * @param pageSize - Number of subscribers per page
   * @param lastDoc - Last document from previous page
   * @param status - Filter by subscription status
   * @returns Promise with paginated subscriber list
   */
  static async getSubscribers(
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    status?: SubscriptionStatus
  ): Promise<PaginatedResult<Subscriber & { id: string }>> {
    try {
      let q = query(
        collection(firestore, SUBSCRIBERS_COLLECTION),
        orderBy('subscribedAt', 'desc'),
        limit(pageSize)
      )

      if (status) {
        q = query(
          collection(firestore, SUBSCRIBERS_COLLECTION),
          where('status', '==', status),
          orderBy('subscribedAt', 'desc'),
          limit(pageSize)
        )
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const querySnapshot = await getDocs(q)
      
      const subscribers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Subscriber
      }))

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]

      return {
        data: subscribers,
        hasMore: querySnapshot.docs.length === pageSize,
        lastDoc: lastVisible
      }

    } catch (error) {
      console.error('Error fetching subscribers:', error)
      return {
        data: [],
        hasMore: false,
        lastDoc: undefined
      }
    }
  }

  /**
   * Bulk operations for admin use
   */
  static async bulkUnsubscribe(subscriberIds: string[]): Promise<boolean> {
    try {
      const batch = writeBatch(firestore)
      
      for (const id of subscriberIds) {
        const subscriberRef = doc(firestore, SUBSCRIBERS_COLLECTION, id)
        batch.update(subscriberRef, {
          status: 'unsubscribed',
          unsubscribedAt: serverTimestamp()
        })
      }

      await batch.commit()
      
      // Update counts
      await this.updateSubscriptionCounts('unsubscribed', subscriberIds.length)
      await this.updateSubscriptionCounts('confirmed', -subscriberIds.length)

      return true
    } catch (error) {
      console.error('Bulk unsubscribe error:', error)
      return false
    }
  }

  // Private helper methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static generateConfirmationToken(): string {
    return 'conf_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private static generateUnsubscribeToken(): string {
    return 'unsub_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private static async logAnalyticsEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(firestore, ANALYTICS_COLLECTION), {
        ...event,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error logging analytics event:', error)
    }
  }

  private static async updateSubscriptionCounts(
    status: SubscriptionStatus, 
    increment_amount: number
  ): Promise<void> {
    try {
      await runTransaction(firestore, async (transaction) => {
        const settingsRef = doc(firestore, SETTINGS_COLLECTION, 'global')
        const settingsDoc = await transaction.get(settingsRef)
        
        if (!settingsDoc.exists()) {
          // Create initial settings document
          transaction.set(settingsRef, {
            subscriberCounts: {
              pending: status === 'pending' ? increment_amount : 0,
              confirmed: status === 'confirmed' ? increment_amount : 0,
              unsubscribed: status === 'unsubscribed' ? increment_amount : 0
            },
            updatedAt: serverTimestamp()
          })
        } else {
          // Update existing counts
          transaction.update(settingsRef, {
            [`subscriberCounts.${status}`]: increment(increment_amount),
            updatedAt: serverTimestamp()
          })
        }
      })
    } catch (error) {
      console.error('Error updating subscription counts:', error)
    }
  }

  private static calculateConversionRate(events: AnalyticsEvent[]): number {
    const subscriptionStarted = events.filter(e => e.type === 'subscription_started').length
    const subscriptionConfirmed = events.filter(e => e.type === 'subscription_confirmed').length
    
    if (subscriptionStarted === 0) return 0
    return Math.round((subscriptionConfirmed / subscriptionStarted) * 100)
  }
}

export default NewsletterService 