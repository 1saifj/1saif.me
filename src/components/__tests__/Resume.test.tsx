import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Resume } from '../Resume'

describe('Resume', () => {
  it('renders the LinkedIn-aligned professional profile', () => {
    render(<Resume />)

    expect(screen.getByText('Professional Experience')).toBeInTheDocument()
    expect(screen.getAllByText('Lead Software Engineer').length).toBeGreaterThan(0)
    expect(screen.getByText('Salasto')).toBeInTheDocument()
    expect(screen.getByText('Kufa Grad Tracking Platform')).toBeInTheDocument()
    expect(screen.getByText('Information Bank Smart App')).toBeInTheDocument()
    expect(screen.queryByText('Publications')).not.toBeInTheDocument()
  })
})
