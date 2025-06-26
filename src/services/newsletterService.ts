// Newsletter service for Firebase Firestore integration with Cloudflare Workers
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  deleteDoc,
  onSnapshot,
  getCountFromServer
} from 'firebase/firestore';
import { firestore as db } from '../firebase';
import { analyticsEvents } from '../components/Analytics';

// Cloudflare Worker endpoint for email functions
const WORKER_URL = 'https://cloudflare-worker.1saifj.workers.dev';

// Types
export interface Subscriber {
  id?: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  source?: string;
  confirmationToken?: string;
  unsubscribeToken?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

export interface AnalyticsEvent {
  id?: string;
  type: 'subscription' | 'confirmation' | 'unsubscribe' | 'newsletter_sent';
  email?: string;
  timestamp: Date;
  metadata?: {
    source?: string;
    campaign?: string;
    userAgent?: string;
  };
}

export interface SubscriptionStats {
  totalSubscribers: number;
  confirmedSubscribers: number;
  pendingSubscribers: number;
  unsubscribedCount: number;
  subscriptionsToday: number;
  subscriptionsThisWeek: number;
  subscriptionsThisMonth: number;
  confirmationRate: number;
  unsubscribeRate: number;
}

// Generate unique tokens
function generateToken(): string {
  return crypto.randomUUID();
}

// Helper function to call Cloudflare Worker endpoints
async function callWorkerEndpoint(endpoint: string, data?: any, method: 'GET' | 'POST' = 'POST'): Promise<any> {
  try {
    const response = await fetch(`${WORKER_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker request failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudflare Worker request failed:', error);
    throw error;
  }
}

// Email functions using Cloudflare Workers
export const emailService = {
  async sendConfirmationEmail(email: string, confirmationToken: string): Promise<void> {
    await callWorkerEndpoint('/send-confirmation', {
      email,
      confirmationToken,
    });
  },

  async sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<void> {
    await callWorkerEndpoint('/send-welcome', {
      email,
      unsubscribeToken,
    });
  },

  async sendUnsubscribeConfirmation(email: string): Promise<void> {
    await callWorkerEndpoint('/send-unsubscribe', {
      email,
    });
  },

  async sendNewsletter(subject: string, content: string, isTest: boolean = false): Promise<{ totalSent: number; errors: number }> {
    const result = await callWorkerEndpoint('/send-newsletter', {
      subject,
      content,
      isTest,
    });
    return {
      totalSent: result.totalSent || 0,
      errors: result.errors || 0,
    };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const result = await callWorkerEndpoint('/health', null, 'GET');
      return result.status === 'healthy';
    } catch {
      return false;
    }
  },
};

// Subscriber management
export const subscriberService = {
  async subscribe(email: string, metadata?: Subscriber['metadata']): Promise<{ success: boolean; message: string; requiresConfirmation?: boolean; subscriberId?: string }> {
    try {
      // Check if email already exists
      const existingQuery = query(
        collection(db, 'subscribers'),
        where('email', '==', email.toLowerCase())
      );
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        const existingDoc = existingDocs.docs[0];
        const existingData = existingDoc.data() as Subscriber;
        
        if (existingData.status === 'confirmed') {
          return { success: false, message: 'Email is already subscribed and confirmed.' };
        } else if (existingData.status === 'pending') {
          // Resend confirmation email
          if (existingData.confirmationToken) {
            await emailService.sendConfirmationEmail(email, existingData.confirmationToken);
          }
          return { 
            success: true, 
            message: 'Confirmation email has been resent.', 
            requiresConfirmation: true 
          };
        } else if (existingData.status === 'unsubscribed') {
          // Reactivate subscription
          const confirmationToken = generateToken();
          const unsubscribeToken = generateToken();
          
          await updateDoc(doc(db, 'subscribers', existingDoc.id), {
            status: 'pending',
            subscribedAt: serverTimestamp(),
            confirmationToken,
            unsubscribeToken,
            metadata: metadata || {},
          });

                await emailService.sendConfirmationEmail(email, confirmationToken);
      await this.trackEvent('subscription', email, { source: metadata?.referrer });
      
      // Track with Cloudflare Analytics
      analyticsEvents.newsletterSubscription(email, 'default');

      return { 
        success: true, 
        message: 'Please check your email to confirm your subscription.', 
        requiresConfirmation: true,
        subscriberId: existingDoc.id,
      };
        }
      }

      // Create new subscriber
      const confirmationToken = generateToken();
      const unsubscribeToken = generateToken();
      
      const newSubscriber: Omit<Subscriber, 'id'> = {
        email: email.toLowerCase(),
        status: 'pending',
        subscribedAt: new Date(),
        confirmationToken,
        unsubscribeToken,
        source: metadata?.referrer || 'website',
        metadata: metadata || {},
      };

      const docRef = await addDoc(collection(db, 'subscribers'), {
        ...newSubscriber,
        subscribedAt: serverTimestamp(),
      });

      // Send confirmation email via Cloudflare Worker
      await emailService.sendConfirmationEmail(email, confirmationToken);

      // Track subscription event
      await this.trackEvent('subscription', email, { source: metadata?.referrer });

      return { 
        success: true, 
        message: 'Please check your email to confirm your subscription.', 
        requiresConfirmation: true,
        subscriberId: docRef.id,
      };
    } catch (error) {
      console.error('Subscription error:', error);
      return { success: false, message: 'Failed to process subscription. Please try again.' };
    }
  },

  async confirmSubscription(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const q = query(
        collection(db, 'subscribers'),
        where('confirmationToken', '==', token)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, message: 'Invalid or expired confirmation token.' };
      }

      const docSnapshot = querySnapshot.docs[0];
      const subscriber = docSnapshot.data() as Subscriber;

      if (subscriber.status === 'confirmed') {
        return { success: false, message: 'Email is already confirmed.' };
      }

      // Update subscriber status
      await updateDoc(doc(db, 'subscribers', docSnapshot.id), {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmationToken: null, // Remove token after confirmation
      });

      // Send welcome email via Cloudflare Worker
      if (subscriber.unsubscribeToken) {
        await emailService.sendWelcomeEmail(subscriber.email, subscriber.unsubscribeToken);
      }

      // Track confirmation event
      await this.trackEvent('confirmation', subscriber.email);

      return { success: true, message: 'Subscription confirmed successfully!' };
    } catch (error) {
      console.error('Confirmation error:', error);
      return { success: false, message: 'Failed to confirm subscription. Please try again.' };
    }
  },

  async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const q = query(
        collection(db, 'subscribers'),
        where('unsubscribeToken', '==', token)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, message: 'Invalid unsubscribe token.' };
      }

      const docSnapshot = querySnapshot.docs[0];
      const subscriber = docSnapshot.data() as Subscriber;

      if (subscriber.status === 'unsubscribed') {
        return { success: false, message: 'Email is already unsubscribed.' };
      }

      // Update subscriber status
      await updateDoc(doc(db, 'subscribers', docSnapshot.id), {
        status: 'unsubscribed',
        unsubscribedAt: serverTimestamp(),
      });

      // Send unsubscribe confirmation email
      await emailService.sendUnsubscribeConfirmation(subscriber.email);

      // Track unsubscribe event
      await this.trackEvent('unsubscribe', subscriber.email);

      return { success: true, message: 'Successfully unsubscribed.' };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return { success: false, message: 'Failed to unsubscribe. Please try again.' };
    }
  },

  async getSubscribers(status?: Subscriber['status'], pageSize: number = 50): Promise<Subscriber[]> {
    try {
      let q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
      
      if (status) {
        q = query(collection(db, 'subscribers'), where('status', '==', status), orderBy('subscribedAt', 'desc'));
      }
      
      if (pageSize) {
        q = query(q, limit(pageSize));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate(),
        confirmedAt: doc.data().confirmedAt?.toDate(),
        unsubscribedAt: doc.data().unsubscribedAt?.toDate(),
      } as Subscriber));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  },

  async deleteSubscriber(id: string): Promise<void> {
    await deleteDoc(doc(db, 'subscribers', id));
  },

  async trackEvent(type: AnalyticsEvent['type'], email?: string, metadata?: AnalyticsEvent['metadata']): Promise<void> {
    try {
      const event: Omit<AnalyticsEvent, 'id'> = {
        type,
        email: email?.toLowerCase(),
        timestamp: new Date(),
        metadata: metadata || {},
      };

      await addDoc(collection(db, 'analytics'), {
        ...event,
        timestamp: serverTimestamp(),
      });

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const statsRef = doc(db, 'daily_stats', today);
      
      const updateData: any = {};
      updateData[`${type}_count`] = increment(1);
      
      await updateDoc(statsRef, updateData).catch(async () => {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'daily_stats'), {
          date: today,
          [`${type}_count`]: 1,
        });
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Real-time subscription to subscriber changes
  subscribeToSubscribers(callback: (subscribers: Subscriber[]) => void, status?: Subscriber['status']): () => void {
    let q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    
    if (status) {
      q = query(collection(db, 'subscribers'), where('status', '==', status), orderBy('subscribedAt', 'desc'));
    }

    return onSnapshot(q, (querySnapshot) => {
      const subscribers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate(),
        confirmedAt: doc.data().confirmedAt?.toDate(),
        unsubscribedAt: doc.data().unsubscribedAt?.toDate(),
      } as Subscriber));
      
      callback(subscribers);
    });
  },
};

// Analytics and stats
export const analyticsService = {
  async getStats(): Promise<SubscriptionStats> {
    try {
      const [totalSnapshot, confirmedSnapshot, pendingSnapshot, unsubscribedSnapshot] = await Promise.all([
        getCountFromServer(collection(db, 'subscribers')),
        getCountFromServer(query(collection(db, 'subscribers'), where('status', '==', 'confirmed'))),
        getCountFromServer(query(collection(db, 'subscribers'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(db, 'subscribers'), where('status', '==', 'unsubscribed'))),
      ]);

      const total = totalSnapshot.data().count;
      const confirmed = confirmedSnapshot.data().count;
      const pending = pendingSnapshot.data().count;
      const unsubscribed = unsubscribedSnapshot.data().count;

      // Calculate time-based stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [todaySnapshot, weekSnapshot, monthSnapshot] = await Promise.all([
        getCountFromServer(query(collection(db, 'subscribers'), where('subscribedAt', '>=', today))),
        getCountFromServer(query(collection(db, 'subscribers'), where('subscribedAt', '>=', weekAgo))),
        getCountFromServer(query(collection(db, 'subscribers'), where('subscribedAt', '>=', monthAgo))),
      ]);

      const subscriptionsToday = todaySnapshot.data().count;
      const subscriptionsThisWeek = weekSnapshot.data().count;
      const subscriptionsThisMonth = monthSnapshot.data().count;

      return {
        totalSubscribers: total,
        confirmedSubscribers: confirmed,
        pendingSubscribers: pending,
        unsubscribedCount: unsubscribed,
        subscriptionsToday,
        subscriptionsThisWeek,
        subscriptionsThisMonth,
        confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
        unsubscribeRate: total > 0 ? (unsubscribed / total) * 100 : 0,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalSubscribers: 0,
        confirmedSubscribers: 0,
        pendingSubscribers: 0,
        unsubscribedCount: 0,
        subscriptionsToday: 0,
        subscriptionsThisWeek: 0,
        subscriptionsThisMonth: 0,
        confirmationRate: 0,
        unsubscribeRate: 0,
      };
    }
  },

  async getEvents(limitCount: number = 100): Promise<AnalyticsEvent[]> {
    try {
      const q = query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as AnalyticsEvent));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
};

// Export the services
export default {
  subscriber: subscriberService,
  analytics: analyticsService,
  email: emailService,
};

// Backward compatibility exports for existing components
export class NewsletterService {
  static async subscribeEmail(email: string, sourceIP?: string, consentGiven: boolean = true) {
    const metadata = { ipAddress: sourceIP };
    const result = await subscriberService.subscribe(email, metadata);

    return {
      ...result
    };
  }

  static async confirmSubscription(token: string) {
    return subscriberService.confirmSubscription(token);
  }

  static async unsubscribe(token: string) {
    return subscriberService.unsubscribe(token);
  }

  static async getAnalytics() {
    return analyticsService.getStats();
  }

  static async getSubscribers(pageSize: number = 20) {
    return subscriberService.getSubscribers(undefined, pageSize);
  }
} 