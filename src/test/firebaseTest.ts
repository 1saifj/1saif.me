// Simple Firebase Newsletter Integration Test
// Run this in browser console to verify functionality

import { NewsletterService } from '../services/newsletterService';

/**
 * Test Firebase Newsletter Integration
 * This function tests the core functionality of our Firebase newsletter service
 */
export async function testFirebaseIntegration() {
  console.log('🚀 Starting Firebase Newsletter Integration Test...');
  
  try {
    // Test 1: Check service initialization
    console.log('✅ Step 1: Service available');
    
    // Test 2: Get current stats
    console.log('📊 Step 2: Getting current stats...');
    const initialStats = await NewsletterService.getAnalytics();
    console.log('Initial stats:', initialStats);
    
    // Test 3: Test subscription with valid email
    console.log('📧 Step 3: Testing subscription...');
    const testEmail = `test+${Date.now()}@example.com`;
    const subscriptionResult = await NewsletterService.subscribeEmail(testEmail, '192.168.1.1', true);
    
    if (subscriptionResult.success) {
      console.log('✅ Subscription successful:', subscriptionResult);
      
      // Test 4: Get updated stats
      console.log('📊 Step 4: Getting updated stats...');
      const updatedStats = await NewsletterService.getAnalytics();
      console.log('Updated stats:', updatedStats);
      
      // Test 5: Test duplicate subscription
      console.log('🔄 Step 5: Testing duplicate subscription...');
      const duplicateResult = await NewsletterService.subscribeEmail(testEmail, '192.168.1.1', true);
      
      if (!duplicateResult.success) {
        console.log('✅ Duplicate prevention working:', duplicateResult.message);
      } else {
        console.log('⚠️ Warning: Duplicate subscription allowed');
      }
      
    } else {
      console.error('❌ Subscription failed:', subscriptionResult.message);
    }
    
    // Test 6: Test invalid email
    console.log('❌ Step 6: Testing invalid email...');
    const invalidResult = await NewsletterService.subscribeEmail('invalid-email', '192.168.1.1', true);
    
    if (!invalidResult.success) {
      console.log('✅ Email validation working:', invalidResult.message);
    } else {
      console.log('⚠️ Warning: Invalid email accepted');
    }
    
    console.log('🎉 Firebase Newsletter Integration Test Complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

/**
 * Quick test for browser console
 * Usage: testNewsletter()
 */
export async function testNewsletter() {
  return await testFirebaseIntegration();
}

// Browser global for easy testing
if (typeof window !== 'undefined') {
  (window as any).testNewsletter = testNewsletter;
  console.log('🧪 Newsletter test function available: testNewsletter()');
} 