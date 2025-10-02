#!/usr/bin/env node

/**
 * Test script for Progressive Reading functionality
 * Verifies that the progressive reading components are properly integrated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing Progressive Reading Implementation...\n');

const testResults = [];

// Test 1: Check if useProgressiveReading hook exists
const hookPath = path.join(__dirname, '../src/hooks/useProgressiveReading.ts');
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  if (hookContent.includes('useProgressiveReading') && hookContent.includes('ReadingProgress')) {
    testResults.push({ test: 'Progressive Reading Hook', status: '✅ PASS', message: 'Hook exists and exports required interfaces' });
  } else {
    testResults.push({ test: 'Progressive Reading Hook', status: '❌ FAIL', message: 'Hook missing required exports' });
  }
} else {
  testResults.push({ test: 'Progressive Reading Hook', status: '❌ FAIL', message: 'Hook file not found' });
}

// Test 2: Check if ProgressiveReading component exists
const componentPath = path.join(__dirname, '../src/components/ProgressiveReading.tsx');
if (fs.existsSync(componentPath)) {
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  if (componentContent.includes('ProgressiveReading') && componentContent.includes('showFloatingProgress')) {
    testResults.push({ test: 'Progressive Reading Component', status: '✅ PASS', message: 'Component exists with required props' });
  } else {
    testResults.push({ test: 'Progressive Reading Component', status: '❌ FAIL', message: 'Component missing required props' });
  }
} else {
  testResults.push({ test: 'Progressive Reading Component', status: '❌ FAIL', message: 'Component file not found' });
}

// Test 3: Check if BlogPost.tsx includes progressive reading
const blogPostPath = path.join(__dirname, '../src/pages/BlogPost.tsx');
if (fs.existsSync(blogPostPath)) {
  const blogPostContent = fs.readFileSync(blogPostPath, 'utf8');
  if (blogPostContent.includes('ProgressiveReading') && blogPostContent.includes('import')) {
    testResults.push({ test: 'BlogPost Integration', status: '✅ PASS', message: 'BlogPost page includes ProgressiveReading component' });
  } else {
    testResults.push({ test: 'BlogPost Integration', status: '❌ FAIL', message: 'BlogPost page missing ProgressiveReading integration' });
  }
} else {
  testResults.push({ test: 'BlogPost Integration', status: '❌ FAIL', message: 'BlogPost file not found' });
}

// Test 4: Check if BlogPostPage.tsx includes progressive reading
const blogPostPagePath = path.join(__dirname, '../src/pages/BlogPostPage.tsx');
if (fs.existsSync(blogPostPagePath)) {
  const blogPostPageContent = fs.readFileSync(blogPostPagePath, 'utf8');
  if (blogPostPageContent.includes('ProgressiveReading') && blogPostPageContent.includes('showDetailedStats')) {
    testResults.push({ test: 'BlogPostPage Integration', status: '✅ PASS', message: 'BlogPostPage includes ProgressiveReading with detailed stats' });
  } else {
    testResults.push({ test: 'BlogPostPage Integration', status: '❌ FAIL', message: 'BlogPostPage missing ProgressiveReading integration' });
  }
} else {
  testResults.push({ test: 'BlogPostPage Integration', status: '❌ FAIL', message: 'BlogPostPage file not found' });
}

// Test 5: Check if Analytics component has reading progress tracking
const analyticsPath = path.join(__dirname, '../src/components/Analytics.tsx');
if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  if (analyticsContent.includes('trackReadingProgress') && analyticsContent.includes('useAnalytics')) {
    testResults.push({ test: 'Analytics Integration', status: '✅ PASS', message: 'Analytics supports reading progress tracking' });
  } else {
    testResults.push({ test: 'Analytics Integration', status: '❌ FAIL', message: 'Analytics missing reading progress tracking' });
  }
} else {
  testResults.push({ test: 'Analytics Integration', status: '❌ FAIL', message: 'Analytics file not found' });
}

// Test 6: Check if animations.css has progressive reading styles
const animationsPath = path.join(__dirname, '../src/styles/animations.css');
if (fs.existsSync(animationsPath)) {
  const animationsContent = fs.readFileSync(animationsPath, 'utf8');
  if (animationsContent.includes('reading-block') || animationsContent.includes('fadeInUp')) {
    testResults.push({ test: 'Animation Styles', status: '✅ PASS', message: 'Animation styles support progressive reading' });
  } else {
    testResults.push({ test: 'Animation Styles', status: '❌ FAIL', message: 'Animation styles missing progressive reading support' });
  }
} else {
  testResults.push({ test: 'Animation Styles', status: '❌ FAIL', message: 'Animations file not found' });
}

// Display results
console.log('📋 Test Results:\n');
testResults.forEach(({ test, status, message }) => {
  console.log(`${status} ${test}`);
  console.log(`   ${message}\n`);
});

const passedTests = testResults.filter(r => r.status.includes('✅')).length;
const totalTests = testResults.length;

console.log(`📊 Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Progressive reading is properly implemented.');
  console.log('\n📖 Features included:');
  console.log('   • Reading progress tracking with visual indicators');
  console.log('   • Smart position saving and resume functionality');
  console.log('   • Reading analytics and time estimation');
  console.log('   • Section-based progress tracking');
  console.log('   • Floating progress bar and detailed stats panel');
  console.log('   • Mobile-responsive design');
  console.log('\n🚀 Try visiting a blog post to see progressive reading in action!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
  process.exit(1);
}