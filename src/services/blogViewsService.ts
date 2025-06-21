// Blog views service for Firebase Firestore integration
import { 
  collection, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { firestore as db } from '../firebase';
import { createSlugFromTitle } from '../utils/slugUtils';

// Types
export interface BlogView {
  id?: string;
  blogSlug: string;
  viewedAt: Timestamp;
  sessionId: string;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    country?: string;
    device?: 'mobile' | 'tablet' | 'desktop';
    source?: string;
  };
}

export interface BlogViewStats {
  blogSlug: string;
  totalViews: number;
  uniqueViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  lastViewed?: Timestamp;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface DailyViewMetrics {
  id?: string;
  date: string; // YYYY-MM-DD format
  blogSlug: string;
  views: number;
  uniqueViews: number;
  timestamp: Timestamp;
}

// Helper functions
function generateSessionId(): string {
  return crypto.randomUUID();
}

function getSessionId(): string {
  const storageKey = 'blog_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const userAgent = navigator.userAgent;
  if (/Mobi|Android/i.test(userAgent)) return 'mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getThisWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.setDate(diff));
}

function getThisMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Blog Views Service
export const blogViewsService = {
  // Track a blog view
  async trackView(blogSlug: string, metadata?: Partial<BlogView['metadata']>): Promise<void> {
    try {
      const sessionId = getSessionId();
      const today = getToday();
      
      // Check if this session already viewed this blog today (to prevent spam)
      const recentViewQuery = query(
        collection(db, 'blogViews'),
        where('blogSlug', '==', blogSlug),
        where('sessionId', '==', sessionId),
        orderBy('viewedAt', 'desc'),
        limit(1)
      );
      
      const recentViews = await getDocs(recentViewQuery);
      
      // Only track if no view in the last 30 minutes from same session
      if (!recentViews.empty) {
        const lastView = recentViews.docs[0].data() as BlogView;
        const lastViewTime = lastView.viewedAt.toDate();
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        if (lastViewTime > thirtyMinutesAgo) {
          console.log('View already tracked recently for this session');
          return;
        }
      }

      // Create new view record
      const viewData: Omit<BlogView, 'id'> = {
        blogSlug,
        viewedAt: serverTimestamp() as Timestamp,
        sessionId,
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
          device: detectDevice(),
          source: metadata?.source || 'direct',
          ...metadata
        }
      };

      // Add view record
      await addDoc(collection(db, 'blogViews'), viewData);

      // Update daily metrics
      await this.updateDailyMetrics(blogSlug, sessionId, today);

      console.log('Blog view tracked successfully:', blogSlug);
    } catch (error) {
      console.error('Failed to track blog view:', error);
      // Don't throw error to avoid disrupting user experience
    }
  },

  // Update daily metrics (aggregated data)
  async updateDailyMetrics(blogSlug: string, sessionId: string, date: string): Promise<void> {
    try {
      const metricsId = `${blogSlug}_${date}`;
      const metricsRef = doc(db, 'blogViewMetrics', metricsId);
      
      const metricsDoc = await getDoc(metricsRef);
      
      if (metricsDoc.exists()) {
        // Check if this session contributed to unique views today
        const existingViewQuery = query(
          collection(db, 'blogViews'),
          where('blogSlug', '==', blogSlug),
          where('sessionId', '==', sessionId)
        );
        
        const existingSessions = await getDocs(existingViewQuery);
        const isUniqueView = existingSessions.size === 1; // First view from this session
        
        // Update existing metrics
        await updateDoc(metricsRef, {
          views: increment(1),
          uniqueViews: increment(isUniqueView ? 1 : 0),
          timestamp: serverTimestamp()
        });
      } else {
        // Create new metrics record
        const newMetrics: Omit<DailyViewMetrics, 'id'> = {
          date,
          blogSlug,
          views: 1,
          uniqueViews: 1,
          timestamp: serverTimestamp() as Timestamp
        };
        
        await updateDoc(metricsRef, newMetrics);
      }
    } catch (error) {
      console.error('Failed to update daily metrics:', error);
    }
  },

