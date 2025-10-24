// Firebase configuration for newsletter integration
// Re-export from the centralized config
import app from './config/firebase';
import { db } from './config/firebase';

// Initialize Analytics (temporarily disabled to avoid content blockers)
let analytics = null;
/*
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics blocked by content blocker or unavailable');
    analytics = null;
  }
}
*/

// Connect to Firestore emulator in development (disabled - using production Firebase)
// if (import.meta.env.DEV && !import.meta.env.VITE_USE_FIREBASE_PROD) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firestore emulator already connected or not available');
//   }
// }

// TypeScript interfaces for Firestore collections

/**
 * Subscription status type
 */
export type SubscriptionStatus = 'pending' | 'confirmed' | 'unsubscribed';

/**
 * Subscriber document interface for newsletter subscriptions
 */
export interface Subscriber {
  email: string;                        // Validated email address
  status: SubscriptionStatus;           // Subscription status
  subscribedAt: any;                    // Firestore Timestamp
  confirmedAt?: any;                    // Firestore Timestamp or null
  unsubscribedAt?: any;                 // Firestore Timestamp or null
  sourceIP?: string | null;             // For spam protection and analytics
  consentGiven: boolean;                // GDPR consent status
  confirmationToken?: string | null;    // Unique token for email confirmation
  unsubscribeToken: string;             // Unique token for one-click unsubscribe
  metadata: {
    userAgent?: string | null;          // Browser/device info
    source: string;                     // Source page/component
  };
}

/**
 * Analytics event interface for tracking subscription events
 */
export interface AnalyticsEvent {
  type: 'subscription_started' | 'subscription_confirmed' | 'unsubscribed' | 'subscription_error' | 'email_sent' | 'bounce' | 'click';
  timestamp?: any;                      // Firestore Timestamp
  subscriberId?: string;                // Reference to subscriber document
  email?: string;                       // Email for the event
  metadata?: Record<string, any>;       // Event-specific data
}

/**
 * Subscription result interface
 */
export interface SubscriptionResult {
  success: boolean;
  message: string;
  subscriberId?: string;
  confirmationToken?: string;
  error?: string;
}

/**
 * Analytics metrics interface
 */
export interface AnalyticsMetrics {
  totalSubscribers: number;
  pendingConfirmations: number;
  totalUnsubscribed: number;
  todaySubscriptions: number;
  todayUnsubscribes: number;
  conversionRate: number;
  recentEvents: Array<AnalyticsEvent & { id: string }>;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: any;
}

/**
 * Newsletter settings interface for global configuration
 */
export interface NewsletterSettings {
  subscriberCounts: {
    pending: number;
    confirmed: number;
    unsubscribed: number;
  };
  updatedAt: any;                       // Firestore Timestamp
  isActive?: boolean;                   // Whether newsletter is currently active
  maxSubscriptionsPerIP?: number;       // Rate limiting per IP address
  maxSubscriptionsPerHour?: number;     // Global rate limiting
}

/**
 * Subscription analytics aggregation interface
 */
export interface SubscriptionMetrics {
  id: string;                           // Document ID (date-based, e.g., '2024-01-15')
  date: Date;                           // Metrics date
  totalSubscribers: number;             // Total confirmed subscribers
  newSubscriptions: number;             // New subscriptions for this period
  confirmations: number;                // Email confirmations for this period
  unsubscribes: number;                 // Unsubscribes for this period
  bounces: number;                      // Email bounces for this period
  clicks: number;                       // Total email clicks for this period
  conversionRate: number;               // Confirmation rate (confirmations/subscriptions)
  unsubscribeRate: number;              // Unsubscribe rate
  growth: number;                       // Net growth (subscriptions - unsubscribes)
  topSources: Array<{                   // Top traffic sources
    source: string;
    count: number;
  }>;
  topTopics: Array<{                    // Most popular topics
    topic: string;
    count: number;
  }>;
}

// Collection names as constants
export const COLLECTIONS = {
  SUBSCRIBERS: 'subscribers',
  ANALYTICS: 'analytics', 
  SETTINGS: 'settings',
  METRICS: 'metrics',
  BLOG_VIEWS: 'blogViews',
  BLOG_VIEW_METRICS: 'blogViewMetrics'
} as const;

// Export Firebase services
export { app, db as firestore, analytics };

// Helper function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to generate unique tokens
export const generateToken = (): string => {
  return crypto.randomUUID();
};

// Helper function to get client IP (for rate limiting)
export const getClientIP = async (): Promise<string> => {
  try {
    // In production, this would be handled by Cloud Functions
    // For client-side, we'll use a fallback
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not get client IP:', error);
    return 'unknown';
  }
};

// Helper function to get user agent
export const getUserAgent = (): string => {
  return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
};

// Export default configuration for easy importing
export default {
  app,
  db,
  analytics,
  COLLECTIONS,
  isValidEmail,
  generateToken,
  getClientIP,
  getUserAgent
}; 