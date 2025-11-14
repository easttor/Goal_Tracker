import React from 'react'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, label = 'Add Task' }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group"
      aria-label={label}
    >
      <Plus className="w-6 h-6" />
      <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {label}
      </span>
    </button>
  )
}

export default FloatingActionButton
