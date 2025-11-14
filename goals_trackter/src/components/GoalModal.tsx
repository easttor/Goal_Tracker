import React, { useState, useEffect } from 'react'
import { Goal } from '../types'
import { iconOptions, colorOptions } from '../lib/constants'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void
  initialData?: Goal | null
  onBrowseTemplates?: () => void
  templateData?: {
    title: string
    description: string
    icon: string
    color: string
    category?: string
    tasks?: any[]
  }
}

const GoalModal: React.FC<GoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  onBrowseTemplates,
  templateData 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    icon: 'Target',
    color: 'blue',
    deadline: '',
  })

  useEffect(() => {
    if (templateData) {
      // Pre-fill from template
      setFormData({
        title: templateData.title || '',
        description: templateData.description || '',
        image_url: '',
        icon: templateData.icon || 'Target',
        color: templateData.color || 'blue',
        deadline: '',
      })
    } else if (initialData) {
      // Edit existing goal
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        icon: initialData.icon || 'Target',
        color: initialData.color || 'blue',
        deadline: initialData.deadline || '',
      })
    } else {
      // New empty goal
      setFormData({
        title: '',
        description: '',
        image_url: '',
        icon: 'Target',
        color: 'blue',
        deadline: '',
      })
    }
  }, [initialData, templateData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tasks: initialData?.tasks || []
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {templateData ? 'Create from Template' : initialData ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          
          {/* Show template indicator if using template */}
          {templateData && (
            <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
              Using template: <span className="font-semibold">{templateData.title}</span>. You can edit before saving.
            </div>
          )}
          
          {/* Browse Templates Button - Only show when creating new goal */}
          {!initialData && !templateData && onBrowseTemplates && (
            <button
              type="button"
              onClick={onBrowseTemplates}
              className="w-full mb-4 p-3 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-blue-600 font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Browse Templates
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="fade-in">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                required 
                placeholder="Enter your goal title"
              />
            </div>
            
            <div className="fade-in">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                rows={3}
                placeholder="Describe your goal"
              />
            </div>
            
            <div className="fade-in">
              <label htmlFor="image_url" className="block text-sm font-semibold text-gray-700 mb-2">
                Image URL
              </label>
              <input 
                type="url" 
                id="image_url" 
                name="image_url" 
                value={formData.image_url} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                placeholder="https://example.com/image.png" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="fade-in">
                <label htmlFor="icon" className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon
                </label>
                <select 
                  id="icon" 
                  name="icon" 
                  value={formData.icon} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="fade-in">
                <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline
                </label>
                <input 
                  type="date" 
                  id="deadline" 
                  name="deadline" 
                  value={formData.deadline} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                />
              </div>
            </div>
            
            <div className="fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: opt.value }))}
                    className={`relative h-12 rounded-lg bg-gradient-to-br ${opt.gradient} transition-all duration-200 ${
                      formData.color === opt.value 
                        ? 'ring-4 ring-offset-2 ring-gray-400 scale-105 shadow-lg' 
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                    title={opt.label}
                  >
                    {formData.color === opt.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg checkmark-animate">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t-2 border-gray-100">
              <button 
                type="button" 
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 active:scale-95" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                {initialData ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GoalModal