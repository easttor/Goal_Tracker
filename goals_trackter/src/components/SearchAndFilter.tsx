import React, { useState } from 'react'
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react'
import { Priority } from '../types'

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterState) => void
  showFilters?: boolean
}

export interface FilterState {
  priority?: Priority | 'all'
  category?: string
  status?: 'all' | 'active' | 'completed'
  sortBy?: 'date' | 'priority' | 'alphabetical' | 'dueDate'
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  onSearch, 
  onFilterChange,
  showFilters = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    priority: 'all',
    category: '',
    status: 'all',
    sortBy: 'date'
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      priority: 'all',
      category: '',
      status: 'all',
      sortBy: 'date'
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = 
    filters.priority !== 'all' || 
    filters.category !== '' || 
    filters.status !== 'all' ||
    filters.sortBy !== 'date'

  return (
    <div className="mb-4">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search goals and tasks..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      {showFilters && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showFilterPanel || hasActiveFilters
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && showFilters && (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 animate-fade-in">
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handleFilterChange('priority', priority)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filters.priority === priority
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filters.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
            >
              <option value="date">Date Created</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAndFilter
