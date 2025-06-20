// Comprehensive Firestore debugging utility
import { firestore } from '../firebase';
import { collection, addDoc, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../firebase';

export const firestoreDebug = {
  // Test basic Firestore connection and permissions
  async testFirestoreConnection() {
    console.group('🔥 Firestore Connection Test');
    
    try {
      console.log('1. Firebase config check...');
      console.log('   Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID || '❌ Missing');
      console.log('   API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing');
      
      console.log('2. Firestore instance check...');
      console.log('   Firestore app name:', firestore.app.name);
      console.log('   Firestore project:', firestore.app.options.projectId);
      
      console.log('3. Testing read permissions...');
      const blogViewsCollection = collection(firestore, COLLECTIONS.BLOG_VIEWS);
      const testQuery = query(blogViewsCollection, limit(1));
      const snapshot = await getDocs(testQuery);
      console.log('   ✅ Read access successful, documents found:', snapshot.size);
      
      return true;
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('   Error code:', error.code);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('   Error message:', error.message);
      }
      return false;
    } finally {
      console.groupEnd();
    }
  },

  // Test write permissions by creating a test document
  async testWritePermissions() {
    console.group('✍️ Firestore Write Test');
    
    try {
      console.log('1. Attempting to create test document...');
      
      const testDoc = {
        blogSlug: 'test-write-permission',
        viewedAt: new Date(),
        sessionId: 'debug-session-' + Date.now(),
        metadata: {
          source: 'debug-test',
          userAgent: navigator.userAgent.substring(0, 100),
          timestamp: Date.now()
        }
      };
      
      console.log('2. Test document data:', testDoc);
      
      const blogViewsCollection = collection(firestore, COLLECTIONS.BLOG_VIEWS);
      const docRef = await addDoc(blogViewsCollection, testDoc);
      
      console.log('   ✅ Document created successfully!');
      console.log('   Document ID:', docRef.id);
      console.log('   Document path:', docRef.path);
      
      // Verify the document was created by reading it back
      console.log('3. Verifying document creation...');
      const createdDoc = await getDoc(docRef);
      if (createdDoc.exists()) {
        console.log('   ✅ Document verification successful');
        console.log('   Document data:', createdDoc.data());
      } else {
        console.log('   ❌ Document not found after creation');
      }
      
      return docRef;
    } catch (error) {
      console.error('❌ Write test failed:', error);
      
      // Detailed error analysis
      if (error && typeof error === 'object') {
        if ('code' in error) {
          console.error('   Error code:', error.code);
          
          // Common error code explanations
          switch (error.code) {
            case 'permission-denied':
              console.error('   💡 This means Firestore security rules are blocking the write');
              console.error('   💡 Check your firestore.rules file');
              break;
            case 'unavailable':
              console.error('   💡 Firestore service is temporarily unavailable');
              console.error('   💡 Check your internet connection');
              break;
            case 'invalid-argument':
              console.error('   💡 Invalid data format or missing required fields');
              break;
            default:
              console.error('   💡 Unexpected error code');
          }
        }
        if ('message' in error) {
          console.error('   Error message:', error.message);
        }
      }
      
      return null;
    } finally {
      console.groupEnd();
    }
  },

  // Test the exact blogViewsService.trackView function
  async testBlogViewTracking(blogSlug: string = 'debug-test-blog') {
    console.group('📊 Blog View Service Test');
    
    try {
      console.log(`1. Testing trackView for: ${blogSlug}`);
      
      // Import the service dynamically to avoid circular imports
      const { blogViewsService } = await import('../services/blogViewsService');
      
      console.log('2. Calling blogViewsService.trackView...');
      await blogViewsService.trackView(blogSlug, {
        source: 'debug-service-test'
      });
      
      console.log('   ✅ trackView completed successfully!');
      
      console.log('3. Getting blog stats...');
      const stats = await blogViewsService.getBlogStats(blogSlug);
      console.log('   📈 Blog stats:', stats);
      
      return stats;
    } catch (error) {
      console.error('❌ Blog view service test failed:', error);
      
      if (error && typeof error === 'object') {
        if ('code' in error) {
          console.error('   Error code:', error.code);
        }
        if ('message' in error) {
          console.error('   Error message:', error.message);
        }
      }
      
      return null;
    } finally {
      console.groupEnd();
    }
  },

  // Check current documents in the collection
  async checkExistingDocuments() {
    console.group('📄 Existing Documents Check');
    
    try {
      console.log('1. Checking blogViews collection...');
      const blogViewsCollection = collection(firestore, COLLECTIONS.BLOG_VIEWS);
      const snapshot = await getDocs(query(blogViewsCollection, limit(10)));
      
      console.log(`   Found ${snapshot.size} documents in blogViews collection`);
      
      if (snapshot.size > 0) {
        console.log('   Recent documents:');
        snapshot.forEach((doc) => {
          console.log(`     - ${doc.id}:`, doc.data());
        });
      } else {
        console.log('   📝 No documents found - this might be why views show as 0');
      }
      
      console.log('2. Checking blogViewMetrics collection...');
      const metricsCollection = collection(firestore, COLLECTIONS.BLOG_VIEW_METRICS);
      const metricsSnapshot = await getDocs(query(metricsCollection, limit(10)));
      
      console.log(`   Found ${metricsSnapshot.size} documents in blogViewMetrics collection`);
      
      return {
        blogViews: snapshot.size,
        blogViewMetrics: metricsSnapshot.size
      };
    } catch (error) {
      console.error('❌ Failed to check existing documents:', error);
      return null;
    } finally {
      console.groupEnd();
    }
  },

  // Run complete diagnostic
  async runCompleteDiagnostic(blogSlug?: string) {
    console.log('🚀 Starting Complete Firestore Diagnostic');
    console.log('='.repeat(60));
    
    // 1. Test connection
    const connectionOk = await this.testFirestoreConnection();
    if (!connectionOk) {
      console.log('❌ Stopping diagnostic - connection failed');
      return;
    }
    
    // 2. Check existing documents
    await this.checkExistingDocuments();
    
    // 3. Test write permissions
    const writeResult = await this.testWritePermissions();
    if (!writeResult) {
      console.log('❌ Write permissions failed - this is likely the issue');
      return;
    }
    
    // 4. Test blog view service if slug provided
    if (blogSlug) {
      await this.testBlogViewTracking(blogSlug);
    }
    
    console.log('✅ Diagnostic complete! Check the logs above for any issues.');
  }
};

// Auto-log when module loads
if (typeof window !== 'undefined') {
  console.log('🔧 Firestore Debug Utility Loaded');
  console.log('Run: firestoreDebug.runCompleteDiagnostic("your-blog-slug")');
} 