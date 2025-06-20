// Debug utility for blog views tracking
import { firestore } from '../firebase';
import { blogViewsService } from '../services/blogViewsService';

export const debugBlogViews = {
  // Check Firebase configuration
  checkFirebaseConfig() {
    console.group('🔥 Firebase Configuration Debug');
    console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing');
    console.log('Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID || '❌ Missing');
    console.log('Firebase Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '❌ Missing');
    console.log('Firestore instance:', firestore ? '✅ Initialized' : '❌ Not initialized');
    
    // Test Firestore connection
    try {
      console.log('Firestore app:', firestore.app.name);
      console.log('Firestore project:', firestore.app.options.projectId);
    } catch (error) {
      console.error('❌ Firestore connection error:', error);
    }
    console.groupEnd();
  },

  // Test view tracking manually
  async testViewTracking(blogSlug: string = 'test-blog-post') {
    console.group('📊 Blog View Tracking Test');
    console.log(`Testing view tracking for: ${blogSlug}`);
    
    try {
      // Test trackView function
      console.log('🔄 Attempting to track view...');
      await blogViewsService.trackView(blogSlug, {
        source: 'debug-test'
      });
      console.log('✅ View tracked successfully!');
      
      // Get stats immediately after
      console.log('🔄 Fetching view stats...');
      const stats = await blogViewsService.getBlogStats(blogSlug);
      console.log('📈 View stats:', stats);
      
      return stats;
    } catch (error) {
      console.error('❌ View tracking failed:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        if ('code' in error) {
          console.error('Error code:', error.code);
        }
        if ('message' in error) {
          console.error('Error message:', error.message);
        }
      }
      
      return null;
    } finally {
      console.groupEnd();
    }
  },

  // Check browser environment
  checkBrowserEnvironment() {
    console.group('🌐 Browser Environment Debug');
    console.log('User Agent:', navigator.userAgent);
    console.log('Referrer:', document.referrer || 'none');
    console.log('Session Storage Available:', typeof sessionStorage !== 'undefined');
    console.log('Local Storage Available:', typeof localStorage !== 'undefined');
    
    // Check session ID generation
    try {
      const sessionId = sessionStorage.getItem('blog_session_id');
      console.log('Current Session ID:', sessionId || 'none (will be generated)');
    } catch (error) {
      console.error('Session storage error:', error);
    }
    console.groupEnd();
  },

  // Full diagnostic
  async runFullDiagnostic(blogSlug?: string) {
    console.log('🚀 Starting Blog Views Diagnostic...');
    console.log('='.repeat(50));
    
    this.checkFirebaseConfig();
    this.checkBrowserEnvironment();
    
    if (blogSlug) {
      const result = await this.testViewTracking(blogSlug);
      return result;
    }
    
    console.log('✅ Diagnostic complete. Check logs above for any issues.');
  }
};

// Auto-run basic check when this module loads
if (typeof window !== 'undefined') {
  console.log('🔍 Blog Views Debug Utility Loaded');
  console.log('Run debugBlogViews.runFullDiagnostic("your-blog-slug") to test');
} 