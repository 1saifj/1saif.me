import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock IntersectionObserver for components that use it
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: class MockIntersectionObserver {
    root: Element | null = null
    rootMargin: string = ''
    thresholds: ReadonlyArray<number> = []
    
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
})

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: class MockResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
})

// Mock EmailJS
vi.mock('@emailjs/browser', () => ({
  send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
  init: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(global, 'localStorage', {
  writable: true,
  value: localStorageMock
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Setup before all tests
beforeAll(() => {
  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

// Cleanup after all tests
afterAll(() => {
  vi.restoreAllMocks()
}) 