  // Get cached view count quickly (for optimistic updates)
  async getQuickViewCount(blogSlug: string): Promise<number> {
    try {
      // Try to get from metrics first (faster)
      const metricsQuery = query(
        collection(db, 'blogViewMetrics'),
        where('blogSlug', '==', blogSlug),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const metricsSnapshot = await getDocs(metricsQuery);
      if (!metricsSnapshot.empty) {
        const latestMetric = metricsSnapshot.docs[0].data() as DailyViewMetrics;
        return latestMetric.views || 0;
      }
      
      // Fallback to counting actual views (slower but accurate)
      const viewsQuery = query(
        collection(db, 'blogViews'),
        where('blogSlug', '==', blogSlug)
      );
      
      const viewsSnapshot = await getDocs(viewsQuery);
      return viewsSnapshot.size;
    } catch (error) {
      console.error('Failed to get quick view count:', error);
      return 0;
    }
  },

  // Get view stats for a specific blog
  async getBlogStats(blogSlug: string): Promise<BlogViewStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = getThisWeekStart();
      const monthStart = getThisMonthStart();

      // Get all views for this blog
      const viewsQuery = query(
        collection(db, 'blogViews'),
        where('blogSlug', '==', blogSlug),
        orderBy('viewedAt', 'desc')
      );
      
      const viewsSnapshot = await getDocs(viewsQuery);
      const views = viewsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as BlogView[];

      // Calculate stats
      const totalViews = views.length;
      const uniqueViews = new Set(views.map(v => v.sessionId)).size;
      
      const viewsToday = views.filter(v => 
        v.viewedAt.toDate() >= todayStart
      ).length;
      
      const viewsThisWeek = views.filter(v => 
        v.viewedAt.toDate() >= weekStart
      ).length;
      
      const viewsThisMonth = views.filter(v => 
        v.viewedAt.toDate() >= monthStart
      ).length;

      // Get referrer stats
      const referrerCounts = views.reduce((acc, view) => {
        const referrer = view.metadata?.referrer || 'direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get device breakdown
      const deviceCounts = views.reduce((acc, view) => {
        const device = view.metadata?.device || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, { mobile: 0, tablet: 0, desktop: 0 });

      return {
        blogSlug,
        totalViews,
        uniqueViews,
        viewsToday,
        viewsThisWeek,
        viewsThisMonth,
        lastViewed: views[0]?.viewedAt,
        topReferrers,
        deviceBreakdown: deviceCounts
      };
    } catch (error) {
      console.error('Failed to get blog stats:', error);
      return {
        blogSlug,
        totalViews: 0,
        uniqueViews: 0,
        viewsToday: 0,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        topReferrers: [],
        deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 }
      };
    }
  },

  // Get view stats for multiple blogs
  async getAllBlogStats(): Promise<BlogViewStats[]> {
    try {
      // Get unique blog slugs from views
      const viewsSnapshot = await getDocs(collection(db, 'blogViews'));
      const uniqueSlugs = [...new Set(
        viewsSnapshot.docs.map(doc => doc.data().blogSlug)
      )];

      // Get stats for each blog
      const statsPromises = uniqueSlugs.map(slug => this.getBlogStats(slug));
      return await Promise.all(statsPromises);
    } catch (error) {
      console.error('Failed to get all blog stats:', error);
      return [];
    }
  },

  // Get trending blogs (most viewed in last 7 days)
  async getTrendingBlogs(limitCount: number = 10): Promise<Array<{ blogSlug: string; views: number }>> {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recentViewsQuery = query(
        collection(db, 'blogViews'),
        where('viewedAt', '>=', weekAgo),
        orderBy('viewedAt', 'desc')
      );

      const recentViews = await getDocs(recentViewsQuery);
      
      // Count views per blog
      const viewCounts = recentViews.docs.reduce((acc, doc) => {
        const blogSlug = doc.data().blogSlug;
        acc[blogSlug] = (acc[blogSlug] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort and limit
      return Object.entries(viewCounts)
        .map(([blogSlug, views]) => ({ blogSlug, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to get trending blogs:', error);
      return [];
    }
  },

  // Subscribe to real-time view updates for a blog
  subscribeToViews(blogSlug: string, callback: (stats: BlogViewStats) => void): () => void {
    const viewsQuery = query(
      collection(db, 'blogViews'),
      where('blogSlug', '==', blogSlug),
      orderBy('viewedAt', 'desc'),
      limit(100) // Limit for performance
    );

    return onSnapshot(viewsQuery, async () => {
      const stats = await this.getBlogStats(blogSlug);
      callback(stats);
    });
  },

  // Get daily metrics for analytics
  async getDailyMetrics(blogSlug?: string, days: number = 30): Promise<DailyViewMetrics[]> {
    try {
      let metricsQuery;
      
      if (blogSlug) {
        metricsQuery = query(
          collection(db, 'blogViewMetrics'),
          where('blogSlug', '==', blogSlug),
          orderBy('timestamp', 'desc'),
          limit(days)
        );
      } else {
        metricsQuery = query(
          collection(db, 'blogViewMetrics'),
          orderBy('timestamp', 'desc'),
          limit(days * 10) // More results when getting all blogs
        );
      }

      const metricsSnapshot = await getDocs(metricsQuery);
      return metricsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DailyViewMetrics[];
    } catch (error) {
      console.error('Failed to get daily metrics:', error);
      return [];
    }
  },

  // Clear old view data (for maintenance)
  async cleanupOldViews(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const oldViewsQuery = query(
        collection(db, 'blogViews'),
        where('viewedAt', '<', cutoffDate),
        limit(100) // Process in batches
      );

      const oldViews = await getDocs(oldViewsQuery);
      
      const deletePromises = oldViews.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${oldViews.size} old view records`);
    } catch (error) {
      console.error('Failed to cleanup old views:', error);
    }
  }
};

export default blogViewsService; 