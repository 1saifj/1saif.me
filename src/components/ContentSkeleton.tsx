import React from 'react'

// Holds the body's space while markdown and syntax highlighting render, so nothing jumps.
export const ContentSkeleton: React.FC = () => (
  <div className="site-skeleton" aria-hidden="true">
    <span style={{ width: '42%' }} /><span /><span /><span style={{ width: '88%' }} />
    <span style={{ width: '36%', marginTop: 28 }} /><span /><span style={{ width: '92%' }} /><span style={{ width: '70%' }} />
  </div>
)
