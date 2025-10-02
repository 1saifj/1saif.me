import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AlgoliaSearchBox } from '../AlgoliaSearchBox'
import { vi } from 'vitest'

// Mock Algolia client
vi.mock('algoliasearch/lite', () => ({
  default: vi.fn(() => ({
    initIndex: vi.fn(() => ({
      search: vi.fn(() => Promise.resolve({
        hits: [
          {
            objectID: 'test_1',
            title: 'Test Blog Post',
            type: 'blog',
            description: 'This is a test blog post',
            url: '/blog/test-post',
            tags: ['test', 'react'],
            priority: 10
          }
        ]
      }))
    }))
  }))
}))

describe('AlgoliaSearchBox', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input when open', () => {
    render(<AlgoliaSearchBox isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByPlaceholderText('Search projects, articles, skills...')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<AlgoliaSearchBox isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByPlaceholderText('Search projects, articles, skills...')).not.toBeInTheDocument()
  })

  it('shows loading state when searching', async () => {
    render(<AlgoliaSearchBox isOpen={true} onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('Search projects, articles, skills...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('displays search results', async () => {
    render(<AlgoliaSearchBox isOpen={true} onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('Search projects, articles, skills...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    })
  })

  it('shows no results message when no matches found', async () => {
    // Mock empty results
    const mockSearch = vi.fn(() => Promise.resolve({ hits: [] }))
    vi.mock('algoliasearch/lite', () => ({
      default: vi.fn(() => ({
        initIndex: vi.fn(() => ({
          search: mockSearch
        }))
      }))
    }))

    render(<AlgoliaSearchBox isOpen={true} onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('Search projects, articles, skills...')
    fireEvent.change(input, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })
})