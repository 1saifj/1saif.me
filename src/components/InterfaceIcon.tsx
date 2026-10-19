import React from 'react'

type InterfaceIconName = 'search' | 'sun' | 'moon'

type InterfaceIconProps = {
  name: InterfaceIconName
}

/** Small, hand-drawn interface marks keep the portfolio independent from an icon font. */
export const InterfaceIcon: React.FC<InterfaceIconProps> = ({ name }) => {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.75 }

  const paths: Record<InterfaceIconName, React.ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.4" {...common} /><path d="m16 16 4 4" {...common} /></>,
    sun: <><circle cx="12" cy="12" r="3.2" {...common} /><path d="M12 2.5v2M12 19.5v2M4.58 4.58l1.42 1.42M18 18l1.42 1.42M2.5 12h2M19.5 12h2M4.58 19.42 6 18M18 6l1.42-1.42" {...common} /></>,
    moon: <path d="M20 15.4A8.2 8.2 0 0 1 8.6 4 8.2 8.2 0 1 0 20 15.4Z" {...common} />,
  }

  return <svg data-icon={name} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>
}
