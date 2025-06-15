import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load and display main sections', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Saif Alqaseh - Software Engineer/)

    // Check main navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible()

    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/Software Engineer/)).toBeVisible()

    // Check main sections are present
    await expect(page.locator('#home')).toBeVisible()
    await expect(page.locator('#about')).toBeVisible()
    await expect(page.locator('#projects')).toBeVisible()
    await expect(page.locator('#blog')).toBeVisible()
    await expect(page.locator('#contact')).toBeVisible()
  })

  test('navigation links should work correctly', async ({ page }) => {
    // Test About navigation
    await page.getByRole('link', { name: 'About' }).click()
    await expect(page.locator('#about')).toBeInViewport()

    // Test Projects navigation
    await page.getByRole('link', { name: 'Projects' }).click()
    await expect(page.locator('#projects')).toBeInViewport()

    // Test Blog navigation
    await page.getByRole('link', { name: 'Blog' }).click()
    await expect(page.locator('#blog')).toBeInViewport()

    // Test Contact navigation
    await page.getByRole('link', { name: 'Contact' }).click()
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('should display projects with correct information', async ({ page }) => {
    await page.locator('#projects').scrollIntoViewIfNeeded()
    
    // Check projects section
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible()
    
    // Check for at least one project card
    const projectCards = page.locator('[data-testid="project-card"]')
    await expect(projectCards.first()).toBeVisible()
    
    // Check project card contains necessary elements
    await expect(projectCards.first().locator('h3')).toBeVisible()
    await expect(projectCards.first().locator('p')).toBeVisible()
  })

  test('should display blog posts', async ({ page }) => {
    await page.locator('#blog').scrollIntoViewIfNeeded()
    
    // Check blog section
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible()
    
    // Check for at least one blog post
    const blogCards = page.locator('[data-testid="blog-card"]')
    await expect(blogCards.first()).toBeVisible()
  })

  test('contact form should be functional', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded()
    
    // Check contact form elements
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/subject/i)).toBeVisible()
    await expect(page.getByLabel(/message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })

  test('newsletter subscription should be present', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded()
    
    // Check newsletter form
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /subscribe/i })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
    
    // Check sections are still visible on mobile
    await expect(page.locator('#home')).toBeVisible()
    await expect(page.locator('#about')).toBeVisible()
    await expect(page.locator('#projects')).toBeVisible()
    await expect(page.locator('#contact')).toBeVisible()
  })

  test('should have proper accessibility features', async ({ page }) => {
    // Check skip link
    await page.keyboard.press('Tab')
    const skipLink = page.getByText(/skip to main content/i)
    await expect(skipLink).toBeFocused()
    
    // Check main content has ID
    await expect(page.locator('#main-content')).toBeVisible()
    
    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should have no JavaScript errors
    expect(errors).toHaveLength(0)
  })

  test('performance: should load quickly', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start
    
    // Should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000)
  })
}) 