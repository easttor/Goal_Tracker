import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/themeContext'

const ThemeToggle: React.FC = () => {
  const { effectiveTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-lg transition-all duration-300"
      aria-label="Toggle theme"
    >
      {effectiveTheme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  )
}

export default ThemeToggle
