import React from 'react'

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
  className?: string
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  active,
  onClick,
  children,
  count,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      } ${className}`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`ml-2 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
          ({count})
        </span>
      )}
    </button>
  )
}