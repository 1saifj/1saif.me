import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 text-lg mb-8">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}