import React from 'react'
import { Grid, List } from 'lucide-react'

type ViewMode = 'grid' | 'list'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center bg-slate-100 rounded-xl p-1 shadow-inner ${className}`}>
      <button
        onClick={() => onChange('grid')}
        className={`p-3 rounded-lg transition-all duration-200 ${
          viewMode === 'grid' 
            ? 'bg-white text-slate-900 shadow-md' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
        aria-label="Grid view"
      >
        <Grid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-3 rounded-lg transition-all duration-200 ${
          viewMode === 'list' 
            ? 'bg-white text-slate-900 shadow-md' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
        aria-label="List view"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  )
}