import React, { useState, useEffect } from 'react'
import { X, Search, Star } from 'lucide-react'
import { GoalTemplate, GoalTemplatesService } from '../lib/goalTemplatesService'
import { iconMap } from '../lib/constants'

interface GoalTemplatesBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: GoalTemplate) => void
}

const GoalTemplatesBrowser: React.FC<GoalTemplatesBrowserProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<GoalTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<GoalTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  useEffect(() => {
    filterTemplates()
  }, [templates, selectedCategory, searchQuery])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const [templatesData, categoriesData] = await Promise.all([
        GoalTemplatesService.getPublicTemplates(),
        GoalTemplatesService.getCategories()
      ])
      setTemplates(templatesData)
      setCategories(['All', ...categoriesData])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let result = [...templates]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(t => t.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      )
    }

    setFilteredTemplates(result)
  }

  const handleSelectTemplate = async (template: GoalTemplate) => {
    await GoalTemplatesService.incrementUsageCount(template.id)
    onSelectTemplate(template)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Goal Templates</h2>
              <p className="text-white/90 mt-1">Start with a pre-built goal template</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading templates...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.map(template => {
                const IconComponent = iconMap[template.icon as keyof typeof iconMap] || iconMap.Target
                return (
                  <div
                    key={template.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`p-3 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30`}
                        style={{
                          backgroundColor: `var(--${template.color}-100, #e0e0e0)`
                        }}
                      >
                        <IconComponent className={`w-6 h-6 text-${template.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {template.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {template.category}
                        </span>
                      </div>
                      {template.usage_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Star className="w-3 h-3" />
                          <span>{template.usage_count}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {template.description}
                    </p>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {template.default_tasks.length} default tasks included
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No templates found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoalTemplatesBrowser
