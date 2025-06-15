module.exports = {
  ci: {
    collect: {
      url: [
        'https://1saif.me/',
        'https://1saif.me/about',
        'https://1saif.me/projects',
        'https://1saif.me/blog',
        'https://1saif.me/contact',
        'https://1saif.me/newsletter'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.95}],
        'categories:pwa': ['warn', {minScore: 0.8}],
        
        // Performance metrics
        'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
        'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
        'total-blocking-time': ['warn', {maxNumericValue: 300}],
        'speed-index': ['warn', {maxNumericValue: 3000}],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'link-text': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        
        // Best Practices
        'uses-https': 'error',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        'no-vulnerable-libraries': 'error',
        
        // PWA
        'service-worker': 'warn',
        'viewport': 'error',
        'content-width': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
} 