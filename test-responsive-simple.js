import { chromium } from 'playwright';

async function testResponsive() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 } // iPhone SE size
  });
  const page = await context.newPage();

  console.log('Testing responsive design on mobile viewport (375x667)...');
  
  try {
    // Navigate to the local development server
    await page.goto('http://localhost:5173', { timeout: 10000 });
    
    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasOverflow) {
      console.log('❌ Horizontal overflow detected on mobile viewport');
      
      // Get the overflowing elements
      const overflowElements = await page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('*').forEach(el => {
          if (el.scrollWidth > el.clientWidth) {
            elements.push({
              tag: el.tagName,
              class: el.className,
              text: el.textContent?.substring(0, 50) + '...',
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            });
          }
        });
        return elements;
      });
      
      console.log('Overflowing elements:', overflowElements);
    } else {
      console.log('✅ No horizontal overflow detected on mobile viewport');
    }
    
    // Test different sections
    const sections = ['hero', 'about', 'skills', 'projects', 'blog', 'research', 'contact'];
    
    for (const section of sections) {
      const element = await page.$(`#${section}`);
      if (element) {
        const isVisible = await element.isVisible();
        console.log(`✅ ${section} section is ${isVisible ? 'visible' : 'hidden'}`);
      } else {
        console.log(`⚠️  ${section} section not found`);
      }
    }
    
    console.log('Responsive test completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testResponsive().catch(console.error);