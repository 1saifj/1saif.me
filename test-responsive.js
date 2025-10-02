import { chromium } from 'playwright';

async function testResponsive() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test different screen sizes
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1024, height: 768, name: 'Tablet Landscape' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 375, height: 667, name: 'Mobile' },
    { width: 320, height: 568, name: 'Small Mobile' }
  ];

  console.log('Testing responsive design issues...\n');

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('http://localhost:5173');
    
    console.log(`=== ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
    
    // Check for common responsive issues
    const issues = [];
    
    // Check if content is overflowing
    const overflowElements = await page.$$eval('*', elements => 
      elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.right > window.innerWidth || rect.bottom > window.innerHeight;
      }).map(el => el.tagName)
    );
    
    if (overflowElements.length > 0) {
      issues.push(`Overflow elements: ${overflowElements.join(', ')}`);
    }
    
    // Check for horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => 
      document.documentElement.scrollWidth > window.innerWidth
    );
    
    if (hasHorizontalScroll) {
      issues.push('Horizontal scrolling detected');
    }
    
    // Check text readability (font size)
    const smallTextElements = await page.$$eval('*', elements => 
      elements.filter(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        return fontSize > 0 && fontSize < 12 && el.textContent.trim().length > 0;
      }).map(el => `${el.tagName}: ${el.textContent.trim().substring(0, 30)}...`)
    );
    
    if (smallTextElements.length > 0) {
      issues.push(`Small text detected: ${smallTextElements.join(', ')}`);
    }
    
    if (issues.length === 0) {
      console.log('✓ No major responsive issues found');
    } else {
      console.log('Issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    console.log('');
  }

  await browser.close();
}

testResponsive().catch(console.error);