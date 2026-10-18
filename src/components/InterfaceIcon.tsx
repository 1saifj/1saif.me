import React from 'react'

type InterfaceIconName = 'arrow-right' | 'arrow-up-right' | 'search' | 'menu' | 'close' | 'sun' | 'moon'

type InterfaceIconProps = {
  name: InterfaceIconName
  className?: string
}

/** Small, hand-drawn interface marks keep the portfolio independent from an icon font. */
export const InterfaceIcon: React.FC<InterfaceIconProps> = ({ name, className }) => {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.75 }

  const paths: Record<InterfaceIconName, React.ReactNode> = {
    'arrow-right': <><path d="M4 12h15" {...common} /><path d="m13 6 6 6-6 6" {...common} /></>,
    'arrow-up-right': <><path d="M5 19 19 5" {...common} /><path d="M8 5h11v11" {...common} /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.4" {...common} /><path d="m16 16 4 4" {...common} /></>,
    menu: <><path d="M4 8h16" {...common} /><path d="M4 16h16" {...common} /></>,
    close: <><path d="m6 6 12 12" {...common} /><path d="m18 6-12 12" {...common} /></>,
    sun: <><circle cx="12" cy="12" r="3.2" {...common} /><path d="M12 2.5v2M12 19.5v2M4.58 4.58l1.42 1.42M18 18l1.42 1.42M2.5 12h2M19.5 12h2M4.58 19.42 6 18M18 6l1.42-1.42" {...common} /></>,
    moon: <path d="M20 15.4A8.2 8.2 0 0 1 8.6 4 8.2 8.2 0 1 0 20 15.4Z" {...common} />,
  }

  return <svg className={className} data-icon={name} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>
}
